// Offline material/primitive repair. Vertex, normal, UV, image and pivot bytes stay intact.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import sharp from 'sharp';
import {readGlb,accessor,components,sampleImage,sha256} from './lib/truck-gltf.mjs';

const arg=name=>process.argv.find(v=>v.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const input=arg('source')||'public/assets/models/trucks/titan-old/model.glb',output=arg('output')||input;
const {file,json:g,bin}=await readGlb(input);
if(g.asset.extras?.auroraOpacityRepair===1){if(g.materials.some(m=>m.alphaMode!==(['glass','lens'].includes(m.extras?.auroraSurfaceRole)?'BLEND':'OPAQUE')))throw Error('Materiais reparados foram alterados; revisar antes de reexportar.');console.log('GLB já separado por função; nenhuma alteração.');process.exit(0);}
if(sha256(file)!=='1076b3ec66b3e8aca32870d018304c00bebeac93cb6910d935d1a58e923dc013')throw Error('Hash da fonte diferente do modelo auditado; revisar a classificação antes de continuar.');
if(g.materials.length!==1||g.nodes.filter(n=>n.name?.startsWith('wheel_')).length!==6)throw Error('Fonte não corresponde ao Titã auditado; não alterar outro asset.');
const source=structuredClone(g.materials[0]),image=async texture=>{const im=g.images[g.textures[texture].source],v=g.bufferViews[im.bufferView];return sharp(bin.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength)).ensureAlpha().raw().toBuffer({resolveWithObject:true});};
const color=await image(source.pbrMetallicRoughness.baseColorTexture.index),packed=await image(source.pbrMetallicRoughness.metallicRoughnessTexture.index);
const make=(name,role,part='body')=>{
 const m=structuredClone(source);m.name=name;m.alphaMode=['glass','lens'].includes(role)?'BLEND':'OPAQUE';m.extras={auroraSurfaceRole:role,auroraTruckPart:part};
 m.pbrMetallicRoughness.baseColorFactor=[1,1,1,role==='glass'?.55:role==='lens'?.85:1];
 m.pbrMetallicRoughness.metallicFactor=role==='metal'?1:role==='paint'?.3:0;
 m.pbrMetallicRoughness.roughnessFactor=role==='glass'?.28:role==='lens'?.38:role==='paint'?.95:1;
 m.normalTexture.scale=['glass','lens'].includes(role)?.15:.75;return m;
};
g.materials=[make('Titan_Paint','paint'),make('Titan_Metal','metal'),make('Titan_Rubber','rubber'),make('Titan_Glass','glass','cab'),make('Titan_Lens','lens'),make('Titan_CabPaint','paint','cab'),make('Titan_CabMetal','metal','cab'),make('Titan_CabTrim','rubber','cab')];
const report={inputSha256:sha256(file),sourceMaterials:[source],materialRoles:Object.fromEntries(g.materials.map(m=>[m.name,m.extras.auroraSurfaceRole])),cockpitHiddenMaterials:g.materials.filter(m=>m.extras.auroraTruckPart==='cab').map(m=>m.name),meshes:[],preserved:{vertices:true,normals:true,uvs:true,embeddedImages:true,nodeTransforms:true,sixWheelPivots:true},notes:'Only index ordering and glTF material/primitive declarations change. No recolouring, alpha texture edits, rescaling or geometry deletion.'};
for(const [mi,mesh]of g.meshes.entries()){
 if(mesh.primitives.length!==1)throw Error('Primitivas da fonte mudaram');
 const p=mesh.primitives[0],pos=accessor(g,bin,p.attributes.POSITION),uv=accessor(g,bin,p.attributes.TEXCOORD_0),ix=accessor(g,bin,p.indices).flat(),node=g.nodes.find(n=>n.mesh===mi),wheel=node.name.startsWith('wheel_'),groups=new Map();
 for(const faces of components(pos,ix)){
  let avgAlpha=0,metal=0,rough=0,brightness=0;const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(const start of faces){const ids=ix.slice(start,start+3),t=[0,1].map(d=>ids.reduce((s,j)=>s+uv[j][d],0)/3),c=sampleImage(color,t),r=sampleImage(packed,t);avgAlpha+=c[3];metal+=r[2];rough+=r[1];brightness+=(c[0]+c[1]+c[2])/3;for(const j of ids)for(let d=0;d<3;d++){min[d]=Math.min(min[d],pos[j][d]);max[d]=Math.max(max[d],pos[j][d]);}}
  const n=faces.length;avgAlpha/=n;metal/=n;rough/=n;brightness/=n;
  const window=!wheel&&min[1]>.15&&max[1]<1.3&&max[2]<-1.3&&avgAlpha<230;
  const tire=wheel&&Math.max(...[min[1],max[1],min[2],max[2]].map(Math.abs))>.48&&metal<16;
  for(const start of faces){const ids=ix.slice(start,start+3),center=[0,1,2].map(d=>ids.reduce((s,j)=>s+pos[j][d],0)/3),t=[0,1].map(d=>ids.reduce((s,j)=>s+uv[j][d],0)/3),alpha=sampleImage(color,t)[3];
   const windshield=!wheel&&center[1]>.25&&center[2]<-2.9&&alpha<230;
   const lens=!wheel&&center[1]<.2&&center[2]<-3.3&&alpha<230;
   const cab=!wheel&&center[2]<-1.25&&center[1]>-.14;
   const rubber=tire||!wheel&&metal<16&&rough>160&&brightness<85;
   const mat=window||windshield?3:lens?4:wheel?(tire?2:1):metal>128?(cab?6:1):rubber?(cab?7:2):(cab?5:0);
   if(!groups.has(mat))groups.set(mat,[]);groups.get(mat).push(...ids);
  }
 }
 const old=g.accessors[p.indices],view=g.bufferViews[old.bufferView],bytes=old.componentType===5123?2:4,at=(view.byteOffset||0)+(old.byteOffset||0);let cursor=0;
 mesh.primitives=[];const counts={};for(const [material,ids]of [...groups].sort((a,b)=>a[0]-b[0])){
  ids.forEach((id,i)=>bin[bytes===2?'writeUInt16LE':'writeUInt32LE'](id,at+(cursor+i)*bytes));
  const index=g.accessors.length;g.accessors.push({...old,byteOffset:(old.byteOffset||0)+cursor*bytes,count:ids.length,min:[Math.min(...ids)],max:[Math.max(...ids)]});mesh.primitives.push({...p,indices:index,material});cursor+=ids.length;counts[g.materials[material].name]=ids.length/3;
 }
 if(cursor!==ix.length)throw Error('Triângulos perdidos');report.meshes.push({node:node.name,triangles:ix.length/3,materials:counts});
}
g.asset.extras={...g.asset.extras,auroraOpacityRepair:1};
const jsonData=Buffer.from(JSON.stringify(g)),jsonBytes=Buffer.alloc(Math.ceil(jsonData.length/4)*4,32);jsonData.copy(jsonBytes);const header=Buffer.alloc(20);header.write('glTF');header.writeUInt32LE(2,4);header.writeUInt32LE(28+jsonBytes.length+bin.length,8);header.writeUInt32LE(jsonBytes.length,12);header.writeUInt32LE(0x4e4f534a,16);const chunk=Buffer.alloc(8);chunk.writeUInt32LE(bin.length,0);chunk.writeUInt32LE(0x004e4942,4);const fixed=Buffer.concat([header,jsonBytes,chunk,bin]);await writeFile(output,fixed);
report.outputSha256=sha256(fixed);report.triangles=report.meshes.reduce((s,m)=>s+m.triangles,0);await mkdir('evidence/truck-opacity',{recursive:true});await writeFile('evidence/truck-opacity/glb-repair.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));

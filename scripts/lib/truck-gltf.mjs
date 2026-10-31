import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
export const sha256=b=>createHash('sha256').update(b).digest('hex');
export async function readGlb(path){const file=await readFile(path),size=file.readUInt32LE(12);return {file,json:JSON.parse(file.toString('utf8',20,20+size)),bin:file.subarray(28+size)};}
export function accessor(g,bin,index){
 const a=g.accessors[index],v=g.bufferViews[a.bufferView],counts={SCALAR:1,VEC2:2,VEC3:3,VEC4:4},methods={5126:['readFloatLE',4],5125:['readUInt32LE',4],5123:['readUInt16LE',2],5121:['readUInt8',1]},[method,bytes]=methods[a.componentType],n=counts[a.type],at=(v.byteOffset||0)+(a.byteOffset||0),stride=v.byteStride||n*bytes;
 return Array.from({length:a.count},(_,i)=>Array.from({length:n},(_,j)=>bin[method](at+i*stride+j*bytes)));
}
export function components(positions,indices){
 const parents=positions.map((_,i)=>i),keys=new Map(),find=i=>{while(parents[i]!==i){parents[i]=parents[parents[i]];i=parents[i];}return i;},join=(a,b)=>parents[find(a)]=find(b);
 positions.forEach((p,i)=>{const k=p.map(v=>v.toFixed(5)).join(',');if(keys.has(k))join(i,keys.get(k));else keys.set(k,i);});
 for(let i=0;i<indices.length;i+=3){join(indices[i],indices[i+1]);join(indices[i],indices[i+2]);}
 const out=new Map();for(let i=0;i<indices.length;i+=3){const id=find(indices[i]);if(!out.has(id))out.set(id,[]);out.get(id).push(i);}return [...out.values()].sort((a,b)=>a[0]-b[0]);
}
export function sampleImage(image,uv){const x=Math.min(image.info.width-1,Math.max(0,Math.floor(uv[0]*image.info.width))),y=Math.min(image.info.height-1,Math.max(0,Math.floor(uv[1]*image.info.height))),i=(y*image.info.width+x)*image.info.channels;return Array.from(image.data.subarray(i,i+image.info.channels));}
export function geometryFingerprint(g,bin){
 const hash=value=>sha256(Buffer.from(JSON.stringify(value)));
 return {nodes:hash(g.nodes),images:g.images.map(i=>{const v=g.bufferViews[i.bufferView];return sha256(bin.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength));}),meshes:g.meshes.map(mesh=>{
  const attrs={};for(const p of mesh.primitives)for(const [name,index]of Object.entries(p.attributes)){if(!attrs[name])attrs[name]=new Set();attrs[name].add(hash(accessor(g,bin,index)));}
  const triangles=[];for(const p of mesh.primitives){const ids=accessor(g,bin,p.indices).flat();for(let i=0;i<ids.length;i+=3)triangles.push(ids.slice(i,i+3).join(','));}
  return {attributes:Object.fromEntries(Object.entries(attrs).map(([k,v])=>[k,[...v].sort()])),triangles:triangles.length,winding:hash(triangles.sort())};
 })};
}

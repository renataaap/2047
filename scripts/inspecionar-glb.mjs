#!/usr/bin/env node
import fs from 'node:fs/promises';
const file=process.argv.slice(2).find(a=>!a.startsWith('--'));
if(!file)throw new Error('Uso: node scripts/inspecionar-glb.mjs caminho/modelo.glb');
const data=await fs.readFile(file);let json;
if(data.toString('ascii',0,4)==='glTF'){
 if(data.readUInt32LE(4)!==2||data.readUInt32LE(8)!==data.length||data.readUInt32LE(16)!==0x4e4f534a)throw new Error('GLB 2.0 inválido/truncado');
 const length=data.readUInt32LE(12);json=JSON.parse(data.toString('utf8',20,20+length));
}else json=JSON.parse(data.toString('utf8'));
let triangles=0;for(const mesh of json.meshes||[])for(const p of mesh.primitives||[]){if((p.mode??4)!==4)continue;triangles+=(json.accessors[p.indices??p.attributes.POSITION]?.count||0)/3;}
console.log(JSON.stringify({file,bytes:data.length,generator:json.asset?.generator,triangles,meshes:json.meshes?.length||0,materials:json.materials?.length||0,skins:(json.skins||[]).map(s=>({name:s.name,joints:s.joints.length})),animations:(json.animations||[]).map(a=>({name:a.name,channels:a.channels.length})),nodes:(json.nodes||[]).map((n,i)=>({index:i,name:n.name,mesh:n.mesh,skin:n.skin,translation:n.translation,scale:n.scale})),externalDependencies:[...(json.buffers||[]),...(json.images||[])].map(o=>o.uri).filter(Boolean),extensions:json.extensionsUsed||[]},null,2));

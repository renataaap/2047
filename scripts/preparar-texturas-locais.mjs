#!/usr/bin/env node
// Validate the official snapshot's existing maps; never downloads or replaces originals.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {validateImage,atomicJSON} from './lib/polyhaven.mjs';
import {prepareMaterial} from './lib/prepare-textures.mjs';
const target=path.resolve('public/assets/polyhaven');
const manifest=JSON.parse(await fs.readFile(path.join(target,'manifest.json'),'utf8'));
const report={date:new Date().toISOString(),materials:[],failures:[]};
for(const [id,original]of Object.entries(manifest.assets)){
 try{
  const sourceMaps={};
  for(const [kind,map]of Object.entries(original.sourceMaps||original.maps)){
   const file=map.file||map.url.replace('/assets/polyhaven/','');
   if(path.resolve(target,file).startsWith(target+path.sep)===false)throw new Error('Caminho inválido');
   const bytes=await fs.readFile(path.join(target,file));const checks=validateImage(bytes);const info=await sharp(bytes).metadata();
   sourceMaps[kind]={...map,file,...checks,depth:info.depth};
  }
  let armCheck=null;
  if(sourceMaps.arm&&sourceMaps.roughness&&sourceMaps.ao){
   const pixels=async m=>sharp(path.join(target,m.file)).resize(128,128).removeAlpha().raw().toBuffer({resolveWithObject:true});
   const a=await pixels(sourceMaps.arm),r=await pixels(sourceMaps.roughness),o=await pixels(sourceMaps.ao);let roughError=0,aoError=0;
   for(let i=0;i<128*128;i++){roughError+=Math.abs(a.data[i*a.info.channels+1]-r.data[i*r.info.channels]);aoError+=Math.abs(a.data[i*a.info.channels]-o.data[i*o.info.channels]);}
   armCheck={roughnessMeanError:roughError/(128*128*255),aoMeanError:aoError/(128*128*255)};
   if(armCheck.roughnessMeanError>.025||armCheck.aoMeanError>.025){
    // Keep upstream originals; repack from the explicit AO/roughness maps.
    const size=sourceMaps.arm.width;
    const channel=async(m,c)=>sharp(path.join(target,m.file)).resize(size,size).extractChannel(c).raw().toBuffer();
    const ao=await channel(sourceMaps.ao,0),rough=await channel(sourceMaps.roughness,0),metal=await channel(sourceMaps.arm,2);
    const rgb=Buffer.alloc(size*size*3);for(let i=0;i<size*size;i++){rgb[i*3]=ao[i];rgb[i*3+1]=rough[i];rgb[i*3+2]=metal[i];}
    const bytes=await sharp(rgb,{raw:{width:size,height:size,channels:3}}).png().toBuffer();
    const file=`${id}/arm_compatible.png`;await fs.writeFile(path.join(target,file),bytes);
    sourceMaps.compatibleArm={file,url:`/assets/polyhaven/${file}`,...validateImage(bytes),channels:{r:'ao',g:'roughness',b:'metalness'},derived:true};armCheck.repacked=true;
   }
  }
  const maps=Object.fromEntries(Object.entries(sourceMaps).filter(([kind])=>kind!=='compatibleArm'&&(!sourceMaps.arm||!['roughness','ao','metalness'].includes(kind))));
  if(sourceMaps.compatibleArm)maps.arm=sourceMaps.compatibleArm;
  const entry={...original,id,source:original.source||`https://polyhaven.com/a/${id}`,license:'CC0-1.0',provenance:'Files inherited from official repository a8a8802; upstream checksums unavailable in this network',sourceMaps,maps,armCheck};
  await prepareMaterial(entry,target);manifest.assets[id]=entry;await atomicJSON(path.join(target,id,'material.json'),entry);
  report.materials.push({id,maps:Object.keys(maps),armCheck,sourceBytes:Object.values(sourceMaps).reduce((n,m)=>n+m.bytes,0)});
 }catch(e){report.failures.push({id,error:e.message});}
}
manifest.schemaVersion=1;manifest.attribution='Powered by Poly Haven';manifest.preparedAt=report.date;
await atomicJSON(path.join(target,'manifest.json'),manifest);
await atomicJSON(path.resolve('evidence/tutorial-assets/texture-validation.json'),report);
console.log(JSON.stringify(report,null,2));if(report.failures.length)process.exitCode=1;

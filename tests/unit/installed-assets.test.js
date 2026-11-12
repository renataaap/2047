import {it,expect} from 'vitest';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import {validMaterial} from '../../src/game/render/PBRLibrary.js';
import {validateImage} from '../../scripts/lib/polyhaven.mjs';
it('oito materiais no disco têm payload, hash e perfis locais válidos',async()=>{
 const manifest=JSON.parse(await fs.readFile('public/assets/polyhaven/manifest.json','utf8'));expect(Object.keys(manifest.assets)).toHaveLength(8);
 for(const e of Object.values(manifest.assets)){
  expect(validMaterial(e)).toBeTruthy();
  for(const m of Object.values(e.maps)){
   const bytes=await fs.readFile('public'+m.url);expect(validateImage(bytes).sha256).toBe(m.sha256);
   for(const [quality,max]of [['baixo',512],['medio',1024],['alto',2048]]){const p=m.variants[quality];expect(p.width).toBeLessThanOrEqual(max);expect(validateImage(await fs.readFile('public'+p.url)).sha256).toBe(p.sha256);}
  }
 }
},20000);
it('ARM reempacotado conserva AO em R e roughness em G',async()=>{
 const manifest=JSON.parse(await fs.readFile('public/assets/polyhaven/manifest.json','utf8'));
 for(const id of ['gravel_road','corrugated_iron']){
  const e=manifest.assets[id];expect(e.armCheck.repacked).toBe(true);
  const pix=async f=>sharp('public'+f.url).resize(64,64).raw().toBuffer({resolveWithObject:true});const arm=await pix(e.maps.arm),ao=await pix(e.sourceMaps.ao),rough=await pix(e.sourceMaps.roughness);
  let error=0;for(let i=0;i<64*64;i++){error+=Math.abs(arm.data[i*arm.info.channels]-ao.data[i*ao.info.channels]);error+=Math.abs(arm.data[i*arm.info.channels+1]-rough.data[i*rough.info.channels]);}expect(error/(64*64*2*255)).toBeLessThan(.015);
 }
},60000); // Hashes ~800 MB of local PBR maps; 20 s timed out under load (TD-007).
it('GLB do Titã contém seis rodas reais e crédito acompanha cada modelo',async()=>{
 const manifest=JSON.parse(await fs.readFile('public/assets/models/manifest.json','utf8'));const t=manifest.trucks.initial;expect(t.wheels).toHaveLength(6);const data=await fs.readFile('public'+t.url);expect(data.toString('utf8',0,4)).toBe('glTF');expect(data.readUInt32LE(8)).toBe(data.length);const gltf=JSON.parse(data.toString('utf8',20,20+data.readUInt32LE(12)));
 for(const w of t.wheels)expect(gltf.nodes.some(n=>n.name===w.node&&n.mesh!==undefined)).toBe(true);
 for(const e of [t,...Object.values(manifest.environments),...Object.values(manifest.candidates)]){const directory=('public'+e.url).replace(/\/[^/]+$/,'');const credit=await fs.readFile(directory+'/LICENSE.txt','utf8');expect(credit).toContain(e.license==='CC-BY-4.0'?'CC BY 4.0':'CC-BY-NC');}
});
it('personagem anatômico CC0 tem rig, sete clips e apenas recursos locais',async()=>{
 const manifest=JSON.parse(await fs.readFile('public/assets/models/manifest.json','utf8')),e=manifest.characters.worker;expect(e.rightsCleared).toBe(true);expect(e.license).toBe('CC0-1.0');expect(e.inPlace).toBe(true);const b=await fs.readFile('public'+e.url),g=JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)));expect(g.skins.length).toBeGreaterThan(0);for(const name of ['Idle','Walk','Run','Enter','Exit','Interact','Repair'])expect(g.animations.some(a=>a.name===name)).toBe(true);expect(g.buffers.every(buffer=>!buffer.uri)).toBe(true);expect(g.images.every(image=>image.bufferView!==undefined)).toBe(true);expect(await fs.readFile('assets-source/characters/makehuman-base.obj','utf8')).toContain('explicitly released as CC0');expect(e.artStatus).toContain('interim');
});

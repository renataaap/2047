import { describe,it,expect } from 'vitest';
import { mkdtemp,readFile,rm,writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { chooseMap,selectMaps,validateImage,validateInstalled,installAsset,digest } from '../../scripts/lib/polyhaven.mjs';
import { prepareMaterial } from '../../scripts/lib/prepare-textures.mjs';
import { localAssetURL } from '../../src/game/assets/AssetManager.js';
import { validMaterial } from '../../src/game/render/PBRLibrary.js';
import { inspectTruckRig } from '../../src/game/vehicle/TruckVisual.js';
import * as THREE from 'three';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

describe('preparação de arquivos reais e seleção PBR',()=>{
 it('seleciona somente URLs retornadas e nunca promove 1K para 8K ou normal DirectX',()=>{
  const file={url:'https://example.org/from-fixture.jpg'};
  const tree={diff:{'2k':{jpg:file},'8k':{jpg:{url:'https://example.org/8k.jpg'}}},nor_dx:{'2k':{jpg:file}},rough:{'2k':{jpg:file}}};
  expect(chooseMap(tree,'color','2k').url).toBe(file.url);expect(chooseMap(tree,'color','1k')).toBeNull();expect(chooseMap(tree,'normal','2k')).toBeNull();expect(()=>selectMaps(tree,'2k')).toThrow(/OpenGL/);
 });
 it('ARM é R=AO, G=roughness, B=metalness e evita mapas duplicados',()=>{
  const entry={'2k':{png:{url:'https://example.org/map.png'}}};
  expect(Object.keys(selectMaps({diff:entry,nor_gl:entry,arm:entry,rough:entry,ao:entry},'2k'))).toEqual(['color','normal','arm']);
  expect(validMaterial({status:'installed',normalConvention:'OpenGL',maps:{color:{},normal:{},arm:{}},armChannels:{r:'metalness',g:'ao',b:'roughness'}})).toBe(false);
 });
 it('rejeita HTML, imagens truncadas, checksum errado e tamanho divergente',async()=>{
  const png=await sharp({create:{width:8,height:8,channels:3,background:'#fefefe'}}).png().toBuffer();
  expect(validateImage(png).width).toBe(8);expect(()=>validateImage(Buffer.from('<html>Forbidden</html>'))).toThrow();expect(()=>validateImage(png.subarray(0,-8))).toThrow();expect(()=>validateImage(png,{md5:'0'.repeat(32)})).toThrow(/MD5/);expect(()=>validateImage(png,{size:1})).toThrow(/Tamanho/);
 });
 it('instala via /info e /files, verifica o payload, mantém cache válido e corrige arquivo corrompido',async()=>{
  const target=await mkdtemp(path.join(os.tmpdir(),'aurora-pbr-'));
  try{
   const png=await sharp({create:{width:16,height:16,channels:3,background:'#809080'}}).png().toBuffer(),calls=[];
   const file={url:'https://example.org/api-returned.png',md5:digest(png,'md5'),size:png.length},entry={'2k':{png:file}};
   const fetcher=async url=>{calls.push(url);return url.includes('/info/')?Response.json({type:1,name:'TEST ONLY',dimensions:[3000,2000]}):url.includes('/files/')?Response.json({diff:entry,nor_gl:entry,arm:entry}):new Response(png);};
   const installed=await installAsset('dirt',{target,fetcher});expect(installed.tileMeters).toEqual([3,2]);expect(await validateInstalled(installed,target)).toBe(true);expect(calls.slice(0,2)).toEqual(['https://api.polyhaven.com/info/dirt','https://api.polyhaven.com/files/dirt']);expect(calls.filter(x=>x===file.url)).toHaveLength(3);
   calls.length=0;await installAsset('dirt',{target,fetcher});expect(calls).toHaveLength(2);
   await writeFile(path.join(target,installed.maps.normal.file),Buffer.from('broken'));expect(await validateInstalled(installed,target)).toBe(false);
   calls.length=0;const repaired=await installAsset('dirt',{target,fetcher});expect(await validateInstalled(repaired,target)).toBe(true);expect(calls.filter(x=>x===file.url)).toHaveLength(1);
  }finally{await rm(target,{recursive:true,force:true});}
 });
 it('não declara material instalado se um mapa falhar durante o download',async()=>{
  const target=await mkdtemp(path.join(os.tmpdir(),'aurora-partial-'));
  try{const file={url:'https://example.org/missing.png'},map={'2k':{png:file}};const fetcher=async url=>url.includes('/info/')?Response.json({type:1}):url.includes('/files/')?Response.json({diff:map,nor_gl:map,rough:map}):new Response('missing',{status:404});await expect(installAsset('dirt',{target,fetcher})).rejects.toThrow(/404/);await expect(readFile(path.join(target,'manifest.json'))).rejects.toThrow();}finally{await rm(target,{recursive:true,force:true});}
 });
 it('gera limites de resolução por perfil e preserva os canais numéricos ARM',async()=>{
  const target=await mkdtemp(path.join(os.tmpdir(),'aurora-variants-'));
  try{
   const png=await sharp({create:{width:2048,height:2048,channels:3,background:{r:51,g:173,b:8}}}).png().toBuffer();await writeFile(path.join(target,'original.png'),png);
   const entry={id:'test_fixture',maps:{color:{file:'original.png',...validateImage(png)},arm:{file:'original.png',...validateImage(png)}}};await fsMkdir(path.join(target,entry.id));await prepareMaterial(entry,target);
   expect(entry.maps.color.variants.baixo.width).toBe(512);expect(entry.maps.color.variants.medio.width).toBe(1024);expect(entry.maps.color.variants.alto.width).toBe(2048);expect(entry.maps.arm.variants.alto.width).toBe(1024);
   const {data}=await sharp(await readFile(path.join(target,entry.maps.arm.variants.baixo.file))).raw().toBuffer({resolveWithObject:true});expect([...data.subarray(0,3)]).toEqual([51,173,8]);
  }finally{await rm(target,{recursive:true,force:true});}
 });
 it('importa um pacote offline 4K, reduz para 2K e preserva os originais',async()=>{
  const directory=await mkdtemp(path.join(os.tmpdir(),'aurora-import-'));
  try{
   const input=path.join(directory,'source'),target=path.join(directory,'installed');await fsMkdir(path.join(input,'dirt'));
   const png=await sharp({create:{width:4096,height:4096,channels:3,background:'#808080'}}).png().toBuffer();
   for(const kind of ['diff','nor_gl','arm'])await writeFile(path.join(input,'dirt',`dirt_${kind}_4k.png`),png);
   await promisify(execFile)(process.execPath,['scripts/importar-polyhaven.mjs',`--from=${input}`,`--dest=${target}`]);
   const manifest=JSON.parse(await readFile(path.join(target,'manifest.json'),'utf8'));expect(manifest.assets.dirt.maps.color.width).toBe(2048);expect(manifest.assets.dirt.maps.normal.sourceDimensions).toEqual([4096,4096]);expect(await validateInstalled(manifest.assets.dirt,target)).toBe(true);expect(digest(await readFile(path.join(input,'dirt','dirt_diff_4k.png')))).toBe(digest(png));
  }finally{await rm(directory,{recursive:true,force:true});}
 },20000);
});
async function fsMkdir(dir){const {mkdir}=await import('node:fs/promises');await mkdir(dir,{recursive:true});}

describe('contratos de modelos e recursos locais',()=>{
 it('não permite uma URL externa ou fuga de diretório no carregador em jogo',()=>{expect(localAssetURL('/assets/models/truck.glb')).toBe('/assets/models/truck.glb');for(const bad of ['https://example.org/a.glb','//example.org/a.glb','/assets/../x','/assets/%2e%2e/x','/assets/a\\b'])expect(()=>localAssetURL(bad)).toThrow();});
 it('recusa rig incompatível, pivôs errados ou roda duplicada antes de trocar o visual',()=>{
  const root=new THREE.Group(),body=new THREE.Mesh(new THREE.BoxGeometry(2,2,8));root.add(body);
  const points=[];for(const z of [-2.5,1.45,2.9])for(const x of [-1.2,1.2]){const point={x,y:-.1,z};points.push(point);const node=new THREE.Object3D();node.name=`w${points.length-1}`;node.position.set(x,-.62,z);root.add(node);}root.updateMatrixWorld(true);
  const def={wheels:points.map((_,i)=>({node:`w${i}`,spinAxis:'x',spinSign:-1}))};expect(inspectTruckRig(root,def,points).wheels).toHaveLength(6);expect(()=>inspectTruckRig(root,{wheels:def.wheels.slice(0,4)},points)).toThrow(/6 rodas/);
  const wrong=structuredClone(def);wrong.wheels[1].node='w0';expect(()=>inspectTruckRig(root,wrong,points)).toThrow();root.getObjectByName('w0').position.x+=2;root.updateMatrixWorld(true);expect(()=>inspectTruckRig(root,def,points)).toThrow(/Pivô/);
 });
});

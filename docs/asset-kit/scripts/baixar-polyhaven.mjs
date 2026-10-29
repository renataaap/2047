#!/usr/bin/env node
// Baixa os arquivos verdadeiros de texturas do Poly Haven usando os URLs oficiais da API.
// Uso: node scripts/baixar-polyhaven.mjs --resolution=1k --group=estradas
//      node scripts/baixar-polyhaven.mjs --resolution=2k --all
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await fs.readFile(path.join(root, 'materiais_2047.json'), 'utf8'));
const args = process.argv.slice(2);
const arg = (key, fallback) => args.find(a=>a.startsWith(`--${key}=`))?.split('=').slice(1).join('=') ?? fallback;
const resolution = arg('resolution', '1k').toLowerCase();
const group = arg('group', '');
const installAll = args.includes('--all');
const target = path.resolve(arg('dest', path.join(root, 'assets', 'polyhaven')));
const ids = installAll
  ? [...manifest.existing_polyhaven, ...manifest.missing.map(a=>a.id)]
  : manifest.missing.filter(a=>!group || a.group===group).map(a=>a.id);
const maps = {
  color:['Diffuse', 'diffuse', 'diff', 'BaseColor', 'basecolor', 'col'],
  normal:['nor_gl', 'Normal_GL', 'normal_gl', 'Normal', 'normal'],
  roughness:['Rough', 'rough', 'roughness'],
  arm:['arm', 'ARM', 'orm', 'ORM'],
  ao:['AO', 'ao'],
  displacement:['Displacement','disp', 'height'],
};
const requestJson=async url=>{
 const r=await fetch(url,{headers:{'User-Agent':'2047-rede-aurora-asset-prep/1.0'}});
 if(!r.ok) throw new Error(`API HTTP ${r.status}: ${url}`);
 return r.json();
};
function pickMap(api, aliases) {
  for(const name of aliases) {
    const found=Object.keys(api).find(k=>k.toLowerCase()===name.toLowerCase());
    if(found && api[found]) return api[found];
  }
  return null;
}
function choose(entry){
  if(!entry || typeof entry!=='object') return null;
  const choices=[resolution, '2k', '1k', '4k'];
  for (const size of [...new Set(choices)]) {
    const folder = Object.keys(entry).find(k=>k.toLowerCase()===size);
    if (!folder) continue;
    const options=entry[folder];
    for(const ext of ['jpg','jpeg','png','webp']) {
      const file=options?.[ext];
      if (typeof file?.url === 'string') return {url:file.url,extension:ext,resolution:size};
    }
  }
  return null;
}
const downloaded=[]; const failures=[];
for(const id of ids){
  console.log(`\n[${id}] consultando Poly Haven...`);
  try {
    const tree=await requestJson(`https://api.polyhaven.com/files/${encodeURIComponent(id)}`);
    const dir=path.join(target,id); await fs.mkdir(dir,{recursive:true});
    const found={};
    for (const [kind,aliases] of Object.entries(maps)) {
      // ARM já contém AO e Rough; manter mapas separados também quando disponíveis.
      const entry=pickMap(tree, aliases); const info=choose(entry);
      if(!info) { console.log(`  aviso: ${kind} indisponível`); continue; }
      const filepath=path.join(dir,`${kind}.${info.extension}`);
      const stat=await fs.stat(filepath).catch(()=>null);
      if(stat?.size>0) {
        console.log(`  mantido: ${kind}`);
        found[kind]={path:filepath,resolution:info.resolution,downloaded:false}; continue;
      }
      const response=await fetch(info.url);
      if(!response.ok) throw new Error(`download ${kind} HTTP ${response.status}`);
      const data=Buffer.from(await response.arrayBuffer());
      if(!data.length) throw new Error(`arquivo vazio: ${kind}`);
      await fs.writeFile(filepath,data);
      found[kind]={path:filepath,resolution:info.resolution,downloaded:true};
      console.log(`  + ${kind} (${(data.length/1024/1024).toFixed(2)} MB)`);
    }
    if(!found.color) throw new Error('Sem textura de cor; asset incompleto');
    downloaded.push({id,maps:found});
  } catch(e){console.error(`  ERRO: ${e.message}`); failures.push({id,error:e.message});}
}
await fs.writeFile(path.join(target,'instalacao.json'),JSON.stringify({resolution,downloaded,failures},null,2));
console.log(`\nConcluído: ${downloaded.length} materiais, ${failures.length} falhas.`);
if(failures.length) process.exitCode=1;

#!/usr/bin/env node
// Importa imagens já baixadas pelo usuário. Não executa scripts do pacote recebido.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { atomicJSON, validateImage } from './lib/polyhaven.mjs';
import { prepareMaterial } from './lib/prepare-textures.mjs';
import sharp from 'sharp';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2), arg = (name, fallback) => args.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const from = arg('from', '');
if (!from) throw new Error('Uso: node scripts/importar-polyhaven.mjs --from=PASTA_EXTRAIDA');
const input = path.resolve(from), target = path.resolve(arg('dest', path.join(root, 'public/assets/polyhaven')));
const budget=parseInt(arg('resolution','2k'))*1024;
if(![1024,2048,4096].includes(budget))throw new Error('Resolução permitida: 1k, 2k ou 4k');
if (target === input || target.startsWith(input + path.sep)) throw new Error('A origem deve ficar fora da pasta de destino');
const catalog = JSON.parse(await fs.readFile(path.join(root, 'materiais_2047.json'), 'utf8'));
const ids = [...catalog.existing_polyhaven, ...catalog.missing.map(a => a.id)].sort((a,b) => b.length - a.length);
const found = {}, failures = [], files = [];
async function scan(dir, depth = 0) {
  if (depth > 6) return;
  for (const f of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) await scan(full, depth + 1);
    else if (f.isFile() && /\.(png|jpe?g)$/i.test(f.name)) files.push(full);
    if (files.length > 5000) throw new Error('Limite de 5000 imagens excedido');
  }
}
await scan(input);
const aliases = { color: /(?:^|_)(diff|diffuse|basecolor|base_color|color|albedo)(?:_|\.|$)/, normal: /(?:^|_)(nor_gl|normal_gl|normal_opengl)(?:_|\.|$)/, arm: /(?:^|_)(arm|orm)(?:_|\.|$)/, roughness: /(?:^|_)(rough|roughness)(?:_|\.|$)/, metalness: /(?:^|_)(metal|metallic|metalness)(?:_|\.|$)/, ao: /(?:^|_)(ao|ambient_occlusion)(?:_|\.|$)/, displacement: /(?:^|_)(disp|displacement|height)(?:_|\.|$)/ };
for (const file of files) {
  const name = path.basename(file).toLowerCase(), relative = path.relative(input, file).split(path.sep);
  const id = ids.find(id => relative.slice(0,-1).includes(id) || name.startsWith(id + '_'));
  if (!id) continue;
  const kind = Object.keys(aliases).find(kind => aliases[kind].test(name));
  if (!kind) continue;
  try {
    let data = await fs.readFile(file), checks = validateImage(data);
    const sourceSha256=checks.sha256,sourceDimensions=[checks.width,checks.height];
    if(Math.max(checks.width,checks.height)>budget){data=await sharp(data,{failOn:'error'}).resize({width:budget,height:budget,fit:'inside',withoutEnlargement:true}).png({compressionLevel:9}).toBuffer();checks=validateImage(data);}
    const resolution = Math.max(checks.width, checks.height);checks.sourceSha256=sourceSha256;checks.sourceDimensions=sourceDimensions;
    found[id] ||= {};
    if (!found[id][kind] || resolution > found[id][kind].pixels) found[id][kind] = { data, checks, pixels: resolution };
  } catch (error) { failures.push({ file: path.relative(input, file), error: error.message }); }
}
const manifest = JSON.parse(await fs.readFile(path.join(target, 'manifest.json'), 'utf8').catch(() => '{"schemaVersion":1,"assets":{}}'));
const installed = [];
for (const [id, candidates] of Object.entries(found)) {
  if (!candidates.color || !candidates.normal || !(candidates.arm || candidates.roughness)) {
    failures.push({ id, error: 'Incompleto: precisa de cor, normal OpenGL e roughness/ARM. Normal DirectX não será usado.' }); continue;
  }
  const maps = {};
  await fs.mkdir(path.join(target, id), { recursive: true });
  for (const [kind, { data, checks, pixels }] of Object.entries(candidates)) {
    if (candidates.arm && ['roughness','metalness','ao'].includes(kind)) continue;
    const file = `${id}/${kind}_${pixels}.${checks.format}`;
    await fs.writeFile(path.join(target, file + '.part'), data); await fs.rename(path.join(target, file + '.part'), path.join(target, file));
    maps[kind] = { file, url: `/assets/polyhaven/${file}`, ...checks, resolution: `${Math.ceil(pixels / 1024)}k` };
  }
  const entry = { id, name: id, status: 'installed', source: `https://polyhaven.com/a/${id}`, provenance: 'user-supplied-files; upstream download metadata not independently verified', license: 'CC0-1.0', tileMeters: [2,2], tileMetersSource: 'author default; confirm physical scale', normalConvention: 'OpenGL', armChannels: maps.arm ? { r: 'ao', g: 'roughness', b: 'metalness' } : null, maps };
  await prepareMaterial(entry, target);
  await atomicJSON(path.join(target, id, 'material.json'), entry); manifest.assets[id] = entry; installed.push(id);
}
manifest.schemaVersion = 1; manifest.attribution = 'Powered by Poly Haven'; manifest.source = 'https://polyhaven.com';
await atomicJSON(path.join(target, 'manifest.json'), manifest);
await atomicJSON(path.join(target, 'importacao.json'), { date: new Date().toISOString(), installed, failures, imagesExamined: files.length });
console.log(`Imagens examinadas: ${files.length}; materiais importados: ${installed.length}; falhas: ${failures.length}.`);
for (const failure of failures) console.error(failure);
if (!installed.length || failures.length) process.exitCode = 1;

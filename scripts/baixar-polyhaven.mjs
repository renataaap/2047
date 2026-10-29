#!/usr/bin/env node
// Revised from the user's kit: official URLs, checksums, atomic writes and honest status.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { atomicJSON, installAsset, validateInstalled, USER_AGENT } from './lib/polyhaven.mjs';
import { prepareMaterial } from './lib/prepare-textures.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2), arg = (name, fallback) => args.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const resolution = arg('resolution', '2k');
if (!['1k','2k','4k'].includes(resolution)) throw new Error('Resolução permitida: 1k, 2k ou 4k');
const catalog = JSON.parse(await fs.readFile(path.join(root, 'materiais_2047.json'), 'utf8'));
const group = arg('group', ''), explicit = arg('ids', '');
const known = new Set([...catalog.existing_polyhaven, ...catalog.missing.map(a => a.id)]);
const ids = [...new Set(explicit ? explicit.split(',') : args.includes('--all') ? [...known] : catalog.missing.filter(a => !group || a.group === group).map(a => a.id))];
if (!ids.length || ids.some(id => !known.has(id))) throw new Error('Seleção de materiais vazia ou com ID fora do catálogo');
const target = path.resolve(arg('dest', path.join(root, 'public/assets/polyhaven')));
await fs.mkdir(target, { recursive: true });
const old = JSON.parse(await fs.readFile(path.join(target, 'manifest.json'), 'utf8').catch(() => '{"assets":{}}'));
const assets = { ...old.assets }, results = [], startedAt = new Date().toISOString();
let blocked = null;
console.log(`${USER_AGENT}\nDestino: ${target}\nSeleção: ${ids.length} materiais / até ${resolution}`);
for (const id of ids) {
  try {
    if (!args.includes('--refresh') && assets[id]?.resolution === resolution && await validateInstalled(assets[id], target)) {
      console.log(`[${id}] cache validado (SHA-256)`); results.push({ id, status: 'cached' }); continue;
    }
    if (blocked) { results.push({ id, status: 'not-attempted', error: blocked }); continue; }
    console.log(`[${id}] consultando /info e /files…`);
    const entry = await installAsset(id, { target, resolution, height: args.includes('--height'), onMap: m => console.log(`  ${m.cached ? 'mantido' : 'baixado'} ${m.kind}: ${m.width}×${m.height}, ${m.bytes} bytes`) });
    await prepareMaterial(entry, target);
    await atomicJSON(path.join(target, id, 'material.json'), entry);
    assets[id] = entry; results.push({ id, status: 'installed', maps: Object.keys(entry.maps) });
  } catch (error) {
    const reason = [error.message, error.cause?.message].filter(Boolean).join(' / ');
    console.error(`[${id}] FALHA: ${reason}`); results.push({ id, status: 'failed', error: reason });
    if (!await validateInstalled(assets[id], target)) delete assets[id]; // Keep only a previously verified usable version.
    if (error.status === 403 || /403|proxy|ENETUNREACH/.test(reason) || args.includes('--fail-fast')) blocked = reason;
  }
}
await atomicJSON(path.join(target, 'manifest.json'), { schemaVersion: 1, attribution: 'Powered by Poly Haven', source: 'https://polyhaven.com', assets });
await atomicJSON(path.join(target, 'instalacao.json'), { startedAt, completedAt: new Date().toISOString(), resolution, requested: ids, results, installed: Object.keys(assets).length });
const failures = results.filter(r => ['failed','not-attempted'].includes(r.status));
console.log(`Materiais disponíveis e validados: ${Object.keys(assets).length}. Falhas/pendências nesta execução: ${failures.length}.`);
if (failures.length) process.exitCode = 1;

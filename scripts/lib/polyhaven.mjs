import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

export const API = 'https://api.polyhaven.com';
export const USER_AGENT = '2047-Rede-Aurora/0.6 asset-preparation (Powered by Poly Haven)';
const aliases = {
  color: ['diff', 'diffuse', 'basecolor', 'base_color'],
  normal: ['nor_gl', 'normal_gl', 'normal_opengl'],
  arm: ['arm', 'orm'],
  roughness: ['rough', 'roughness'],
  metalness: ['metal', 'metallic', 'metalness'],
  ao: ['ao', 'ambient_occlusion'],
  displacement: ['disp', 'displacement', 'height'],
};
export const digest = (data, algorithm = 'sha256') => createHash(algorithm).update(data).digest('hex');
export const safeId = id => typeof id === 'string' && /^[a-z0-9_]+$/.test(id);

// Header/dimension checks reject HTML, empty and truncated downloads before publication.
// Upstream MD5/size, when supplied, and local SHA-256 validate the complete payload.
export function imageInfo(data) {
  if (data.length >= 33 && data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) && data.toString('ascii', 12, 16) === 'IHDR' && data.toString('ascii', data.length - 8, data.length - 4) === 'IEND') {
    return { format: 'png', width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
  }
  if (data.length >= 12 && data[0] === 255 && data[1] === 216 && data[data.length - 2] === 255 && data[data.length - 1] === 217) {
    let offset = 2;
    while (offset + 8 < data.length) {
      if (data[offset++] !== 255) continue;
      const marker = data[offset++];
      if (marker === 255 || marker === 0) continue;
      if (marker === 218 || marker === 217) break;
      if (marker === 216 || marker >= 208 && marker <= 215) continue;
      const length = data.readUInt16BE(offset);
      if (length < 2 || offset + length > data.length) break;
      if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)) return { format: 'jpg', width: data.readUInt16BE(offset + 5), height: data.readUInt16BE(offset + 3) };
      offset += length;
    }
  }
  throw new Error('Imagem PNG/JPEG inválida ou truncada');
}

export function validateImage(data, expected = {}) {
  const info = imageInfo(data);
  if (info.width < 1 || info.height < 1 || info.width > 4096 || info.height > 4096) throw new Error('Dimensões fora do orçamento 1–4096 px');
  if (expected.size && data.length !== expected.size) throw new Error(`Tamanho divergente: ${data.length}/${expected.size}`);
  if (expected.md5 && digest(data, 'md5') !== expected.md5.toLowerCase()) throw new Error('MD5 divergente');
  if (expected.sha256 && digest(data) !== expected.sha256) throw new Error('SHA-256 divergente');
  return { ...info, bytes: data.length, sha256: digest(data) };
}

export function chooseMap(tree, kind, resolution = '2k') {
  const key = Object.keys(tree).find(key => aliases[kind]?.includes(key.toLowerCase()));
  const entry = key && tree[key];
  // Never silently upgrade a 1K request to 4/8/16K.
  const sizes = ['1k','2k','4k'].filter(s => parseInt(s) <= parseInt(resolution)).reverse();
  for (const size of sizes) for (const format of ['jpg','png']) {
    const file = entry?.[size]?.[format];
    if (!file?.url) continue;
    const url = new URL(file.url);
    if (url.protocol !== 'https:') throw new Error('A API retornou uma URL sem HTTPS');
    return { ...file, url: url.href, format, resolution: size, apiMap: key };
  }
  return null;
}

export function selectMaps(tree, resolution, height = false) {
  const selected = {};
  for (const kind of ['color','normal','arm']) {
    const map = chooseMap(tree, kind, resolution);
    if (map) selected[kind] = map;
  }
  for (const kind of ['roughness','metalness','ao']) {
    if (selected.arm) continue; // R=AO, G=roughness, B=metalness: no duplicate downloads.
    const map = chooseMap(tree, kind, resolution);
    if (map) selected[kind] = map;
  }
  if (height) { const map = chooseMap(tree, 'displacement', resolution); if (map) selected.displacement = map; }
  if (!selected.color || !selected.normal || !(selected.arm || selected.roughness)) throw new Error('Mapas essenciais ausentes: cor, normal OpenGL e roughness/ARM');
  return selected;
}

export async function request(url, fetcher = fetch) {
  let last;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetcher(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(15000) });
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${url}`); error.status = response.status;
        if ((response.status === 429 || response.status >= 500) && attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, Math.min(5000, Number(response.headers.get('retry-after')) * 1000 || (attempt + 1) * 500))); continue;
        }
        throw error;
      }
      return response;
    } catch (error) {
      last = error;
      if (error.status || error.cause?.code === 'UND_ERR_PRX_TLS' || /403/.test(String(error.cause?.message))) break;
    }
  }
  throw last;
}

export async function atomicJSON(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.part`;
  await fs.writeFile(temporary, JSON.stringify(data, null, 2) + '\n');
  await fs.rename(temporary, file);
}

export async function validateInstalled(entry, target) {
  if (entry?.status !== 'installed' || !entry.maps?.color || !entry.maps.normal || !(entry.maps.arm || entry.maps.roughness)) return false;
  try {
    for (const file of Object.values(entry.maps).flatMap(m => [m, ...Object.values(m.variants || {})])) {
      const relative = file.file;
      if (typeof relative !== 'string' || relative.includes('..') || path.isAbsolute(relative) || !file.sha256) return false;
      validateImage(await fs.readFile(path.join(target, relative)), file);
    }
    return true;
  } catch { return false; }
}

export async function installAsset(id, { target, resolution = '2k', height = false, fetcher = fetch, onMap = () => {} }) {
  if (!safeId(id)) throw new Error('ID inválido');
  const info = await (await request(`${API}/info/${id}`, fetcher)).json();
  if (info.type !== 1) throw new Error('O asset existe, mas não é uma textura');
  const tree = await (await request(`${API}/files/${id}`, fetcher)).json();
  const selected = selectMaps(tree, resolution, height);
  await fs.mkdir(path.join(target, id), { recursive: true });
  const maps = {};
  for (const [kind, source] of Object.entries(selected)) {
    const relative = `${id}/${kind}_${source.resolution}.${source.format}`;
    const destination = path.join(target, relative);
    let data = await fs.readFile(destination).catch(() => null), cached = false, checks;
    if (data && (source.md5 || source.size)) {
      try { checks = validateImage(data, source); cached = true; } catch { data = null; }
    } else data = null;
    if (!data) {
      const response = await request(source.url, fetcher);
      data = Buffer.from(await response.arrayBuffer()); checks = validateImage(data, source);
      const temporary = `${destination}.part`;
      await fs.writeFile(temporary, data); await fs.rename(temporary, destination);
    }
    maps[kind] = { file: relative, url: `/assets/polyhaven/${relative}`, sourceUrl: source.url, apiMap: source.apiMap, resolution: source.resolution, md5: source.md5 || null, ...checks };
    onMap({ kind, cached, ...checks });
  }
  const dimensions = info.dimensions?.slice(0, 2).map(mm => mm / 1000);
  return { id, name: info.name || id, status: 'installed', source: `https://polyhaven.com/a/${id}`, license: 'CC0-1.0', authors: info.authors || {}, resolution, tileMeters: dimensions?.length === 2 && dimensions.every(n => Number.isFinite(n) && n > 0) ? dimensions : [2,2], normalConvention: 'OpenGL', armChannels: maps.arm ? { r: 'ao', g: 'roughness', b: 'metalness' } : null, maps };
}

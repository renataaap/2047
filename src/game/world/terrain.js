import { CONFIG } from '../../data/config.js';
export function randomSeed(seed) { let n=seed|0; return () => { n = (Math.imul(n,1664525)+1013904223)|0; return (n>>>0)/4294967296; }; }
export function roadX(z) { const t=Math.max(0, -z-240); return Math.sin(t/390)*24*Math.min(t/300,1); }
export function roadHeight(z) { return Math.sin(z/180)*1.3 + Math.sin(z/73)*.23; }
export function heightAt(x,z) {
  const d=Math.abs(x-roadX(z));
  const s=Math.min(1,Math.max(0,(d-8)/50)); const blend=s*s*(3-2*s);
  const n=Math.sin(x*.016+Math.cos(z*.008)*2)*5 + Math.cos(z*.012+x*.006)*3 + Math.sin(x*.043+z*.027)*1.2;
  return roadHeight(z) + blend * (n + .8) + Math.sin(z*1.5)*.025*(1-blend);
}
export function surfaceAt(x,z) { const d=Math.abs(x-roadX(z)); return d<CONFIG.world.roadWidth/2 && z<80 && z>-3000 ? 'asfalto' : d<16 ? 'terra' : 'areia'; }

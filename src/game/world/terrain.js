import { CONFIG } from '../../data/config.js';
import { biomeAt,ROUTES } from '../../data/network.js';
import {roadX,roadHeight} from './roadProfile.js';
import {networkTerrain,addedSurface} from '../navigation/roadIndex.js';
export {roadX,roadHeight} from './roadProfile.js';
export function randomSeed(seed) { let n=seed|0; return () => { n = (Math.imul(n,1664525)+1013904223)|0; return (n>>>0)/4294967296; }; }
export function roadHalfWidth(z){return biomeAt(z)==='glass'?3:5;}
export function routeAt(z){return ROUTES.find(r=>-z>=r.start&&-z<=r.end);}
export function networkDetourX(z){const r=routeAt(z);return roadX(z)+(r?Math.sin((-z-r.start)/(r.end-r.start)*Math.PI)*130:0);}
export function detourX(z) {const t=Math.max(0,Math.min(1,(-z-650)/1100));return roadX(z)+Math.sin(t*Math.PI)*350;}
export function legacyHeightAt(x,z) {
  const route=routeAt(z);const d=Math.min(Math.abs(x-roadX(z)),z < -650 && z > -1750?Math.abs(x-detourX(z)):1e9,route?Math.abs(x-networkDetourX(z)):1e9);
  const s=Math.min(1,Math.max(0,(d-8)/50)); const blend=s*s*(3-2*s);
  const n=Math.sin(x*.016+Math.cos(z*.008)*2)*5 + Math.cos(z*.012+x*.006)*3 + Math.sin(x*.043+z*.027)*1.2;
  const region=biomeAt(z),amplitude=region==='salt'?.18:region==='glass'?4:1;return roadHeight(z) + blend * (n + .8)*amplitude + Math.sin(z*1.5)*.025*(1-blend);
}
export function heightAt(x,z){const old=legacyHeightAt(x,z),d=Math.min(Math.abs(x-roadX(z)),z<-650&&z>-1750?Math.abs(x-detourX(z)):1e6,routeAt(z)?Math.abs(x-networkDetourX(z)):1e6),t=Math.max(0,Math.min(1,(d-roadHalfWidth(z)-1)/10)),blend=t*t*(3-2*t);return old+(networkTerrain(x,z,old)-old)*blend;}
export const regionAt=biomeAt;
export function surfaceAt(x,z) {const extra=addedSurface(x,z);if(extra)return extra;const r=routeAt(z),side=Math.abs(x-roadX(z)),safe=r&&Math.abs(x-networkDetourX(z))<5,region=biomeAt(z);if(safe&&side>12)return 'asfalto';if(region==='salt')return side>55?'lama':'sal';if(region==='glass')return side<roadHalfWidth(z)?'vidro':'rocha';if(r?.kind==='flood'&&Math.abs(-z-r.at)<40&&side<9)return 'agua';const d=Math.min(side,z < -650 && z > -1750?Math.abs(x-detourX(z)):1e9);return d<CONFIG.world.roadWidth/2&&z<80&&z>-CONFIG.world.roadLength?'asfalto':side<8&&z>-3200&&z<80?'cascalho':d<16?'terra':'areia';}

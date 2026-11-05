import {RESERVATIONS} from '../../data/ambience.js';
import {CITY_BUILDINGS} from '../../data/cityLayout.js';
import {CITY_GAS} from '../../data/roadNetwork.js';
import {PAVED_AREAS,roadClearanceAt} from '../navigation/roadIndex.js';
import {heightAt,randomSeed} from '../world/terrain.js';
import {coreAt} from './progress.js';
import {VEGETATION_CELL} from './definitions.js';
import {planCell,DECOR_CELL} from '../world/contextLayout.js';

const structures=[...CITY_BUILDINGS,
 {x:-90,z:-290,width:42,depth:42},{x:100,z:-400,width:22,depth:26},{x:100,z:-450,width:22,depth:26},
 {x:CITY_GAS.x,z:CITY_GAS.z,width:38,depth:38},
];
export function vegetationAllowed(x,z,kind='grass',sample=heightAt){
 const radius=kind==='tree'?2.8:kind==='shrub'?1.3:.4;
 if(!Number.isFinite(x+z)||z>65||z<-21000||roadClearanceAt(x,z)<6+radius)return false;
 if(PAVED_AREAS.some(p=>Math.abs(x-p.x)<p.width/2+6+radius&&Math.abs(z-p.z)<p.length/2+6+radius))return false;
 if(RESERVATIONS.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+radius))return false;
 if(structures.some(p=>Math.abs(x-p.x)<p.width/2+5+radius&&Math.abs(z-p.z)<p.depth/2+6+radius))return false;
 const h=sample(x,z),s=[sample(x-radius,z),sample(x+radius,z),sample(x,z-radius),sample(x,z+radius)];
 return Number.isFinite(h)&&s.every(Number.isFinite)&&Math.max(...s)-Math.min(...s)<radius*(kind==='tree'?.8:1.45);
}
function hash(text){let h=2166136261;for(const ch of text)h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;}
export function* vegetationPatches(cx,cz,sample=heightAt,blocked=()=>false){
 const size=VEGETATION_CELL,decor=[];for(let i=Math.floor(cz*size/DECOR_CELL)-1;i<=Math.ceil((cz+1)*size/DECOR_CELL)+1;i++)decor.push(...planCell(i));
 // Authored habitat patches on a jittered 16 m lattice, never regular rows.
 for(let ix=0;ix<16;ix++)for(let iz=0;iz<16;iz++){
  const centerX=cx*size+(ix+.5)*16,centerZ=cz*size+(iz+.5)*16,core=coreAt(centerZ),r=randomSeed(hash(`${core.id}/${cx}/${cz}/${ix}/${iz}`));
  const favor=.5+.22*Math.sin(centerX*.019+Math.sin(centerZ*.014))+.22*Math.cos(centerZ*.023);
  if(r()>(core.region==='salt'?.24:core.region==='glass'?.38:.75)*favor)continue;
  const plants=[],px=centerX+(r()-.5)*10,pz=centerZ+(r()-.5)*10;
  const add=(kind,x,z,index)=>{
   const id=`${core.id}:${cx}:${cz}:${ix}:${iz}:${kind}:${index}`,radius=kind==='tree'?2:kind==='shrub'?.8:.25;
   if(!vegetationAllowed(x,z,kind,sample)||decor.some(p=>Math.hypot(p.x-x,p.z-z)<p.radius+radius+3)||blocked(x,sample(x,z),z,radius))return;
   plants.push({id,core:coreAt(z).id,region:coreAt(z).region,kind,x,y:sample(x,z),z,yaw:r()*Math.PI*2,scale:.65+r()*.7,height:.65+r()*.6,threshold:r(),density:r(),hue:r(),variant:hash(id)%3});
  };
  const count=24+Math.floor(r()*17);for(let i=0;i<count;i++){const a=r()*Math.PI*2,d=Math.sqrt(r())*5;add('grass',px+Math.sin(a)*d,pz+Math.cos(a)*d,i);}
  if(r()<.65){add('shrub',px+5+r()*3,pz-3,0);if(r()<.35)add('shrub',px+3,pz-5,1);}
  if(r()<(core.region==='salt'?.06:core.region==='glass'?.1:.36))add('tree',px-7,pz+5,0);
  yield plants;
 }
}
export function planVegetationCell(cx,cz,sample=heightAt,blocked=()=>false){return [...vegetationPatches(cx,cz,sample,blocked)].flat().sort((a,b)=>a.id.localeCompare(b.id));}
export function vegetationFingerprint(plants){let h=2166136261;for(const p of plants)h=hash(`${h}/${p.id}/${p.x.toFixed(4)}/${p.y.toFixed(4)}/${p.z.toFixed(4)}`);return h.toString(16).padStart(8,'0');}

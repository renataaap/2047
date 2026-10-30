import {RESERVATIONS,DECOR_SEED} from '../../data/ambience.js';
import {randomSeed,roadX,detourX,networkDetourX,routeAt,regionAt,heightAt} from './terrain.js';
export const DECOR_CELL=160;
export function reserved(x,z,r=0){return RESERVATIONS.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+r);}
export function roadClearance(x,z){return Math.min(Math.abs(x-roadX(z)),z<-650&&z>-1750?Math.abs(x-detourX(z)):1e6,routeAt(z)?Math.abs(x-networkDetourX(z)):1e6);}
export function placementAllowed(x,z,r=1,sample=heightAt){
 if(z>65||z<-21000||roadClearance(x,z)<9+r||reserved(x,z,r))return false;
 const values=[sample(x-r,z),sample(x+r,z),sample(x,z-r),sample(x,z+r)];
 return values.every(Number.isFinite)&&Math.max(...values)-Math.min(...values)<Math.max(.45,r*.7);
}
export function planCell(index,sample=heightAt){
 const rng=randomSeed(DECOR_SEED+Math.imul(index,73856093)),items=[];
 for(let i=0;i<7;i++){
  const z=index*DECOR_CELL+(rng()-.5)*DECOR_CELL,region=regionAt(z),side=i%2?1:-1;
  const offset=i<3?13+rng()*9:28+rng()*38,x=roadX(z)+side*offset;
  const options=region==='ashes'?['guardrail','powerline','roadSign','camp','scrap','deadTree','fence']:region==='salt'?['buoy','pier','roadSign','boat','scrap','pier','buoy']:region==='cities'?['guardrail','traffic','roadSign','facade','scrap','busStop','fence']:region==='glass'?['guardrail','riskSign','roadSign','retaining','scrap','deadTree','fence']:['guardrail','weatherMast','riskSign','antenna','scrap','windbreak','weatherMast'];
  const kind=options[i],radius=['camp','boat','busStop','facade','pier','windbreak'].includes(kind)?5:kind==='guardrail'?5.5:2;
  if(placementAllowed(x,z,radius,sample)&&!items.some(p=>Math.hypot(p.x-x,p.z-z)<p.radius+radius+3))items.push({id:`${index}:${i}`,x,z,y:sample(x,z),yaw:side<0?.12:Math.PI+.12,kind,region,radius,variant:Math.floor(rng()*4)});
 }
 return items;
}

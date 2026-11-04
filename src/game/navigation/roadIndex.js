import {ROAD_EDGES,ROAD_NODES,ROAD_PADS,CITY_JUNCTIONS,PILOT_CITY} from '../../data/roadNetwork.js';
import {sampleCurve,projectSpan} from './curves.js';
import {ROAD_DAMAGE} from '../world/roadDamage.js';
export const NETWORK_EDGES=ROAD_EDGES.map(e=>sampleCurve(e));
export const EDGE_BY_ID=new Map(NETWORK_EDGES.map(e=>[e.id,e]));
export const NODE_BY_ID=new Map(ROAD_NODES.map(n=>[n.id,n]));
export const ADJACENCY=new Map(ROAD_NODES.map(n=>[n.id,[]]));
for(const e of NETWORK_EDGES){ADJACENCY.get(e.from).push({edge:e,to:e.to,reverse:false});if(!e.oneWay)ADJACENCY.get(e.to).push({edge:e,to:e.from,reverse:true});}
for(const n of ROAD_NODES)if(ADJACENCY.get(n.id).length>2)n.junction=true;
for(const e of NETWORK_EDGES)e.connections=[...new Set([...ADJACENCY.get(e.from),...ADJACENCY.get(e.to)].map(a=>a.edge.id))].filter(id=>id!==e.id);
const CELL=32,all=new Map(),added=new Map(),patches=new Map();
const key=(x,z)=>`${Math.floor(x/CELL)},${Math.floor(z/CELL)}`;
function insert(index,item,minX,maxX,minZ,maxZ){for(let x=Math.floor(minX/CELL);x<=Math.floor(maxX/CELL);x++)for(let z=Math.floor(minZ/CELL);z<=Math.floor(maxZ/CELL);z++){const k=`${x},${z}`;if(!index.has(k))index.set(k,[]);index.get(k).push(item);}}
for(const e of NETWORK_EDGES)for(let i=1;i<e.samples.length;i++){const a=e.samples[i-1],b=e.samples[i],item={edge:e,a,b,index:i},r=e.width/2+24;insert(all,item,Math.min(a.x,b.x)-r,Math.max(a.x,b.x)+r,Math.min(a.z,b.z)-r,Math.max(a.z,b.z)+r);if(!e.legacy)insert(added,item,Math.min(a.x,b.x)-r,Math.max(a.x,b.x)+r,Math.min(a.z,b.z)-r,Math.max(a.z,b.z)+r);}
export const PAVED_AREAS=[...ROAD_PADS,...ROAD_NODES.filter(n=>n.junction&&n.z<=-200&&!ROAD_DAMAGE.some(p=>Math.abs(p.z-n.z)<22)).map(n=>({id:n.id,x:n.x,z:n.z,width:n.id.startsWith('cidade:')?38:32,length:n.id.startsWith('cidade:')?38:32,y:n.y,kind:'junction',round:true}))];
for(const p of PAVED_AREAS)insert(patches,p,p.x-p.width/2-18,p.x+p.width/2+18,p.z-p.length/2-18,p.z+p.length/2+18);
function nearest(index,x,z,predicate){let best=null;for(const s of index.get(key(x,z))||[]){if(predicate&&!predicate(s.edge))continue;const p=projectSpan({x,z},s.a,s.b);if(!best||p.distance<best.distance)best={...p,edge:s.edge,index:s.index,s:s.a.s+(s.b.s-s.a.s)*p.t};}return best;}
export const nearestAddedRoad=(x,z)=>nearest(added,x,z);
// A shallow construction subbase keeps the terrain's coarser triangles below
// the finished deck. It is not added to the legacy terrain used for migration.
export function networkRoadbed(x,z){const n=nearestAddedRoad(x,z);if(!n)return 0;return .06*(1-smooth((n.distance-n.edge.width/2-8)/8));}
export function nearestRoad(x,z,predicate){let n=nearest(all,x,z,predicate);if(n)return n;let best=null;for(const e of NETWORK_EDGES){if(predicate&&!predicate(e))continue;for(let i=1;i<e.samples.length;i++){const p=projectSpan({x,z},e.samples[i-1],e.samples[i]);if(!best||p.distance<best.distance)best={...p,edge:e,index:i,s:e.samples[i-1].s+(e.samples[i].s-e.samples[i-1].s)*p.t};}}return best;}
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function cityInfluence(x,z){const b=PILOT_CITY.bounds,d=Math.max(b.minX-x,x-b.maxX,b.minZ-z,z-b.maxZ,0);return 1-smooth(d/25);}
export function networkTerrain(x,z,original){
 let target=original,weight=0;const n=nearestAddedRoad(x,z);
 if(n){const w=1-smooth((n.distance-n.edge.width/2-24)/18);if(w>weight){target=n.y;weight=w;}}
 for(const p of patches.get(key(x,z))||[]){const d=p.round?Math.hypot(x-p.x,z-p.z)-p.width/2:Math.max(Math.abs(x-p.x)-p.width/2,Math.abs(z-p.z)-p.length/2),w=1-smooth(d/18);if(w>weight){target=p.y;weight=w;}}
 const c=cityInfluence(x,z);if(c>weight){target=PILOT_CITY.height;weight=c;}
 return original+(target-original)*weight;
}
export function addedSurface(x,z){
 for(const p of patches.get(key(x,z))||[])if(p.round?Math.hypot(x-p.x,z-p.z)<p.width/2:Math.abs(x-p.x)<p.width/2&&Math.abs(z-p.z)<p.length/2)return 'asfalto';
 const n=nearestAddedRoad(x,z);return n&&n.distance<n.edge.width/2?n.edge.surface:null;
}
export function addedClearance(x,z){const n=nearestAddedRoad(x,z);return n?n.distance-n.edge.width/2:1e6;}
export function roadReserved(x,z,r=0){if(cityInfluence(x,z)>.01)return true;for(const p of patches.get(key(x,z))||[])if(Math.abs(x-p.x)<p.width/2+r+5&&Math.abs(z-p.z)<p.length/2+r+5)return true;return addedClearance(x,z)<r+5;}
export function sectorRoadSpans(cx,cz,size){const result=new Map(),loX=cx*size-size/2,hiX=loX+size,loZ=cz*size-size/2,hiZ=loZ+size;for(const e of NETWORK_EDGES){if(e.legacy)continue;for(let i=1;i<e.samples.length;i++){const a=e.samples[i-1],b=e.samples[i],m={x:(a.x+b.x)/2,z:(a.z+b.z)/2};if(m.x<loX||m.x>=hiX||m.z<loZ||m.z>=hiZ)continue;if(!result.has(e.id))result.set(e.id,{edge:e,spans:[]});result.get(e.id).spans.push({a,b});}}return [...result.values()];}

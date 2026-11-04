import {ROAD_DESTINATIONS} from '../../data/roadNetwork.js';
import {ADJACENCY,NODE_BY_ID,nearestRoad} from './roadIndex.js';
import {distance,roundJunctions} from './curves.js';
export const ROUTE_PROFILES=['fast','safe','economy'];
export function edgeAllowed(e,c){const calm=e.weatherClosure==='plasma-front'&&(c?.network?.clock||0)%120>=65;return e.access==='truck'&&e.unlocked!==false&&(!e.blockedUntil||c?.cores?.[e.blockedUntil]?.state==='active'||calm);}
export function estimates(e,mass=9000){const speed=e.speedKmh*(e.type==='dirt'?.82:1),seconds=e.length/Math.max(2,speed/3.6),rolling=e.surface==='terra'?1.4:e.surface==='vidro'?1.16:e.surface==='sal'?1.2:1;return {distance:e.length,seconds,litres:e.length/1000*.66*(mass/9000)**.5*rolling*(1+e.incline*3),risk:e.risk*e.length};}
export function edgeCost(e,profile,mass){const v=estimates(e,mass);return profile==='fast'?v.seconds:profile==='economy'?v.litres*1000:v.seconds*(1+e.risk*6)+(e.type==='dirt'?v.distance*.25:0);}
function planLeg(position,destinationId,profile='safe',campaign={},mass=9000){
 const destination=ROAD_DESTINATIONS.find(d=>d.id===destinationId);if(!destination||!ROUTE_PROFILES.includes(profile))return null;
 const start=nearestRoad(position.x,position.z,e=>edgeAllowed(e,campaign));if(!start)return null;
 const distances=new Map(),previous=new Map(),open=new Set(),seed=(id,cost,reverse)=>{if(!distances.has(id)||cost<distances.get(id)){distances.set(id,cost);previous.set(id,{seed:true,reverse});open.add(id);}};
 const fraction=start.s/start.edge.length,cost=edgeCost(start.edge,profile,mass);seed(start.edge.to,cost*(1-fraction),false);if(!start.edge.oneWay)seed(start.edge.from,cost*fraction,true);
 while(open.size){let id;for(const n of open)if(id===undefined||distances.get(n)<distances.get(id))id=n;open.delete(id);if(id===destination.nodeId)break;
  for(const a of ADJACENCY.get(id)||[]){if(!edgeAllowed(a.edge,campaign))continue;const next=distances.get(id)+edgeCost(a.edge,profile,mass);if(next<(distances.get(a.to)??Infinity)){distances.set(a.to,next);previous.set(a.to,{from:id,...a});open.add(a.to);}}
 }
 if(!previous.has(destination.nodeId))return null;
 const legs=[];let id=destination.nodeId;while(!previous.get(id)?.seed){const a=previous.get(id);if(!a)return null;legs.unshift(a);id=a.from;}
 const initial=previous.get(id),initialPoints=initial.reverse?[...start.edge.samples.slice(0,start.index)].reverse():start.edge.samples.slice(start.index);
 const points=[{x:start.x,y:start.y,z:start.z},...initialPoints.map(p=>({...p,junction:false}))];
 const seedNode=NODE_BY_ID.get(id);if(points.length)Object.assign(points.at(-1),{junction:!!seedNode.junction});
 const segments=[{edge:start.edge,reverse:initial.reverse,fraction:initial.reverse?fraction:1-fraction}];
 for(const a of legs){const samples=a.reverse?[...a.edge.samples].reverse():a.edge.samples;points.push(...samples.slice(1).map(p=>({...p,junction:false})));Object.assign(points.at(-1),{junction:!!NODE_BY_ID.get(a.to).junction});segments.push({...a,fraction:1});}
 const path=roundJunctions(points),totals={distance:0,seconds:0,litres:0,risk:0};for(const a of segments){const v=estimates(a.edge,mass);for(const k of Object.keys(totals))totals[k]+=v[k]*a.fraction;}
 return {destination,profile,path,segments:segments.map(a=>({id:a.edge.id,from:a.reverse?a.edge.to:a.edge.from,to:a.reverse?a.edge.from:a.edge.to,type:a.edge.type,surface:a.edge.surface,speedKmh:a.edge.speedKmh,risk:a.edge.risk,fraction:a.fraction})),...totals,startDistance:start.distance,roadTypes:[...new Set(segments.map(a=>a.edge.type))],surfaces:[...new Set(segments.map(a=>a.edge.surface))]};
}
export function planRoute(position,destinationId,profile='safe',campaign={},mass=9000,via=null){
 if(!via||via===destinationId)return planLeg(position,destinationId,profile,campaign,mass);
 const first=planLeg(position,via,profile,campaign,mass);if(!first)return null;const last=planLeg(first.destination,destinationId,profile,campaign,mass);if(!last)return null;
 const path=roundJunctions([...first.path,...last.path.slice(1)]);
 return {...last,path,via:first.destination,viaProgressMetres:first.path.at(-1).s,segments:[...first.segments,...last.segments],distance:first.distance+last.distance,seconds:first.seconds+last.seconds,litres:first.litres+last.litres,risk:first.risk+last.risk,startDistance:first.startDistance,roadTypes:[...new Set([...first.roadTypes,...last.roadTypes])],surfaces:[...new Set([...first.surfaces,...last.surfaces])]};
}
export function routeInstructions(route,progress){
 if(!route)return {text:'Selecione um destino no mapa M.',distance:null,kind:'idle'};
 const end=route.path.at(-1),remaining=Math.max(0,(end?.s||0)-progress.s);if(remaining<45)return {text:'Área de estacionamento à frente',distance:remaining,kind:'parking'};
 const start=Math.min(route.path.length-2,progress.index),a=route.path[start],b=route.path[Math.min(route.path.length-1,start+4)],heading=Math.atan2(b.x-a.x,b.z-a.z);
 for(let i=start+5;i<route.path.length-5;i++){const p=route.path[i];if(p.s-progress.s<24)continue;const q=route.path[Math.min(route.path.length-1,i+10)],ahead=Math.atan2(q.x-p.x,q.z-p.z),angle=Math.atan2(Math.sin(ahead-heading),Math.cos(ahead-heading));if(Math.abs(angle)>.48)return {text:angle>0?'Vire à esquerda na próxima entrada':'Vire à direita na próxima entrada',distance:Math.max(0,p.s-progress.s),kind:angle>0?'left':'right'};if(p.s-progress.s>180)break;}
 return {text:route.roadTypes.includes('urban')&&remaining<800?'Siga para a entrada da cidade':'Continue pela via sinalizada',distance:remaining,kind:'straight'};
}

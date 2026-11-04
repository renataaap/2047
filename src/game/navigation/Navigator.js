import {CORES,ROUTES} from '../../data/network.js';
import {ROAD_DESTINATIONS} from '../../data/roadNetwork.js';
import {planRoute,routeInstructions,ROUTE_PROFILES} from './routePlanner.js';
import {projectPolyline,distance} from './curves.js';
export function objectiveDestination(c){const next=CORES.find(k=>c.cores[k.id]?.state!=='active');return !c.seed.received?'shelter':!next?'home':c.network?.cargo===next.id||next.number===1?next.id:`vault-${next.number}`;}
export class Navigator{
 constructor(){this.route=null;this.reroutes=0;this.cursor=1;this.current=null;}
 select(c,payload){if(!payload||payload.destination!==null&&!ROAD_DESTINATIONS.some(d=>d.id===payload.destination)||!ROUTE_PROFILES.includes(payload.preference)||payload.via&&!ROAD_DESTINATIONS.some(d=>d.id===payload.via&&['junction','waypoint'].includes(d.kind)))return false;const via=payload.via||null,completed=c.navigation?.destination===payload.destination&&c.navigation?.via===via?!!c.navigation.viaCompleted:false;c.navigation={version:1,destination:payload.destination,preference:payload.preference,via,viaCompleted:payload.resetVia?false:completed};this.route=null;return true;}
 update(position,c,mass=9000){
  const id=c.navigation?.destination||objectiveDestination(c),profile=c.navigation?.preference||'safe',goal=ROAD_DESTINATIONS.find(d=>d.id===id),planned=ROUTES.filter(r=>c.network?.routes?.[r.id]&&(position.z+r.at)*(goal.z+r.at)<0).sort((a,b)=>Math.abs(position.z+a.at)-Math.abs(position.z+b.at))[0],automatic=id==='core-1'&&c.flags.plannedRoute==='short'&&position.z>-1430?'vale-cinzas':planned?`via:${c.network.routes[planned.id]==='safe'?'desvio':'oeste'}:${planned.id}`:null,via=c.navigation?.via&&!c.navigation?.viaCompleted?c.navigation.via:automatic,unlocks=CORES.map(k=>c.cores[k.id]?.state==='active'?'1':'0').join(''),key=`${id}/${profile}/${via}/${unlocks}/${(c.network?.clock||0)%120<65}`;
  if(this.campaign!==c){this.campaign=c;this.route=null;this.reroutes=0;}
  const calculate=reroute=>{this.route=planRoute(position,id,profile,c,mass,via);this.key=key;this.lastPlan={...position};this.cursor=1;if(reroute)this.reroutes++;if(this.route){this.mapPath=this.route.path.filter((_,i,a)=>i===0||i===a.length-1||i%4===0).map(p=>({x:p.x,z:p.z}));}};
  if(!this.route||key!==this.key)calculate(false);
  if(!this.route){this.current={status:'unavailable',destination:ROAD_DESTINATIONS.find(d=>d.id===id),instruction:{text:'Não há uma rota conectada disponível.',kind:'blocked'},reroutes:this.reroutes};return;}
  const progress=()=>{const points=this.route.path.slice(Math.max(0,this.cursor-45),Math.min(this.route.path.length,this.cursor+90)),p=projectPolyline(position,points);return p?{...p,index:p.index+Math.max(0,this.cursor-45)}:null;};
  let p=progress();if(p?.distance>22&&distance(position,this.lastPlan)>30){calculate(true);p=progress();}
  if(!p)return;this.cursor=p.index;if(this.route.via&&c.navigation.via===this.route.via.id&&p.s>=this.route.viaProgressMetres-10&&Math.hypot(position.x-this.route.via.x,position.z-this.route.via.z)<35)c.navigation.viaCompleted=true;const total=this.route.path.at(-1).s,remaining=Math.max(0,total-p.s),ratio=remaining/Math.max(1,total),arrival=remaining<16&&Math.hypot(position.x-this.route.destination.x,position.z-this.route.destination.z)<20;
  this.current={status:arrival?'arrived':p.distance>35?'off-road':'routing',destination:this.route.destination,profile,remainingMetres:remaining,remainingSeconds:this.route.seconds*ratio,estimatedLitres:this.route.litres*ratio,offRouteMetres:p.distance,progressMetres:p.s,totalMetres:total,instruction:p.distance>35?{text:'Retorne à via sinalizada',distance:p.distance,kind:'off-road'}:routeInstructions(this.route,p),path:this.mapPath,segments:this.route.segments,surfaces:this.route.surfaces,roadTypes:this.route.roadTypes,reroutes:this.reroutes,positionEstimated:true};
 }
 snapshot(){return this.current||{status:'idle',instruction:{text:'Mapa recuperado · posição estimada',kind:'idle'},reroutes:0};}
}

import {useState,useMemo} from 'react';
import {NETWORK_EDGES} from '../../game/navigation/roadIndex.js';
import {edgeAllowed} from '../../game/navigation/routePlanner.js';
import {ROAD_DESTINATIONS,PILOT_CITY} from '../../data/roadNetwork.js';
import {ROAD_POINTS} from '../../data/roadSites.js';
import {NETWORK_POINTS} from '../../data/network.js';
import {DISCOVERY_SITES} from '../../data/ambience.js';
import {POINTS} from '../../data/campaign.js';
export const mapPath=points=>points.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(2)},${p.z.toFixed(2)}`).join(' ');
export const metres=n=>n>=1000?`${(n/1000).toFixed(1).replace('.',',')} km`:`${Math.round(n||0)} m`;
const ROAD_LABELS={highway:'Rodovia',mountain:'Estrada da Cordilheira',secondary:'Estrada secundária',dirt:'Estrada de terra',urban:'Via urbana',access:'Acesso ao estacionamento'};
const FOOT_MARKERS=[{id:'garage-entry',name:'Entrada da garagem municipal',...PILOT_CITY.garage.door,kind:'garage'},{id:'city-entry',name:'Entrada de Cinza Nova',x:-120,z:-620,kind:'entry'},{id:'survivor',name:'Sobrevivente',...POINTS.shelter,kind:'npc'},...ROAD_POINTS.map(p=>({id:`npc:${p.id}`,name:p.npc,...p.talk,kind:'npc'})),...NETWORK_POINTS.map(p=>({id:p.id,name:p.npc||p.name,x:p.kind==='network-core'||p.kind==='vault'?p.x-1:p.x,z:p.z+(p.kind==='network-core'?8:p.kind==='vault'?6:p.kind==='shelter'?-1:0),kind:p.kind==='shelter'?'npc':'terminal'})),{id:'core1',name:'Terminal do Núcleo 1',x:23,z:-2882,kind:'terminal'},...DISCOVERY_SITES.map(p=>({id:p.id,name:p.name,...p.terminal,kind:'poi'}))];
export function RoadMapSvg({state,center,range=640,overview=false,onDestination,showFoot=false}){
 const c=state.campaign,nav=state.navigation||{},x=center.x,z=center.z,half=range/2,scale=range/300;
 const nearby=useMemo(()=>NETWORK_EDGES.filter(e=>e.samples.some(p=>Math.abs(p.x-x)<half+e.width&&Math.abs(p.z-z)<half+e.width)),[x,z,half]);
 const position=showFoot?state.playerPosition:state.position,px=position?.[0]||0,pz=position?.[2]||0,q=state.quaternion||[0,0,0,1],yaw=showFoot?state.playerYaw||0:Math.atan2(2*(q[3]*q[1]+q[0]*q[2]),1-2*(q[1]*q[1]+q[0]*q[0]));
 const markers=showFoot?FOOT_MARKERS.filter(p=>Math.hypot(p.x-x,p.z-z)<Math.min(half,110)):ROAD_DESTINATIONS.filter(p=>p.kind!=='waypoint'&&Math.abs(p.x-x)<half&&Math.abs(p.z-z)<half);
 return <svg data-testid={overview?'road-map':'minimap-svg'} viewBox={`${x-half} ${z-half} ${range} ${range}`} role={onDestination?'group':'img'} aria-label={showFoot?'Caminhos e interações próximas':'Rede de estradas e rota ativa'}>
  <rect x={x-half} y={z-half} width={range} height={range} fill="#202a27"/>
  <rect x={PILOT_CITY.bounds.minX} y={PILOT_CITY.bounds.minZ} width={PILOT_CITY.bounds.maxX-PILOT_CITY.bounds.minX} height={PILOT_CITY.bounds.maxZ-PILOT_CITY.bounds.minZ} rx="16" fill="#475047" opacity=".5"/>
  {nearby.map(e=><path key={e.id} d={mapPath(e.samples)} fill="none" stroke={!edgeAllowed(e,c)?'#a4654e':e.type==='dirt'||e.surface==='terra'?'#a08b64':e.type==='urban'?'#b6b7a0':'#8b9290'} strokeWidth={Math.max(scale*1.7,Math.min(e.width,scale*5))} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={!edgeAllowed(e,c)?`${scale*5} ${scale*4}`:undefined}><title>{ROAD_LABELS[e.type]||'Via'} · {e.surface}{!edgeAllowed(e,c)?' · bloqueado':''}</title></path>)}
  {nav.path?.length>1&&<path data-testid="active-route-line" d={mapPath(nav.path)} fill="none" stroke="#d7b66c" strokeWidth={scale*(overview?2.5:3)} strokeLinejoin="round" strokeLinecap="round"/>}
  {markers.map(p=><g key={p.id} role={onDestination?'button':undefined} tabIndex={onDestination?0:undefined} aria-label={p.name} onClick={onDestination?()=>onDestination(p.id):undefined} onKeyDown={onDestination?e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();onDestination(p.id);}}:undefined} className={onDestination?'map-destination':''}>
   <circle cx={p.x} cy={p.z} r={scale*(showFoot?3.4:4.5)} fill={p.kind==='core'?'#b8c7aa':p.kind==='npc'?'#d7b78a':p.kind==='gas'?'#d6a756':'#9bb1b0'} stroke="#18221f" strokeWidth={scale*1.5}/><title>{p.name}</title>
  </g>)}
  {nav.destination&&<circle cx={nav.destination.x} cy={nav.destination.z} r={scale*8} fill="none" stroke="#e0be74" strokeWidth={scale*1.3}/>}
  <g transform={`translate(${px} ${pz}) rotate(${-yaw*180/Math.PI})`}><circle r={scale*9} fill="#111b17" opacity=".6"/><path d={`M0 ${-9*scale} L${6*scale} ${6*scale} L0 ${3*scale} L${-6*scale} ${6*scale} Z`} fill="#f2e4be" stroke="#1b2722" strokeWidth={scale}/></g>
  <text x={x-half+scale*14} y={z-half+scale*23} fill="#bfc8b6" fontSize={scale*10}>N ↑</text>
 </svg>;
}
export default function NavigationMap({state,onPanel}){
 const [mode,setMode]=useState('compact'),nav=state.navigation||{},foot=state.mode==='walking',p=foot?state.playerPosition:state.position;
 if(!p)return null;
 if(mode==='hidden')return <button className="navigation-restore" onClick={()=>setMode('compact')} aria-label="Mostrar minimapa">Mapa inercial</button>;
 return <aside className={`navigation-hud ${foot?'foot-navigation':''} ${mode==='expanded'?'expanded':''}`} aria-label="Navegação inercial" data-testid="navigation-hud">
  <header><span>MAPA INERCIAL</span><div><button onClick={()=>setMode(mode==='expanded'?'compact':'expanded')} aria-label={mode==='expanded'?'Reduzir minimapa':'Ampliar minimapa'}>{mode==='expanded'?'−':'+'}</button><button onClick={()=>setMode('hidden')} aria-label="Ocultar minimapa">×</button></div></header>
  <RoadMapSvg state={state} center={{x:p[0],z:p[2]}} range={foot?180:mode==='expanded'?960:640} showFoot={foot}/>
  <div className="navigation-instruction"><b>{foot?nav.status==='arrived'?'Explore a pé · procure o terminal':'Observe os acessos e interlocutores':nav.instruction?.text}</b>{!foot&&nav.instruction?.distance!=null&&<span>{metres(nav.instruction.distance)}</span>}</div>
  <button className="navigation-destination" onClick={()=>onPanel('map')}><strong>{nav.destination?.name||'Selecionar destino · M'}</strong><span>{metres(nav.remainingMetres||0)} · posição estimada</span></button>
 </aside>;
}

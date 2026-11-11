import {useMemo,useState,useEffect} from 'react';
import {ROAD_DESTINATIONS,PILOT_CITY} from '../../data/roadNetwork.js';
import {planRoute} from '../../game/navigation/routePlanner.js';
import {objectiveDestination} from '../../game/navigation/Navigator.js';
import {RoadMapSvg,metres} from '../hud/NavigationMap.js';
const PROFILES=[['fast','Mais rápida'],['safe','Mais segura'],['economy','Mais econômica']];
const TYPE_NAMES={asfalto:'asfalto',terra:'terra',vidro:'rocha vítrea',sal:'sal',cascalho:'cascalho'};
export default function RoutePlanner({state,act}){
 const c=state.campaign,nav=state.navigation||{},freightId=c.logistics?.active&&c.logistics.focus==='contract'?state.logistics?.target?.destination:null,[selected,setSelected]=useState(freightId||c.navigation?.destination||objectiveDestination(c)),[view,setView]=useState('route');
 useEffect(()=>{setSelected(freightId||c.navigation?.destination||objectiveDestination(c));},[freightId,c.logistics?.focus]);
 const preference=freightId?c.logistics.preference:c.navigation?.preference||'safe',via=!freightId&&c.navigation?.via&&!c.navigation.viaCompleted?c.navigation.via:null,unlocks=Object.values(c.cores).map(v=>v.state).join(','),x=state.position?.[0]||0,z=state.position?.[2]||0;
 const plans=useMemo(()=>PROFILES.map(([id,label])=>({id,label,route:planRoute({x,z},selected,id,c,state.massKg||9000,via)})),[selected,x,z,unlocks,via,state.massKg]);
 const current=plans.find(p=>p.id===preference)?.route,points=current?.path||[{x,z}],bounds=points.reduce((b,p)=>({minX:Math.min(b.minX,p.x),maxX:Math.max(b.maxX,p.x),minZ:Math.min(b.minZ,p.z),maxZ:Math.max(b.maxZ,p.z)}),{minX:x,maxX:x,minZ:z,maxZ:z});
 const center=view==='near'?{x,z}:view==='city'?PILOT_CITY:view==='continent'?{x:0,z:-10500}:{x:(bounds.minX+bounds.maxX)/2,z:(bounds.minZ+bounds.maxZ)/2},range=view==='near'?900:view==='city'?650:view==='continent'?22500:Math.max(600,bounds.maxX-bounds.minX,bounds.maxZ-bounds.minZ)*1.15;
 const select=id=>{setSelected(id);setView('route');act('navigate',{destination:id,preference,via:null});};
 const pilot=choice=>{setSelected('core-1');setView('route');act('plan',choice==='paved'?'safe':'short');act('navigate',{destination:'core-1',preference:choice==='paved'?'safe':'economy',via:choice==='paved'?null:'vale-cinzas',resetVia:true});};
 const mapState={...state,navigation:{...nav,path:current?.path,destination:current?.destination}};
 return <section className="road-planner" aria-label="Planejador da rede rodoviária" data-testid="route-planner">
  <div className="road-planner-map"><RoadMapSvg state={mapState} center={center} range={range} overview onDestination={select}/><div className="road-map-controls">{[['near','Perto de mim'],['city','Cinza Nova'],['route','Trajeto'],['continent','Continente']].map(([id,label])=><button key={id} aria-pressed={view===id} onClick={()=>setView(id)}>{label}</button>)}</div><div className="road-map-legend"><span><i/>Via construída</span><span><i className="dirt"/>Terra</span><span><i className="active"/>Rota</span><span><i className="blocked"/>Bloqueio</span></div></div>
  <div className="road-plan-controls">{c.logistics?.active&&<div className="freight-actions"><button onClick={()=>act('contractFocus','contract')}>Seguir o frete ativo</button><button onClick={()=>act('contractFocus','campaign')}>Retomar campanha</button></div>}<label>Destino da viagem<select aria-label="Destino da viagem" value={selected} onChange={e=>select(e.target.value)}>{ROAD_DESTINATIONS.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
   <div className="route-profiles">{plans.map(({id,label,route})=><button key={id} className="route-profile" aria-pressed={preference===id} disabled={!route} onClick={()=>freightId&&selected===freightId?act('contractProfile',id):act('navigate',{destination:selected,preference:id,via})}><b>{label}</b>{route?<><span>{metres(route.distance)} · ~{Math.max(1,Math.round(route.seconds/60))} min · ~{route.litres.toFixed(1).replace('.',',')} L</span><small>{route.surfaces.map(s=>TYPE_NAMES[s]||s).join(' / ')} · risco {route.risk/Math.max(1,route.distance)>.4?'elevado':route.risk/Math.max(1,route.distance)>.2?'moderado':'menor'}{route.via?' · passagem pelo '+route.via.name:''}</small></>:<span>Sem conexão liberada</span>}</button>)}</div>
   <button className="wide-link" onClick={()=>{setSelected(objectiveDestination(c));act('navigate',{destination:null,preference,via:null});}}>Seguir o objetivo da campanha</button>
   {z>-2200&&<div className="pilot-route-choices"><h3>Travessia até o Núcleo 1</h3><button className="wide-link" onClick={()=>pilot('paved')}>Rota A · rodovia e alça leste</button><button className="wide-link" onClick={()=>pilot('secondary')}>Rota B · Cinza Nova e estrada do Vale</button><p className="road-map-note">As opções usam vias diferentes. A estrada do Vale tem terra e curvas; a alça leste preserva a carga em piso pavimentado. Consulte os custos calculados acima.</p></div>}
   <p className="road-map-note">Navegação reconstruída com mapas locais e posição estimada. Tempo e diesel são estimativas para a massa atual do Titã, o piso e a inclinação dos segmentos. Entradas e estacionamentos fazem parte da rede.</p>
  </div>
  <div className="route-destination-list">{ROAD_DESTINATIONS.filter(d=>!['waypoint','junction'].includes(d.kind)).map(d=><button key={d.id} onClick={()=>select(d.id)}>{d.name}<small>{d.kind==='core'?'Estacionamento e terminal':d.kind==='garage'?'Estacionamento coberto':'Acesso pela rede'}</small></button>)}</div>
 </section>;
}

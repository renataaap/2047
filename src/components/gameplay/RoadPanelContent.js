import {gasQuote,shopQuote,serviceQuote,sellQuote} from '../../game/economy/market.js';
import {useState} from 'react';
import { GAS_OFFERS,GENERATOR,LITERS_PER_SCRAP,ROAD_COPY as R,WORKSHOP_OFFERS,WORKSHOP_SERVICES } from '../../data/road.js';
import {ROAD_POINTS} from '../../data/roadSites.js';
import { COMPONENTS,ITEMS } from '../../data/campaign.js';
import { CONFIG } from '../../data/config.js';
import DialogueText from './DialogueText.js';

const kmOf=p=>(-p.z/1000).toFixed(2).replace('.',',');

export function RoadJournal({campaign:c}){
  return <><h3>{R.journal}</h3><p className="panel-note">{R.gasLine}</p><div className="network-journal">{ROAD_POINTS.filter(p=>p.kind!=='tech').map(p=>
    <section key={p.id}><h3>{p.name}</h3><p>{p.kind==='gas'?'Posto':'Oficina'} · km {kmOf(p)}{c.road?.visited.includes(p.id)?' · visitado':''}</p><small>{p.npc}</small></section>)}</div></>;
}

function Tech({state,act}){
  const c=state.campaign,gen=c.road.generator,seed=c.seed.received,core=c.cores['core-1'].state;
  const text=core==='active'?(c.road.techReward?R.techAfter:R.techActive):!seed?R.techNoSeed:!gen?R.techNeedGen:core==='failed'||c.stage==='failed'?R.techFailed:R.techGenOn;
  const bag=c.inventory.player,truck=Math.hypot(state.playerPosition[0]-state.position[0],state.playerPosition[2]-state.position[2])<=40?c.inventory.truck:{diesel:0,parts:0},canPay=Object.entries(GENERATOR.cost).every(([id,n])=>bag[id]+truck[id]>=n);
  return <>{state.roadEntity==='equipment'?<h3>Gerador do Núcleo 1</h3>:<><span className="eyebrow">Tomás</span><DialogueText text={text}/></>}
    <p className="panel-note">{R.generatorStatus}: <b>{gen?R.on:R.off}</b>. {R.payNote}</p>
    {!gen&&<button className="primary" disabled={!seed||!canPay} onClick={()=>act('roadGenerator')}>{R.generatorCost}</button>}
    {!seed&&state.roadEntity==='equipment'&&<p role="status">{R.noSeedGenerator}</p>}{!gen&&seed&&!canPay&&<p role="status">{R.techLowFuel}</p>}
    {gen&&<p role="status">{R.generatorOn}</p>}
    {core==='active'&&<button className="wide-link" disabled={c.road.techReward} onClick={()=>act('roadClaim')}>{c.road.techReward?R.claimed:`${R.claim} · ${R.claimDetail}`}</button>}</>;
}

function Gas({state,game,act,p}){
  const c=state.campaign,stock=c.road.stocks[p.id],scrap=c.inventory.player.scrap,parked=game.roadController.parked(p),fuel=state.fuel??0;
  const room=Math.floor(CONFIG.vehicle.fuelCapacity-fuel);
  const quote=o=>gasQuote(c,state,p.id,o.id);
  return <>
    <p className="panel-note">{c.economy?'Cotação regional: estoque, demanda e recuperação ambiental afetam os valores abaixo.':R.gasLine} {R.pumpNote}</p>
    <p>{R.tank}: {fuel.toFixed(1)} / {CONFIG.vehicle.fuelCapacity} L · {R.scrap}: {scrap} · {R.stock}: {stock.diesel} L diesel · {stock.water} L água</p>
    <div className="trade-list">{GAS_OFFERS.map(o=>{const q=quote(o);return <div key={o.id}><span>{o.label}<small>{q.liters?`${q.liters} L · `:''}{q.cost} {R.scrap.toLowerCase()}</small></span>
      <button disabled={!q.ok||(q.need&&!parked)} onClick={()=>act('roadGas',o.id)}>{stock[o.kind==='water'?'water':'diesel']<1?R.sold:R.buy}</button></div>;})}</div>
    {!parked&&<p role="status">{R.pumpNote}</p>}</>;
}

function Workshop({state,game,act,p}){
  const c=state.campaign,stock=c.road.stocks[p.id],scrap=c.inventory.player.scrap,parked=game.roadController.parked(p);
  return <>
    <p className="panel-note">{R.shopNote}</p><p>{R.scrap}: {scrap}</p>
    <h3>{R.buyParts}</h3><div className="trade-list">{WORKSHOP_OFFERS.map(o=><div key={o.id}><span>{o.label}<small>{R.stock}: {stock[o.item]} · {shopQuote(c,p.id,o.id).cost} {R.scrap.toLowerCase()} · {ITEMS[o.item].name}</small></span>
      <button disabled={!shopQuote(c,p.id,o.id).ok} onClick={()=>act('roadShopBuy',o.id)}>{stock[o.item]<o.quantity?R.sold:R.buy}</button></div>)}</div>
    <button className="wide-link" disabled={!sellQuote(c,p.id).ok} onClick={()=>act('roadSell')}>{`Vender 2 peças por ${sellQuote(c,p.id).cost} materiais`}</button>
    <h3>{R.services}</h3><div className="component-grid">{Object.entries(COMPONENTS).map(([id,name])=><section key={id}><div className="condition-title"><b>{name}</b><span>{Math.round(c.components[id])}%</span></div><meter min="0" max="100" value={c.components[id]}/>
      {WORKSHOP_SERVICES.map(s=><button key={s.id} aria-label={`${s.label} ${R.serviceFor} ${name}`} disabled={!parked||!serviceQuote(c,p.id,s.id,id).ok} onClick={()=>act('roadService',{service:s.id,component:id})}>{s.label} · {serviceQuote(c,p.id,s.id,id).cost} mat.</button>)}</section>)}</div>
    {!parked&&<p role="status">{R.shopNote}</p>}</>;
}

export default function RoadPanelContent({state,game,act}){
  const p=ROAD_POINTS.find(k=>k.id===state.roadPoint);const [tab,setTab]=useState(state.roadEntity==='npc'?'talk':'services');if(!p||!state.campaign?.road)return null;
  if(p.kind==='tech')return <div className="conversation-content"><Tech state={state} act={act}/></div>;
  if(state.roadEntity==='pump')return <div className="service-sheet"><Gas state={state} game={game} act={act} p={p}/></div>;
  return <><div className="conversation-tabs" role="group" aria-label="Conversa e serviços"><button aria-pressed={tab==='talk'} onClick={()=>setTab('talk')}>Conversa</button><button aria-pressed={tab==='services'} onClick={()=>setTab('services')}>Compras e serviços</button></div>{tab==='talk'?<div className="conversation-content"><DialogueText text={p.line}/><div className="narrative-choices"><button onClick={()=>setTab('services')}>Ver compras e serviços <span aria-hidden="true">→</span></button></div></div>:<div className="service-sheet"><h3>{p.kind==='gas'?R.title.gas:R.services}</h3>{p.kind==='gas'?<Gas state={state} game={game} act={act} p={p}/>:<Workshop state={state} game={game} act={act} p={p}/>}</div>}</>;
}

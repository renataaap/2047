import {DISCOVERY_SITES} from '../../data/ambience.js';
import {POIS} from '../../data/expedition.js';
import {CORES} from '../../data/network.js';
import {ROAD_POINTS} from '../../data/road.js';
import {visitSite} from './worldProgress.js';

export function recordFootDiscoveries(c,position,loaded){
 for(const b of loaded){const p=b.site;
  if(!c.world?.visited?.includes(p.id)&&Math.abs(position.x-p.x)<p.width/2&&Math.abs(position.z-p.z)<p.depth/2&&position.y>b.floor+.3&&position.y<b.floor+2.1)visitSite(c,p.id);
 }
}

// Derived from already persisted state. No extra reward, parallel quest or fake timestamps.
export function discoveryEntries(c){
 const entries=[];
 for(const p of DISCOVERY_SITES)if(c.world?.visited?.includes(p.id))entries.push({id:`site:${p.id}`,name:p.name,km:-p.z/1000,kind:'Local explorado',complete:!!(c.world.claimed?.includes(p.id)||c.world.read?.includes(p.id)),status:c.world.claimed?.includes(p.id)?'Reserva recolhida':c.world.read?.includes(p.id)?'Boletim registrado':'Visita registrada',detail:p.information});
 for(const p of POIS)if(c.expedition?.visited?.includes(p.id))entries.push({id:`poi:${p.id}`,name:p.name,km:-p.z/1000,kind:'Ponto de apoio',complete:!!c.expedition.looted?.includes(p.id),status:c.expedition.looted?.includes(p.id)?'Suprimentos recolhidos':'Visita registrada',detail:p.description});
 for(const p of ROAD_POINTS)if(c.road?.visited?.includes(p.id))entries.push({id:`road:${p.id}`,name:p.name,km:-p.z/1000,kind:p.kind==='tech'?'Ponto técnico':'Ponto de apoio',complete:false,status:'Parada registrada',detail:`Atendimento de ${p.npc}.`});
 for(const p of CORES)if(c.cores?.[p.id]?.state==='active')entries.push({id:`core:${p.id}`,name:p.name,km:-p.z/1000,kind:'Restauração',complete:true,status:'Campo ancorado',detail:'Restauração registrada nesta região.'});
 return entries.sort((a,b)=>a.km-b.km||a.id.localeCompare(b.id));
}

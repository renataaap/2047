import {fieldUnstable} from '../restoration/progress.js';
import {SITE_FRAGMENTS} from '../../data/story.js';
import {recoverySummary} from '../restoration/progress.js';
import {DISCOVERY_SITES} from '../../data/ambience.js';
import {POIS} from '../../data/expedition.js';
import {CORES} from '../../data/network.js';
import {ROAD_POINTS} from '../../data/roadSites.js';
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
 for(const s of recoverySummary(c))if(s.active){const p=CORES.find(k=>k.id===s.id);entries.push({id:`core:${p.id}`,name:p.name,km:-p.z/1000,kind:'Restauração',complete:true,status:`Campo ancorado${fieldUnstable(c,p.id)?' · instável':''} · ${s.label.toLowerCase()}`,detail:'A Rede estabilizou esta faixa. A cobertura vegetal e a umidade evoluem enquanto a jornada continua.'});
  const observations=['','Primeira água sobre o solo','Brotos nas margens da estrada','Árvores jovens e nova cobertura'];
  for(let stage=1;stage<=3;stage++)if(s.observed&(1<<stage))entries.push({id:`nature:${p.id}:${stage}`,name:observations[stage],km:-p.z/1000,kind:'Natureza observada',complete:true,status:`${p.name} · observação registrada`,detail:stage===1?'A poeira cedeu e a primeira umidade apareceu.':stage===2?'Gramíneas e arbustos ocupam manchas protegidas, mantendo os acessos livres.':'A vegetação jovem já muda a silhueta da paisagem. O bioma conserva suas características.'});
 }
 for(const p of DISCOVERY_SITES){const f=SITE_FRAGMENTS[p.id];if(f&&c.flags?.voiceFragments?.includes(f.id))entries.push({id:`signal:${f.id}`,name:'Fragmento de sinal',km:-p.z/1000,kind:'Sinal',complete:true,status:p.name,detail:f.text});}
 return entries.sort((a,b)=>a.km-b.km||a.id.localeCompare(b.id));
}

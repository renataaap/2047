import {DISCOVERY_SITES} from '../../data/ambience.js';
import {bagWeight} from '../missions/campaign.js';
const ids=DISCOVERY_SITES.map(p=>p.id);
export function upgradeWorld(c){c.world={version:1,daySeconds:9*3600,days:0,visited:[],claimed:[],read:[],...c.world};return c.world;}
export function validWorld(w){if(w===undefined)return true;return !!w&&typeof w==='object'&&!Array.isArray(w)&&w.version===1&&Number.isFinite(w.daySeconds)&&w.daySeconds>=0&&w.daySeconds<86400&&Number.isInteger(w.days)&&w.days>=0&&w.days<=1e7&&['visited','claimed','read'].every(k=>Array.isArray(w[k])&&w[k].length<=ids.length&&new Set(w[k]).size===w[k].length&&w[k].every(id=>ids.includes(id)))&&w.claimed.every(id=>w.visited.includes(id))&&w.read.every(id=>w.visited.includes(id));}
export function visitSite(c,id){const p=DISCOVERY_SITES.find(p=>p.id===id);if(!p)return false;const w=upgradeWorld(c);if(!w.visited.includes(id))w.visited.push(id);return true;}
export function siteAction(c,id){
 const p=DISCOVERY_SITES.find(p=>p.id===id),w=upgradeWorld(c);
 if(!p||!w.visited.includes(id))return {ok:false,message:'Entre no local e inspecione o ponto indicado.'};
 if(!p.reward){if(w.read.includes(id))return {ok:false,message:'Boletim já registrado no mapa.'};w.read.push(id);return {ok:true,message:'Boletim registrado no mapa recuperado.'};}
 if(w.claimed.includes(id))return {ok:false,message:'Esta reserva já foi recolhida.'};
 const bag={...c.inventory.player};for(const [key,n] of Object.entries(p.reward))bag[key]+=n;
 if(bagWeight(bag)>40)return {ok:false,message:'A mochila não comporta a reserva. Transfira recursos ao caminhão antes de recolher.'};
 Object.assign(c.inventory.player,bag);w.claimed.push(id);return {ok:true,message:'Reserva recolhida. Não haverá reposição neste local.'};
}

import { COMPONENTS,ITEMS } from '../../data/campaign.js';
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const bounded=(n,a,b)=>Number.isFinite(n)&&n>=a&&n<=b;
const vec=(v,n,max=100000)=>Array.isArray(v)&&v.length===n&&v.every(x=>bounded(x,-max,max));
export function validSave(s){
 if(!plain(s)||![1,2].includes(s.schemaVersion)||!vec(s.truck?.position,3)||!vec(s.truck?.rotation,4,1)||Math.abs(Math.hypot(...s.truck.rotation)-1)>.02||!vec(s.player?.position,3)||!['driving','walking'].includes(s.context)||!bounded(s.fuel,0,180)||!bounded(s.temperature,0,180)||typeof s.engineOn!=='boolean')return false;
 const c=s.campaign;if(!plain(c)||!['shelter','transport','failed','activated'].includes(c.stage)||!plain(c.seed)||typeof c.seed.received!=='boolean'||!bounded(c.seed.integrity,0,100))return false;
 if(!plain(c.components)||Object.keys(COMPONENTS).some(k=>!bounded(c.components[k],0,100)))return false;
 if(!plain(c.inventory)||['player','truck'].some(b=>!plain(c.inventory[b])||Object.keys(ITEMS).some(k=>!bounded(c.inventory[b][k],0,500))))return false;
 for(const bag of ['player','truck']){const weight=Object.entries(ITEMS).reduce((n,[id,item])=>n+item.weight*c.inventory[bag][id],0);if(weight>(bag==='player'?40:240)+.00001)return false;}
 const f=c.flags;if(!plain(f)||['metSurvivor','renataContact','stormEncountered','titanForced'].some(k=>typeof f[k]!=='boolean')||![null,'safe','short'].includes(f.plannedRoute)||![null,'safe','short'].includes(f.chosenRoute)||![null,'rebirth','partial','last','voice'].includes(f.finalChoice)||!Array.isArray(f.voiceFragments)||f.voiceFragments.some(v=>typeof v!=='string'||v.length>50))return false;
 if(!plain(c.restoration)||typeof c.restoration.ashes!=='boolean'||!plain(c.cores)||!plain(c.cores['core-1'])||!['inactive','active','failed'].includes(c.cores['core-1'].state)||!Number.isInteger(c.cores['core-1'].attempts)||!bounded(c.cores['core-1'].attempts,0,10000))return false;
 if(c.restoration.ashes!==(c.stage==='activated')||(c.cores['core-1'].state==='active')!==c.restoration.ashes||c.seed.received!==(c.stage!=='shelter'))return false;
 for(const k of ['completedMissions','decisions','collected'])if(!Array.isArray(c[k])||c[k].length>200||c[k].some(x=>typeof x!=='string'||x.length>120))return false;
 if(s.schemaVersion===2){const e=c.expedition;if(!plain(e)||!bounded(e.hydration,0,100)||!bounded(e.satiety,0,100)||!bounded(e.fatigue,0,100)||!bounded(e.deprivationSeconds,0,1e8)||!Number.isInteger(e.transactions)||!bounded(e.transactions,0,1e7)||!plain(e.stock)||['diesel','water','food','parts'].some(k=>!Number.isInteger(e.stock[k])||!bounded(e.stock[k],0,100)))return false;for(const k of ['visited','looted'])if(!Array.isArray(e[k])||e[k].length>30||e[k].some(v=>!['depot','ivani','station'].includes(v)))return false;}
 return Number.isInteger(c.rngState)&&bounded(c.rngState,0,4294967295)&&bounded(c.travelSeconds,0,1e8)&&Number.isInteger(c.checkpoint)&&bounded(c.checkpoint,0,1e7);
}
export const validSlot=slot=>typeof slot==='string'&&/^[1-3]$/.test(slot);

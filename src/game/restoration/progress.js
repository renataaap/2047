import {CORES,biomeAt} from '../../data/network.js';
import {ECOLOGY,RECOVERY_SECONDS,STAGE_LABELS,RECOVERY_REACTIONS} from './definitions.js';
import {UNSTABLE_ANCHOR} from '../../data/story.js';
export const UNSTABLE_FIELD_AGE=150;
export const fieldUnstable=(c,id)=>Number.isFinite(c.story?.anchors?.[id])&&c.story.anchors[id]<UNSTABLE_ANCHOR;
export const fieldCeiling=(c,id)=>fieldUnstable(c,id)?UNSTABLE_FIELD_AGE:RECOVERY_SECONDS.mature;
export const clamp01=n=>Math.max(0,Math.min(1,n));
export const smooth=(a,b,x)=>{const t=clamp01((x-a)/(b-a));return t*t*(3-2*t);};
export function recoveryStage(age){return age>=RECOVERY_SECONDS.mature?3:age>=RECOVERY_SECONDS.initial?2:1;}
export function coreAt(z){const region=biomeAt(z);let nearest;for(const core of CORES)if(core.region===region&&(!nearest||Math.abs(z-core.z)<Math.abs(z-nearest.z)))nearest=core;return nearest;}

// Existing activated saves already showed a recovered landscape. Migrate them
// to maturity once, without replaying a scene, changing missions or paying loot.
export function ensureRecovery(c){
 if(!c.world)return null;
 if(!c.world.recovery)c.world.recovery={version:1,cores:{}};
 const r=c.world.recovery;
 for(const core of CORES)if(c.cores[core.id]?.state==='active'&&!r.cores[core.id])r.cores[core.id]={age:RECOVERY_SECONDS.mature,observed:0,cinematicSeen:true,migrated:true};
 return r;
}
export function beginRecovery(c,id){
 if(!CORES.some(k=>k.id===id)||c.cores[id]?.state!=='active'||!c.world)return false;
 const existing=c.world.recovery?.cores[id];
 if(existing)return false;
 if(!c.world.recovery)c.world.recovery={version:1,cores:{}};
 c.world.recovery.cores[id]={age:0,observed:0,cinematicSeen:false,migrated:false};return true;
}
export function stepRecovery(c,dt){
 if(!(dt>0)||!Number.isFinite(dt))return;
 const r=ensureRecovery(c);if(!r)return;
 // An unstable anchoring (Seed below UNSTABLE_ANCHOR integrity, approved in
 // docs/NARRATIVA_0.14.0.md §7) stops that field at stage 2: part of the land
 // stays grey. Legacy activations have no record and count as stable.
 for(const [id,record]of Object.entries(r.cores))if(c.cores[id]?.state==='active')record.age=Math.min(fieldCeiling(c,id),record.age+dt);
}
export function recoveryAt(c,x,z){
 const core=coreAt(z),record=core&&c.world?.recovery?.cores[core.id],active=core&&c.cores[core.id]?.state==='active',region=biomeAt(z),eco=ECOLOGY[region];
 if(!active)return {core:core?.id,region,stage:0,age:0,amount:0,wetness:0,grass:0,shrubs:0,trees:0,rain:0};
 const age=record?.age??RECOVERY_SECONDS.mature,stage=recoveryStage(age),reach=180+age*18;
 const distance=Math.hypot(x-core.x,(z-core.z)*.55),edge=1-smooth(reach-160,reach+50,distance),side=1-smooth(eco.width-220,eco.width,Math.abs(x));
 const influence=edge*side,amount=(.28+.72*smooth(0,RECOVERY_SECONDS.mature,age))*influence;
 return {core:core.id,region,stage,age,amount,wetness:(.38+.62*smooth(0,50,age))*influence*eco.moisture,grass:(.18+.82*smooth(0,180,age))*influence,shrubs:smooth(5,190,age)*influence*eco.shrub,trees:smooth(38,240,age)*influence*eco.trees,rain:(.35+.65*smooth(0,22,age))*influence*(region==='salt'?.42:1)};
}
export function observeRecovery(c,p){
 const s=recoveryAt(c,p.x,p.z),record=c.world?.recovery?.cores[s.core];
 if(s.amount>.08&&record)record.observed|=1<<s.stage;
}
export function recoverySummary(c){return CORES.map(core=>{const r=c.world?.recovery?.cores[core.id],active=c.cores?.[core.id]?.state==='active',age=active?(r?.age??RECOVERY_SECONDS.mature):0,stage=active?recoveryStage(age):0;return {id:core.id,name:core.name,region:core.region,active,stage,label:STAGE_LABELS[stage],age,progress:active?clamp01(age/RECOVERY_SECONDS.mature):0,observed:r?.observed||0,migrated:!!r?.migrated};});}
export function contextualReaction(c,p){const s=recoveryAt(c,p.x,p.z);return s.amount>.1?RECOVERY_REACTIONS[s.region][s.stage-1]:null;}
export function validRecovery(c){
 const r=c.world?.recovery;if(r===undefined)return true;
 const plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
 if(!plain(r)||r.version!==1||!plain(r.cores))return false;
 return Object.entries(r.cores).every(([id,v])=>CORES.some(k=>k.id===id)&&c.cores?.[id]?.state==='active'&&plain(v)&&Number.isFinite(v.age)&&v.age>=0&&v.age<=RECOVERY_SECONDS.mature&&Number.isInteger(v.observed)&&v.observed>=0&&v.observed<16&&!(v.observed&~((1<<(recoveryStage(v.age)+1))-1))&&typeof v.cinematicSeen==='boolean'&&typeof v.migrated==='boolean');
}

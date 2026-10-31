import { STEPS,FACTS,TRAINING } from './definitions.js';

export function createTutorial(){return {version:1,status:'active',completed:[],facts:[],walked:0,reversed:0};}
export function validTutorial(t){
 if(t===undefined)return true; // Old saves never acquire a tutorial implicitly.
 if(!t||t.version!==1||!['active','completed','skipped'].includes(t.status))return false;
 for(const [key,ids] of [['completed',STEPS.map(s=>s.id)],['facts',FACTS]])if(!Array.isArray(t[key])||t[key].length>ids.length||new Set(t[key]).size!==t[key].length||t[key].some(id=>!ids.includes(id)))return false;
 if(t.completed.some((id,i)=>STEPS[i]?.id!==id)||t.status==='completed'&&t.completed.length!==STEPS.length)return false;
 return ['walked','reversed'].every(k=>Number.isFinite(t[k])&&t[k]>=0&&t[k]<=1000);
}
export function trainingParked(s){const p=TRAINING.parking;return Math.abs(s.position.x-p.x)<=p.halfWidth&&Math.abs(s.position.z-p.z)<=p.halfLength&&Math.abs(s.speed)<.4&&Math.abs(Math.sin(s.yaw))<.25&&Math.cos(s.yaw)>.9;}

// No renderer, input listeners or economy. Observes successful existing actions and simulation.
export class TutorialController {
 constructor(campaign){this.campaign=campaign;this.previous=null;this.parkingSeconds=0;}
 get data(){return this.campaign.tutorial;}
 get active(){return this.data?.status==='active';}
 mark(fact){if(this.active&&FACTS.includes(fact)&&!this.data.facts.includes(fact))this.data.facts.push(fact);}
 event(kind,payload={}){
  if(!this.active)return;
  if(kind==='look'){this.lookMotion=(this.lookMotion||0)+Math.hypot(payload.x||0,payload.y||0);if(this.lookMotion>=10)this.mark('look');}
  if(kind==='inspect')this.mark(payload.id);
  if(kind==='enter')this.mark('enter');
  if(kind==='camera'&&payload.mode===1)this.mark('cab');
  if(kind==='engine'&&payload.on)this.mark('engine');
  if(kind==='panel'&&payload.kind==='maintenance')this.mark('maintenancePanel');
  if(kind==='panel'&&payload.kind==='inventory'&&this.campaign.seed.received)this.mark('inventory');
  if(kind==='action'&&payload.type==='repair')this.mark('repair');
  if(kind==='action'&&payload.type==='plan')this.mark('route');
  if(kind==='action'&&payload.type==='loot'&&payload.poi==='depot')this.mark('poi');
 }
 update(s,dt){
  this.completionSeconds=Math.max(0,(this.completionSeconds||0)-dt);
  if(!this.active){this.previous=null;return;}
  const t=this.data,prev=this.previous,driving=s.mode==='driving';
  if(prev){
   const d=Math.hypot(s.player.x-prev.player.x,s.player.z-prev.player.z);
   if(s.mode==='walking'&&prev.mode==='walking'&&d<10*dt)t.walked=Math.min(1000,t.walked+d);
   const drive=Math.hypot(s.position.x-prev.position.x,s.position.z-prev.position.z);
   if(driving&&prev.mode==='driving'&&drive<Math.max(2,Math.abs(s.speed)*dt*2)){
    if(s.signedSpeed<-.3)t.reversed=Math.min(1000,t.reversed+drive);
    if(Math.abs(s.steer)>.1&&Math.abs(Math.atan2(Math.sin(s.yaw-prev.yaw),Math.cos(s.yaw-prev.yaw)))>.001&&drive>.01)this.mark('turn');
   }
  }
  if(driving&&s.speed>=8/3.6&&s.throttle>0)this.mark('accelerate');
  if(driving&&t.facts.includes('accelerate')&&s.throttle<0&&s.speed<.55)this.mark('brake');
  if(t.reversed>=2)this.mark('reverse');
  const parked=trainingParked(s);
  this.parkingSeconds=driving&&parked&&s.handbrake?this.parkingSeconds+dt:0;
  if(this.parkingSeconds>=.6)this.mark('park');
  if(t.facts.includes('park')&&parked&&!s.engineOn)this.mark('engineOff');
  if(t.facts.includes('engineOff')&&s.mode==='walking')this.mark('exit');
  const has=id=>t.facts.includes(id),c=this.campaign;
  const conditions={walk:t.walked>=3,look:has('look'),inspect:has('tools')&&has('logbook'),enter:has('enter'),cab:has('cab'),engine:has('engine'),accelerate:has('accelerate'),brake:has('brake'),turn:has('turn'),reverse:has('reverse'),park:has('park'),engineOff:has('engineOff'),exit:has('exit')&&has('maintenancePanel'),maintenance:has('repair')||has('maintenancePanel')&&Object.values(c.components).every(n=>n===100),mission:c.seed.received,inventory:has('inventory'),map:!!c.flags.plannedRoute,travel:c.seed.received&&c.flags.stormEncountered&&!!c.flags.chosenRoute,poi:has('poi')||c.expedition.looted.includes('depot'),generator:!!c.road.generator,delivery:c.cores['core-1'].state==='active'};
  // Consecutive facts may complete together; never manufacture an event or skip a missing fact.
  while(t.completed.length<STEPS.length&&conditions[STEPS[t.completed.length].id])t.completed.push(STEPS[t.completed.length].id);
  if(t.completed.length===STEPS.length){t.status='completed';this.completionSeconds=6;}
  this.previous={...s,position:{...s.position},player:{...s.player}};
 }
 skip(){if(this.active)this.data.status='skipped';}
 repeat(){this.campaign.tutorial=createTutorial();this.previous=null;this.parkingSeconds=0;}
 snapshot(){const t=this.data;if(!t)return {status:'legacy'};const step=STEPS[t.completed.length];return {...t,step:step||null,total:STEPS.length,celebration:(this.completionSeconds||0)>0,chapter:'CAPÍTULO 01 — O ÚLTIMO MOTOR'};}
}

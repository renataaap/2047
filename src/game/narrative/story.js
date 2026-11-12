import {CHAPTERS,SCENES,CHOICES,RELATIONS,UNSTABLE_ANCHOR} from '../../data/story.js';
import {CORES} from '../../data/network.js';
import {ITEMS} from '../../data/campaign.js';

// Central narrative state. The chapter and relations are derived from the
// campaign (cores, quests, choices), so legacy saves land in the right place
// without migration. Only facts that cannot be derived are stored, in the
// optional campaign.story block.

export const STORY_VERSION=1;
const MAX_RADIO=80;
const plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v);

export function createStory(){return {version:STORY_VERSION,scenes:{},choices:{},radio:[],anchors:{}};}
export function ensureStory(c){if(!c.story)c.story=createStory();return c.story;}

export function activeCores(c){let n=0;for(const k of CORES){if(c.cores?.[k.id]?.state!=='active')break;n++;}return n;}

export function chapterOf(c){
 const done=activeCores(c);
 if(done>=CORES.length)return 'final';
 const next=CORES[done].id;
 return CHAPTERS.find(ch=>ch.cores?.includes(next))?.id||'ch1';
}
export const chapterInfo=id=>CHAPTERS.find(ch=>ch.id===id)||null;
export const chapterIndex=id=>CHAPTERS.findIndex(ch=>ch.id===id);

// Scenes: once watched it stays watched; a skip never downgrades a watch.
export function recordScene(c,id,outcome){
 if(!SCENES.includes(id)||!['watched','skipped'].includes(outcome))return false;
 const s=ensureStory(c),prev=s.scenes[id];
 if(prev==='watched'||prev===outcome)return false;
 s.scenes[id]=outcome;return true;
}
export const sceneSeen=(c,id)=>!!c.story?.scenes?.[id];

// Anchor quality is recorded the first time a core activates.
export function recordAnchor(c,coreId,integrity){
 if(!CORES.some(k=>k.id===coreId)||!Number.isFinite(integrity))return false;
 const s=ensureStory(c);if(Object.hasOwn(s.anchors,coreId))return false;
 s.anchors[coreId]=Math.round(Math.max(0,Math.min(100,integrity)));return true;
}
// Legacy activations without a record count as stable.
export const unstableFields=c=>Object.entries(c.story?.anchors||{}).filter(([,q])=>q<UNSTABLE_ANCHOR).map(([id])=>id);

function titanComponents(c){return c.fleet&&c.fleet.active!=='titan-old'?c.fleet.vehicles['titan-old']?.components:c.components;}

// Validates a choice without changing anything.
export function canChoose(c,id,option){
 const def=CHOICES[id],opt=def?.options?.[option];
 if(!opt)return {ok:false,message:'Escolha desconhecida.'};
 if(c.story?.choices?.[id])return {ok:false,message:'Esta decisão já foi tomada.'};
 if(chapterIndex(chapterOf(c))<chapterIndex(def.chapter))return {ok:false,message:'Ainda não é o momento desta decisão.'};
 if(opt.cost){const bag=c.inventory?.[opt.cost.bag];if(!bag)return {ok:false,message:'Inventário indisponível.'};
  for(const [k,n]of Object.entries(opt.cost.items))if(!Object.hasOwn(ITEMS,k)||!(bag[k]>=n))return {ok:false,message:'Recursos insuficientes para esta opção.'};}
 if(opt.component){const comp=titanComponents(c);if(!comp)return {ok:false,message:'O Titã não está na frota.'};
  for(const [k,d]of Object.entries(opt.component))if(!Number.isFinite(comp[k])||comp[k]+d<0)return {ok:false,message:'O Titã não tem essa peça em condições.'};}
 return {ok:true};
}
// Applies a choice once: cost, component change and record happen together.
export function choose(c,id,option){
 const gate=canChoose(c,id,option);if(!gate.ok)return gate;
 const opt=CHOICES[id].options[option];
 if(opt.cost)for(const [k,n]of Object.entries(opt.cost.items))c.inventory[opt.cost.bag][k]-=n;
 if(opt.component){const comp=titanComponents(c);for(const [k,d]of Object.entries(opt.component))comp[k]=Math.max(0,Math.min(100,comp[k]+d));}
 ensureStory(c).choices[id]=option;
 return {ok:true};
}
export const choiceOf=(c,id)=>c.story?.choices?.[id]??null;

// Relations derived from concrete events; nothing numeric is stored.
export function relationOf(c,npc){
 const q=c.network?.quests||{},ch=id=>choiceOf(c,id),met=(c.network?.visited||[]).includes(npc);
 switch(npc){
  case 'lia':return q.supply==='completed'?(ch('ch2-water-share')==='share'?'ally':'trusted'):q.supply==='accepted'||met?'known':'unknown';
  case 'afonso':return ch('ch3-brutus-toll')==='pay'?'wary':q.pump==='completed'?'trusted':q.pump==='accepted'||met?'known':'unknown';
  case 'noemia':return q.relay==='completed'?(ch('ch4-titan-part')==='give'?'ally':'trusted'):q.relay==='accepted'||met?'known':'unknown';
  case 'brutus':{const t=ch('ch3-brutus-toll');return t==='water'?'ally':t==='refuse'?'wary':t==='pay'?'known':'unknown';}
  default:return 'unknown';
 }
}

// Radio log: each transmission id is stored once, in order, capped.
export function logRadio(c,id){
 if(typeof id!=='string'||!id||id.length>60)return false;
 const s=ensureStory(c);if(s.radio.includes(id))return false;
 s.radio.push(id);if(s.radio.length>MAX_RADIO)s.radio.splice(0,s.radio.length-MAX_RADIO);return true;
}

export function validStory(s){
 if(s===undefined)return true;
 if(!plain(s)||s.version!==STORY_VERSION||!plain(s.scenes)||!plain(s.choices)||!Array.isArray(s.radio)||!plain(s.anchors))return false;
 if(Object.entries(s.scenes).some(([k,v])=>!SCENES.includes(k)||!['watched','skipped'].includes(v)))return false;
 if(Object.entries(s.choices).some(([k,v])=>!CHOICES[k]?.options?.[v]))return false;
 if(s.radio.length>MAX_RADIO||new Set(s.radio).size!==s.radio.length||s.radio.some(v=>typeof v!=='string'||!v||v.length>60))return false;
 return Object.entries(s.anchors).every(([k,v])=>CORES.some(x=>x.id===k)&&Number.isInteger(v)&&v>=0&&v<=100);
}
export {RELATIONS};

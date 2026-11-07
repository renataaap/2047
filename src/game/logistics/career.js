import {CAREER_LEVELS} from '../../data/contracts.js';
const ITEMS=['diesel','water','food','parts','scrap'];
const SKILLS=['fragile','heavy','regional','maintenance','planning'];
export function careerLevel(xp){return [...CAREER_LEVELS].reverse().find(l=>xp>=l.xp)||CAREER_LEVELS[0];}
export function createCareer(){return {version:1,xp:0,level:1,skills:Object.fromEntries(SKILLS.map(k=>[k,0])),stats:{completed:0,transportedMetres:0,goodDeliveries:0,special:0,regions:[],vehicles:{'titan-old':0,'dump-truck':0},resources:Object.fromEntries(ITEMS.map(k=>[k,0]))}};}
export function ensureCareer(c){if(!c.career)c.career=createCareer();return c.career;}
export function awardCareer(c,delivery){
 const p=ensureCareer(c);p.xp+=delivery.xp;p.level=careerLevel(p.xp).level;p.stats.completed++;
 p.stats.transportedMetres+=delivery.metres;if(delivery.integrity>=90)p.stats.goodDeliveries++;
 if(delivery.special)p.stats.special++;if(!p.stats.regions.includes(delivery.region))p.stats.regions.push(delivery.region);
 p.stats.vehicles[delivery.vehicle]++;for(const [k,n]of Object.entries(delivery.reward))p.stats.resources[k]+=n;
 p.skills[delivery.skill]++;if(delivery.integrity>=90)p.skills.planning++;
 return p;
}
const counter=n=>Number.isInteger(n)&&n>=0&&n<=1e8;
export function validCareer(p){return p===undefined||!!p&&p.version===1&&counter(p.xp)&&p.level===careerLevel(p.xp).level&&SKILLS.every(k=>counter(p.skills?.[k]))&&counter(p.stats?.completed)&&Number.isFinite(p.stats.transportedMetres)&&p.stats.transportedMetres>=0&&p.stats.transportedMetres<=1e10&&counter(p.stats.goodDeliveries)&&p.stats.goodDeliveries<=p.stats.completed&&counter(p.stats.special)&&p.stats.special<=p.stats.completed&&Array.isArray(p.stats.regions)&&new Set(p.stats.regions).size===p.stats.regions.length&&p.stats.regions.every(k=>['ashes','cities','salt','glass','storm'].includes(k))&&['titan-old','dump-truck'].every(k=>counter(p.stats.vehicles?.[k]))&&Object.values(p.stats.vehicles).reduce((a,b)=>a+b,0)===p.stats.completed&&ITEMS.every(k=>counter(p.stats.resources?.[k]));}

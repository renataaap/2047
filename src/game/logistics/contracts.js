import {CONTRACT_TEMPLATES,CARGO_TYPES,LOGISTICS_SITES,OFFER_PERIOD,OFFER_LIFETIME,CONTRACT_STATES} from '../../data/contracts.js';
import {VEHICLES} from '../garage/catalog.js';
import {ITEMS} from '../../data/campaign.js';
import {planRoute,ROUTE_PROFILES} from '../navigation/routePlanner.js';
import {capacity,manifestMass,seedOnBoard,suppliesMass} from './manifest.js';
import {ensureCareer,careerLevel,awardCareer,validCareer} from './career.js';
import {ensureEconomy,receiveRegionalDelivery,validEconomy} from '../economy/market.js';

const clone=v=>structuredClone(v);
const integral=(n,min=0,max=1e8)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
const plain=v=>v&&typeof v==='object'&&!Array.isArray(v);
const template=id=>CONTRACT_TEMPLATES.find(t=>t.id===id);
const fail=message=>{throw Error(message);};
export function ensureLogistics(c){
 ensureCareer(c);ensureEconomy(c);
 if(!c.logistics)c.logistics={version:1,clock:0,offers:{},active:null,cargo:null,closed:{},history:[],focus:'campaign',preference:'safe'};
 return c.logistics;
}
export const siteUnlocked=(c,s)=>!!s&&(!s.requires||c.cores?.[s.requires]?.state==='active');
export function compatibleVehicles(c,t){
 const ids=c.fleet?Object.keys(c.fleet.vehicles):['titan-old'];
 return ids.filter(id=>capacity(c,id,t.cargo,t.quantity,c.fleet?.vehicles[id]?.inventory||c.inventory.truck).ok);
}
function rewardFor(c,t,route){
 const km=route.distance/1000,fuel=Math.ceil(route.litres*2/5),wear=Math.ceil(km*.25+CARGO_TYPES[t.cargo].unitKg*t.quantity/2500),demand=c.economy.regions[LOGISTICS_SITES[t.destination].region].demand[CARGO_TYPES[t.cargo].resource]||10000;
 return {scrap:Math.max(4,3+fuel+wear+t.difficulty+Math.ceil(km*.6)+Math.max(0,Math.ceil((demand-10000)/1000))),parts:t.difficulty>=2?1:0};
}
export function refreshOffers(c,hub){
 const l=ensureLogistics(c),site=LOGISTICS_SITES[hub];if(!site?.board||!siteUnlocked(c,site))return [];
 const epoch=Math.floor(l.clock/OFFER_PERIOD),old=l.offers[hub]||[],next=[];
 for(const t of CONTRACT_TEMPLATES.filter(t=>t.hub===hub)){
  if(c.career.level<t.level||!siteUnlocked(c,LOGISTICS_SITES[t.origin])||!siteUnlocked(c,LOGISTICS_SITES[t.destination])||(l.closed[t.id]??-1)>=epoch||!compatibleVehicles(c,t).length)continue;
  const origin=LOGISTICS_SITES[t.origin],destination=LOGISTICS_SITES[t.destination],weight=CARGO_TYPES[t.cargo].unitKg*t.quantity;
  const route=planRoute(origin.bay,destination.destination,'safe',c,VEHICLES['titan-old'].mass+weight+(seedOnBoard(c)?2200:0));if(!route)continue;
  const id=`frete:${t.id}:${epoch}`,previous=old.find(o=>o.id===id);
  const minimumDistance=Math.min(route.distance,...['fast','economy'].map(profile=>planRoute(origin.bay,destination.destination,profile,c,VEHICLES['titan-old'].mass+weight)?.distance??Infinity));
  next.push(previous||{id,template:t.id,epoch,offeredAt:l.clock,expiresAt:epoch*OFFER_PERIOD+OFFER_LIFETIME,reward:rewardFor(c,t,route),route:{distance:route.distance,minimumDistance,seconds:route.seconds,litres:route.litres,risk:route.risk,roadTypes:route.roadTypes,surfaces:route.surfaces}});
 }
 l.offers[hub]=next;return next;
}
export function offerDetails(c,o){
 const t=template(o.template);if(!t)return null;
 return {...o,...t,id:o.id,template:t.id,originSite:LOGISTICS_SITES[t.origin],destinationSite:LOGISTICS_SITES[t.destination],cargoType:CARGO_TYPES[t.cargo],weight:t.quantity*CARGO_TYPES[t.cargo].unitKg,vehicles:compatibleVehicles(c,t),state:c.logistics?.active?.id===o.id?c.logistics.active.state:'available'};
}
export function acceptContract(c,hub,id,vehicle){
 const l=ensureLogistics(c);if(l.active)fail('Conclua ou devolva o frete ativo antes de assumir outro.');
 if(vehicle!==(c.fleet?.active||'titan-old')||c.fleet&&!c.fleet.vehicles[vehicle])fail('Prepare e ative um caminhão próprio antes de assumir o frete.');
 const o=refreshOffers(c,hub).find(o=>o.id===id);if(!o||o.expiresAt<l.clock)fail('A oferta expirou ou não está disponível neste quadro.');
 const t=template(o.template),gate=capacity(c,vehicle,t.cargo,t.quantity);if(!gate.ok)fail(gate.message);
 if(c.components.engine<35||c.components.tires<30)fail('Revise motor e pneus antes de assumir o transporte.');
 l.active={...clone(o),state:'awaiting_pickup',acceptedAt:l.clock,loadedAt:null,deadlineAt:null,metres:0,vehicle:null};l.focus='contract';return l.active;
}
export function parkingGate(site,position,yaw,state,vehicle='titan-old'){
 if(!site||!position||!Number.isFinite(yaw))return {ok:false,message:'Área de carga inválida.'};
 if(Math.abs(state.speed||0)>.2)return {ok:false,message:'Pare completamente dentro da faixa de carga.'};
 if(state.engineOn)return {ok:false,message:'Desligue o motor com E antes da operação.'};
 const b=site.bay,a=yaw-b.yaw,s=Math.sin(a),co=Math.cos(a),dx=position.x-b.x,dz=position.z-b.z;
 const x=dx*Math.cos(b.yaw)-dz*Math.sin(b.yaw),z=dx*Math.sin(b.yaw)+dz*Math.cos(b.yaw),w=vehicle==='dump-truck'?1.47:1.43,front=vehicle==='dump-truck'?3.76:4.06,back=vehicle==='dump-truck'?3.76:4.48;
 if(Math.abs(co)<Math.cos(b.alignment*Math.PI/180))return {ok:false,message:'Alinhe o caminhão às faixas. A entrada pode ser de frente ou de ré.'};
 for(const lx of [-w,w])for(const lz of [-front,back])if(Math.abs(x+lx*co+lz*s)>b.halfWidth-.08||Math.abs(z-lx*s+lz*co)>b.halfLength-.08)return {ok:false,message:'Mantenha o caminhão inteiro dentro da faixa de carga.'};
 return {ok:true,message:'Caminhão parado, alinhado e motor desligado.'};
}
export function loadContract(c,siteId,vehicle,gate){
 const l=ensureLogistics(c),a=l.active,t=a&&template(a.template);
 if(!a||a.state!=='awaiting_pickup'||l.cargo)fail('Não há uma coleta pendente.');
 if(vehicle!==(c.fleet?.active||'titan-old'))fail('A carga deve ser acomodada no veículo ativo.');
 if(siteId!==t.origin)fail('Procure o ponto de coleta indicado no manifesto.');
 if(!gate?.ok)fail(gate?.message||'Estacione na área de coleta.');
 const fit=capacity(c,vehicle,t.cargo,t.quantity);if(!fit.ok)fail(fit.message);
 l.cargo={contract:a.id,type:t.cargo,quantity:t.quantity,integrity:100,vehicle};a.state='transporting';a.vehicle=vehicle;a.loadedAt=l.clock;a.deadlineAt=t.deadlineSeconds?l.clock+t.deadlineSeconds:null;a.metres=0;l.focus='contract';return l.cargo;
}
export function contractTarget(c){
 const a=c.logistics?.active,t=a&&template(a.template);if(!t)return null;
 return LOGISTICS_SITES[a.state==='awaiting_pickup'?t.origin:t.destination];
}
export function contractRoutes(c,position,mass=9000){const s=contractTarget(c);return s?ROUTE_PROFILES.map(profile=>{const r=planRoute(position,s.destination,profile,c,mass);return r?{profile,distance:r.distance,seconds:r.seconds,litres:r.litres,risk:r.risk,surfaces:r.surfaces,roadTypes:r.roadTypes}:null;}).filter(Boolean):[];}
export function stepLogistics(c,dt,metres=0,damage=0,ready=false){
 const l=c.logistics;if(!l||!(dt>0)||!Number.isFinite(dt))return;
 l.clock=Math.min(1e8,l.clock+dt);const a=l.active,m=l.cargo;if(!a||!m)return;
 if(Number.isFinite(metres)&&metres>=0&&metres<3)a.metres=Math.min(1e9,a.metres+metres);
 if(Number.isFinite(damage)&&damage>0)m.integrity=Math.max(0,m.integrity-damage*CARGO_TYPES[m.type].fragility);
 if(m.integrity<CARGO_TYPES[m.type].minimumIntegrity)a.state='failed';
 else a.state=ready?'ready_for_delivery':'transporting';
}
export function deliveryQuote(c,siteId,gate){
 const l=c.logistics,a=l?.active,m=l?.cargo,t=a&&template(a.template);
 if(!a||!m||!t||a.state==='awaiting_pickup')return {ok:false,message:'Retire a carga antes de entregar.'};
 if(t.destination!==siteId)return {ok:false,message:'Este não é o destino do manifesto.'};
 if(!gate?.ok)return {ok:false,message:gate?.message||'Estacione na área de entrega.'};
 if(m.contract!==a.id||m.type!==t.cargo||m.quantity!==t.quantity)return {ok:false,message:'O lacre, a quantidade ou o manifesto não corresponde ao contrato.'};
 if(a.metres<Math.max(30,(a.route.minimumDistance??a.route.distance)*.55))return {ok:false,message:'O transporte físico entre origem e destino ainda não foi registrado.'};
 const failed=m.integrity<CARGO_TYPES[m.type].minimumIntegrity,late=a.deadlineAt!==null&&l.clock>a.deadlineAt,quality=.55+.45*m.integrity/100,factor=quality*(late?.8:1);
 const reward=failed?{scrap:0,parts:0}:Object.fromEntries(Object.entries(a.reward).map(([k,n])=>[k,Math.floor(n*factor)])),xp=failed?0:Math.floor(t.xp*(m.integrity>=90?1.2:1)*(late?.9:1));
 return {ok:true,failed,late,reward,xp,message:failed?'Carga avariada: registrar perda, sem pagamento ou XP.':late?'Entrega atrasada: prêmio reduzido em 20%.':'Carga conferida; pagamento será confirmado após salvar.'};
}
function rewardPlan(c,reward){
 const bags=clone(c.inventory),weight=b=>Object.entries(ITEMS).reduce((s,[k,v])=>s+bags[b][k]*v.weight,0);
 for(const [k,n]of Object.entries(reward)){if(!ITEMS[k]||!integral(n,0,500))return null;let left=n;for(const b of ['player','truck']){const room=Math.max(0,Math.min(500-bags[b][k],Math.floor(((b==='player'?40:240)-weight(b)+1e-7)/ITEMS[k].weight))),take=Math.min(left,room);bags[b][k]+=take;left-=take;}if(left)return null;}
 return bags;
}
function archive(c,a,outcome,extra={}){
 const l=c.logistics;l.closed[a.template]=Math.max(l.closed[a.template]??-1,a.epoch);
 l.history.unshift({id:a.id,template:a.template,epoch:a.epoch,outcome,endedAt:l.clock,metres:a.metres,vehicle:a.vehicle,...extra});l.history=l.history.slice(0,60);l.active=null;l.cargo=null;l.focus='campaign';
}
export function completeContract(c,siteId,gate){
 const l=ensureLogistics(c),a=l.active,q=deliveryQuote(c,siteId,gate);if(!q.ok)fail(q.message);
 if((l.closed[a.template]??-1)>=a.epoch)fail('Este contrato já foi encerrado.');
 const t=template(a.template),m=l.cargo;
 if(q.failed){archive(c,a,'failed',{integrity:m.integrity,reward:q.reward,xp:0});return q;}
 const bags=rewardPlan(c,q.reward);if(!bags)fail('Libere espaço nos suprimentos antes de receber o pagamento. A carga continua lacrada.');
 c.inventory=bags;awardCareer(c,{xp:q.xp,metres:a.metres,integrity:m.integrity,special:!!t.deadlineSeconds||t.difficulty>=3,region:LOGISTICS_SITES[t.destination].region,vehicle:m.vehicle,skill:CARGO_TYPES[m.type].specialization,reward:q.reward});
 receiveRegionalDelivery(c,LOGISTICS_SITES[t.destination],CARGO_TYPES[m.type].resource,t.quantity);
 archive(c,a,'completed',{integrity:m.integrity,reward:q.reward,xp:q.xp,late:q.late});return q;
}
export function cancelContract(c,siteId,gate){
 const l=ensureLogistics(c),a=l.active;if(!a)fail('Não há contrato ativo.');
 if(l.cargo&&(!LOGISTICS_SITES[siteId]||!gate?.ok))fail('Devolva a carga lacrada em qualquer área logística, parado e com motor desligado. Não é possível guardar a mercadoria do contrato.');
 archive(c,a,'cancelled',{integrity:l.cargo?.integrity??null,reward:{scrap:0,parts:0},xp:0});return true;
}
function validOffer(o){
 const t=o&&template(o.template);return !!t&&integral(o.epoch,0,1e7)&&o.id===`frete:${t.id}:${o.epoch}`&&Number.isFinite(o.offeredAt)&&o.offeredAt>=0&&Number.isFinite(o.expiresAt)&&o.expiresAt>=o.offeredAt&&plain(o.reward)&&Object.keys(o.reward).every(k=>['scrap','parts'].includes(k))&&integral(o.reward.scrap,0,500)&&integral(o.reward.parts,0,20)&&plain(o.route)&&['distance','seconds','litres','risk'].every(k=>Number.isFinite(o.route[k])&&o.route[k]>=0)&&o.route.distance<=100000;
}
export function validLogistics(c){
 const l=c.logistics;if(!validCareer(c.career)||!validEconomy(c.economy))return false;if(l===undefined)return c.career===undefined&&c.economy===undefined||!c.career||c.career.stats.completed===0;
 if(!plain(l)||l.version!==1||!Number.isFinite(l.clock)||l.clock<0||l.clock>1e8||!['campaign','contract'].includes(l.focus)||!ROUTE_PROFILES.includes(l.preference)||!plain(l.offers)||Object.keys(l.offers).some(id=>!LOGISTICS_SITES[id]?.board)||!plain(l.closed)||Object.entries(l.closed).some(([id,n])=>!template(id)||!integral(n,0,1e7))||!Array.isArray(l.history)||l.history.length>60)return false;
 if(Object.values(l.offers).some(list=>!Array.isArray(list)||list.length>2||list.some(o=>!validOffer(o))||new Set(list.map(o=>o.id)).size!==list.length))return false;
 const seen=new Set();for(const h of l.history){if(!h||!template(h.template)||!integral(h.epoch,0,1e7)||h.id!==`frete:${h.template}:${h.epoch}`||seen.has(h.id)||!['completed','failed','cancelled'].includes(h.outcome)||(l.closed[h.template]??-1)<h.epoch||!Number.isFinite(h.endedAt)||h.endedAt<0||h.endedAt>l.clock)return false;seen.add(h.id);}
 if(l.active===null)return l.cargo===null;
 const a=l.active;if(!validOffer(a)||!CONTRACT_STATES.includes(a.state)||!Number.isFinite(a.acceptedAt)||a.acceptedAt<0||a.acceptedAt>l.clock||!Number.isFinite(a.metres)||a.metres<0||a.metres>1e9||(l.closed[a.template]??-1)>=a.epoch)return false;
 if(a.state==='awaiting_pickup')return l.cargo===null&&a.vehicle===null&&a.loadedAt===null&&a.deadlineAt===null;
 const m=l.cargo,t=template(a.template);if(!m||m.contract!==a.id||m.type!==t.cargo||m.quantity!==t.quantity||!Number.isFinite(m.integrity)||m.integrity<0||m.integrity>100||m.vehicle!==a.vehicle||!VEHICLES[m.vehicle]||c.fleet&&m.vehicle!==c.fleet.active||!capacity(c,m.vehicle,m.type,m.quantity).ok)return false;
 return Number.isFinite(a.loadedAt)&&a.loadedAt>=a.acceptedAt&&a.loadedAt<=l.clock&&(a.deadlineAt===null||Number.isFinite(a.deadlineAt)&&a.deadlineAt>a.loadedAt)&&manifestMass(m)>0;
}

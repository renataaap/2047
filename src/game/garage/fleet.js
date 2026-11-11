import {capacity} from '../logistics/manifest.js';
import {VEHICLES,SKINS,ACCESSORIES,UPGRADES,defaultPaint,defaultInterior,GARAGE} from './catalog.js';
import {ITEMS} from '../../data/campaign.js';
const copy=v=>structuredClone(v);
const EMPTY={diesel:0,water:0,food:0,parts:0,scrap:0};
const COMPONENTS=['engine','radiator','tires','suspension','transmission','tank','filters','frame'];
export function newVehicle(id,components=Object.fromEntries(COMPONENTS.map(k=>[k,70])),inventory=EMPTY,fuel=0){return {id,paint:defaultPaint(),interior:defaultInterior(),ownedSkins:['original'],ownedAccessories:[],accessories:[],ownedUpgrades:[],upgrades:[],components:copy(components),inventory:copy(inventory),fuel,temperature:26};}
export function ensureFleet(c,state){
 if(!c.fleet)c.fleet={version:1,active:'titan-old',vehicles:{'titan-old':newVehicle('titan-old',c.components,c.inventory.truck,state.fuel)},transactions:0};
 return c.fleet;
}
export function captureFleet(c,state){const f=ensureFleet(c,state),v=f.vehicles[f.active];v.components=copy(c.components);v.inventory=copy(c.inventory.truck);v.fuel=state.fuel;v.temperature=state.temperature;return f;}
export function garageAccess(position,state){
 if(Math.abs(position.x-GARAGE.x)>GARAGE.halfWidth||Math.abs(position.z-GARAGE.z)>GARAGE.halfLength)return {ok:false,message:'Estacione dentro da faixa de manutenção da garagem de Cinza Nova.'};
 if(Math.abs(state.speed||0)>.2)return {ok:false,message:'Pare completamente antes de abrir os serviços.'};
 if(state.engineOn)return {ok:false,message:'Desligue o motor com E antes de iniciar o serviço.'};
 return {ok:true,message:'Garagem municipal · serviços disponíveis'};
}
export function available(c){return Object.fromEntries(Object.keys(EMPTY).map(k=>[k,(c.inventory.player[k]||0)+(c.inventory.truck[k]||0)]));}
export function canPay(c,cost){const a=available(c);return Object.entries(cost).every(([k,n])=>Number.isFinite(n)&&n>=0&&a[k]>=n);}
function spend(c,cost){if(!canPay(c,cost))throw Error('Recursos insuficientes na mochila e no compartimento do caminhão.');for(const [k,n]of Object.entries(cost)){const p=Math.min(c.inventory.player[k],n);c.inventory.player[k]-=p;c.inventory.truck[k]-=n-p;}}
export function quote(c,kind,id,draft){
 const f=c.fleet,v=f.vehicles[f.active];
 if(kind==='paint'){if(!SKINS[draft?.skin])throw Error('Pintura desconhecida');return v.ownedSkins.includes(draft.skin)?JSON.stringify(v.paint)===JSON.stringify(draft)?{}:draft.main===SKINS[draft.skin].main&&draft.secondary===SKINS[draft.skin].secondary?{}:{scrap:1}:SKINS[draft.skin].cost;}
 if(kind==='interior')return JSON.stringify(v.interior)===JSON.stringify(draft)?{}:{scrap:1};
 if(kind==='accessory'){if(!ACCESSORIES[id])throw Error('Acessório incompatível');return v.ownedAccessories.includes(id)?{}:ACCESSORIES[id].cost;}
 if(kind==='upgrade'){if(!UPGRADES[id])throw Error('Melhoria desconhecida');return v.ownedUpgrades.includes(id)?{}:UPGRADES[id].cost;}
 if(kind==='buy'){if(!VEHICLES[id]||id==='titan-old')throw Error('Veículo indisponível');if(f.vehicles[id])throw Error('Este caminhão já pertence à frota.');return VEHICLES[id].cost;}
 if(kind==='repair'){if(!COMPONENTS.includes(id)||c.components[id]>=100)throw Error('Componente sem reparo pendente');return {parts:3,scrap:2};}
 if(kind==='fuel'){const n=Math.min(4,180-c.fleet.vehicles[c.fleet.active].fuel,available(c).diesel);if(n<=0)throw Error('Sem diesel disponível ou tanque cheio');return {diesel:n};}
 throw Error('Serviço desconhecido');
}
export function purchase(c,state,kind,id,draft){
 captureFleet(c,state);const f=c.fleet,v=f.vehicles[f.active],cost=quote(c,kind,id,draft);
 if(kind==='paint'&&!validPaint(draft)||kind==='interior'&&!validInterior(draft))throw Error('Configuração visual inválida');
 spend(c,cost);
 if(kind==='paint'){v.paint=copy(draft);if(!v.ownedSkins.includes(draft.skin))v.ownedSkins.push(draft.skin);}
 if(kind==='interior')v.interior=copy(draft);
 if(kind==='accessory'){if(!v.ownedAccessories.includes(id))v.ownedAccessories.push(id);v.accessories=v.accessories.includes(id)?v.accessories.filter(k=>k!==id):[...v.accessories,id];}
 if(kind==='upgrade'){if(!v.ownedUpgrades.includes(id))v.ownedUpgrades.push(id);v.upgrades=v.upgrades.includes(id)?v.upgrades.filter(k=>k!==id):[...v.upgrades,id];}
 if(kind==='buy')f.vehicles[id]=newVehicle(id);
 if(kind==='repair')c.components[id]=100;
 if(kind==='fuel')state.fuel+=cost.diesel;
 f.transactions++;captureFleet(c,state);return cost;
}
export function selectVehicle(c,state,id){
 captureFleet(c,state);const f=c.fleet,v=f.vehicles[id];if(!v||!VEHICLES[id])throw Error('Veículo não pertence à frota.');if(id===f.active)return false;
 const cargo=c.logistics?.cargo;if(cargo){const fit=capacity(c,id,cargo.type,cargo.quantity,v.inventory);if(!fit.ok)throw Error(fit.message);}
 const payload=c.network?.cargo||c.seed.received&&c.stage!=='activated'?2200:0;
 if(payload+Object.entries(v.inventory).reduce((s,[k,n])=>s+n*ITEMS[k].weight,0)>VEHICLES[id].cargoCapacity)throw Error('Carga incompatível com o veículo escolhido.');
 if(cargo){cargo.vehicle=id;c.logistics.active.vehicle=id;}
 f.active=id;c.components=copy(v.components);c.inventory.truck=copy(v.inventory);state.fuel=v.fuel;state.temperature=v.temperature;return true;
}
const plain=o=>o&&typeof o==='object'&&!Array.isArray(o),bounded=(v,a,b)=>Number.isFinite(v)&&v>=a&&v<=b;
const color=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
export function validPaint(v){return plain(v)&&Object.hasOwn(SKINS,v.skin)&&color(v.main)&&color(v.secondary)&&['original','fosco','acetinado'].includes(v.finish)&&bounded(v.wear,0,1);}
export function validInterior(v){return plain(v)&&color(v.seat)&&color(v.panel);}
function ids(value,allowed){return Array.isArray(value)&&value.length<=Object.keys(allowed).length&&new Set(value).size===value.length&&value.every(k=>Object.hasOwn(allowed,k));}
export function validFleet(c,state){
 const f=c.fleet;if(f===undefined)return true;
 if(!plain(f)||f.version!==1||!Object.hasOwn(VEHICLES,f.active)||!plain(f.vehicles)||!Object.hasOwn(f.vehicles,'titan-old')||!Object.hasOwn(f.vehicles,f.active)||Object.keys(f.vehicles).length>2||!Number.isInteger(f.transactions)||!bounded(f.transactions,0,1e7))return false;
 if(f.garage!==undefined&&(!plain(f.garage)||!bounded(f.garage.distance,5.5,16)||!bounded(f.garage.angle,-10000,10000)||!bounded(f.garage.elevation,.08,.7)||!['orbit','front','rear','side','interior'].includes(f.garage.view)))return false;
 for(const [id,v]of Object.entries(f.vehicles)){
  if(!Object.hasOwn(VEHICLES,id)||!plain(v)||v.id!==id||!validPaint(v.paint)||!validInterior(v.interior)||!ids(v.ownedSkins,SKINS)||!v.ownedSkins.includes('original')||!v.ownedSkins.includes(v.paint.skin))return false;
  for(const [owned,equipped,allowed]of [['ownedAccessories','accessories',ACCESSORIES],['ownedUpgrades','upgrades',UPGRADES]])if(!ids(v[owned],allowed)||!ids(v[equipped],allowed)||v[equipped].some(k=>!v[owned].includes(k)))return false;
  if(!plain(v.components)||COMPONENTS.some(k=>!bounded(v.components[k],0,100))||!plain(v.inventory)||Object.keys(EMPTY).some(k=>!bounded(v.inventory[k],0,500))||!bounded(v.fuel,0,180)||!bounded(v.temperature,0,180))return false;
  if(Object.keys(v.inventory).some(k=>!Object.hasOwn(EMPTY,k))||Object.entries(v.inventory).reduce((s,[k,n])=>s+ITEMS[k].weight*n,0)>240+.00001)return false;
 }
 const active=f.vehicles[f.active];return COMPONENTS.every(k=>active.components[k]===c.components[k])&&Object.keys(EMPTY).every(k=>active.inventory[k]===c.inventory.truck[k])&&Math.abs(active.fuel-state.fuel)<1e-6;
}

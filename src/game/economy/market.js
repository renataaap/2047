import {ITEMS} from '../../data/campaign.js';
import {OFFERS,POIS} from '../../data/expedition.js';
import {GAS_OFFERS,LITERS_PER_SCRAP,WORKSHOP_OFFERS,WORKSHOP_SERVICES,WORKSHOP_SELL} from '../../data/road.js';
import {ROAD_POINTS} from '../../data/roadSites.js';
import {SHELTERS,biomeAt} from '../../data/network.js';
import {recoveryAt} from '../restoration/progress.js';

const GOODS=['diesel','water','food','parts','scrap','service'];
export const REGIONAL_TARIFFS={
 ashes:{diesel:10000,water:10000,food:10000,parts:10000,scrap:10000,service:10000},
 cities:{diesel:10500,water:11000,food:11000,parts:9000,scrap:8500,service:9500},
 salt:{diesel:11500,water:14000,food:11500,parts:12000,scrap:11000,service:11500},
 glass:{diesel:12000,water:11500,food:12000,parts:12500,scrap:11500,service:12000},
 storm:{diesel:12500,water:12000,food:12500,parts:13500,scrap:12000,service:12500},
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const integer=(n,min=0,max=1e8)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
const sites=[...ROAD_POINTS,...POIS,...SHELTERS];
export const marketSite=id=>sites.find(p=>p.id===id)||null;
export function createEconomy(){return {version:1,tariffs:structuredClone(REGIONAL_TARIFFS),regions:Object.fromEntries(Object.keys(REGIONAL_TARIFFS).map(id=>[id,{deliveries:0,demand:{water:10000,food:10000,parts:10000},supplied:{water:0,food:0,parts:0}}])),buybacks:{},transactions:0};}
export function ensureEconomy(c){if(!c.economy)c.economy=createEconomy();return c.economy;}
export function priceFactors(c,site,item,stock=null,capacity=null){
 const region=site?.region||biomeAt(site?.z||0);
 if(!c.economy)return {region,basisPoints:10000,scarcity:0,recovery:0,demand:10000};
 const tariff=c.economy.tariffs[region]?.[item]??10000;
 const scarcity=capacity>0&&stock!==null?Math.round(clamp((capacity-stock)/capacity,0,1)*2500):0;
 const local=recoveryAt(c,site?.x||0,site?.z||0);
 const recovery=Math.round((item==='water'?1000:item==='service'?400:600)*(local.amount||0)*clamp((local.age||0)/240,0,1));
 const demand=c.economy.regions[region]?.demand[item]??10000;
 const basisPoints=clamp(Math.ceil(tariff*(10000+scarcity-recovery)/10000*demand/10000),7500,17500);
 return {region,basisPoints,scarcity,recovery,demand};
}
export function quotePrice(c,{site,item,quantity,baseQuantity=1,baseCost,stock=null,capacity=null,selling=false}){
 if(!site||!GOODS.includes(item)||!integer(quantity,1,10000)||!integer(baseQuantity,1,10000)||!integer(baseCost,1,10000)||stock!==null&&!integer(stock))return {ok:false,message:'Cotação inválida.'};
 const factors=priceFactors(c,site,item,stock,capacity),numerator=baseCost*quantity*factors.basisPoints,denominator=baseQuantity*10000;
 // Purchases round upward, buybacks downward and below the cheapest retail
 // pair. No fractional currency or arithmetic residue is stored in a wallet.
 const cost=selling?Math.max(1,Math.min(WORKSHOP_SELL.scrap,Math.floor(numerator/denominator))):Math.ceil(numerator/denominator);
 return {ok:stock===null||stock>=quantity,cost,quantity,item,factors,message:`${factors.region} · estoque e restauração incluídos na cotação`};
}
export function canExchange(c,bag,cost={},reward={}){
 if(!['player','truck'].includes(bag))return false;const next={...c.inventory[bag]};
 for(const [k,n]of Object.entries(cost)){if(!Object.hasOwn(ITEMS,k)||!integer(n)||next[k]<n)return false;next[k]-=n;}
 for(const [k,n]of Object.entries(reward)){if(!Object.hasOwn(ITEMS,k)||!integer(n))return false;next[k]+=n;}
 return Object.keys(ITEMS).every(k=>Number.isFinite(next[k])&&next[k]>=0&&next[k]<=500)&&Object.entries(ITEMS).reduce((sum,[k,v])=>sum+next[k]*v.weight,0)<=(bag==='player'?40:240)+1e-7;
}
export function exchange(c,bag,cost={},reward={}){if(!canExchange(c,bag,cost,reward))return false;for(const [k,n]of Object.entries(cost))c.inventory[bag][k]-=n;for(const [k,n]of Object.entries(reward))c.inventory[bag][k]+=n;return true;}
export function recordTrade(c,site,payment,selling=false){if(!c.economy)return;const e=c.economy;e.transactions++;e.buybacks[site.id]=clamp((e.buybacks[site.id]??20)+(selling?-payment:payment),0,50);}

export function gasQuote(c,state,siteId,offerId){
 const site=ROAD_POINTS.find(p=>p.id===siteId&&p.kind==='gas'),offer=GAS_OFFERS.find(p=>p.id===offerId),stock=c.road?.stocks?.[siteId];
 if(!site||!offer||!stock)return {ok:false,cost:0,message:'Oferta indisponível.'};
 const item=offer.kind==='water'?'water':'diesel',maximum=site.stock[item],scrap=c.inventory.player.scrap;
 if(offer.kind==='water'){
  const q=quotePrice(c,{site,item,quantity:offer.quantity,baseQuantity:offer.quantity,baseCost:offer.cost,stock:stock.water,capacity:maximum});return {...q,need:false,ok:q.ok&&canExchange(c,'player',{scrap:q.cost},{water:q.quantity})};
 }
 const tank=offer.kind==='tank',limit=Math.floor(Math.min(offer.liters,stock.diesel,tank?180-state.fuel:500));
 for(let n=limit;n>=1;n--){
  const q=quotePrice(c,{site,item,quantity:n,baseQuantity:LITERS_PER_SCRAP,baseCost:1,stock:stock.diesel,capacity:maximum});
  // A can is a fixed quantity, except when the supplier has less diesel.
  if(q.ok&&scrap>=q.cost&&(!tank?canExchange(c,'player',{scrap:q.cost},{diesel:n}):true))return {...q,need:tank,liters:n};
  if(!tank)break;
 }
 return {ok:false,cost:0,quantity:0,liters:0,need:tank,message:'Saldo, espaço, tanque ou estoque insuficiente.'};
}
export function shopQuote(c,siteId,offerId){
 const site=ROAD_POINTS.find(p=>p.id===siteId&&p.kind==='workshop'),offer=WORKSHOP_OFFERS.find(o=>o.id===offerId),stock=c.road?.stocks?.[siteId];
 if(!site||!offer||!stock)return {ok:false,cost:0};const q=quotePrice(c,{site,item:offer.item,quantity:offer.quantity,baseQuantity:offer.quantity,baseCost:offer.cost,stock:stock[offer.item],capacity:site.stock[offer.item]});
 return {...q,ok:q.ok&&canExchange(c,'player',{scrap:q.cost},{[offer.item]:offer.quantity})};
}
export function serviceQuote(c,siteId,serviceId,component){
 const site=ROAD_POINTS.find(p=>p.id===siteId&&p.kind==='workshop'),service=WORKSHOP_SERVICES.find(s=>s.id===serviceId);
 if(!site||!service||!Number.isFinite(c.components[component]))return {ok:false,cost:0};
 const q=quotePrice(c,{site,item:'service',quantity:1,baseCost:service.cost});return {...q,ok:q.ok&&c.components[component]<100&&c.inventory.player.scrap>=q.cost,gain:service.gain};
}
export function provisionQuote(c,siteId,item){
 const site=marketSite(siteId),offer=Object.hasOwn(OFFERS,item)?OFFERS[item]:null,stock=siteId==='ivani'?c.expedition?.stock:c.network?.stocks?.[siteId];
 if(!site||!offer||!stock)return {ok:false,cost:0};
 const q=quotePrice(c,{site,item,quantity:offer.quantity,baseQuantity:offer.quantity,baseCost:offer.cost,stock:stock[item],capacity:siteId==='ivani'?offer.stock:item==='diesel'?40:16});
 return {...q,ok:q.ok&&canExchange(c,'player',{scrap:q.cost},{[item]:q.quantity})};
}
export function sellQuote(c,siteId){
 const site=marketSite(siteId);if(!site)return {ok:false,cost:0};
 const q=quotePrice(c,{site,item:'parts',quantity:2,baseQuantity:2,baseCost:2,selling:true}),budget=c.economy?.buybacks?.[siteId]??20;
 return {...q,ok:q.ok&&(!c.economy||budget>=q.cost)&&canExchange(c,'player',{parts:2},{scrap:q.cost})};
}
export function receiveRegionalDelivery(c,site,item,quantity){
 const e=ensureEconomy(c),r=e.regions[site.region];r.deliveries++;
 if(Object.hasOwn(r.demand,item)){r.supplied[item]=Math.min(100000,r.supplied[item]+quantity);r.demand[item]=Math.max(8000,r.demand[item]-Math.min(300,quantity*50));}
 // The shipment is for community use. Only a small, finite reserve is offered
 // through existing shops; activating a core never creates trade stock.
 const road=c.road?.stocks?.[site.destination],network=c.network?.stocks?.[site.destination],exp=site.id==='ivani'?c.expedition?.stock:null,stock=road||network||exp;
 if(stock&&Object.hasOwn(stock,item))stock[item]=Math.min(road?200:100,stock[item]+Math.min(4,quantity));
}
// Delivered goods ease local demand only for a while: each offer epoch of
// active simulation moves demand back toward the 10000 reference, so supplied
// regions do not stay permanently discounted.
export const DEMAND_RECOVERY_PER_EPOCH=500
export function relaxDemand(c,epochs=1){
 const e=c.economy
if(!e||!Number.isSafeInteger(epochs)||epochs<1)return
 const step=Math.min(4000,epochs*DEMAND_RECOVERY_PER_EPOCH)
 for(const r of Object.values(e.regions))for(const k of Object.keys(r.demand))r.demand[k]=r.demand[k]<10000?Math.min(10000,r.demand[k]+step):Math.max(10000,r.demand[k]-step)
}
export function validEconomy(e){
 if(e===undefined)return true;if(!e||e.version!==1||!integer(e.transactions)||!e.tariffs||!e.regions||!e.buybacks||Array.isArray(e.buybacks))return false;
 for(const id of Object.keys(REGIONAL_TARIFFS)){const r=e.regions[id];if(!r||!integer(r.deliveries)||!GOODS.every(k=>integer(e.tariffs[id]?.[k],7500,17500)))return false;for(const k of ['water','food','parts'])if(!integer(r.demand?.[k],8000,12000)||!integer(r.supplied?.[k],0,100000))return false;}
 return Object.keys(e.buybacks).length<=sites.length&&Object.entries(e.buybacks).every(([id,n])=>!!marketSite(id)&&integer(n,0,50));
}

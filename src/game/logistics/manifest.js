import {VEHICLES} from '../garage/catalog.js';
import {ITEMS} from '../../data/campaign.js';
import {CARGO_TYPES} from '../../data/contracts.js';
// Coordinates are in each homologated chassis's local metres. The rear strip
// remains independent from the ignition cradle (which ends at z=2.70).
export const CARGO_BEDS={
 'titan-old':{width:2.0,floor:.18,front:-.8,back:4.28,height:1.85,rearCenter:3.72},
 'dump-truck':{width:1.85,floor:.20,front:-1.03,back:3.37,height:1.6,rearCenter:3.055},
};
export function seedOnBoard(c){return !!c.network?.cargo||!!c.seed?.received&&c.stage!=='activated';}
export function suppliesMass(bag={}){return Object.entries(ITEMS).reduce((n,[k,v])=>n+(bag[k]||0)*v.weight,0);}
export function manifestMass(m){const t=CARGO_TYPES[m?.type];return t?m.quantity*t.unitKg:0;}
export function cargoPlacement(c,vehicle,type){
 const bed=CARGO_BEDS[vehicle],t=CARGO_TYPES[type];if(!bed||!t)return null;
 const seed=seedOnBoard(c),centerZ=seed?bed.rearCenter:(bed.front+bed.back)/2;
 const fits=t.width<=bed.width&&t.height<=bed.height&&centerZ-t.depth/2>=(seed?2.72:bed.front)&&centerZ+t.depth/2<=bed.back;
 return fits?{center:[0,bed.floor+t.height/2,centerZ],dimensions:[t.width,t.height,t.depth],floor:bed.floor,seedReserved:seed}:null;
}
export function capacity(c,vehicle,type,quantity,bag=c.inventory?.truck){
 const v=VEHICLES[vehicle],t=CARGO_TYPES[type],weight=t?quantity*t.unitKg:0,seed=seedOnBoard(c)?2200:0,supplies=suppliesMass(bag),occupied=seed+supplies+weight;
 if(!v||!t||!Number.isInteger(quantity)||quantity<1||quantity>12)return {ok:false,code:'invalid',message:'Mercadoria ou veículo inválido.'};
 if(occupied>v.cargoCapacity+.00001)return {ok:false,code:'mass',message:`O berço suporta ${v.cargoCapacity} kg; Semente, suprimentos e frete somam ${Math.ceil(occupied)} kg.`,occupied,limit:v.cargoCapacity};
 const placement=cargoPlacement(c,vehicle,type);if(!placement)return {ok:false,code:'volume',message:'Esta mercadoria não cabe com o berço ocupado. Preserve a Semente; descarregue o frete ou escolha outra carga.',occupied,limit:v.cargoCapacity};
 return {ok:true,message:'Peso e acomodação compatíveis.',occupied,limit:v.cargoCapacity,weight,seedMass:seed,suppliesMass:supplies,placement};
}
export function commercialPayload(c,vehicle){
 const m=c.logistics?.cargo;if(!m||m.vehicle!==vehicle)return {mass:0};
 const p=cargoPlacement(c,vehicle,m.type);return p?{mass:manifestMass(m),center:p.center,dimensions:p.dimensions}:{mass:0};
}
export function canReceiveSeed(c){
 const m=c.logistics?.cargo;if(!m)return {ok:true};
 const next={...c,network:{...c.network,cargo:'reserved-seed'}};
 const gate=capacity(next,m.vehicle,m.type,m.quantity);return gate.ok?gate:{...gate,message:'O frete ocupa o berço da Semente. Devolva-o em um depósito logístico (o Abrigo 07 também recebe devoluções) para continuar a campanha.'};
}

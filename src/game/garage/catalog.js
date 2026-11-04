import {TRUCK_TUNING} from '../../data/truck-tuning.js';
export const GARAGE={id:'garagem-cinza-nova',x:-320,z:-814,halfWidth:6,halfLength:11,desk:{x:-326,z:-806}};
export const TITAN_WHEELS=[-2.5,1.45,2.9].flatMap(z=>[-1,1].map(s=>({x:s*1.2,y:-.1,z})));
export const VEHICLES={
 'titan-old':{id:'titan-old',name:'Titã Rocha Clara',description:'O companheiro de Dante. Chassi rodoviário, oito marchas e berço de restauração.',mass:8800,torque:1600,cargoCapacity:6000,fuelCapacity:180,wheelRadius:.61,wheelPoints:TITAN_WHEELS,front:-4.05,cockpitOffset:[0,0,0],cost:{},colliders:[[1.12,.45,3.9,0,0,0],[1.18,1.1,1.08,0,1.15,-2.65]]},
 'dump-truck':{id:'dump-truck',name:'Basculante Municipal',description:'Recuperado do serviço de obras. Mais leve, seis marchas curtas e pneus de trabalho. Tanque entregue vazio.',mass:6500,torque:1050,cargoCapacity:3200,fuelCapacity:180,wheelRadius:.547,wheelPoints:[-2.409,.817,2.329].flatMap(z=>[-1,1].map(s=>({x:s*.906,y:-.033,z}))),front:-3.76,cockpitOffset:[0,0,.35],cost:{parts:8,scrap:6},colliders:[[1.06,.35,3.5,0,-.02,0],[1.1,.82,1.0,0,.65,-2.4]]},
};
export const SKINS={
 original:{id:'original',name:'Titã Original',main:'#b9af87',secondary:'#414840',finish:'original',wear:.65,cost:{}},
 aurora:{id:'aurora',name:'Aurora Azul',main:'#124a60',secondary:'#d9d5b7',finish:'acetinado',wear:.24,cost:{scrap:2}},
 cinzas:{id:'cinzas',name:'Cinzas Vermelhas',main:'#8f2520',secondary:'#d8bc85',finish:'fosco',wear:.48,cost:{scrap:3}},
};
export const ACCESSORIES={
 guard:{id:'guard',name:'Proteção tubular frontal',description:'Tubos e suportes presos ao para-choque; não aumenta o colisor.',cost:{scrap:2}},
 lamps:{id:'lamps',name:'Faróis auxiliares',description:'Dois projetores acompanham L. Sem sombras extras para preservar o orçamento gráfico.',cost:{scrap:2,parts:1}},
 rack:{id:'rack',name:'Suporte de manutenção',description:'Suporte lateral com recipiente vazio e fixações. Não concede recursos.',cost:{scrap:1,parts:1}},
};
export const UPGRADES={
 engine:{id:'engine',name:'Ajuste da bomba diesel',description:'+12% de torque; consumo específico +5%.',cost:{parts:3}},
 tires:{id:'tires',name:'Pneus de estrada de terra',description:'+18% de aderência em terra; resistência no asfalto +10%.',cost:{parts:2,scrap:1}},
 suspension:{id:'suspension',name:'Feixe de molas reforçado',description:'+18% de rigidez; rodagem mais firme sem carga.',cost:{parts:2}},
};
export const defaultPaint=()=>({skin:'original',main:SKINS.original.main,secondary:SKINS.original.secondary,finish:'original',wear:.65});
export const defaultInterior=()=>({seat:'#c2bba3',panel:'#c9c7b2'});
export function vehicleTuning(id='titan-old',upgrades=[]){
 const t=structuredClone(TRUCK_TUNING),v=VEHICLES[id];if(!v)throw Error('Veículo não homologado');
 if(id!=='titan-old'){
  Object.assign(t,{chassisMass:v.mass,wheelRadius:v.wheelRadius,wheelbase:3.982,track:1.812});
  t.engine.torqueCurve=t.engine.torqueCurve.map(([rpm,nm])=>[rpm,nm*1050/1600]);t.engine.kgPerKwh=.265;
  t.transmission.ratios=[7.7,5.6,4.05,2.93,2.12,1.54];t.transmission.finalDrive=4.4;t.transmission.maxAxleTorque=11500;
  t.dynamics.maxSpeed=21;t.dynamics.serviceBrakeForce=43000;t.dynamics.dragArea=5.7;t.suspension.stiffness=31;
 }
 if(upgrades.includes('engine')){t.engine.torqueCurve=t.engine.torqueCurve.map(([r,n])=>[r,n*1.12]);t.engine.kgPerKwh*=1.05;t.transmission.maxAxleTorque*=1.12;}
 if(upgrades.includes('tires')){t.surfaces.terra.grip*=1.18;t.surfaces.lama.grip*=1.15;t.surfaces.asfalto.rolling*=1.1;}
 if(upgrades.includes('suspension')){t.suspension.stiffness*=1.18;t.suspension.compression*=1.1;}
 return t;
}
export function vehicleStats(id,upgrades=[]){const t=vehicleTuning(id,upgrades),v=VEHICLES[id];return {mass:t.chassisMass,torque:Math.max(...t.engine.torqueCurve.map(p=>p[1])),gears:t.transmission.ratios.length,wheels:v.wheelPoints.length,cargoCapacity:v.cargoCapacity,fuelCapacity:v.fuelCapacity,stiffness:t.suspension.stiffness,dirtGrip:t.surfaces.terra.grip,specificConsumption:t.engine.kgPerKwh};}

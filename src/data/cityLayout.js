import {PILOT_CITY,CITY_GAS} from './roadNetwork.js';
// Footprints are shared by construction, save recovery and clearance tests.
export const CITY_BUILDINGS=[
 {id:'casa-portico',kind:'house',x:-286,z:-660,width:19,depth:20,height:6.3,occupied:true},
 {id:'mercearia',kind:'store',x:-177,z:-827,width:22,depth:26,height:7,occupied:true},
 {id:'predio-vazio',kind:'tenement',x:-292,z:-965,width:28,depth:24,height:13,occupied:false},
 {id:'moradia-oeste',kind:'house',x:-401,z:-693,width:20,depth:30,height:5.5,occupied:true},
 {id:'deposito-antigo',kind:'warehouse',x:-402,z:-757,width:22,depth:30,height:7,occupied:false},
 {id:'fabrica',kind:'factory',x:-402,z:-871,width:22,depth:28,height:10,occupied:false},
 {id:'estacao-municipal',kind:'store',x:-178,z:-650,width:22,depth:18,height:5.5,occupied:true},
 {id:'garagem',kind:'garage',x:-320,z:-822,width:40,depth:44,height:7,occupied:false},
 {id:'armazem-industrial',kind:'warehouse',x:-76,z:-820,width:35,depth:46,height:9,occupied:false},
];
export const CITY_ENTRY_POINTS=[{x:-120,z:-620},{x:-240,z:-900}];
export const CITY_WALK_POINTS={garage:{x:-320,z:-792},notice:{x:-310,z:-690},loading:{x:-388,z:-809}};
// New saved positions must also avoid the open garage's walls and the new
// station shell/pumps. The garage bay itself remains a valid parking space.
const RECOVERY_SOLIDS=[...CITY_BUILDINGS.filter(b=>b.kind!=='garage'),
 {x:-340,z:-822,width:.32,depth:44},{x:-300,z:-822,width:.32,depth:44},
 {x:-320,z:-844,width:40,depth:.32},
 {x:-335,z:-800,width:10,depth:.35},{x:-305,z:-800,width:10,depth:.35},
 {x:CITY_GAS.x-4.5,z:CITY_GAS.z,width:5.2,depth:8.2},
 ...[-2.6,2.6].map(dz=>({x:CITY_GAS.x+3,z:CITY_GAS.z+dz,width:.8,depth:.7})),
 ...[-.3,6.9].flatMap(dx=>[-5.6,5.6].map(dz=>({x:CITY_GAS.x+dx,z:CITY_GAS.z+dz,width:.35,depth:.35}))),
 ...[-830,-813].map(z=>({x:-413,z,width:5,depth:11}))];
export const inCityBuilding=(x,z,margin=0)=>RECOVERY_SOLIDS.some(b=>Math.abs(x-b.x)<b.width/2+margin&&Math.abs(z-b.z)<b.depth/2+margin);
export const CITY_NAME=PILOT_CITY.name;

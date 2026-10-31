import {ROAD_POINTS} from './road.js';
import {SHELTERS,NETWORK_POINTS} from './network.js';
import {POIS} from './expedition.js';
import {POINTS} from './campaign.js';

// Authored sites, not random rewards. Coordinates keep the original quest anchors intact.
export const DISCOVERY_SITES=[
 {id:'motel',name:'Motel Última Luz',kind:'motel',x:-30,z:-380,width:16,depth:8,terminal:{x:-34,z:-377.6},radius:24,reward:{water:2,food:1},action:'Recolher reserva lacrada',information:'A reserva da recepção continua lacrada. Os quartos e a área comum mostram a interrupção da última viagem.'},
 {id:'yard',name:'Pátio dos Retornantes',kind:'yard',x:-57,z:-2020,width:26,depth:18,terminal:{x:-50,z:-2017},radius:28,reward:{parts:2,scrap:3},action:'Recolher peças separadas',information:'Uma caçamba ficou sobre os cavaletes. As peças separadas no balcão ainda podem ser aproveitadas; o caminhão permanece imobilizado.'},
 {id:'weighbridge',name:'Balança Rodoviária 07',kind:'weighbridge',x:21,z:-2460,width:18,depth:12,terminal:{x:26,z:-2456},radius:24,reward:null,action:'Registrar boletim de acesso',information:'O boletim preservado identifica a entrada do Núcleo 1 no km 2,89 e o atendimento de Tomás. A balança está desativada; a plataforma lateral permanece acessível.'},
];
export const INHABITED_SITES=[
 {id:'home',kind:'home',x:-13,z:22,radius:30},
 ...ROAD_POINTS.filter(p=>p.kind!=='tech').map(p=>({...p,radius:22})),
 ...SHELTERS.map(p=>({...p,kind:'shelter',radius:18})),
 {id:'ivani-detail',kind:'shelter',x:-28,z:-3480,radius:18},
];
export const RESERVATIONS=[
 ...INHABITED_SITES.map(p=>({x:p.x,z:p.z,r:p.radius})),
 ...DISCOVERY_SITES.map(p=>({x:p.x,z:p.z,r:p.radius+10})),
 ...NETWORK_POINTS.map(p=>({x:p.x,z:p.z,r:p.kind==='network-core'?24:12})),
 ...POIS.map(p=>({x:p.x,z:p.z,r:20})),
 {x:POINTS.shelter.x,z:POINTS.shelter.z,r:20},
 {x:POINTS.core.x,z:POINTS.core.z,r:28},
 {x:0,z:-54,r:24}, // Full tutorial parking/manoeuvring area.
 {x:-85,z:-2270,r:30}, // Existing licensed forecourt GLB.
];
export const DECOR_SEED=204708;

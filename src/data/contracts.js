import {ROAD_DESTINATIONS} from './roadNetwork.js';

const site=(id,destination,contractor,theme,side=-1,options={})=>{
 const d=ROAD_DESTINATIONS.find(p=>p.id===destination);
 if(!d)throw Error(`Destino logístico ausente: ${destination}`);
 return {id,destination,name:d.name,contractor,theme,region:options.region||'ashes',requires:options.requires||null,board:options.board!==false,
  bay:{x:d.x,z:d.z,halfWidth:4.5,halfLength:9,yaw:0,alignment:options.alignment||35},
  terminal:{x:d.x+side*6,z:d.z+16},...options};
};
export const LOGISTICS_SITES={
 cinza:site('cinza','carga-cinza-nova','Cooperativa de Cinza Nova','Distribuição e reconstrução municipal',-1,{alignment:25}),
 cotovelo:site('cotovelo','oficina-cotovelo','Dona Marta · expedição da oficina','Equipamentos revisados e peças recuperadas'),
 abrigo:site('abrigo','shelter','Comunidade do Abrigo 07','Recebimento de suprimentos',1,{board:false,terminal:{x:14.5,z:14},alignment:45}),
 ivani:site('ivani','explore:ivani','Mãe Ivani · pedidos da parada','Suprimentos e ajuda aos viajantes',-1,{region:'salt',requires:'core-1'}),
 janelas:site('janelas','oficina-janelas','Rute · oficina e entreposto','Instrumentos e materiais industriais',-1,{region:'cities',requires:'core-2',alignment:25}),
 passo:site('passo','oficina-passo','Baiano · expedição da serra','Máquinas, filtros e infraestrutura',1,{region:'glass',requires:'core-4',alignment:22}),
 horizonte:site('horizonte','oficina-horizonte','Valéria · apoio do Horizonte','Manutenção e suprimentos de emergência',1,{region:'storm',requires:'core-6',alignment:25}),
};
export const CARGO_TYPES={
 water:{id:'water',name:'Água potável lacrada',model:'barrels',unitKg:210,fragility:.22,minimumIntegrity:35,specialization:'regional',width:1.8,depth:.55,height:1.1,resource:'water'},
 food:{id:'food',name:'Alimentos conservados',model:'sacks',unitKg:75,fragility:.35,minimumIntegrity:40,specialization:'regional',width:1.7,depth:.55,height:.95,resource:'food'},
 parts:{id:'parts',name:'Peças e ferramentas',model:'crates',unitKg:180,fragility:.25,minimumIntegrity:35,specialization:'maintenance',width:1.7,depth:.55,height:1.05,resource:'parts'},
 instruments:{id:'instruments',name:'Instrumentos recuperados',model:'instruments',unitKg:90,fragility:1,minimumIntegrity:60,specialization:'fragile',width:1.7,depth:.55,height:.95,resource:'parts'},
 generator:{id:'generator',name:'Gerador industrial',model:'generator',unitKg:4200,fragility:.18,minimumIntegrity:35,specialization:'heavy',width:1.8,depth:2.65,height:1.4,resource:'parts'},
 machinery:{id:'machinery',name:'Conjunto de bombas e motores',model:'machinery',unitKg:1400,fragility:.32,minimumIntegrity:40,specialization:'heavy',width:1.8,depth:2.65,height:1.35,resource:'parts'},
 medical:{id:'medical',name:'Equipamentos de primeiros socorros',model:'instruments',unitKg:85,fragility:.8,minimumIntegrity:55,specialization:'fragile',width:1.7,depth:.55,height:.95,resource:'food'},
 filters:{id:'filters',name:'Filtros e material de manutenção',model:'crates',unitKg:125,fragility:.3,minimumIntegrity:35,specialization:'maintenance',width:1.7,depth:.55,height:1.1,resource:'parts'},
};
export const CONTRACT_TEMPLATES=[
 {id:'agua-cotovelo',hub:'cinza',name:'Água para a oficina',description:'Tambores lacrados para a reserva de serviço. A água não entra no estoque de viagem de Dante.',origin:'cinza',destination:'cotovelo',cargo:'water',quantity:3,level:1,difficulty:1,xp:90},
 {id:'alimentos-abrigo',hub:'cinza',name:'Reabastecimento do Abrigo 07',description:'Alimentos conservados para o depósito comunitário. A entrega deve chegar completa.',origin:'cinza',destination:'abrigo',cargo:'food',quantity:4,level:1,difficulty:1,xp:90},
 {id:'instrumentos-cinza',hub:'cotovelo',name:'Instrumentos para Cinza Nova',description:'A oficina recuperou dois instrumentos. Evite impactos e devolva-os ao pátio industrial.',origin:'cotovelo',destination:'cinza',cargo:'instruments',quantity:2,level:1,difficulty:2,xp:130},
 {id:'gerador-cinza',hub:'cotovelo',name:'Gerador para o pátio industrial',description:'Uma máquina de 4,2 toneladas. Exige berço livre e capacidade real do Titã.',origin:'cotovelo',destination:'cinza',cargo:'generator',quantity:1,level:2,difficulty:3,xp:180},
 {id:'ferramentas-reserva',hub:'ivani',name:'Ferramentas para a reserva',description:'Peças embaladas na parada para manutenção do Abrigo 07.',origin:'ivani',destination:'abrigo',cargo:'parts',quantity:4,level:1,difficulty:2,xp:150},
 {id:'agua-urgente',minSkill:{id:'regional',count:1},hub:'ivani',name:'Reserva de água de Cinza Nova',description:'Uma reserva está no fim. O prazo é generoso; atraso reduz o pagamento, sem punir uma parada segura em menus.',origin:'ivani',destination:'cinza',cargo:'water',quantity:3,level:1,difficulty:2,xp:170,deadlineSeconds:1200},
 {id:'medidores-parada',minSkill:{id:'fragile',count:1},hub:'janelas',name:'Medidores para a parada',description:'Componentes de medição recuperados nas cidades. A carga é frágil.',origin:'janelas',destination:'ivani',cargo:'instruments',quantity:4,level:2,difficulty:3,xp:220},
 {id:'filtros-oficina',hub:'janelas',name:'Filtros para Cinza Nova',description:'Um lote lacrado para a oficina municipal, por uma rota longa da rede.',origin:'janelas',destination:'cinza',cargo:'filters',quantity:4,level:1,difficulty:3,xp:200},
 {id:'bombas-janelas',minSkill:{id:'heavy',count:1},hub:'passo',name:'Bombas para o entreposto',description:'Dois conjuntos industriais. O Basculante pode atendê-los com o berço livre.',origin:'passo',destination:'janelas',cargo:'machinery',quantity:2,level:2,difficulty:3,xp:260},
 {id:'pecas-parada',hub:'passo',name:'Peças da serra para a parada',description:'Ferramentas revisadas e embaladas para os reparos de viagem.',origin:'passo',destination:'ivani',cargo:'parts',quantity:4,level:1,difficulty:3,xp:230},
 {id:'socorro-serra',minSkill:{id:'fragile',count:2},hub:'horizonte',name:'Equipamentos de socorro da serra',description:'Uma remessa prioritária para o apoio da montanha. Atrasos reduzem o prêmio, não apagam a campanha.',origin:'horizonte',destination:'passo',cargo:'medical',quantity:2,level:2,difficulty:4,xp:290,deadlineSeconds:1500},
 {id:'filtros-serra',minSkill:{id:'maintenance',count:1},hub:'horizonte',name:'Filtros para os motores da serra',description:'Lote de manutenção para reduzir a falta de filtros no entreposto.',origin:'horizonte',destination:'passo',cargo:'filters',quantity:4,level:1,difficulty:3,xp:250},
];
export const CAREER_LEVELS=[
 {level:1,xp:0,name:'Motorista de Abrigo'}, {level:2,xp:180,name:'Transportador de Estrada'},
 {level:3,xp:500,name:'Motorista Experiente'}, {level:4,xp:1000,name:'Operador Regional'},
 {level:5,xp:1800,name:'Caminhoneiro Veterano'}, {level:6,xp:3000,name:'Condutor da Aurora'},
];
export const OFFER_PERIOD=900;
export const OFFER_LIFETIME=1200;
export const CONTRACT_STATES=['awaiting_pickup','transporting','ready_for_delivery','failed'];
export function inLogisticsSpace(x,z,margin=0){return Object.values(LOGISTICS_SITES).some(s=>Math.abs(x-s.bay.x)<s.bay.halfWidth+margin&&Math.abs(z-s.bay.z)<s.bay.halfLength+margin||Math.hypot(x-s.terminal.x,z-s.terminal.z)<3+margin);}

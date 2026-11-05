// Authored ecological palettes, not a change to campaign order or vehicle tuning.
export const RECOVERY_SECONDS={initial:45,mature:240};
export const STAGE_LABELS=['Região devastada','Primeira resposta','Recuperação inicial','Recuperação avançada'];
export const ECOLOGY={
 ashes:{name:'Mar de Cinzas',grass:'#7b9860',dry:'#a09469',leaf:'#6d8953',bark:'#655544',height:.72,shrub:1,trees:1,moisture:1,width:1050,treeForm:'dryland'},
 cities:{name:'Cidades Esqueleto',grass:'#768b60',dry:'#9b9177',leaf:'#64845a',bark:'#665d4d',height:.6,shrub:.8,trees:.85,moisture:.85,width:900,treeForm:'urban'},
 salt:{name:'Leito Seco',grass:'#a0a278',dry:'#b5a88a',leaf:'#8a9668',bark:'#82715a',height:.43,shrub:.65,trees:.18,moisture:.48,width:1400,treeForm:'salt'},
 glass:{name:'Cordilheira Vítrea',grass:'#81957c',dry:'#9d9b86',leaf:'#687f72',bark:'#615b55',height:.3,shrub:.62,trees:.3,moisture:.66,width:850,treeForm:'alpine'},
 storm:{name:'Zonas de Tempestade',grass:'#809470',dry:'#9d9782',leaf:'#74876b',bark:'#635e55',height:.48,shrub:.72,trees:.48,moisture:.7,width:1000,treeForm:'wind'},
};
export const VEGETATION_CELL=256;
export const VEGETATION_PROFILES={
 baixo:{radius:340,density:.52,treeDetail:0,shadowDistance:0},
 medio:{radius:500,density:.76,treeDetail:1,shadowDistance:70},
 alto:{radius:680,density:1,treeDetail:2,shadowDistance:110},
};
export const RECOVERY_REACTIONS={
 ashes:['O ar já não arranha a garganta. A chuva chegou até aqui.','A terra segurou a primeira água. Os brotos estão resistindo.','Faz tempo que esta parada não tinha sombra nova.'],
 cities:['A água está lavando a cinza das fachadas.','Nas frestas do concreto, apareceu verde de novo.','As árvores novas mudaram o som desta rua.'],
 salt:['A água está ficando nas depressões. O sal ainda exige cuidado.','As gramíneas estão pegando nas manchas menos salgadas.','Não virou floresta. Mas já deixou de ser só sal.'],
 glass:['O vento continua forte. Há umidade nos cantos protegidos.','Musgo e gramíneas estão segurando o solo da encosta.','Até na pedra lisa a vida encontrou abrigo.'],
 storm:['O rádio ainda chia, mas a frente já não domina o céu.','Os primeiros arbustos resistiram ao vento.','O horizonte está mais limpo. Ainda precisamos cuidar da estrada.'],
};

// Narrative data for 0.14.0. Player-facing text only: never name or describe
// the identity of A Voz here (see docs/NARRATIVA_0.14.0.md, restricted section).

export const CHAPTERS=[
 {id:'prologue',title:'Prólogo — O Último Ano',year:2027},
 {id:'ch1',title:'A Última Estrada Conhecida',cores:['core-1']},
 {id:'ch2',title:'As Cidades que Ficaram',cores:['core-2','core-3']},
 {id:'ch3',title:'O Mar que Desapareceu',cores:['core-4']},
 {id:'ch4',title:'Além das Montanhas',cores:['core-5','core-6']},
 {id:'ch5',title:'Horizonte',cores:['core-7']},
 {id:'final',title:'A Última Estrada',cores:[]},
];

// Scenes are recorded once as watched or skipped. IDs are stable save keys.
export const SCENES=['prologue-2027','intro-2047','first-seed','first-contact','skeleton-discovery','brutus-meeting','voice-signal','horizon-eve'];

// Anchoring below this Seed integrity leaves an unstable field. Recorded now;
// whether it decides the "partial" ending is pending approval (docs §7).
export const UNSTABLE_ANCHOR=60;

export const RELATIONS=['unknown','known','trusted','wary','ally'];

// Each choice is applied once. `cost` uses the existing inventory bags and is
// charged atomically; `relations` lists the outcome for derived relations.
export const CHOICES={
 'ch2-water-share':{chapter:'ch2',npc:'lia',options:{
  share:{label:'Dividir duas águas com o abrigo',cost:{bag:'player',items:{water:2}}},
  keep:{label:'Guardar a água para a estrada'},
 }},
 'ch3-brutus-toll':{chapter:'ch3',npc:'brutus',options:{
  pay:{label:'Pagar o pedágio de Brutus',cost:{bag:'player',items:{scrap:4}}},
  refuse:{label:'Recusar e procurar o desvio'},
  water:{label:'Propor levar água ao povoado dele',cost:{bag:'truck',items:{water:4}}},
 }},
 'ch4-titan-part':{chapter:'ch4',npc:'noemia',options:{
  give:{label:'Ceder uma peça do Titã ao repetidor de reserva',component:{radiator:-15}},
  keep:{label:'Manter o Titã inteiro para a subida'},
 }},
};

// Radio transmissions played while driving, at most once each, in chapter
// order. Conditions: chapters (current chapter must be listed), region,
// quest {id:state}, choice {id:option}, after (another transmission logged),
// renata (requires first contact). `fragment` adds to flags.voiceFragments.
export const SPEAKERS={survivor:'Sobrevivente',renata:'Dra. Renata Final Boss',voice:'A Voz',survivors:'Transmissão de sobreviventes',lia:'Lia',afonso:'Afonso',noemia:'Noêmia',joel:'Joel',brutus:'Garcia',dante:'Dante',radio:'Rádio'};
export const TRANSMISSIONS=[
 {id:'r-ch1-calls',speaker:'renata',chapters:['ch1'],renata:true,text:'Você não respondeu às duas primeiras chamadas. Achei que este rádio também tinha morrido.'},
 {id:'s-ch1-shelter',speaker:'survivors',chapters:['ch1','ch2'],text:'…aqui Abrigo 07. Ainda estamos aqui. Se alguém ouvir, ainda estamos aqui.'},
 {id:'r-ch1-engine',speaker:'renata',chapters:['ch1'],renata:true,after:'r-ch1-calls',text:'Esse motor faz barulho de motor de verdade. Fazia tempo que eu não ouvia um.'},
 {id:'v-ch1-noise',speaker:'voice',chapters:['ch1'],after:'r-ch1-engine',text:'…ão… …solte o pé na descida… …'},
 {id:'r-ch2-team',speaker:'renata',chapters:['ch2'],renata:true,text:'Éramos onze na equipe da Rede. Eu era a mais nova. Os outros desenharam os Núcleos; eu só aprendi a ligá-los.'},
 {id:'v-ch2-viaduct',speaker:'voice',chapters:['ch2'],region:'cities',fragment:'signal-viaduct',text:'O viaduto aguenta um caminhão por vez. Não pare no meio.'},
 {id:'r-ch2-unknown',speaker:'renata',chapters:['ch2','ch3'],renata:true,after:'v-ch2-viaduct',text:'Esse sinal não está em nenhuma frequência nossa. Não sei quem é. Cuidado com quem sabe demais.'},
 {id:'l-ch2-tank',speaker:'lia',chapters:['ch2','ch3'],quest:{supply:'completed'},text:'A caixa-d’água segurou. As crianças perguntam quem é o motorista do caminhão barulhento.'},
 {id:'s-ch2-toll',speaker:'survivors',chapters:['ch2','ch3'],text:'…cuidado no Leito Seco. Os homens de Garcia cobram a passagem em água.'},
 {id:'r-ch3-wait',speaker:'renata',chapters:['ch3'],renata:true,text:'Você quer saber por que esperei vinte anos. Sem Semente, sem caminhão, sem estrada. Só me restava esperar alguém como você.'},
 {id:'b-ch3-call',speaker:'brutus',chapters:['ch3'],text:'Motorista do caminhão velho. Aqui é Garcia. Você carrega cilindros que podiam salvar o meu povo primeiro. Vamos conversar no Leito.'},
 {id:'a-ch3-pump',speaker:'afonso',chapters:['ch3','ch4'],quest:{pump:'completed'},text:'A bomba trabalha dia e noite. Se Garcia descobrir, vai querer cobrar por ela também.'},
 {id:'b-ch3-paid',speaker:'brutus',chapters:['ch3','ch4','ch5'],choice:{'ch3-brutus-toll':'pay'},text:'Pagou sem discutir. Você vai longe, motorista. Só não esqueça quem deixou você passar.'},
 {id:'b-ch3-refused',speaker:'brutus',chapters:['ch3','ch4','ch5'],choice:{'ch3-brutus-toll':'refuse'},text:'O desvio é longo. Lembre de mim quando o radiador ferver.'},
 {id:'b-ch3-water',speaker:'brutus',chapters:['ch3','ch4','ch5'],choice:{'ch3-brutus-toll':'water'},text:'Água para os meus sem eu pedir duas vezes. Eu não esqueço isso, Dante.'},
 {id:'n-ch4-signal',speaker:'noemia',chapters:['ch4'],quest:{relay:'completed'},text:'O repetidor pegou de novo aquele sinal. Ele chama o seu caminhão pelo nome.'},
 {id:'v-ch4-stubborn',speaker:'voice',chapters:['ch4'],region:'glass',fragment:'signal-stubborn',text:'Ele é teimoso, mas chega. Sempre chegou.'},
 {id:'r-ch4-fear',speaker:'renata',chapters:['ch4'],renata:true,text:'Cada campo que acende puxa o próximo. Se um ancorar mal lá em cima, não sei se consigo explicar o que acontece com aquela terra.'},
 {id:'n-ch4-spare',speaker:'noemia',chapters:['ch4','ch5'],choice:{'ch4-titan-part':'give'},text:'O repetidor de reserva está de pé com a peça do Titã. Quem subir depois de você vai ouvir o aviso.'},
 {id:'v-ch5-tunnel',speaker:'voice',chapters:['ch5'],region:'storm',fragment:'signal-tunnel',text:'Da última vez você esperou o céu passar dentro do túnel. Desta vez, não pare.'},
 {id:'r-ch5-eve',speaker:'renata',chapters:['ch5'],renata:true,text:'Horizonte é o último. Depois dele eu não tenho mais instruções, Dante. Só esperança.'},
 {id:'r-unstable',speaker:'renata',chapters:['ch2','ch3','ch4','ch5','final'],renata:true,unstable:true,text:'O campo ancorou, mas instável. A Semente chegou batida demais e a ressonância não fecha. Aquela terra vai parar no meio do caminho. Eu precisava que você soubesse.'},
 {id:'j-ch5-news',speaker:'joel',chapters:['ch5'],quest:{supply:'completed'},text:'Lia chegou aqui contando da chuva. Tem gente vindo do leste só para ver.'},
];

// Optional exploration clues, granted on the first visit on foot.
export const SITE_FRAGMENTS={
 weighbridge:{id:'weighbridge-log',text:'Registro de rádio da Balança 07, com data de um dia que ainda não chegou: “caminhão de 2003 passou às 06h12, seguiu para oeste”.'},
 motel:{id:'motel-tape',text:'Fita no quarto 9: uma voz chiada repete coordenadas da Cordilheira e uma palavra, “teimoso”.'},
};
export const VOICE_FRAGMENT_TOTAL=6;

// Where each choice is offered (shelter id from data/network.js), the scene
// text shown before deciding and the reaction shown afterwards. Garcia is
// Brutus's street name; his men hold the pump on the old sea floor.
export const CHOICE_SCENES={
 'ch2-water-share':{site:'lia',prompt:'Lia olha para os galões na mochila de Dante. — As crianças daqui não veem água limpa faz uma semana. Não vou pedir. Só estou dizendo.',after:{share:'Lia segura o galão com as duas mãos. — Eu não esqueço quem divide.',keep:'Lia assente, sem rancor. — A estrada é longa. Eu entendo.'}},
 'ch3-brutus-toll':{site:'afonso',prompt:'Dois homens de Garcia esperam junto à bomba de Afonso. — Passagem pelo Leito custa quatro de sucata, motorista. Ordem do Garcia. Ou você conversa com ele sobre o que leva aí atrás.',after:{pay:'Os homens recolhem a sucata e liberam a passagem. Afonso desvia o olhar.',refuse:'— Então dá a volta. Os homens de Garcia não saem da frente da bomba.',water:'Um deles chama pelo rádio. A voz de Garcia responde, baixa: — Água para o povoado? Deixa ele passar.'}},
 'ch4-titan-part':{site:'noemia',prompt:'Noêmia aponta o repetidor de reserva, ainda sem radiador auxiliar. — Com uma peça de radiador, quem subir depois de você ouviria o aviso da frente. O seu Titã tem uma. Sei o que estou pedindo.',after:{give:'Dante desmonta a peça em silêncio. O repetidor de reserva acende. — Ele vai sentir falta disso na subida — diz Noêmia. — Eu sei.',keep:'— Faz sentido — diz Noêmia. — Ele precisa chegar lá em cima inteiro.'}},
};

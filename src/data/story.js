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

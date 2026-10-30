// Original modular environment art; PBR surfaces are the existing licensed library.
export function furnishHome(b,labels){
 const m=b.m;
 // Rear wall is domestic space; preserve both tutorial desks and the east doorway.
 b.box(1.35,.14,2.15,m.steel,-2.1,.3,3.9,true);b.box(1.28,.2,2.05,m.fabric,-2.1,.47,3.9);b.box(1.3,.07,1.45,m.canvas,-2.1,.6,3.7);b.box(.85,.12,.38,m.paint,-2.1,.65,4.65);
 for(const dx of [-2.65,-1.55])for(const dz of [3,4.8])b.box(.055,.32,.055,m.steel,dx,.14,dz);
 b.shelf(2.15,0,4.8);b.box(.7,1.35,.65,m.paint,-3.1,.68,1.8,true);b.box(.63,1.2,.06,m.steel,-3.1,.7,2.15);b.box(.04,.4,.05,m.rust,-2.88,.9,2.2);
 b.label('CADERNO / RESERVA DE VIAGEM',2.5,.6,.1,2.3,5.75,labels);b.lamp(0,3,4.9);
 b.label('ABRIGO 07 / ULTIMO MOTOR',3,.65,-.5,2.6,-5.9,labels);b.lamp(0,3.1,-1);b.box(1.4,.7,.07,m.wood,-2,2.15,-5.85);
 for(let i=0;i<5;i++)b.box(.18,.24,.01,m.paint,-2.5+i*.24,2.18+(i%2)*.07,-5.8);
 b.crate(2.1,0,-4.9,.75);b.cable([[-3,2.8,-5.7],[0,2.8,-5.7],[0,3.1,-1]],.025,m.rubber);
 b.box(1.4,.85,.09,m.wood,-2,2,-3);for(const x of [-2.6,-1.4])b.box(.07,2.4,.07,m.steel,x,1.2,-3.05);
 for(let i=0;i<5;i++){b.box(.035,.3,.025,m.steel,-2.5+i*.25,2,-2.93);b.ring(.045,.012,m.steel,-2.5+i*.25,2.17,-2.93,[0,0,0]);}
 b.label('FERRAMENTAS / FILTROS',1.4,.28,-2,2.6,-2.93,labels);
 b.cable([[-3,2.7,5.7],[0,2.65,5.7],[2.8,2.5,5.7],[2.8,1.4,4.8]],.02,m.rubber);
 // Outside: an inhabited yard with water storage, a cookstove and a covered table.
 b.cylinder(1.1,2.6,m.steel,-9,1.8,12);b.solid(-9,1.8,12,2.2,2.6,2.2);for(const dx of [-9.8,-8.2])b.box(.1,.6,1.6,m.rust,dx,.3,12);b.cable([[-9,1.2,13.1],[-9,.4,14],[-6,.3,14]],.08,m.rubber);
 b.bench(-3,0,12,2.4);b.box(1,.7,.65,m.dark,-6,.4,11,true);b.cylinder(.25,.25,m.steel,-6,.9,11);b.cylinder(.09,2,m.rust,-6,1.5,10.8);
 for(const x of [-8,1])b.box(.1,3.2,.1,m.steel,x,1.6,10);b.cable([[-8,3,10],[-3,2.6,10],[1,3,10]],.02,m.steel);
 for(let i=0;i<3;i++)b.box(.55,.8,.025,m.canvas,-6+i*1.3,2.3,10);
 b.barrel(-8,0,7);b.crate(1,0,12);b.lamp(-3,2.6,12);
 for(const x of [-11,3]){for(let i=0;i<5;i++)b.box(.09,1.4,.09,m.wood,x,.7,6+i*3);b.box(.06,.14,12,m.wood,x,.8,12);b.box(.06,.14,12,m.wood,x,1.15,12);}
 // Empty raised beds show the experiment before restoration, leaves arrive later.
 for(const x of [-6,-3]){b.box(2.2,.25,1.4,m.wood,x,.13,17,true);b.box(1.95,.12,1.15,m.soil,x,.3,17);}
}
export function furnishRoad(b,p,labels){
 const m=b.m,variant=[...p.id].reduce((n,c)=>n+c.charCodeAt(0),0)%3;
 if(p.kind==='gas'){
  // Preserve the attendant (-1,.5), pump (3,0) and the truck manoeuvring apron.
  for(const z of [-2.6,2.6]){b.cable([[2.55,1.7,z],[2.2,.8,z+.2],[2.3,.45,z+.6],[2.8,1.1,z+.6]],.035,m.rubber);b.box(.09,.3,.08,m.steel,2.8,1.15,z+.6);}
  const side=variant===1?-3.5:3.5;b.bench(-9.5,0,side);b.shelf(-8,0,-2.5);b.barrel(-9,0,-6);b.crate(-7,0,-6);b.crate(-7,.7,-6,.8);
  b.box(3,.08,2.5,variant===2?m.roof:m.canvas,-9.5,2.9,side);for(const x of [-10.9,-8.1])b.box(.06,2.8,.06,m.steel,x,1.4,side+1.15);
  b.label('DIESEL / AGUA / REPAROS',3,.65,-4.4,2.6,4.15,labels);b.lamp(3,4.1,2);b.lamp(-9.5,2.7,side);
  for(let i=0;i<3+variant;i++)b.box(.18,.25,.18,m.paint,-10.2+i*.32,1.04,side);
 }else if(p.kind==='workshop'){
  // Workbench clutter and pegboard have no extra physical obstacles.
  for(let i=0;i<7;i++){b.box(.06,.36,.04,m.steel,-6.65,2.5,-2.4+i*.7);b.ring(.075,.02,m.steel,-6.6,2.72,-2.4+i*.7,[0,Math.PI/2,0]);}
  b.box(.7,1.5,1.2,m.paint,-5.7,.8,5.7,true);for(const z of [5.4,6])b.box(.07,.35,.04,m.dark,-5.3,.9,z);
  b.box(.8,.12,1.3,m.rust,4,.14,3.5);b.cylinder(.08,.8,m.steel,4,.55,3.5);b.box(.7,.08,.15,m.steel,4,.98,3.5);b.cable([[4,.3,3.5],[4.5,.3,3.8],[5,.65,3.8]],.03,m.rubber);
  for(let i=0;i<3+variant;i++)b.tire(4,.3+i*.28,5.5);b.crate(-4,0,-5.7);b.barrel(4.5,0,-5.5);
  b.label('OFICINA / PECAS RECUPERADAS',5,.8,0,3.8,-6.75,labels);b.lamp(0,4.2,2);b.lamp(-5.5,3.5,0);
 }
}
export function furnishShelter(b,labels){
 const m=b.m;
 b.bench(-6,0,6,3);b.shelf(-7,0,3);b.crate(-6,0,8);b.barrel(-8,0,8);
 for(const x of [-4,-1]){b.box(2,.2,1.2,m.wood,x,.12,9,true);b.box(1.8,.12,1,m.soil,x,.28,9);}
 b.box(1,.8,.8,m.steel,-8,.4,5,true);b.cylinder(.22,.15,m.steel,-8,.88,5);b.box(.7,.18,1.8,m.fabric,6,.3,7,true);b.box(.7,.14,1.8,m.canvas,6,.45,7);
 b.label('AGUA / COZINHA / DESCANSO',4,.8,-6,2.4,9.9,labels);b.lamp(-6,3.2,5);
 for(const x of [-8.2,-3.8])b.box(.08,2.85,.08,m.wood,x,1.425,9.9,true);
}
export function roadside(b,p,labels){
 const m=b.m,k=p.kind;
 if(k==='guardrail'){
  for(const z of [-4,0,4])b.box(.12,.9,.12,m.steel,0,.45,z,true);
  for(const y of [.5,.75])b.box(.11,.16,10,m.weatheredMetal,0,y,0);
  b.solid(0,.65,0,.15,.4,10);for(const z of [-3,3])b.box(.13,.11,.16,m.stripe,.08,.68,z);
 }else if(k==='powerline'){
  for(const z of [-14,14]){b.box(.18,8,.18,m.wood,0,4,z,true);b.box(2.1,.12,.1,m.steel,0,7.4,z);for(const x of [-.8,.8])b.cylinder(.08,.25,m.paint,x,7.5,z);}
  for(const x of [-.8,.8])b.cable([[x,7.6,-14],[x,6.5,0],[x,7.6,14]],.025,m.dark);
 }else if(['roadSign','riskSign'].includes(k)){
  b.box(.12,2.6,.12,m.steel,0,1.3,0,true);b.box(2.5,1,.08,m.rust,0,2.35,0);b.label(k==='riskSign'?'ATENCAO / VENTO E PEDRAS':p.region==='ashes'?'RODOVIA 07 / REDE AURORA':p.region==='salt'?'LEITO SECO / AGUA ADIANTE':p.region==='glass'?'SERRA / USE FREIO MOTOR':'TRANSITO LOCAL / ABRIGOS',2.4,.9,0,2.35,.055,labels);
 }else if(k==='deadTree'){
  b.cylinder(.17,4,m.wood,0,2,0,[0,0,.12],.08);b.cylinder(.075,2.2,m.wood,-.5,3,.1,[0,0,.7],.025);b.cylinder(.06,1.9,m.wood,.5,3.3,.2,[0,0,-.75],.025);b.solid(0,1.5,0,.4,3,.4);
 }else if(k==='fence'){
  for(const z of [-4,0,4])b.box(.1,1.5,.1,m.wood,0,.75,z,true);for(const y of [.55,1.1])b.box(.07,.12,8,m.wood,0,y,0);
 }else if(k==='camp'){
  for(const x of [-2,2])b.box(.08,2,.08,m.steel,x,1,0);b.box(4.3,.05,3,m.canvas,0,2,-1);b.cable([[-2,2,0],[0,1.8,0],[2,2,0]],.02,m.rubber);b.crate(-1,0,-1);b.bench(1,0,-1,1.1);b.tire(2,0,2);
 }else if(k==='scrap'){
  b.tire(-.6,0,0);b.tire(-.6,.28,0);b.barrel(.8,0,0);b.box(.12,.6,1.4,m.rust,0,.3,1.3,false,.6);b.box(.8,.1,.7,m.weatheredMetal,-1,.12,1.1);
 }else if(k==='buoy'){
  b.cylinder(.55,1.2,m.rust,0,.6,0,[0,0,.18],.25);b.cylinder(.045,2.5,m.steel,0,2.1,0);b.ring(.3,.035,m.steel,0,1.3,0);b.solid(0,.6,0,1.1,1.2,1.1);
 }else if(k==='pier'){
  for(const x of [-2,2])for(const z of [-3,3])b.cylinder(.16,3,m.wood,x,1.5,z);for(let z=-3;z<3;z+=.4)b.box(4.3,.18,.32,m.wood,0,2.5,z);b.solid(0,2.45,0,4.3,.2,6);b.cable([[-2,2.8,-3],[-2,2.3,0],[-2,2.8,3]],.05,m.rubber);
 }else if(k==='boat'){
  // Tapered, open hull, benches and an exposed keel on the dry ocean floor.
  for(const side of [-1,1]){b.box(.12,.65,3.2,m.wood,side*.8,.65,0,false,side*.04);b.box(.12,.65,1.6,m.wood,side*.48,.65,-2.1,false,side*-.43);b.box(.12,.65,1.4,m.wood,side*.46,.75,2.05,false,side*.48);}
  b.box(1.6,.1,3.7,m.wood,0,.28,0);for(const z of [-1,1])b.box(1.6,.1,.35,m.paint,0,.65,z);b.box(.08,.18,5,m.dark,0,.12,0);b.solid(0,.45,0,1.6,.7,5);
 }else if(['facade','busStop'].includes(k)){
  if(k==='facade'){b.box(9,5,.3,m.concrete,0,2.5,-2,true);for(const x of [-3,0,3]){b.box(2,2,.12,m.dark,x,2.7,-1.8);b.box(.07,2.1,.1,m.steel,x,2.7,-1.7);b.box(2.1,.07,.1,m.steel,x,2.7,-1.7);}b.label('ARMAZEM / ENTRADA LATERAL',5,.6,0,4.2,-1.75,labels);}
  else{for(const x of [-2,2])b.box(.12,3,.12,m.steel,x,1.5,-1,true);b.box(4.6,.15,3,m.roof,0,3,0);b.box(4.4,2.5,.08,m.glass,0,1.7,-1);b.bench(0,0,-.5,3);}
 }else if(k==='traffic'){
  b.cylinder(.09,5,m.steel,0,2.5,0);b.box(.5,1.6,.4,m.dark,0,4.4,0,true);for(const [i,mat] of [m.rust,m.stripe,m.leaf].entries())b.cylinder(.14,.06,mat,0,4.9-i*.5,.23,[Math.PI/2,0,0]);
 }else if(k==='retaining'){
  for(let i=0;i<8;i++)b.box(.7,1.2,.8,m.rock,0,.6,-3+i*.9,false,i%2*.1);b.solid(0,.6,0,.8,1.2,7);
 }else if(['weatherMast','antenna','windbreak'].includes(k)){
  if(k==='windbreak'){for(const x of [-3,0,3])b.box(.15,3,.15,m.steel,x,1.5,0,true);for(let i=0;i<8;i++)b.box(6.2,.18,.08,m.roof,0,.3+i*.33,0);}
  else{b.cylinder(.12,8,m.steel,0,4,0);for(const x of [-2,2])b.cable([[x,0,2],[0,7,0],[x,0,-2]],.025,m.steel);b.box(1.1,1,.6,m.paint,0,1,.6,true);b.cylinder(.5,.12,m.steel,0,7.7,0);b.box(3,.06,.08,m.steel,0,8.4,0);for(const x of [-1.3,1.3])b.cylinder(.18,.18,m.dark,x,8.5,0);b.label('ESTACAO / MONITORAMENTO',2,.5,0,2.3,.95,labels);}
 }
}

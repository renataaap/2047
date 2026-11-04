import * as THREE from 'three';

// Small sets of authored workshop objects; all stay on existing furniture/walls.
// PropBatch merges them by the same PBR materials and streams them with each site.
function wrench(b,x,y,z,s=1){
 const m=b.m;b.box(.035*s,.22*s,.018*s,m.steel,x,y,z);b.box(.11*s,.04*s,.018*s,m.steel,x,y+.12*s,z);
 for(const side of [-1,1])b.box(.025*s,.07*s,.018*s,m.steel,x+side*.047*s,y+.16*s,z);
 b.ring(.037*s,.011*s,m.steel,x,y-.12*s,z,[0,0,0]);
}
function starter(b,x,y,z){
 const m=b.m;b.cylinder(.11,.43,m.steel,x,y+.12,z,[0,0,Math.PI/2]);b.cylinder(.06,.2,m.dark,x+.12,y+.24,z,[0,0,Math.PI/2]);
 b.cylinder(.05,.12,m.steel,x-.28,y+.12,z,[0,0,Math.PI/2]);b.ring(.125,.016,m.rust,x-.19,y+.12,z,[0,Math.PI/2,0]);
 b.box(.32,.035,.18,m.dark,x,y+.018,z);for(const dx of [-.12,.12])b.cylinder(.018,.03,m.steel,x+dx,y+.035,z+.07);
}
function rag(b,x,y,z,s=1){
 const g=new THREE.PlaneGeometry(.5*s,.34*s,8,5),p=g.attributes.position;
 for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*48)*.012*s+Math.cos(p.getY(i)*38)*.008*s);g.computeVertexNormals();
 b.part(g,b.m.fabric,x,y,z,[-Math.PI/2,0,.2]);
}
function mug(b,x,y,z){b.cylinder(.045,.1,b.m.paint,x,y+.05,z);b.cylinder(.038,.003,b.m.dark,x,y+.102,z);b.ring(.035,.009,b.m.steel,x+.054,y+.055,z,[Math.PI/2,0,0]);}
function drawer(b,x,y,z,w=1){
 b.box(w,.3,.04,b.m.paint,x,y,z);for(const dy of [-.075,.075]){b.box(w*.9,.012,.02,b.m.dark,x,y+dy-.05,z+.025);b.box(w*.22,.018,.035,b.m.steel,x,y+dy,z+.045);}
}
export function finishHome(b,labels){
 const m=b.m;
 // Existing pegboard / bench: a repair left in progress, with usable aisle intact.
 for(let i=0;i<4;i++)wrench(b,-2.5+i*.3,2.04,-2.9,.7+i*.13);
 b.bench(-2,0,-3,1.1);starter(b,-2,.92,-3);rag(b,-2.4,.923,-2.95,.6);
 b.cable([[-2.6,1.1,-3.02],[-2.5,.5,-3.03],[-2,.42,-3.05]],.024,m.rubber);
 b.box(.6,.1,.36,m.dark,2.1,.08,-4.9);for(let i=0;i<5;i++){b.cylinder(.025,.08,m.steel,1.9+i*.1,.16,-4.9);b.ring(.04,.01,m.steel,1.9+i*.1,.22,-4.9);}
 // Folded bed cover, seams, hanging coat and a shelf of mundane travel objects.
 for(let i=0;i<6;i++)b.box(.16,.035,.8,m.fabric,-2.6+i*.19,.67,3.5);
 for(const x of [-2.65,-1.55])for(const z of [3,4.8])b.cylinder(.055,.07,m.steel,x,.61,z);
 b.box(1.05,.055,.45,m.wood,1.9,1.65,5.45);for(const x of [1.45,2.35])b.box(.04,.28,.06,m.steel,x,1.48,5.42);
 mug(b,1.65,1.68,5.42);b.box(.3,.045,.23,m.canvas,2.1,1.7,5.42);b.box(.25,.012,.2,m.stripe,2.1,1.73,5.42);
 b.box(.4,.66,.05,m.fabric,-2.65,1.6,5.6);b.box(.52,.07,.07,m.steel,-2.65,1.97,5.59);
 b.label('REVISAO / TITA ROCHA CLARA',1.35,.22,-2,2.65,-2.9,labels);
 b.lamp(-2.65,1.95,4.85,true);b.box(.04,.25,.04,m.steel,-2.65,1.8,4.85);
 // Cookstove pipe joints and table setting on existing outside furniture.
 for(const y of [1.1,1.65,2.2])b.ring(.1,.014,m.steel,-6,y,10.8);
 mug(b,-3,.91,12);b.cylinder(.14,.05,m.steel,-3.4,.94,12);rag(b,-2.4,.92,12,.8);
}
export function finishEstablishment(b,p,labels){
 const m=b.m;
 if(p.kind==='gas'){
  // Pump island, pipe unions and nozzle fixings are inside the existing island.
  for(const z of [-2.6,2.6]){b.box(.65,.055,.54,m.concrete,3,.05,z);for(const y of [.35,1.3])b.ring(.07,.012,m.steel,2.6,y,z,[0,Math.PI/2,0]);b.box(.13,.05,.08,m.rust,2.8,1.25,z+.6);}
  const variant=[...p.id].reduce((n,c)=>n+c.charCodeAt(0),0)%3,side=variant===1?-3.5:3.5;
  drawer(b,-9.5,.65,side+.37,1.6);mug(b,-10,.93,side);rag(b,-9,.94,side,.6);
  b.box(.75,.1,.4,m.steel,-9.5,1,side);for(let i=0;i<4;i++)b.cylinder(.04,.13,m.paint,-9.75+i*.16,1.12,side);
  for(const x of [-10.6,-8.4])b.box(.1,.16,.12,m.rust,x,2.8,side+1.15);
  b.cable([[-8,2.4,-2.8],[-8,1.3,-2.8],[-8.5,.3,-2.8]],.02,m.rubber);
  b.label('GALÕES / DEVOLVA AS EMBALAGENS',2.5,.3,-8,2.25,-2.17,labels);
  b.bench(-4.7,0,1.6,2.8);b.shelf(-5.7,0,3.4);mug(b,-4.4,.92,1.6);rag(b,-5.6,.93,1.6,.7);
  drawer(b,-4.7,.65,2,2.6);b.lamp(-4.7,2.4,1.6,true);
  for(const z of [-2.6,2.6]){b.label('DIESEL / LITROS',.42,.11,3.49,1.85,z,labels,Math.PI/2);b.ring(.055,.012,m.paint,2.56,1.3,z,[0,Math.PI/2,0]);}
 }else if(p.kind==='workshop'){
  // A cylinder head, socket set and rag on the already solid workbench.
  starter(b,-5.9,1.08,-1.6);rag(b,-5.8,1.09,-.7,.8);
  b.box(.5,.13,.32,m.steel,-5.9,1.145,.5);for(const z of [.39,.51,.63])b.cylinder(.065,.05,m.dark,-5.9,1.23,z);
  for(let i=0;i<5;i++)wrench(b,-6.61,2.35,-2.5+i*.64,.9);
  for(let i=0;i<6;i++)b.cylinder(.025,.08,m.steel,-6.25+i*.11,1.12,2.3);
  b.box(.6,.13,.42,m.dark,-5.9,1.145,2.75);drawer(b,-5.7,.95,6.33,.7);
  b.lamp(-5.9,2.2,-.7,true);
  b.cable([[4.5,.2,-5.5],[4.1,.1,-4.5],[4.2,.12,-3.7]],.035,m.rubber);
  b.label('REVISAO / FILTROS / FREIOS',2.3,.3,-4,2.8,-6.6,labels);
 }
}
export function finishDiscovery(b,p,labels){
 const m=b.m;
 if(p.kind==='motel'){
  for(const x of [-7.2,-4.8,3.2,5.6]){
   const g=new THREE.PlaneGeometry(.4,1.48,8,5),a=g.attributes.position;for(let i=0;i<a.count;i++)a.setZ(i,Math.sin(a.getX(i)*65)*.035);g.computeVertexNormals();b.part(g,m.canvas,x,1.75,3.97);
  }
  for(const x of [-5,5]){b.box(1.2,.07,.65,m.canvas,x,.64,-2.05);for(const dx of [-.5,.5])b.box(.055,.04,.65,m.fabric,x+dx,.69,-2.05);}
  b.box(1.2,.6,.08,m.wood,-4,1.7,-3.8);for(let i=0;i<5;i++){b.ring(.025,.006,m.steel,-4.45+i*.22,1.73,-3.74,[0,0,0]);b.box(.055,.07,.012,m.stripe,-4.45+i*.22,1.63,-3.72);}
  b.label('CHAVES / RECEPCAO',1.2,.17,-4,2.1,-3.73,labels);mug(b,-4,1.12,1.25);rag(b,-3.6,1.12,1.3,.5);
 }else if(p.kind==='yard'){
  starter(b,9,.92,-3);rag(b,9.6,.93,-3,.8);
  b.cylinder(.32,.9,m.paint,10,.6,-5,[0,0,Math.PI/2]);for(const x of [9.7,10.3])b.box(.06,.35,.4,m.steel,x,.24,-5);
  b.cable([[10,.8,-5],[9.5,.1,-4.5],[8,.06,-4],[8.5,.08,-2.5]],.025,m.rubber);
  for(let i=0;i<4;i++)b.box(.08,.1,.3,m.steel,8.6+i*.19,.97,-3);
 }else{
  drawer(b,5,1.2,-1.65,.9);b.box(.23,.16,.17,m.dark,5.45,1.62,-1.6);
  b.cable([[5.45,1.55,-1.6],[5.6,.1,-1.6],[5.6,.1,.8]],.018,m.rubber);
  for(const x of [-5.5,-.5])for(let z=-4.8;z<4;z+=1.1)b.cylinder(.027,.025,m.steel,x,.21,z);
  b.label('PESAGEM SUSPENSA',1.4,.18,5,2.45,-1.84,labels);
 }
}
export function finishRoadside(b,p){
 const m=b.m;
 if(p.kind==='guardrail'){
  for(const z of [-4,0,4]){b.box(.3,.045,.32,m.weatheredMetal,0,.04,z);for(const x of [-.1,.1])b.cylinder(.018,.04,m.steel,x,.065,z);b.ring(.028,.007,m.steel,.08,.64,z,[0,Math.PI/2,0]);}
 }else if(p.kind==='deadTree'){
  for(const side of [-1,1])b.cylinder(.025,1.2,m.wood,side*.8,3.6,.15,[.12,0,side*.9],.008);
 }else if(p.kind==='scrap'){
  starter(b,.3,.03,.8);b.cable([[-.6,.03,.6],[-.4,.04,1.4],[.3,.02,1.5]],.025,m.rubber);
 }else if(p.kind==='roadSign'){
  for(const side of [-1,1])b.cylinder(.025,.018,m.steel,side*.95,2.4,.055,[Math.PI/2,0,0]);
  b.box(.25,.025,.25,m.concrete,0,.03,0);
 }else if(p.kind==='camp'){
  mug(b,1,.91,-1);rag(b,.9,.92,-1,.7);b.box(.65,.04,1.3,m.canvas,-1,.04,1);
 }
}

// Finish the existing roadside factories, within their original solid footprints.
export function finishIndustry(add,block,m,ground){
 for(const z of [-400,-450]){
  const x=100,y=ground(x,z);
  for(const dz of [-6,-2,2,6]){
   block(.09,18,.12,m.steel,x-6.07,y+9,z+dz);
   for(const hy of [4,8,12,16]){
    block(.06,1.7,1.2,m.dark,x-6.1,y+hy,z+dz+1.4);
    for(const side of [-1,1])block(.12,1.85,.045,m.rust,x-6.16,y+hy,z+dz+1.4+side*.61);
    block(.16,.06,1.35,m.steel,x-6.2,y+hy-.88,z+dz+1.4);
   }
  }
  block(.12,2.8,1.7,m.roof,x-6.16,y+1.4,z-4.2);block(.16,.08,.2,m.steel,x-6.25,y+1.4,z-3.62);
  for(const hy of [.4,18.6])block(12.4,.12,16.4,m.steel,x,y+hy,z);
  for(const dz of [-4,4]){
   add(new THREE.CylinderGeometry(.55,.65,3,16),m.steel,x-2,y+20,z+dz);
   const elbow=add(new THREE.TorusGeometry(.65,.18,8,16,Math.PI/2),m.rust,x+6.7,y+15,z+dz);elbow.rotation.z=Math.PI;
   add(new THREE.CylinderGeometry(.18,.18,13,12),m.rust,x+6.7,y+7.8,z+dz);
   for(const hy of [4,10,14])block(.8,.06,.4,m.steel,x+6.3,y+hy,z+dz);
  }
  for(const dx of [-5.8,5.8]){block(.05,1.05,16,m.rust,x+dx,y+19.3,z);for(const dz of [-7,0,7])block(.06,1.2,.06,m.steel,x+dx,y+19.3,z+dz);}
 }
}

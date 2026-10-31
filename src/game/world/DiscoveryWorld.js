import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import {DISCOVERY_SITES} from '../../data/ambience.js';
import {PropBatch} from './PropBatch.js';
import {roadX} from './terrain.js';
import {meshHeightAt} from './surfaceHeight.js';
import {groundStaticModel} from './staticModelPlacement.js';

export class DiscoveryWorld {
 constructor(scene,physics,m,world,assets,manifest){Object.assign(this,{scene,physics,m,world,assets,manifest});this.live=new Map();this.labels=new Map();
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(0,0,0,.6)');gradient.addColorStop(.55,'rgba(0,0,0,.25)');gradient.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  this.contactMaterial=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,opacity:.55,depthWrite:false,toneMapped:false});
 }
 floor(p){let y=-Infinity;for(let x=-p.width/2;x<=p.width/2;x+=2)for(let z=-p.depth/2;z<=p.depth/2;z+=2)y=Math.max(y,this.world.groundHeight(p.x+x,p.z+z));return y+.12;}
 build(p){
  const y=this.floor(p),m=this.m,b=new PropBatch(this.physics,m,{x:p.x,y,z:p.z});b.site=p;b.floor=y;b.leases=[];b.removed=false;
  b.box(p.width,.18,p.depth,m.concrete,0,-.09,0,true);
  const edge=p.depth/2,far=edge+8,left=this.world.groundHeight(p.x-2,p.z+far)-y+.02,right=this.world.groundHeight(p.x+2,p.z+far)-y+.02;
  const ramp=new THREE.BufferGeometry();ramp.setAttribute('position',new THREE.Float32BufferAttribute([-2,0,edge,2,0,edge,-2,left,far,2,right,far],3));ramp.setIndex([0,2,1,1,2,3]);ramp.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,4,0,0,8,4,8],2));ramp.computeVertexNormals();b.ramp=ramp.clone();b.owned.push(b.ramp);
  const body=this.physics.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(p.x,y,p.z));this.physics.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(ramp.attributes.position.array),new Uint32Array(ramp.index.array)),body);b.bodies.push(body);b.part(ramp,m.shoulder,0,0,0);
  if(p.kind==='motel')this.motel(b);else if(p.kind==='yard')this.yard(b);else this.weighbridge(b);
  // The inspection point is in front of the board, on the walkable side of the desk.
  const tx=p.terminal.x-p.x,tz=p.terminal.z-p.z;
  b.box(1.4,1,.6,m.wood,tx,.5,tz-1,true);b.box(1.6,.12,.8,m.steel,tx,1.05,tz-1);b.label('INSPECAO / RESERVA',1.3,.35,tx,1.3,tz-.66,this.labels);
  b.finish();b.group.name=`discovery:${p.id}`;this.scene.add(b.group);return b;
 }
 motel(b){const m=this.m;
  b.box(16,3.1,.22,m.concrete,0,1.55,-4,true);for(const x of [-8,8])b.box(.22,3.1,8,m.concrete,x,1.55,0,true);
  for(const x of [-5,5]){b.box(6,.8,.22,m.concrete,x,.4,4,true);b.box(6,.6,.22,m.concrete,x,2.8,4,true);for(const dx of [-2.8,2.8])b.box(.35,2,.22,m.concrete,x+dx,1.7,4,true);for(const dx of [-1.9,0,1.9]){b.box(.065,1.8,.08,m.steel,x+dx,1.7,4.13);if(dx!==0)b.box(1.7,1.6,.025,m.glass,x+dx+.6,1.7,4.15);}}
  for(const x of [-2,2])b.box(.12,3.1,.14,m.rust,x,1.55,4.1);b.part(new THREE.BoxGeometry(17,.12,4.5),m.roof,0,3.4,-2,[.08,0,0]);b.part(new THREE.BoxGeometry(11,.12,4.5),m.roof,-3,3.4,2,[-.08,0,0]);
  b.label('MOTEL ULTIMA LUZ',8,.9,0,3.6,4.45,this.labels);b.label('RECEPCAO / QUARTOS',2.4,.45,-4,2.5,1.4,this.labels);
  for(const x of [-5,-3])b.cable([[x,2.73,1.4],[x,3.3,1.4]],.012,m.steel);
  for(const x of [-6,-2,2,6])b.box(.09,.13,7.6,m.steel,x,3.2,0);
  b.cylinder(.045,16,m.rust,0,3.55,4.25,[0,0,Math.PI/2]);b.cylinder(.045,3.4,m.rust,7.7,1.7,4.25);
  b.bench(-4,0,1,2.6);b.box(1.5,.1,.9,m.wood,3,.7,-1,true);for(const x of [2,4]){b.box(.6,.07,.6,m.wood,x,.4,1);b.box(.6,.8,.08,m.wood,x,.8,1.3);}
  for(const x of [-5,5]){b.box(1.4,.2,2.1,m.steel,x,.3,-2.4,true);b.box(1.35,.2,2,m.fabric,x,.5,-2.4);b.box(1.1,.08,.4,m.paint,x,.65,-3.1);}
  b.crate(6,0,2,.7);b.cable([[-7,2.7,-3.8],[-4,2.4,-3.8],[0,2.7,-3.8]],.02,m.rubber);
 }
 yard(b){const m=this.m;
  for(const x of [-13,13]){for(let z=-8;z<=8;z+=4)b.box(.12,2,.12,m.steel,x,1,z,true);for(const y of [.5,1.7])b.box(.06,.07,16,m.rust,x,y,0);}
  for(const x of [-8,8])b.box(8,.15,.15,m.steel,x,1.3,9);b.box(27,.15,.15,m.steel,0,1.3,-9);
  for(const x of [3,11])for(const z of [-6,1])b.box(.15,4,.15,m.steel,x,2,z,true);b.box(10,.15,9,m.roof,7,4.1,-2.5);b.box(.35,.08,.25,m.steel,7,3.8,-2);
  b.bench(9,0,-3);for(const z of [-6,-4,0])b.barrel(11,0,z);for(const x of [-10,-8,-6]){b.crate(x,0,-7);b.crate(x,.7,-7,.75);}
  for(let i=0;i<3;i++)b.tire(4,.28*i,-5);b.label('PATIO DOS RETORNANTES',10,.9,0,3.4,8.9,this.labels);b.label('IMOBILIZADO / AGUARDA REPARO',4,.6,-7,2.8,3.5,this.labels);
  for(const x of [-5.3,5.3])b.box(.12,3.85,.12,m.rust,x,1.925,8.9,true);b.box(10.7,.12,.12,m.rust,0,3.4,8.82);
  for(const x of [-9.2,-4.8])b.box(.07,3.15,.07,m.steel,x,1.575,3.5,true);b.box(4.5,.08,.08,m.steel,-7,2.8,3.43);
 }
 weighbridge(b){const m=this.m;
  b.box(6,.15,10,m.steel,-3,.08,-.5,true);for(const x of [-5.7,-.3])b.box(.16,.06,10,m.stripe,x,.19,-.5);for(let z=-5;z<4;z+=.7)b.box(5.8,.03,.05,m.dark,-3,.17,z);
  b.box(4,2.8,.2,m.concrete,5,1.4,-2,true);for(const x of [3,7])b.box(.2,2.8,5,m.concrete,x,1.4,.5,true);for(const x of [3.5,6.5])b.box(1,2.8,.2,m.concrete,x,1.4,3,true);b.box(4,.15,5.5,m.roof,5,2.95,.5);
  b.box(1,.8,.12,m.dark,5,1.7,-1.8);b.label('BALANCA / DESATIVADA',4,.7,5,3.4,3.1,this.labels);b.label('ACESSO NUCLEO 1 / KM 2,89',4,.7,-3,2.1,-5.3,this.labels);
  for(const x of [-5.2,-.8])b.box(.07,2.5,.07,m.steel,x,1.25,-5.3,true);b.box(4.5,.08,.08,m.steel,-3,2.1,-5.37);
  for(const x of [-6.5,.5])b.box(.15,1.5,.15,m.steel,x,.75,4,true);b.box(6.7,.12,.1,m.stripe,-3,1.3,4);b.crate(7,0,-4,.8);
 }
 addParkedTruck(b){const definition=this.manifest?.candidates?.['dump-truck'];if(!definition?.rightsCleared)return;
  this.assets.model(definition.url).then(lease=>{if(this.disposed||b.removed){lease.release();return;}b.leases.push(lease);const size=groundStaticModel(lease.scene,-7,-1);b.group.add(lease.scene);b.group.updateMatrixWorld(true);b.solid(-7,size.y/2,-1,size.x,size.y,size.z);const shadowGeometry=new THREE.PlaneGeometry(size.x*1.15,size.z*1.05);shadowGeometry.rotateX(-Math.PI/2);const shadow=new THREE.Mesh(shadowGeometry,this.contactMaterial);shadow.position.set(-7,.012,-1);b.group.add(shadow);b.owned.push(shadowGeometry);b.parkedFloorGap=new THREE.Box3().setFromObject(lease.scene).min.y-b.floor;b.parkedModel=definition.url;}).catch(error=>{if(!this.disposed&&!b.removed)this.assets.errors.push(`parked truck: ${error.message}`);});
 }
 update(position,campaign){for(const p of DISCOVERY_SITES){const close=Math.hypot(position.x-p.x,position.z-p.z)<180;if(close&&!this.live.has(p.id)){const b=this.build(p);this.live.set(p.id,b);if(p.kind==='yard')this.addParkedTruck(b);}else if(!close&&this.live.has(p.id)){this.remove(this.live.get(p.id));this.live.delete(p.id);}}
 }
 target(p){return {...p.terminal,y:(this.live.get(p.id)?.floor??this.world.groundHeight(p.terminal.x,p.terminal.z))+1};}
 surfaceHeight(x,z){for(const b of this.live.values()){const p=b.site;if(Math.abs(x-p.x)<=p.width/2&&Math.abs(z-p.z)<=p.depth/2)return b.floor;const h=meshHeightAt(b.ramp,x-p.x,z-p.z);if(h!==null)return b.floor+h;}return null;}
 snapshot(){return {loaded:[...this.live.keys()],sites:[...this.live.values()].map(b=>({id:b.site.id,floor:b.floor,terminal:this.target(b.site),parkedModel:b.parkedModel||null,parkedFloorGap:b.parkedFloorGap??null,batches:b.group.children.length,colliders:b.bodies.length}))};}
 presentation(menu){for(const b of this.live.values())b.group.visible=!menu;}
 remove(b){b.removed=true;b.leases.forEach(l=>l.release());b.dispose();}
 reset(){for(const b of this.live.values())this.remove(b);this.live.clear();}
 dispose(){this.disposed=true;this.reset();this.contactMaterial.map.dispose();this.contactMaterial.dispose();for(const m of this.labels.values()){m.map.dispose();m.dispose();}}
}

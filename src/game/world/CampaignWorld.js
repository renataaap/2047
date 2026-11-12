import { hasCargo } from '../missions/network.js';
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { POINTS } from '../../data/campaign.js';
import { heightAt,roadX,randomSeed } from './terrain.js';
import { bevelGeometry } from '../render/materials.js';
import { mergeStatic } from '../render/mergeStatic.js';
import { groundUV } from '../render/metricUV.js';
export class CampaignWorld {
constructor(scene,physics,m){this.scene=scene;this.physics=physics;this.m=m;this.group=new THREE.Group();this.bodies=[];scene.add(this.group);this.restored=false;this.growth=0;
const mesh=(g,mat,x,y,z,parent=this.group)=>{const o=new THREE.Mesh(g,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
const solid=(x,y,z,w,h,d)=>{const b=physics.createRigidBody(RAPIER.RigidBodyDesc.fixed());physics.createCollider(RAPIER.ColliderDesc.cuboid(w/2,h/2,d/2).setTranslation(x,y,z),b);this.bodies.push(b);return b;};
this.solid=solid;
const s=POINTS.shelter,sy=heightAt(s.x,s.z);this.npc=new THREE.Group();this.npc.name='Sobrevivente · visual provisório';this.npc.position.set(s.x,sy,s.z);this.group.add(this.npc);mesh(new THREE.CapsuleGeometry(.3,.85,3,7),m.dark,0,1,0,this.npc);mesh(new THREE.SphereGeometry(.23,8,6),m.paint,0,1.75,0,this.npc);mesh(bevelGeometry(.75,.2,.48),m.rust,0,1.45,0,this.npc);const npcBody=solid(s.x,sy+.8,s.z,.6,1.6,.6);npcBody.userData={entityType:'npc',interactionKey:'npc:survivor'};this.npcBody=npcBody;
const p=POINTS.core,y=heightAt(p.x,p.z);mesh(new THREE.CylinderGeometry(9,10,1.1,20),m.dark,p.x,y+.3,p.z);solid(p.x,y+.3,p.z,14,.8,14);
for(const x of [-6,6])mesh(bevelGeometry(1.5,11,1.7),m.steel,p.x+x,y+5.8,p.z);const arch=mesh(new THREE.TorusGeometry(6, .65,6,24,Math.PI),m.rust,p.x,y+8,p.z);arch.rotation.z=0;
mesh(new THREE.CylinderGeometry(2,2.8,5,12),m.steel,p.x,y+3,p.z);this.indicator=mesh(new THREE.TorusGeometry(2.2,.18,5,16),m.paint,p.x,y+4,p.z);this.indicator.rotation.x=Math.PI/2;
mesh(bevelGeometry(1.6,1.2,.8),m.paint,p.x-1,y+1.4,p.z+8);solid(p.x-1,y+1,p.z+8,1.6,2,.8).userData={interactionKey:'terminal:core-1'};
// Área de entrega: balizadores reais, sem bloquear a manobra.
for(const dx of [-6,6])for(const dz of [-7,7]){const v=POINTS.delivery;mesh(new THREE.CylinderGeometry(.16,.23,.8,7),m.rust,v.x+dx,heightAt(v.x+dx,v.z+dz)+.4,v.z+dz);}
const c=POINTS.salvage,cy=heightAt(c.x,c.z);mesh(bevelGeometry(2,.9,1.3),m.rust,c.x,cy+.5,c.z);this.cache=mesh(bevelGeometry(1.6,.3,1.15),m.paint,c.x,cy+1,c.z);
// Rodovia soterrada; a restauração consolida o terreno e libera a passagem.
this.barrier=new THREE.Group();this.group.add(this.barrier);const bz=-1100,bx=roadX(bz);mesh(new THREE.DodecahedronGeometry(1,0),m.ground,bx,heightAt(bx,bz)+1.5,bz,this.barrier).scale.set(25,5,35);this.makeBarrier=()=>{const b=physics.createRigidBody(RAPIER.RigidBodyDesc.fixed());physics.createCollider(RAPIER.ColliderDesc.cuboid(21,2.2,25).setTranslation(bx,heightAt(bx,bz)+1.9,bz),b);return b;};this.barrierBody=this.makeBarrier();
// O atalho exige atravessar ondulações físicas, não uma penalidade aleatória.
const positions=[],indices=[];for(let i=0;i<=100;i++){const z=-800-i*6,x=roadX(z)-37,h=heightAt(x,z)+.25+Math.sin(i*.75)*.35;positions.push(x-7,h,z,x+7,h,z);if(i<100){const j=i*2;indices.push(j,j+2,j+1,j+1,j+2,j+3);}}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();groundUV(g);mesh(g,m.ground,0,0,0);const rb=physics.createRigidBody(RAPIER.RigidBodyDesc.fixed());physics.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(positions),new Uint32Array(indices)),rb);this.bodies.push(rb);
// Geometria de placas direcionais visível na bifurcação.
for(const dx of [-13,13]){const z=-680,x=roadX(z)+dx;mesh(bevelGeometry(.16,3,.16),m.rust,x,heightAt(x,z)+1.5,z);const sign=mesh(bevelGeometry(3,.8,.15),m.paint,x,heightAt(x,z)+2.6,z);sign.rotation.y=dx>0?-.4:.4;}
this.cargo=new THREE.Group();mesh(new THREE.CylinderGeometry(.48,.48,2.2,12),m.steel,0,.8,1.5,this.cargo).rotation.x=Math.PI/2;for(const z of [.4,2.6])mesh(new THREE.CylinderGeometry(.58,.58,.2,12),m.rust,0,.8,z,this.cargo).rotation.x=Math.PI/2;mesh(bevelGeometry(.28,.22,1.7),m.paint,0,1.25,1.5,this.cargo);this.cargo.visible=false;
mergeStatic(this.group,new Set([this.cache,this.indicator]));mergeStatic(this.cargo);
}
apply(restored){if(restored===this.restored)return;this.restored=restored;this.barrier.visible=!restored;if(restored&&this.barrierBody){this.physics.removeRigidBody(this.barrierBody);this.barrierBody=null;}else if(!restored&&!this.barrierBody)this.barrierBody=this.makeBarrier();}
update(c){this.indicator.material=c.cores['core-1']?.state==='active'?this.m.light:this.m.paint;this.apply(c.restoration.ashes);this.cargo.visible=hasCargo(c);this.cache.visible=!c.collected.includes('road-cache');}

dispose(){if(this.barrierBody)this.physics.removeRigidBody(this.barrierBody);this.bodies.forEach(b=>this.physics.removeRigidBody(b));for(const group of [this.group,this.cargo]){group.traverse(o=>{o.geometry?.dispose();if(o.isInstancedMesh)o.dispose();});group.removeFromParent();}}
}
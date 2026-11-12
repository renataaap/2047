import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import {CharacterActor} from '../player/CharacterActor.js';
import {workerDefinition} from '../player/workerDefinition.js';
import {BRUTUS_SPOT,brutusPresent} from './cutscenes/brutus.js';

// Story 005: Garcia (Brutus) no mundo. Antes do encontro ele não existe: sem visual, colisor nem
// interação. Durante a cena 'brutus-meeting' a cena o move (place); depois fica parado no ponto do
// colisor, junto à bomba de Afonso. Personagem provisório (rig CC0 compartilhado), como os outros NPCs.
export class BrutusPresence {
 /** @param {THREE.Scene} scene @param {RAPIER.World} physics @param {object} assets @param {(x:number,z:number)=>number} groundHeight */
 constructor(scene,physics,assets,groundHeight){
  this.ground=groundHeight;this.placeholder=new THREE.Group();this.placeholder.name='Garcia · visual provisório';this.placeholder.visible=false;
  const mat=new THREE.MeshStandardMaterial({color:0x3b3532,roughness:.85}),head=new THREE.MeshStandardMaterial({color:0x8a6a55,roughness:.8});this.materials=[mat,head];
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.34,.95,3,7),mat);body.position.y=1;const skull=new THREE.Mesh(new THREE.SphereGeometry(.24,8,6),head);skull.position.y=1.82;
  for(const o of [body,skull]){o.castShadow=o.receiveShadow=true;this.placeholder.add(o);}
  scene.add(this.placeholder);
  const y=groundHeight(BRUTUS_SPOT.x,BRUTUS_SPOT.z);this.placeholder.position.set(BRUTUS_SPOT.x,y,BRUTUS_SPOT.z);
  this.body=physics.createRigidBody(RAPIER.RigidBodyDesc.fixed());
  physics.createCollider(RAPIER.ColliderDesc.cuboid(.3,.9,.3).setTranslation(BRUTUS_SPOT.x,y+.9,BRUTUS_SPOT.z),this.body);
  this.body.userData={entityType:'npc',id:'brutus'};this.body.setEnabled(false);
  this.actor=new CharacterActor(assets,this.placeholder);this.shown=false;this.cinematic=null;
 }
 /** Loads the shared worker rig with Garcia's palette; failures keep the capsule. */
 load(base){return this.actor.load(workerDefinition(base,'brutus'));}
 /** Root that moves: the animated rig once loaded, else the capsule. */
 get root(){return this.actor.anchor||this.placeholder;}
 /** Called by the cutscene each frame: position on the ground, heading and walking speed. */
 place(x,y,z,heading,speed){this.root.position.set(x,y,z);if(Number.isFinite(heading))this.root.rotation.y=heading;this.cinematic={speed:speed||0,heading:Number.isFinite(heading)?heading:this.root.rotation.y};}
 /** Shows Garcia after the meeting (or while it plays); the collider only when he stands still at the spot. */
 update(dt,viewer,campaign,playing){
  const show=brutusPresent(campaign)||playing,solid=show&&!playing;
  if(!playing&&this.cinematic){this.cinematic=null;this.root.position.set(BRUTUS_SPOT.x,this.ground(BRUTUS_SPOT.x,BRUTUS_SPOT.z),BRUTUS_SPOT.z);}
  if(this.shown!==show){this.shown=show;}
  if(this.body.isEnabled()!==solid)this.body.setEnabled(solid);
  this.root.visible=show;if(this.actor.anchor)this.placeholder.visible=false;
  if(show&&this.actor.model)this.actor.update(dt,viewer,this.cinematic?.speed||0,this.cinematic?.heading);
 }
 snapshot(){return {visible:this.shown,solid:this.body.isEnabled(),position:this.root.position.toArray(),actor:this.actor.snapshot()};}
 dispose(){this.actor.dispose();this.placeholder.removeFromParent();this.placeholder.traverse(o=>o.geometry?.dispose());this.materials.forEach(m=>m.dispose());}
}

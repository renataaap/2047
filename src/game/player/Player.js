import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import {cameraPosition} from '../render/cameraCollision.js';
import { heightAt } from '../world/terrain.js';
import { canTakeFootStep } from './exitPolicy.js';
export class Player {
 constructor(world,groundHeight=heightAt){this.world=world;this.groundHeight=groundHeight;this.body=world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(-3,1,5));this.collider=world.createCollider(RAPIER.ColliderDesc.capsule(.55,.32),this.body);this.controller=world.createCharacterController(.03);this.controller.enableAutostep(.35,.3,true);this.controller.enableSnapToGround(.25);this.yaw=0;this.pitch=0;this.velocityY=0;this.enabled=false;this.view='first';this.cameraInitial=true;}
 teleport(x,z,y=this.groundHeight(x,z)+1.1){this.body.setTranslation({x,y,z},true);this.body.setNextKinematicTranslation({x,y,z});this.velocityY=0;this.cameraInitial=true;}
 look(dx,dy){this.yaw-=dx*.0025;this.pitch=Math.max(-1.1,Math.min(1.1,this.pitch-dy*.0025));}
 update(input,dt,truck){const p=this.body.translation();const speed=(input.run?5.5:3)*(input.moveScale||1);let x=input.x||0,z=input.z||0;const l=Math.hypot(x,z);if(l>1){x/=l;z/=l;}const dx=(x*Math.cos(this.yaw)+z*Math.sin(this.yaw))*speed*dt,dz=(-x*Math.sin(this.yaw)+z*Math.cos(this.yaw))*speed*dt;
 if(this.controller.computedGrounded()&&this.velocityY<0)this.velocityY=0;if(input.jump&&this.controller.computedGrounded())this.velocityY=4.4;this.velocityY-=9.81*dt;
 const allowed=canTakeFootStep(p,{x:p.x+dx,z:p.z+dz},truck);this.boundaryBlocked=!allowed;this.controller.computeColliderMovement(this.collider,{x:allowed?dx:0,y:this.velocityY*dt,z:allowed?dz:0});const m=this.controller.computedMovement();this.speed=Math.hypot(m.x,m.z)/dt;if(this.speed>.05)this.heading=Math.atan2(m.x,m.z);this.body.setNextKinematicTranslation({x:p.x+m.x,y:p.y+m.y,z:p.z+m.z});}
 findExit(truck){
 const p=truck.body.translation(),q=new THREE.Quaternion().copy(truck.body.rotation());
 for(const [x,z] of [[-2.8,-2.5],[2.8,-2.5],[-3,0],[3,0],[0,5.4]]){
  const offset=new THREE.Vector3(x,0,z).applyQuaternion(q),px=p.x+offset.x,pz=p.z+offset.z;
  const ray=new RAPIER.Ray({x:px,y:Math.max(heightAt(px,pz)+2,p.y+1),z:pz},{x:0,y:-1,z:0});
  const hit=this.world.castRay(ray,20,true,RAPIER.QueryFilterFlags.EXCLUDE_DYNAMIC,undefined,this.collider);
  if(!hit)continue;const y=ray.origin.y-hit.timeOfImpact+.93;
  const blocked=this.world.intersectionWithShape({x:px,y,z:pz},{x:0,y:0,z:0,w:1},new RAPIER.Capsule(.55,.32),undefined,undefined,this.collider);
  if(!blocked)return {x:px,y,z:pz};
 }
 return null;
 }
 toggleView(){this.view=this.view==='first'?'third':'first';}
 camera(camera,dt){
 const p=this.body.translation(),eye=new THREE.Vector3(p.x,p.y+.62,p.z),rotation=new THREE.Euler(this.pitch,this.yaw,0,'YXZ');
 const wanted=this.view==='third'?eye.clone().add(new THREE.Vector3(.55,.65,4.2).applyEuler(rotation)):eye;
 const safe=this.view==='third'?cameraPosition(this.world,eye,wanted,this.body,undefined,true):wanted;
 camera.position.lerp(safe,this.cameraInitial?1:1-Math.exp(-dt*(this.view==='third'?9:20)));
 if(this.view==='third')camera.position.copy(cameraPosition(this.world,eye,camera.position,this.body,undefined,true));
 camera.up.set(0,1,0);camera.rotation.order='YXZ';camera.rotation.set(this.pitch,this.yaw,0,'YXZ');
 const fov=this.view==='third'?58:64;if(camera.fov!==fov){camera.fov=fov;camera.updateProjectionMatrix();}this.cameraInitial=false;
 }
 dispose(){this.world.removeCharacterController(this.controller);this.world.removeRigidBody(this.body);}
}

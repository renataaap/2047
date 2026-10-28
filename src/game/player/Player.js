import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { heightAt } from '../world/terrain.js';
import { inFootZone } from '../missions/campaign.js';
export class Player {
 constructor(world){this.world=world;this.body=world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(-3,1,5));this.collider=world.createCollider(RAPIER.ColliderDesc.capsule(.55,.32),this.body);this.controller=world.createCharacterController(.03);this.controller.enableAutostep(.35,.3,true);this.controller.enableSnapToGround(.25);this.yaw=0;this.pitch=0;this.velocityY=0;this.enabled=false;}
 teleport(x,z,y=heightAt(x,z)+1.1){this.body.setTranslation({x,y,z},true);this.body.setNextKinematicTranslation({x,y,z});this.velocityY=0;}
 look(dx,dy){this.yaw-=dx*.0025;this.pitch=Math.max(-1.1,Math.min(1.1,this.pitch-dy*.0025));}
 update(input,dt){const p=this.body.translation();const speed=(input.run?5.5:3)*(input.moveScale||1);let x=input.x||0,z=input.z||0;const l=Math.hypot(x,z);if(l>1){x/=l;z/=l;}const dx=(x*Math.cos(this.yaw)+z*Math.sin(this.yaw))*speed*dt,dz=(-x*Math.sin(this.yaw)+z*Math.cos(this.yaw))*speed*dt;
 if(this.controller.computedGrounded()&&this.velocityY<0)this.velocityY=0;if(input.jump&&this.controller.computedGrounded())this.velocityY=4.4;this.velocityY-=9.81*dt;
 const allowed=inFootZone({x:p.x+dx,z:p.z+dz});this.controller.computeColliderMovement(this.collider,{x:allowed?dx:0,y:this.velocityY*dt,z:allowed?dz:0});const m=this.controller.computedMovement();this.body.setNextKinematicTranslation({x:p.x+m.x,y:p.y+m.y,z:p.z+m.z});}
 camera(camera,dt){const p=this.body.translation();camera.position.lerp(new THREE.Vector3(p.x,p.y+.62,p.z),1-Math.exp(-dt*20));camera.rotation.order='YXZ';camera.rotation.set(this.pitch,this.yaw,0,'YXZ');}
 dispose(){this.world.removeCharacterController(this.controller);this.world.removeRigidBody(this.body);}
}

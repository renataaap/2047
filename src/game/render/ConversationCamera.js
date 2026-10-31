import * as THREE from 'three';
import {cameraPosition} from './cameraCollision.js';
import {heightAt} from '../world/terrain.js';
export class ConversationCamera {
 constructor(camera,physics,player){this.camera=camera;this.physics=physics;this.player=player;}
 update(target,dt){
  const p=this.player.body.translation(),at=new THREE.Vector3(target.x,heightAt(target.x,target.z)+1.52,target.z),toward=new THREE.Vector3(p.x-at.x,0,p.z-at.z);
  if(toward.length()<.9)toward.set(.45,0,1);toward.normalize();
  const desired=at.clone().addScaledVector(toward,2.1);desired.y+=.08;desired.add(new THREE.Vector3(toward.z,0,-toward.x).multiplyScalar(.38));
  const safe=cameraPosition(this.physics,at,desired,this.player.body,c=>c.parent()?.userData?.entityType!=='npc');this.camera.position.lerp(safe,1-Math.exp(-dt*5));this.camera.position.copy(cameraPosition(this.physics,at,this.camera.position,this.player.body,c=>c.parent()?.userData?.entityType!=='npc'));this.camera.up.set(0,1,0);
  const wanted=new THREE.Matrix4().lookAt(this.camera.position,at,this.camera.up),q=new THREE.Quaternion().setFromRotationMatrix(wanted);this.camera.quaternion.slerp(q,1-Math.exp(-dt*7));
  if(this.camera.fov!==48){this.camera.fov=48;this.camera.updateProjectionMatrix();}
 }
}

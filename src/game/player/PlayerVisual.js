import * as THREE from 'three';
import {CharacterActor} from './CharacterActor.js';
import {workerDefinition} from './workerDefinition.js';
import {SeatedPose} from './SeatedPose.js';
export class PlayerVisual {
 constructor(scene,assets,player){this.player=player;this.placeholder=new THREE.Group();scene.add(this.placeholder);this.actor=new CharacterActor(assets,this.placeholder);this.last=new THREE.Vector3().copy(player.body.translation());this.heading=Math.PI;}
 async load(def){return this.actor.load(workerDefinition(def,'dante'));}
 update(dt,walking,active,truck,driving=false,inside=false){
  // AnimationMixer can skip unchanged tracks: undo our visual override first.
  this.seatedPose?.restore();
  const p=this.player.body.translation(),pos=new THREE.Vector3(p.x,p.y,p.z),distance=pos.distanceTo(this.last),speed=active?this.player.speed||0:0;
  if(driving&&this.actor.anchor&&truck){
   this.actor.update(dt,pos,0,0);truck.cab.updateWorldMatrix(true,false);this.actor.anchor.position.copy(new THREE.Vector3(-.61,-.65,-2.12).applyMatrix4(truck.cab.matrixWorld));this.actor.anchor.quaternion.copy(truck.cab.getWorldQuaternion(new THREE.Quaternion())).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI));this.actor.anchor.visible=!inside;
   this.seatedPose??=new SeatedPose(this.actor.model);this.seatedPose.apply();this.pose='seated';return;
  }
  this.pose='walking';
  if(speed>.08){const wanted=this.player.heading??this.heading,delta=Math.atan2(Math.sin(wanted-this.heading),Math.cos(wanted-this.heading));this.heading+=delta*(1-Math.exp(-dt*14));}
  this.last.copy(pos);if(!this.actor.anchor)return;
  this.actor.anchor.position.set(p.x,p.y-.87,p.z);this.actor.anchor.visible=walking&&this.player.view==='third';this.actor.update(dt,pos,speed,this.heading);
 }
 gesture(name){if(name==='enter')this.enterSeconds=.7;this.actor.playGesture(name);}
 snapshot(){return {...this.actor.snapshot(),pose:this.pose||'walking',heading:this.heading,position:this.actor.anchor?.position.toArray()||null};}
 dispose(){this.actor.dispose();this.placeholder.removeFromParent();}
}

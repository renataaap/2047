import * as THREE from 'three';
import {CharacterActor} from './CharacterActor.js';
import {workerDefinition} from './workerDefinition.js';
export class PlayerVisual {
 constructor(scene,assets,player){this.player=player;this.placeholder=new THREE.Group();scene.add(this.placeholder);this.actor=new CharacterActor(assets,this.placeholder);this.last=new THREE.Vector3().copy(player.body.translation());this.heading=Math.PI;}
 async load(def){return this.actor.load(workerDefinition(def,'dante'));}
 update(dt,walking,active){
  const p=this.player.body.translation(),pos=new THREE.Vector3(p.x,p.y,p.z),distance=pos.distanceTo(this.last),speed=active?this.player.speed||0:0;
  if(speed>.08){const wanted=this.player.heading??this.heading,delta=Math.atan2(Math.sin(wanted-this.heading),Math.cos(wanted-this.heading));this.heading+=delta*(1-Math.exp(-dt*14));}
  this.last.copy(pos);if(!this.actor.anchor)return;
  this.actor.anchor.position.set(p.x,p.y-.87,p.z);this.enterSeconds=Math.max(0,(this.enterSeconds||0)-dt);this.actor.anchor.visible=(walking||this.enterSeconds>0)&&this.player.view==='third';this.actor.update(dt,pos,speed,this.heading);
 }
 gesture(name){if(name==='enter')this.enterSeconds=.7;this.actor.playGesture(name);}
 snapshot(){return {...this.actor.snapshot(),heading:this.heading,position:this.actor.anchor?.position.toArray()||null};}
 dispose(){this.actor.dispose();this.placeholder.removeFromParent();}
}

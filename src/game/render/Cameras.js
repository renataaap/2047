import * as THREE from 'three';
import { heightAt } from '../world/terrain.js';
export class Cameras {
  constructor(camera){this.camera=camera;this.mode=0;this.angle=.45;this.elevation=.3;this.distance=12;this.target=new THREE.Vector3();this.desired=new THREE.Vector3();this.focus=new THREE.Vector3();this.initial=true;}
  cycle(){this.mode=(this.mode+1)%3;}
  orbit(dx,dy){this.angle-=dx*.005;this.elevation=Math.max(.05,Math.min(1.1,this.elevation+dy*.004));}
  zoom(delta){this.distance=Math.max(5,Math.min(25,this.distance+delta*.01));}
  update(truck,menu,time,dt){
    const p=truck.position,q=truck.quaternion;
    if(menu){this.desired.set(11+Math.sin(time*.06)*1.2,4.7,-9);this.desired.add(p);this.focus.copy(p).add(new THREE.Vector3(-2,1.1,-.5));}
    else if(this.mode===1){this.desired.set(-.62,1.85,-2.7).applyQuaternion(q).add(p);this.focus.set(-.62,1.65,-40).applyQuaternion(q).add(p);}
    else {const offset=this.mode===0?new THREE.Vector3(3.5,3.6,11.8):new THREE.Vector3(Math.sin(this.angle)*this.distance,Math.sin(this.elevation)*this.distance+1,Math.cos(this.angle)*this.distance);this.desired.copy(offset.applyQuaternion(q).add(p));this.desired.y=Math.max(this.desired.y,heightAt(this.desired.x,this.desired.z)+1.3);this.focus.set(0,1.1,-5.8).applyQuaternion(q).add(p);}
    const a=this.initial?1:1-Math.exp(-dt*(this.mode===1&&!menu?11:4));this.camera.position.lerp(this.desired,a);this.target.lerp(this.focus,a);this.camera.lookAt(this.target);this.initial=false;
  }
}

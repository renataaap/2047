import * as THREE from 'three';
import {CORES} from '../../data/network.js';
import {cameraPosition} from '../render/cameraCollision.js';
import {smooth} from './progress.js';

// Presentation only. The mission has already committed its result before this
// can run; skipping/loading never consumes a second seed or advances the clock.
export class RestorationCinematic{
 constructor(game){this.g=game;this.active=false;this.pending=null;this.elapsed=0;}
 queue(id){const r=this.g.campaign.world?.recovery?.cores[id];if(!r||r.cinematicSeen||this.pending||this.active)return false;r.cinematicSeen=true;this.pending=id;return true;}
 begin(){
  if(!this.pending||this.active)return false;const g=this.g;this.core=CORES.find(k=>k.id===this.pending);this.pending=null;if(!this.core)return false;
  this.returnMode=g.state.resumeMode||'walking';this.saved={position:g.rendering.camera.position.clone(),quaternion:g.rendering.camera.quaternion.clone(),fov:g.rendering.camera.fov};
  this.reduced=!!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;this.duration=this.reduced?1.8:7;this.elapsed=0;this.active=true;
  g.state.mode='cinematic';g.state.overlay=null;g.input.setContext('cinematic');g.audio.pause?.();g.ambientAudio?.setPaused(true);g.loop.reset();return true;
 }
 update(dt){
  if(!this.active)return;const g=this.g,k=this.core,cam=g.rendering.camera;this.elapsed=Math.min(this.duration,this.elapsed+Math.max(0,dt));const t=this.elapsed/this.duration;
  if(!this.reduced){
   const y=g.world.recoveryHeight(k.x,k.z),reveal=smooth(.37,.72,t),sweep=smooth(0,.36,t);
   const center=new THREE.Vector3(k.x,y+5.2,k.z),land=new THREE.Vector3(k.x+52,g.world.recoveryHeight(k.x+52,k.z-30)+.6,k.z-30),look=center.clone().lerp(land,reveal);
   const wanted=new THREE.Vector3(k.x+30+sweep*7,y+11-sweep*2,k.z+35-sweep*14).lerp(new THREE.Vector3(k.x+78,g.world.recoveryHeight(k.x+78,k.z+5)+3.6,k.z+5),reveal);
   const safe=cameraPosition(g.physics,look,wanted,g.player.body,undefined,true);safe.y=Math.max(safe.y,g.world.recoveryHeight(safe.x,safe.z)+1.2);
   cam.position.copy(safe);cam.up.set(0,1,0);cam.lookAt(look);cam.fov=54;const back=smooth(.83,1,t);cam.position.lerp(this.saved.position,back);cam.quaternion.slerp(this.saved.quaternion,back);cam.fov=THREE.MathUtils.lerp(54,this.saved.fov,back);cam.updateProjectionMatrix();
  }
  if(this.elapsed>=this.duration)this.finish(false);
 }
 finish(skipped=true){if(!this.active)return false;const g=this.g;this.active=false;this.skipped=skipped;const cam=g.rendering.camera;cam.position.copy(this.saved.position);cam.quaternion.copy(this.saved.quaternion);cam.fov=this.saved.fov;cam.updateProjectionMatrix();g.player.cameraInitial=true;g.cameras.initial=true;g.state.mode=this.returnMode;g.state.resumeMode=this.returnMode;g.state.overlay=null;g.input.setContext(this.returnMode);g.ambientAudio?.setPaused(false);g.loop.reset();g.last=performance.now();return true;}
 reset(){if(this.active)this.finish(true);this.pending=null;this.core=null;}
 snapshot(){return {active:this.active,pending:this.pending,core:this.core?.id||null,elapsed:this.elapsed,duration:this.duration||0,reducedMotion:!!this.reduced,skipped:!!this.skipped};}
}

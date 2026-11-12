import * as THREE from 'three';
import {CORES} from '../../data/network.js';
import {cameraPosition} from '../render/cameraCollision.js';
import {CutscenePlayer} from '../narrative/cutscene.js';
import {smooth} from './progress.js';

// Presentation only. The mission has already committed its result before this
// can run; skipping/loading never consumes a second seed or advances the clock.
// Runs on the shared CutscenePlayer (suspend/restore, reduced motion, skip); only the
// terrain-dependent camera path is specific to the restoration (7 s, 1.8 s reduced).
const RESTORATION_SECONDS=7;

function frame(p,t){
 const g=p.g,k=p.core,cam=g.rendering.camera;
 const y=g.world.recoveryHeight(k.x,k.z),reveal=smooth(.37,.72,t),sweep=smooth(0,.36,t);
 const center=new THREE.Vector3(k.x,y+5.2,k.z),land=new THREE.Vector3(k.x+52,g.world.recoveryHeight(k.x+52,k.z-30)+.6,k.z-30),look=center.clone().lerp(land,reveal);
 const wanted=new THREE.Vector3(k.x+30+sweep*7,y+11-sweep*2,k.z+35-sweep*14).lerp(new THREE.Vector3(k.x+78,g.world.recoveryHeight(k.x+78,k.z+5)+3.6,k.z+5),reveal);
 const safe=cameraPosition(g.physics,look,wanted,g.player.body,undefined,true);safe.y=Math.max(safe.y,g.world.recoveryHeight(safe.x,safe.z)+1.2);
 cam.position.copy(safe);cam.up.set(0,1,0);cam.lookAt(look);cam.fov=54;const back=smooth(.83,1,t);cam.position.lerp(p.saved.position,back);cam.quaternion.slerp(p.saved.quaternion,back);cam.fov=THREE.MathUtils.lerp(54,p.saved.fov,back);cam.updateProjectionMatrix();
}

export class RestorationCinematic extends CutscenePlayer{
 constructor(game){super(game);this.pending=null;}
 /** Marks the core's presentation as seen and schedules it once. */
 queue(id){const r=this.g.campaign.world?.recovery?.cores[id];if(!r||r.cinematicSeen||this.pending||this.active)return false;r.cinematicSeen=true;this.pending=id;return true;}
 begin(){
  if(!this.pending||this.active||this.g.cutscenes?.active)return false;this.core=CORES.find(k=>k.id===this.pending);this.pending=null;if(!this.core)return false;
  return this.start({id:'restoration',shots:[{duration:RESTORATION_SECONDS}],frame});
 }
 reset(){super.reset();this.pending=null;this.core=null;}
 snapshot(){return {active:this.active,pending:this.pending,core:this.core?.id||null,elapsed:this.elapsed,duration:this.duration||0,reducedMotion:!!this.reduced,skipped:!!this.skipped};}
}

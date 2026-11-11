import * as THREE from 'three';
import {SCENES,SPEAKERS} from '../../data/story.js';
import {recordScene,sceneSeen} from './story.js';
import {smooth} from '../restoration/progress.js';

// Reusable narrative cutscene player (brief MVP 1, story-001).
// A cutscene is data: {id, shots:[{duration, camera?, caption?, light?, audio?}]}.
//  camera  {from:{pos:[x,y,z],look:[x,y,z],fov?}, to?:{...}}  world coordinates, eased
//  caption {speaker:<key of SPEAKERS>, text}                  never the Voice's identity
//  light   {exposure:0.2..2}                                   tone-mapping multiplier
//  audio   {cue:'repair'|'pulse'}                              existing AmbientAudio cue
//  tone/card (presentation) tone: CSS grade name; card: {kicker,text} title card; def.also: extra scene ids recorded with the same outcome
// Content lives in later stories; fill CUTSCENES with ids listed in data/story.js SCENES.
// Presentation only: the result a scene shows is already committed to the campaign, so
// skipping and watching end in the same world state (only campaign.story.scenes differs:
// 'watched' vs 'skipped', and a skip never downgrades a watch).
export const CUTSCENES={};
export const REDUCED_SECONDS=1.8;
const BACK_SECONDS=.6;
const CUES=['repair','pulse'];
const vec=v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite);
const pose=p=>!!p&&typeof p==='object'&&vec(p.pos)&&vec(p.look)&&(p.fov===undefined||(Number.isFinite(p.fov)&&p.fov>10&&p.fov<120));

/** Validates authored cutscene data without changing it. */
export function validCutscene(def){
 if(!def||typeof def!=='object'||!Array.isArray(def.shots)||!def.shots.length||typeof def.id!=='string')return false;
 if(def.reducedShot!==undefined&&!(Number.isInteger(def.reducedShot)&&def.reducedShot>=0&&def.reducedShot<def.shots.length))return false;
 return def.shots.every(s=>!!s&&Number.isFinite(s.duration)&&s.duration>0&&s.duration<=60
  &&(s.camera===undefined||(pose(s.camera.from)&&(s.camera.to===undefined||pose(s.camera.to))))
  &&(s.caption===undefined||(Object.hasOwn(SPEAKERS,s.caption.speaker)&&typeof s.caption.text==='string'&&!!s.caption.text&&s.caption.text.length<=300))
  &&(s.light===undefined||(Number.isFinite(s.light.exposure)&&s.light.exposure>=.2&&s.light.exposure<=2))
  &&(s.audio===undefined||CUES.includes(s.audio.cue)));
}

/**
 * Single player for every cutscene. Optional def.enter(player)/def.exit(player) mount and free
 * scene-owned resources; exit runs on every end (watched, skipped or reset).
 * Suspends physics/input by switching the game mode to
 * 'cinematic' (the game loop only simulates in driving/walking), advances only through
 * update(dt) so menus never move the clock, and restores camera/mode/context on finish.
 */
export class CutscenePlayer{
 constructor(game){this.g=game;this.active=false;this.queued=[];this.elapsed=0;this.duration=0;}

 /** Queues a registered cutscene by id. False when unknown/invalid, already seen, or already queued/playing. */
 queue(id){
  const def=CUTSCENES[id];
  if(!SCENES.includes(id)||!validCutscene(def)||def.id!==id||sceneSeen(this.g.campaign,id)||this.queued.includes(id)||this.def?.id===id&&this.active)return false;
  this.queued.push(id);return true;
 }
 /** Starts the next queued cutscene (host decides when: never mid-menu). */
 begin(){if(this.active||!this.queued.length||this.g.restoration?.cinematic?.active)return false;return this.start(CUTSCENES[this.queued.shift()]);}

 /** Shared suspend sequence; also used by subclasses with a procedural def.frame(player,t). */
 start(def){
  if(this.active)return false;const g=this.g,cam=g.rendering.camera;
  this.def=def;this.returnMode=['driving','walking'].includes(g.state.mode)?g.state.mode:(g.state.resumeMode||'walking');this.saved={position:cam.position.clone(),quaternion:cam.quaternion.clone(),fov:cam.fov};
  this.exposure=g.rendering.renderer?.toneMappingExposure;
  this.reduced=!!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const total=def.shots.reduce((a,s)=>a+s.duration,0);this.duration=this.reduced?Math.min(total,def.reducedSeconds??REDUCED_SECONDS):total;
  this.elapsed=0;this.shot=-1;this.skipped=false;this.active=true;
  g.state.mode='cinematic';g.state.overlay=null;g.input.setContext('cinematic');g.audio.pause?.();g.ambientAudio?.setPaused(true);g.loop.reset();
  def.enter?.(this);this.enterShot(this.reduced?(def.reducedShot??0):0);return true;
 }

 // Selects the shot for the current time. Reduced motion shows one shot: def.reducedShot, else the first
 // (borrowing the first caption when that shot has none).
 enterShot(index){
  const g=this.g,shot=this.def.shots[index];this.shot=index;
  const cap=shot.caption||(this.reduced&&this.def.reducedShot===undefined?this.def.shots.find(s=>s.caption)?.caption:null);
  g.state.cutscene={id:this.def.id,caption:cap?{speaker:SPEAKERS[cap.speaker],text:cap.text}:null,reduced:this.reduced,...(shot.tone?{tone:shot.tone}:{}),...(shot.card?{card:shot.card}:{})};
  if(shot.audio&&!this.reduced)g.ambientAudio?.cue?.(shot.audio.cue,g.rendering.camera.position);
  g.emit?.();
 }

 /** Advances by dt seconds of presentation time. Call only from the game loop. */
 update(dt){
  if(!this.active)return;const g=this.g,cam=g.rendering.camera;
  this.elapsed=Math.min(this.duration,this.elapsed+Math.max(0,dt));
  let start=0,index=0;const shots=this.def.shots;
  while(index<shots.length-1&&this.elapsed>=start+shots[index].duration){start+=shots[index].duration;index++;}
  if(index!==this.shot&&!this.reduced)this.enterShot(index);
  const shot=shots[this.reduced?0:index],local=this.reduced?0:Math.min(1,(this.elapsed-start)/shot.duration);
  if(!this.reduced){
   if(this.def.frame)this.def.frame(this,this.elapsed/this.duration);
   else if(shot.camera)this.dataCamera(shot.camera,local);
   if(shot.light&&g.rendering.renderer)g.rendering.renderer.toneMappingExposure=(this.exposure??1)*THREE.MathUtils.lerp(1,shot.light.exposure,smooth(0,.25,local));
   const anchor=g.playerVisual?.actor?.anchor;if(anchor){const p=g.player.body.translation();anchor.visible=Math.hypot(cam.position.x-p.x,cam.position.y-p.y,cam.position.z-p.z)>2.5;}
  }
  if(this.elapsed>=this.duration)this.finish(false);
 }

 dataCamera(c,local){
  const cam=this.g.rendering.camera,a=c.from,b=c.to||a,e=smooth(0,1,local),last=this.shot===this.def.shots.length-1;
  cam.position.set(...a.pos).lerp(this._v.set(...b.pos),e);cam.up.set(0,1,0);
  this._look.set(...a.look).lerp(this._v.set(...b.look),e);cam.lookAt(this._look);
  cam.fov=THREE.MathUtils.lerp(a.fov??cam.fov,b.fov??a.fov??cam.fov,e);
  const back=last?smooth(this.duration-BACK_SECONDS,this.duration,this.elapsed):0;
  if(back>0){cam.position.lerp(this.saved.position,back);cam.quaternion.slerp(this.saved.quaternion,back);cam.fov=THREE.MathUtils.lerp(cam.fov,this.saved.fov,back);}
  cam.updateProjectionMatrix();
 }
 _v=new THREE.Vector3();_look=new THREE.Vector3();

 /** Skips to the same end state as watching. Idempotent. */
 skip(){return this.finish(true);}

 /** Restores camera, exposure, mode and input context; records the scene; idempotent. */
 finish(skipped=true){
  if(!this.active)return false;const g=this.g,cam=g.rendering.camera;
  this.active=false;this.skipped=skipped;this.def.exit?.(this);// libera recursos próprios da cena (assistida, pulada ou abortada)
  cam.position.copy(this.saved.position);cam.quaternion.copy(this.saved.quaternion);cam.fov=this.saved.fov;cam.updateProjectionMatrix();
  if(this.exposure!==undefined&&g.rendering.renderer)g.rendering.renderer.toneMappingExposure=this.exposure;
  g.player.cameraInitial=true;g.cameras.initial=true;
  const anchor=g.playerVisual?.actor?.anchor;if(anchor)anchor.visible=this.returnMode==='walking'&&g.player.view==='third';// o modelo pode ainda não ter carregado
  for(const id of [this.def.id,...(this.def.also||[])])recordScene(g.campaign,id,skipped?'skipped':'watched');
  g.state.cutscene=null;g.state.mode=this.returnMode;g.state.resumeMode=this.returnMode;g.state.overlay=null;g.input.setContext(this.returnMode);
  g.ambientAudio?.setPaused(false);g.loop.reset();g.last=performance.now();return true;
 }

 /** Aborts any playing scene (counts as a skip) and drops the queue; used on load/menu/dispose. */
 reset(){if(this.active)this.finish(true);this.queued.length=0;}
 snapshot(){return {active:this.active,id:this.active?this.def.id:null,queued:[...this.queued],elapsed:this.elapsed,duration:this.duration,reducedMotion:!!this.reduced,skipped:!!this.skipped};}
}

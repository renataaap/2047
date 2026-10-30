import {INHABITED_SITES,DISCOVERY_SITES} from '../../data/ambience.js';
import {GENERATOR} from '../../data/road.js';
import {surfaceAt,randomSeed,regionAt,heightAt} from '../world/terrain.js';

// Original synthesis, no external recordings or uncertain sample licenses.
export function environmentalMix(p,c){
 const home=Math.abs(p.x+13)<3.85&&Math.abs(p.z-22)<6.1,motel=DISCOVERY_SITES[0],inMotel=Math.abs(p.x-motel.x)<8&&Math.abs(p.z-motel.z)<4;
 const workshop=INHABITED_SITES.filter(s=>s.kind==='workshop').sort((a,b)=>Math.hypot(p.x-a.x,p.z-a.z)-Math.hypot(p.x-b.x,p.z-b.z))[0];
 return {indoors:home||inMotel,surface:home||inMotel?'interior':surfaceAt(p.x,p.z),region:regionAt(p.z),generator:!!c.road?.generator,workshop,distanceToGenerator:Math.hypot(p.x-GENERATOR.x,p.z-GENERATOR.z)};
}
export class AmbientAudio {
 constructor(){this.steps=0;this.sources=[];this.nodes=[];this.cues=0;this.nextCreak=0;}
 attach(engine){
  if(this.context||!engine.context)return;const c=this.context=engine.context;this.engine=engine;
  this.master=c.createGain();this.master.gain.value=.8;this.master.connect(engine.master);this.bed=c.createGain();this.bed.connect(this.master);
  const rng=randomSeed(204708),makeNoise=duration=>{const b=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),data=b.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=rng()*2-1;return b;};
  this.noise=makeNoise(2);this.stepBuffer=makeNoise(.11);
  for(const kind of ['generator','metal','water']){
   const source=kind==='generator'?c.createOscillator():c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain(),pan=c.createPanner();
   if(kind==='generator'){source.type='triangle';source.frequency.value=57;}else{source.buffer=this.noise;source.loop=true;}
   filter.type='bandpass';filter.frequency.value=kind==='water'?1700:kind==='metal'?420:140;filter.Q.value=kind==='metal'?9:.7;
   pan.panningModel='HRTF';pan.distanceModel='inverse';pan.refDistance=3;pan.maxDistance=70;pan.rolloffFactor=1.8;gain.gain.value=0;source.connect(filter);filter.connect(gain);gain.connect(pan);pan.connect(this.bed);source.start();this.sources.push({kind,source,filter,gain,pan});
  }
 }
 point(pan,p,now){for(const [key,v]of Object.entries(p))pan[`position${key.toUpperCase()}`]?.setTargetAtTime(v,now,.1);}
 pulse(surface,spatial=false,p){
  const c=this.context;if(!c)return;const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=this.stepBuffer;filter.type='lowpass';filter.frequency.value=surface==='asfalto'||surface==='interior'?650:surface==='sal'?1450:2100;gain.gain.setValueAtTime(surface==='interior'?.07:.11,c.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.105);source.connect(filter);filter.connect(gain);
  let pan;if(spatial&&p){pan=c.createPanner();pan.refDistance=2;pan.distanceModel='inverse';this.point(pan,p,c.currentTime);gain.connect(pan);pan.connect(this.master);}else gain.connect(this.master);
  source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();pan?.disconnect();};source.start();this.cues++;
 }
 cue(kind,p){const c=this.context;if(!c)return;const o=c.createOscillator(),g=c.createGain(),pan=c.createPanner();o.type=kind==='repair'?'triangle':'sine';o.frequency.setValueAtTime(kind==='repair'?740:180,c.currentTime);o.frequency.exponentialRampToValueAtTime(kind==='repair'?220:70,c.currentTime+.24);g.gain.setValueAtTime(.055,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.26);pan.refDistance=3;this.point(pan,p,c.currentTime);o.connect(g);g.connect(pan);pan.connect(this.master);o.onended=()=>{o.disconnect();g.disconnect();pan.disconnect();};o.start();o.stop(c.currentTime+.28);this.cues++;}
 setPaused(paused){this.paused=paused;if(!this.context)return;const target=paused?0:this.mix?.indoors?.35:1;if(this.pauseTarget===target)return;this.pauseTarget=target;const gain=this.bed.gain,now=this.context.currentTime;gain.cancelScheduledValues(now);gain.setValueAtTime(gain.value,now);gain.linearRampToValueAtTime(target,now+.06);}
 update(engine,position,campaign,walking,paused,dt){
  this.attach(engine);const c=this.context;if(!c)return;const now=c.currentTime,mix=environmentalMix(position,campaign);this.mix=mix;
  const listener=c.listener;for(const [key,value]of Object.entries(position))if(['x','y','z'].includes(key))listener[`position${key.toUpperCase()}`]?.setTargetAtTime(value,now,.06);
  const yaw=position.yaw||0;listener.forwardX?.setTargetAtTime(-Math.sin(yaw),now,.06);listener.forwardY?.setTargetAtTime(0,now,.06);listener.forwardZ?.setTargetAtTime(-Math.cos(yaw),now,.06);listener.upY?.setTargetAtTime(1,now,.06);
  this.setPaused(paused);
  for(const e of this.sources){const point=e.kind==='generator'?{x:GENERATOR.x,y:heightAt(GENERATOR.x,GENERATOR.z)+1,z:GENERATOR.z}:e.kind==='metal'?{x:mix.workshop.x,y:heightAt(mix.workshop.x,mix.workshop.z)+1.5,z:mix.workshop.z}:{x:-22,y:heightAt(-22,34)+1,z:34};this.point(e.pan,point,now);
   const gain=e.kind==='generator'?(mix.generator?.17:0):e.kind==='metal'?.025*(.2+Math.max(0,Math.sin(now*.6))**12):campaign.restoration.ashes?.045:0;e.gain.gain.setTargetAtTime(gain,now,.6);
  }
  if(this.previous){const distance=Math.hypot(position.x-this.previous.x,position.z-this.previous.z);if(!paused&&walking&&distance<4)this.travel=(this.travel||0)+distance;else this.travel=0;if(this.travel>.85){this.travel%=.85;this.pulse(mix.surface);this.steps++;}}
  this.previous={x:position.x,z:position.z};
 }
 snapshot(){return this.context?{originalSynthesis:true,spatialSources:this.sources.length,steps:this.steps,cues:this.cues,indoors:this.mix?.indoors,surface:this.mix?.surface,region:this.mix?.region,pausedGain:this.bed.gain.value}:null;}
 dispose(){for(const e of this.sources){e.source.stop();e.source.disconnect();e.filter.disconnect();e.gain.disconnect();e.pan.disconnect();}this.sources=[];this.bed?.disconnect();this.master?.disconnect();this.context=null;}
}

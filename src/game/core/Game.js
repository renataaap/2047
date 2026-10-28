import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { CONFIG } from '../../data/config.js';
import { FixedLoop } from './FixedLoop.js';
import { SceneRenderer } from '../render/SceneRenderer.js';
import { Cameras } from '../render/Cameras.js';
import { createMaterials } from '../render/materials.js';
import { World } from '../world/World.js';
import { VehiclePhysics } from '../physics/VehiclePhysics.js';
import { createTruck } from '../vehicle/model.js';
import { Input } from '../input/Input.js';
import { EngineAudio } from '../audio/EngineAudio.js';
import { updateResources } from '../survival/resources.js';
import { initializePhysics } from '../physics/initialize.js';
export class Game {
  constructor(canvas,settings,publish) {
    this.canvas=canvas;this.settings=settings;this.publish=publish;this.disposed=false;this.ready=false;
    this.state={mode:'menu',fuel:CONFIG.vehicle.initialFuel,temperature:26,engineOn:false,speed:0,signedSpeed:0,surface:'asfalto',camera:0,headlights:false,arrived:false};
    this.loop=new FixedLoop(CONFIG.fixedStep,CONFIG.maxSubSteps);this.audio=new EngineAudio();this.previous=new THREE.Vector3();this.current=new THREE.Vector3();this.previousQ=new THREE.Quaternion();this.currentQ=new THREE.Quaternion();this.fpsSamples=[];this.lastPublish=0;this.frames=0;this.fps=0;
  }
  async init() {
    await initializePhysics();if(this.disposed)return;
    this.rendering=new SceneRenderer(this.canvas,this.settings);this.materials=createMaterials();
    this.physics=new RAPIER.World({x:0,y:-9.81,z:0});this.physics.timestep=CONFIG.fixedStep;
    this.world=new World(this.rendering.scene,this.physics,this.materials);for(let i=0;i<9;i++)this.world.update({x:0,z:5},this.rendering.preset.distance);
    this.truck=createTruck(this.materials);this.rendering.scene.add(this.truck.root);this.vehicle=new VehiclePhysics(this.physics,this.truck.wheelPoints);this.cameras=new Cameras(this.rendering.camera);
    this.input=new Input({engine:()=>this.toggleEngine(),camera:()=>{this.cameras.cycle();this.state.camera=this.cameras.mode;},lights:()=>this.state.headlights=!this.state.headlights,pause:()=>this.pause(),orbit:(x,y)=>{if(this.cameras.mode===2)this.cameras.orbit(x,y);},zoom:d=>{if(this.cameras.mode===2)this.cameras.zoom(d);}},this.canvas);
    for(let i=0;i<120;i++){this.physics.step();this.vehicle.update({throttle:0,steer:0,handbrake:true},this.state,CONFIG.fixedStep);}
    this.current.copy(this.vehicle.body.translation());this.previous.copy(this.current);this.currentQ.copy(this.vehicle.body.rotation());this.previousQ.copy(this.currentQ);
    this.ready=true;
    if(process.env.NODE_ENV!=='production') {
      this.debug={getState:()=>this.snapshot(),setInput:value=>{if(value.KeyW!==undefined||value.KeyS!==undefined)this.input.override={throttle:Number(!!value.KeyW)-Number(!!value.KeyS),steer:Number(!!value.KeyA)-Number(!!value.KeyD),handbrake:!!value.Space};else this.input.override={...value};},teleport:(p)=>{this.vehicle.teleport(p.x??0,p.z??5,p.y);this.current.copy(this.vehicle.body.translation());this.previous.copy(this.current);},resetMetrics:()=>{this.fpsSamples=[];},get position(){return this.getState().position;}};
      Object.defineProperties(this.debug,{speed:{get:()=>this.state.speed*3.6},fuel:{get:()=>this.state.fuel},integrity:{get:()=>null},fps:{get:()=>this.fps},drawCalls:{get:()=>this.rendering.renderer.info.render.calls}});window.__GAME_DEBUG__=this.debug;
    }
    this.publish(this.snapshot());this.last=performance.now();this.fpsTime=this.last;
    const tick=now=>{if(this.disposed)return;const dt=Math.min((now-this.last)/1000,.5);this.last=now;this.frames++;
      if(now-this.fpsTime>=500){this.fps=this.frames*1000/(now-this.fpsTime);if(this.state.mode==='driving')this.fpsSamples.push(this.fps);if(this.fpsSamples.length>120)this.fpsSamples.shift();this.frames=0;this.fpsTime=now;}
      const running=this.state.mode==='driving';
      const alpha=running?this.loop.advance(dt,step=>this.fixedUpdate(step)):0;
      if(!running)this.loop.reset();
      this.truck.root.position.lerpVectors(this.previous,this.current,running?alpha:1);this.truck.root.quaternion.slerpQuaternions(this.previousQ,this.currentQ,running?alpha:1);
      this.world.update(this.truck.root.position,this.rendering.preset.distance);this.truck.animate(this.vehicle.controller,dt,now/1000,this.state.engineOn&&running,this.state.headlights);
      this.cameras.update(this.truck.root,this.state.mode==='menu',now/1000,dt);this.audio.update(this.state,this.input.read(),this.settings.volume,!running);
      this.rendering.render(this.truck.root.position,dt);
      if(now-this.lastPublish>=100){this.publish(this.snapshot());this.lastPublish=now;}
      this.raf=requestAnimationFrame(tick);
    };this.raf=requestAnimationFrame(tick);
  }
  fixedUpdate(dt) {
    this.previous.copy(this.current);this.previousQ.copy(this.currentQ);const input=this.input.read();this.vehicle.update(input,this.state,dt);this.physics.step();this.current.copy(this.vehicle.body.translation());this.currentQ.copy(this.vehicle.body.rotation());
    this.state.speed=Math.abs(this.vehicle.signedSpeed());updateResources(this.state,input,dt);if(this.current.z<=-2960)this.state.arrived=true;
  }
  async start() {if(!this.ready)return;await this.audio.start(this.settings.volume);this.vehicle.teleport(0,5);this.current.copy(this.vehicle.body.translation());this.previous.copy(this.current);this.currentQ.identity();this.previousQ.identity();Object.assign(this.state,{mode:'driving',fuel:CONFIG.vehicle.initialFuel,engineOn:true,temperature:26,speed:0,arrived:false});this.input.setContext('driving');this.cameras.mode=0;this.state.camera=0;this.cameras.initial=true;this.fpsSamples=[];this.publish(this.snapshot());}
  toggleEngine(){if(this.state.mode==='driving'&&this.state.fuel>0)this.state.engineOn=!this.state.engineOn;}
  pause(){if(this.state.mode==='driving'){this.state.mode='paused';this.input.setContext('menu');this.publish(this.snapshot());}}
  resume(){this.state.mode='driving';this.input.setContext('driving');this.last=performance.now();this.publish(this.snapshot());}
  menu(){this.state.mode='menu';this.state.engineOn=false;this.input.setContext('menu');this.vehicle.teleport(0,5);this.current.copy(this.vehicle.body.translation());this.previous.copy(this.current);this.currentQ.identity();this.previousQ.identity();this.publish(this.snapshot());}
  recover(){this.vehicle.recover();this.current.copy(this.vehicle.body.translation());this.previous.copy(this.current);this.currentQ.identity();this.previousQ.identity();this.state.speed=0;this.resume();}
  setSettings(s){this.settings=s;this.rendering?.applySettings(s);}
  snapshot(){const info=this.rendering?.renderer.info.render;return {...this.state,ready:this.ready,position:this.current.toArray(),speedKmh:this.state.speed*3.6,fps:this.fps,averageFps:this.fpsSamples.length?this.fpsSamples.reduce((a,b)=>a+b,0)/this.fpsSamples.length:0,drawCalls:info?.calls||0,triangles:info?.triangles||0,sectors:this.world?.sectors.size||0,quaternion:this.currentQ.toArray(),wheelContacts:this.vehicle?Array.from({length:6},(_,i)=>this.vehicle.controller.wheelIsInContact(i)):[],suspension:this.vehicle?Array.from({length:6},(_,i)=>this.vehicle.controller.wheelSuspensionLength(i)):[],integrity:null};}
  dispose(){this.disposed=true;cancelAnimationFrame(this.raf);this.input?.dispose();this.audio.dispose();this.world?.dispose();this.rendering?.dispose();Object.values(this.materials||{}).forEach(m=>{m.map?.dispose();m.dispose();});if(this.physics){this.physics.removeVehicleController(this.vehicle.controller);this.physics.free();}if(typeof window!=='undefined'&&window.__GAME_DEBUG__===this.debug)delete window.__GAME_DEBUG__;}
}

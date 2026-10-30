import {truckEntryTarget} from '../interactions/truckEntryTarget.js';
import {AmbientWorld} from '../world/AmbientWorld.js';
import {targetVisible} from '../interactions/visibility.js';
import {MenuScene} from '../render/MenuScene.js';
import {ConversationCamera} from '../render/ConversationCamera.js';
import {PlayerVisual} from '../player/PlayerVisual.js';
import {workerDefinition} from '../player/workerDefinition.js';
import {InteractionResolver} from '../interactions/InteractionResolver.js';
import {calibrationStatus} from '../missions/seedService.js';
import { TutorialController,createTutorial } from '../tutorial/TutorialController.js';
import { TRAINING } from '../tutorial/definitions.js';
import { TutorialWorld } from '../tutorial/TutorialWorld.js';
// estrada-viva integration
import { upgradeCampaign,syncFirst,hasCargo,weatherAt,networkStep,objective,radioMessages } from '../missions/network.js';
import { NetworkController } from '../missions/NetworkController.js';
import { RoadController } from '../missions/RoadController.js';
import { NetworkWorld } from '../world/NetworkWorld.js';
import { RoadWorld } from '../world/RoadWorld.js';
import { ROAD_POINTS } from '../../data/road.js';
import { NETWORK_POINTS,WORLD_COPY as W } from '../../data/network.js';
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { CONFIG } from '../../data/config.js';
import { COPY,POINTS } from '../../data/campaign.js';
import { FixedLoop } from './FixedLoop.js';
import { SceneRenderer } from '../render/SceneRenderer.js';
import { Cameras } from '../render/Cameras.js';
import { createMaterials } from '../render/materials.js';
import { World } from '../world/World.js';
import { EnvironmentModels } from '../world/EnvironmentModels.js';
import { CampaignWorld } from '../world/CampaignWorld.js';
import { VehiclePhysics } from '../physics/VehiclePhysics.js';
import { createTruck } from '../vehicle/model.js';
import { AssetManager } from '../assets/AssetManager.js';
import { PBRLibrary } from '../render/PBRLibrary.js';
import { TruckVisual } from '../vehicle/TruckVisual.js';
import { CharacterActor } from '../player/CharacterActor.js';
import { Player } from '../player/Player.js';
import { canExit } from '../player/exitPolicy.js';
import { Input } from '../input/Input.js';
import { EngineAudio } from '../audio/EngineAudio.js';
import { updateResources } from '../survival/resources.js';
import { initializePhysics } from '../physics/initialize.js';
import { cargoDamage,activationChance } from '../cargo/integrity.js';
import { createCampaign,clone,bagWeight,near,transfer,repair,refuel,coolant,receiveSeed,calibrate,activateCore,collect,mechanics,impactDamage } from '../missions/campaign.js';
import { SaveClient } from '../persistence/client.js';
import { validSave } from '../persistence/schema.js';
import { EXPEDITION,POIS } from '../../data/expedition.js';
import { expeditionStep,consume,rest,buy,sellParts,loot,saltHeat } from '../survival/expedition.js';
import { ExpeditionWorld } from '../world/ExpeditionWorld.js';
import { heightAt,roadX,regionAt } from '../world/terrain.js';
export class Game {
constructor(canvas,settings,publish){
this.canvas=canvas;this.settings=settings;this.publish=publish;this.disposed=false;this.ready=false;this.campaign=upgradeCampaign(createCampaign());this.tutorial=new TutorialController(this.campaign);this.saves=new SaveClient();this.saveQueue=Promise.resolve();
this.state={mode:'menu',resumeMode:'driving',overlay:null,fuel:4,temperature:26,engineOn:false,speed:0,signedSpeed:0,surface:'asfalto',camera:0,headlights:false,arrived:false,notice:'',saving:false};
this.loop=new FixedLoop(CONFIG.fixedStep,CONFIG.maxSubSteps);this.audio=new EngineAudio();this.previous=new THREE.Vector3();this.current=new THREE.Vector3();this.previousQ=new THREE.Quaternion();this.currentQ=new THREE.Quaternion();this.fpsSamples=[];this.lastPublish=0;this.frames=0;this.fps=0;this.cargoSample={filtered:[0,0,0]};this.lastVelocity=new THREE.Vector3();this.lastSpeed=0;this.cargoGrace=1;this.interactions=new InteractionResolver();
}
async init(){
await initializePhysics();if(this.disposed)return;
this.rendering=new SceneRenderer(this.canvas,this.settings);this.materials=createMaterials();this.assets=new AssetManager(this.rendering.renderer);this.pbr=new PBRLibrary(this.assets,this.materials,this.settings.quality);
try{await this.pbr.load();}catch(error){if(!this.disposed)this.assets.errors.push(error.message);}if(this.disposed)return;
let modelManifest={};try{modelManifest=await this.assets.json('/assets/models/manifest.json');}catch(error){if(!this.disposed)this.assets.errors.push(error.message);}if(this.disposed)return;
this.physics=new RAPIER.World({x:0,y:-9.81,z:0});this.physics.timestep=CONFIG.fixedStep;
this.environmentModels=new EnvironmentModels(this.rendering.scene,this.physics,this.assets,modelManifest.environments);
this.world=new World(this.rendering.scene,this.physics,this.materials);for(let i=0;i<9;i++)this.world.update({x:0,z:5},this.rendering.preset.distance);
this.ambientWorld=new AmbientWorld(this.rendering.scene,this.physics,this.materials,this.world);
this.truck=createTruck(this.materials);this.rendering.scene.add(this.truck.root);this.vehicle=new VehiclePhysics(this.physics,this.truck.wheelPoints);this.vehicle.body.userData={interactionKey:'truck:titan'};this.cameras=new Cameras(this.rendering.camera,this.physics,this.vehicle.body,this.settings);this.player=new Player(this.physics,(x,z)=>this.world.groundHeight(x,z));this.player.view=this.settings.footCamera||'first';this.playerVisual=new PlayerVisual(this.rendering.scene,this.assets,this.player);this.features=new CampaignWorld(this.rendering.scene,this.physics,this.materials);this.features.cargo.userData.keepWithImportedTruck=true;this.truck.root.add(this.features.cargo);this.expeditionWorld=new ExpeditionWorld(this.rendering.scene,this.physics,this.materials,this.assets,modelManifest.characters?.worker);this.networkWorld=new NetworkWorld(this.rendering.scene,this.physics,this.materials,this.assets,modelManifest.characters?.worker);this.networkController=new NetworkController(this);this.roadWorld=new RoadWorld(this.rendering.scene,this.physics,this.materials,this.assets,modelManifest.characters?.worker);this.roadController=new RoadController(this);this.tutorialWorld=new TutorialWorld(this.rendering.scene,this.physics,this.materials);
this.menuScene=new MenuScene(this.rendering.scene,this.assets);await this.menuScene.load(modelManifest.environments?.['gas-station']);if(this.disposed)return;this.conversationCamera=new ConversationCamera(this.rendering.camera,this.physics,this.player);
this.truckVisual=new TruckVisual(this.truck,this.assets);this.npcActor=new CharacterActor(this.assets,this.features.npc);
try{await this.truckVisual.load(modelManifest.trucks?.initial);}catch(error){if(!this.disposed)this.assets.errors.push(`truck: ${error.message}`);}if(this.disposed)return;
try{await this.npcActor.load(workerDefinition(modelManifest.characters?.survivor,'survivor'));await this.playerVisual.load(modelManifest.characters?.worker);}catch(error){if(!this.disposed)this.assets.errors.push(`npc: ${error.message}`);}if(this.disposed)return;
this.input=new Input({engine:()=>this.toggleEngine(),camera:()=>{if(this.state.mode==='walking'){this.player.toggleView();this.emit();return;}this.cameras.cycle();this.state.camera=this.cameras.mode;this.tutorial.event('camera',{mode:this.cameras.mode});},lights:()=>this.state.headlights=!this.state.headlights,pause:()=>this.pause(),interact:()=>this.interact(),panel:kind=>this.openPanel(kind),look:(x,y)=>{this.player.look(x,y);this.tutorial.event('look',{x,y});},orbit:(x,y)=>this.cameras.orbit(x,y),zoom:d=>this.cameras.zoom(d)},this.canvas);
for(let i=0;i<120;i++){this.vehicle.update({throttle:0,steer:0,handbrake:true},this.state,CONFIG.fixedStep);this.physics.step();}
this.sync();try{this.initialSaves=await this.saves.list();}catch{this.initialSaves=[];}if(this.disposed)return;this.ready=true;
if(process.env.NODE_ENV!=='production'){
this.debug={getState:()=>this.snapshot(),setInput:v=>{this.input.override=v.KeyW!==undefined||v.KeyS!==undefined?{throttle:Number(!!v.KeyW)-Number(!!v.KeyS),steer:Number(!!v.KeyA)-Number(!!v.KeyD),handbrake:!!v.Space}:v;},teleport:p=>{this.preparePosition({x:p.x??0,z:p.z??5});this.vehicle.teleport(p.x??0,p.z??5,p.y);this.sync();this.resetCargo();this.state.speed=0;this.state.signedSpeed=0;this.emit();},teleportPlayer:p=>{this.player.teleport(p.x,p.z,p.y);this.physics.propagateModifiedBodyPositionsToColliders();this.emit();},resetMetrics:()=>{this.fpsSamples=[];},get position(){return this.getState().position;}};
Object.defineProperties(this.debug,{speed:{get:()=>this.state.speed*3.6},fuel:{get:()=>this.state.fuel},integrity:{get:()=>this.campaign.seed.received?this.campaign.seed.integrity:null},fps:{get:()=>this.fps},drawCalls:{get:()=>this.rendering.renderer.info.render.calls}});window.__GAME_DEBUG__=this.debug;
}
this.emit();this.last=performance.now();this.fpsTime=this.last;
const tick=now=>{if(this.disposed)return;const elapsed=Math.max(0,(now-this.last)/1000),dt=Math.min(elapsed,.25);this.last=now;this.frames++;
if(now-this.fpsTime>=500){this.fps=this.frames*1000/(now-this.fpsTime);if(this.active())this.fpsSamples.push(this.fps);if(this.fpsSamples.length>120)this.fpsSamples.shift();this.frames=0;this.fpsTime=now;}
const alpha=this.active()?this.loop.advance(elapsed,step=>this.fixedUpdate(step)):0;if(!this.active())this.loop.reset();
this.truck.root.position.lerpVectors(this.previous,this.current,this.active()?alpha:1);this.truck.root.quaternion.slerpQuaternions(this.previousQ,this.currentQ,this.active()?alpha:1);
const foot=this.context()==='walking'&&this.state.mode!=='menu',focus=foot?this.player.body.translation():this.truck.root.position;
this.world.setCampaign(this.campaign);this.world.update(focus,this.rendering.preset.distance);this.environmentModels.update(focus,this.rendering.preset.distance);this.tutorialWorld.update(this.tutorial.snapshot());this.truck.animate(this.vehicle.controller,dt,now/1000,this.state.engineOn&&this.active(),this.state.headlights,this.state,this.settings);this.truckVisual.update(this.vehicle.controller,this.cameras.mode===1&&this.state.mode!=='menu');this.npcActor.update(dt,new THREE.Vector3(focus.x,focus.y,focus.z));
this.playerVisual.update(dt,foot,this.state.mode==='walking');this.menuScene.update(this.state.mode==='menu');this.features.group.visible=this.state.mode!=='menu';this.tutorialWorld.group.visible=this.state.mode!=='menu';this.environmentModels.presentation(this.state.mode==='menu');const conversation=this.conversationTarget();if(conversation)this.conversationCamera.update(conversation,dt);else if(foot)this.player.camera(this.rendering.camera,dt);else this.cameras.update(this.truck,this.state.mode==='menu',now/1000,dt);
this.expeditionWorld.update(this.campaign,focus,dt);this.networkWorld.update(this.campaign,focus,dt);this.roadWorld.update(this.campaign,focus,dt);this.features.update(this.campaign,new THREE.Vector3(focus.x,focus.y,focus.z),dt,this.rendering,this.storm());this.networkWorld.atmosphere(this.campaign,focus,dt,this.rendering);this.state.storm=this.storm();const weather=weatherAt(this.campaign,this.current.z);this.state.restored=weather.restored;this.state.region=weather.region;this.state.interference=weather.interference;this.state.radioActive=this.state.overlay==='radio';this.audio.update(this.state,this.input.read(),this.settings.volume,!this.active());
this.ambientWorld.update(focus,this.rendering.preset.distance,this.campaign,this.state.mode==='menu');this.rendering.render(focus,dt);if(now-this.lastPublish>=100){this.emit();this.lastPublish=now;}this.raf=requestAnimationFrame(tick);
};this.raf=requestAnimationFrame(tick);
}
conversationTarget(){if(this.state.mode!=='paused')return null;const {overlay,roadPoint,roadEntity,networkPoint,poi}=this.state;if(overlay==='dialogue')return POINTS.shelter;if(overlay==='road'&&roadEntity==='npc')return ROAD_POINTS.find(p=>p.id===roadPoint)?.talk;if(overlay==='network'){const p=NETWORK_POINTS.find(p=>p.id===networkPoint);return p?.kind==='shelter'?{x:p.x,z:p.z-1}:null;}if(overlay==='poi'){const p=POIS.find(p=>p.id===poi);return p?.kind==='trade'?{x:p.x,z:p.z-1}:null;}return null;}
active(){return ['driving','walking'].includes(this.state.mode);}
context(){return this.state.mode==='paused'?this.state.resumeMode:this.state.mode;}
storm(){return (!this.campaign.restoration.ashes&&this.campaign.seed.received&&this.current.z<-700&&this.current.z>-1900)||weatherAt(this.campaign,this.current.z).front;}
preparePosition(p){this.world.setCampaign(this.campaign);this.world.prime(p,this.rendering.preset.distance);this.networkWorld.update(this.campaign,p,0);this.roadWorld.update(this.campaign,p,0);}
sync(){this.current.copy(this.vehicle.body.translation());this.previous.copy(this.current);this.currentQ.copy(this.vehicle.body.rotation());this.previousQ.copy(this.currentQ);}
resetCargo(){this.cargoGrace=1;this.cargoSample.filtered=[0,0,0];this.lastVelocity.copy(this.vehicle.body.linvel());this.lastSpeed=this.vehicle.signedSpeed();}
fixedUpdate(dt){
this.previous.copy(this.current);this.previousQ.copy(this.currentQ);const input=this.input.read(),driving=this.state.mode==='driving';
const effects=mechanics(this.campaign,this.state,input,dt,this.storm());const vigor=expeditionStep(this.campaign.expedition,{traveling:this.state.speed>1||(!driving&&Math.hypot(input.x||0,input.z||0)>0),hot:regionAt(this.current.z)==='salt'&&!weatherAt(this.campaign,this.current.z).restored,running:input.run},dt);input.moveScale=vigor;this.state.x=this.current.x;this.state.z=this.current.z;const weather=networkStep(this.campaign,this.state,input,dt);this.state.front=weather.front;this.state.weatherClock=this.campaign.network.clock;this.state.localRestored=weather.restored;this.state.powerMultiplier=effects.power*vigor;this.state.gripMultiplier=effects.grip*weather.grip*(this.campaign.network.quests.pump==='completed'&&this.state.surface==='lama'?1.35:1);this.state.loaded=hasCargo(this.campaign);this.state.inventoryMass=bagWeight(this.campaign.inventory.truck);this.state.suspensionCondition=this.campaign.components.suspension;this.state.steeringSensitivity=this.settings.steeringSensitivity;
this.vehicle.update(driving?input:{throttle:0,steer:0,handbrake:true},this.state,dt);if(!driving)this.player.update(input,dt,this.current);this.physics.step();this.current.copy(this.vehicle.body.translation());this.currentQ.copy(this.vehicle.body.rotation());
this.state.speed=Math.abs(this.vehicle.signedSpeed());if(regionAt(this.current.z)==='salt'&&!this.state.localRestored)saltHeat(this.state,this.campaign.components,dt);updateResources(this.state,input,dt);if(this.state.fuel<=0)this.state.engineOn=false;
const velocity=new THREE.Vector3().copy(this.vehicle.body.linvel()),speed=this.vehicle.signedSpeed(),accel=velocity.clone().sub(this.lastVelocity).multiplyScalar(1/dt).applyQuaternion(this.currentQ.clone().invert());
const impact=Math.max(0,Math.abs(this.lastSpeed)-Math.abs(speed));if(this.cargoGrace>0)this.cargoGrace-=dt;else {if(impact>3.5)impactDamage(this.campaign,impact);if(this.state.loaded){const damage=cargoDamage(this.cargoSample,[accel.x,accel.y,(speed-this.lastSpeed)/dt],impact,dt,this.campaign.components.suspension*.7+this.campaign.components.frame*.3);this.campaign.seed.integrity=Math.max(0,this.campaign.seed.integrity-damage);this.state.cargoRisk=damage>.008;}}
if(this.campaign.network.cargo)this.campaign.network.seeds[this.campaign.network.cargo].integrity=this.campaign.seed.integrity;this.lastVelocity.copy(velocity);this.lastSpeed=speed;
const beforeTutorial=this.campaign.tutorial?.completed.length;this.tutorial.update({mode:this.state.mode,position:this.current,player:this.player.body.translation(),speed:this.state.speed,signedSpeed:this.vehicle.signedSpeed(),yaw:new THREE.Euler().setFromQuaternion(this.currentQ,'YXZ').y,steer:input.steer||0,throttle:input.throttle||0,handbrake:!!input.handbrake,engineOn:this.state.engineOn},dt);if(this.campaign.tutorial?.completed.length!==beforeTutorial&&[3,6,14,17,21].includes(this.campaign.tutorial.completed.length))this.checkpoint(this.campaign.checkpoint);
if(this.current.z<=-2960)this.state.arrived=true;
if(this.campaign.seed.received){const f=this.campaign.flags;if(this.storm())f.stormEncountered=true;if(!f.chosenRoute&&this.current.z<-800&&this.current.z>-1500){const x=this.current.x-roadX(this.current.z);if(x>70||x<-15){f.chosenRoute=x>70?'safe':'short';this.campaign.decisions.push(`route-${f.chosenRoute}`);}}
if(this.current.z<-650&&this.campaign.checkpoint<2)this.checkpoint(2);if(this.current.z<-1900&&this.campaign.checkpoint<3)this.checkpoint(3);}
}
async start(){if(!this.ready)return;await this.audio.start(this.settings.volume);this.campaign=upgradeCampaign(createCampaign(crypto.getRandomValues(new Uint32Array(1))[0]));this.campaign.tutorial=createTutorial();this.tutorial=new TutorialController(this.campaign);this.saves=new SaveClient();try{const list=await this.saves.list();this.saves.slot=['1','2','3'].find(s=>!list.some(e=>e.slot===s))||null;}catch{}this.preparePosition({x:0,z:5});this.vehicle.teleport(0,5);this.sync();this.resetCargo();this.features.apply(false);this.networkWorld.reset();this.roadWorld.reset();Object.assign(this.state,{mode:'walking',resumeMode:'walking',overlay:null,fuel:4,engineOn:false,temperature:26,speed:0,arrived:false,notice:''});this.vehicle.resetDrivetrain(false,this.state);this.player.teleport(TRAINING.home.x,TRAINING.home.z);this.player.yaw=0;this.player.pitch=0;this.input.setContext('walking');this.cameras.mode=0;this.state.camera=0;this.cameras.initial=true;this.fpsSamples=[];this.emit();}
toggleEngine(){if(this.state.mode==='driving'&&this.state.fuel>0){this.state.engineOn=!this.state.engineOn;this.tutorial.event('engine',{on:this.state.engineOn});}}
skipTutorial(){this.tutorial.skip();this.emit();}
repeatTutorial(){this.tutorial.repeat();this.emit();}
openPanel(kind){if(!this.active())return;this.tutorial.event('panel',{kind});this.state.resumeMode=this.state.mode;this.state.mode='paused';this.state.overlay=kind;this.input.setContext('menu');this.emit();}
pause(){this.openPanel('pause');}
resume(){this.state.mode=this.state.resumeMode||'driving';this.state.overlay=null;this.input.setContext(this.state.mode);this.last=performance.now();this.emit();}
menu(){this.state.mode='menu';this.state.overlay=null;this.state.engineOn=false;this.input.setContext('menu');this.vehicle.teleport(0,5);this.sync();this.emit();}
recover(){this.vehicle.recover();this.state.fuel=Math.max(0,this.state.fuel-2);if(this.state.loaded)this.campaign.seed.integrity=Math.max(0,this.campaign.seed.integrity-8);this.sync();this.resetCargo();this.state.speed=0;this.state.resumeMode='driving';this.state.notice=COPY.recovery;this.vehicle.resetDrivetrain(this.state.engineOn,this.state);this.resume();}
observer(){return {...this.player.body.translation(),yaw:this.player.yaw};}
visibleTarget(target){const p=this.player.body.translation();return targetVisible(this.physics,{x:p.x,y:p.y+.55,z:p.z},{...target,position:{...target.position,y:target.position.y??heightAt(target.position.x,target.position.z)+1}},this.player.collider);}
interactionCandidates(){
 const p=this.player.body.translation(),inspected=this.tutorialWorld.target(p);
 return [...(inspected?[{...inspected,key:`inspection:${inspected.object}`,type:'inspection',position:TRAINING.objects.find(o=>o.id===inspected.object),range:1.8,priority:30}]:[]),
 ...this.networkController.candidates(),...this.roadController.candidates(),
 ...POIS.map(poi=>({id:'poi',key:`poi:${poi.id}`,type:poi.kind==='trade'?'npc':'cache',poi:poi.id,position:{x:poi.x,z:poi.z-1},range:4,priority:25,text:poi.kind==='trade'?`Falar com ${EXPEDITION.ivani}`:poi.name})),
 ...(!this.campaign.seed.received?[{id:'survivor',key:'npc:survivor',type:'npc',position:POINTS.shelter,range:4,priority:25,text:COPY.talk}]:[]),
 {id:'core',key:'terminal:core-1',type:'terminal',position:{x:POINTS.core.x-1,z:POINTS.core.z+8},range:5,priority:20,text:COPY.operate},
 truckEntryTarget(this.current,this.currentQ,p,COPY.enter)];
}
interaction(){return this.presentedInteraction||null;}
refreshInteraction(){
 if(!this.player)return;
 this.presentedInteraction=this.context()==='driving'?{id:'exit',key:'truck:exit',type:'exit',text:!canExit(this.state.speed)?COPY.stop:this.state.notice===COPY.exitBlocked?COPY.exitBlocked:COPY.exit}:this.interactions.select(this.interactionCandidates(),this.observer(),t=>this.visibleTarget(t));
}
interact(key){if(!this.active()||key&&this.presentedInteraction?.key!==key)return;if(this.state.mode==='driving'){if(!canExit(this.state.speed)){this.state.notice=COPY.stop;this.emit();return;}const exit=this.player.findExit(this.vehicle);if(!exit){this.state.notice=COPY.exitBlocked;this.emit();return;}this.vehicle.body.setLinvel({x:0,y:0,z:0},true);this.vehicle.body.setAngvel({x:0,y:0,z:0},true);this.state.speed=0;this.state.signedSpeed=0;this.state.notice=COPY.walkRange;this.player.teleport(exit.x,exit.z,exit.y);this.playerVisual.gesture('exit');this.player.yaw=0;this.state.mode='walking';this.state.resumeMode='walking';this.input.setContext('walking');this.resetCargo();}
else{const target=this.interactions.presented;this.playerVisual.gesture('interact');if(!this.interactions.execute(key,this.observer(),t=>this.visibleTarget(t),()=>{})){this.state.notice='O alvo saiu de alcance ou está obstruído.';this.emit();return;}if(target?.id==='inspection'){this.state.inspection=target.object;this.tutorial.event('inspect',{id:target.object});this.openPanel('inspection');}else if(target?.id==='network'){this.state.networkPoint=target.point;if(!this.campaign.network.visited.includes(target.point))this.campaign.network.visited.push(target.point);this.openPanel('network');}else if(target?.id==='road'){this.state.roadPoint=target.point;this.state.roadEntity=target.type;if(!this.campaign.road.visited.includes(target.point))this.campaign.road.visited.push(target.point);this.openPanel('road');}else if(target?.id==='truck'){this.tutorial.event('enter');this.playerVisual.gesture('enter');this.state.mode='driving';this.state.resumeMode='driving';this.input.setContext('driving');this.state.notice='';this.cameras.initial=true;}else if(target?.id==='poi'){this.state.poi=target.poi;if(!this.campaign.expedition.visited.includes(target.poi))this.campaign.expedition.visited.push(target.poi);this.openPanel('poi');}else if(target?.id==='survivor')this.openPanel('dialogue');else if(target?.id==='core')this.openPanel('core');}this.emit();}
canWork(){return this.state.speed<.6&&(this.context()==='driving'||near(this.player.body.translation(),this.current,6));}
calibration(){return calibrationStatus(this.campaign,'core-1',{usePlayer:true,useTruck:near(this.player.body.translation(),this.current,40),atTerminal:near(this.player.body.translation(),{x:POINTS.core.x-1,z:POINTS.core.z+8},5),engineOff:!this.state.engineOn,parked:this.parked()});}
parked(){return near(this.current,POINTS.delivery,15)&&this.state.speed<.6&&!this.state.engineOn;}
action(type,payload){let ok=false,failure='';const c=this.campaign;const network=this.networkController.action(type,payload);if(network!==undefined){this.state.notice=network?'':this.networkController.failureReason||W.error;this.emit();return network;}const road=this.roadController.action(type,payload);if(road!==undefined){this.state.notice=road?'':COPY.actionError;this.emit();return road;}
if(type==='consume'&&(payload.from==='player'||this.canWork()))ok=consume(c,payload.id,payload.from);
const poi=POIS.find(p=>p.id===this.state.poi);const atPoi=this.state.overlay==='poi'&&this.context()==='walking'&&poi&&near(this.player.body.translation(),{x:poi.x,z:poi.z-1},4);
if(type==='loot'&&atPoi)ok=loot(c,poi.id);
if(type==='buy'&&atPoi&&poi.kind==='trade')ok=buy(c,payload);
if(type==='sell'&&atPoi&&poi.kind==='trade')ok=sellParts(c);
if(type==='rest'&&atPoi&&poi.kind==='trade')ok=rest(c);
if(type==='receive'&&this.state.overlay==='dialogue'&&near(this.player.body.translation(),POINTS.shelter,4)){ok=receiveSeed(c);syncFirst(c);if(ok){this.resetCargo();this.checkpoint(1);this.resume();this.openPanel('radio');}}
if(type==='transfer'&&this.canWork())ok=transfer(c,payload.id,payload.from,payload.quantity||1);
if(type==='repair'&&this.canWork()&&(!payload.full||near(this.current,POINTS.shelter,35)))ok=repair(c,payload.id,!!payload.full);
if(type==='refuel'&&this.canWork())ok=refuel(c,this.state);
if(type==='coolant'&&this.canWork())ok=coolant(c);
if(type==='collect'&&near(this.current,POINTS.salvage,14)&&this.state.speed<.6)ok=collect(c,'road-cache');
if(type==='plan'&&['safe','short'].includes(payload)){c.flags.plannedRoute=payload;c.decisions.push(`planned-${payload}`);ok=true;}
if(type==='calibrate'&&this.state.overlay==='core'&&this.context()==='walking'){
 const status=this.calibration();ok=calibrate(c,{...status.access,atTerminal:status.code!=='terminal',engineOff:!this.state.engineOn,parked:this.parked()});if(!ok)failure=status.message;
}
if(type==='activate'&&this.state.overlay==='core'&&this.context()==='walking'&&this.parked()&&near(this.player.body.translation(),{x:POINTS.core.x-1,z:POINTS.core.z+8},5)&&c.road.generator){const result=activateCore(c);syncFirst(c);ok=!!result;if(ok){this.state.activationResult=result;this.features.apply(c.restoration.ashes);this.checkpoint(c.restoration.ashes?4:3);}}
if(ok&&['repair','calibrate'].includes(type))this.playerVisual.gesture('repair');
if(ok)this.tutorial.event('action',{type,poi:this.state.poi});
this.state.notice=ok?'':failure||(['loot','buy','rest','sell','consume'].includes(type)?EXPEDITION.noRoom:COPY.actionError);this.emit();return ok;
}
serialize(){syncFirst(this.campaign);if(this.campaign.network.cargo)this.campaign.network.seeds[this.campaign.network.cargo].integrity=this.campaign.seed.integrity;return {schemaVersion:3,truck:{position:this.current.toArray(),rotation:this.currentQ.toArray()},player:{position:Object.values(this.player.body.translation())},context:this.context()==='walking'?'walking':'driving',fuel:this.state.fuel,temperature:this.state.temperature,engineOn:this.state.engineOn,campaign:clone(this.campaign)};}
checkpoint(n){this.campaign.checkpoint=Math.max(this.campaign.checkpoint,n);const data=this.serialize(),slot=this.saves.slot;const client=this.saves;if(!slot){this.state.notice=COPY.saveError;return;}this.saveQueue=this.saveQueue.then(async()=>{if(this.disposed)return;this.state.saving=true;try{await client.save(data,slot);this.state.notice=COPY.saveOk;}catch{this.state.notice=COPY.saveError;}finally{this.state.saving=false;}});}
async save(slot){this.state.saving=true;try{await this.saveQueue;await this.saves.save(this.serialize(),slot);this.state.notice=COPY.saveOk;return true;}catch(e){this.state.notice=e.message||COPY.saveError;return false;}finally{this.state.saving=false;this.emit();}}
async load(slot){const data=await this.saves.load(slot);if(!validSave(data))throw new Error(COPY.saveError);await this.audio.start(this.settings.volume);this.campaign=upgradeCampaign(data.campaign);this.tutorial=new TutorialController(this.campaign);const p=data.truck.position;this.vehicle.teleport(p[0],p[2],p[1]);this.vehicle.body.setRotation({x:data.truck.rotation[0],y:data.truck.rotation[1],z:data.truck.rotation[2],w:data.truck.rotation[3]},true);this.sync();this.player.teleport(data.player.position[0],data.player.position[2],data.player.position[1]);Object.assign(this.state,{mode:data.context,resumeMode:data.context,overlay:null,fuel:data.fuel,temperature:data.temperature,engineOn:data.engineOn,speed:0,signedSpeed:0,arrived:p[2]<=-2960,notice:COPY.loadOk});this.features.apply(this.campaign.restoration.ashes);this.networkWorld.reset();this.roadWorld.reset();this.preparePosition(this.current);this.vehicle.resetDrivetrain(data.engineOn,this.state);this.input.setContext(data.context);this.cameras.initial=true;this.resetCargo();this.emit();}
setSettings(s){const graphics=this.settings.quality!==s.quality||this.settings.scale!==s.scale;if(this.player&&s.footCamera!==this.settings.footCamera)this.player.view=s.footCamera||'first';this.settings=s;if(graphics){this.rendering?.applySettings(s);this.pbr?.setQuality(s.quality).catch(error=>this.assets?.errors.push(error.message));}this.cameras?.applySettings(s);}
snapshot(){const info=this.rendering?.renderer.info.render;return {...this.state,tutorial:this.tutorial.snapshot(),assets:this.assets?.snapshot(),pbr:this.pbr?.snapshot(),ambience:this.ambientWorld?.snapshot(),importedTruck:this.truckVisual?.snapshot(),environmentModels:this.environmentModels?.snapshot(),importedNpc:this.npcActor?.snapshot(),dante:this.playerVisual?.snapshot(),footCamera:this.player?.view,simulation:{steps:this.loop.totalSteps,lastFrameSteps:this.loop.stepsLastFrame,droppedSeconds:this.loop.droppedSeconds,fixedStep:CONFIG.fixedStep},instruments:this.truck?.instruments.snapshot(),truckVisual:this.truck?{steeringWheelAngle:this.truck.steeringWheel.rotation.z,cabPitch:this.truck.cab.rotation.x,cabRoll:this.truck.cab.rotation.z}:null,cameraPose:this.cameras?.snapshot(),audio:this.audio.snapshot?.(),objective:objective(this.campaign),loaded:hasCargo(this.campaign),weather:weatherAt(this.campaign,this.current.z),radioMessages:radioMessages(this.campaign,this.current.z),networkVisual:this.networkWorld?.snapshot(),roadVisual:this.roadWorld?.snapshot(),ready:this.ready,position:this.current.toArray(),playerYaw:this.player?.yaw,playerPosition:this.player?Object.values(this.player.body.translation()):[0,0,0],speedKmh:this.state.speed*3.6,fps:this.fps,averageFps:this.fpsSamples.length?this.fpsSamples.reduce((a,b)=>a+b,0)/this.fpsSamples.length:0,drawCalls:info?.calls||0,triangles:info?.triangles||0,sectors:this.world?.sectors.size||0,sectorKeys:this.world?[...this.world.sectors.keys()]:[],quaternion:this.currentQ.toArray(),wheelContacts:this.vehicle?Array.from({length:6},(_,i)=>this.vehicle.controller.wheelIsInContact(i)):[],suspension:this.vehicle?Array.from({length:6},(_,i)=>this.vehicle.controller.wheelSuspensionLength(i)):[],input:this.input?.read(),footBoundary:!!this.player?.boundaryBlocked,expeditionVisual:this.expeditionWorld?{lootVisible:Object.fromEntries([...this.expeditionWorld.lootMeshes].map(([id,mesh])=>[id,mesh.visible]))}:null,worldVisual:this.features?{rain:this.features.rain.visible,plants:this.features.plants.visible,growth:this.features.growth,barrierOpen:!this.features.barrierBody,plantCount:this.features.plants.count}:null,campaign:clone(this.campaign),integrity:this.campaign.seed.received?this.campaign.seed.integrity:null,chance:activationChance(this.campaign.seed.integrity),calibration:this.player?this.calibration():null,networkCalibration:NETWORK_POINTS.find(p=>p.id===this.state.networkPoint)?.kind==='network-core'?this.networkController.calibration(NETWORK_POINTS.find(p=>p.id===this.state.networkPoint)):null,interaction:this.player?this.interaction():null,canWork:this.player?this.canWork():false,parked:this.player?this.parked():false};}
emit(){if(!this.disposed){if(this.state.mode!=='paused')this.refreshInteraction();this.publish(this.snapshot());}}
dispose(){this.disposed=true;cancelAnimationFrame(this.raf);this.input?.dispose();this.audio.dispose();this.truckVisual?.dispose();this.npcActor?.dispose();this.playerVisual?.dispose();this.menuScene?.dispose();this.ambientWorld?.dispose();this.environmentModels?.dispose();this.assets?.dispose();this.tutorialWorld?.dispose();this.networkWorld?.dispose();this.roadWorld?.dispose();this.expeditionWorld?.dispose();this.features?.dispose();this.player?.dispose();this.world?.dispose();this.rendering?.dispose(new Set(Object.values(this.materials||{})));const textures=new Set();Object.values(this.materials||{}).forEach(m=>{for(const v of Object.values(m))if(v?.isTexture&&!v.userData.assetManaged)textures.add(v);m.dispose();});textures.forEach(t=>t.dispose());if(this.physics){if(this.vehicle)this.physics.removeVehicleController(this.vehicle.controller);this.physics.free();}if(typeof window!=='undefined'&&window.__GAME_DEBUG__===this.debug)delete window.__GAME_DEBUG__;}
}

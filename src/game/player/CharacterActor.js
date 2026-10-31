import * as THREE from 'three';
import {dressWorker} from './WorkerWardrobe.js';

// Animation of an imported, licensed NPC at an existing gameplay/collision anchor.
// Locomotion must be driven by the character controller, never by a walk clip's root motion.
export class CharacterActor {
 constructor(assets,placeholder){this.assets=assets;this.placeholder=placeholder;this.time=0;this.state='idle';}
 async load(definition){
 if(this.disposed||definition?.status!=='installed'||definition.rightsCleared!==true)return false;
 if(!definition.license||!definition.source||!definition.attribution)throw new Error('Personagem sem licença/origem/crédito');
 if(definition.inPlace!==true)throw new Error('NPC precisa de animações in-place para preservar a posição e o colisor');
 const lease=await this.assets.model(definition.url);this.lease=lease;
 const idle=lease.animations.find(c=>c.name===definition.idle),walk=lease.animations.find(c=>c.name===definition.walk);
 if(!idle||!walk){lease.release();this.lease=null;throw new Error('NPC exige clips idle e walk identificados no manifesto');}
 const model=lease.scene;model.scale.setScalar(definition.scale||1);model.rotation.y=definition.rotationY||0;
 const bounds=new THREE.Box3().setFromObject(model),height=bounds.max.y-bounds.min.y;
 if(height<1.3||height>2.2){lease.release();this.lease=null;throw new Error('Escala do NPC fora de 1,3–2,2 m');}
 if(this.disposed||this.assets.disposed||!this.placeholder.parent){lease.release();this.lease=null;return false;}
 model.position.y=-bounds.min.y;this.model=model;this.anchor=new THREE.Group();this.anchor.position.copy(this.placeholder.position);this.anchor.add(model);this.placeholder.parent.add(this.anchor);this.placeholder.visible=false;
 this.mixer=new THREE.AnimationMixer(model);this.actions={idle:this.mixer.clipAction(idle),walk:this.mixer.clipAction(walk)};for(const name of ['run','interact','repair','enter','exit']){const clip=lease.animations.find(c=>c.name===definition[name]);if(clip)this.actions[name]=this.mixer.clipAction(clip);}
 this.ownedMaterials=[];if(definition.palette)model.traverse(o=>{if(!o.isMesh)return;o.material=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{const next=m.clone();const color=definition.palette[m.name];if(color)next.color.set(color);this.ownedMaterials.push(next);return next;});if(o.material.length===1)o.material=o.material[0];});
 if(definition.wardrobe){this.wardrobe=dressWorker(model,definition.wardrobe);model.scale.multiplyScalar(this.wardrobe.heightScale||1);model.updateMatrixWorld(true);model.position.y+=this.anchor.position.y-new THREE.Box3().setFromObject(model).min.y;}this.headBone=model.getObjectByName('head');this.actions.idle.play();this.state='idle';return true;
 }
 setMotion(speed){const next=Math.abs(speed)>4&&this.actions?.run?'run':Math.abs(speed)>.08?'walk':'idle';if(this.gesture&&this.gesture.isRunning())return;if(this.gesture){this.gesture.fadeOut(.15);this.gesture=null;this.state='';}if(!this.mixer||next===this.state)return;this.actions[next].reset().fadeIn(.2).play();this.actions[this.state]?.fadeOut(.2);this.state=next;}
 playGesture(name){if(!this.actions?.[name])return;this.gesture=this.actions[name];this.gesture.reset().setLoop(THREE.LoopOnce,1);this.gesture.clampWhenFinished=true;this.gesture.fadeIn(.12).play();this.actions[this.state]?.fadeOut(.12);}
 update(dt,viewer,speed=0,heading){
 if(!this.model)return;this.setMotion(speed);const distance=this.anchor.position.distanceTo(viewer);this.time+=dt;
 if(this.actions.walk)this.actions.walk.timeScale=Math.max(.8,Math.min(1.4,Math.abs(speed)/2.4));if(this.actions.run)this.actions.run.timeScale=Math.max(.85,Math.min(1.35,Math.abs(speed)/4.5));
 if(this.headBone&&this.headBase)this.headBone.quaternion.copy(this.headBase);
 if(distance<40||this.time>1/15){this.mixer.update(this.time);this.time=0;}
 if(Number.isFinite(heading)){this.anchor.rotation.y=heading;}else if(distance<6){const wanted=Math.atan2(viewer.x-this.anchor.position.x,viewer.z-this.anchor.position.z),difference=Math.atan2(Math.sin(wanted-this.anchor.rotation.y),Math.cos(wanted-this.anchor.rotation.y));this.anchor.rotation.y+=difference*(1-Math.exp(-dt*4));}
 if(this.headBone){this.headBase=this.headBone.quaternion.clone();const wanted=Math.atan2(viewer.x-this.anchor.position.x,viewer.z-this.anchor.position.z)-this.anchor.rotation.y,target=distance<6&&!Number.isFinite(heading)?Math.max(-.32,Math.min(.32,Math.atan2(Math.sin(wanted),Math.cos(wanted)))):0;this.headLook=(this.headLook||0)+(target-(this.headLook||0))*(1-Math.exp(-dt*5));this.headBone.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),this.headLook));}
 if(!Number.isFinite(heading)&&!this.gesture&&distance>6&&distance<18){this.activityClock=(this.activityClock||0)+dt;if(this.activityClock>9){this.playGesture(['tomas','marta','mechanic'].includes(this.wardrobe?.style)?'repair':'interact');this.activityClock=0;}}
 }
 snapshot(){return {loaded:!!this.model,state:this.state,animationTime:this.mixer?.time||0,animations:this.mixer?Object.keys(this.actions):[],visible:!!this.anchor?.visible,wardrobe:this.wardrobe?.style||null,features:this.wardrobe?.features||[]};}
 dispose(){this.disposed=true;this.wardrobe?.dispose();this.ownedMaterials?.forEach(m=>m.dispose());this.mixer?.stopAllAction();if(this.model)this.mixer?.uncacheRoot(this.model);this.anchor?.removeFromParent();this.lease?.release();this.lease=null;}
}

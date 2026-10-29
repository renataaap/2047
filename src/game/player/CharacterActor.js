import * as THREE from 'three';

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
 this.actions.idle.play();this.state='idle';return true;
 }
 setMotion(speed){const next=Math.abs(speed)>4&&this.actions?.run?'run':Math.abs(speed)>.08?'walk':'idle';if(this.gesture&&this.gesture.isRunning())return;if(this.gesture){this.gesture.fadeOut(.15);this.gesture=null;this.state='';}if(!this.mixer||next===this.state)return;this.actions[next].reset().fadeIn(.2).play();this.actions[this.state]?.fadeOut(.2);this.state=next;}
 playGesture(name){if(!this.actions?.[name])return;this.gesture=this.actions[name];this.gesture.reset().setLoop(THREE.LoopOnce,1);this.gesture.clampWhenFinished=true;this.gesture.fadeIn(.12).play();this.actions[this.state]?.fadeOut(.12);}
 update(dt,viewer,speed=0,heading){
 if(!this.model)return;this.setMotion(speed);const distance=this.anchor.position.distanceTo(viewer);this.time+=dt;
 if(distance<40||this.time>1/15){this.mixer.update(this.time);this.time=0;}
 if(Number.isFinite(heading)){this.anchor.rotation.y=heading;}else if(distance<6){const wanted=Math.atan2(viewer.x-this.anchor.position.x,viewer.z-this.anchor.position.z),difference=Math.atan2(Math.sin(wanted-this.anchor.rotation.y),Math.cos(wanted-this.anchor.rotation.y));this.anchor.rotation.y+=difference*(1-Math.exp(-dt*4));}
 }
 snapshot(){return {loaded:!!this.model,state:this.state,animationTime:this.mixer?.time||0,animations:this.mixer?Object.keys(this.actions):[],visible:!!this.anchor?.visible};}
 dispose(){this.disposed=true;this.ownedMaterials?.forEach(m=>m.dispose());this.mixer?.stopAllAction();if(this.model)this.mixer?.uncacheRoot(this.model);this.anchor?.removeFromParent();this.lease?.release();this.lease=null;}
}
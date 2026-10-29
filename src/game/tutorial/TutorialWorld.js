import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { TRAINING } from './definitions.js';
import { heightAt } from '../world/terrain.js';

export class TutorialWorld {
 constructor(scene,physics,materials){
  this.physics=physics;this.group=new THREE.Group();scene.add(this.group);this.owned=[];this.bodies=[];
  const add=(w,h,d,x,y,z,mat)=>{const g=new THREE.BoxGeometry(w,h,d);this.owned.push(g);const m=new THREE.Mesh(g,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;this.group.add(m);return m;};
  const home=TRAINING.home,base=heightAt(home.x,home.z);
  // Small usable objects complement the licensed garage. No separate resource pool.
  for(const o of TRAINING.objects){
   add(1.5,.12,.75,o.x,base+.95,o.z,materials.wood);
   for(const dx of [-.6,.6])add(.08,.9,.55,o.x+dx,base+.45,o.z,materials.weatheredMetal);
   const body=physics.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(o.x,base+.5,o.z));physics.createCollider(RAPIER.ColliderDesc.cuboid(.75,.5,.375),body);this.bodies.push(body);
   if(o.id==='logbook'){const book=add(.38,.04,.3,o.x,base+1.04,o.z,materials.leather);book.rotation.y=.2;add(.34,.035,.27,o.x,base+1.05,o.z,materials.paint);}
   else {add(.42,.16,.3,o.x-.3,base+1.1,o.z,materials.steel);for(let i=0;i<3;i++){const g=new THREE.TorusGeometry(.075,.018,6,12);this.owned.push(g);const part=new THREE.Mesh(g,materials.steel);part.rotation.x=Math.PI/2;part.position.set(o.x+.1+i*.15,base+1.04,o.z);this.group.add(part);}}
  }
  this.marking=new THREE.Group();this.group.add(this.marking);const p=TRAINING.parking;
  for(const side of [-1,1]){const g=new THREE.BoxGeometry(.13,.035,p.halfLength*2);this.owned.push(g);const m=new THREE.Mesh(g,materials.stripe);m.position.set(p.x+side*p.halfWidth,heightAt(p.x+side*p.halfWidth,p.z)+.15,p.z);this.marking.add(m);}
  for(const end of [-1,1]){const g=new THREE.BoxGeometry(p.halfWidth*2,.035,.13);this.owned.push(g);const z=p.z+end*p.halfLength,m=new THREE.Mesh(g,materials.stripe);m.position.set(p.x,heightAt(p.x,z)+.15,z);this.marking.add(m);}
 }
 target(p){const o=TRAINING.objects.find(o=>Math.hypot(o.x-p.x,o.z-p.z)<1.8);return o?{id:'inspection',object:o.id,text:`Inspecionar ${o.title.toLowerCase()}`}:null;}
 update(t){this.marking.visible=t.status==='active'&&t.completed.includes('engine')&&!t.completed.includes('maintenance');}
 dispose(){this.group.removeFromParent();for(const g of this.owned)g.dispose();for(const b of this.bodies)this.physics.removeRigidBody(b);}
}

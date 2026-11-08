import * as THREE from 'three';
import {CORES} from '../../data/network.js';

// Light travelling through the resonator's coils. No full-screen flash, extra
// shadow light or full-region green ring; geometry stays at the equipment.
export class RestorationEffects{
 constructor(scene,world){this.world=world;this.group=new THREE.Group();this.group.name='Resonator response';scene.add(this.group);this.coils=[];this.material=new THREE.MeshBasicMaterial({color:'#c1e9d0',transparent:true,opacity:.5,depthWrite:false});this.geometry=new THREE.TorusGeometry(2.35,.035,4,32);for(let i=0;i<4;i++){const m=new THREE.Mesh(this.geometry,this.material);m.rotation.x=Math.PI/2;this.group.add(m);this.coils.push(m);}this.group.visible=false;this.time=0;}
 update(c,cinematic,dt,menu){const id=cinematic.active?cinematic.core?.id:null,core=id&&CORES.find(k=>k.id===id);this.group.visible=!!core&&!menu;if(!core)return;this.time+=dt;const y=this.world.recoveryHeight(core.x,core.z);this.coils.forEach((m,i)=>{m.position.set(core.x,y+.8+((this.time*1.3+i*.85)%4),core.z);m.scale.setScalar(1+Math.sin(this.time+i)*.025);});this.material.opacity=cinematic.reduced?.28:.35+.2*Math.sin(this.time*1.3)**2;}
 dispose(){this.group.removeFromParent();this.geometry.dispose();this.material.dispose();}
}

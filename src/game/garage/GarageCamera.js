import * as THREE from 'three';
import {cameraPosition} from '../render/cameraCollision.js';
export class GarageCamera{
 constructor(game){this.game=game;this.angle=.65;this.elevation=.23;this.distance=11;this.view='orbit';this.first=true;this.target=new THREE.Vector3();}
 orbit(dx,dy){this.view='orbit';this.angle-=dx*.005;this.elevation=THREE.MathUtils.clamp(this.elevation+dy*.004,.08,.7);}
 zoom(d){this.distance=THREE.MathUtils.clamp(this.distance+d*.008,5.5,16);}
 setView(view){this.view=view;if(view==='front')this.angle=Math.PI+.4;if(view==='rear')this.angle=.4;if(view==='side')this.angle=Math.PI/2;this.first=true;}
 update(dt,truck){const g=this.game,root=truck.root,camera=g.rendering.camera;root.updateWorldMatrix(true,false);
  if(this.view==='interior'){truck.cab.updateWorldMatrix(true,false);
   const eye=new THREE.Vector3().fromArray(truck.cockpit.eye).applyMatrix4(truck.cab.matrixWorld);camera.position.copy(eye);camera.up.set(0,1,0);camera.lookAt(new THREE.Vector3(0,-.1,-20).applyQuaternion(root.quaternion).add(eye));camera.fov=64;
  }else{
   const focus=new THREE.Vector3(0,.7,0).applyMatrix4(root.matrixWorld),desired=new THREE.Vector3(Math.sin(this.angle)*this.distance,Math.sin(this.elevation)*this.distance+1,Math.cos(this.angle)*this.distance).applyQuaternion(root.quaternion).add(root.position);
   // Same shape sweep as the driving cameras; exclude only the parked vehicle.
   const safe=cameraPosition(g.physics,focus,desired,g.vehicle.body);
   camera.position.lerp(safe,this.first?1:1-Math.exp(-dt*9));this.target.lerp(focus,this.first?1:1-Math.exp(-dt*9));camera.up.set(0,1,0);camera.lookAt(this.target);camera.fov=54;
  }
  camera.updateProjectionMatrix();this.first=false;
 }
}

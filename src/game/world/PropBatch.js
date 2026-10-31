import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {metricUV} from '../render/metricUV.js';
import {bevelGeometry} from '../render/materials.js';

// Details become a handful of draw calls per streamed composition, not one per bolt.
export class PropBatch {
 constructor(physics,materials,origin={x:0,y:0,z:0},yaw=0){this.physics=physics;this.m=materials;this.origin=origin;this.yaw=yaw;this.group=new THREE.Group();this.group.position.set(origin.x,origin.y,origin.z);this.group.rotation.y=yaw;this.parts=new Map();this.bodies=[];this.owned=[];this.lamps=[];this.count=0;}
 part(g,mat,x,y,z,rotation=[0,0,0]){metricUV(g);const matrix=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),new THREE.Vector3(1,1,1));g.applyMatrix4(matrix);const plain=g.index?g.toNonIndexed():g;if(plain!==g)g.dispose();if(!this.parts.has(mat))this.parts.set(mat,[]);this.parts.get(mat).push(plain);this.count++;}
 box(w,h,d,mat,x,y,z,solid=false,ry=0){this.part(w>.5&&h>.25&&d>.4?bevelGeometry(w,h,d,.035):new THREE.BoxGeometry(w,h,d),mat,x,y,z,[0,ry,0]);if(solid)this.solid(x,y,z,w,h,d,ry);}
 cylinder(r,h,mat,x,y,z,rotation=[0,0,0],top=r){this.part(new THREE.CylinderGeometry(top,r,h,12),mat,x,y,z,rotation);}
 ring(r,t,mat,x,y,z,rotation=[Math.PI/2,0,0]){this.part(new THREE.TorusGeometry(r,t,5,20),mat,x,y,z,rotation);}
 cable(points,r=.025,mat=this.m.rubber){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));this.part(new THREE.TubeGeometry(curve,14,r,5,false),mat,0,0,0);}
 solid(x,y,z,w,h,d,ry=0){const c=Math.cos(this.yaw),s=Math.sin(this.yaw),o=this.origin,b=this.physics.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(o.x+x*c+z*s,o.y+y,o.z-x*s+z*c).setRotation({x:0,y:Math.sin((this.yaw+ry)/2),z:0,w:Math.cos((this.yaw+ry)/2)}));b.userData={entityType:'ambient'};this.physics.createCollider(RAPIER.ColliderDesc.cuboid(w/2,h/2,d/2).setFriction(.8),b);this.bodies.push(b);return b;}
 label(text,w,h,x,y,z,cache,ry=0){
  if(!cache.has(text)){const c=document.createElement('canvas');c.width=512;c.height=128;const a=c.getContext('2d');a.fillStyle='#323a36';a.fillRect(0,0,512,128);a.strokeStyle='#aa946b';a.lineWidth=5;a.strokeRect(9,9,494,110);a.fillStyle='#e6ddbf';a.font='bold 28px sans-serif';a.textAlign='center';a.fillText(text,256,75,470);for(let i=0;i<55;i++){a.fillStyle='#25292140';a.fillRect(i*37%512,i*19%128,12,2);}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;cache.set(text,new THREE.MeshStandardMaterial({map:t,roughness:.95,metalness:0,side:THREE.DoubleSide}));}
  const g=new THREE.PlaneGeometry(w,h);g.rotateY(ry);g.translate(x,y,z);if(!this.parts.has(cache.get(text)))this.parts.set(cache.get(text),[]);this.parts.get(cache.get(text)).push(g.toNonIndexed());g.dispose();
 }
 crate(x,y,z,s=1){const m=this.m;this.box(.85*s,.7*s,.75*s,m.wood,x,y+.35*s,z,true);for(const dx of [-.3,.3])this.box(.065*s,.74*s,.78*s,m.steel,x+dx*s,y+.35*s,z);for(const dy of [.1,.58])this.box(.88*s,.07*s,.78*s,m.wood,x,y+dy*s,z);}
 barrel(x,y,z){const m=this.m;this.cylinder(.35,.92,m.rust,x,y+.46,z);for(const h of [.08,.3,.7,.88])this.ring(.355,.023,m.steel,x,y+h,z);this.cylinder(.32,.025,m.dark,x,y+.93,z);this.solid(x,y+.46,z,.7,.92,.7);}
 tire(x,y,z){this.ring(.38,.14,this.m.rubber,x,y+.14,z);for(let i=0;i<14;i++){const a=i/14*Math.PI*2;this.box(.09,.045,.24,this.m.dark,x+Math.sin(a)*.48,y+.14,z+Math.cos(a)*.48,false,a);}}
 bench(x,y,z,w=2){const m=this.m;this.box(w,.12,.7,m.wood,x,y+.85,z);for(const dx of [-w*.4,w*.4])for(const dz of [-.25,.25])this.box(.07,.8,.07,m.steel,x+dx,y+.4,z+dz);this.box(w-.1,.07,.06,m.steel,x,y+.2,z+.23);this.solid(x,y+.45,z,w,.9,.7);}
 shelf(x,y,z){const m=this.m;for(const dx of [-.65,.65])for(const dz of [-.24,.24])this.box(.05,1.9,.05,m.steel,x+dx,y+.95,z+dz);for(let i=0;i<4;i++){this.box(1.4,.06,.6,m.wood,x,y+.15+i*.52,z);for(let j=0;j<3;j++)this.cylinder(.1,.23,m.paint,x-.43+j*.4,y+.29+i*.52,z);}this.solid(x,y+.95,z,1.4,1.9,.6);}
 lamp(x,y,z){this.box(.35,.08,.25,this.m.steel,x,y,z);this.box(.27,.035,.2,this.m.lamp,x,y-.05,z);const c=Math.cos(this.yaw),s=Math.sin(this.yaw);this.lamps.push({x:this.origin.x+x*c+z*s,y:this.origin.y+y-.2,z:this.origin.z-x*s+z*c});}
 finish(){for(const [material,pieces] of this.parts){const geometry=mergeGeometries(pieces,false);pieces.forEach(g=>g.dispose());if(!geometry)throw Error('Incompatible ambient geometry');geometry.computeBoundingSphere();this.owned.push(geometry);const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=material!==this.m.lamp;mesh.receiveShadow=true;this.group.add(mesh);}this.parts.clear();return this;}
 dispose(){for(const body of this.bodies)this.physics.removeRigidBody(body);this.group.traverse(o=>{if(o.isInstancedMesh)o.dispose();});for(const g of this.owned)g.dispose();this.group.removeFromParent();}
}

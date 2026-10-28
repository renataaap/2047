import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { CONFIG } from '../../data/config.js';
import { heightAt, roadX, roadHeight, randomSeed,detourX } from './terrain.js';
import { bevelGeometry } from '../render/materials.js';
import { mergeStatic } from '../render/mergeStatic.js';
export class World {
  constructor(scene,physics,materials) {
    this.scene=scene;this.physics=physics;this.m=materials;this.sectors=new Map();this.queue=[];this.disposed=false;
    this.rockGeometry=new THREE.DodecahedronGeometry(1,0);this.farRockGeometry=new THREE.OctahedronGeometry(1,0);
    this.stripeGeometry=new THREE.PlaneGeometry(.14,3.5);this.stripeGeometry.rotateX(-Math.PI/2);
    this.rockMaterial=materials.rock;
    this.landmarks=new THREE.Group();scene.add(this.landmarks);this.landmarkBodies=[];this.buildLandmarks();mergeStatic(this.landmarks);
  }
  collider(desc,bodyList) {const body=this.physics.createRigidBody(RAPIER.RigidBodyDesc.fixed());this.physics.createCollider(desc,body);bodyList.push(body);return body;}
  update(position,distance) {
    const size=CONFIG.world.sectorSize,cx=Math.round(position.x/size),cz=Math.round(position.z/size);
    const desired=new Set();for(let x=cx-1;x<=cx+1;x++)for(let z=cz-1;z<=cz+1;z++){const k=`${x},${z}`;desired.add(k);if(!this.sectors.has(k)&&!this.queue.some(s=>s.key===k))this.queue.push({key:k,x,z});}
    for(const [key,sector] of this.sectors)if(!desired.has(key)){this.remove(sector);this.sectors.delete(key);}
    this.queue=this.queue.filter(s=>desired.has(s.key));
    this.queue.sort((a,b)=>(a.x-cx)**2+(a.z-cz)**2-((b.x-cx)**2+(b.z-cz)**2));
    if(this.queue.length){const job=this.queue.shift();this.sectors.set(job.key,this.buildSector(job.x,job.z));}
    // Le renderer effectue ensuite le culling par frustum, même pour les instances.
    for(const s of this.sectors.values()) {s.group.visible=Math.abs(s.x*size-position.x)<size/2+distance && Math.abs(s.z*size-position.z)<size/2+distance;}
  }
  buildSector(cx,cz) {
    const size=CONFIG.world.sectorSize,n=CONFIG.world.terrainSegments;
    const group=new THREE.Group();this.scene.add(group);const bodies=[];const owned=[];
    const g=new THREE.PlaneGeometry(size,size,n,n);g.rotateX(-Math.PI/2);
    const a=g.attributes.position, colors=new Float32Array(a.count*3),col=new THREE.Color();
    for(let i=0;i<a.count;i++){const x=a.getX(i)+cx*size,z=a.getZ(i)+cz*size,y=heightAt(x,z);a.setXYZ(i,x,y,z);const t=.84+Math.sin(x*.1+z*.12)*.04;col.setRGB(t,t*.98,t*.94);col.toArray(colors,i*3);}
    g.setAttribute('color',new THREE.BufferAttribute(colors,3));g.computeVertexNormals();g.computeBoundingSphere();owned.push(g);
    g.clearGroups();let groupStart=0,materialIndex=null;const gi=g.index.array;for(let k=0;k<gi.length;k+=3){const avg=(a.getZ(gi[k])+a.getZ(gi[k+1])+a.getZ(gi[k+2]))/3,mi=avg<-3200?1:0;if(materialIndex!==null&&mi!==materialIndex){g.addGroup(groupStart,k-groupStart,materialIndex);groupStart=k;}materialIndex=mi;}g.addGroup(groupStart,gi.length-groupStart,materialIndex);const terrain=new THREE.Mesh(g,[this.m.ground,this.m.salt]);terrain.receiveShadow=true;group.add(terrain);
    this.collider(RAPIER.ColliderDesc.trimesh(new Float32Array(a.array),new Uint32Array(g.index.array)).setFriction(.8),bodies);
    const low=cz*size-size/2, high=cz*size+size/2;
    const start=Math.max(-CONFIG.world.roadLength,low),end=Math.min(80,high);
    if(start<end && Math.abs(cx*size)<size/2+60) {
      const positions=[],indices=[];const steps=Math.ceil((end-start)/4);
      for(let i=0;i<=steps;i++){const z=start+(end-start)*i/steps,x=roadX(z);for(const s of [-1,1])positions.push(x+s*5,roadHeight(z)+.09,z);if(i<steps){const j=i*2;indices.push(j,j+2,j+1,j+1,j+2,j+3);}}
      const road=new THREE.BufferGeometry();road.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));road.setIndex(indices);road.computeVertexNormals();
      // Coordonnées de texture répétées le long de la chaussée.
      const uv=[];for(let i=0;i<=steps;i++)uv.push(0,i/3,1,i/3);road.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
      const mesh=new THREE.Mesh(road,this.m.asphalt);mesh.receiveShadow=true;group.add(mesh);owned.push(road);
      this.collider(RAPIER.ColliderDesc.trimesh(new Float32Array(positions),new Uint32Array(indices)).setFriction(1),bodies);
      const count=Math.floor((end-start)/12);if(count>0){const stripes=new THREE.InstancedMesh(this.stripeGeometry,this.m.stripe,count);const dummy=new THREE.Object3D();for(let i=0;i<count;i++){const z=start+i*12+6;dummy.position.set(roadX(z),roadHeight(z)+.115,z);dummy.rotation.y=Math.atan2(roadX(z+1)-roadX(z-1),2);dummy.updateMatrix();stripes.setMatrixAt(i,dummy.matrix);}group.add(stripes);}
    }
    const ds=Math.max(-1750,low),de=Math.min(-650,high);
    if(ds<de){const positions=[],indices=[];let row=0;for(let z=ds;z<=de+.1;z+=4){const x=detourX(z);if(Math.round(x/size)!==cx)continue;for(const side of [-1,1])positions.push(x+side*5,roadHeight(z)+.18,z);if(row){const j=(row-1)*2;indices.push(j,j+2,j+1,j+1,j+2,j+3);}row++;}if(indices.length){const road=new THREE.BufferGeometry();road.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));road.setIndex(indices);const uv=[];for(let i=0;i<row;i++)uv.push(0,i/3,1,i/3);road.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));road.computeVertexNormals();const mesh=new THREE.Mesh(road,this.m.asphalt);mesh.receiveShadow=true;group.add(mesh);owned.push(road);this.collider(RAPIER.ColliderDesc.trimesh(new Float32Array(positions),new Uint32Array(indices)).setFriction(1),bodies);}}
    const r=randomSeed(CONFIG.seed+cx*7387+cz*19349),count=32;
    const rocks=new THREE.InstancedMesh(this.rockGeometry,this.rockMaterial,count);rocks.castShadow=true;rocks.receiveShadow=true;
    const farRocks=new THREE.InstancedMesh(this.farRockGeometry,this.rockMaterial,count);
    const dummy=new THREE.Object3D();
    for(let i=0;i<count;i++) {
      let x=cx*size+(r()-.5)*size,z=cz*size+(r()-.5)*size;
      if(Math.abs(x-roadX(z))<14)x=roadX(z)+(i%2?1:-1)*(17+r()*24);
      if(z < -650 && z > -1750 && Math.abs(x-detourX(z))<14)x=detourX(z)+20;
      const scale=1+r()*4;dummy.position.set(x-cx*size,heightAt(x,z)+scale*.2,z-cz*size);dummy.scale.set(scale,scale*.65,scale*.8);dummy.rotation.set(r(),r()*6,r());dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);farRocks.setMatrixAt(i,dummy.matrix);
      this.collider(RAPIER.ColliderDesc.ball(scale*.7).setTranslation(x,heightAt(x,z)+scale*.2,z),bodies);
    }
    const rocksLod=new THREE.LOD();rocksLod.position.set(cx*size,0,cz*size);rocksLod.addLevel(rocks,0);rocksLod.addLevel(farRocks,240);group.add(rocksLod);
    // Plus gros éléments au loin, sans multiplier les appels de rendu.
    const hills=new THREE.InstancedMesh(this.rockGeometry,this.rockMaterial,14);
    for(let i=0;i<14;i++){const z=cz*size+(r()-.5)*size,x=cx*size+(i%2?1:-1)*(180+r()*320);dummy.position.set(x,heightAt(x,z)-8,z);dummy.scale.set(50+r()*70,18+r()*45,45+r()*40);dummy.updateMatrix();hills.setMatrixAt(i,dummy.matrix);}hills.visible=cz*size>-3200;group.add(hills);
    return {x:cx,z:cz,group,bodies,owned};
  }
  buildLandmarks() {
    const add=(geo,mat,x,y,z)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;this.landmarks.add(o);return o;};
    const block=(w,h,d,mat,x,y,z,collision=false)=>{const mesh=add(bevelGeometry(w,h,d),mat,x,y,z);if(collision)this.collider(RAPIER.ColliderDesc.cuboid(w/2,h/2,d/2).setTranslation(x,y,z),this.landmarkBodies);return mesh;};
    // Abrigo aberto, ao lado da estrada. Pórtico, chapa e toldo.
    const sy=heightAt(-22,8);
    for(const x of [-28,-17])for(const z of [2,13])block(.22,5,.22,this.m.rust,x,sy+2.5,z,true);
    const roof=block(12,.18,14,this.m.steel,-22.5,sy+5.1,7.5);roof.rotation.z=.06;
    block(11,4.1,.18,this.m.rust,-22.5,sy+2.2,14,true);
    for(let i=0;i<16;i++)block(.08,4.1,.08,this.m.steel,-27.5+i*.67,sy+2.2,13.85);
    block(1.8,1.3,2.6,this.m.dark,-25,sy+.7,10,true);
    for(const x of [-18.5,-20])add(new THREE.CylinderGeometry(.45,.45,1.2,10),this.m.rust,x,sy+.6,11);
    // Marco dominante: antigo complexo de armazenamento, vazio e silencioso.
    const tx=-90,tz=-290,ty=heightAt(tx,tz);
    const tank=add(new THREE.CylinderGeometry(12,12,23,20,1,true),this.m.rust,tx,ty+16,tz);
    add(new THREE.ConeGeometry(12.5,4,20),this.m.dark,tx,ty+29,tz);
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2;block(.8,12,.8,this.m.dark,tx+Math.cos(a)*9,ty+6,tz+Math.sin(a)*9,true);}
    for(const y of [6,23]){const ring=add(new THREE.TorusGeometry(12.1,.25,5,20),this.m.steel,tx,ty+y,tz);ring.rotation.x=Math.PI/2;}
    for(const z of [-400,-450]){const x=100,y=heightAt(x,z);block(12,19,16,this.m.dark,x,y+9,z,true);block(1.9,47,1.9,this.m.rust,x+8,y+22,z,true);}
    // Poteaux cassés et garde-corps ponctuels, jalons du trajet.
    for(let i=0;i<20;i++){const z=-i*140-50,x=roadX(z)+10,y=heightAt(x,z);const pole=block(.22,7,.22,this.m.steel,x,y+3.5,z,true);pole.rotation.z=i%5===0?.22:0;block(3,.14,.14,this.m.dark,x,y+6.5,z);}
    // Rocher repérable utilisé pour les essais de collision.
    const rock=add(new THREE.DodecahedronGeometry(2,0),this.m.rock,11,heightAt(11,-32)+1,-32);this.collider(RAPIER.ColliderDesc.ball(1.7).setTranslation(rock.position.x,rock.position.y,rock.position.z),this.landmarkBodies);
  }
  remove(s) {this.scene.remove(s.group);s.group.traverse(o=>{if(o.isInstancedMesh)o.dispose();});s.bodies.forEach(b=>this.physics.removeRigidBody(b));s.owned.forEach(g=>g.dispose());}
  dispose() {this.disposed=true;for(const s of this.sectors.values())this.remove(s);this.sectors.clear();this.landmarkBodies.forEach(b=>this.physics.removeRigidBody(b));this.scene.remove(this.landmarks);this.landmarks.traverse(o=>o.geometry?.dispose());this.rockGeometry.dispose();this.farRockGeometry.dispose();this.stripeGeometry.dispose();}
}

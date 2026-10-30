import * as THREE from 'three';
import {INHABITED_SITES} from '../../data/ambience.js';
import {restoredAt} from '../missions/network.js';
import {detailSurface} from '../render/detailSurfaces.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {DECOR_CELL,planCell} from './contextLayout.js';
import {heightAt} from './terrain.js';
import {PropBatch} from './PropBatch.js';
import {furnishHome,furnishRoad,furnishShelter,roadside} from './decorCompositions.js';

export class AmbientWorld {
 constructor(scene,physics,materials,world){this.scene=scene;this.physics=physics;this.m=materials;this.world=world;this.live=new Map();this.labels=new Map();this.night=0;
  this.m.lamp=new THREE.MeshStandardMaterial({color:'#f5dd9c',emissive:'#ffc67c',emissiveIntensity:.15,roughness:.6});this.m.fabric=new THREE.MeshStandardMaterial({color:'#79766a',roughness:1});this.m.canvas=new THREE.MeshStandardMaterial({color:'#686b52',roughness:1,side:THREE.DoubleSide});this.m.soil=new THREE.MeshStandardMaterial({color:'#4b4233',roughness:1});
  this.m.wood.map=detailSurface('wood');this.m.wood.color.set('#ffffff');this.m.concrete.map=detailSurface('concrete');this.m.concrete.color.set('#e0d9c9');this.m.concrete.normalMap=this.m.rock.normalMap;this.m.concrete.roughnessMap=this.m.rock.roughnessMap;this.m.concrete.normalScale=new THREE.Vector2(.18,.18);this.m.fabric.map=detailSurface('cloth');this.m.canvas.map=detailSurface('cloth');
  const parts=[];const stem=new THREE.CylinderGeometry(.014,.022,.4,5);stem.translate(0,.2,0);parts.push(stem);for(let i=0;i<6;i++){const leaf=new THREE.SphereGeometry(1,8,5),angle=i*2.4;leaf.scale(.13,.025,.055);leaf.rotateZ(i%2?.3:-.3);leaf.rotateY(angle);leaf.translate(Math.sin(angle)*.08,.1+i*.045,Math.cos(angle)*.08);parts.push(leaf);}this.plantGeometry=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());
  this.flakes=new THREE.InstancedMesh(new THREE.PlaneGeometry(.09,.15),this.m.canvas,12);this.flakes.frustumCulled=false;scene.add(this.flakes);this.time=0;
  this.lights=Array.from({length:2},()=>{const l=new THREE.PointLight('#ffd29b',0,13,2);scene.add(l);return l;});
 }
 buildSite(p){const b=new PropBatch(this.physics,this.m,{x:p.x,y:heightAt(p.x,p.z)+.02,z:p.z},p.face===-1?Math.PI:0);if(p.kind==='home')furnishHome(b,this.labels);else if(p.kind==='shelter')furnishShelter(b,this.labels);else furnishRoad(b,p,this.labels);b.finish();if(['home','shelter'].includes(p.kind)){b.garden=new THREE.InstancedMesh(this.plantGeometry,this.m.leaf,16);const d=new THREE.Object3D();for(let i=0;i<16;i++){d.position.set((p.kind==='home'?-6:-4)+Math.floor(i/8)*3+(i%4-.5)*.3,.32,(p.kind==='home'?17:9)+(Math.floor(i/4)%2-.5)*.5);d.rotation.y=i*2.4;d.updateMatrix();b.garden.setMatrixAt(i,d.matrix);}b.group.add(b.garden);}b.group.name=`inhabited:${p.id}`;b.site=p;this.scene.add(b.group);return b;}
 buildCell(index){const b=new PropBatch(this.physics,this.m),samples=planCell(index,(x,z)=>this.world.groundHeight(x,z));for(const p of samples){const sub=new PropBatch(this.physics,this.m,{x:p.x,y:p.y,z:p.z},p.yaw);roadside(sub,p,this.labels);sub.group.updateMatrix();for(const [mat,geometries] of sub.parts){if(!b.parts.has(mat))b.parts.set(mat,[]);for(const g of geometries){g.applyMatrix4(sub.group.matrix);b.parts.get(mat).push(g);}}b.bodies.push(...sub.bodies);b.count+=sub.count;}b.finish();b.group.name=`roadside:${index}`;b.samples=samples;this.scene.add(b.group);return b;}
 update(position,distance,campaign,menu=false,dt=0){
  const radius=Math.min(320,distance*.7),wanted=new Set(),center=Math.round(position.z/DECOR_CELL);
  for(let i=center-2;i<=center+2;i++)if(i<=0&&i>=-131&&Math.abs(i*DECOR_CELL-position.z)<radius+80){const key=`cell:${i}`;wanted.add(key);if(!this.live.has(key))this.live.set(key,this.buildCell(i));}
  for(const p of INHABITED_SITES)if(Math.hypot(position.x-p.x,position.z-p.z)<Math.min(240,radius)){const key=`site:${p.id}`;wanted.add(key);if(!this.live.has(key))this.live.set(key,this.buildSite(p));}
  for(const [key,b] of this.live)if(!wanted.has(key)){b.dispose();this.live.delete(key);}
  const lamps=[];for(const b of this.live.values()){b.group.visible=!menu;if(b.garden)b.garden.visible=restoredAt(campaign,b.site.z);lamps.push(...b.lamps);}
  this.time+=dt;this.flakes.visible=!menu&&!(Math.abs(position.x+13)<5&&Math.abs(position.z-22)<8);const dummy=new THREE.Object3D();for(let i=0;i<12;i++){dummy.position.set(position.x+((i*3.7+this.time*.9)%28)-14,position.y+.8+(i%3)*.7,position.z-10+(i*7%24));dummy.rotation.set(this.time*.3+i,i*.7,this.time*.2);dummy.updateMatrix();this.flakes.setMatrixAt(i,dummy.matrix);}this.flakes.instanceMatrix.needsUpdate=true;
  lamps.sort((a,b)=>Math.hypot(a.x-position.x,a.z-position.z)-Math.hypot(b.x-position.x,b.z-position.z));
  this.lights.forEach((l,i)=>{const p=lamps[i];l.intensity=!menu&&p?this.night*16:0;l.visible=l.intensity>.016;if(p)l.position.set(p.x,p.y,p.z);});
 }
 setNight(value){this.night=value;this.m.lamp.emissiveIntensity=.15+value*2.5;}
 snapshot(){return {compositions:this.live.size,parts:[...this.live.values()].reduce((n,b)=>n+b.count,0),drawBatches:[...this.live.values()].reduce((n,b)=>n+b.group.children.length,0),colliders:[...this.live.values()].reduce((n,b)=>n+b.bodies.length,0),sites:[...this.live.values()].filter(b=>b.site).map(b=>b.site.id),cells:[...this.live.keys()].filter(k=>k.startsWith('cell:')),lights:this.lights.filter(l=>l.intensity>0).length};}
 dispose(){for(const b of this.live.values())b.dispose();this.live.clear();for(const m of this.labels.values()){m.map.dispose();m.dispose();}this.plantGeometry.dispose();this.flakes.geometry.dispose();this.flakes.dispose();this.flakes.removeFromParent();for(const l of this.lights)l.removeFromParent();}
}

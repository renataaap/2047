import * as THREE from 'three';
import {INHABITED_SITES} from '../../data/ambience.js';
import {DECOR_CELL,planCell} from './contextLayout.js';
import {heightAt} from './terrain.js';
import {PropBatch} from './PropBatch.js';
import {furnishHome,furnishRoad,furnishShelter,roadside} from './decorCompositions.js';

export class AmbientWorld {
 constructor(scene,physics,materials,world){this.scene=scene;this.physics=physics;this.m=materials;this.world=world;this.live=new Map();this.labels=new Map();this.night=0;
  this.m.lamp=new THREE.MeshStandardMaterial({color:'#f5dd9c',emissive:'#ffc67c',emissiveIntensity:.15,roughness:.6});this.m.fabric=new THREE.MeshStandardMaterial({color:'#79766a',roughness:1});this.m.canvas=new THREE.MeshStandardMaterial({color:'#686b52',roughness:1,side:THREE.DoubleSide});this.m.soil=new THREE.MeshStandardMaterial({color:'#4b4233',roughness:1});
  this.lights=Array.from({length:2},()=>{const l=new THREE.PointLight('#ffd29b',0,13,2);scene.add(l);return l;});
 }
 buildSite(p){const b=new PropBatch(this.physics,this.m,{x:p.x,y:heightAt(p.x,p.z)+.02,z:p.z},p.face===-1?Math.PI:0);if(p.kind==='home')furnishHome(b,this.labels);else if(p.kind==='shelter')furnishShelter(b,this.labels);else furnishRoad(b,p,this.labels);b.finish();b.group.name=`inhabited:${p.id}`;b.site=p;this.scene.add(b.group);return b;}
 buildCell(index){const b=new PropBatch(this.physics,this.m),samples=planCell(index,(x,z)=>this.world.groundHeight(x,z));for(const p of samples){const sub=new PropBatch(this.physics,this.m,{x:p.x,y:p.y,z:p.z},p.yaw);roadside(sub,p,this.labels);sub.group.updateMatrix();for(const [mat,geometries] of sub.parts){if(!b.parts.has(mat))b.parts.set(mat,[]);for(const g of geometries){g.applyMatrix4(sub.group.matrix);b.parts.get(mat).push(g);}}b.bodies.push(...sub.bodies);b.count+=sub.count;}b.finish();b.group.name=`roadside:${index}`;b.samples=samples;this.scene.add(b.group);return b;}
 update(position,distance,campaign,menu=false){
  const radius=Math.min(320,distance*.7),wanted=new Set(),center=Math.round(position.z/DECOR_CELL);
  for(let i=center-2;i<=center+2;i++)if(Math.abs(i*DECOR_CELL-position.z)<radius+80){const key=`cell:${i}`;wanted.add(key);if(!this.live.has(key))this.live.set(key,this.buildCell(i));}
  for(const p of INHABITED_SITES)if(Math.hypot(position.x-p.x,position.z-p.z)<Math.min(240,radius)){const key=`site:${p.id}`;wanted.add(key);if(!this.live.has(key))this.live.set(key,this.buildSite(p));}
  for(const [key,b] of this.live)if(!wanted.has(key)){b.dispose();this.live.delete(key);}
  const lamps=[];for(const b of this.live.values()){b.group.visible=!menu;lamps.push(...b.lamps);}
  lamps.sort((a,b)=>Math.hypot(a.x-position.x,a.z-position.z)-Math.hypot(b.x-position.x,b.z-position.z));
  this.lights.forEach((l,i)=>{const p=lamps[i];l.intensity=!menu&&p?this.night*16:0;if(p)l.position.set(p.x,p.y,p.z);});
 }
 setNight(value){this.night=value;this.m.lamp.emissiveIntensity=.15+value*2.5;}
 snapshot(){return {compositions:this.live.size,parts:[...this.live.values()].reduce((n,b)=>n+b.count,0),drawBatches:[...this.live.values()].reduce((n,b)=>n+b.group.children.length,0),colliders:[...this.live.values()].reduce((n,b)=>n+b.bodies.length,0),sites:[...this.live.values()].filter(b=>b.site).map(b=>b.site.id),cells:[...this.live.keys()].filter(k=>k.startsWith('cell:')),lights:this.lights.filter(l=>l.intensity>0).length};}
 dispose(){for(const b of this.live.values())b.dispose();this.live.clear();for(const m of this.labels.values()){m.map.dispose();m.dispose();}for(const l of this.lights)l.removeFromParent();}
}

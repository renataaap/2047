import * as THREE from 'three';
import {PILOT_CITY,CITY_GAS} from '../../data/roadNetwork.js';
import {CITY_BUILDINGS,CITY_WALK_POINTS} from '../../data/cityLayout.js';
import {PropBatch} from './PropBatch.js';
import {furnishRoad} from './decorCompositions.js';
import {finishEstablishment} from './finishCompositions.js';
import {heightAt} from './terrain.js';

function facade(b,p){
 const m=b.m,w=p.width,d=p.depth,h=p.height;
 if(p.kind==='garage'){
  for(const x of [-w/2,w/2])b.box(.32,h,d,m.concrete,x,h/2,0,true);
  b.box(w,h,.32,m.brick,0,h/2,-d/2,true);b.box(w+.8,.28,d+1,m.roof,0,h+.15,0);
  for(const x of [-w/2+5,w/2-5])b.box(10,h,.35,m.concrete,x,h/2,d/2,true);
  b.box(20,1.2,.35,m.concrete,0,h-.6,d/2,true);
  b.box(w-.4,.14,d-.4,m.garage,0,.02,0,true);
  b.box(.25,5,.25,m.steel,-7,2.5,9,true);b.box(.25,5,.25,m.steel,7,2.5,9,true);b.box(14,.3,.25,m.steel,0,5,9);
  for(const x of [-4.5,4.5])b.box(.13,.025,20,m.stripe,x,.13,8);for(const z of [-2,18])b.box(9,.025,.13,m.stripe,0,.13,z);b.box(3,.25,1.2,m.steel,-6,.9,16);b.box(.2,1,.8,m.rust,-7,.5,16);b.lamp(-4,5.7,8,true);b.lamp(4,5.7,8,true);
  b.bench(-13,.1,-14,4);b.shelf(14,.1,-15);b.tire(-15,.1,-11);b.tire(-15,.45,-11);b.lamp(0,5.5,1,true);
  return;
 }
 b.box(w,h,d,p.kind==='house'?m.brick:p.kind==='factory'?m.weatheredMetal:m.concrete,0,h/2,0,true);
 b.box(w+.7,.28,d+.9,m.roof,0,h+.14,0);b.box(w+.9,.25,.7,m.dark,0,h+.4,d/2);
 const floors=p.kind==='tenement'?3:1,columns=Math.max(2,Math.floor(w/5));
 for(let floor=0;floor<floors;floor++)for(let i=0;i<columns;i++){
  const x=-w/2+2.8+i*(w-5.6)/Math.max(1,columns-1),y=2.2+floor*3.4,broken=!p.occupied&&(i+floor)%3===0;
  b.box(2.1,2.15,.22,m.dark,x,y,d/2+.08);if(!broken)b.box(1.8,1.83,.08,m.glass,x,y,d/2+.23);
  for(const dx of [-1.06,0,1.06])b.box(.07,2.2,.2,m.steel,x+dx,y,d/2+.25);
  b.box(2.4,.12,.45,m.concrete,x,y-1.15,d/2+.17);
  if(p.occupied&&floor===0&&i%2===0)b.box(1.8,1.8,.05,m.shutter,x,y,d/2+.3);
 }
 b.box(1.45,2.7,.24,m.wood,0,1.35,d/2+.22);b.box(.08,.16,.12,m.steel,.48,1.45,d/2+.4);
 b.box(2,.16,1.2,m.concrete,0,.08,d/2+.7,true);
 if(p.kind==='house'){
  b.box(w*.7,.15,3,m.roof,0,3.3,d/2+1.3);for(const x of [-w*.33,w*.33])b.box(.13,3.3,.13,m.rust,x,1.65,d/2+2.6,true);
  b.barrel(w/2+1,.1,-d/2+2);b.cable([[-w*.3,h+.3,0],[-w*.3,h+1,-1],[-w*.3,h+.3,-3]],.025);
 }else if(['factory','warehouse'].includes(p.kind)){
  b.box(5,4,.12,m.shutter,w*.2,2,d/2+.3);for(const dx of [-2,0,2])b.box(.06,4,.22,m.steel,w*.2+dx,2,d/2+.4);
  for(const z of [-d*.3,d*.3]){b.cylinder(.35,h+4,m.rust,-w/2+1,(h+4)/2,z);b.ring(.4,.06,m.steel,-w/2+1,h+2,z);}
  b.box(w*.5,1,2.2,m.steel,0,h+.6,-d*.2);for(let i=0;i<7;i++)b.box(w*.5,.05,.12,m.dark,0,h+.3+i*.1,-d*.2+1.13);
 }
 if(p.occupied){b.lamp(0,3.1,d/2+.6);b.crate(-w*.35,0,d/2+1.2,.7);}
}

export class CityWorld{
 constructor(scene,physics,materials){this.scene=scene;this.physics=physics;this.m=materials;this.live=[];this.labels=new Map();this.night=0;this.light=new THREE.PointLight('#e1ba80',0,18,2);scene.add(this.light);}
 build(){
  for(const p of CITY_BUILDINGS){const b=new PropBatch(this.physics,this.m,{x:p.x,y:heightAt(p.x,p.z),z:p.z});facade(b,p);b.finish();b.group.name=`cinza-nova:${p.id}`;this.scene.add(b.group);this.live.push(b);}
  const b=new PropBatch(this.physics,this.m,{x:PILOT_CITY.x,y:PILOT_CITY.height,z:PILOT_CITY.z}),m=this.m;
  // Kerbs stop short of junctions, driveways and walking crossings.
  for(const x of [-360,-240,-120])for(const z of [-690,-830])for(const dx of [-9,9])b.box(.24,.16,46,m.concrete,x-PILOT_CITY.x+dx,.08,z-PILOT_CITY.z,true);
  for(const z of [-620,-760,-900])for(const x of [-300,-180])for(const dz of [-9,9])b.box(44,.16,.24,m.concrete,x-PILOT_CITY.x,.08,z-PILOT_CITY.z+dz,true);
  // Civic parking lines, loading equipment and restrained signs of habitation.
  for(const x of [-332,-320,-308]){b.box(.13,.025,14,m.stripe,x-PILOT_CITY.x,.17,-700-PILOT_CITY.z);b.box(10,.025,.13,m.stripe,x-PILOT_CITY.x,.17,-707-PILOT_CITY.z);}
  for(const z of [-830,-813]){b.box(5,2.6,11,m.container,-413-PILOT_CITY.x,1.3,z-PILOT_CITY.z,true);for(let i=0;i<8;i++)b.box(.1,2.5,.12,m.steel,-410.44-PILOT_CITY.x,1.3,z-PILOT_CITY.z-4.5+i*1.2);}
  for(const p of [[-337,-679],[-286,-645],[-178,-805]]){b.barrel(p[0]-PILOT_CITY.x,.1,p[1]-PILOT_CITY.z);b.bench(p[0]-PILOT_CITY.x+2,.1,p[1]-PILOT_CITY.z,2.4);}
  for(const p of [[-340,-640],[-260,-780],[-140,-880]]){const x=p[0]-PILOT_CITY.x,z=p[1]-PILOT_CITY.z;b.box(.16,6,.16,m.steel,x,3,z,true);b.box(2,.12,.2,m.steel,x+.9,5.9,z);b.lamp(x+1.7,5.8,z);}
  b.box(4,2,.16,m.wood,CITY_WALK_POINTS.notice.x-PILOT_CITY.x,2,CITY_WALK_POINTS.notice.z-PILOT_CITY.z);for(const x of [-1.8,1.8])b.box(.12,3,.12,m.rust,CITY_WALK_POINTS.notice.x-PILOT_CITY.x+x,1.5,CITY_WALK_POINTS.notice.z-PILOT_CITY.z,true);
  b.finish();b.group.name='cinza-nova:streets';this.scene.add(b.group);this.live.push(b);
  const gas=new PropBatch(this.physics,m,{x:CITY_GAS.x,y:heightAt(CITY_GAS.x,CITY_GAS.z),z:CITY_GAS.z});furnishRoad(gas,CITY_GAS,this.labels);finishEstablishment(gas,CITY_GAS,this.labels);gas.finish();this.scene.add(gas.group);this.live.push(gas);
 }
 update(position,distance=600,night=0,menu=false){const d=Math.hypot(position.x-PILOT_CITY.x,position.z-PILOT_CITY.z);if(d<600&&!this.live.length)this.build();if(d>850&&this.live.length)this.unload();this.night=night;for(const b of this.live)b.group.visible=!menu&&d<distance+300;let nearest=null;for(const b of this.live)for(const p of b.lamps){const r=Math.hypot(position.x-p.x,position.z-p.z);if(r<18&&(!nearest||r<nearest.r))nearest={...p,r};}this.light.intensity=nearest&&!menu?night*16:0;if(nearest)this.light.position.set(nearest.x,nearest.y,nearest.z);}
 snapshot(){return {id:PILOT_CITY.id,loaded:this.live.length>0,batches:this.live.length,buildings:this.live.length?CITY_BUILDINGS.length:0,garageReady:this.live.length>0,physicalBodies:this.live.reduce((n,b)=>n+b.bodies.length,0)};}
 unload(){for(const b of this.live)b.dispose();this.live=[];this.light.intensity=0;}
 dispose(){this.unload();this.light.removeFromParent();for(const material of this.labels.values()){material.map?.dispose();material.dispose();}this.labels.clear();}
}

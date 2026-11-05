import * as THREE from 'three';
import {randomSeed} from '../world/terrain.js';
import {weatherAt} from '../missions/network.js';
import {recoveryAt} from './progress.js';

export class RestorationAtmosphere{
 constructor(rendering){this.r=rendering;const r=randomSeed(110047);this.drops=Array.from({length:900},()=>({x:(r()-.5)*80,y:r()*28,z:(r()-.5)*80,length:.3+r()*.55,speed:11+r()*8}));const a=new Float32Array(this.drops.length*6),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(a,3));this.rain=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:'#bfced0',transparent:true,opacity:0,depthWrite:false}));this.rain.frustumCulled=false;this.rain.name='Restoration rainfall';rendering.scene.add(this.rain);this.current={rain:0,amount:0,stage:0};}
 update(c,p,quality,dt,menu=false){
  const local=recoveryAt(c,p.x,p.z),weather=weatherAt(c,p.z),r=this.r;
  const visibility=weather.front?3.8:weather.region==='glass'?1.2:1;
  r.scene.fog.density=1.6/r.preset.distance*THREE.MathUtils.lerp(visibility,.55,local.amount);
  r.dust.material.opacity=menu?.28:THREE.MathUtils.lerp(.28,.035,local.amount);r.dust.visible=menu||local.amount<.98;
  const count=quality==='baixo'?270:quality==='medio'?540:900;
  this.rain.geometry.setDrawRange(0,count*2);this.rain.visible=!menu&&local.rain>.03;this.rain.material.opacity=.34*local.rain;this.rain.position.set(p.x,p.y,p.z);
  if(this.rain.visible){const a=this.rain.geometry.attributes.position.array;for(let i=0;i<count;i++){const d=this.drops[i];d.y-=dt*d.speed;d.x+=dt*.65;if(d.y<-2)d.y+=28;if(d.x>40)d.x-=80;const insideCab=Math.abs(d.x)<2.2&&Math.abs(d.z)<4.2&&d.y<4.8;const y=insideCab?d.y+8:d.y;a.set([d.x,y,d.z,d.x+.035,y+d.length,d.z+.015],i*6);}this.rain.geometry.attributes.position.needsUpdate=true;}
  this.current={...local,quality,rainVisible:this.rain.visible,rainDrops:this.rain.visible?count:0,dustOpacity:r.dust.material.opacity,fogDensity:r.scene.fog.density};return {...weather,recovery:local.amount,rain:local.rain,wetness:local.wetness};
 }
 dispose(){this.rain.removeFromParent();this.rain.geometry.dispose();this.rain.material.dispose();}
}

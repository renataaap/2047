import * as THREE from 'three';
import {timeSample} from '../world/dayClock.js';
export class DayNight {
 constructor(rendering){this.r=rendering;this.colors={top:new THREE.Color(),bottom:new THREE.Color(),fog:new THREE.Color(),sun:new THREE.Color()};this.blendColor=new THREE.Color();rendering.sunOffset=new THREE.Vector3();}
 apply(seconds,weather,menu=false){
  const s=timeSample(menu?17.7*3600:seconds),r=this.r;
  for(const key of Object.keys(this.colors))this.colors[key].set(s.a[key]).lerp(this.blendColor.set(s.b[key]),s.blend);
  if(weather.restored){this.colors.top.lerp(this.blendColor.set('#669da9'),.18*(1-s.night));this.colors.fog.lerp(this.blendColor.set('#a4b5b5'),.16*(1-s.night));}
  else if(weather.front){this.colors.top.multiplyScalar(.73);this.colors.bottom.lerp(this.blendColor.set('#7c7068'),.3);this.colors.fog.lerp(this.blendColor.set('#777065'),.28);}
  else if(weather.region==='salt')this.colors.bottom.lerp(this.blendColor.set('#c2b99c'),.18*(1-s.night));
  r.sky.material.uniforms.top.value.copy(this.colors.top);r.sky.material.uniforms.bottom.value.copy(this.colors.bottom);r.scene.fog.color.copy(this.colors.fog);r.scene.fog.density*=1+s.night*.12;
  const moon=s.elevation<0?-1:1;r.sunOffset.set(-Math.cos(s.angle)*160*moon,Math.max(.13,Math.abs(s.elevation))*140,-75*moon);r.sun.color.copy(this.colors.sun);r.sun.intensity=s.sunIntensity*(weather.front?.68:1);
  r.sky.material.uniforms.sunDirection.value.copy(r.sunOffset).normalize();r.sky.material.uniforms.night.value=s.night;r.sky.material.uniforms.clock.value=seconds/30;
  r.ambient.intensity=s.ambientIntensity;r.ambient.color.set(s.night>.7?'#829ab3':'#b3c2c7');r.scene.environmentIntensity=s.environmentIntensity;r.renderer.toneMappingExposure=1.12+s.night*.12;
  this.current={hour:s.hour,period:s.period,label:s.label,night:s.night,sunIntensity:r.sun.intensity,ambientIntensity:r.ambient.intensity};return this.current;
 }
 snapshot(){return this.current;}
}

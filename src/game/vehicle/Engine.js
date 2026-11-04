import { TRUCK_TUNING as T } from '../../data/truck-tuning.js';
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const approach=(value,target,seconds,dt)=>target+(value-target)*Math.exp(-dt/seconds);
export function torqueAt(rpm,curve=T.engine.torqueCurve){
 if(rpm<=curve[0][0])return curve[0][1];
 for(let i=1;i<curve.length;i++){const [r,t]=curve[i],previous=curve[i-1];if(rpm<=r)return previous[1]+(t-previous[1])*(rpm-previous[0])/(r-previous[0]);}
 return 0;
}
export class DieselEngine {
 constructor(tuning=T){this.tuning=tuning;this.reset(false);}
 reset(running=false){this.rpm=running?this.tuning.engine.idleRpm:0;this.throttle=0;this.torqueNm=0;}
 update({running,command,coupledRpm,engaged,shifting,power=1},dt){
  this.throttle=approach(this.throttle,running?clamp(command,0,1):0,this.tuning.engine.throttleSeconds,dt);
  const target=!running?0:engaged?Math.max(this.tuning.engine.idleRpm+this.throttle*(this.tuning.engine.launchRpm-this.tuning.engine.idleRpm),coupledRpm):this.tuning.engine.idleRpm+this.throttle*(this.tuning.engine.redlineRpm-this.tuning.engine.idleRpm);
  this.rpm=clamp(approach(this.rpm,target,this.tuning.engine.rpmSeconds,dt),0,this.tuning.engine.redlineRpm);
  this.torqueNm=running&&!shifting&&command>.001?torqueAt(this.rpm,this.tuning.engine.torqueCurve)*this.throttle*clamp(power,0,1.2):0;
  return this.torqueNm;
 }
 fuelRate(running,deliveredTorque){if(!running)return 0;const kw=Math.max(0,deliveredTorque*this.rpm*Math.PI/30000);return this.tuning.engine.idleLitersPerSecond+kw*this.tuning.engine.kgPerKwh/this.tuning.engine.dieselKgPerLiter/3600;}
}

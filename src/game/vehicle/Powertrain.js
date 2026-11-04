import { TRUCK_TUNING as T } from '../../data/truck-tuning.js';
import { DieselEngine,clamp,approach } from './Engine.js';
import { AutomaticTransmission } from './AutomaticTransmission.js';
export function roadResistance(mass,speed,surface='asfalto',grounded=true,tuning=T){const t=tuning.surfaces[surface]||tuning.surfaces.terra;return (grounded?mass*9.81*t.rolling:0)+.5*tuning.dynamics.airDensity*tuning.dynamics.dragArea*speed*speed;}
export function steeringLimit(speed,tuning=T){return Math.min(tuning.steering.maxAngle,Math.atan(tuning.steering.lateralAcceleration*tuning.wheelbase/(speed*speed+5)));}
export class Powertrain {
 constructor(tuning=T){this.tuning=tuning;this.engine=new DieselEngine(tuning);this.transmission=new AutomaticTransmission(tuning);this.brake=0;}
 reset(running=false){this.engine.reset(running);this.transmission.reset();this.brake=0;}
 update(input,state,dt){
  const speed=state.signedSpeed||0,g=this.transmission,pedals=g.update(input,speed,!!state.engineOn,dt);
  const engineTorque=this.engine.update({running:state.engineOn,command:pedals.throttle,coupledRpm:pedals.coupledRpm,engaged:!!g.gear&&!input.handbrake,shifting:g.shiftRemaining>0,power:state.powerMultiplier??1},dt);
  const limit=g.gear<0?this.tuning.dynamics.maxReverseSpeed:this.tuning.dynamics.maxSpeed,governor=clamp((limit-speed*Math.sign(g.ratio))/.65,0,1);
  const axleTorque=input.handbrake?0:Math.min(this.tuning.transmission.maxAxleTorque,engineTorque*Math.abs(g.ratio)*this.tuning.transmission.finalDrive*this.tuning.transmission.efficiency)*pedals.clutch*governor;
  let force=axleTorque/this.tuning.wheelRadius*Math.sign(g.ratio);
  if((speed>=this.tuning.dynamics.maxSpeed&&force>0)||(speed<=-this.tuning.dynamics.maxReverseSpeed&&force<0))force=0;
  const deliveredTorque=input.handbrake?engineTorque*.1:Math.abs(g.ratio)>0?axleTorque/(Math.abs(g.ratio)*this.tuning.transmission.finalDrive*this.tuning.transmission.efficiency):engineTorque;
  this.brake=approach(this.brake,pedals.brake,this.tuning.dynamics.brakeSeconds,dt);if(this.brake<.0001)this.brake=0;
  const engineBrake=state.engineOn&&!!g.gear&&pedals.throttle<.02&&Math.abs(speed)>.6&&!g.shiftRemaining?this.tuning.dynamics.engineBrakeNm*Math.abs(g.ratio)*this.tuning.transmission.finalDrive*this.tuning.transmission.efficiency/this.tuning.wheelRadius:0;
  Object.assign(state,{rpm:this.engine.rpm,gear:g.gear,gearLabel:g.label,shifting:g.shiftRemaining>0,shiftCount:g.shiftCount,throttle:this.engine.throttle,brake:this.brake,torqueNm:deliveredTorque,enginePowerKw:deliveredTorque*this.engine.rpm*Math.PI/30000,fuelRateLps:this.engine.fuelRate(state.engineOn,deliveredTorque),engineBraking:engineBrake>0,parkingBrake:!!input.handbrake});
  return {force,engineBrake,serviceBrakeForce:this.brake*this.tuning.dynamics.serviceBrakeForce};
 }
}

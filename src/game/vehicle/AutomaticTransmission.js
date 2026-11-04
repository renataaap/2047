import { TRUCK_TUNING as T,DRIVING_COPY as C } from '../../data/truck-tuning.js';
import { clamp } from './Engine.js';
export class AutomaticTransmission {
 constructor(tuning=T){this.tuning=tuning;this.reset();}
 reset(){this.gear=0;this.shiftRemaining=0;this.dwell=0;this.directionWait=0;this.launchTime=0;this.shiftCount=0;}
 get ratio(){return this.gear<0?-this.tuning.transmission.reverseRatio:this.gear===0?0:this.tuning.transmission.ratios[this.gear-1];}
 get label(){return this.gear<0?C.reverse:this.gear===0?C.neutral:`${C.drive}${this.gear}`;}
 shift(gear){if(gear===this.gear)return;const from=this.gear;this.gear=gear;this.shiftRemaining=from>0&&gear>0?this.tuning.transmission.shiftSeconds:0;this.dwell=0;this.launchTime=0;if(from>0&&gear>0)this.shiftCount++;}
 update(input,speed,running,dt){
  const command=clamp(Number(input.throttle)||0,-1,1),desired=command<-.01?-1:command>.01?1:0;
  this.shiftRemaining=Math.max(0,this.shiftRemaining-dt);this.dwell+=dt;
  const opposing=desired&&speed*desired < -this.tuning.transmission.safeDirectionSpeed;
  const changing=desired&&this.gear!==0&&Math.sign(this.gear)!==desired;
  let brake=opposing?Math.abs(command):0;
  if(desired<0&&this.gear>=0){
   brake=Math.abs(command);if(Math.abs(speed)<=this.tuning.transmission.safeDirectionSpeed&&running&&!input.handbrake){this.directionWait+=dt;if(this.directionWait>=this.tuning.transmission.reverseDelay){this.shift(-1);brake=0;this.directionWait=0;}}else this.directionWait=0;
  }else if(desired>0&&this.gear<=0){
   if(opposing){brake=command;this.directionWait=0;}else if(running&&(this.gear===0||Math.abs(speed)<=this.tuning.transmission.safeDirectionSpeed)){
    let selected=1;const wheelRpm=Math.abs(speed)*60/(Math.PI*2*this.tuning.wheelRadius);
    while(selected<this.tuning.transmission.ratios.length&&wheelRpm*this.tuning.transmission.ratios[selected-1]*this.tuning.transmission.finalDrive>this.tuning.transmission.upshiftRpm)selected++;
    this.shift(selected);this.directionWait=0;
   }
  }else this.directionWait=0;
  if(!running&&Math.abs(speed)<.25)this.shift(0);
  const throttle=running&&!opposing&&!brake&&(!changing||Math.sign(this.gear)===desired)?Math.abs(command):0;
  const wheelRpm=Math.abs(speed)*60/(Math.PI*2*this.tuning.wheelRadius);
  const syncedRpm=wheelRpm*Math.abs(this.ratio)*this.tuning.transmission.finalDrive;
  if(running&&this.gear>0&&!brake&&!input.handbrake&&!this.shiftRemaining&&this.dwell>this.tuning.transmission.dwellSeconds){
   if(syncedRpm>this.tuning.transmission.upshiftRpm-(1-throttle)*250&&this.gear<this.tuning.transmission.ratios.length)this.shift(this.gear+1);
   else if(syncedRpm<this.tuning.transmission.downshiftRpm&&this.gear>1)this.shift(this.gear-1);
  }
  if(throttle>.02&&!brake&&!input.handbrake)this.launchTime+=dt;else this.launchTime=0;
  return {throttle,brake:Math.max(brake,clamp(Number(input.brake)||0,0,1)),coupledRpm:wheelRpm*Math.abs(this.ratio)*this.tuning.transmission.finalDrive,clutch:this.shiftRemaining?0:clamp(.25+this.launchTime*.85,.25,1)};
 }
}

import RAPIER from '@dimforge/rapier3d-compat';
import { TRUCK_TUNING as T } from '../../data/truck-tuning.js';
import { CONFIG } from '../../data/config.js';
import { terrainFriction } from '../survival/resources.js';
import { heightAt,surfaceAt,roadX } from '../world/terrain.js';
import { Powertrain,roadResistance,steeringLimit } from '../vehicle/Powertrain.js';
import { clamp,approach } from '../vehicle/Engine.js';

export class VehiclePhysics {
 constructor(world,wheelPoints,options={}){
  this.world=world;this.tuning=options.tuning||T;this.wheelPoints=wheelPoints;this.wheelCount=wheelPoints.length;this.steer=0;this.payloadMass=-1;this.surfaceResolver=options.surfaceAt||surfaceAt;this.powertrain=new Powertrain(this.tuning);this.previousSpeed=0;this.filteredAcceleration=0;
  this.body=world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0,2.1,5).setLinearDamping(0).setAngularDamping(.85).setCcdEnabled(true));
  const solids=options.colliders||[[1.12,.45,3.9,0,0,0],[1.18,1.1,1.08,0,1.15,-2.65]];
  solids.forEach(([x,y,z,px,py,pz],i)=>{const desc=RAPIER.ColliderDesc.cuboid(x,y,z).setTranslation(px,py,pz);if(i===0)desc.setMass(this.tuning.chassisMass).setFriction(.65).setRestitution(.02);else desc.setDensity(0);world.createCollider(desc,this.body);});
  this.controller=world.createVehicleController(this.body);this.controller.indexUpAxis=1;this.controller.setIndexForwardAxis=2;
  wheelPoints.forEach(p=>{const i=this.controller.numWheels();this.controller.addWheel(p,{x:0,y:-1,z:0},{x:-1,y:0,z:0},this.tuning.suspension.restLength,this.tuning.wheelRadius);this.controller.setWheelMaxSuspensionTravel(i,this.tuning.suspension.travel);this.controller.setWheelMaxSuspensionForce(i,this.tuning.suspension.maxForce);this.controller.setWheelFrictionSlip(i,2.3);this.controller.setWheelSideFrictionStiffness(i,.9);});
 }
 applyTuning(tuning){this.tuning=tuning;this.powertrain=new Powertrain(tuning);this.payloadMass=-1;}
 dispose(){this.world.removeVehicleController(this.controller);this.world.removeRigidBody(this.body);}
 forward(){const q=this.body.rotation();return {x:-2*(q.x*q.z+q.w*q.y),y:-2*(q.y*q.z-q.w*q.x),z:-(1-2*(q.x*q.x+q.y*q.y))};}
 signedSpeed(){const v=this.body.linvel(),f=this.forward();return v.x*f.x+v.y*f.y+v.z*f.z;}
 setPayload(state){
  const base=(state.loaded?this.tuning.seedMass:0)+Math.max(0,state.inventoryMass||0)+Math.max(0,state.fuel||0)*this.tuning.engine.dieselKgPerLiter,freight=Math.max(0,state.commercialMassKg||0),mass=base+freight;
  const center=state.commercialCenter||[0,.55,1.35],dimensions=state.commercialDimensions||[1,1,1],key=freight?center.join('/')+dimensions.join('/'):'empty';
  if(Math.abs(mass-this.payloadMass)>.2||this.payloadKey!==key){
   let com={x:0,y:.55,z:1.35},inertia={x:mass*1.2,y:mass*1.1,z:mass*.35};
   if(freight){const [x,y,z]=center,[w,h,d]=dimensions;com={x:x*freight/mass,y:(.55*base+y*freight)/mass,z:(1.35*base+z*freight)/mass};
    const axis=(a,b)=>base*(a[0]**2+a[1]**2)+freight*(b[0]**2+b[1]**2);
    inertia={x:base*1.2+freight*(h*h+d*d)/12+axis([.55-com.y,1.35-com.z],[y-com.y,z-com.z]),y:base*1.1+freight*(w*w+d*d)/12+axis([-com.x,1.35-com.z],[x-com.x,z-com.z]),z:base*.35+freight*(w*w+h*h)/12+axis([-com.x,.55-com.y],[x-com.x,y-com.y])};
   }
   this.body.setAdditionalMassProperties(mass,com,inertia,{x:0,y:0,z:0,w:1},true);this.body.recomputeMassPropertiesFromColliders();this.payloadMass=mass;this.payloadKey=key;
  }
  state.massKg=this.body.mass();state.cargoMassKg=this.payloadMass;
 }
 update(input,state,dt){
  if(!(dt>0)||!Number.isFinite(dt))return;
  this.setPayload(state);const speed=this.signedSpeed(),p=this.body.translation();state.speed=Math.abs(speed);state.signedSpeed=speed;state.surface=this.surfaceResolver(p.x,p.z);if(state.localRestored&&state.surface==='agua')state.surface='asfalto';
  if(input.throttle||input.steer||input.handbrake)this.body.wakeUp();
  const grip=terrainFriction(state.surface,speed,this.tuning)*(state.gripMultiplier??1),drive=this.powertrain.update(input,state,dt),mass=this.body.mass();
  const maxSteer=steeringLimit(speed,this.tuning),target=clamp(input.steer||0,-1,1)*maxSteer,steerRate=(target?this.tuning.steering.rate:this.tuning.steering.returnRate)*(state.steeringSensitivity||1);
  this.steer+=clamp(target-this.steer,-steerRate*dt,steerRate*dt);this.steer=clamp(this.steer,-maxSteer,maxSteer);
  const force=clamp(drive.force,-mass*9.81*this.tuning.dynamics.drivenWeight*grip,mass*9.81*this.tuning.dynamics.drivenWeight*grip);
  const condition=clamp(state.suspensionCondition??100,0,100)/100,massScale=this.tuning.chassisMass/mass;
  for(let i=0;i<this.wheelCount;i++){
   const angle=i<2&&Math.abs(this.steer)>.001?Math.atan(this.tuning.wheelbase/(this.tuning.wheelbase/Math.tan(this.steer)+(i%2===0?-this.tuning.track/2:this.tuning.track/2))):0;
   this.controller.setWheelSteering(i,angle);this.controller.setWheelEngineForce(i,i>=2?-force/(this.wheelCount-2):0);
   const parking=input.handbrake?(i>=2?this.tuning.dynamics.parkingBrakeForce/(this.wheelCount-2):Math.abs(speed)<3.2?this.tuning.dynamics.parkingFrontAssist/2:0):0;
   this.controller.setWheelBrake(i,(parking+drive.serviceBrakeForce/this.wheelCount+(i>=2?drive.engineBrake/(this.wheelCount-2):0))*dt);
   this.controller.setWheelFrictionSlip(i,2.3*grip);
   this.controller.setWheelSuspensionStiffness(i,this.tuning.suspension.stiffness*massScale*(.75+.25*condition));
   this.controller.setWheelSuspensionCompression(i,this.tuning.suspension.compression*massScale*(.65+.35*condition));
   this.controller.setWheelSuspensionRelaxation(i,this.tuning.suspension.relaxation*massScale*(.65+.35*condition));
  }
  const grounded=Array.from({length:this.wheelCount},(_,i)=>this.controller.wheelIsInContact(i)).some(Boolean),f=this.forward();
  const resistance=roadResistance(mass,speed,state.surface,grounded,this.tuning),impulse=Math.min(resistance*dt,Math.abs(speed)*mass)*Math.sign(speed);
  this.body.applyImpulse({x:-f.x*impulse,y:-f.y*impulse,z:-f.z*impulse},false);
  if(state.front&&Math.abs(speed)>1)this.body.applyImpulse({x:Math.sin((state.weatherClock||0)*.3)*mass*dt*.25,y:0,z:0},true);
  this.controller.updateVehicle(dt,RAPIER.QueryFilterFlags.EXCLUDE_DYNAMIC);
  this.filteredAcceleration=approach(this.filteredAcceleration,(speed-this.previousSpeed)/dt,.2,dt);this.previousSpeed=speed;
  const v=this.body.linvel(),q=this.body.rotation(),right={x:1-2*(q.y*q.y+q.z*q.z),y:2*(q.x*q.y+q.w*q.z),z:2*(q.x*q.z-q.w*q.y)};
  Object.assign(state,{tractionForceN:force,resistanceForceN:resistance,steeringAngle:this.steer,longitudinalAcceleration:this.filteredAcceleration,lateralAcceleration:speed*speed*Math.tan(this.steer)/this.tuning.wheelbase,lateralSpeed:v.x*right.x+v.y*right.y+v.z*right.z});
 }
 resetDrivetrain(running=false,state){this.powertrain.reset(running);this.steer=0;this.previousSpeed=0;this.filteredAcceleration=0;if(state)Object.assign(state,{rpm:this.powertrain.engine.rpm,gear:0,gearLabel:'N',shiftCount:0,shifting:false,throttle:0,brake:0,torqueNm:0,enginePowerKw:0,engineBraking:false,parkingBrake:false});}
 teleport(x,z,y=heightAt(x,z)+1.7){this.body.setTranslation({x,y,z},true);this.body.setRotation({x:0,y:0,z:0,w:1},true);this.body.setLinvel({x:0,y:0,z:0},true);this.body.setAngvel({x:0,y:0,z:0},true);this.resetDrivetrain();}
 recover(){const z=Math.max(-CONFIG.world.roadLength+20,Math.min(20,this.body.translation().z));this.teleport(roadX(z),z);}
}

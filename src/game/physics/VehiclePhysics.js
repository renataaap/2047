import RAPIER from '@dimforge/rapier3d-compat';
import { CONFIG } from '../../data/config.js';
import { terrainFriction } from '../survival/resources.js';
import { heightAt, surfaceAt, roadX } from '../world/terrain.js';
export class VehiclePhysics {
  constructor(world,wheelPoints) {
    this.world=world;this.steer=0;this.power=0;
    this.body=world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0,2.1,5).setLinearDamping(.025).setAngularDamping(.9).setCcdEnabled(true));
    world.createCollider(RAPIER.ColliderDesc.cuboid(1.12,.45,3.9).setMass(CONFIG.vehicle.mass).setFriction(.65).setRestitution(.05),this.body);
    world.createCollider(RAPIER.ColliderDesc.cuboid(1.18,1.1,1.08).setTranslation(0,1.15,-2.65).setDensity(0),this.body);
    this.controller=world.createVehicleController(this.body);this.controller.indexUpAxis=1;this.controller.setIndexForwardAxis=2;
    wheelPoints.forEach(p=>{const i=this.controller.numWheels();this.controller.addWheel(p,{x:0,y:-1,z:0},{x:-1,y:0,z:0},CONFIG.vehicle.suspensionLength,CONFIG.vehicle.wheelRadius);this.controller.setWheelSuspensionStiffness(i,32);this.controller.setWheelSuspensionCompression(i,4.4);this.controller.setWheelSuspensionRelaxation(i,5.2);this.controller.setWheelMaxSuspensionTravel(i,.32);this.controller.setWheelMaxSuspensionForce(i,50000);this.controller.setWheelFrictionSlip(i,2.3);this.controller.setWheelSideFrictionStiffness(i,.9);});
  }
  signedSpeed() { const v=this.body.linvel(),q=this.body.rotation(); const fx=-2*(q.x*q.z+q.w*q.y),fy=-2*(q.y*q.z-q.w*q.x),fz=-(1-2*(q.x*q.x+q.y*q.y));return v.x*fx+v.y*fy+v.z*fz; }
  update(input,state,dt) {
    if (input.throttle || input.steer) this.body.wakeUp();
    const speed=this.signedSpeed(), p=this.body.translation();state.speed=Math.abs(speed);state.signedSpeed=speed;state.surface=surfaceAt(p.x,p.z);
    const grip=terrainFriction(state.surface,speed)*(state.gripMultiplier??1);
    const targetSteer=input.steer*CONFIG.vehicle.maxSteer/(1+Math.abs(speed)*.038);
    this.steer+=(targetSteer-this.steer)*Math.min(1,dt*3.6);
    this.power+=(input.throttle-this.power)*Math.min(1,dt*2);
    const braking=input.throttle<0 && speed>.6;
    const reverse=input.throttle<0 && speed<=.6;
    let force=state.engineOn&&!braking&&!input.handbrake?this.power*CONFIG.vehicle.engineForce*grip*(state.powerMultiplier??1)*(state.loaded?.83:1):0;
    if((speed>CONFIG.vehicle.maxSpeed&&force>0)||(speed < -CONFIG.vehicle.reverseSpeed&&force<0))force=0;
    if(reverse)force=Math.max(force,-CONFIG.vehicle.engineForce*.6);
    for(let i=0;i<6;i++) {
      this.controller.setWheelSteering(i,i<2?this.steer:0);
      this.controller.setWheelEngineForce(i,i>=2?-force/4:0);
      this.controller.setWheelBrake(i,input.handbrake?(i>=2?1200:Math.abs(speed)<3.2?300:0):braking?CONFIG.vehicle.brakeForce:Math.abs(input.throttle)<.01?3:0);
      this.controller.setWheelFrictionSlip(i,2.3*grip*(input.handbrake&&i>=2&&Math.abs(speed)>3?.5:1));
    }
    this.controller.updateVehicle(dt,RAPIER.QueryFilterFlags.EXCLUDE_DYNAMIC);
  }
  teleport(x,z,y=heightAt(x,z)+1.7) {this.body.setTranslation({x,y,z},true);this.body.setRotation({x:0,y:0,z:0,w:1},true);this.body.setLinvel({x:0,y:0,z:0},true);this.body.setAngvel({x:0,y:0,z:0},true);this.steer=this.power=0;}
  recover() {const z=Math.max(-CONFIG.world.roadLength+20,Math.min(20,this.body.translation().z));this.teleport(roadX(z),z);}
}

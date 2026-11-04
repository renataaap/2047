import fs from 'node:fs/promises';
import RAPIER from '@dimforge/rapier3d-compat';
import {initializePhysics} from '../src/game/physics/initialize.js';
import {VehiclePhysics} from '../src/game/physics/VehiclePhysics.js';
import {VEHICLES,vehicleTuning} from '../src/game/garage/catalog.js';
import {updateResources} from '../src/game/survival/resources.js';
await initializePhysics();const results=[];
for(const id of Object.keys(VEHICLES))for(const loaded of [false,true])for(const upgrades of [[],['engine']]){
 const world=new RAPIER.World({x:0,y:-9.81,z:0});world.timestep=1/60;
 world.createCollider(RAPIER.ColliderDesc.cuboid(100,.1,1000).setTranslation(0,-.1,0).setDensity(0));
 const profile=VEHICLES[id],tuning=vehicleTuning(id,upgrades),v=new VehiclePhysics(world,profile.wheelPoints,{tuning,colliders:profile.colliders,surfaceAt:()=> 'asfalto'}),state={engineOn:false,fuel:60,temperature:26,loaded,inventoryMass:30,suspensionCondition:100};
 try{
  for(let i=0;i<180;i++){v.update({handbrake:true},state,1/60);world.step();}
  const contacts=Array.from({length:v.controller.numWheels()},(_,i)=>v.controller.wheelIsInContact(i));state.engineOn=true;
  for(let i=0;i<900;i++){v.update({throttle:1},state,1/60);world.step();updateResources(state,{throttle:1},1/60);}
  results.push({id,loaded,upgrades,seconds:15,massKg:v.body.mass(),distanceMetres:5-v.body.translation().z,speedKmh:v.signedSpeed()*3.6,fuelConsumedLitres:60-state.fuel,rpm:state.rpm,gear:state.gear,initialContacts:contacts});
 }finally{v.dispose();world.free();}
}
await fs.mkdir('evidence/garage-0.10.0',{recursive:true});await fs.writeFile('evidence/garage-0.10.0/physics-benchmark.json',JSON.stringify({method:'Actual Rapier at 60 Hz, flat dry asphalt, healthy drivetrain and 30 kg stores. Acceleration from rest for 15 simulated seconds. No real hardware FPS claim.',results},null,2)+'\n');
console.log(JSON.stringify(results.map(r=>({id:r.id,loaded:r.loaded,upgrades:r.upgrades,distance:+r.distanceMetres.toFixed(2),kmh:+r.speedKmh.toFixed(2),litres:+r.fuelConsumedLitres.toFixed(3)}))));

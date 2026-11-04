import {beforeAll,it,expect} from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import {initializePhysics} from '../../src/game/physics/initialize.js';
import {VehiclePhysics} from '../../src/game/physics/VehiclePhysics.js';
import {VEHICLES,vehicleTuning} from '../../src/game/garage/catalog.js';
beforeAll(()=>initializePhysics());
function drive(id,upgrades=[],fps=60){
 const world=new RAPIER.World({x:0,y:-9.81,z:0});world.timestep=1/60;world.createCollider(RAPIER.ColliderDesc.cuboid(100,.1,1000).setTranslation(0,-.1,0).setDensity(0));
 const p=VEHICLES[id],v=new VehiclePhysics(world,p.wheelPoints,{tuning:vehicleTuning(id,upgrades),colliders:p.colliders,surfaceAt:()=> 'asfalto'}),s={engineOn:false,fuel:60,suspensionCondition:100};
 try{
  for(let i=0;i<180;i++){v.update({handbrake:true},s,1/60);world.step();}
  const contacts=Array.from({length:p.wheelPoints.length},(_,i)=>v.controller.wheelIsInContact(i));s.engineOn=true;let accumulated=0;
  for(let frame=0;frame<fps*15;frame++){accumulated+=1/fps;while(accumulated+1e-10>=1/60){v.update({throttle:1},s,1/60);world.step();accumulated-=1/60;}}
  return {speed:v.signedSpeed(),distance:5-v.body.translation().z,mass:v.body.mass(),contacts,wheels:v.controller.numWheels(),gear:s.gear,torque:s.torqueNm};
 }finally{v.dispose();world.free();}
}
it('os dois caminhões têm rodas apoiadas, massa própria e direção diesel funcional',()=>{const a=drive('titan-old'),b=drive('dump-truck');for(const v of [a,b]){expect(v.wheels).toBe(6);expect(v.contacts.filter(Boolean).length).toBe(6);expect(v.speed).toBeGreaterThan(5);expect(v.gear).toBeGreaterThan(1);}expect(a.mass-b.mass).toBeCloseTo(2300,0);expect(Math.abs(a.distance-b.distance)).toBeGreaterThan(2);});
it('a bomba diesel produz melhoria mensurável na simulação Rapier',()=>{const a=drive('titan-old'),b=drive('titan-old',['engine']);expect(b.distance).toBeGreaterThan(a.distance*1.03);});
it('o basculante conserva o deslocamento com apresentação a 30/60/120 FPS',()=>{const values=[30,60,120].map(fps=>drive('dump-truck',[],fps));for(const v of values)expect(v.distance).toBeCloseTo(values[0].distance,3);});

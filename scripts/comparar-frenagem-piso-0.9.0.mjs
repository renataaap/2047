import RAPIER from '@dimforge/rapier3d-compat';
import {writeFile} from 'node:fs/promises';
import {truckFixture} from '../tests/helpers/truck.js';
import {networkRoadGeometry} from '../src/game/world/networkRoadGeometry.js';
import {terrainGeometry} from '../src/game/world/terrainGeometry.js';
import {heightAt} from '../src/game/world/terrain.js';
await RAPIER.init();const results=[];
for(const density of [1,0]){
 const f=truckFixture({loaded:true,noGround:true}),ground=terrainGeometry(0,-16),roads=networkRoadGeometry(0,-16),geometries=[ground,...roads.surfaces.map(s=>s.geometry)];
 for(const g of geometries)f.world.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(g.attributes.position.array),new Uint32Array(g.index.array)).setDensity(density),f.world.createRigidBody(RAPIER.RigidBodyDesc.fixed()));
 f.vehicle.teleport(-40,-16760,heightAt(-40,-16760)+1.1);f.settle();f.state.gripMultiplier=.78;f.vehicle.body.setLinvel({x:0,y:0,z:-5},true);const start=f.vehicle.body.translation();
 for(let n=0;n<180;n++)f.step({throttle:0,handbrake:true,brake:1});const finish=f.vehicle.body.translation();results.push({groundDensity:density,start,finish,speedAfter3Seconds:f.vehicle.signedSpeed(),brakingDistanceMetres:Math.hypot(finish.x-start.x,finish.z-start.z),massKg:f.vehicle.body.mass(),wheelCount:f.vehicle.controller.numWheels()});f.world.free();geometries.forEach(g=>g.dispose());
}
await writeFile('evidence/roads-0.9.0/static-ground-braking.json',JSON.stringify({method:'Same real road/terrain triangles at the downhill approach to Core 6; original truck model, mass and controls; speed initialised to 5 m/s only as a physics test precondition.',source:'https://github.com/dimforge/rapier/blob/master/src/control/ray_cast_vehicle_controller.rs',localApi:'@dimforge/rapier3d-compat/dist/control/ray_cast_vehicle_controller.d.ts:148 (braking impulse)',results},null,2)+'\n');console.log(results);

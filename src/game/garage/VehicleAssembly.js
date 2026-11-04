import {createTruck} from '../vehicle/model.js';
import {TruckVisual} from '../vehicle/TruckVisual.js';
import {VehicleAppearance} from './VehicleAppearance.js';
import {VEHICLES} from './catalog.js';

export async function createAssembly(game,id,record){
 const profile=VEHICLES[id];if(!profile)throw Error('Veículo não homologado');
 const truck=createTruck(game.materials,{profile}),visual=new TruckVisual(truck,game.assets);
 try{
  const definition=id==='titan-old'?game.modelManifest.trucks.initial:game.modelManifest.trucks[id];
  if(!await visual.load(definition))throw Error('Modelo dirigível indisponível neste pacote');
  const appearance=new VehicleAppearance(truck,visual,id);appearance.apply(record);
  return {id,truck,visual,appearance};
 }catch(e){visual.dispose();disposeTruck(truck,game.materials);throw e;}
}
export function disposeTruck(truck,shared){
 truck.cockpit?.dispose();const geometries=new Set(),materials=new Set(),sharedSet=new Set(Object.values(shared));
 truck.root.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.geometry&&!o.geometry.userData.assetManaged)geometries.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:[o.material]).filter(Boolean))if(!sharedSet.has(m)&&!m.userData.assetManaged)materials.add(m);});
 geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());truck.root.removeFromParent();
}
export function disposeAssembly(bundle,game){bundle.appearance?.dispose();bundle.visual.dispose();disposeTruck(bundle.truck,game.materials);bundle.vehicle?.dispose();}

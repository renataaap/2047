import RAPIER from '@dimforge/rapier3d-compat';
import {mkdir,writeFile} from 'node:fs/promises';
import {initializePhysics} from '../src/game/physics/initialize.js';
import {NETWORK_EDGES} from '../src/game/navigation/roadIndex.js';
import {networkRoadGeometry} from '../src/game/world/networkRoadGeometry.js';
import {terrainGeometry} from '../src/game/world/terrainGeometry.js';
await initializePhysics();
const groups=new Map(),failures=[],results=[];
for(const edge of NETWORK_EDGES.filter(e=>!e.legacy)){
 for(let i=2;i<edge.samples.length-2;i+=5){
  const p=edge.samples[i],a=edge.samples[i-1],b=edge.samples[i+1],length=Math.hypot(b.x-a.x,b.z-a.z),nx=-(b.z-a.z)/length,nz=(b.x-a.x)/length;
  for(const side of [-.28,0,.28]){
   const x=p.x+nx*edge.width*side,z=p.z+nz*edge.width*side,cx=Math.round(x/1024),cz=Math.round(z/1024);
   const seamX=Math.abs(Math.abs(x-cx*1024)-512)<5,seamZ=Math.abs(Math.abs(z-cz*1024)-512)<5;
   const sectors=[[cx,cz]];
   if(seamX)sectors.push([cx+(x>cx*1024?1:-1),cz]);
   if(seamZ)sectors.push([cx,cz+(z>cz*1024?1:-1)]);
   if(seamX&&seamZ)sectors.push([sectors[1][0],sectors[2][1]]);
   sectors.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
   const key=sectors.map(v=>v.join(',')).join('|');
   if(!groups.has(key))groups.set(key,{sectors,samples:[],seam:seamX||seamZ});
   groups.get(key).samples.push({edge:edge.id,x,z});
  }
 }
}
for(const [key,{sectors,samples,seam}]of groups){
 const world=new RAPIER.World({x:0,y:-9.81,z:0}),geometries=[],roadHandles=new Set();
 for(const [cx,cz]of sectors){
  const ground=terrainGeometry(cx,cz),roads=networkRoadGeometry(cx,cz);geometries.push(ground,...roads.surfaces.map(s=>s.geometry));
  world.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(ground.attributes.position.array),new Uint32Array(ground.index.array)));
  for(const {geometry:g}of roads.surfaces)roadHandles.add(world.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(g.attributes.position.array),new Uint32Array(g.index.array))).handle);
 }
 world.step();let bad=0;
 for(const p of samples){
  const hit=world.castRay(new RAPIER.Ray({x:p.x,y:1000,z:p.z},{x:0,y:-1,z:0}),2000,true);
  if(!hit||!roadHandles.has(hit.collider.handle)){bad++;failures.push({...p,sectors:key,hit:hit?1000-hit.timeOfImpact:null});}
 }
 results.push({sectors:key,seam,samples:samples.length,terrainAbovePavement:bad});world.free();geometries.forEach(g=>g.dispose());
}
const report={method:'Rapier rays against actual terrain and new road triangles, centre and wheel corridors. Sector seams include all adjacent colliders simultaneously.',samples:results.reduce((n,r)=>n+r.samples,0),seamSamples:results.filter(r=>r.seam).reduce((n,r)=>n+r.samples,0),results,failures};
await mkdir('evidence/roads-0.9.0',{recursive:true});await writeFile('evidence/roads-0.9.0/road-surface-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({samples:report.samples,seamSamples:report.seamSamples,failures:failures.length,examples:failures.slice(0,12)},null,2));if(failures.length)process.exitCode=1;

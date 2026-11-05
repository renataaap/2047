import RAPIER from '@dimforge/rapier3d-compat';
import {VEGETATION_CELL} from './definitions.js';
const BIN=32,identity={x:0,y:0,z:0,w:1};
// Direct shape queries are valid before the first physics step. The world's
// broad phase is not: using it while loading changed plant positions on reload.
// Index only nearby fixed props; terrain comes from the shared triangle sampler.
export function staticObstacleSampler(world,cx,cz){
 const bins=new Map(),lowX=cx*VEGETATION_CELL-8,highX=lowX+VEGETATION_CELL+16,lowZ=cz*VEGETATION_CELL-8,highZ=lowZ+VEGETATION_CELL+16;
 world.forEachCollider(col=>{
  const body=col.parent();if(body&&(!body.isFixed()||body.userData?.restorationTree)||col.shapeType()===RAPIER.ShapeType.TriMesh)return;
  const p=col.translation(),half=col.halfExtents();let radius;
  if(half)radius=Math.hypot(half.x,half.y,half.z);
  else if([RAPIER.ShapeType.Ball,RAPIER.ShapeType.Capsule,RAPIER.ShapeType.Cylinder,RAPIER.ShapeType.RoundCylinder].includes(col.shapeType()))radius=col.radius()+(col.halfHeight()||0);
  if(!Number.isFinite(radius)||p.x+radius<lowX||p.x-radius>highX||p.z+radius<lowZ||p.z-radius>highZ)return;
  for(let x=Math.floor((p.x-radius-1)/BIN);x<=Math.floor((p.x+radius+1)/BIN);x++)for(let z=Math.floor((p.z-radius-1)/BIN);z<=Math.floor((p.z+radius+1)/BIN);z++){const key=`${x},${z}`;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(col);}
 });
 const small=new RAPIER.Ball(.25),large=new RAPIER.Ball(.45);
 return (x,y,z,radius)=>{const shape=radius<=.25?small:large;return (bins.get(`${Math.floor(x/BIN)},${Math.floor(z/BIN)}`)||[]).some(col=>col.isValid()&&col.intersectsShape(shape,{x,y:y+.75,z},identity));};
}

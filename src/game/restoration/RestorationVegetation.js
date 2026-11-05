import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import {VEGETATION_CELL as SIZE,VEGETATION_PROFILES,ECOLOGY} from './definitions.js';
import {CONFIG} from '../../data/config.js';
import {recoveryAt} from './progress.js';
import {vegetationPatches,vegetationFingerprint} from './placement.js';
import {grassGeometry,woodyPlantGeometry,vegetationMaterials} from './vegetationGeometry.js';

export class RestorationVegetation{
 constructor(scene,physics,world){this.scene=scene;this.physics=physics;this.world=world;this.cells=new Map();this.geometry=new Map();this.materials=new Map();this.colliders=new Map();this.time=0;this.matrixUpdates=0;this.buildTimes=[];this.sample=(x,z)=>world.recoveryHeight(x,z);this.dummy=new THREE.Object3D();this.color=new THREE.Color();this.maxPlanningSliceMs=0;}
 material(region){if(!this.materials.has(region))this.materials.set(region,vegetationMaterials(region));return this.materials.get(region);}
 model(region,detail,variant){const key=`${region}/${detail}/${variant}`;if(!this.geometry.has(key)){const tree=woodyPlantGeometry(region,'tree',detail,variant),shrub=woodyPlantGeometry(region,'shrub',detail<0?-1:Math.max(0,detail-1),variant);this.geometry.set(key,{grass:grassGeometry(region,variant,detail<0),tree,shrub});}return this.geometry.get(key);}
 blocked(x,y,z,radius){
  let blocked=false;this.physics.intersectionsWithShape({x,y:y+.75,z},{x:0,y:0,z:0,w:1},new RAPIER.Ball(Math.min(.45,radius)),collider=>{if(collider.parent()?.userData?.restorationTree)return true;if(collider.shapeType()!==RAPIER.ShapeType.TriMesh){blocked=true;return false;}return true;},RAPIER.QueryFilterFlags.EXCLUDE_DYNAMIC|RAPIER.QueryFilterFlags.EXCLUDE_KINEMATIC);return blocked;
 }
 build(cx,cz,quality,records){
  const t=performance.now(),lod=new THREE.LOD(),b={key:`${cx},${cz}`,cx,cz,records,lod,layers:[],bodies:[],signature:null,quality,fingerprint:vegetationFingerprint(records)};
  lod.name=`restoration-sector:${b.key}`;lod.position.set((cx+.5)*SIZE,0,(cz+.5)*SIZE);this.scene.add(lod);
  const regions=[...new Set(records.map(p=>p.region))];
  for(const [level,detail]of [[0,VEGETATION_PROFILES[quality].treeDetail],[1,-1]]){
   const group=new THREE.Group();lod.addLevel(group,level?190:0);
   for(const region of regions){const m=this.material(region),variant=(Math.abs(cx*17+cz*31)%3),model=this.model(region,detail,variant);
    for(const [kind,parts]of [['grass',[['grass',m.grass]]],['shrub',[['wood',m.wood],['leaves',m.foliage]]],['tree',[['wood',m.wood],['leaves',m.foliage]]]]){
     const candidates=records.filter(p=>p.region===region&&p.kind===kind&&p.density<VEGETATION_PROFILES[quality].density*(level&&kind==='grass'?.35:1));if(!candidates.length)continue;
     const meshes=parts.map(([part,mat])=>{const g=kind==='grass'?model.grass:model[kind][part],mesh=new THREE.InstancedMesh(g,mat,candidates.length);mesh.count=0;mesh.receiveShadow=true;mesh.userData.restoration={kind,region,level};group.add(mesh);return mesh;});
     b.layers.push({kind,region,level,candidates,meshes,height:kind==='grass'?1:model[kind].height});
    }
   }
  }
  this.buildTimes.push(performance.now()-t);if(this.buildTimes.length>50)this.buildTimes.shift();return b;
 }
 updateCell(b,c,position){
  const signature=Object.entries(c.world?.recovery?.cores||{}).map(([id,v])=>`${id}:${Math.floor(v.age/2)}`).join('/');if(signature===b.signature)return;b.signature=signature;
  b.counts={};b.activeTrees=[];for(const layer of b.layers){let count=0;
   for(const p of layer.candidates){const s=recoveryAt(c,p.x,p.z),factor=layer.kind==='grass'?s.grass:layer.kind==='shrub'?s.shrubs:s.trees;if(p.threshold>factor||factor<=0)continue;
    const scale=p.scale*(layer.kind==='grass'?.38+.62*Math.sqrt(s.grass):.22+.78*Math.sqrt(layer.kind==='tree'?s.trees/ECOLOGY[p.region].trees:s.shrubs/ECOLOGY[p.region].shrub));
    this.dummy.position.set(p.x-b.lod.position.x,p.y-.018,p.z-b.lod.position.z);this.dummy.rotation.set(0,p.yaw,0);this.dummy.scale.set(scale,scale*p.height,scale);this.dummy.updateMatrix();
    this.color.set(layer.kind==='grass'?ECOLOGY[p.region].dry:'#ffffff');if(layer.kind==='grass')this.color.lerp(new THREE.Color(ECOLOGY[p.region].grass),Math.min(1,.2+s.grass*.8+(p.hue-.5)*.18));else this.color.setHSL(.16+(p.hue-.5)*.06,.09,.77+p.hue*.16);
    for(const mesh of layer.meshes){mesh.setMatrixAt(count,this.dummy.matrix);mesh.setColorAt(count,this.color);}count++;
    if(layer.level===0){if(!b.counts[p.core])b.counts[p.core]={grass:0,shrubs:0,trees:0};b.counts[p.core][layer.kind==='grass'?'grass':layer.kind==='shrub'?'shrubs':'trees']++;if(layer.kind==='tree'&&layer.height*scale*p.height>1.7)b.activeTrees.push({...p,physicalHeight:layer.height*scale*p.height,radius:.09*scale});}
   }
   for(const mesh of layer.meshes){mesh.count=count;mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;mesh.computeBoundingSphere();mesh.castShadow=layer.kind!=='grass'&&layer.level===0&&b.quality!=='baixo'&&Math.hypot((b.cx+.5)*SIZE-position.x,(b.cz+.5)*SIZE-position.z)<VEGETATION_PROFILES[b.quality].shadowDistance+180;}
  }
  this.matrixUpdates++;
 }
 update(c,position,quality,dt,menu=false){
  this.time+=dt;for(const materials of this.materials.values())for(const m of [materials.grass,materials.foliage])m.userData.windTime.value=this.time;
  const active=Object.values(c.cores).some(k=>k.state==='active'),p=VEGETATION_PROFILES[quality]||VEGETATION_PROFILES.medio,cx=Math.floor(position.x/SIZE),cz=Math.floor(position.z/SIZE),range=Math.ceil(p.radius/SIZE),wanted=new Map();
  if(active&&!menu)for(let x=cx-range;x<=cx+range;x++)for(let z=cz-range;z<=cz+range;z++){const dx=Math.max(0,Math.abs((x+.5)*SIZE-position.x)-SIZE/2),dz=Math.max(0,Math.abs((z+.5)*SIZE-position.z)-SIZE/2);if(Math.hypot(dx,dz)>p.radius||z*SIZE>65||(z+1)*SIZE<-21000)continue;if(this.world.sectors&&!this.world.sectors.has(`${Math.round((x+.5)*SIZE/CONFIG.world.sectorSize)},${Math.round((z+.5)*SIZE/CONFIG.world.sectorSize)}`))continue;const center=recoveryAt(c,(x+.5)*SIZE,(z+.5)*SIZE);if(center.stage||recoveryAt(c,position.x,position.z).stage)wanted.set(`${x},${z}`,{x,z,distance:dx*dx+dz*dz});}
  for(const [key,b]of this.cells)if(!wanted.has(key)||b.quality!==quality){this.remove(b);this.cells.delete(key);}
  const jobs=[...wanted].filter(([key])=>!this.cells.has(key)).sort((a,b)=>a[1].distance-b[1].distance);
  // Plan roots over short slices; the exact physical sampler remains on this
  // thread. A cancelled sector does not leave a mesh or collider behind.
  if(this.job&&(!wanted.has(this.job.key)||this.job.quality!==quality))this.job=null;
  if(!this.job&&jobs.length){const [key,j]=jobs[0];this.job={...j,key,quality,records:[],iterator:vegetationPatches(j.x,j.z,this.sample,(...p)=>this.blocked(...p))};}
  const started=performance.now();
  while(this.job){const next=this.job.iterator.next();if(next.done){const j=this.job;j.records.sort((a,b)=>a.id.localeCompare(b.id));this.cells.set(j.key,this.build(j.x,j.z,quality,j.records));this.job=null;break;}this.job.records.push(...next.value);if(performance.now()-started>=4)break;}
  this.maxPlanningSliceMs=Math.max(this.maxPlanningSliceMs,performance.now()-started);this.pendingCells=Math.max(0,jobs.length-(this.job?0:1));
  for(const b of this.cells.values()){b.lod.visible=!menu;this.updateCell(b,c,position);}
  const nearby=[...this.cells.values()].flatMap(b=>b.activeTrees||[]).filter(p=>Math.hypot(p.x-position.x,p.z-position.z)<50).sort((a,b)=>Math.hypot(a.x-position.x,a.z-position.z)-Math.hypot(b.x-position.x,b.z-position.z)).slice(0,12),ids=new Set(nearby.map(p=>p.id));
  for(const [id,v]of this.colliders)if(!ids.has(id)){this.physics.removeRigidBody(v.body);this.colliders.delete(id);}
  for(const p of nearby){const height=Math.round(p.physicalHeight*10)/10;let v=this.colliders.get(p.id);if(!v){const body=this.physics.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(p.x,p.y+height/2,p.z));body.userData={restorationTree:p.id};const collider=this.physics.createCollider(RAPIER.ColliderDesc.cylinder(height/2,p.radius).setDensity(0),body);v={body,collider,height};this.colliders.set(p.id,v);}else if(v.height!==height){v.collider.setShape(new RAPIER.Cylinder(height/2,p.radius));v.body.setTranslation({x:p.x,y:p.y+height/2,z:p.z},false);v.height=height;}}
 }
 coreCounts(id){const counts={grass:0,shrubs:0,trees:0};for(const b of this.cells.values())for(const key of Object.keys(counts))counts[key]+=b.counts?.[id]?.[key]||0;return {...counts,total:counts.grass+counts.shrubs+counts.trees};}
 snapshot(){const counts={grass:0,shrubs:0,trees:0};for(const b of this.cells.values())for(const l of b.layers)if(l.level===0)counts[l.kind==='grass'?'grass':l.kind==='shrub'?'shrubs':'trees']+=l.meshes[0].count;return {sectors:this.cells.size,pendingCells:this.pendingCells||0,...counts,total:counts.grass+counts.shrubs+counts.trees,matrixUpdates:this.matrixUpdates,treeColliders:this.colliders.size,sharedGeometrySets:this.geometry.size,ownedTextures:[...this.materials.values()].reduce((n,m)=>n+m.textures.length,0),maxPlanningSliceMs:this.maxPlanningSliceMs,lastBuildMs:this.buildTimes.at(-1)||0,maxBuildMs:Math.max(0,...this.buildTimes),fingerprints:Object.fromEntries([...this.cells].map(([k,b])=>[k,b.fingerprint])),lod:true,originalModels:true};}
 remove(b){for(const l of b.layers)for(const mesh of l.meshes)mesh.dispose();for(const body of b.bodies)this.physics.removeRigidBody(body);b.lod.removeFromParent();}
 reset(){this.job=null;this.pendingCells=0;for(const b of this.cells.values())this.remove(b);this.cells.clear();for(const v of this.colliders.values())this.physics.removeRigidBody(v.body);this.colliders.clear();}
 dispose(){this.reset();for(const g of this.geometry.values()){g.grass.dispose();g.tree.wood.dispose();g.tree.leaves.dispose();g.shrub.wood.dispose();g.shrub.leaves.dispose();}this.geometry.clear();for(const m of this.materials.values()){m.wood.dispose();m.foliage.dispose();m.grass.dispose();m.textures.forEach(t=>t.dispose());}this.materials.clear();}
}

import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {BIOME_KITS,KIT_VARIANTS} from './biomeKits.js';
import {heightAt,roadX,randomSeed,regionAt} from './terrain.js';
import {reserved,roadClearance} from './contextLayout.js';
import {NETWORK_POINTS} from '../../data/network.js';
import {ROAD_POINTS} from '../../data/roadSites.js';
import {POIS} from '../../data/expedition.js';
import {DISCOVERY_SITES} from '../../data/ambience.js';
import {LOGISTICS_SITES} from '../../data/contracts.js';
import {restoredAt} from '../missions/network.js';

// Places the biome landmark kits of design/art/art-bible.md §6 in each world
// sector, replacing the old grey boxes. One merged mesh per kit material per
// sector (≤5 draw calls), deterministic per sector seed, never inside road,
// terminal, vegetation or named-place reservations. Plasma scars are hidden
// when the storm field is restored; everything else keeps its geometry and
// colliders before and after restoration (art bible §3, rule 8).

export const DRESSING_PER_SECTOR={ashes:12,cities:18,salt:20,glass:24,storm:18};
const NAMED=[...NETWORK_POINTS,...ROAD_POINTS,...POIS,...DISCOVERY_SITES,...Object.values(LOGISTICS_SITES).map(s=>s.bay||s.destination||s)].filter(p=>Number.isFinite(p?.x)&&Number.isFinite(p?.z));
const nearNamed=(x,z,r)=>NAMED.some(p=>Math.hypot(x-p.x,z-p.z)<r+70);

// Kit materials borrow the rock/rust data maps (no new texture or sampler)
// and are registered on the shared material map so PBRLibrary keeps them in
// step with quality changes (dataMapsFrom).
export function kitMaterials(m){
 const make=(key,options,from)=>{
  if(!m[key]){m[key]=new THREE.MeshStandardMaterial(options);if(from){m[key].userData.dataMapsFrom=from;m[key].normalMap=m[from]?.normalMap||null;m[key].roughnessMap=m[from]?.roughnessMap||null;m[key].normalScale=new THREE.Vector2(.4,.4);}}
  return m[key];
 };
 if(!m.kitPlasma)m.kitPlasma=new THREE.MeshBasicMaterial({color:'#ffffff',vertexColors:true,toneMapped:false,fog:true});
 return {
  concrete:make('kitConcrete',{color:'#ffffff',vertexColors:true,roughness:.95,metalness:.02},'rock'),
  rock:make('kitRock',{color:'#ffffff',vertexColors:true,roughness:.9,flatShading:true},'rock'),
  metal:make('kitMetal',{color:'#ffffff',vertexColors:true,roughness:.78,metalness:.32},'rust'),
  glass:make('kitGlass',{color:'#ffffff',vertexColors:true,roughness:.22,metalness:.25,flatShading:true}),
  plasma:m.kitPlasma,
 };
}

// Planar projection in metres (~3 m tile) so borrowed normal maps keep scale.
function metricUV(g){
 const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
 for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));
  uv.setXY(i,ay>.7?p.getX(i)/3:ax>az?p.getZ(i)/3:p.getX(i)/3,ay>.7?p.getZ(i)/3:p.getY(i)/3);}
 uv.needsUpdate=true;return g;
}

export class BiomeDressing{
 constructor(materials,seed=2047){this.materials=kitMaterials(materials);this.seed=seed;this.prototypes=new Map();}
 prototype(builder,variant){
  const key=`${builder.name}:${variant}`;
  if(!this.prototypes.has(key)){const kit=builder(this.seed*31+variant*977+builder.name.length*13);metricUV(kit.geometry);kit.geometry.computeBoundingSphere();this.prototypes.set(key,kit);}
  return this.prototypes.get(key);
 }
 // Pure placement plan for one sector (exported for tests and diagnostics).
 plan(cx,cz,size){
  const r=randomSeed(this.seed*7919+cx*92821+cz*68917),items=[],lean=r()*Math.PI*2;
  const z0=cz*size,region=regionAt(z0),count=DRESSING_PER_SECTOR[region]||0;
  for(let i=0;i<count*2&&items.length<count;i++){
   const z=z0+(r()-.5)*size;if(z>65||z<-21000)continue;
   const kits=BIOME_KITS[regionAt(z)];if(!kits)continue;
   const total=kits.reduce((s,k)=>s+k[1],0);let pick=r()*total,kit=kits[0];for(const k of kits){pick-=k[1];if(pick<=0){kit=k;break;}}
   const [builder,,near,far,collider]=kit,variant=Math.floor(r()*KIT_VARIANTS),proto=this.prototype(builder,variant),side=r()<.5?-1:1;
   let x=null;for(let t=0;t<4;t++){const cand=roadX(z)+side*(near+r()*(far-near));if(Math.abs(cand-cx*size)>size/2-proto.radius)continue;if(roadClearance(cand,z)<proto.radius+8||reserved(cand,z,proto.radius+6)||nearNamed(cand,z,proto.radius))continue;x=cand;break;}
   if(x===null)continue;
   const s=proto.radius*.55,ground=Math.min(heightAt(x,z),heightAt(x+s,z),heightAt(x-s,z),heightAt(x,z+s),heightAt(x,z-s));
   items.push({builder:builder.name,variant,material:proto.material,x,z,y:ground+(proto.lift||0)-(proto.flat?0:.35),yaw:r()*Math.PI*2,roll:proto.roll||0,lean:proto.lean||(r()<.5?.02:0),leanDir:lean,collider,size:proto.size,radius:proto.radius,mirror:r()<.5});
  }
  return items;
 }
 build(cx,cz,size,group,addCollider,owned,campaign){
  const items=this.plan(cx,cz,size),buckets=new Map();
  for(const it of items){
   const proto=this.prototypes.get(`${it.builder}:${it.variant}`);
   const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.sin(it.leanDir)*it.lean,it.yaw,Math.cos(it.leanDir)*it.lean+it.roll,'YXZ'));
   const m=new THREE.Matrix4().compose(new THREE.Vector3(it.x,it.y,it.z),q,new THREE.Vector3(it.mirror?-1:1,1,1));
   const g=proto.geometry.clone().applyMatrix4(m);
   if(it.mirror){const idx=g.index.array;for(let k=0;k<idx.length;k+=3){const t=idx[k+1];idx[k+1]=idx[k+2];idx[k+2]=t;}}
   if(!buckets.has(it.material))buckets.set(it.material,[]);buckets.get(it.material).push(g);
   if(it.collider){
    const [w,h,d]=it.size,yaw=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),it.yaw);
    const desc=it.collider==='cylinder'?RAPIER.ColliderDesc.cylinder(h/2,Math.max(.5,w*.35)):RAPIER.ColliderDesc.cuboid(Math.max(.5,w/2),Math.max(.5,h/2),Math.max(.5,d/2));
    addCollider(desc.setTranslation(it.x,it.y+h/2,it.z).setRotation({x:yaw.x,y:yaw.y,z:yaw.z,w:yaw.w}));
   }
  }
  const meshes={};
  for(const [material,parts] of buckets){
   const merged=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());if(!merged)continue;merged.computeBoundingSphere();owned.push(merged);
   const mesh=new THREE.Mesh(merged,this.materials[material]);mesh.name=`dressing-${material}`;mesh.receiveShadow=material!=='plasma';mesh.castShadow=false;group.add(mesh);meshes[material]=mesh;
  }
  const result={items,meshes,z:cz*size};
  this.refresh(result,campaign);
  return result;
 }
 refresh(dressing,campaign){if(dressing?.meshes?.plasma)dressing.meshes.plasma.visible=!(campaign&&restoredAt(campaign,dressing.z));}
 dispose(){for(const p of this.prototypes.values())p.geometry.dispose();this.prototypes.clear();}
}

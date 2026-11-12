import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { heightAt,roadX } from './terrain.js';
import { footprintPoints,restingPose } from './staticModelPlacement.js';

// Curated traces of the old inhabited road. They leave the lane and interaction areas clear.
const PLACEMENTS=[
 {id:'abandoned-sedan',model:'wreck-sedan',z:-180,offset:-18,yaw:.32},
 {id:'evacuated-hatch',model:'wreck-hatchback',z:-470,offset:17,yaw:-.6},
 {id:'workshop-utility',model:'wreck-utility',z:-1620,offset:-60,yaw:1.2},
 {id:'core-approach-sedan',model:'wreck-sedan',z:-2740,offset:20,yaw:-.25},
 {id:'dantes-garage',model:'old-garage',z:22,x:-13,yaw:0},
 {id:'shelter-barrel',model:'rusty-barrel',z:18,x:-16,yaw:.2},
 {id:'shelter-barrel-2',model:'rusty-barrel',z:18,x:-15.2,yaw:-.3},
 {id:'abandoned-petrol-forecourt',model:'gas-station',z:-2270,x:-85,yaw:0},
];
export class EnvironmentModels {
 constructor(scene,physics,assets,definitions={},ground=heightAt,groundKey=()=>''){this.ground=ground;this.groundKey=groundKey;this.lastGroundKey=null;this.scene=scene;this.physics=physics;this.assets=assets;this.definitions=definitions;this.live=new Map();this.disposed=false;}
 update(position,distance){
 const radius=Math.min(550,distance+80);
 // Terrain sectors may load after a model: re-rest only when the loaded set changes (scans are costly).
 const key=this.groundKey();if(key!==this.lastGroundKey){this.lastGroundKey=key;for(const e of this.live.values())if(e.root&&this.pose(e))this.syncBody(e);}
 for(const p of PLACEMENTS){
 const definition=this.definitions[p.model];if(definition?.status!=='installed'||definition.rightsCleared!==true)continue;
   const x=p.x??roadX(p.z)+p.offset,close=Math.hypot(position.x-x,position.z-p.z)<radius;
 if(!close&&this.live.has(p.id)){this.remove(this.live.get(p.id));this.live.delete(p.id);}
 else if(close&&!this.live.has(p.id)){
 const e={id:p.id,removed:false};this.live.set(p.id,e);
 this.assets.model(definition.url).then(lease=>{
 if(this.disposed||e.removed){lease.release();return;}
 e.yaw=p.yaw;e.dimensions=definition.dimensions;e.trimesh=definition.collision==='trimesh';e.lease=lease;const root=e.root=new THREE.Group();root.name=p.id;root.position.set(x,0,p.z);root.rotation.set(0,p.yaw,0,'YXZ');this.pose(e);root.add(lease.scene);this.scene.add(root);
 const [w,h,l]=definition.dimensions;
     const trim=definition.collision==='trimesh';
     e.body=this.physics.createRigidBody(RAPIER.RigidBodyDesc.fixed());e.lift=trim?0:h/2;this.syncBody(e);
     if(trim){
      lease.scene.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert();root.updateMatrixWorld(true);inverse.copy(root.matrixWorld).invert();
      lease.scene.traverse(o=>{if(!o.isMesh)return;const g=o.geometry,vertices=new Float32Array(g.attributes.position.count*3),matrix=inverse.clone().multiply(o.matrixWorld),v=new THREE.Vector3();for(let i=0;i<g.attributes.position.count;i++){v.fromBufferAttribute(g.attributes.position,i).applyMatrix4(matrix).toArray(vertices,i*3);}const indices=g.index?new Uint32Array(g.index.array):Uint32Array.from({length:g.attributes.position.count},(_,i)=>i);this.physics.createCollider(RAPIER.ColliderDesc.trimesh(vertices,indices).setFriction(.8),e.body);});
     }else this.physics.createCollider(RAPIER.ColliderDesc.cuboid(w/2,h/2,l/2).setFriction(.75),e.body);
 }).catch(error=>{if(!this.disposed&&!e.removed)this.assets.errors.push(`environment ${p.model}: ${error.message}`);});
 }
 }
 }
 presentation(menu){for(const e of this.live.values())if(e.root)e.root.visible=!(menu&&['dantes-garage','shelter-barrel','shelter-barrel-2'].includes(e.id));}
 snapshot(){return {grounding:[...this.live.values()].filter(e=>e.root).map(e=>this.grounding(e)),loaded:[...this.live.values()].filter(e=>e.root).length,loading:[...this.live.values()].filter(e=>!e.root).length,ids:[...this.live.keys()]};}
 /** Rests the model on the walkable surface; returns true when the pose changed (terrain loaded later). */
 pose(e){const r=e.root,[w,,l]=e.dimensions,q=restingPose(this.ground,r.position.x,r.position.z,e.yaw,w,l,{tilt:!e.trimesh});if(Math.abs(q.y-r.position.y)<.005&&Math.abs(q.pitch-r.rotation.x)<.002&&Math.abs(q.roll-r.rotation.z)<.002)return false;r.position.y=q.y;r.rotation.set(q.pitch,e.yaw,q.roll,'YXZ');r.updateMatrixWorld(true);return true;}
 /** Keeps the fixed collider on the visual pose. */
 syncBody(e){if(!e.body)return;const r=e.root,c=new THREE.Vector3(0,e.lift,0).applyQuaternion(r.quaternion).add(r.position);e.body.setTranslation({x:c.x,y:c.y,z:c.z},true);e.body.setRotation({x:r.quaternion.x,y:r.quaternion.y,z:r.quaternion.z,w:r.quaternion.w},true);}
 /** Gap between the model base and the walkable surface under its footprint (diagnostic). */
 grounding(e){const r=e.root,[w,,l]=e.dimensions;r.updateMatrixWorld(true);const gaps=[[0,0],[w/2,l/2],[-w/2,l/2],[w/2,-l/2],[-w/2,-l/2]].map(([a,b])=>{const v=new THREE.Vector3(a,0,b).applyMatrix4(r.matrixWorld);return v.y-this.ground(v.x,v.z);});return {id:e.id,base:+r.position.y.toFixed(3),tilt:[+r.rotation.x.toFixed(3),+r.rotation.z.toFixed(3)],gaps:gaps.map(v=>+v.toFixed(3)),maxGap:+Math.max(...gaps).toFixed(3),minGap:+Math.min(...gaps).toFixed(3)};}
 remove(e){e.removed=true;e.root?.removeFromParent();if(e.body)this.physics.removeRigidBody(e.body);e.lease?.release();}
 dispose(){this.disposed=true;for(const e of this.live.values())this.remove(e);this.live.clear();}
}

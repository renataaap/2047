import * as THREE from 'three';

// Visual vehicle pose on the existing skeleton. Walking stays entirely with Rapier.
// Targets are in the authored model's metre coordinates, facing +Z before the
// driver's anchor turns toward the truck's -Z axis. Bone translations never change.
export class SeatedPose {
 constructor(model){this.model=model;this.pose=new Map();}
 aim(bone,child,target){
  if(!bone||!child)return;this.model.updateMatrixWorld(true);
  const origin=bone.getWorldPosition(new THREE.Vector3()),current=child.getWorldPosition(new THREE.Vector3()).sub(origin).normalize(),wanted=this.model.localToWorld(new THREE.Vector3(...target)).sub(origin).normalize();
  const turn=new THREE.Quaternion().setFromUnitVectors(current,wanted),world=bone.getWorldQuaternion(new THREE.Quaternion()).premultiply(turn),parent=bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert();bone.quaternion.copy(parent.multiply(world));this.model.updateMatrixWorld(true);
 }
 build(){
  const m=this.model;this.original=new Map();m.traverse(o=>{if(o.isBone)this.original.set(o,o.quaternion.clone());});
  const feet=new Map();for(const side of ['L','R']){const foot=m.getObjectByName('foot'+side);if(foot)feet.set(foot,foot.getWorldQuaternion(new THREE.Quaternion()));}
  for(const [side,sign]of [['L',1],['R',-1]]){
   const thigh=m.getObjectByName('thigh'+side),shin=m.getObjectByName('shin'+side),foot=m.getObjectByName('foot'+side),arm=m.getObjectByName('arm'+side),fore=m.getObjectByName('forearm'+side),hand=m.getObjectByName('hand'+side);
   this.aim(thigh,shin,[sign*.14,.91,.44]);this.aim(shin,foot,[sign*.14,.53,.82]);
   if(foot&&feet.has(foot))foot.quaternion.copy(foot.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(feet.get(foot)));
   this.aim(arm,fore,[sign*.23,1.2,.29]);this.aim(fore,hand,[sign*.16,1.31,.55]);
  }
  for(const [bone,q]of this.original){if(!bone.quaternion.equals(q))this.pose.set(bone,bone.quaternion.clone());bone.quaternion.copy(q);}m.updateMatrixWorld(true);
 }
 restore(){if(!this.animated)return;for(const [bone,q]of this.animated)bone.quaternion.copy(q);this.animated=null;}
 apply(){if(!this.original)this.build();this.animated=new Map();for(const [bone,q]of this.pose){this.animated.set(bone,bone.quaternion.clone());bone.quaternion.copy(q);}}
}

import * as THREE from 'three';
// The handle is beside the cab, not at the centre of the chassis. This keeps the
// quick F return after exiting available without relaxing direction checks for NPCs.
export function truckEntryTarget(position,rotation,observer,text){
 const q=new THREE.Quaternion().copy(rotation),doors=[-2.1,2.1].map(x=>new THREE.Vector3(x,.75,-2.5).applyQuaternion(q).add(position));
 doors.sort((a,b)=>Math.hypot(a.x-observer.x,a.z-observer.z)-Math.hypot(b.x-observer.x,b.z-observer.z));
 return {id:'truck',key:'truck:titan',type:'truck',position:{x:doors[0].x,y:doors[0].y,z:doors[0].z},range:3.5,priority:5,text};
}

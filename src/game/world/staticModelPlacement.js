import * as THREE from 'three';

// Imported roots need not be centred or have their lowest vertex at y=0.
export function groundStaticModel(model,x,z){
 model.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(model);
 if(bounds.isEmpty())throw new Error('Modelo estático sem geometria visível');
 const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
 model.position.add(new THREE.Vector3(x-center.x,-bounds.min.y,z-center.z));model.updateMatrixWorld(true);
 return size;
}

/**
 * Corners (and centre) of a yaw-rotated rectangle on the ground plane.
 * @param {number} x centre x  @param {number} z centre z  @param {number} yaw rotation about y (rad)
 * @param {number} width local x extent  @param {number} length local z extent
 * @returns {Array<[number,number]>}
 */
export function footprintPoints(x,z,yaw,width,length){
 const c=Math.cos(yaw),s=Math.sin(yaw),hw=width/2,hl=length/2;
 return [[x,z],...[[hw,hl],[-hw,hl],[hw,-hl],[-hw,-hl]].map(([a,b])=>[x+a*c+b*s,z-a*s+b*c])];
}
/**
 * Resting height for a rectangular object on the walkable surface: the lowest of its centre
 * and four corners, so no side hangs in the air (on a slope the uphill side sinks slightly).
 * @param {(x:number,z:number)=>number} ground walkable surface height
 * @returns {number}
 */
export function footprintHeight(ground,x,z,yaw,width,length){
 let y=Infinity;for(const [px,pz] of footprintPoints(x,z,yaw,width,length))y=Math.min(y,ground(px,pz));return y;
}
/**
 * Resting pose of a rectangular object on the walkable surface. With tilt, the object follows a
 * plane fitted to its four corners (pitch about local x, roll about local z); without tilt
 * (buildings) it stays upright. In both cases it is lowered until neither the centre nor any
 * corner is above the ground, so no side hangs in the air.
 * @param {(x:number,z:number)=>number} ground walkable surface height
 * @param {{tilt?:boolean,maxTilt?:number}} [options] maxTilt in radians (default 0.35)
 * @returns {{y:number,pitch:number,roll:number}} pitch/roll for Euler order 'YXZ' with the yaw
 */
export function restingPose(ground,x,z,yaw,width,length,{tilt=true,maxTilt=.35}={}){
 const pts=footprintPoints(x,z,yaw,width,length),h=pts.map(([px,pz])=>ground(px,pz));
 if(!tilt)return {y:Math.min(...h),pitch:0,roll:0};
 const [c0,pp,mp,pm,mm]=h,clamp=a=>Math.max(-maxTilt,Math.min(maxTilt,a));
 const sx=((pp+pm)-(mp+mm))/2/width,sz=((pp+mp)-(pm+mm))/2/length,mean=(pp+mp+pm+mm)/4;
 const roll=clamp(Math.atan(sx)),pitch=clamp(-Math.atan(sz)),tx=Math.tan(roll),tz=-Math.tan(pitch);
 const plane=[mean,mean+tx*width/2+tz*length/2,mean-tx*width/2+tz*length/2,mean+tx*width/2-tz*length/2,mean-tx*width/2-tz*length/2];
 let offset=0;for(let i=0;i<5;i++)offset=Math.min(offset,h[i]-plane[i]);
 return {y:mean+offset,pitch,roll};
}

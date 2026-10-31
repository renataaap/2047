import RAPIER from '@dimforge/rapier3d-compat';
// The selected object's own collider is not an obstruction. Everything between
// the player's eyes and that object still blocks the interaction, even nearby.
export function targetVisible(world,origin,target,excludeCollider){
 const end=target.position,dx=end.x-origin.x,dy=end.y-origin.y,dz=end.z-origin.z,distance=Math.hypot(dx,dy,dz);if(distance<.02)return true;
 const hit=world.castRay(new RAPIER.Ray(origin,{x:dx/distance,y:dy/distance,z:dz/distance}),distance,true,undefined,undefined,excludeCollider,undefined,c=>c.parent()?.userData?.interactionKey!==target.key);
 return !hit||hit.timeOfImpact>=distance-.02;
}

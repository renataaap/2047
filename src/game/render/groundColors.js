import * as THREE from 'three';

// Ground materials enable vertexColors. Supplying no color attribute multiplies
// the PBR albedo by the default black WebGL attribute. Keep positions/UV/physics.
export function applyGroundColors(geometry){
 const p=geometry.attributes.position,n=geometry.attributes.normal,color=new Float32Array(p.count*3);
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),z=p.getZ(i),slope=1-Math.max(0,n.getY(i)),variation=Math.sin(x*.031+z*.017)*Math.sin(z*.024)*.035;
  const value=Math.max(.78,Math.min(1,.94+variation-slope*.08));
  color[i*3]=value;color[i*3+1]=value*.985;color[i*3+2]=value*.96;
 }
 geometry.setAttribute('color',new THREE.BufferAttribute(color,3));return geometry;
}

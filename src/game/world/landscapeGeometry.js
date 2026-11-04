import * as THREE from 'three';

// Same distant instanced silhouettes, smoother tessellation and metre-scale detail.
// These remain background props; the driveable ground uses terrainGeometry/Rapier.
export function landscapeGeometry(){
 const g=new THREE.SphereGeometry(1,24,14),p=g.attributes.position,uv=g.attributes.uv;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=1+.045*Math.sin(x*9+z*7)*Math.sin(y*8-z*6);
  p.setXYZ(i,x*r,y*r,z*r);uv.setXY(i,uv.getX(i)*70,uv.getY(i)*70);
 }
 g.computeVertexNormals();g.computeBoundingSphere();return g;
}

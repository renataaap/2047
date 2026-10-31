// Sample the exact rendered/collision triangle, including interpolation between
// procedural vertices. Analytic heightAt alone can spawn a capsule below a slope.
export function meshHeightAt(geometry,x,z){
 const a=geometry.attributes.position,index=geometry.index?.array;if(!index)return null;
 for(let i=0;i<index.length;i+=3){
  const ia=index[i],ib=index[i+1],ic=index[i+2],ax=a.getX(ia),az=a.getZ(ia),bx=a.getX(ib),bz=a.getZ(ib),cx=a.getX(ic),cz=a.getZ(ic);
  if(x<Math.min(ax,bx,cx)-1e-5||x>Math.max(ax,bx,cx)+1e-5||z<Math.min(az,bz,cz)-1e-5||z>Math.max(az,bz,cz)+1e-5)continue;
  const den=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz);if(Math.abs(den)<1e-10)continue;
  const u=((bz-cz)*(x-cx)+(cx-bx)*(z-cz))/den,v=((cz-az)*(x-cx)+(ax-cx)*(z-cz))/den,w=1-u-v;
  if(u>=-1e-5&&v>=-1e-5&&w>=-1e-5)return u*a.getY(ia)+v*a.getY(ib)+w*a.getY(ic);
 }
 return null;
}

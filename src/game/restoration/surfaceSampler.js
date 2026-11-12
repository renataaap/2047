// Read-only spatial index over the exact renderer/Rapier triangles. No vertex
// displacement, alternate heightfield or per-plant full-mesh scan.
const indices=new WeakMap(),CELL=32;
function indexFor(g){
 if(indices.has(g))return indices.get(g);
 const a=g.attributes.position,ix=g.index?.array,bins=new Map();
 if(ix)for(let i=0;i<ix.length;i+=3){const ids=[ix[i],ix[i+1],ix[i+2]],xs=ids.map(k=>a.getX(k)),zs=ids.map(k=>a.getZ(k));for(let x=Math.floor(Math.min(...xs)/CELL);x<=Math.floor(Math.max(...xs)/CELL);x++)for(let z=Math.floor(Math.min(...zs)/CELL);z<=Math.floor(Math.max(...zs)/CELL);z++){const key=`${x},${z}`;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(i);}}
 const index={a,ix,bins};indices.set(g,index);return index;
}
export function indexedSurfaceHeight(g,x,z){
 const {a,ix,bins}=indexFor(g);if(!ix)return null;
 for(const i of bins.get(`${Math.floor(x/CELL)},${Math.floor(z/CELL)}`)||[]){
  const ia=ix[i],ib=ix[i+1],ic=ix[i+2],ax=a.getX(ia),az=a.getZ(ia),bx=a.getX(ib),bz=a.getZ(ib),cx=a.getX(ic),cz=a.getZ(ic);
  if(x<Math.min(ax,bx,cx)-1e-5||x>Math.max(ax,bx,cx)+1e-5||z<Math.min(az,bz,cz)-1e-5||z>Math.max(az,bz,cz)+1e-5)continue;
  const den=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz);if(Math.abs(den)<1e-10)continue;
  const u=((bz-cz)*(x-cx)+(cx-bx)*(z-cz))/den,v=((cz-az)*(x-cx)+(ax-cx)*(z-cz))/den,w=1-u-v;
  if(u>=-1e-5&&v>=-1e-5&&w>=-1e-5)return u*a.getY(ia)+v*a.getY(ib)+w*a.getY(ic);
 }
 return null;
}

import * as THREE from 'three';
import { roadHeight, heightAt } from './terrain.js';
import {ROAD_DAMAGE,roadDepression} from './roadDamage.js';

// Reusable road strip: the same indexed geometry is sent to rendering and Rapier.
// UVs are measured in metres, preserving the scale of PBR scans across segments.
export function roadRibbon({ start,end,center,width=5,side=0,shoulder=3,sectorX=0,sectorSize=1024,step=4,damaged=false }) {
  const positions=[],indices=[],uv=[],steps=Math.ceil((end-start)/step),zs=Array.from({length:steps+1},(_,i)=>start+(end-start)*i/steps);let previous;
  if(damaged&&!side)for(const p of ROAD_DAMAGE)if(p.z+p.radius+2>=start&&p.z-p.radius-2<=end)for(let z=p.z-p.radius-2;z<=p.z+p.radius+2;z+=.5)if(z>start&&z<end)zs.push(z);
  for(const z of [...new Set(zs)].sort((a,b)=>a-b)){
    const x=center(z);if(Math.round(x/sectorSize)!==sectorX)continue;
    const w=typeof width==='function'?width(z):width,derivative=(center(z+.1)-center(z-.1))/.2,normalX=1/Math.hypot(1,derivative),normalZ=-derivative*normalX;
    const slices=damaged&&!side&&ROAD_DAMAGE.some(p=>Math.abs(z-p.z)<p.radius+2)?20:1,startIndex=positions.length/3;
    const offsets=side<0?[-w-shoulder,-w]:side>0?[w,w+shoulder]:Array.from({length:slices+1},(_,j)=>-w+2*w*j/slices);
    for(const offset of offsets){const px=x+offset*normalX,pz=z+offset*normalZ;const y=side&&Math.abs(offset)>w+.01?heightAt(px,pz)+.035:roadHeight(pz)+(side?.075:.09)-(damaged?roadDepression(px,pz,center(pz)):0);positions.push(px,y,pz);uv.push(offset,-z);}
    const count=offsets.length;if(previous){const a=previous.start,b=startIndex;if(previous.count===count)for(let k=0;k<count-1;k++)indices.push(a+k,b+k,a+k+1,a+k+1,b+k,b+k+1);else if(previous.count===2){for(let k=0;k<count-1;k++)indices.push(a,b+k,b+k+1);indices.push(a,b+count-1,a+1);}else{for(let k=0;k<previous.count-1;k++)indices.push(a+k,b,a+k+1);indices.push(a+previous.count-1,b,b+1);}}previous={start:startIndex,count};
  }
  if(!indices.length)return null;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingSphere();return g;
}

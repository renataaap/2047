import * as THREE from 'three';
import {sectorRoadSpans,PAVED_AREAS,networkRoadbed} from '../navigation/roadIndex.js';
import {heightAt} from './terrain.js';

// One merged surface per material/sector. Identical vertices feed Rapier.
export function networkRoadGeometry(cx,cz,size=1024){
 const batches=new Map(),stripes=[];
 const batch=kind=>{if(!batches.has(kind))batches.set(kind,{positions:[],uv:[],indices:[]});return batches.get(kind);};
 const ribbon=(kind,a,b,offsets,edge)=>{
  const n=batch(kind),first=n.positions.length/3,len=Math.hypot(b.x-a.x,b.z-a.z);if(len<.001)return;const nx=-(b.z-a.z)/len,nz=(b.x-a.x)/len;
  for(const p of [a,b])for(const off of offsets){const x=p.x+(p.nx??nx)*off,z=p.z+(p.nz??nz)*off,rut=edge?.type==='dirt'?Math.sin(p.s*.6)*.025*(1-Math.abs(off)/(edge.width/2+1)):0,outer=kind==='shoulder'&&Math.abs(off)>edge.width/2+.01;n.positions.push(x,heightAt(x,z)+(outer?.035-networkRoadbed(x,z):kind==='shoulder'?.075:.12)+rut,z);n.uv.push(off,p.s);}
  for(let j=0;j<offsets.length-1;j++){const a=first+j,b=first+offsets.length+j;n.indices.push(a,a+1,b,b,a+1,b+1);}
 };
 for(const {edge:e,spans} of sectorRoadSpans(cx,cz,size))for(const {a,b} of spans){const w=e.width/2;ribbon(e.surface==='terra'?'dirt':'paved',a,b,[-w,0,w],e);if(e.type!=='urban')for(const side of [-1,1])ribbon('shoulder',a,b,side<0?[-w-2.5,-w]:[w,w+2.5],e);if(e.surface!=='terra'&&Math.floor(a.s/12)!==Math.floor(b.s/12)&&e.type!=='access')stripes.push({x:a.x,y:heightAt(a.x,a.z)+.145,z:a.z,angle:Math.atan2(-(b.x-a.x),-(b.z-a.z))});}
 for(const p of PAVED_AREAS){if(Math.round(p.x/size)!==cx||Math.round(p.z/size)!==cz)continue;const n=batch('paved'),first=n.positions.length/3;
  if(p.round){n.positions.push(p.x,heightAt(p.x,p.z)+.105,p.z);n.uv.push(p.x,p.z);for(let i=0;i<=32;i++){const a=i/32*Math.PI*2,x=p.x+Math.cos(a)*p.width/2,z=p.z+Math.sin(a)*p.width/2;n.positions.push(x,heightAt(x,z)+.105,z);n.uv.push(x,z);}for(let i=1;i<=32;i++)n.indices.push(first,first+i+1,first+i);}
  else {const cols=6,rows=8;for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const x=p.x-p.width/2+p.width*i/cols,z=p.z-p.length/2+p.length*j/rows;n.positions.push(x,heightAt(x,z)+.105,z);n.uv.push(x,z);}for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=first+j*(cols+1)+i,b=a+cols+1;n.indices.push(a,b,a+1,a+1,b,b+1);}}
 }
 const surfaces=[];for(const [kind,n]of batches){if(!n.indices.length)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(n.positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(n.uv,2));g.setIndex(n.indices);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();surfaces.push({kind,geometry:g});}
 return {surfaces,stripes};
}

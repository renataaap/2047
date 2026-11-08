import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {randomSeed} from '../world/terrain.js';
import {ECOLOGY} from './definitions.js';

// Original tapered branch mesh: rings follow a curved axis and retain bark UVs.
function branch(points,bottom,top,detail){
 const curve=new THREE.CatmullRomCurve3(points),segments=4+Math.max(0,detail)*2,sides=5+Math.max(0,detail),frames=curve.computeFrenetFrames(segments,false),positions=[],uv=[],indices=[];
 for(let i=0;i<=segments;i++){const t=i/segments,c=curve.getPointAt(t),radius=THREE.MathUtils.lerp(bottom,top,t);for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2,n=frames.normals[i],b=frames.binormals[i];positions.push(c.x+radius*(Math.cos(a)*n.x+Math.sin(a)*b.x),c.y+radius*(Math.cos(a)*n.y+Math.sin(a)*b.y),c.z+radius*(Math.cos(a)*n.z+Math.sin(a)*b.z));uv.push(j/sides,t*curve.getLength()*2);if(i<segments&&j<sides){const k=i*(sides+1)+j;indices.push(k,k+sides+1,k+1,k+1,k+sides+1,k+sides+2);}}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
function lanceolate(width,length){
 const p=[0,0,0,-width*.7,length*.25,.012,0,length*.36,.045,width*.7,length*.25,.012,-width*.55,length*.65,.018,0,length*.72,.055,width*.55,length*.65,.018,0,length,0];
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute([.5,0,0,.25,.5,.36,1,.25,.1,.65,.5,.72,.9,.65,.5,1],2));g.setIndex([0,1,2,0,2,3,1,4,2,2,4,5,2,5,6,2,6,3,4,7,5,5,7,6]);g.computeVertexNormals();return g;
}
function merged(parts){const g=mergeGeometries(parts,false);for(const p of parts)p.dispose();g.computeBoundingBox();g.computeBoundingSphere();return g;}
export function grassGeometry(region,variant=0,far=false){
 const rng=randomSeed(8800+variant*23),parts=[],h=ECOLOGY[region].height;
 for(let i=0;i<(far?3:7);i++){
  const length=h*(.55+rng()*.8),width=.03+rng()*.036,bend=.08+rng()*.24,a=rng()*Math.PI*2,positions=[],uv=[],indices=[],colors=[],columns=far?2:3;
  for(let j=0;j<=2;j++){
   const t=j/2,w=width*(1-t)*.7,cx=Math.sin(a)*bend*t*t,cz=Math.cos(a)*bend*t*t,fold=Math.sin(t*Math.PI)*.016;
   for(let side=0;side<columns;side++){const u=side/(columns-1),lateral=(u-.5)*2,center=columns===3&&side===1?fold:0;positions.push(cx+Math.cos(a)*w*lateral+Math.sin(a)*center,length*t,cz-Math.sin(a)*w*lateral+Math.cos(a)*center);uv.push(u,t);const light=(.62+.38*t)*(center?1:.92);colors.push(light,light,.82*light);}
   if(j<2)for(let side=0;side<columns-1;side++){const k=j*columns+side;indices.push(k,k+columns,k+1,k+1,k+columns,k+columns+1);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();g.translate((rng()-.5)*.55,0,(rng()-.5)*.55);parts.push(g);
 }
 return merged(parts);
}
export function woodyPlantGeometry(region,kind='tree',detail=0,variant=0){
 const rng=randomSeed(11347+variant*703+(kind==='shrub'?591:0)),eco=ECOLOGY[region],shrub=kind==='shrub';
 const h=shrub?(region==='glass'?.65:1.15):region==='cities'?3.9:region==='ashes'?3.4:region==='salt'?2.1:region==='glass'?1.9:2.8;
 const lean=region==='storm'?.52:region==='glass'?.3:.13,wood=[],leaves=[];
 const trunk=[new THREE.Vector3(0,0,0),new THREE.Vector3(-.025,h*.3,.035),new THREE.Vector3(lean*.45,h*.65,-.04),new THREE.Vector3(lean,h,0)];
 wood.push(branch(trunk,shrub?.035:.09,shrub?.012:.023,detail));
 const branches=detail<0?4:shrub?7:7+detail*2;
 for(let i=0;i<branches;i++){
  const a=i*2.399+variant*.7,t=.32+(i/branches)*.52,origin=new THREE.Vector3(lean*t,h*t,0),spread=h*(shrub?.52:region==='cities'?.32:.43)*(1-t*.45),tip=new THREE.Vector3(origin.x+Math.sin(a)*spread+(region==='storm'?.22:0),origin.y+h*(shrub?.18:.2),Math.cos(a)*spread);
  const mid=origin.clone().lerp(tip,.55).add(new THREE.Vector3(0,h*.045,0));wood.push(branch([origin,mid,tip],shrub?.014:.027,shrub?.004:.007,Math.max(0,detail-1)));
  const count=detail<0?7:(shrub?16:18)+detail*6;
  for(let j=0;j<count;j++){
   const along=.42+rng()*.58,center=origin.clone().lerp(tip,along),angle=j*2.399+a,radial=(.07+rng()*.18)*(shrub?.6:1),length=(shrub?.23:.34)*(region==='glass'?.65:region==='cities'?1.2:1);
   const leaf=lanceolate(length*.34,length*(.75+rng()*.5));leaf.rotateZ((rng()-.5)*1.8);leaf.rotateY(angle);leaf.rotateX(-.2+rng()*.9);leaf.translate(center.x+Math.sin(angle)*radial,center.y+(rng()-.5)*.15,center.z+Math.cos(angle)*radial);leaves.push(leaf);
  }
 }
 // A thin terminal shoot prevents a cut-off silhouette at the top.
 for(let i=0;i<12+detail*4;i++){const leaf=lanceolate(.06,.22);leaf.rotateZ((rng()-.5)*1.4);leaf.rotateY(rng()*Math.PI*2);leaf.translate(lean+(rng()-.5)*.24,h-.08+rng()*.17,(rng()-.5)*.24);leaves.push(leaf);}
 return {wood:merged(wood),leaves:merged(leaves),height:h,form:eco.treeForm};
}

function originalTexture(kind){
 if(typeof document==='undefined')return null;
 const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),r=randomSeed(kind==='bark'?7919:7907);
 if(kind==='bark'){
  x.fillStyle='#a79c87';x.fillRect(0,0,128,128);for(let i=0;i<180;i++){const px=r()*128;x.strokeStyle=i%3?'#817866':'#c2b59c';x.lineWidth=.3+r()*1.4;x.beginPath();x.moveTo(px,0);for(let y=0;y<=128;y+=12)x.lineTo(px+Math.sin(y*.09+i)*2,y);x.stroke();}
 }else{
  x.fillStyle='#c4cfab';x.fillRect(0,0,128,128);x.strokeStyle='#84956b';x.lineWidth=1.2;x.beginPath();x.moveTo(64,0);x.lineTo(64,128);x.stroke();for(let y=18;y<128;y+=18){x.beginPath();x.moveTo(64,y);x.lineTo(9,y-20);x.moveTo(64,y);x.lineTo(119,y-20);x.stroke();}
 }
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=2;t.name=`aurora-original-${kind}`;return t;
}
export function vegetationMaterials(region){
 const e=ECOLOGY[region],bark=originalTexture('bark'),leaf=originalTexture('leaf');
 const wood=new THREE.MeshStandardMaterial({color:e.bark,map:bark,roughness:.95,metalness:0});
 const foliage=new THREE.MeshStandardMaterial({color:e.leaf,map:leaf,roughness:.86,metalness:0,side:THREE.DoubleSide});
 const grass=new THREE.MeshStandardMaterial({color:'#ffffff',map:leaf,vertexColors:true,roughness:.94,metalness:0,side:THREE.DoubleSide});
 for(const m of [grass,foliage]){
  const time={value:0};m.userData.windTime=time;m.onBeforeCompile=s=>{s.uniforms.auroraWindTime=time;s.vertexShader='uniform float auroraWindTime;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vec4 awp=vec4(position,1.0);
   #ifdef USE_INSTANCING
   awp=instanceMatrix*awp;
   #endif
   awp=modelMatrix*awp;
   float aw=sin(auroraWindTime*1.7+awp.x*.19+awp.z*.13)*.018;
   transformed.x+=aw*min(position.y*position.y,1.4);transformed.z+=aw*.4*min(position.y*position.y,1.4);`);};m.customProgramCacheKey=()=> 'aurora-original-foliage-wind-v1';
 }
 return {wood,foliage,grass,textures:[bark,leaf].filter(Boolean)};
}

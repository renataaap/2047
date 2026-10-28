import * as THREE from 'three';
import { randomSeed } from '../world/terrain.js';
export function paintedTexture(base, seed=2047, asphalt=false) {
  const c=document.createElement('canvas'); c.width=c.height=256;
  const ctx=c.getContext('2d'); ctx.fillStyle=base; ctx.fillRect(0,0,256,256);
  const r=randomSeed(seed);
  for(let i=0;i<2800;i++) { const v=r()>.5?225:25;ctx.fillStyle=`rgba(${v},${v*.87},${v*.7},${r()*.12})`;ctx.fillRect(r()*256,r()*256,r()*9+1,r()*3+1); }
  for(let i=0;i<25;i++) {ctx.strokeStyle=asphalt?'#262a2b45':'#6b402955';ctx.lineWidth=r()*2; ctx.beginPath();let x=r()*256,y=r()*256;ctx.moveTo(x,y);for(let j=0;j<5;j++){x+=(r()-.5)*24;y+=r()*14;ctx.lineTo(x,y);}ctx.stroke();}
  const tex=new THREE.CanvasTexture(c); tex.colorSpace=THREE.SRGBColorSpace; tex.wrapS=tex.wrapT=THREE.RepeatWrapping; return tex;
}
export function createMaterials() {
  const standard=(color,more={})=>new THREE.MeshStandardMaterial({color,roughness:.94,metalness:.08,...more});
  return {
    paint:standard('#e5d9bd',{map:paintedTexture('#b9ac92')}), rust:standard('#b58b6a',{map:paintedTexture('#a36d45',77)}),
    dark:standard('#32373a'), rubber:standard('#25282a'), glass:standard('#80939c',{roughness:.85,transparent:true,opacity:.18,depthWrite:false}), light:standard('#eee3bd',{emissive:'#d6b17a',emissiveIntensity:.35}),
    steel:standard('#62615a'), ground:standard('#d2c8b5',{map:paintedTexture('#b6a18a',42),vertexColors:true}),
    asphalt:standard('#494b4b',{map:paintedTexture('#555653',20,true)}), stripe:standard('#b1a07c'), rock:standard('#7c7367',{flatShading:true}),
  };
}
export function bevelGeometry(w,h,d,b=.08) {
  const s=new THREE.Shape();s.moveTo(-w/2+b,-h/2);s.lineTo(w/2-b,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+b);s.lineTo(w/2,h/2-b);s.quadraticCurveTo(w/2,h/2,w/2-b,h/2);s.lineTo(-w/2+b,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-b);s.lineTo(-w/2,-h/2+b);s.quadraticCurveTo(-w/2,-h/2,-w/2+b,-h/2);
  const g=new THREE.ExtrudeGeometry(s,{depth:d,steps:1,bevelEnabled:true,bevelSegments:1,bevelSize:b*.3,bevelThickness:b*.3,curveSegments:2});g.translate(0,0,-d/2);return g;
}

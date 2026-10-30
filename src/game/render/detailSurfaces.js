import * as THREE from 'three';
import {randomSeed} from '../world/terrain.js';

// Original, small repeatable detail maps. These are not claimed as downloaded scans.
export function detailSurface(kind){
 const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),r=randomSeed(8071);x.fillStyle=kind==='wood'?'#8e7a60':kind==='cloth'?'#a6a39b':'#b1aea6';x.fillRect(0,0,256,256);
 for(let i=0;i<1800;i++){const dark=r()>.5?30:240;x.fillStyle=`rgba(${dark},${dark},${dark},${.015+r()*.06})`;x.fillRect(r()*256,r()*256,kind==='wood'?1+r()*2:1,kind==='wood'?15+r()*95:1);}
 if(kind==='cloth'){x.strokeStyle='#302e2622';x.lineWidth=1;for(let i=0;i<256;i+=4){x.beginPath();x.moveTo(i,0);x.lineTo(i,256);x.moveTo(0,i);x.lineTo(256,i);x.stroke();}}
 if(kind==='concrete'){x.strokeStyle='#393c3c44';x.lineWidth=.7;for(let i=0;i<9;i++){let px=r()*256,py=r()*256;x.beginPath();x.moveTo(px,py);for(let j=0;j<6;j++){px+=r()*18-7;py+=r()*21;x.lineTo(px,py);}x.stroke();}}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(kind==='cloth'?3:.5,kind==='cloth'?3:.5);return t;
}

import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Original work clothing/equipment on the existing rig. No second controller or root motion.
export function dressWorker(model,style='traveler'){
 const owned=[],materials=[],objects=[],head=model.getObjectByName('head'),spine=model.getObjectByName('spine');if(!head||!spine)return {style:'external-model',dispose(){}};
 const material=(color,roughness=1)=>{const m=new THREE.MeshStandardMaterial({color,roughness,metalness:0});materials.push(m);return m;};
 const cloth=material(style==='ivani'?'#655451':style==='tomas'?'#725947':'#5b604e'),trim=material('#38382f'),metal=material('#99917b',.5),hair=material('#302b25');
 const batches=new Map();
 const part=(bone,g,m,x,y,z,rx=0,ry=0,rz=0)=>{const matrix=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(1,1,1));g.applyMatrix4(matrix);const key=bone.name+':'+materials.indexOf(m);if(!batches.has(key))batches.set(key,{bone,m,parts:[]});batches.get(key).parts.push(g);};
 const box=(bone,w,h,d,m,x,y,z)=>part(bone,new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const ball=(bone,x,y,z,sx,sy,sz,m)=>{const g=new THREE.SphereGeometry(1,12,8);g.scale(sx,sy,sz);part(bone,g,m,x,y,z);};
 const cap=()=>{part(head,new THREE.SphereGeometry(.14,16,8,0,Math.PI*2,0,Math.PI/2),cloth,0,1.68,0);ball(head,0,1.69,.12,.15,.015,.16,cloth);};
 const pack=()=>{box(spine,.3,.38,.15,cloth,0,1.16,-.18);for(const x of [-.13,.13]){box(spine,.035,.36,.04,trim,x,1.2,.12);box(spine,.035,.32,.035,trim,x,1.15,-.27);}box(spine,.25,.1,.04,trim,0,1.03,-.27);part(spine,new THREE.CylinderGeometry(.04,.04,.19,10),metal,.22,1.1,-.16);};
 const apron=()=>{box(spine,.36,.45,.025,cloth,0,1.05,.13);box(spine,.26,.12,.035,trim,0,1.09,.15);for(const x of [-.1,.1])box(spine,.025,.3,.025,cloth,x,1.35,.12);};
 if(['dante','zeca','trader'].includes(style))cap();
 if(['dante','traveler','survivor'].includes(style))pack();
 if(['tomas','ivani','mechanic'].includes(style))apron();
 if(style==='ivani'){ball(head,0,1.64,-.13,.09,.1,.075,hair);part(head,new THREE.TorusGeometry(.13,.026,6,18),cloth,0,1.68,0,Math.PI/2);}
 if(style==='tomas'||style==='mechanic'){for(const x of [-.145,.145])ball(head,x,1.6,0,.035,.07,.07,trim);part(head,new THREE.TorusGeometry(.15,.015,5,14,Math.PI),metal,0,1.64,0);}
 if(style==='zeca'){for(const x of [-.055,.055])part(head,new THREE.TorusGeometry(.045,.008,5,12),metal,x,1.6,.115);box(head,.025,.008,.018,metal,0,1.6,.115);}
 if(style==='dante'){ball(head,0,1.535,.085,.095,.045,.045,hair);box(spine,.4,.045,.025,trim,0,1,.12);box(spine,.08,.1,.06,cloth,.23,.96,.04);}
 // Reparenting keeps the authored model-space fit while following the animated bone.
 for(const {bone,m,parts}of batches.values()){
  const plain=parts.map(g=>{const next=g.index?g.toNonIndexed():g;if(next!==g)g.dispose();return next;}),g=mergeGeometries(plain,false);plain.forEach(p=>p.dispose());owned.push(g);const object=new THREE.Mesh(g,m);object.castShadow=true;model.add(object);model.updateMatrixWorld(true);bone.attach(object);objects.push(object);
 }
 return {style,meshes:objects.length,dispose(){objects.forEach(o=>o.removeFromParent());owned.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}

import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {bevelGeometry} from '../render/materials.js';
import {detailSurface} from '../render/detailSurfaces.js';

let fabricCache=null;
function acquireFabric(){
 if(typeof document==='undefined')return {map:null,bump:null,release(){}};
 if(!fabricCache){const map=detailSurface('cloth'),bump=map.clone();bump.colorSpace=THREE.NoColorSpace;fabricCache={map,bump,refs:0};}
 const cache=fabricCache;cache.refs++;let released=false;
 return {...cache,release(){if(released)return;released=true;if(--cache.refs===0){cache.map.dispose();cache.bump.dispose();if(fabricCache===cache)fabricCache=null;}}};
}
export const WORKER_IDENTITIES={
 dante:{coat:'#536153',trim:'#3a3a31',height:1,face:1.035,nose:.006,beard:true,features:['work-jacket','stitched-pack','beard','boots']},
 zeca:{coat:'#938065',trim:'#353f48',height:.99,face:1.07,nose:.002,features:['utility-vest','soft-cap','glasses','radio']},
 tomas:{coat:'#927452',trim:'#343e41',height:1.025,face:.97,nose:.004,features:['leather-apron','wrench-roll','goggles','ear-protection']},
 ivani:{coat:'#7a5e52',trim:'#574a45',height:.95,face:1.02,nose:0,features:['head-wrap','shawl','long-apron','glasses']},
 survivor:{coat:'#677579',trim:'#454f51',height:.98,face:.96,nose:.002,features:['hood','scarf','patched-coat','canvas-pack']},
 marta:{coat:'#52666d',trim:'#684f41',height:.97,face:.98,nose:.002,features:['coverall','tied-hair','tool-belt','rolled-sleeves']},
};
function coatGeometry(style){
 const rings=style==='ivani'?[[.64,.21,.16],[.92,.23,.16],[1.12,.23,.16],[1.37,.25,.14],[1.47,.16,.105]]:[[.92,.195,.14],[1.01,.205,.15],[1.24,.245,.17],[1.39,.255,.14],[1.46,.17,.105]];
 const vertices=[],uvs=[],indices=[],segments=24;
 for(let j=0;j<rings.length;j++){const [y,rx,rz]=rings[j];for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;vertices.push(Math.sin(a)*rx,y,Math.cos(a)*rz);uvs.push(i/segments*2,j/(rings.length-1)*2);}}
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,a+1,b,a+1,b+1,b);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
function apronGeometry(){
 const positions=[],uv=[],indices=[],rows=[[.69,.21],[.95,.2],[1.18,.16],[1.37,.1]],columns=12;
 for(let j=0;j<rows.length;j++){const [y,width]=rows[j];for(let i=0;i<=columns;i++){const t=i/columns,x=(t*2-1)*width;positions.push(x,y,.172+.035*Math.cos((t-.5)*Math.PI));uv.push(t,j/(rows.length-1)*2);}}
 for(let j=0;j<rows.length-1;j++)for(let i=0;i<columns;i++){const a=j*(columns+1)+i,b=a+columns+1;indices.push(a,a+1,b,a+1,b+1,b);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
// Per-instance skin geometry: identity comes from small jaw/nose differences, not a tint alone.
function finishFace(model,identity,owned){
 model.traverse(node=>{
  if(!node.isMesh||Array.isArray(node.material)||node.material.name!=='skin')return;
  const geometry=node.geometry.clone(),pos=geometry.attributes.position,colors=[];
  for(let i=0;i<pos.count;i++){
   let x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),shade=1;
   if(y>1.49&&y<1.78){const jaw=Math.max(0,1-Math.abs(y-1.56)/.1);x*=1+(identity.face-1)*jaw;
    if(Math.abs(x)<.035&&z>.12&&y>1.58&&y<1.68)z+=identity.nose;
    shade=.96+Math.min(.055,Math.max(0,(y-1.5)*.2));if(identity.beard&&y<1.595&&z>.04)shade*=.58;
    shade*=1+Math.sin(x*143+y*137+z*79)*.025;pos.setXYZ(i,x,y,z);
   }
   colors.push(shade,shade*.99,shade*.97);
  }
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();geometry.computeBoundingSphere();node.geometry=geometry;node.material.vertexColors=true;node.material.needsUpdate=true;owned.push(geometry);
 });
}
export function finishWorker(model,style='traveler'){
 const identity=WORKER_IDENTITIES[style]||WORKER_IDENTITIES.survivor,head=model.getObjectByName('head'),spine=model.getObjectByName('spine');
 if(!head||!spine)return {style:'external-model',features:[],dispose(){}};
 const fabric=acquireFabric(),owned=[],objects=[],materials=[],batches=new Map();
 const material=(color,cloth=false,metalness=0)=>{const m=new THREE.MeshStandardMaterial({color,roughness:cloth?.93:metalness?.45:.8,metalness});if(cloth){m.map=fabric.map;m.bumpMap=fabric.bump;m.bumpScale=.0015;}materials.push(m);return m;};
 const cloth=material(identity.coat,true),trim=material(identity.trim,true),seam=material('#b5ac8d'),steel=material('#aaa58f',false,.7),leather=material('#403a30'),hair=material(style==='marta'?'#5a5750':style==='ivani'?'#60584c':'#302c26');
 const part=(bone,g,m,x=0,y=0,z=0,rot=[0,0,0])=>{g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)),new THREE.Vector3(1,1,1)));const key=bone.name+':'+materials.indexOf(m);if(!batches.has(key))batches.set(key,{bone,m,parts:[]});batches.get(key).parts.push(g);};
 const box=(bone,w,h,d,m,x,y,z)=>part(bone,bevelGeometry(w,h,d,.009),m,x,y,z);
 const ball=(bone,x,y,z,sx,sy,sz,m)=>{const g=new THREE.SphereGeometry(1,16,10);g.scale(sx,sy,sz);part(bone,g,m,x,y,z);};
 const cable=(bone,points,r,m)=>part(bone,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),16,r,6,false),m);
 part(spine,coatGeometry(style),cloth);
 // Bound sleeves follow actual upper-arm bones, not a second character controller.
 model.updateMatrixWorld(true);
 for(const side of ['L','R']){
  const arm=model.getObjectByName('arm'+side),forearm=model.getObjectByName('forearm'+side),hand=model.getObjectByName('hand'+side);
  if(arm&&forearm&&hand){
   for(const [a,b,r]of [[arm,forearm,.078],[forearm,hand,.061]]){
    const p=model.worldToLocal(a.getWorldPosition(new THREE.Vector3())),q=model.worldToLocal(b.getWorldPosition(new THREE.Vector3())),delta=q.clone().sub(p),g=new THREE.CylinderGeometry(r*.84,r,delta.length()*.94,16,3);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()));g.translate(...p.clone().lerp(q,.5).toArray());part(a,g,a===arm?cloth:trim);
   }
  }
  const foot=model.getObjectByName('foot'+side);if(foot){const p=model.worldToLocal(foot.getWorldPosition(new THREE.Vector3()));ball(foot,p.x,.075,p.z+.06,.075,.07,.15,leather);for(let i=0;i<4;i++)box(foot,.065,.006,.009,seam,p.x,.12+i*.007,p.z+.06-i*.025);}
 }
 for(const side of [-1,1]){
  cable(spine,[[side*.19,.96,.085],[side*.235,1.25,.105],[side*.19,1.4,.105]],.003,seam);
  box(spine,.105,.12,.025,trim,side*.125,1.26,.165);box(spine,.115,.025,.035,cloth,side*.125,1.32,.173);
 }
 cable(spine,[[0,.95,.148],[0,1.17,.179],[0,1.42,.12]],.005,steel);
 box(spine,.36,.038,.03,leather,0,.955,.14);box(spine,.055,.04,.015,steel,0,.956,.163);
 for(const x of [-.08,.08])part(spine,new THREE.TorusGeometry(.065,.013,6,18),trim,x,1.445,.01,[Math.PI/2,0,0]);
 if(['dante','survivor'].includes(style)){
  ball(spine,0,1.2,-.23,.19,.235,.1,trim);box(spine,.25,.14,.05,cloth,0,1.13,-.325);
  for(const x of [-.14,.14]){cable(spine,[[x,1.02,-.29],[x,1.36,-.27],[x,1.43,-.05],[x,1.3,.16],[x,.99,.14]],.018,leather);box(spine,.035,.045,.012,steel,x,1.18,.178);}
  cable(spine,[[-.14,1.26,-.33],[0,1.31,-.34],[.14,1.26,-.33]],.003,seam);
 }
 if(['dante','zeca'].includes(style)){
  part(head,new THREE.SphereGeometry(.137,24,10,0,Math.PI*2,0,Math.PI/2),cloth,0,1.68,0);
  ball(head,0,1.686,.125,.139,.012,.135,trim);cable(head,[[-.12,1.7,.04],[0,1.78,.025],[.12,1.7,.04]],.002,seam);
 }
 if(['zeca','ivani','marta'].includes(style)){
  for(const x of [-.05,.05])part(head,new THREE.TorusGeometry(.037,.004,6,20),steel,x,1.625,.12);
  box(head,.03,.006,.014,steel,0,1.625,.12);for(const s of [-1,1])cable(head,[[s*.08,1.625,.12],[s*.11,1.625,.03],[s*.1,1.61,-.04]],.003,steel);
 }
 if(style==='dante'){
  ball(head,0,1.55,.09,.085,.033,.036,hair);box(spine,.055,.13,.055,leather,.22,.96,.06);cable(spine,[[.22,1.02,.06],[.24,1.06,.08],[.26,1.09,.02]],.009,steel);
 }else if(style==='zeca'){
  box(spine,.07,.12,.045,leather,-.23,.97,.04);part(spine,new THREE.CylinderGeometry(.005,.005,.14,8),leather,-.23,1.1,.04);
  for(const x of [-.14,.14])box(spine,.09,.08,.025,trim,x,1.05,.15);
 }else if(style==='tomas'){
  // Curved leather apron with a rolled tool pouch and protective goggles.
  part(spine,apronGeometry(),leather);for(const x of [-.09,.09])cable(spine,[[x,1.36,.18],[x*1.4,1.45,.08],[x*1.5,1.4,-.06]],.012,trim);
  for(const x of [-.07,.02,.11]){box(spine,.02,.18,.015,steel,x,.89,.2);box(spine,.04,.07,.028,trim,x,.83,.2);}
  for(const s of [-1,1]){ball(head,s*.14,1.63,0,.035,.065,.06,trim);box(head,.075,.045,.025,leather,s*.05,1.71,.105);}cable(head,[[-.14,1.65,0],[0,1.78,0],[.14,1.65,0]],.01,steel);
 }else if(style==='ivani'){
  part(head,new THREE.SphereGeometry(.143,24,12,0,Math.PI*2,0,Math.PI*.5),trim,0,1.67,-.02);
  ball(head,0,1.645,-.13,.09,.085,.06,hair);ball(head,-.11,1.61,-.07,.04,.05,.04,cloth);
  cable(spine,[[-.22,1.4,0],[0,1.32,.18],[.22,1.4,0]],.037,trim);box(spine,.23,.12,.022,trim,0,.95,.18);
 }else if(style==='survivor'){
  part(head,new THREE.SphereGeometry(.148,24,12,Math.PI/2+.85,Math.PI*2-1.7,0,Math.PI*.78),cloth,0,1.65,-.015);
  cable(head,[[-.105,1.5,.06],[-.14,1.62,.08],[-.1,1.76,.08],[0,1.79,.08],[.1,1.76,.08],[.14,1.62,.08],[.105,1.5,.06]],.008,trim);
  part(head,new THREE.TorusGeometry(.1,.026,8,24),trim,0,1.49,0,[Math.PI/2,0,0]);box(spine,.075,.3,.028,trim,.08,1.32,.17);
 }else if(style==='marta'){
  ball(head,0,1.69,-.015,.13,.082,.12,hair);ball(head,0,1.6,-.13,.07,.12,.055,hair);
  box(spine,.4,.06,.06,leather,0,.96,.02);for(const x of [-.2,.17]){box(spine,.09,.13,.06,trim,x,.89,.08);cable(spine,[[x,.95,.1],[x+.015,1.06,.12],[x+.045,1.08,.09]],.01,steel);}
 }
 // Head meshes use bone attachment with their authored model-space fit retained.
 for(const {bone,m,parts}of batches.values()){
  const plain=parts.map(g=>{const next=g.index?g.toNonIndexed():g;if(next!==g)g.dispose();return next;}),g=mergeGeometries(plain,false);plain.forEach(p=>p.dispose());owned.push(g);const o=new THREE.Mesh(g,m);o.castShadow=o.receiveShadow=true;model.add(o);model.updateMatrixWorld(true);bone.attach(o);objects.push(o);
 }
 finishFace(model,identity,owned);
 return {style,features:WORKER_IDENTITIES[style]?identity.features:['work-coat','boots'],meshes:objects.length,heightScale:identity.height,dispose(){objects.forEach(o=>o.removeFromParent());owned.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());fabric.release();}};
}

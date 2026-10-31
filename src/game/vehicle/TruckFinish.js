import * as THREE from 'three';
import {bevelGeometry} from '../render/materials.js';
import {mergeStatic} from '../render/mergeStatic.js';

// Small authored attachments. No replacement wheels, pivots, source meshes or colliders.
export function createTruckFinish(m){
 const group=new THREE.Group();group.name='Titã / fixações e manutenção';group.userData.keepWithImportedTruck=true;
 const add=(g,material,x,y,z,rotation=[0,0,0])=>{const o=new THREE.Mesh(g,material);o.position.set(x,y,z);o.rotation.set(...rotation);group.add(o);return o;};
 const box=(w,h,d,mat,x,y,z)=>add(bevelGeometry(w,h,d,.008),mat,x,y,z);
 const pipe=(points,r,mat)=>add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),16,r,6,false),mat,0,0,0);
 for(const side of [-1,1]){
  // Perforated access step and two bolted brackets behind the front wheels.
  box(.28,.045,.64,m.weatheredMetal,side*1.18,-.43,-1.85);
  for(const z of [-2.05,-1.86,-1.67])for(const dx of [-.065,.065])box(.055,.006,.09,m.dark,side*1.18+dx,-.402,z);
  for(const z of [-2.05,-1.65]){box(.055,.24,.07,m.steel,side*1.1,-.3,z);add(new THREE.CylinderGeometry(.018,.018,.025,6),m.steel,side*1.26,-.4,z,[0,0,Math.PI/2]);}
  // Air reservoir, retaining straps and actual curved brake lines under the frame.
  add(new THREE.CylinderGeometry(.13,.13,.75,20),m.steel,side*.76,-.49,.32,[Math.PI/2,0,0]);
  for(const z of [.09,.55])add(new THREE.TorusGeometry(.137,.012,5,20),m.dark,side*.76,-.49,z);
  pipe([[side*.76,-.45,.72],[side*.64,-.3,1.2],[side*.75,-.36,1.8],[side*1.01,-.5,1.95]],.013,m.rubber);
  box(.045,.07,3.65,m.steel,side*1.185,-.24,1.45);
  for(const z of [-.25,.8,1.85,2.9]){
   add(new THREE.TorusGeometry(.045,.009,6,16),m.steel,side*1.22,-.24,z,[0,Math.PI/2,0]);
   box(.025,.14,.1,m.weatheredMetal,side*1.195,-.2,z);
  }
  box(.43,.29,.025,m.rubber,side*1.16,-.65,3.56);for(const x of [-.13,.13])box(.04,.035,.035,m.steel,side*1.16+x,-.515,3.58);
  // Cargo hinge fasteners, away from the authored atlas panels to avoid z-fighting.
  for(const z of [3.91,4.02])for(const y of [.2,.6,1.6])add(new THREE.CylinderGeometry(.012,.012,.028,6),m.steel,side*1.07,y,z,[Math.PI/2,0,0]);
 }
 pipe([[.9,-.24,-.68],[.99,.04,-.84],[1.02,.65,-1.3],[1.02,1.38,-1.3]],.045,m.dark);
 for(const y of [.2,.8])box(.11,.04,.1,m.steel,1.02,y,-1.3);
 mergeStatic(group);return group;
}

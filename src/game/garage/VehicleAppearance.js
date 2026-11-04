import * as THREE from 'three';
import {SKINS,VEHICLES} from './catalog.js';

// Palette masks are evaluated only on classified paint. Original atlas, UVs,
// metal, glass, rubber and opacity policies remain independent per vehicle.
export class VehicleAppearance{
 constructor(truck,visual,id){
  this.truck=truck;this.visual=visual;this.id=id;this.materials=visual.materialState?.owned||[];
  this.uniforms={auRootInverse:{value:new THREE.Matrix4()},auMain:{value:new THREE.Color()},auSecondary:{value:new THREE.Color()},auMode:{value:0},auAge:{value:0},auStrength:{value:0}};
  this.paintMaterials=this.materials.filter(m=>m.userData.auroraSurfaceRole==='paint');
  for(const m of this.paintMaterials){
   m.userData.originalRoughness=m.roughness;
   m.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,this.uniforms);
    shader.vertexShader='varying vec3 auTruckPos;uniform mat4 auRootInverse;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nauTruckPos=(auRootInverse*modelMatrix*vec4(position,1.)).xyz;');
    shader.fragmentShader='varying vec3 auTruckPos;uniform vec3 auMain;uniform vec3 auSecondary;uniform float auMode;uniform float auAge;uniform float auStrength;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      float auLight=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
      float auRust=smoothstep(.018,.10,diffuseColor.r-diffuseColor.g)*smoothstep(.008,.055,diffuseColor.g-diffuseColor.b);
      float auMask=smoothstep(.015,.12,auLight)*(1.-auRust*auAge*.92);
      float auBand=1.-smoothstep(.10,.15,abs(auTruckPos.y-.48-auTruckPos.z*.13));
      if(auMode>1.5)auBand=(1.-smoothstep(.16,.21,abs(auTruckPos.y-.75+auTruckPos.z*.21)))*.95;
      vec3 auPaint=mix(auMain,auSecondary,auBand)*(.45+sqrt(max(auLight,0.))*1.05);
      float auScuff=smoothstep(.91,.99,sin(auTruckPos.z*21.+sin(auTruckPos.y*39.))*sin(auTruckPos.y*67.))*auAge*.38;
      diffuseColor.rgb=mix(diffuseColor.rgb,auPaint,auStrength*auMask*(1.-auScuff));`);
   };
   m.customProgramCacheKey=()=> 'aurora-vehicle-palette-r186-v1';m.needsUpdate=true;
  }
  this.attachments=new THREE.Group();this.attachments.name='Acessórios equipados';this.attachments.userData.keepWithImportedTruck=true;truck.root.add(this.attachments);
  this.metal=new THREE.MeshStandardMaterial({color:'#656f6b',roughness:.48,metalness:.75});
  this.rubber=new THREE.MeshStandardMaterial({color:'#292e2b',roughness:.92});
  this.lens=new THREE.MeshStandardMaterial({color:'#d4c59b',emissive:'#f2db9c',emissiveIntensity:.1,roughness:.18});
 }
 apply(record){
  if(!record)return;const p=record.paint,u=this.uniforms;
  u.auMain.value.set(p.main);u.auSecondary.value.set(p.secondary);u.auAge.value=p.wear;u.auMode.value=p.skin==='cinzas'?2:1;
  u.auStrength.value=p.skin==='original'&&p.main===SKINS.original.main&&p.secondary===SKINS.original.secondary?0:1;
  for(const m of this.paintMaterials)m.roughness=p.finish==='original'?m.userData.originalRoughness:p.finish==='fosco'?.86:.48;
  const cabin=this.truck.cockpit?.materials;
  cabin?.cloth?.color.set(record.interior.seat);cabin?.paint?.color.set(record.interior.panel);
  const key=record.accessories.slice().sort().join(',');if(key!==this.attachmentKey){this.clearParts();this.attachmentKey=key;this.buildParts(record.accessories);}
  this.record=structuredClone(record);this.update(false);
 }
 add(geo,mat,x,y,z,rotation=[0,0,0]){const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.rotation.set(...rotation);mesh.castShadow=true;mesh.receiveShadow=true;this.attachments.add(mesh);return mesh;}
 tube(points,r=.045){return this.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),18,r,8,false),this.metal,0,0,0);}
 buildParts(ids){const front=VEHICLES[this.id].front;
  if(ids.includes('guard')){
   for(const y of [.12,.6])this.tube([[-1.02,y,front-.09],[-1.06,y,front-.22],[-.8,y,front-.3],[.8,y,front-.3],[1.06,y,front-.22],[1.02,y,front-.09]]);
   for(const x of [-.8,.8]){this.tube([[x,-.12,front+.05],[x,.08,front-.25],[x,.78,front-.25]]);this.add(new THREE.BoxGeometry(.15,.2,.22),this.metal,x,-.12,front);}
  }
  if(ids.includes('lamps'))for(const x of [-.65,.65]){
   this.add(new THREE.CylinderGeometry(.18,.18,.18,24),this.metal,x,.87,front,[Math.PI/2,0,0]);this.add(new THREE.CylinderGeometry(.15,.15,.014,24),this.lens,x,.87,front-.1,[Math.PI/2,0,0]);
   const light=new THREE.SpotLight('#f4e0b0',500,70,.32,.65,2);light.position.set(x,.87,front-.12);light.target.position.set(x,-.4,front-40);this.attachments.add(light,light.target);
  }
  if(ids.includes('rack')){
   const x=1.12,z=-.35;this.add(new THREE.BoxGeometry(.22,.08,.85),this.metal,x,-.25,z);
   this.add(new THREE.BoxGeometry(.18,.44,.32),this.rubber,x,.01,z);this.add(new THREE.BoxGeometry(.08,.06,.17),this.metal,x,.26,z);
   for(const dz of [-.25,.25])this.tube([[x-.12,-.27,z+dz],[x+.12,-.27,z+dz],[x+.12,.35,z+dz],[x-.12,.35,z+dz]],.018);
  }
 }
 update(headlights){this.truck.root.updateWorldMatrix(true,false);this.uniforms.auRootInverse.value.copy(this.truck.root.matrixWorld).invert();this.lens.emissiveIntensity=headlights?2:.08;for(const o of this.attachments.children)if(o.isSpotLight)o.visible=!!headlights;}
 clearParts(){for(const child of [...this.attachments.children]){child.traverse(o=>o.geometry?.dispose());child.removeFromParent();}}
 snapshot(){return {id:this.id,paint:this.record?.paint,interior:this.record?.interior,accessories:this.record?.accessories||[],paintMaterials:this.paintMaterials.length};}
 dispose(){this.clearParts();this.attachments.removeFromParent();for(const m of [this.metal,this.rubber,this.lens])m.dispose();}
}

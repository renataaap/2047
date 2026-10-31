import {it,expect,vi} from 'vitest';
import * as THREE from 'three';
import {readFile} from 'node:fs/promises';
import {prepareTruckMaterials} from '../../src/game/vehicle/truckMaterials.js';
import {TruckVisual} from '../../src/game/vehicle/TruckVisual.js';
import {readGlb,accessor,geometryFingerprint} from '../../scripts/lib/truck-gltf.mjs';

function fixture(){
 const scene=new THREE.Group(),texture=new THREE.Texture(),materials=[],roles={Paint:'paint',Metal:'metal',Rubber:'rubber',Glass:'glass',Lens:'lens',CabPaint:'paint'},hidden=['Glass','CabPaint'];
 for(const [name,role]of Object.entries(roles)){
  const material=new THREE.MeshPhysicalMaterial({map:texture,alphaMap:texture,transparent:true,opacity:.2,depthWrite:false,transmission:.4,color:'#789abc'});material.name=name;material.userData.assetManaged=true;materials.push(material);
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(name==='Paint'?2.4:.1,name==='Paint'?2:.1,name==='Paint'?8:.1),material);mesh.name=`piece-${name}`;scene.add(mesh);
 }
 return {scene,texture,materials,definition:{materialRoles:roles,cockpitHiddenMaterials:hidden},dispose(){scene.traverse(o=>o.geometry?.dispose());materials.forEach(m=>m.dispose());texture.dispose();}};
}

it('separa sólidos/vidros sem escurecer o atlas nem modificar materiais compartilhados',()=>{
 const f=fixture(),state=prepareTruckMaterials(f.scene,f.definition);try{
  expect(state.owned).toHaveLength(6);for(let i=0;i<f.materials.length;i++){
   const original=f.materials[i],m=state.owned[i],glass=['glass','lens'].includes(m.userData.auroraSurfaceRole);
   expect(m).not.toBe(original);expect(m.map).toBe(f.texture);expect(m.color.equals(original.color)).toBe(true);expect(m.transparent).toBe(glass);expect(m.depthWrite).toBe(!glass);expect(m.depthTest).toBe(true);expect(m.alphaMap).toBeNull();expect(m.alphaTest).toBe(0);expect(m.transmission).toBe(0);expect(original.opacity).toBe(.2);expect(original.depthWrite).toBe(false);expect(original.alphaMap).toBe(f.texture);expect(m.opacity).toBe(glass?(m.name==='Glass'?.55:.85):1);
  }
 }finally{state.owned.forEach(m=>m.dispose());f.dispose();}
});
it('material desconhecido exige classificação explícita, sem transformar vidro em metal',()=>{
 const f=fixture();try{delete f.definition.materialRoles.Paint;expect(()=>prepareTruckMaterials(f.scene,f.definition)).toThrow(/sem função/);}finally{f.dispose();}
});
it('modelo sem política específica mantém compatibilidade com os fixtures e outros caminhões',()=>{
 const f=fixture();try{const first=f.scene.children[0].material,s=prepareTruckMaterials(f.scene,{});expect(s.classified).toBe(false);expect(s.owned).toEqual([]);expect(f.scene.children[0].material).toBe(first);}finally{f.dispose();}
});
it('cabine provisória oculta somente peças sobrepostas e descarte não libera atlas compartilhado',async()=>{
 const f=fixture(),root=new THREE.Group(),cab=new THREE.Group();root.add(cab);const old=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial());root.add(old);const wheelPoints=[],wheels=[];
 for(const z of [-2.5,1.45,2.9])for(const x of [-1.2,1.2]){const name=`wheel-${wheels.length}`,o=new THREE.Mesh(new THREE.SphereGeometry(.2,8,6),f.materials[2]);o.name=name;o.position.set(x,-.62,z);f.scene.add(o);wheelPoints.push({x,y:-.1,z});wheels.push({node:name,spinAxis:'x',spinSign:-1});}
 const release=vi.fn(),visual=new TruckVisual({root,cab,wheelPoints},{model:async()=>({scene:f.scene,release})});await visual.load({...f.definition,status:'installed',rightsCleared:true,source:'original-test-fixture',license:'CC0',attribution:'Original test geometry',id:'test',url:'/assets/test.glb',wheels});
 const controller={wheelSuspensionLength:()=>.47,wheelSteering:i=>i<2?.12:0,wheelRotation:()=>.4};visual.update(controller,false);expect(visual.snapshot().legacyCabVisible).toBe(false);expect(old.visible).toBe(false);expect(visual.snapshot().cabShellVisible).toBe(true);
 visual.update(controller,true);expect(visual.visual.visible).toBe(true);expect(f.scene.getObjectByName('piece-Paint').visible).toBe(true);expect(f.scene.getObjectByName('piece-CabPaint').visible).toBe(false);expect(visual.snapshot().legacyCabVisible).toBe(true);expect(visual.snapshot().wheels).toHaveLength(6);expect(visual.snapshot().wheels[0].rotation).toBe(-.4);
 visual.update(controller,false);expect(f.scene.getObjectByName('piece-CabPaint').visible).toBe(true);expect(visual.snapshot().legacyCabVisible).toBe(false);
 const disposed=vi.fn();f.texture.addEventListener('dispose',disposed);visual.dispose();expect(release).toHaveBeenCalledOnce();expect(disposed).not.toHaveBeenCalled();old.geometry.dispose();old.material.dispose();f.dispose();
});
it('GLB instalado preserva cada vértice, UV, normal, face orientada, PNG e pivô da fonte',async()=>{
 const {json:g,bin}=await readGlb('public/assets/models/trucks/titan-old/model.glb'),baseline=JSON.parse(await readFile('evidence/truck-opacity/geometry-invariants.json','utf8'));expect(geometryFingerprint(g,bin)).toEqual(baseline.original);
 const definition=JSON.parse(await readFile('public/assets/models/manifest.json','utf8')).trucks.initial;
 for(const m of g.materials){const role=definition.materialRoles[m.name];expect(['paint','metal','rubber','glass','lens']).toContain(role);expect(m.alphaMode).toBe(['glass','lens'].includes(role)?'BLEND':'OPAQUE');}
 for(const node of g.nodes.filter(n=>n.name.startsWith('wheel_'))){const roles=g.meshes[node.mesh].primitives.map(p=>definition.materialRoles[g.materials[p.material].name]);expect(roles.sort()).toEqual(['metal','rubber']);}
 expect(definition.wheels).toHaveLength(6);
});
it('laterais, teto e traseira do baú têm faces reais que interceptam a visão',async()=>{
 const {json:g,bin}=await readGlb('public/assets/models/trucks/titan-old/model.glb'),primitives=g.meshes[g.nodes.find(n=>n.name==='titan_body').mesh].primitives,geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(accessor(g,bin,primitives[0].attributes.POSITION).flat(),3));geometry.setIndex(primitives.flatMap(p=>accessor(g,bin,p.indices).flat()));
 const material=new THREE.MeshStandardMaterial({side:THREE.DoubleSide}),mesh=new THREE.Mesh(geometry,material);mesh.updateMatrixWorld(true);
 for(const [origin,direction,axis,sign,limit]of [[[3,1.3,1.5],[-1,0,0],'x',1,1],[[-3,1.3,1.5],[1,0,0],'x',-1,1],[[0,4,1.5],[0,-1,0],'y',1,2],[[0,1.3,6],[0,0,-1],'z',1,4]]){const hits=new THREE.Raycaster(new THREE.Vector3(...origin),new THREE.Vector3(...direction)).intersectObject(mesh);expect(hits.length).toBeGreaterThan(0);expect(hits[0].point[axis]*sign).toBeGreaterThan(limit);}
 geometry.dispose();material.dispose();
});

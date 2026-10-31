import {it,expect,beforeAll,vi} from 'vitest';
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import {createCabin,CABIN_EYE} from '../../src/game/vehicle/CabinInterior.js';
import {applyGroundColors} from '../../src/game/render/groundColors.js';
import {finishWorker,WORKER_IDENTITIES} from '../../src/game/player/WorkerFinish.js';
import {discoveryEntries,recordFootDiscoveries} from '../../src/game/world/discoveryJournal.js';
import {buildOpenGasShop} from '../../src/game/world/shopShell.js';
import {DISCOVERY_SITES} from '../../src/data/ambience.js';
import {SeatedPose} from '../../src/game/player/SeatedPose.js';
import {readGlb} from '../../scripts/lib/truck-gltf.mjs';
beforeAll(async()=>{await RAPIER.init();});

it('cabine deixa o eixo visual livre, preserva vidro próprio e usa olho dentro da casca',()=>{
 const cabin=createCabin({instrumentsFactory:()=>({group:new THREE.Group(),update(){}})});cabin.setInside(true);cabin.group.updateMatrixWorld(true);
 try{
  const eye=new THREE.Vector3(...CABIN_EYE),bounds=new THREE.Box3().setFromObject(cabin.group);expect(bounds.containsPoint(eye)).toBe(true);
  const hits=new THREE.Raycaster(eye,new THREE.Vector3(0,-.1,-1).normalize(),0,2).intersectObject(cabin.group,true);
  const solid=hits.filter(h=>!h.object.material.transparent);expect(solid).toHaveLength(0);expect(hits.some(h=>h.object.material===cabin.materials.glass)).toBe(true);
  for(const [name,m]of Object.entries(cabin.materials)){expect(m.transparent).toBe(name==='glass');expect(m.depthWrite).toBe(name!=='glass');}
  cabin.update({worldNight:1,headlights:true});expect(cabin.snapshot().dome).toBe(true);cabin.setInside(false);cabin.update({worldNight:1});expect(cabin.snapshot().dome).toBe(false);
 }finally{cabin.dispose();}
});
it('os quatro mostradores reais ficam à frente da moldura e os alertas seguem a simulação',()=>{
 const ctx=new Proxy({},{get:(target,key)=>key in target?target[key]:()=>{}});
 vi.stubGlobal('document',{createElement:()=>({getContext:()=>ctx,width:0,height:0})});
 const cabin=createCabin();cabin.setInside(true);cabin.group.updateMatrixWorld(true);
 try{
  const eye=new THREE.Vector3(...CABIN_EYE),dials=cabin.instruments.group.children.filter(o=>o.name.startsWith('instrument:'));expect(dials).toHaveLength(4);
  // The rotating wheel may cross a dial, as in a real cab; the static shell may not.
  for(const dial of dials){const target=dial.localToWorld(new THREE.Vector3(0,.06,0)),hits=new THREE.Raycaster(eye,target.sub(eye).normalize()).intersectObject(cabin.group,true).filter(h=>h.object.parent!==cabin.steeringWheel);expect(hits[0]?.object.parent===dial,`${dial.name}: a moldura não pode esconder a face`).toBe(true);}
  cabin.instruments.update({speed:10,rpm:1250,fuel:35,temperature:110,engineOn:true,parkingBrake:true,headlights:true},1/60);
  expect(cabin.instruments.snapshot().signals).toEqual({engine:true,parking:true,temperature:true,lights:true});expect(cabin.instruments.snapshot().speed).toBe(36);
 }finally{cabin.dispose();vi.unstubAllGlobals();}
});
it('cores do solo corrigem o atributo ausente sem mudar vértices, normais, UVs ou índices',()=>{
 const g=new THREE.PlaneGeometry(5,5,4,4);g.rotateX(-Math.PI/2);const pos=g.attributes.position.array.slice(),normal=g.attributes.normal.array.slice(),uv=g.attributes.uv.array.slice(),ix=g.index.array.slice();applyGroundColors(g);
 expect(g.attributes.color.count).toBe(g.attributes.position.count);expect(Math.min(...g.attributes.color.array)).toBeGreaterThan(.7);expect(Math.max(...g.attributes.color.array)).toBeLessThanOrEqual(1);
 expect(g.attributes.position.array).toEqual(pos);expect(g.attributes.normal.array).toEqual(normal);expect(g.attributes.uv.array).toEqual(uv);expect(g.index.array).toEqual(ix);g.dispose();
});
it('roupas por osso e identidades não deslocam o rig nem se resumem à paleta',()=>{
 const features=new Set();for(const style of Object.keys(WORKER_IDENTITIES)){
  const model=new THREE.Group(),head=new THREE.Bone(),spine=new THREE.Bone();head.name='head';spine.name='spine';model.add(spine);spine.add(head);const before=model.matrixWorld.clone(),outfit=finishWorker(model,style);
  expect(model.matrixWorld.equals(before)).toBe(true);expect(outfit.meshes).toBeGreaterThan(2);features.add(outfit.features.join(','));outfit.dispose();expect(head.children).toHaveLength(0);
 }expect(features.size).toBe(6);
});
it('diário recupera saves antigos, atualiza registros únicos e não paga recursos',()=>{
 expect(discoveryEntries({})).toEqual([]);const c={world:{visited:['motel','motel'],claimed:[],read:[]},inventory:{player:{water:2}},cores:{'core-1':{state:'active'}}},before=structuredClone(c);
 const first=discoveryEntries(c);expect(first).toHaveLength(2);expect(c).toEqual(before);expect(first.find(p=>p.id==='site:motel').complete).toBe(false);
 c.world.claimed.push('motel');const next=discoveryEntries(c);expect(next).toHaveLength(2);expect(next.find(p=>p.id==='site:motel').complete).toBe(true);expect(c.inventory).toEqual(before.inventory);
});
it('descoberta exige entrada na área acessível e não registra apenas passar ao lado ou pelo teto',()=>{
 const c={},loaded=[{site:DISCOVERY_SITES[0],floor:0}];recordFootDiscoveries(c,{x:-30,z:-380,y:4},loaded);recordFootDiscoveries(c,{x:-10,z:-380,y:1.1},loaded);expect(c.world).toBeUndefined();
 recordFootDiscoveries(c,{x:-30,z:-380,y:1.1},loaded);recordFootDiscoveries(c,{x:-30,z:-380,y:1.1},loaded);expect(c.world.visited).toEqual(['motel']);expect(c.world.claimed).toEqual([]);
});
it('a loja tem abertura física na porta e parede real fora do acesso',()=>{
 const w=new RAPIER.World({x:0,y:-9.81,z:0});buildOpenGasShop((width,height,depth,m,x,y,z,hard)=>{if(hard)w.createCollider(RAPIER.ColliderDesc.cuboid(width/2,height/2,depth/2).setTranslation(x,y,z));},{});w.step();
 try{expect(w.castRay(new RAPIER.Ray({x:-1,y:1,z:-2.7},{x:-1,y:0,z:0}),4,true)).toBeNull();expect(w.castRay(new RAPIER.Ray({x:-1,y:.8,z:1},{x:-1,y:0,z:0}),4,true)).not.toBeNull();}finally{w.free();}
});
it('pose sentada usa o rig real, dobra joelhos e conserva raiz e translações dos ossos',async()=>{
 const {json:g}=await readGlb('public/assets/models/aurora-workers/worker.glb'),joints=new Set(g.skins.flatMap(s=>s.joints));
 const nodes=g.nodes.map((n,i)=>{const o=joints.has(i)?new THREE.Bone():new THREE.Group();o.name=n.name||'';if(n.translation)o.position.fromArray(n.translation);if(n.rotation)o.quaternion.fromArray(n.rotation);if(n.scale)o.scale.fromArray(n.scale);if(n.matrix)new THREE.Matrix4().fromArray(n.matrix).decompose(o.position,o.quaternion,o.scale);return o;});
 g.nodes.forEach((n,i)=>n.children?.forEach(j=>nodes[i].add(nodes[j])));const model=new THREE.Group();g.scenes[g.scene||0].nodes.forEach(i=>model.add(nodes[i]));model.updateMatrixWorld(true);
 const rotations=nodes.map(n=>n.quaternion.toArray()),translations=nodes.map(n=>n.position.toArray()),before=model.getObjectByName('shinL').getWorldPosition(new THREE.Vector3()),root=model.matrixWorld.clone(),pose=new SeatedPose(model);pose.apply();model.updateMatrixWorld(true);
 const after=model.getObjectByName('shinL').getWorldPosition(new THREE.Vector3());expect(after.z).toBeGreaterThan(before.z+.15);expect(model.matrixWorld.equals(root)).toBe(true);expect(nodes.map(n=>n.position.toArray())).toEqual(translations);expect(pose.pose.size).toBeGreaterThan(4);pose.restore();expect(nodes.map(n=>n.quaternion.toArray())).toEqual(rotations);
});

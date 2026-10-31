import * as THREE from 'three';

const SOLID=new Set(['paint','metal','rubber']),GLASS=new Set(['glass','lens']);
// Per-vehicle copies: cached GLB materials/textures and other assets remain untouched.
export function prepareTruckMaterials(scene,definition){
 const roles=definition.materialRoles;if(!roles)return {owned:[],cabMeshes:[],classified:false,snapshot:()=>[]};
 const copies=new Map(),cabMeshes=[],hidden=new Set(definition.cockpitHiddenMaterials||[]);
 try{
  scene.traverse(node=>{if(!node.isMesh)return;const source=Array.isArray(node.material)?node.material:[node.material];
   const materials=source.map(original=>{
    const role=roles[original.name];if(!SOLID.has(role)&&!GLASS.has(role))throw Error(`Material do Titã sem função conhecida: ${original.name}`);
    if(!copies.has(original)){
     const m=original.clone();m.userData={...m.userData,assetManaged:false,auroraSurfaceRole:role};m.transparent=GLASS.has(role);m.opacity=role==='glass'?.55:role==='lens'?.85:1;
     m.alphaTest=0;m.alphaMap=null;m.depthTest=true;m.depthWrite=SOLID.has(role);m.blending=THREE.NormalBlending;if('transmission'in m)m.transmission=0;
     if(GLASS.has(role)){m.metalness=0;m.envMapIntensity=.5;m.forceSinglePass=true;}m.needsUpdate=true;copies.set(original,m);
    }return copies.get(original);
   });
   node.material=Array.isArray(node.material)?materials:materials[0];node.castShadow=materials.some(m=>SOLID.has(m.userData.auroraSurfaceRole));node.receiveShadow=true;
   if(source.every(m=>hidden.has(m.name)))cabMeshes.push(node);
  });
 }catch(error){for(const m of copies.values())m.dispose();throw error;}
 const owned=[...copies.values()];return {owned,cabMeshes,classified:true,snapshot:()=>owned.map(m=>({name:m.name,role:m.userData.auroraSurfaceRole,transparent:m.transparent,opacity:m.opacity,alphaTest:m.alphaTest,alphaMap:!!m.alphaMap,depthWrite:m.depthWrite,depthTest:m.depthTest,side:m.side,blending:m.blending,transmission:m.transmission||0,roughness:m.roughness,metalness:m.metalness}))};
}

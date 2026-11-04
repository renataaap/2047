import {it,expect} from 'vitest';
import * as THREE from 'three';
import {applyTerrainBlend,terrainTextureBudget} from '../../src/game/render/TerrainBlend.js';
import {PBRLibrary} from '../../src/game/render/PBRLibrary.js';

const layers=Object.fromEntries(['rock','gravel','cracked'].map(name=>[name,{color:new THREE.Texture(),normal:new THREE.Texture(),arm:new THREE.Texture(),tileMeters:[2,2]}]));
function compile(limit){
 const material=new THREE.MeshStandardMaterial();
 applyTerrainBlend(material,layers,limit);
 const shader={uniforms:{},vertexShader:THREE.ShaderLib.standard.vertexShader,fragmentShader:THREE.ShaderLib.standard.fragmentShader};
 material.onBeforeCompile(shader);
 return {material,shader};
}

it('o solo cabe em 16 samplers inclusive com sombras, ambiente e DFG do Three',()=>{
 const {shader,material}=compile(16),budget=terrainTextureBudget(16);
 const layerSamplers=[...shader.fragmentShader.matchAll(/uniform sampler2D aurora_\w+;/g)];
 expect(budget.baseSamplers+layerSamplers.length).toBe(16);
 expect(budget.colors).toEqual(['rock','gravel','cracked']);
 expect(budget.normals).toEqual(budget.colors);
 expect(shader.uniforms.aurora_crackedNormal.value).toBe(layers.cracked.normal);
 expect(shader.fragmentShader).not.toContain('aurora_crackedRough');
 // The normal and colour remain; roughness falls back to the ground's PBR map.
 expect(shader.fragmentShader).toContain('#include <roughnessmap_fragment>');
 expect(material.userData.terrainBlendBudget).toEqual(budget);
 material.dispose();
});

it('preserva nove mapas adicionais quando a GPU comporta os 17 samplers totais',()=>{
 const {shader,material}=compile(32);
 expect(terrainTextureBudget(32).totalSamplers).toBe(17);
 expect(shader.uniforms.aurora_crackedRough.value).toBe(layers.cracked.arm);
 const compact=compile(16);
 expect(material.customProgramCacheKey()).not.toBe(compact.material.customProgramCacheKey());
 material.dispose();compact.material.dispose();
});

it('limite desconhecido usa o mínimo WebGL2 e orçamento reduz sem exceder capacidade',()=>{
 expect(terrainTextureBudget(undefined)).toEqual(terrainTextureBudget(16));
 for(const limit of [11,12,13,14,15,16,17,32])expect(terrainTextureBudget(limit).totalSamplers).toBeLessThanOrEqual(limit);
});

it('o carregador usa a capacidade real e mantém o orçamento ao trocar a qualidade',async()=>{
 for(const limit of [16,32]){
  const textures=[],materials=Object.fromEntries(['ground','rock','shoulder'].map(role=>[role,new THREE.MeshStandardMaterial()]));
  const entries=Object.fromEntries(['dirt','rocky_terrain_03','gravel_road','mud_cracked_dry_03'].map(id=>[id,{id,status:'installed',normalConvention:'OpenGL',maps:Object.fromEntries(['color','normal','roughness'].map(kind=>[kind,{url:`/${id}-${kind}`}]))}]));
  const assets={renderer:{capabilities:{maxTextures:limit}},errors:[],json:async()=>({assets:entries}),texture:async()=>{const t=new THREE.Texture();textures.push(t);return t;},pruneTextures:()=>{}};
  const pbr=new PBRLibrary(assets,materials,'baixo');
  try{
   await pbr.load();expect(pbr.blended).toBe(true);
   const before=materials.ground.userData.terrainBlendBudget;
   expect(before.maxTextures).toBe(limit);expect(before.totalSamplers).toBe(limit===16?16:17);
   await pbr.setQuality('alto');expect(materials.ground.userData.terrainBlendBudget).toEqual(before);expect(assets.errors).toEqual([]);
  }finally{textures.forEach(t=>t.dispose());Object.values(materials).forEach(m=>m.dispose());}
 }
});

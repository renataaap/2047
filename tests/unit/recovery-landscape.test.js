import {test,expect} from 'vitest';
import * as THREE from 'three';
import {planVegetationCell,vegetationAllowed,vegetationFingerprint} from '../../src/game/restoration/placement.js';
import {NETWORK_EDGES,PAVED_AREAS} from '../../src/game/navigation/roadIndex.js';
import {indexedSurfaceHeight} from '../../src/game/restoration/surfaceSampler.js';
import {terrainGeometry} from '../../src/game/world/terrainGeometry.js';
import {meshHeightAt} from '../../src/game/world/surfaceHeight.js';
import {woodyPlantGeometry,grassGeometry} from '../../src/game/restoration/vegetationGeometry.js';
import {applyRecoveryTerrain,updateRecoveryTerrain} from '../../src/game/restoration/RestorationTerrain.js';
import {applyTerrainBlend} from '../../src/game/render/TerrainBlend.js';
import {roadAccessFixture} from '../helpers/road-access-fixture.js';
import {anchor} from '../../src/game/missions/network.js';

test('vegetação determinística acompanha a superfície e mantém identidade ao regenerar setor',()=>{
 const sample=(x,z)=>x*.02+z*.005,a=planVegetationCell(0,-12,sample),b=planVegetationCell(0,-12,sample);
 expect(a.length).toBeGreaterThan(500);expect(a).toEqual(b);expect(vegetationFingerprint(a)).toBe(vegetationFingerprint(b));
 for(const p of a)expect(p.y).toBe(sample(p.x,p.z));
 expect(new Set(a.map(p=>p.kind))).toEqual(new Set(['grass','shrub','tree']));
 expect(vegetationFingerprint(a)).not.toBe(vegetationFingerprint(planVegetationCell(1,-12,sample)));
});
test('exclusão percorre o grafo inteiro, inclusive ruas curvas e acesso à garagem',()=>{
 for(const e of NETWORK_EDGES)for(const p of e.samples.filter((_,i)=>i%5===0))for(const kind of ['grass','shrub','tree'])expect(vegetationAllowed(p.x,p.z,kind,()=>0),`${e.id}/${kind}`).toBe(false);
 for(const p of PAVED_AREAS)expect(vegetationAllowed(p.x,p.z,'tree',()=>0)).toBe(false);
 for(const [x,z]of [[-320,-822],[-320,-800],[24,-2890],[23,-2882],[-13,22]])expect(vegetationAllowed(x,z,'grass',()=>0)).toBe(false);
});
test('raízes evitam encostas instáveis e objetos físicos, sem reservas aleatórias por sessão',()=>{
 expect(vegetationAllowed(150,-2890,'tree',(x)=>x*2)).toBe(false);
 const clean=planVegetationCell(0,-12,()=>0),blocked=planVegetationCell(0,-12,()=>0,()=>true);
 expect(clean.length).toBeGreaterThan(0);expect(blocked).toEqual([]);
});
test('biomas têm densidades e silhuetas próprias, incluindo sal e altitude',()=>{
 const counts=[-12,-47,-58].map(z=>planVegetationCell(1,z,()=>0).length);
 expect(counts[0]).toBeGreaterThan(counts[1]);expect(counts[0]).toBeGreaterThan(counts[2]);
 const shapes=['ashes','cities','salt','glass','storm'].map(region=>{const g=woodyPlantGeometry(region);try{return {height:g.height,form:g.form,vertices:g.wood.attributes.position.count};}finally{g.wood.dispose();g.leaves.dispose();}});
 expect(new Set(shapes.map(p=>p.form)).size).toBe(5);expect(shapes[0].height).toBeGreaterThan(shapes[3].height);
});
test('consulta espacial usa exatamente os triângulos do terreno, sem deslocar geometria',()=>{
 for(const [cx,cz]of [[0,-3],[-1,-1],[0,-14]]){const g=terrainGeometry(cx,cz),original=g.attributes.position.array.slice();try{for(let i=0;i<32;i++){const x=cx*1024-470+(i*137%940),z=cz*1024-470+(i*79%940);expect(indexedSurfaceHeight(g,x,z)).toBeCloseTo(meshHeightAt(g,x,z),8);}expect(g.attributes.position.array).toEqual(original);expect(indexedSurfaceHeight(g,99999,99999)).toBeNull();}finally{g.dispose();}}
});
test('árvore possui tronco, ramos e folhas tridimensionais; LOD reduz triângulos',()=>{
 const full=woodyPlantGeometry('ashes','tree',2),far=woodyPlantGeometry('ashes','tree',-1),nearGrass=grassGeometry('ashes',0),farGrass=grassGeometry('ashes',0,true);
 try{expect(full.wood.boundingBox.min.y).toBeCloseTo(0,1);expect(full.wood.boundingBox.max.y).toBeGreaterThan(3);expect(full.leaves.boundingBox.max.z-full.leaves.boundingBox.min.z).toBeGreaterThan(1);expect(far.leaves.index.count).toBeLessThan(full.leaves.index.count/2);expect(farGrass.index.count).toBeLessThan(nearGrass.index.count/2);expect(full.wood.getAttribute('uv')).toBeTruthy();}finally{for(const g of [full.wood,full.leaves,far.wood,far.leaves,nearGrass,farGrass])g.dispose();}
});
function compile(m){const s={uniforms:{},vertexShader:THREE.ShaderLib.standard.vertexShader,fragmentShader:THREE.ShaderLib.standard.fragmentShader};m.onBeforeCompile(s);return s;}
test('solo recuperado não acrescenta sampler nem varying ao TerrainBlend de 16 unidades',()=>{
 const m=new THREE.MeshStandardMaterial(),maps=Object.fromEntries(['rock','gravel','cracked'].map(n=>[n,{color:null,normal:null,arm:null,tileMeters:[2,2]}]));
 applyTerrainBlend(m,maps,16);const before=compile(m);applyRecoveryTerrain(m);const after=compile(m);
 expect((after.fragmentShader.match(/uniform sampler2D/g)||[]).length).toBe((before.fragmentShader.match(/uniform sampler2D/g)||[]).length);
 expect(after.vertexShader.match(/varying vec3/g).length).toBe(before.vertexShader.match(/varying vec3/g).length);
 expect(after.fragmentShader.indexOf('recoveryCover')).toBeGreaterThan(after.fragmentShader.indexOf('diffuseColor.rgb = mix'));
 expect(m.userData.terrainBlendBudget.totalSamplers).toBe(16);expect(m.userData.recoveryTerrain.extraVaryings).toBe(0);m.dispose();
});
test('programas de solo reutilizados recebem o progresso vivo após recarga e troca de qualidade',()=>{
 const m=new THREE.MeshStandardMaterial(),c=roadAccessFixture('core-1').data.campaign;applyRecoveryTerrain(m);const first=compile(m),slot=first.uniforms.auroraRecovery;
 anchor(c,'core-1');c.world.recovery.cores['core-1'].age=120;updateRecoveryTerrain(m,c);expect(slot.value[0].z).toBe(120);const key=m.customProgramCacheKey();
 applyRecoveryTerrain(m);const next=compile(m);expect(next.uniforms.auroraRecovery).toBe(slot);expect(m.customProgramCacheKey()).toBe(key);expect(next.fragmentShader.match(/uniform vec4 auroraRecovery/g)).toHaveLength(1);
 c.world.recovery.cores['core-1'].age=240;updateRecoveryTerrain(m,c);expect(first.uniforms.auroraRecovery.value[0].z).toBe(240);m.dispose();
});

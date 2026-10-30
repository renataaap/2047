import {it,expect} from 'vitest';
import * as THREE from 'three';
import {PBRLibrary} from '../../src/game/render/PBRLibrary.js';

function fixture(ownConcrete=false){
 const cache=new Map(),disposed=new Set();
 const entry=id=>({id,status:'installed',normalConvention:'OpenGL',maps:Object.fromEntries(['color','normal','roughness'].map(kind=>[kind,{url:`/assets/test/${id}/baixo-${kind}`,variants:Object.fromEntries(['baixo','alto'].map(q=>[q,{url:`/assets/test/${id}/${q}-${kind}`}]))}]))});
 const definitions={rocky_terrain_03:entry('rocky_terrain_03')};if(ownConcrete)definitions.cracked_concrete_02=entry('cracked_concrete_02');
 const assets={disposed:false,errors:[],json:async()=>({assets:definitions}),texture:async url=>{if(!cache.has(url)){const t=new THREE.Texture();t.name=url;t.addEventListener('dispose',()=>disposed.add(t));cache.set(url,t);}return cache.get(url);},pruneTextures:keep=>{for(const [url,t]of cache)if(!keep.has(t)){t.dispose();cache.delete(url);}}};
 const materials={rock:new THREE.MeshStandardMaterial(),concrete:new THREE.MeshStandardMaterial()},pbr=new PBRLibrary(assets,materials,'baixo');
 // This is the ambient concrete's dependency; these are original test textures.
 materials.concrete.userData.dataMapsFrom='rock';
 return {pbr,materials,cache,disposed,dispose(){for(const t of cache.values())t.dispose();for(const m of Object.values(materials))m.dispose();}};
}

it('mudanças de qualidade atualizam dados emprestados antes de descartar texturas antigas',async()=>{
 const f=fixture();try{
  await f.pbr.load();const {rock,concrete}=f.materials,first=rock.normalMap;
  expect(concrete.normalMap).toBe(first);expect(concrete.roughnessMap).toBe(rock.roughnessMap);
  for(const quality of ['alto','baixo','alto']){
   const previous=rock.normalMap;await f.pbr.setQuality(quality);
   expect(concrete.normalMap).toBe(rock.normalMap);expect(concrete.roughnessMap).toBe(rock.roughnessMap);
   expect(f.disposed.has(previous)).toBe(true);expect(f.disposed.has(concrete.normalMap)).toBe(false);expect(f.disposed.has(concrete.roughnessMap)).toBe(false);expect(f.cache.size).toBe(3);
  }
  expect(concrete.normalMap).not.toBe(first);expect(f.pbr.assets.errors).toEqual([]);
 }finally{f.dispose();}
});

it('mapas próprios de concreto instalado têm prioridade sobre dados emprestados',async()=>{
 const f=fixture(true);try{
  await f.pbr.load();for(const quality of ['alto','baixo']){
   await f.pbr.setQuality(quality);const {rock,concrete}=f.materials;
   expect(concrete.userData.polyhaven).toBe('cracked_concrete_02');expect(concrete.normalMap).not.toBe(rock.normalMap);expect(concrete.normalMap.name).toContain(`/cracked_concrete_02/${quality}-normal`);expect(f.disposed.has(concrete.normalMap)).toBe(false);expect(f.cache.size).toBe(6);
  }
 }finally{f.dispose();}
});

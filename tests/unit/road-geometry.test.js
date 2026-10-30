import { describe,it,expect,beforeAll } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import { roadRibbon } from '../../src/game/world/roadGeometry.js';
import { roadX,roadHeight,detourX,surfaceAt } from '../../src/game/world/terrain.js';
import { terrainGeometry } from '../../src/game/world/terrainGeometry.js';
beforeAll(async()=>RAPIER.init());
describe('segmentos de rodovia e acostamentos',()=>{
 it('classifica cascalho apenas no acostamento construído da rodovia',()=>{expect(surfaceAt(6,-100)).toBe('cascalho');expect(surfaceAt(0,85)).toBe('terra');expect(surfaceAt(detourX(-1000)+6,-1000)).toBe('terra');});
 it('usa metros nos UVs e mantém largura contínua ao conectar segmentos',()=>{
  const a=roadRibbon({start:-240,end:-120,center:roadX}),b=roadRibbon({start:-120,end:0,center:roadX});
  const p=a.attributes.position,q=b.attributes.position;for(let i=0;i<2;i++)for(let axis=0;axis<3;axis++)expect(p.array[(p.count-2+i)*3+axis]).toBeCloseTo(q.array[i*3+axis],5);
  expect(Math.abs(a.attributes.uv.getX(0)-a.attributes.uv.getX(1))).toBe(10);expect(a.attributes.normal.getY(0)).toBeGreaterThan(.95);a.dispose();b.dispose();
 });
 it('a superfície de renderização é a mesma atingida pelo raio físico, incluindo acostamento',()=>{
  const world=new RAPIER.World({x:0,y:-9.81,z:0});const road=roadRibbon({start:-120,end:0,center:roadX}),shoulder=roadRibbon({start:-120,end:0,center:roadX,side:1});
  for(const g of [road,shoulder])world.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(g.attributes.position.array),new Uint32Array(g.index.array)));world.step();
  for(const x of [0,6.5]){const hit=world.castRay(new RAPIER.Ray({x,y:20,z:-60},{x:0,y:-1,z:0}),50,true);expect(hit).not.toBeNull();expect(20-hit.timeOfImpact).toBeCloseTo(roadHeight(-60)+(x===0?.09:.055),1);}
  world.free();road.dispose();shoulder.dispose();
 });
 it('o terreno refinado permanece abaixo da rodovia no trecho que atravessava a pista',()=>{
  const world=new RAPIER.World({x:0,y:-9.81,z:0}),ground=terrainGeometry(0,0),road=roadRibbon({start:-512,end:80,center:roadX});
  world.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(ground.attributes.position.array),new Uint32Array(ground.index.array)));
  const pavement=world.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(road.attributes.position.array),new Uint32Array(road.index.array)));world.step();
  for(let z=-210;z<-100;z+=3)for(const offset of [-4,0,4]){const hit=world.castRay(new RAPIER.Ray({x:roadX(z)+offset,y:20,z},{x:0,y:-1,z:0}),50,true);expect(hit?.collider.handle).toBe(pavement.handle);}
  world.free();ground.dispose();road.dispose();
 });
});

import {meshHeightAt} from '../../src/game/world/surfaceHeight.js';
import {heightAt} from '../../src/game/world/terrain.js';
import {Player} from '../../src/game/player/Player.js';
it('spawn na Cordilheira usa o triângulo físico, não a altura analítica três metros abaixo',()=>{
 const world=new RAPIER.World({x:0,y:-9.81,z:0}),g=terrainGeometry(0,-12),x=-47,z=-12783,surface=meshHeightAt(g,x,z);world.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(g.attributes.position.array),new Uint32Array(g.index.array)));world.step();const hit=world.castRay(new RAPIER.Ray({x,y:100,z},{x:0,y:-1,z:0}),200,true);expect(100-hit.timeOfImpact).toBeCloseTo(surface,3);expect(surface-heightAt(x,z)).toBeGreaterThan(3);
 const player=new Player(world,(px,pz)=>meshHeightAt(g,px,pz));player.teleport(x,z);for(let i=0;i<240;i++){player.update({},1/60,{x:-44,z});world.step();}expect(player.body.translation().y).toBeGreaterThan(surface+.8);expect(player.body.translation().y).toBeLessThan(surface+1.2);player.teleport(x,z,surface+4);expect(player.body.translation().y).toBeCloseTo(surface+4,4);player.dispose();world.free();g.dispose();
});

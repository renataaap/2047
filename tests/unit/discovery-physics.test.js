import {it,expect,vi,beforeAll,afterEach} from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import {DISCOVERY_SITES} from '../../src/data/ambience.js';
import {DiscoveryWorld} from '../../src/game/world/DiscoveryWorld.js';
import {terrainGeometry} from '../../src/game/world/terrainGeometry.js';
import {meshHeightAt} from '../../src/game/world/surfaceHeight.js';
import {heightAt,roadX} from '../../src/game/world/terrain.js';
import {Player} from '../../src/game/player/Player.js';
beforeAll(()=>RAPIER.init());afterEach(()=>vi.unstubAllGlobals());
for(const p of DISCOVERY_SITES)it(`${p.name}: rampa e entrada alcançam a inspeção com cápsula física`,()=>{
 vi.stubGlobal('document',{createElement:()=>({getContext:()=>({fillRect(){},strokeRect(){},fillText(){}})})});
 const physics=new RAPIER.World({x:0,y:-9.81,z:0}),terrain=terrainGeometry(0,Math.round(p.z/1024));physics.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(terrain.attributes.position.array),new Uint32Array(terrain.index.array)));
 const groundHeight=(x,z)=>meshHeightAt(terrain,x,z)??heightAt(x,z),m=new Proxy({}, {get:(target,k)=>target[k]??(target[k]=new THREE.MeshStandardMaterial())}),world=new DiscoveryWorld(new THREE.Scene(),physics,m,{groundHeight},null,{}),b=world.build(p);world.live.set(p.id,b);
 const player=new Player(physics,(x,z)=>world.surfaceHeight(x,z)??groundHeight(x,z));player.teleport(p.x,p.z+p.depth/2+8.2);
 for(const [x,z] of [[p.x,p.z+p.depth/2-.6],[p.terminal.x,p.z+p.depth/2-.6],[p.terminal.x,p.terminal.z]]){
  for(let i=0;i<900;i++){const pos=player.body.translation(),dx=x-pos.x,dz=z-pos.z,d=Math.hypot(dx,dz);if(d<.4)break;player.update({x:dx/d,z:dz/d},1/60,{x:roadX(p.z),z:p.z+20});physics.step();}
  const pos=player.body.translation();expect(Math.hypot(pos.x-x,pos.z-z)).toBeLessThan(.45);
 }
 expect(player.body.translation().y).toBeGreaterThan(b.floor+.8);player.dispose();world.dispose();expect(physics.bodies.len()).toBe(0);physics.free();terrain.dispose();Object.values(m).forEach(material=>material.dispose());
});

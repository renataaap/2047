import {it,expect,vi,beforeAll,afterEach} from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import {PropBatch} from '../../src/game/world/PropBatch.js';
import {furnishHome} from '../../src/game/world/decorCompositions.js';
beforeAll(()=>RAPIER.init());afterEach(()=>vi.unstubAllGlobals());
it('mobiliário mantém caminho físico do tutorial e libera todos os corpos',()=>{
 vi.stubGlobal('document',{createElement:()=>({getContext:()=>({fillRect(){},strokeRect(){},fillText(){}})})});
 const physics=new RAPIER.World({x:0,y:-9.81,z:0}),m=new Proxy({}, {get:(target,k)=>target[k]??(target[k]=new THREE.MeshStandardMaterial())}),labels=new Map(),b=new PropBatch(physics,m,{x:-13,y:0,z:22});
 furnishHome(b,labels);b.finish();physics.step();expect(b.bodies.length).toBeGreaterThan(5);expect(b.group.children.length).toBeLessThan(14);
 for(const [x,z]of [[-13,22],[-13,18],[-11.3,21.2],[-14.7,21.2],[-12,18.95],[-10,18.95],[-8.2,18.95]])expect(physics.intersectionWithShape({x,y:.92,z},{x:0,y:0,z:0,w:1},new RAPIER.Capsule(.55,.32))).toBeNull();
 b.dispose();expect(physics.bodies.len()).toBe(0);for(const material of Object.values(m))material.dispose();for(const material of labels.values()){material.map.dispose();material.dispose();}physics.free();
});

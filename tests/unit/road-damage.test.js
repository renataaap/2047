import {it,expect,beforeAll} from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import {roadRibbon} from '../../src/game/world/roadGeometry.js';
import {terrainGeometry} from '../../src/game/world/terrainGeometry.js';
import {roadX,roadHeight} from '../../src/game/world/terrain.js';
import {meshHeightAt} from '../../src/game/world/surfaceHeight.js';
beforeAll(()=>RAPIER.init());
it('buraco tem profundidade física; terreno não preenche a depressão nem muda o treino',()=>{
 const physics=new RAPIER.World({x:0,y:-9.81,z:0}),ground=terrainGeometry(0,0),road=roadRibbon({start:-360,end:-280,center:roadX,damaged:true});
 physics.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(ground.attributes.position.array),new Uint32Array(ground.index.array)));const pavement=physics.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(road.attributes.position.array),new Uint32Array(road.index.array)));physics.step();
 const x=roadX(-322)+2.5,h=meshHeightAt(road,x,-322);expect(roadHeight(-322)+.09-h).toBeGreaterThan(.15);
 expect(road.attributes.position.count).toBeLessThan(550);
 for(let z=-325;z<=-319;z+=.5)for(let offset=0;offset<=4.5;offset+=.5){const px=roadX(z)+offset,hit=physics.castRay(new RAPIER.Ray({x:px,y:20,z},{x:0,y:-1,z:0}),50,true);expect(hit?.collider.handle).toBe(pavement.handle);expect(20-hit.timeOfImpact).toBeCloseTo(meshHeightAt(road,px,z),3);}
 const training=roadRibbon({start:-80,end:0,center:roadX,damaged:true});expect(training.attributes.position.count).toBe(42);training.dispose();physics.free();ground.dispose();road.dispose();
});

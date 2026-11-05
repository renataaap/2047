import {test,expect,vi,beforeAll} from 'vitest';
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import {roadAccessFixture} from '../helpers/road-access-fixture.js';
import {anchor} from '../../src/game/missions/network.js';
import {observeRecovery,stepRecovery} from '../../src/game/restoration/progress.js';
import {RestorationVegetation} from '../../src/game/restoration/RestorationVegetation.js';
import {RestorationCinematic} from '../../src/game/restoration/RestorationCinematic.js';
import {discoveryEntries} from '../../src/game/world/discoveryJournal.js';
import {ecologicalSoundMix} from '../../src/game/audio/AmbientAudio.js';
beforeAll(async()=>RAPIER.init());
const campaign=()=>{const c=roadAccessFixture('core-1').data.campaign;anchor(c,'core-1');return c;};
function fakeGame(c){const physics=new RAPIER.World({x:0,y:-9.81,z:0}),camera=new THREE.PerspectiveCamera(64);camera.position.set(23,3,-2882);return {campaign:c,physics,rendering:{camera},world:{recoveryHeight:()=>0},state:{mode:'paused',resumeMode:'walking',overlay:'core'},input:{setContext:vi.fn()},audio:{pause:vi.fn()},ambientAudio:{setPaused:vi.fn()},loop:{reset:vi.fn()},player:{body:physics.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(23,1,-2882))},cameras:{initial:false}};}

test('cinemática termina e devolve câmera, contexto e controle sem avançar campanha ou relógio',()=>{
 const c=campaign(),g=fakeGame(c),movie=new RestorationCinematic(g),before=structuredClone(c),pose=g.rendering.camera.position.clone();
 try{expect(movie.queue('core-1')).toBe(true);expect(movie.queue('core-1')).toBe(false);expect(movie.begin()).toBe(true);expect(g.state.mode).toBe('cinematic');for(let i=0;i<30;i++)movie.update(.25);expect(movie.active).toBe(false);expect(g.state.mode).toBe('walking');expect(g.rendering.camera.position.equals(pose)).toBe(true);expect(c.inventory).toEqual(before.inventory);expect(c.network.clock).toBe(before.network.clock);expect(c.world.recovery.cores['core-1'].age).toBe(0);expect(c.world.recovery.cores['core-1'].cinematicSeen).toBe(true);expect(movie.queue('core-1')).toBe(false);}finally{g.physics.free();}
});
test('pular é idempotente e uma recarga não agenda apresentação novamente',()=>{
 const c=campaign(),g=fakeGame(c),m=new RestorationCinematic(g);try{m.queue('core-1');m.begin();expect(m.finish(true)).toBe(true);expect(m.finish(true)).toBe(false);expect(g.input.setContext).toHaveBeenLastCalledWith('walking');const reloaded=new RestorationCinematic({...g,campaign:structuredClone(c)});expect(reloaded.pending).toBeNull();expect(reloaded.queue('core-1')).toBe(false);}finally{g.physics.free();}
});
test('redução de movimento mantém o enquadramento e reduz a apresentação',()=>{
 vi.stubGlobal('matchMedia',()=>({matches:true}));const g=fakeGame(campaign()),m=new RestorationCinematic(g),pose=g.rendering.camera.position.clone();try{m.queue('core-1');m.begin();m.update(.8);expect(m.duration).toBe(1.8);expect(g.rendering.camera.position.equals(pose)).toBe(true);m.update(1);expect(g.state.mode).toBe('walking');}finally{g.physics.free();vi.unstubAllGlobals();}
});
test('diário deduplica observações e áudio acompanha estágio e horário sem fauna no deserto morto',()=>{
 const c=roadAccessFixture('core-1').data.campaign,p={x:24,z:-2890};expect(ecologicalSoundMix(c,p).fauna).toBe(0);anchor(c,'core-1');expect(ecologicalSoundMix(c,p).fauna).toBe(0);observeRecovery(c,p);stepRecovery(c,60);observeRecovery(c,p);observeRecovery(c,p);const entries=discoveryEntries(c);expect(entries.filter(e=>e.id.startsWith('nature:'))).toHaveLength(2);expect(new Set(entries.map(e=>e.id)).size).toBe(entries.length);const day=ecologicalSoundMix(c,p);expect(day.fauna).toBeGreaterThan(0);expect(day.water).toBeGreaterThan(0);c.world.daySeconds=22*3600;expect(ecologicalSoundMix(c,p).night).toBe(true);expect(ecologicalSoundMix(c,p).fauna).toBeLessThan(day.fauna);expect(ecologicalSoundMix(c,{x:24,z:-7200}).fauna).toBe(0);
});
test('setores mantêm matrizes maduras estáveis, regeneram sem duplicar e liberam corpos/meshes próprios',()=>{
 const physics=new RAPIER.World({x:0,y:-9.81,z:0}),scene=new THREE.Scene(),c=campaign(),v=new RestorationVegetation(scene,physics,{recoveryHeight:()=>0}),p={x:110,y:2,z:-2890};c.world.recovery.cores['core-1'].age=240;
 try{for(let i=0;i<500;i++){v.update(c,p,'baixo',.016);if(!v.pendingCells&&v.cells.size)break;}const full=v.snapshot(),keys={...full.fingerprints};expect(full.grass).toBeGreaterThan(100);expect(full.trees).toBeGreaterThan(0);for(let i=0;i<30;i++)v.update(c,p,'baixo',.016);expect(v.snapshot().matrixUpdates).toBe(full.matrixUpdates);expect(v.snapshot().total).toBe(full.total);expect(v.colliders.size).toBeLessThanOrEqual(12);v.reset();expect(scene.children).toHaveLength(0);expect(v.colliders.size).toBe(0);for(let i=0;i<500;i++){v.update(c,p,'baixo',0);if(!v.pendingCells&&v.cells.size)break;}expect(v.snapshot().fingerprints).toEqual(keys);expect(v.snapshot().total).toBe(full.total);v.update(c,{x:10000,y:2,z:-10000},'baixo',0);expect(v.cells.size).toBe(0);}finally{v.dispose();expect(scene.children).toHaveLength(0);expect(v.geometry.size).toBe(0);expect(v.materials.size).toBe(0);physics.free();}
});

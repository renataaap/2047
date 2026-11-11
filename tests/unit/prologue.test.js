import {test,expect,vi,afterEach} from 'vitest';
import * as THREE from 'three';
import {CUTSCENES,CutscenePlayer,validCutscene} from '../../src/game/narrative/cutscene.js';
import {PROLOGUE,PROLOGUE_SECONDS} from '../../src/game/narrative/cutscenes/prologue.js';
import {validStory} from '../../src/game/narrative/story.js';
import {SPEAKERS} from '../../src/data/story.js';

function fakeGame(campaign={}){
 const camera=new THREE.PerspectiveCamera(64);camera.position.set(-3,2,5);camera.updateProjectionMatrix();
 return {campaign,rendering:{camera,renderer:{toneMappingExposure:1}},state:{mode:'walking',resumeMode:'walking',overlay:null},
  input:{setContext:vi.fn()},audio:{pause:vi.fn()},ambientAudio:{setPaused:vi.fn(),cue:vi.fn()},loop:{reset:vi.fn()},
  player:{body:{translation:()=>({x:-3,y:1,z:5})},view:'first'},cameras:{},emit:vi.fn(),world:{groundHeight:()=>0}};
}
afterEach(()=>vi.unstubAllGlobals());

test('prólogo registrado, válido, ~40 s e sem a identidade da Voz nas falas',()=>{
 expect(CUTSCENES['prologue-2027']).toBe(PROLOGUE);expect(validCutscene(PROLOGUE)).toBe(true);
 expect(PROLOGUE_SECONDS).toBeGreaterThanOrEqual(30);expect(PROLOGUE_SECONDS).toBeLessThanOrEqual(45);
 const speakers=PROLOGUE.shots.filter(s=>s.caption).map(s=>s.caption.speaker);
 expect(speakers).not.toContain('voice');for(const k of speakers)expect(Object.hasOwn(SPEAKERS,k)).toBe(true);
 expect(PROLOGUE.shots.some(s=>s.card?.kicker==='2047')).toBe(true);
});

test('assistir o prólogo inteiro grava 2027 e 2047, devolve câmera e não repete',()=>{
 const g=fakeGame(),p=new CutscenePlayer(g),pose=g.rendering.camera.position.toArray();
 expect(p.queue('prologue-2027')).toBe(true);p.begin();
 const tones=new Set();for(let t=0;t<PROLOGUE_SECONDS+1;t+=.5){p.update(.5);if(g.state.cutscene?.tone)tones.add(g.state.cutscene.tone);}
 expect([...tones]).toEqual(['clean','odd','plasma','tunnel','black','ash']);
 expect(g.state.mode).toBe('walking');expect(g.rendering.camera.position.toArray()).toEqual(pose);
 expect(g.campaign.story.scenes).toEqual({'prologue-2027':'watched','intro-2047':'watched'});expect(validStory(g.campaign.story)).toBe(true);
 expect(p.queue('prologue-2027')).toBe(false);
});

test('pular no meio grava as duas cenas como puladas e chega ao mesmo estado',()=>{
 const g=fakeGame(),p=new CutscenePlayer(g);p.queue('prologue-2027');p.begin();p.update(12);
 expect(g.state.cutscene.tone).toBe('odd');p.skip();
 expect(g.state.mode).toBe('walking');expect(g.state.cutscene).toBeNull();
 expect(g.campaign.story.scenes).toEqual({'prologue-2027':'skipped','intro-2047':'skipped'});
});

test('redução de movimento mostra só a cartela 2047, curta e sem áudio',()=>{
 vi.stubGlobal('matchMedia',()=>({matches:true}));
 const g=fakeGame(),p=new CutscenePlayer(g),pose=g.rendering.camera.position.toArray();p.queue('prologue-2027');p.begin();
 expect(p.duration).toBe(2.4);expect(g.state.cutscene).toMatchObject({tone:'black',card:{kicker:'2047',text:'Vinte anos depois'},caption:null,reduced:true});
 expect(g.ambientAudio.cue).not.toHaveBeenCalled();p.update(1);expect(g.rendering.camera.position.toArray()).toEqual(pose);
 p.update(2);expect(g.state.mode).toBe('walking');expect(g.campaign.story.scenes['intro-2047']).toBe('watched');
});

test('save com o prólogo já registrado não o enfileira de novo',()=>{
 const campaign={story:{version:1,scenes:{'prologue-2027':'skipped','intro-2047':'skipped'},choices:{},radio:[],anchors:{}}};
 expect(new CutscenePlayer(fakeGame(campaign)).queue('prologue-2027')).toBe(false);
});

test('reducedShot fora do intervalo invalida a cena',()=>{
 expect(validCutscene({...PROLOGUE,reducedShot:99})).toBe(false);expect(validCutscene({...PROLOGUE,reducedShot:1.5})).toBe(false);
});

// --- Set próprio de 2027 (montado/descartado pelo prólogo) ---
import {buildPrologueSet,SET_ORIGIN} from '../../src/game/narrative/cutscenes/Prologue2027Set.js';
function sceneGame(){
 const g=fakeGame(),shared=new THREE.MeshStandardMaterial(),sky=new THREE.Mesh(new THREE.BoxGeometry(),shared),dust=new THREE.Points();
 const scene=new THREE.Scene();scene.add(sky,dust);g.rendering.scene=scene;g.rendering.sky=sky;g.rendering.dust=dust;shared.dispose=vi.fn();return {g,scene,sky,dust,shared};
}
const setIn=scene=>scene.children.find(o=>o.name==='prologue-2027-set');

test('set de 2027 é isolado: longe do mundo, sem névoa da cena, com céu próprio e tráfego',()=>{
 const set=buildPrologueSet();
 try{
  expect(SET_ORIGIN.y).toBeGreaterThanOrEqual(1000);expect(set.group.visible).toBe(false);
  const mats=new Set();let meshes=0,cars=0;set.group.traverse(o=>{if(o.material){meshes++;[].concat(o.material).forEach(m=>mats.add(m));}if(o.isGroup&&o!==set.group)cars++;});
  for(const m of mats)expect(m.fog).toBe(false);
  expect(cars).toBeGreaterThanOrEqual(5);expect(meshes).toBeLessThan(140);// cena pequena; árvores, postes e faixas instanciados
  const box=new THREE.Box3().setFromObject(set.group);expect(box.max.x-box.min.x).toBeLessThanOrEqual(2*300+1);// tudo dentro da cúpula
 }finally{set.dispose();}
});

test('prólogo mostra o set só em 2027, esconde céu/poeira do jogo e restaura ao chegar em 2047',()=>{
 const {g,scene,sky,dust}=sceneGame(),p=new CutscenePlayer(g);p.queue('prologue-2027');p.begin();
 const set=setIn(scene);expect(set).toBeTruthy();
 p.update(1);expect(set.visible).toBe(true);expect(sky.visible).toBe(false);expect(dust.visible).toBe(false);
 while(g.state.cutscene?.tone!=='black')p.update(.5);
 expect(set.visible).toBe(false);expect(sky.visible).toBe(true);expect(dust.visible).toBe(true);
 p.update(60);expect(setIn(scene)).toBeUndefined();expect(g.state.mode).toBe('walking');
});

test('pular ou abortar desmonta o set e libera só os recursos dele, nunca os do jogo',()=>{
 for(const end of ['skip','reset']){
  const {g,scene,sky,dust,shared}=sceneGame(),p=new CutscenePlayer(g),before=scene.children.length;p.queue('prologue-2027');p.begin();p.update(2);
  const owned=[];setIn(scene).traverse(o=>{if(o.geometry)owned.push(vi.spyOn(o.geometry,'dispose'));});
  end==='skip'?p.skip():p.reset();
  expect(setIn(scene)).toBeUndefined();expect(scene.children.length).toBe(before);expect(owned.every(s=>s.mock.calls.length>=1)).toBe(true);
  expect(shared.dispose).not.toHaveBeenCalled();expect(sky.visible).toBe(true);expect(dust.visible).toBe(true);
  expect(g.campaign.story.scenes['prologue-2027']).toBe('skipped');expect(p.set).toBeNull();
 }
});

test('com redução de movimento o set nem é montado',()=>{
 vi.stubGlobal('matchMedia',()=>({matches:true}));
 const {g,scene}=sceneGame(),p=new CutscenePlayer(g);p.queue('prologue-2027');p.begin();
 expect(setIn(scene)).toBeUndefined();p.update(5);expect(g.state.mode).toBe('walking');
});

test('câmeras de 2027 ficam no nível da estrada, dentro da cúpula do set',()=>{
 const {g}=sceneGame(),p=new CutscenePlayer(g),cam=g.rendering.camera;p.queue('prologue-2027');p.begin();
 for(;;){p.update(.25);if(g.state.cutscene?.tone==='black')break;
  const local={x:cam.position.x-SET_ORIGIN.x,y:cam.position.y-SET_ORIGIN.y,z:cam.position.z-SET_ORIGIN.z};
  expect(local.y).toBeGreaterThan(.5);expect(local.y).toBeLessThan(40);expect(Math.hypot(local.x,local.y,local.z)).toBeLessThan(290);}
 p.skip();
});

test('far da câmera cai ao raio da cúpula só durante o set e volta ao valor do perfil',()=>{
 for(const far of [828,2185]){
  const {g}=sceneGame(),cam=g.rendering.camera;cam.far=far;const p=new CutscenePlayer(g);p.queue('prologue-2027');p.begin();
  p.update(1);expect(cam.far).toBe(640);
  while(g.state.cutscene?.tone!=='black')p.update(.5);expect(cam.far).toBe(far);
  p.skip();expect(cam.far).toBe(far);
 }
 const {g}=sceneGame(),cam=g.rendering.camera;cam.far=1495;const p=new CutscenePlayer(g);p.queue('prologue-2027');p.begin();p.update(1);p.skip();expect(cam.far).toBe(1495);
});

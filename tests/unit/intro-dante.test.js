import {test,expect,vi,afterEach} from 'vitest';
import * as THREE from 'three';
import {CUTSCENES,CutscenePlayer,validCutscene} from '../../src/game/narrative/cutscene.js';
import {PROLOGUE,PROLOGUE_SECONDS} from '../../src/game/narrative/cutscenes/prologue.js';
import {INTRO_DANTE,INTRO_DANTE_SECONDS,anchors} from '../../src/game/narrative/cutscenes/intro-dante.js';
import {validStory} from '../../src/game/narrative/story.js';
import {SPEAKERS} from '../../src/data/story.js';

// Story 003: introdução de Dante no barracão e apresentação do Titã ('intro-2047').
const DANTE={x:-13,y:.87,z:22},TRUCK={x:0,z:5};
function fakeGame(campaign={}){
 const camera=new THREE.PerspectiveCamera(64);camera.position.set(DANTE.x,DANTE.y+.62,DANTE.z);camera.updateProjectionMatrix();
 return {campaign,rendering:{camera,renderer:{toneMappingExposure:1}},state:{mode:'walking',resumeMode:'walking',overlay:null},
  input:{setContext:vi.fn()},audio:{pause:vi.fn()},ambientAudio:{setPaused:vi.fn(),cue:vi.fn()},loop:{reset:vi.fn()},
  player:{body:{translation:()=>({...DANTE})},view:'first'},vehicle:{body:{translation:()=>({x:TRUCK.x,y:1,z:TRUCK.z})}},
  playerVisual:{gesture:vi.fn()},cameras:{},emit:vi.fn(),world:{groundHeight:()=>0}};
}
afterEach(()=>vi.unstubAllGlobals());
const play=(p,seconds,step=.25)=>{for(let t=0;t<seconds;t+=step)p.update(step);};

test('introdução registrada, válida, curta (~20 s) e só com falas do Dante',()=>{
 expect(CUTSCENES['intro-2047']).toBe(INTRO_DANTE);expect(validCutscene(INTRO_DANTE)).toBe(true);
 expect(INTRO_DANTE_SECONDS).toBeGreaterThanOrEqual(14);expect(INTRO_DANTE_SECONDS).toBeLessThanOrEqual(24);
 const speakers=INTRO_DANTE.shots.filter(s=>s.caption).map(s=>s.caption.speaker);
 expect(speakers.length).toBeGreaterThanOrEqual(2);for(const k of speakers){expect(k).toBe('dante');expect(Object.hasOwn(SPEAKERS,k)).toBe(true);}
 expect(INTRO_DANTE.shots.some(s=>/Eu dirijo/.test(s.caption?.text||''))).toBe(true);
 expect(PROLOGUE.also).toBeUndefined();// 'intro-2047' deixou de ser carimbo do prólogo
});

test('abertura encadeada: prólogo, depois Dante; termina no mesmo olhar do jogador, sem mover nada',()=>{
 const g=fakeGame(),p=new CutscenePlayer(g),pose=g.rendering.camera.position.toArray(),quat=g.rendering.camera.quaternion.toArray();
 expect(p.queue('prologue-2027')).toBe(true);expect(p.queue('intro-2047')).toBe(true);p.begin();
 play(p,PROLOGUE_SECONDS+.5);expect(g.state.mode).toBe('cinematic');expect(g.state.cutscene.id).toBe('intro-2047');
 const seen=new Set();for(let t=0;t<INTRO_DANTE_SECONDS+1;t+=.25){p.update(.25);if(g.state.cutscene?.tone)seen.add(g.state.cutscene.tone);}
 expect([...seen]).toEqual(['ash','garage']);expect(g.playerVisual.gesture).toHaveBeenCalledWith('interact');
 expect(g.state.mode).toBe('walking');expect(g.rendering.camera.position.toArray()).toEqual(pose);expect(g.rendering.camera.quaternion.toArray()).toEqual(quat);
 expect(g.campaign.story.scenes).toEqual({'prologue-2027':'watched','intro-2047':'watched'});expect(validStory(g.campaign.story)).toBe(true);
 expect(p.queue('intro-2047')).toBe(false);
});

test('cada cena se pula separadamente; o pulo duplo do mesmo gesto não pula a cena encadeada',()=>{
 const g=fakeGame(),p=new CutscenePlayer(g);p.queue('prologue-2027');p.queue('intro-2047');p.begin();p.update(3);
 expect(p.skip()).toBe(true);expect(g.state.cutscene.id).toBe('intro-2047');
 expect(p.skip()).toBe(false);expect(g.state.cutscene.id).toBe('intro-2047');// Enter no botão com foco disparando duas vezes
 p.update(.5);expect(p.skip()).toBe(true);expect(g.state.mode).toBe('walking');
 expect(g.campaign.story.scenes).toEqual({'prologue-2027':'skipped','intro-2047':'skipped'});
});

test('pular a introdução e assisti-la terminam no mesmo estado de controle',()=>{
 const end=watch=>{const g=fakeGame(),p=new CutscenePlayer(g);p.queue('intro-2047');p.begin();if(watch)play(p,INTRO_DANTE_SECONDS+.5);else{p.update(4);p.skip();}
  return {mode:g.state.mode,resume:g.state.resumeMode,overlay:g.state.overlay,cam:g.rendering.camera.position.toArray(),ctx:g.input.setContext.mock.calls.at(-1)[0]};};
 expect(end(false)).toEqual(end(true));
});

test('redução de movimento: câmera parada, só a fala do Dante, curta',()=>{
 vi.stubGlobal('matchMedia',()=>({matches:true}));
 const g=fakeGame(),p=new CutscenePlayer(g),pose=g.rendering.camera.position.toArray();p.queue('intro-2047');p.begin();
 expect(p.duration).toBeLessThanOrEqual(2);expect(g.state.cutscene).toMatchObject({tone:'garage',caption:{speaker:'Dante'},reduced:true});
 p.update(1);expect(g.rendering.camera.position.toArray()).toEqual(pose);expect(g.playerVisual.gesture).not.toHaveBeenCalled();
 p.update(2);expect(g.state.mode).toBe('walking');
});

test('save que já viu a abertura não repete; reset no meio não encadeia a próxima',()=>{
 const campaign={story:{version:1,scenes:{'prologue-2027':'skipped','intro-2047':'watched'},choices:{},radio:[],anchors:{}}};
 const seen=new CutscenePlayer(fakeGame(campaign));expect(seen.queue('prologue-2027')).toBe(false);expect(seen.queue('intro-2047')).toBe(false);
 const g=fakeGame(),p=new CutscenePlayer(g);p.queue('prologue-2027');p.queue('intro-2047');p.begin();p.update(2);p.reset();
 expect(p.active).toBe(false);expect(g.state.mode).toBe('walking');expect(g.campaign.story.scenes).toEqual({'prologue-2027':'skipped'});
});

test('câmeras seguem âncoras vivas (Dante e Titã) e ficam acima do terreno',()=>{
 const g=fakeGame();g.world.groundHeight=(x,z)=>.02*x+.01*z;const an=anchors(g);
 expect(an.dante).toEqual({x:DANTE.x,z:DANTE.z});expect(an.truck).toEqual(TRUCK);
 const p=new CutscenePlayer(g),cam=g.rendering.camera;p.queue('intro-2047');p.begin();
 for(let t=0;t<INTRO_DANTE_SECONDS-1.2;t+=.25){p.update(.25);expect(cam.position.y-g.world.groundHeight(cam.position.x,cam.position.z)).toBeGreaterThan(.5);}
 p.skip();
});

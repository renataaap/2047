import {test,expect,vi,afterEach} from 'vitest';
import * as THREE from 'three';
import {CUTSCENES,CutscenePlayer,validCutscene} from '../../src/game/narrative/cutscene.js';
import {SURVIVOR_ARRIVAL,SURVIVOR_ARRIVAL_SECONDS,survivorPresent,arrivalDue,arrivalPath,ARRIVAL_RADIUS} from '../../src/game/narrative/cutscenes/survivor-arrival.js';
import {validStory} from '../../src/game/narrative/story.js';
import {SPEAKERS} from '../../src/data/story.js';
import {POINTS} from '../../src/data/campaign.js';
import {createCampaign,receiveSeed} from '../../src/game/missions/campaign.js';

// Story 004: chegada da sobrevivente com a primeira Semente ('first-seed').
const S=POINTS.shelter,DANTE={x:S.x+2,y:.9,z:S.z+3};
function fakeGame(campaign=createCampaign(7)){
 const camera=new THREE.PerspectiveCamera(64);camera.position.set(DANTE.x,DANTE.y+.62,DANTE.z);camera.updateProjectionMatrix();
 const scene=new THREE.Scene(),placeholder=new THREE.Group();placeholder.position.set(S.x,0,S.z);scene.add(placeholder);
 return {campaign,rendering:{camera,scene,renderer:{toneMappingExposure:1}},state:{mode:'walking',resumeMode:'walking',overlay:null},
  input:{setContext:vi.fn()},audio:{pause:vi.fn()},ambientAudio:{setPaused:vi.fn(),cue:vi.fn()},loop:{reset:vi.fn()},
  player:{body:{translation:()=>({...DANTE})},view:'first'},vehicle:{body:{translation:()=>({x:0,y:1,z:-54})}},
  features:{npc:placeholder},cameras:{},emit:vi.fn(),world:{groundHeight:()=>0}};
}
afterEach(()=>vi.unstubAllGlobals());
const play=(p,seconds,step=.25)=>{for(let t=0;t<seconds;t+=step)p.update(step);};
const tutorial=(id,status='active')=>({status,step:id?{id}:null});

test('cena registrada, válida, ~20 s, falas da sobrevivente sem a identidade da Voz',()=>{
 expect(CUTSCENES['first-seed']).toBe(SURVIVOR_ARRIVAL);expect(validCutscene(SURVIVOR_ARRIVAL)).toBe(true);
 expect(SURVIVOR_ARRIVAL_SECONDS).toBeGreaterThanOrEqual(16);expect(SURVIVOR_ARRIVAL_SECONDS).toBeLessThanOrEqual(24);
 const caps=SURVIVOR_ARRIVAL.shots.filter(s=>s.caption).map(s=>s.caption);expect(caps.length).toBeGreaterThanOrEqual(3);
 for(const c of caps){expect(c.speaker).toBe('survivor');expect(Object.hasOwn(SPEAKERS,c.speaker)).toBe(true);expect(c.text).not.toMatch(/\bVoz\b/i);}
 expect(caps.some(c=>/Semente de Ignição/.test(c.text))).toBe(true);expect(caps.some(c=>/vibração/.test(c.text))).toBe(true);
});

test('presença: ausente antes da chegada; presente depois da cena (vista ou pulada) ou da Semente',()=>{
 const c=createCampaign(1);expect(survivorPresent(c)).toBe(false);
 c.story={version:1,scenes:{'first-seed':'skipped'},choices:{},radio:[],anchors:{}};expect(survivorPresent(c)).toBe(true);
 const legacy=createCampaign(2);receiveSeed(legacy);expect(survivorPresent(legacy)).toBe(true);// save antigo com a Semente: nada a apresentar
});

test('gatilho: tutorial no objetivo da sobrevivente, ou a pé perto do abrigo sem tutorial ativo',()=>{
 const c=createCampaign(3),near={x:S.x+ARRIVAL_RADIUS-1,z:S.z},far={x:-13+20,z:22+20};
 expect(arrivalDue(c,tutorial('maintenance'),{mode:'walking',overlay:null,foot:near})).toBe(false);// antes do passo: ninguém chega
 expect(arrivalDue(c,tutorial('mission'),{mode:'walking',overlay:null,foot:far})).toBe(true);
 expect(arrivalDue(c,tutorial('mission'),{mode:'driving',overlay:null,foot:null})).toBe(true);
 expect(arrivalDue(c,tutorial('mission'),{mode:'paused',overlay:'maintenance',foot:far})).toBe(false);// nunca no meio de um painel
 expect(arrivalDue(c,tutorial('mission'),{mode:'cinematic',overlay:null,foot:far})).toBe(false);
 for(const status of ['skipped','completed','legacy']){
  expect(arrivalDue(c,tutorial(null,status),{mode:'walking',overlay:null,foot:far})).toBe(false);
  expect(arrivalDue(c,tutorial(null,status),{mode:'walking',overlay:null,foot:near})).toBe(true);
  expect(arrivalDue(c,tutorial(null,status),{mode:'driving',overlay:null,foot:null})).toBe(false);
 }
 expect(arrivalDue(c,tutorial(null,'skipped'),{mode:'walking',overlay:null,foot:{x:-13,z:22}})).toBe(false);// ponto inicial fica fora do raio
 receiveSeed(c);expect(arrivalDue(c,tutorial('mission'),{mode:'walking',overlay:null,foot:near})).toBe(false);
});

test('trajeto: corre pela estrada, desacelera e para exatamente no ponto do abrigo',()=>{
 const a=arrivalPath(0),run=arrivalPath(2),walk=arrivalPath(6.5),end=arrivalPath(20);
 expect(Math.hypot(a.x-S.x,a.z-S.z)).toBeGreaterThan(20);expect(run.speed).toBeGreaterThan(4);
 expect(walk.speed).toBeGreaterThan(.08);expect(walk.speed).toBeLessThan(4);
 expect(end).toEqual({x:S.x,z:S.z,speed:0,heading:null});
});

test('assistir: só apresenta; não concede Semente nem item, devolve câmera e a sobrevivente ao ponto do colisor',()=>{
 const g=fakeGame(),p=new CutscenePlayer(g),pose=g.rendering.camera.position.toArray(),inv=JSON.stringify(g.campaign.inventory);
 expect(p.queue('first-seed')).toBe(true);p.begin();expect(g.state.mode).toBe('cinematic');
 expect(g.rendering.scene.getObjectByName('Semente de Ignição · cena')).toBeTruthy();
 p.update(1);expect(Math.hypot(g.features.npc.position.x-S.x,g.features.npc.position.z-S.z)).toBeGreaterThan(5);// ainda vindo pela estrada
 expect(g.npcCinematic.speed).toBeGreaterThan(4);
 const tones=new Set();for(let t=0;t<SURVIVOR_ARRIVAL_SECONDS+1;t+=.25){p.update(.25);if(g.state.cutscene?.tone)tones.add(g.state.cutscene.tone);}
 expect([...tones]).toEqual(['ash','garage']);expect(g.ambientAudio.cue).toHaveBeenCalledWith('pulse',expect.anything());
 expect(g.state.mode).toBe('walking');expect(g.rendering.camera.position.toArray()).toEqual(pose);
 expect(g.features.npc.position.toArray()).toEqual([S.x,0,S.z]);expect(g.npcCinematic).toBeNull();
 expect(g.rendering.scene.getObjectByName('Semente de Ignição · cena')).toBeUndefined();
 expect(g.campaign.seed).toEqual({received:false,integrity:100});expect(JSON.stringify(g.campaign.inventory)).toBe(inv);
 expect(g.campaign.story.scenes).toEqual({'first-seed':'watched'});expect(validStory(g.campaign.story)).toBe(true);
 expect(survivorPresent(g.campaign)).toBe(true);expect(p.queue('first-seed')).toBe(false);// não repete
});

test('pular e assistir terminam no mesmo estado de controle e de mundo',()=>{
 const end=watch=>{const g=fakeGame(),p=new CutscenePlayer(g);p.queue('first-seed');p.begin();if(watch)play(p,SURVIVOR_ARRIVAL_SECONDS+.5);else{p.update(3);p.skip();}
  return {mode:g.state.mode,overlay:g.state.overlay,cam:g.rendering.camera.position.toArray(),npc:g.features.npc.position.toArray(),seed:g.campaign.seed,present:survivorPresent(g.campaign),props:g.rendering.scene.children.length,ctx:g.input.setContext.mock.calls.at(-1)[0]};};
 expect(end(false)).toEqual(end(true));
});

test('redução de movimento: só o plano da Semente, câmera parada, curta e sem som',()=>{
 vi.stubGlobal('matchMedia',()=>({matches:true}));
 const g=fakeGame(),p=new CutscenePlayer(g),pose=g.rendering.camera.position.toArray();p.queue('first-seed');p.begin();
 expect(p.duration).toBeLessThanOrEqual(3);expect(g.state.cutscene).toMatchObject({reduced:true,caption:{speaker:'Sobrevivente'}});
 expect(g.state.cutscene.caption.text).toMatch(/Semente de Ignição/);expect(g.ambientAudio.cue).not.toHaveBeenCalled();
 p.update(1);expect(g.rendering.camera.position.toArray()).toEqual(pose);p.update(2);expect(g.state.mode).toBe('walking');
});

test('câmera fica acima do terreno durante a cena',()=>{
 const g=fakeGame();g.world.groundHeight=(x,z)=>.02*x+.01*z;const p=new CutscenePlayer(g),cam=g.rendering.camera;p.queue('first-seed');p.begin();
 for(let t=0;t<SURVIVOR_ARRIVAL_SECONDS-1.2;t+=.25){p.update(.25);expect(cam.position.y-g.world.groundHeight(cam.position.x,cam.position.z)).toBeGreaterThan(.5);}
 p.skip();
});

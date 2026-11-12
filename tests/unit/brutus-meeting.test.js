import {test,expect,vi,afterEach} from 'vitest';
import * as THREE from 'three';
import {CUTSCENES,CutscenePlayer,validCutscene} from '../../src/game/narrative/cutscene.js';
import {BRUTUS_MEETING,BRUTUS_MEETING_SECONDS,BRUTUS_SPOT,BRUTUS_FROM,BRUTUS_RADIUS,REACTIONS,brutusPresent,brutusDue,brutusPath} from '../../src/game/narrative/cutscenes/brutus.js';
import {validStory,ensureStory,relationOf,choiceOf} from '../../src/game/narrative/story.js';
import {SPEAKERS,CHOICES,CHOICE_SCENES} from '../../src/data/story.js';
import {createCampaign} from '../../src/game/missions/campaign.js';

// Story 005: primeiro encontro físico com Brutus/Garcia ('brutus-meeting').
const DANTE={x:BRUTUS_SPOT.x-4,y:1,z:BRUTUS_SPOT.z+5};
const decided=(option,scenes={})=>{const c=createCampaign(5);const s=ensureStory(c);if(option)s.choices['ch3-brutus-toll']=option;Object.assign(s.scenes,scenes);return c;};
function fakeGame(campaign){
 const camera=new THREE.PerspectiveCamera(64);camera.position.set(DANTE.x,DANTE.y+.62,DANTE.z);camera.updateProjectionMatrix();
 const placed=[];
 return {placed,campaign,rendering:{camera,renderer:{toneMappingExposure:1}},state:{mode:'walking',resumeMode:'walking',overlay:null},
  input:{setContext:vi.fn()},audio:{pause:vi.fn()},ambientAudio:{setPaused:vi.fn(),cue:vi.fn()},loop:{reset:vi.fn()},
  player:{body:{translation:()=>({...DANTE})},view:'first'},brutusActor:{place:(...a)=>placed.push(a)},cameras:{},emit:vi.fn(),world:{groundHeight:()=>0}};
}
afterEach(()=>vi.unstubAllGlobals());
const play=(p,seconds,step=.25)=>{for(let t=0;t<seconds;t+=step)p.update(step);};

test('cena registrada, válida, ~19 s, só falas de Garcia, sem a Voz; três reações à escolha existente',()=>{
 expect(CUTSCENES['brutus-meeting']).toBe(BRUTUS_MEETING);expect(validCutscene(BRUTUS_MEETING)).toBe(true);
 expect(BRUTUS_MEETING_SECONDS).toBeGreaterThanOrEqual(15);expect(BRUTUS_MEETING_SECONDS).toBeLessThanOrEqual(24);
 for(const s of BRUTUS_MEETING.shots){expect(s.caption.speaker).toBe('brutus');expect(s.caption.text).not.toMatch(/\bVoz\b/);}
 expect(SPEAKERS.brutus).toBe('Garcia');expect(Object.keys(REACTIONS).sort()).toEqual(Object.keys(CHOICES['ch3-brutus-toll'].options).sort());
 for(const t of Object.values(REACTIONS)){expect(t.length).toBeLessThanOrEqual(300);expect(t).not.toMatch(/\bVoz\b/);}
 expect(CHOICE_SCENES['ch3-brutus-toll'].after.water).toMatch(/rádio/);// a decisão continua sem Garcia em pessoa
});

test('presença e gatilho: só depois da decisão do pedágio, a pé perto da bomba, uma vez',()=>{
 const near={x:BRUTUS_SPOT.x+BRUTUS_RADIUS-1,z:BRUTUS_SPOT.z},far={x:BRUTUS_SPOT.x,z:BRUTUS_SPOT.z+BRUTUS_RADIUS+5};
 expect(brutusPresent(decided(null))).toBe(false);expect(brutusDue(decided(null),{mode:'walking',overlay:null,foot:near})).toBe(false);
 for(const option of ['pay','refuse','water']){
  const c=decided(option);expect(brutusPresent(c)).toBe(false);
  expect(brutusDue(c,{mode:'walking',overlay:null,foot:near})).toBe(true);
  expect(brutusDue(c,{mode:'walking',overlay:null,foot:far})).toBe(false);
  expect(brutusDue(c,{mode:'paused',overlay:'network',foot:near})).toBe(false);// nunca por cima do painel da decisão
  expect(brutusDue(c,{mode:'driving',overlay:null,foot:null})).toBe(false);// a cabine em movimento não é interrompida
  const met=decided(option,{'brutus-meeting':'skipped'});expect(brutusPresent(met)).toBe(true);expect(brutusDue(met,{mode:'walking',overlay:null,foot:near})).toBe(false);
 }
});

test('trajeto: vem do sal, desacelera e para no ponto do colisor',()=>{
 expect(brutusPath(0)).toMatchObject({x:BRUTUS_FROM.x,z:BRUTUS_FROM.z});expect(brutusPath(1).speed).toBeGreaterThan(.5);
 expect(brutusPath(30)).toEqual({x:BRUTUS_SPOT.x,z:BRUTUS_SPOT.z,speed:0});
});

test('a reação de Garcia acompanha a escolha; relação e inventário não mudam',()=>{
 for(const option of ['pay','refuse','water']){
  const c=decided(option),g=fakeGame(c),p=new CutscenePlayer(g),inv=JSON.stringify(c.inventory),relation=relationOf(c,'brutus');
  expect(p.queue('brutus-meeting')).toBe(true);p.begin();const lines=new Set();
  for(let t=0;t<BRUTUS_MEETING_SECONDS+1;t+=.25){p.update(.25);if(g.state.cutscene?.caption)lines.add(g.state.cutscene.caption.text);}
  expect(lines.has(REACTIONS[option])).toBe(true);for(const o of Object.keys(REACTIONS))if(o!==option)expect(lines.has(REACTIONS[o])).toBe(false);
  expect(choiceOf(c,'ch3-brutus-toll')).toBe(option);expect(relationOf(c,'brutus')).toBe(relation);expect(JSON.stringify(c.inventory)).toBe(inv);
  expect(c.story.scenes['brutus-meeting']).toBe('watched');expect(validStory(c.story)).toBe(true);expect(p.queue('brutus-meeting')).toBe(false);
 }
});

test('assistir e pular terminam iguais: câmera devolvida e Garcia no ponto do colisor, encarando Dante',()=>{
 const end=watch=>{const g=fakeGame(decided('refuse')),p=new CutscenePlayer(g);p.queue('brutus-meeting');p.begin();if(watch)play(p,BRUTUS_MEETING_SECONDS+.5);else{p.update(2);p.skip();}
  const last=g.placed.at(-1);return {mode:g.state.mode,overlay:g.state.overlay,cam:g.rendering.camera.position.toArray(),spot:last.slice(0,3),heading:last[3],speed:last[4],present:brutusPresent(g.campaign),ctx:g.input.setContext.mock.calls.at(-1)[0]};};
 const watched=end(true);expect(end(false)).toEqual(watched);
 expect(watched.spot).toEqual([BRUTUS_SPOT.x,0,BRUTUS_SPOT.z]);expect(watched.speed).toBe(0);expect(watched.present).toBe(true);
 expect(watched.heading).toBeCloseTo(Math.atan2(DANTE.x-BRUTUS_SPOT.x,DANTE.z-BRUTUS_SPOT.z));
});

test('redução de movimento: câmera parada, só a reação à escolha',()=>{
 vi.stubGlobal('matchMedia',()=>({matches:true}));
 const g=fakeGame(decided('water')),p=new CutscenePlayer(g),pose=g.rendering.camera.position.toArray();p.queue('brutus-meeting');p.begin();
 expect(p.duration).toBeLessThanOrEqual(3);expect(g.state.cutscene).toMatchObject({reduced:true,caption:{speaker:'Garcia',text:REACTIONS.water}});
 p.update(1);expect(g.rendering.camera.position.toArray()).toEqual(pose);p.update(2);expect(g.state.mode).toBe('walking');
});

test('câmera acima do terreno durante a cena',()=>{
 const g=fakeGame(decided('pay'));g.world.groundHeight=(x,z)=>.002*x+.001*z;const p=new CutscenePlayer(g),cam=g.rendering.camera;p.queue('brutus-meeting');p.begin();
 for(let t=0;t<BRUTUS_MEETING_SECONDS-1.2;t+=.25){p.update(.25);expect(cam.position.y-g.world.groundHeight(cam.position.x,cam.position.z)).toBeGreaterThan(.5);}
 p.skip();
});

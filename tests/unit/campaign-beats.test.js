import {test,expect,vi,afterEach} from 'vitest';
import * as THREE from 'three';
import {CUTSCENES,CutscenePlayer,validCutscene} from '../../src/game/narrative/cutscene.js';
import {CAMPAIGN_BEATS,CAMPAIGN_BEAT_IDS,RESYNC_FRAMES,createBeatMemory,resyncBeats,noteFirstContact,observeBeats,beatDue} from '../../src/game/narrative/cutscenes/campaign-beats.js';
import {ensureStory,chapterOf} from '../../src/game/narrative/story.js';
import {SCENES} from '../../src/data/story.js';
import {CORES} from '../../src/data/network.js';
import {createCampaign,receiveSeed} from '../../src/game/missions/campaign.js';

// Story 006: cenas dos acontecimentos importantes da campanha.
const withCores=n=>{const c=createCampaign(6);receiveSeed(c);c.cores||={};for(const k of CORES.slice(0,n))c.cores[k.id]={state:'active'};ensureStory(c);return c;};
const free={mode:'driving',overlay:null};
afterEach(()=>vi.unstubAllGlobals());

test('quatro cenas registradas, válidas, 10–16 s, puláveis por redução de movimento; a Voz só fala, nunca é descrita',()=>{
 expect(CAMPAIGN_BEAT_IDS.sort()).toEqual(['first-contact','horizon-eve','skeleton-discovery','voice-signal']);
 for(const [id,def] of Object.entries(CAMPAIGN_BEATS)){
  expect(SCENES).toContain(id);expect(CUTSCENES[id]).toBe(def);expect(validCutscene(def)).toBe(true);
  const total=def.shots.reduce((a,s)=>a+s.duration,0);expect(total).toBeGreaterThanOrEqual(10);expect(total).toBeLessThanOrEqual(16);
  for(const s of def.shots)if(s.caption&&s.caption.speaker!=='voice')expect(s.caption.text).not.toMatch(/\bVoz\b/);
 }
 expect(CAMPAIGN_BEATS['voice-signal'].shots.filter(s=>s.caption?.speaker==='voice')).toHaveLength(1);
});

test('capítulos: os gatilhos casam com o capítulo calculado dos Núcleos',()=>{
 expect(chapterOf(withCores(0))).toBe('ch1');expect(chapterOf(withCores(1))).toBe('ch2');expect(chapterOf(withCores(5))).toBe('ch4');expect(chapterOf(withCores(6))).toBe('ch5');
});

test('carregar um save já adiante não dispara nada; só a transição real desta sessão',()=>{
 const c=withCores(1),m=createBeatMemory();
 observeBeats(m,c,'cities');expect(beatDue(m,c,free)).toBeNull();// save carregado dentro das Cidades
 const d=withCores(1),n=createBeatMemory();observeBeats(n,d,'ashes');observeBeats(n,d,'cities');expect(beatDue(n,d,free)).toBe('skeleton-discovery');
 expect(beatDue(n,d,{mode:'paused',overlay:'map'})).toBeNull();expect(beatDue(n,d,{mode:'cinematic',overlay:null})).toBeNull();
 const e=withCores(0),o=createBeatMemory();observeBeats(o,e,'ashes');observeBeats(o,e,'cities');expect(beatDue(o,e,free)).toBeNull();// fora do capítulo 2
});

test('teleporte de diagnóstico vira nova linha de base (por alguns quadros, até a região ser recalculada)',()=>{
 const c=withCores(1),m=createBeatMemory();observeBeats(m,c,'ashes');resyncBeats(m);
 for(let i=0;i<RESYNC_FRAMES-1;i++)observeBeats(m,c,'ashes');observeBeats(m,c,'cities');observeBeats(m,c,'cities');expect(beatDue(m,c,free)).toBeNull();
});

test('véspera do Horizonte depois da ativação que abre o capítulo 5; sinal da Voz com o fragmento recém-recebido',()=>{
 const c=withCores(5),m=createBeatMemory();observeBeats(m,c,'glass');c.cores[CORES[5].id]={state:'active'};observeBeats(m,c,'glass');expect(beatDue(m,c,free)).toBe('horizon-eve');
 const d=withCores(5),n=createBeatMemory();observeBeats(n,d,'glass');d.flags.voiceFragments.push('signal-stubborn');observeBeats(n,d,'glass');expect(beatDue(n,d,free)).toBe('voice-signal');
 const old=withCores(5);old.flags.voiceFragments.push('signal-stubborn');const o=createBeatMemory();observeBeats(o,old,'glass');expect(beatDue(o,old,free)).toBeNull();// fragmento antigo, de um save
});

test('primeiro contato: só ao aceitar a Semente nesta sessão, depois que o rádio fecha; uma vez',()=>{
 const c=withCores(0),m=createBeatMemory();observeBeats(m,c,'ashes');expect(beatDue(m,c,free)).toBeNull();
 noteFirstContact(m,c);noteFirstContact(m,c);expect(m.pending).toEqual(['first-contact']);
 expect(beatDue(m,c,{mode:'paused',overlay:'radio'})).toBeNull();expect(beatDue(m,c,{mode:'walking',overlay:null})).toBe('first-contact');
 c.story.scenes['first-contact']='skipped';expect(beatDue(m,c,free)).toBeNull();expect(m.pending).toEqual([]);
});

function fakeGame(campaign,mode='driving'){
 const camera=new THREE.PerspectiveCamera(64);camera.position.set(3,4,10);camera.updateProjectionMatrix();
 return {campaign,rendering:{camera,renderer:{toneMappingExposure:1}},state:{mode,resumeMode:mode,overlay:null},input:{setContext:vi.fn()},audio:{pause:vi.fn()},ambientAudio:{setPaused:vi.fn(),cue:vi.fn()},loop:{reset:vi.fn()},
  player:{body:{translation:()=>({x:0,y:1,z:-7000})}},vehicle:{body:{translation:()=>({x:2,y:2,z:-7010})}},cameras:{},emit:vi.fn(),world:{groundHeight:(x,z)=>.003*x+.001*(z+7000)}};
}
test('assistir e pular terminam iguais; câmera acima do terreno; nada da campanha além da cena muda',()=>{
 for(const id of CAMPAIGN_BEAT_IDS)for(const mode of ['driving','walking']){
  const end=watch=>{const c=withCores(1),g=fakeGame(c,mode),p=new CutscenePlayer(g),inv=JSON.stringify(c.inventory),cores=JSON.stringify(c.cores);
   expect(p.queue(id)).toBe(true);p.begin();
   if(watch){for(let t=0;t<p.duration+.5;t+=.25){p.update(.25);if(p.active&&p.elapsed<p.duration-1.2){const cam=g.rendering.camera.position;expect(cam.y-g.world.groundHeight(cam.x,cam.z)).toBeGreaterThan(.8);}}}else{p.update(1);p.skip();}
   expect(JSON.stringify(c.inventory)).toBe(inv);expect(JSON.stringify(c.cores)).toBe(cores);expect(p.queue(id)).toBe(false);
   return {mode:g.state.mode,cam:g.rendering.camera.position.toArray(),seen:!!c.story.scenes[id]};};
  expect(end(false)).toEqual(end(true));
 }
});

test('redução de movimento: câmera parada e uma única fala',()=>{
 vi.stubGlobal('matchMedia',()=>({matches:true}));
 for(const id of CAMPAIGN_BEAT_IDS){const g=fakeGame(withCores(1)),p=new CutscenePlayer(g),pose=g.rendering.camera.position.toArray();p.queue(id);p.begin();
  expect(p.duration).toBeLessThanOrEqual(3);p.update(1);expect(g.rendering.camera.position.toArray()).toEqual(pose);p.update(3);expect(g.state.mode).toBe('driving');}
});

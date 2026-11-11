import {test,expect,vi,afterEach} from 'vitest';
import * as THREE from 'three';
import {CUTSCENES,CutscenePlayer,validCutscene,REDUCED_SECONDS} from '../../src/game/narrative/cutscene.js';
import {RestorationCinematic} from '../../src/game/restoration/RestorationCinematic.js';
import {Input} from '../../src/game/input/Input.js';
import {validStory,recordScene} from '../../src/game/narrative/story.js';
import {SPEAKERS} from '../../src/data/story.js';

// Fixture registrada só durante cada teste: usa um id já previsto em SCENES,
// sem criar conteúdo definitivo (stories 002–006).
const ID='voice-signal';
const fixture=()=>({id:ID,shots:[
 {duration:2,camera:{from:{pos:[0,10,0],look:[0,0,-10],fov:50},to:{pos:[5,12,0],look:[0,0,-20],fov:40}},caption:{speaker:'voice',text:'Linha de teste.'},light:{exposure:.5},audio:{cue:'pulse'}},
 {duration:1,camera:{from:{pos:[1,1,1],look:[0,0,0]}},caption:{speaker:'renata',text:'Segunda linha.'}}]});

function fakeGame(campaign={}){
 const camera=new THREE.PerspectiveCamera(64);camera.position.set(3,2,1);camera.lookAt(0,0,-5);camera.updateProjectionMatrix();
 const body={translation:()=>({x:3,y:1,z:1}),setTranslation:vi.fn(),setLinvel:vi.fn()};
 return {campaign,rendering:{camera,renderer:{toneMappingExposure:1.1}},state:{mode:'paused',resumeMode:'driving',overlay:'pause'},
  input:{setContext:vi.fn()},audio:{pause:vi.fn()},ambientAudio:{setPaused:vi.fn(),cue:vi.fn()},loop:{reset:vi.fn()},
  player:{body,view:'first'},cameras:{},emit:vi.fn(),world:{recoveryHeight:()=>0},physics:null};
}
const poseOf=g=>({p:g.rendering.camera.position.toArray(),q:g.rendering.camera.quaternion.toArray(),fov:g.rendering.camera.fov,exp:g.rendering.renderer.toneMappingExposure});
// Estado funcional que deve ser idêntico entre assistir e pular (exclui o registro watched/skipped).
const functional=g=>({...poseOf(g),mode:g.state.mode,resume:g.state.resumeMode,overlay:g.state.overlay,cutscene:g.state.cutscene,context:g.input.setContext.mock.lastCall?.[0]});

afterEach(()=>{delete CUTSCENES[ID];vi.unstubAllGlobals();});

test('valida dados de cena e recusa formatos inválidos',()=>{
 expect(validCutscene(fixture())).toBe(true);
 const bad=[null,{id:ID,shots:[]},{id:ID,shots:[{duration:0}]},{id:ID,shots:[{duration:61}]},{id:ID,shots:[{duration:1,caption:{speaker:'dante-secret',text:'x'}}]},
  {id:ID,shots:[{duration:1,light:{exposure:5}}]},{id:ID,shots:[{duration:1,audio:{cue:'boom'}}]},{id:ID,shots:[{duration:1,camera:{from:{pos:[0,0],look:[0,0,0]}}}]}];
 for(const d of bad)expect(validCutscene(d)).toBe(false);
});

test('fila aceita só cena registrada, válida, não vista e não duplicada',()=>{
 const g=fakeGame(),p=new CutscenePlayer(g);
 expect(p.queue(ID)).toBe(false);// não registrada
 CUTSCENES[ID]=fixture();expect(p.queue('nao-existe')).toBe(false);
 expect(p.queue(ID)).toBe(true);expect(p.queue(ID)).toBe(false);
 recordScene(g.campaign,'prologue-2027','skipped');CUTSCENES['prologue-2027']={...fixture(),id:'prologue-2027'};
 try{expect(p.queue('prologue-2027')).toBe(false);}finally{delete CUTSCENES['prologue-2027'];}
});

test('início suspende física, entrada e áudio; legenda mostra só o rótulo do falante',()=>{
 CUTSCENES[ID]=fixture();const g=fakeGame(),p=new CutscenePlayer(g);p.queue(ID);
 expect(p.begin()).toBe(true);expect(p.begin()).toBe(false);
 expect(g.state.mode).toBe('cinematic');expect(g.state.overlay).toBeNull();expect(g.input.setContext).toHaveBeenLastCalledWith('cinematic');
 expect(g.audio.pause).toHaveBeenCalled();expect(g.ambientAudio.setPaused).toHaveBeenLastCalledWith(true);expect(g.loop.reset).toHaveBeenCalled();
 expect(g.state.cutscene).toEqual({id:ID,caption:{speaker:SPEAKERS.voice,text:'Linha de teste.'},reduced:false});
 expect(g.state.cutscene.caption.speaker).toBe('A Voz');
 expect(g.ambientAudio.cue).toHaveBeenCalledWith('pulse',g.rendering.camera.position);
});

test('atualização percorre planos, câmera e luz; fim restaura tudo e grava watched',()=>{
 CUTSCENES[ID]=fixture();const g=fakeGame(),p=new CutscenePlayer(g),before=poseOf(g);p.queue(ID);p.begin();
 p.update(1);expect(p.shot).toBe(0);expect(g.rendering.camera.position.toArray()).not.toEqual(before.p);expect(g.rendering.renderer.toneMappingExposure).toBeLessThan(1.1);
 p.update(1.2);expect(p.shot).toBe(1);expect(g.state.cutscene.caption.text).toBe('Segunda linha.');
 p.update(.79);expect(p.active).toBe(true);
 p.update(.5);expect(p.active).toBe(false);expect(p.skipped).toBe(false);
 expect(poseOf(g)).toEqual(before);
 expect(g.state.mode).toBe('driving');expect(g.state.resumeMode).toBe('driving');expect(g.state.cutscene).toBeNull();expect(g.input.setContext).toHaveBeenLastCalledWith('driving');
 expect(g.ambientAudio.setPaused).toHaveBeenLastCalledWith(false);expect(g.cameras.initial).toBe(true);expect(g.player.cameraInitial).toBe(true);
 expect(g.campaign.story.scenes[ID]).toBe('watched');expect(validStory(g.campaign.story)).toBe(true);
 expect(p.queue(ID)).toBe(false);
});

test('pular termina no mesmo estado funcional que assistir, gravando skipped',()=>{
 CUTSCENES[ID]=fixture();
 const a=fakeGame(),pa=new CutscenePlayer(a);pa.queue(ID);pa.begin();for(let i=0;i<20;i++)pa.update(.25);
 const b=fakeGame(),pb=new CutscenePlayer(b);pb.queue(ID);pb.begin();pb.update(1.3);
 expect(pb.skip()).toBe(true);expect(pb.skip()).toBe(false);expect(pb.finish(false)).toBe(false);
 expect(functional(b)).toEqual(functional(a));
 expect(a.campaign.story.scenes[ID]).toBe('watched');expect(b.campaign.story.scenes[ID]).toBe('skipped');
 expect(validStory(b.campaign.story)).toBe(true);
 // corpo do jogador nunca é reposicionado (sem teleporte)
 for(const g of [a,b]){expect(g.player.body.setTranslation).not.toHaveBeenCalled();expect(g.player.body.setLinvel).not.toHaveBeenCalled();}
 // um pulo posterior não rebaixa uma cena assistida
 expect(recordScene(a.campaign,ID,'skipped')).toBe(false);expect(a.campaign.story.scenes[ID]).toBe('watched');
});

test('cena iniciada em movimento devolve o modo ativo, não o de um painel antigo',()=>{
 CUTSCENES[ID]=fixture();
 for(const mode of ['walking','driving']){
  const g=fakeGame();g.state.mode=mode;g.state.resumeMode=mode==='walking'?'driving':'walking';g.state.overlay=null;
  const p=new CutscenePlayer(g);p.queue(ID);p.begin();p.skip();
  expect(g.state.mode).toBe(mode);expect(g.state.resumeMode).toBe(mode);expect(g.input.setContext).toHaveBeenLastCalledWith(mode);
 }
});

test('pausa: sem dt a cena não avança; dt negativo é ignorado',()=>{
 CUTSCENES[ID]=fixture();const g=fakeGame(),p=new CutscenePlayer(g);p.queue(ID);p.begin();
 for(let i=0;i<100;i++)p.update(0);p.update(-5);
 expect(p.elapsed).toBe(0);expect(p.active).toBe(true);expect(g.state.mode).toBe('cinematic');
});

test('redução de movimento: câmera fixa, duração curta, primeira legenda, sem cue de áudio',()=>{
 vi.stubGlobal('matchMedia',()=>({matches:true}));
 CUTSCENES[ID]=fixture();const g=fakeGame(),p=new CutscenePlayer(g),before=poseOf(g);p.queue(ID);p.begin();
 expect(p.duration).toBe(REDUCED_SECONDS);expect(g.state.cutscene.reduced).toBe(true);expect(g.state.cutscene.caption.text).toBe('Linha de teste.');
 expect(g.ambientAudio.cue).not.toHaveBeenCalled();
 p.update(1);expect(poseOf(g)).toEqual(before);expect(p.shot).toBe(0);
 p.update(1);expect(p.active).toBe(false);expect(g.campaign.story.scenes[ID]).toBe('watched');
});

test('retomada e limpeza: reset conta como pulo, esvazia a fila e libera o estado',()=>{
 CUTSCENES[ID]=fixture();CUTSCENES['horizon-eve']={...fixture(),id:'horizon-eve'};
 try{
  const g=fakeGame(),p=new CutscenePlayer(g);p.queue(ID);p.queue('horizon-eve');p.begin();
  expect(p.snapshot()).toMatchObject({active:true,id:ID,queued:['horizon-eve']});
  p.reset();
  expect(p.snapshot()).toMatchObject({active:false,id:null,queued:[],skipped:true});
  expect(g.state.mode).toBe('driving');expect(g.state.cutscene).toBeNull();expect(g.campaign.story.scenes[ID]).toBe('skipped');
  expect(p.begin()).toBe(false);p.reset();expect(p.active).toBe(false);// idempotente
 }finally{delete CUTSCENES['horizon-eve'];}
});

test('cena narrativa e cinemática de restauração nunca tocam ao mesmo tempo',()=>{
 CUTSCENES[ID]=fixture();const g=fakeGame({world:{recovery:{cores:{'core-1':{}}}}}),p=new CutscenePlayer(g),r=new RestorationCinematic(g);
 g.cutscenes=p;g.restoration={cinematic:r};
 p.queue(ID);r.queue('core-1');
 expect(r.begin()).toBe(true);expect(p.begin()).toBe(false);
 r.finish(true);expect(g.campaign.story).toBeUndefined();// restauração não grava em campaign.story
 r.reset();expect(r.queue('core-1')).toBe(false);// cinematicSeen preservado
 expect(p.begin()).toBe(true);expect(r.begin()).toBe(false);p.skip();
});

// --- Teclado: Esc/Space/Enter só pulam com cena ativa ---
function keyboard(){
 const listeners={},target=()=>({addEventListener:(t,f)=>{(listeners[t]??=new Set()).add(f);},removeEventListener:(t,f)=>listeners[t]?.delete(f)});
 vi.stubGlobal('window',target());vi.stubGlobal('document',{...target(),hidden:false,pointerLockElement:null,exitPointerLock:vi.fn()});
 const actions={skipCinematic:vi.fn(),pause:vi.fn(),interact:vi.fn(),panel:vi.fn(),camera:vi.fn(),engine:vi.fn(),lights:vi.fn(),garage:vi.fn(),closeGarage:vi.fn(),orbit:vi.fn(),zoom:vi.fn(),look:vi.fn()};
 const input=new Input(actions,{addEventListener:vi.fn(),removeEventListener:vi.fn()});
 const press=(code,repeat=false)=>{const e={code,repeat,preventDefault:vi.fn()};for(const f of listeners.keydown||[])f(e);return e;};
 return {input,actions,press,listeners};
}

test('Esc, Space e Enter pulam apenas no contexto cinematic e não vazam para os controles',()=>{
 const {input,actions,press}=keyboard();input.setContext('cinematic');
 for(const k of ['Escape','Space','Enter'])expect(press(k).preventDefault).toHaveBeenCalled();
 expect(actions.skipCinematic).toHaveBeenCalledTimes(3);expect(actions.pause).not.toHaveBeenCalled();
 expect(input.read()).toEqual({throttle:0,steer:0,handbrake:true});
 for(const k of ['KeyF','KeyE','KeyM','KeyW'])press(k);
 expect(actions.interact).not.toHaveBeenCalled();expect(actions.engine).not.toHaveBeenCalled();expect(actions.panel).not.toHaveBeenCalled();expect(input.keys.size).toBe(0);
});

test('sem cena ativa as mesmas teclas mantêm direção, pausa e salto normais',()=>{
 const {input,actions,press}=keyboard();
 input.setContext('driving');press('Space');expect(input.read().handbrake).toBe(true);press('Escape');expect(actions.pause).toHaveBeenCalledTimes(1);press('Enter');press('KeyF');expect(actions.interact).toHaveBeenCalledTimes(1);
 input.setContext('walking');press('Space');expect(input.read().jump).toBe(true);
 input.setContext('menu');press('Escape');press('Enter');
 expect(actions.skipCinematic).not.toHaveBeenCalled();expect(actions.pause).toHaveBeenCalledTimes(1);
});

test('tecla mantida após o pulo não freia, pula nem pausa ao devolver o controle',()=>{
 const {input,actions,press}=keyboard();input.setContext('cinematic');press('Space');
 input.setContext('walking');press('Space',true);press('Escape',true);
 expect(input.read().jump).toBe(false);expect(actions.pause).not.toHaveBeenCalled();
 input.setContext('driving');press('Space',true);expect(input.read().handbrake).toBe(false);
});

test('dispose remove os ouvintes do teclado',()=>{
 const {input,listeners}=keyboard();expect(listeners.keydown.size).toBe(1);input.dispose();expect(listeners.keydown.size).toBe(0);
});

import {evidencePath} from '../helpers/evidence-path.js';
import {enterFromNewTutorial} from '../helpers/start-driving.js';
import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';

// Story 001 (sistema de cutscenes): fixture de teste registrada pelo gancho de debug,
// com ids já previstos em SCENES, sem conteúdo definitivo (stories 002–006).
const dir=evidencePath('cutscene-0.14.0');
const state=page=>page.evaluate(()=>window.__GAME_DEBUG__.getState());
const fixture=(id,seconds=[1.5,1.5])=>({id,shots:[
 {duration:seconds[0],camera:{from:{pos:[-20,14,30],look:[0,2,0],fov:50},to:{pos:[-10,10,24],look:[0,2,-10],fov:44}},caption:{speaker:'voice',text:'Fixture de teste do sistema de cenas.'},light:{exposure:.7}},
 {duration:seconds[1],camera:{from:{pos:[12,6,18],look:[0,1,0]}},caption:{speaker:'renata',text:'Segundo plano da fixture.'}}]});
const play=(page,def)=>page.evaluate(d=>window.__GAME_DEBUG__.playCutscene(d),def);
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const functional=s=>({mode:s.mode,overlay:s.overlay,cutscene:s.cutscene??null,engineOn:s.engineOn,headlights:s.headlights,restoration:s.restoration?.cinematic?.active});

async function boot(page){
 await page.setViewportSize({width:1280,height:720});
 await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0,subtitles:true})));
 await page.goto('/');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:60000});
 await page.getByRole('button',{name:'01 Novo jogo'}).click();await enterFromNewTutorial(page);
 await page.waitForTimeout(1500);// acomodação física após entrar no Titã
}

test('cena ao volante: abre, suspende física e rádio, Esc pula e devolve caminhão e controles',async({page})=>{
 test.setTimeout(240000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await boot(page);const before=await state(page);expect(before.mode).toBe('driving');
 expect(await play(page,fixture('voice-signal',[4,4]))).toBe(true);
 const during=await state(page);expect(during.mode).toBe('cinematic');expect(during.cutscene.id).toBe('voice-signal');expect(during.radioLine).toBeFalsy();
 const scene=page.getByRole('region',{name:'Cena'});await expect(scene).toBeVisible();
 await expect(scene.getByRole('status')).toContainText('A Voz');await expect(scene.getByRole('button',{name:/Pular cena/})).toBeVisible();
 await expect(scene.getByRole('status')).toHaveCSS('opacity','1');// fim da animação de entrada (lenta sob SwiftShader)
 await page.screenshot({path:`${dir}/driving-during.png`});
 await page.waitForTimeout(600);const later=await state(page);
 expect(later.mode).toBe('cinematic');expect(later.simulation.steps).toBe(during.simulation.steps);// física suspensa durante a cena
 await page.keyboard.press('Escape');
 await expect.poll(async()=>(await state(page)).mode).toBe('driving');await expect(scene).toBeHidden();
 const after=await state(page);
 expect(after.campaign.story.scenes['voice-signal']).toBe('skipped');expect(after.cutscene).toBeNull();expect(after.overlay).toBeNull();
 expect(dist(after.position,before.position)).toBeLessThan(.1);// caminhão sem teleporte
 await page.screenshot({path:`${dir}/driving-after-skip.png`});
 // controles normais voltam: Esc pausa (não pula), retomar, faróis e direção física
 await page.keyboard.press('Escape');await expect.poll(async()=>(await state(page)).mode).toBe('paused');
 await page.keyboard.press('Escape');await expect.poll(async()=>(await state(page)).mode).toBe('driving');
 const lights=(await state(page)).headlights;await page.keyboard.press('KeyL');await expect.poll(async()=>(await state(page)).headlights).toBe(!lights);
 if(!(await state(page)).engineOn)await page.keyboard.press('KeyE');await expect.poll(async()=>(await state(page)).engineOn).toBe(true);
 const steps=(await state(page)).simulation.steps;await page.keyboard.down('KeyW');
 await expect.poll(async()=>Math.abs((await state(page)).speedKmh),{timeout:20000}).toBeGreaterThan(1);await page.keyboard.up('KeyW');
 expect((await state(page)).simulation.steps).toBeGreaterThan(steps);
 expect(errors).toEqual([]);
});

test('assistir até o fim e pular terminam no mesmo estado funcional, com watched × skipped',async({page})=>{
 test.setTimeout(240000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await boot(page);const before=await state(page);
 expect(await play(page,fixture('horizon-eve',[1.2,1.2]))).toBe(true);await expect.poll(async()=>(await state(page)).mode).toBe('cinematic');
 await expect.poll(async()=>(await state(page)).mode,{timeout:20000}).toBe('driving');
 const watched=await state(page);
 expect(await play(page,fixture('voice-signal'))).toBe(true);await expect.poll(async()=>(await state(page)).mode).toBe('cinematic');
 await page.keyboard.press('Space');await expect.poll(async()=>(await state(page)).mode).toBe('driving');
 const skipped=await state(page);
 expect(functional(skipped)).toEqual(functional(watched));expect(functional(watched)).toEqual(functional(before));
 expect(skipped.campaign.story.scenes).toMatchObject({'horizon-eve':'watched','voice-signal':'skipped'});// o Novo Jogo também registra o prólogo (pulado pelo helper)
 expect(await play(page,fixture('horizon-eve'))).toBe(false);// não repete cena vista
 expect(dist(skipped.position,before.position)).toBeLessThan(.1);
 expect(errors).toEqual([]);
});

test('a pé com Dante: botão pula; Enter pula com redução de movimento; Space volta a saltar',async({page})=>{
 test.setTimeout(240000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await boot(page);await page.keyboard.press('KeyF');await expect.poll(async()=>(await state(page)).mode,{timeout:20000}).toBe('walking');
 await page.waitForTimeout(1200);const before=await state(page);
 expect(await play(page,fixture('brutus-meeting',[4,4]))).toBe(true);// longa o bastante para a captura antes do clique em "Pular cena"
 const scene=page.getByRole('region',{name:'Cena'});await expect(scene).toBeVisible();await page.screenshot({path:`${dir}/walking-during.png`});
 await scene.getByRole('button',{name:/Pular cena/}).click();
 await expect.poll(async()=>(await state(page)).mode).toBe('walking');await expect(scene).toBeHidden();
 const after=await state(page);expect(after.campaign.story.scenes['brutus-meeting']).toBe('skipped');
 expect(dist(after.playerPosition,before.playerPosition)).toBeLessThan(.15);expect(dist(after.position,before.position)).toBeLessThan(.1);
 await page.emulateMedia({reducedMotion:'reduce'});
 expect(await play(page,fixture('first-contact',[4,4]))).toBe(true);
 const reduced=await state(page);expect(reduced.cutscene.reduced).toBe(true);await expect(scene.getByRole('status')).toContainText('Fixture de teste');
 await page.screenshot({path:`${dir}/walking-reduced.png`});
 await page.keyboard.press('Enter');await expect.poll(async()=>(await state(page)).mode).toBe('walking');
 expect((await state(page)).campaign.story.scenes['first-contact']).toBe('skipped');
 const y=(await state(page)).playerPosition[1];
 await page.keyboard.down('Space');// mantida: o salto exige Space num frame com Dante no chão
 await expect.poll(async()=>(await state(page)).playerPosition[1]-y,{timeout:3000,intervals:[50]}).toBeGreaterThan(.1);await page.keyboard.up('Space');// salto normal
 // reduzida e não pulada: termina sozinha em ≤1,8 s
 expect(await play(page,fixture('skeleton-discovery',[4,4]))).toBe(true);
 await expect.poll(async()=>(await state(page)).mode,{timeout:6000}).toBe('walking');
 expect((await state(page)).campaign.story.scenes['skeleton-discovery']).toBe('watched');
 expect(errors).toEqual([]);
});

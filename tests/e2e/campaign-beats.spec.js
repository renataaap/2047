import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {evidencePath} from '../helpers/evidence-path.js';
import {skipPrologue,meetSurvivor} from '../helpers/start-driving.js';
import {createCampaign,receiveSeed,activateCore} from '../../src/game/missions/campaign.js';
import {migrateCampaign} from '../../src/game/survival/expedition.js';
import {upgradeCampaign} from '../../src/game/missions/network.js';
import {roadX,roadHeight} from '../../src/game/world/terrain.js';
import {CAMPAIGN_BEATS} from '../../src/game/narrative/cutscenes/campaign-beats.js';

// Story 006: cenas dos acontecimentos da campanha. Primeiro contato e Cidades Esqueleto pelo
// fluxo real (aceitar a Semente; cruzar o limite da região dirigindo com a física original).
// Sinal da Voz e véspera do Horizonte: gatilhos cobertos nos unitários (e a véspera na regressão
// phase4, que ativa o Núcleo 6); aqui só a apresentação, capturada pelo comando de depuração.
const dir=evidencePath('campaign-beats-0.14.0');
const state=page=>page.evaluate(()=>window.__GAME_DEBUG__.getState());
const CITY_EDGE=-5800;
function ch2Save(z){
 const c=createCampaign();receiveSeed(c);activateCore(c);const campaign=upgradeCampaign(migrateCampaign(c));
 return {schemaVersion:3,truck:{position:[roadX(z),roadHeight(z)+1.7,z],rotation:[0,0,0,1]},player:{position:[roadX(z)-3,roadHeight(z)+1,z]},context:'driving',fuel:120,temperature:40,engineOn:true,campaign};
}
async function settings(page){await page.setViewportSize({width:1280,height:720});await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0,subtitles:true})));}
async function continueSave(page,data){
 await page.request.get('/api/saves');await page.request.delete('/api/saves/1');expect((await page.request.post('/api/saves',{data:{slot:'1',data}})).status()).toBe(201);
 await page.goto('/');await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'Continuar',exact:true}).click();
 await page.waitForFunction(()=>['driving','paused','walking'].includes(window.__GAME_DEBUG__?.getState().mode),null,{timeout:60000});
 if((await state(page)).mode==='paused'){await page.keyboard.press('Escape');}
 await expect.poll(async()=>(await state(page)).mode,{timeout:30000}).toBe('driving');
}
async function capture(page,id,prefix){
 const scene=page.getByRole('region',{name:'Cena'}),shots=CAMPAIGN_BEATS[id].shots,metrics=[];
 for(let i=0;i<shots.length;i++){const s=shots[i],want=s.caption?.text||null,card=s.card?.text||null;
  await expect.poll(async()=>{const c=(await state(page)).cutscene;return !!c&&c.id===id&&(want?c.caption?.text===want:c.card?.text===card);},{timeout:30000,intervals:[100]}).toBe(true);
  if(want)await expect(scene.getByRole('status')).toHaveCSS('opacity','1');await page.waitForTimeout(900);await page.screenshot({path:`${dir}/${prefix}-${i+1}.png`});
  const st=await state(page);metrics.push({id,shot:i+1,drawCalls:st.drawCalls,triangles:st.triangles});
 }
 return metrics;
}

test('primeiro contato com Renata: ao fechar o rádio depois de aceitar a Semente, uma vez',async({page})=>{
 test.setTimeout(300000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await settings(page);
 await page.goto('/');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'01 Novo jogo'}).click();await skipPrologue(page);
 await page.getByRole('button',{name:'Pular tutorial',exact:true}).click();await expect.poll(async()=>(await state(page)).tutorial.status).toBe('skipped');
 await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-19,z:12}));await meetSurvivor(page);
 await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-19,z:8}));await page.keyboard.press('KeyF');
 await page.getByRole('button',{name:'Aceitar a Semente e assumir a viagem'}).click();await expect(page.getByRole('heading',{name:'Rádio de ondas curtas'})).toBeVisible();
 expect((await state(page)).cutscene??null).toBeNull();// o rádio continua sendo o primeiro passo
 const accepted=await state(page);await page.keyboard.press('Escape');
 await expect.poll(async()=>(await state(page)).cutscene?.id,{timeout:20000}).toBe('first-contact');
 const metrics=await capture(page,'first-contact','contato');
 await expect.poll(async()=>(await state(page)).mode,{timeout:30000}).toBe('walking');
 const after=await state(page);expect(after.campaign.story.scenes['first-contact']).toBe('watched');expect(after.campaign.inventory).toEqual(accepted.campaign.inventory);expect(after.campaign.seed).toEqual(accepted.campaign.seed);
 await page.waitForTimeout(1500);expect((await state(page)).cutscene??null).toBeNull();// não repete
 await writeFile(`${dir}/metrics-contato.json`,JSON.stringify(metrics,null,1));expect(errors).toEqual([]);
});

test('Cidades Esqueleto: cruzar o limite dirigindo dispara a cena uma vez; carregar dentro da região não dispara',async({page})=>{
 test.setTimeout(300000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await settings(page);
 await continueSave(page,ch2Save(CITY_EDGE+45));const before=await state(page);expect(before.region).not.toBe('cities');
 await page.keyboard.down('KeyW');
 await expect.poll(async()=>(await state(page)).cutscene?.id,{timeout:90000,intervals:[200]}).toBe('skeleton-discovery');
 await page.keyboard.up('KeyW');
 const start=await state(page);expect(start.position[2]).toBeLessThan(CITY_EDGE+2);// atravessou de verdade
 const metrics=await capture(page,'skeleton-discovery','cidades');
 await expect.poll(async()=>(await state(page)).mode,{timeout:30000}).toBe('driving');
 const after=await state(page);expect(after.campaign.story.scenes['skeleton-discovery']).toBe('watched');expect(after.campaign.inventory).toEqual(before.campaign.inventory);
 // Um save carregado já dentro das Cidades (outra partida, sem a cena) não a dispara.
 await continueSave(page,ch2Save(CITY_EDGE-200));await page.waitForTimeout(2500);
 const inside=await state(page);expect(inside.region).toBe('cities');expect(inside.cutscene??null).toBeNull();expect(inside.campaign.story?.scenes?.['skeleton-discovery']).toBeUndefined();
 await writeFile(`${dir}/metrics-cidades.json`,JSON.stringify(metrics,null,1));expect(errors).toEqual([]);
});

test('apresentação do sinal da Voz e da véspera do Horizonte (captura)',async({page})=>{
 test.setTimeout(300000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await settings(page);
 const metrics=[];
 for(const [id,z,prefix] of [['voice-signal',-15200,'voz'],['horizon-eve',-17300,'horizonte']]){
  await continueSave(page,ch2Save(z));await page.waitForTimeout(2000);
  expect(await page.evaluate(id=>window.__GAME_DEBUG__.playScene(id),id)).toBe(true);
  metrics.push(...await capture(page,id,prefix));
  await expect.poll(async()=>(await state(page)).mode,{timeout:30000}).toBe('driving');
  expect((await state(page)).campaign.story.scenes[id]).toBe('watched');
 }
 await writeFile(`${dir}/metrics-voz-horizonte.json`,JSON.stringify(metrics,null,1));expect(errors).toEqual([]);
});

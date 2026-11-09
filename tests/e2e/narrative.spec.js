import {evidencePath} from '../helpers/evidence-path.js';
import {enterFromNewTutorial} from '../helpers/start-driving.js';
import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const dir=evidencePath('narrative-0.14.0');
const state=page=>page.evaluate(()=>window.__GAME_DEBUG__.getState());
test('rádio narrativo: transmissão chega em cruzeiro real, aparece legendada e fica no registro',async({page})=>{
 test.setTimeout(240000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1280,height:720});await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0,subtitles:true})));
 await page.goto('/');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:60000});await page.getByRole('button',{name:'01 Novo jogo'}).click();await enterFromNewTutorial(page);await page.waitForFunction(()=>window.__GAME_DEBUG__?.getState().mode==='driving');
 expect((await state(page)).radioLine??null).toBeNull();
 await page.keyboard.press('KeyE');await expect.poll(async()=>(await state(page)).rpm).toBeGreaterThan(600);
 await page.keyboard.down('KeyW');
 await expect(page.getByTestId('radio-line')).toBeVisible({timeout:120000});
 await page.waitForTimeout(1200);await page.getByTestId('radio-line').screenshot({path:`${dir}/radio-line-element.png`});await page.screenshot({path:`${dir}/radio-line.png`});const box=await page.getByTestId('radio-line').boundingBox();expect(box.y).toBeLessThan(200);
 await page.keyboard.up('KeyW');
 const s=await state(page);expect(s.speedKmh).toBeGreaterThan(5);expect(s.radioLine.text.length).toBeGreaterThan(10);expect(s.campaign.story.radio).toContain(s.radioLine.id);
 await page.keyboard.down('Space');await expect.poll(async()=>(await state(page)).speedKmh,{timeout:30000}).toBeLessThan(1);await page.keyboard.up('Space');
 expect(errors).toEqual([]);
});

// Fixture: legacy save with Núcleo 1 active (chapter 2), loaded through the
// real API and "Continuar"; the visit uses the same physical parking/exit
// helpers as the phase 4 shelter tests.
import {createCampaign,receiveSeed,activateCore} from '../../src/game/missions/campaign.js';
import {migrateCampaign} from '../../src/game/survival/expedition.js';
import {SHELTERS} from '../../src/data/network.js';
import {interactionPoint} from '../../src/game/missions/NetworkController.js';
import {parkedExit} from '../helpers/parked-exit.js';
function chapterTwo(){const c=createCampaign();receiveSeed(c);activateCore(c);const campaign=migrateCampaign(c);Object.assign(campaign.inventory.player,{water:4,food:3,scrap:8,parts:2,diesel:0});return {schemaVersion:2,truck:{position:[0,2,5],rotation:[0,0,0,1]},player:{position:[-3,1,5]},context:'driving',fuel:140,temperature:30,engineOn:false,campaign};}
test('escolha narrativa: Lia oferece a decisão, a água sai da mochila, a reação aparece e a escolha fica salva no servidor',async({page})=>{
 test.setTimeout(300000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1280,height:720});await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0,subtitles:true})));
 await page.request.get('/api/saves');const slots=(await (await page.request.get('/api/saves')).json()).saves.map(s=>s.slot);const slot=['1','2','3'].find(s=>!slots.includes(s))||'3';if(slots.includes(slot))await page.request.delete(`/api/saves/${slot}`);
 expect((await page.request.post('/api/saves',{data:{slot,data:chapterTwo()}})).status()).toBe(201);
 await page.goto('/');await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:60000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.waitForFunction(()=>window.__GAME_DEBUG__?.getState().mode==='driving');
 const lia={...SHELTERS.find(s=>s.id==='lia'),kind:'shelter'};
 await page.evaluate(({x,z})=>window.__GAME_DEBUG__.teleport({x,z}),{x:lia.x-12,z:lia.z+17});await parkedExit(page);await page.evaluate(p=>window.__GAME_DEBUG__.teleportPlayer(p),interactionPoint(lia));await page.keyboard.press('KeyF');
 await expect(page.getByRole('heading',{name:'Lia',exact:true})).toBeVisible();
 const choice=page.getByRole('region',{name:'Decisão importante'});await expect(choice).toBeVisible();await expect(choice).toContainText('As crianças daqui não veem água limpa');
 const water=(await state(page)).campaign.inventory.player.water;
 await choice.getByRole('button',{name:/Dividir duas águas/}).click();
 await expect.poll(async()=>(await state(page)).campaign.story?.choices?.['ch2-water-share']).toBe('share');
 expect((await state(page)).campaign.inventory.player.water).toBe(water-2);
 await expect(page.getByRole('region',{name:'Decisão tomada'})).toContainText('Eu não esqueço quem divide');await page.waitForTimeout(600);await page.screenshot({path:`${dir}/lia-choice.png`});
 await expect.poll(async()=>(await (await page.request.get(`/api/saves/${slot}`)).json()).data.campaign.story?.choices?.['ch2-water-share'],{timeout:20000}).toBe('share');
 expect(errors).toEqual([]);
});

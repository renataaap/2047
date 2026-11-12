import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {evidencePath} from '../helpers/evidence-path.js';
import {createCampaign,receiveSeed,activateCore} from '../../src/game/missions/campaign.js';
import {migrateCampaign} from '../../src/game/survival/expedition.js';
import {upgradeCampaign} from '../../src/game/missions/network.js';
import {ensureStory} from '../../src/game/narrative/story.js';
import {roadX,roadHeight} from '../../src/game/world/terrain.js';
import {BRUTUS_SPOT,REACTIONS} from '../../src/game/narrative/cutscenes/brutus.js';

// Story 005: primeiro encontro físico com Garcia ('brutus-meeting'), depois da decisão do pedágio.
const dir=evidencePath('brutus-meeting-0.14.0');
const state=page=>page.evaluate(()=>window.__GAME_DEBUG__.getState());
const NEAR={x:BRUTUS_SPOT.x-3,z:BRUTUS_SPOT.z+8},FAR={x:BRUTUS_SPOT.x-4,z:BRUTUS_SPOT.z+22};
function save(option){
 const c=createCampaign();receiveSeed(c);activateCore(c);const campaign=upgradeCampaign(migrateCampaign(c));ensureStory(campaign).choices['ch3-brutus-toll']=option;
 const tz=BRUTUS_SPOT.z+30;
 return {schemaVersion:3,truck:{position:[roadX(tz),roadHeight(tz)+1.7,tz],rotation:[0,0,0,1]},player:{position:[FAR.x,roadHeight(FAR.z)+1,FAR.z]},context:'walking',fuel:120,temperature:30,engineOn:false,campaign};
}
async function boot(page,option,reduced=false){
 if(reduced)await page.emulateMedia({reducedMotion:'reduce'});
 await page.setViewportSize({width:1280,height:720});
 await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0,subtitles:true})));
 await page.request.get('/api/saves');await page.request.delete('/api/saves/1');expect((await page.request.post('/api/saves',{data:{slot:'1',data:save(option)}})).status()).toBe(201);
 await page.goto('/');await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'Continuar',exact:true}).click();
 await expect.poll(async()=>(await state(page)).mode,{timeout:60000}).toBe('walking');
 await page.evaluate(p=>window.__GAME_DEBUG__.teleportPlayer(p),FAR);await page.waitForTimeout(800);
}
const SHOTS=[
 ['1-garcia-chega',s=>/caminhão velho/.test(s.cutscene?.caption?.text||'')],
 ['2-reacao-escolha',s=>s.cutscene?.caption?.text===REACTIONS.refuse],
 ['3-sementes',s=>/Sementes/.test(s.cutscene?.caption?.text||'')],
 ['4-protejo-os-meus',s=>/protejo os meus/.test(s.cutscene?.caption?.text||'')],
];

test('Garcia aparece depois da decisão do pedágio, em cena, uma vez; recarga não repete',async({page})=>{
 test.setTimeout(360000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await boot(page,'refuse');const scene=page.getByRole('region',{name:'Cena'});
 const before=await state(page);expect(before.brutus).toMatchObject({visible:false,solid:false});expect(before.campaign.story.scenes['brutus-meeting']).toBeUndefined();
 await page.evaluate(p=>window.__GAME_DEBUG__.teleportPlayer(p),NEAR);
 await expect.poll(async()=>(await state(page)).cutscene?.id,{timeout:20000}).toBe('brutus-meeting');
 const start=await state(page);expect(start.mode).toBe('cinematic');expect(start.brutus.visible).toBe(true);expect(start.brutus.solid).toBe(false);const metrics=[];
 for(const [name,match] of SHOTS){
  await expect.poll(async()=>match(await state(page)),{timeout:30000,intervals:[100]}).toBe(true);
  await expect(scene.getByRole('status')).toHaveCSS('opacity','1');await page.waitForTimeout(900);await page.screenshot({path:`${dir}/${name}.png`});
  const s=await state(page);expect(s.simulation.steps).toBe(start.simulation.steps);// só apresentação
  metrics.push({shot:name,drawCalls:s.drawCalls,triangles:s.triangles});
 }
 await expect.poll(async()=>(await state(page)).mode,{timeout:30000}).toBe('walking');await expect(scene).toBeHidden();
 const after=await state(page);expect(after.campaign.story.scenes['brutus-meeting']).toBe('watched');expect(after.campaign.story.choices['ch3-brutus-toll']).toBe('refuse');
 expect(after.campaign.inventory).toEqual(before.campaign.inventory);expect(after.brutus).toMatchObject({visible:true,solid:true});
 expect(after.brutus.position[0]).toBeCloseTo(BRUTUS_SPOT.x,2);expect(after.brutus.position[2]).toBeCloseTo(BRUTUS_SPOT.z,2);
 await page.screenshot({path:`${dir}/5-depois-da-cena.png`});
 // Reinício real: salvar, recarregar e voltar perto da bomba — Garcia está lá, sem nova cena.
 await page.keyboard.press('Escape');await page.getByRole('button',{name:'Salvar / carregar partida'}).click();const saved=page.waitForResponse(r=>r.url().endsWith('/api/saves/1')&&r.request().method()==='PUT');await page.getByRole('button',{name:'Salvar neste slot'}).first().click();expect((await saved).ok()).toBe(true);// o PUT real, não um aviso antigo
 await expect(page.getByRole('dialog').getByRole('status')).toContainText('Partida salva',{timeout:20000});
 await page.reload();await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'Continuar',exact:true}).click();
 await expect.poll(async()=>(await state(page)).mode,{timeout:60000}).toBe('walking');
 await page.evaluate(p=>window.__GAME_DEBUG__.teleportPlayer(p),NEAR);await page.waitForTimeout(1500);
 const loaded=await state(page);expect(loaded.cutscene??null).toBeNull();expect(loaded.campaign.story.scenes['brutus-meeting']).toBe('watched');expect(loaded.brutus).toMatchObject({visible:true,solid:true});
 await page.screenshot({path:`${dir}/6-recarga.png`});
 await writeFile(`${dir}/metrics.json`,JSON.stringify(metrics,null,1));expect(errors).toEqual([]);
});

test('Esc pula o encontro no mesmo estado; redução de movimento mostra só a reação à escolha',async({page})=>{
 test.setTimeout(240000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await boot(page,'pay');await page.evaluate(p=>window.__GAME_DEBUG__.teleportPlayer(p),NEAR);
 await expect.poll(async()=>(await state(page)).cutscene?.id,{timeout:20000}).toBe('brutus-meeting');await page.waitForTimeout(1200);
 await page.keyboard.press('Escape');await expect.poll(async()=>(await state(page)).mode).toBe('walking');
 const skipped=await state(page);expect(skipped.campaign.story.scenes['brutus-meeting']).toBe('skipped');expect(skipped.brutus).toMatchObject({visible:true,solid:true});
 expect(skipped.brutus.position[0]).toBeCloseTo(BRUTUS_SPOT.x,2);expect(skipped.brutus.position[2]).toBeCloseTo(BRUTUS_SPOT.z,2);
 await boot(page,'water',true);const scene=page.getByRole('region',{name:'Cena'});
 await page.evaluate(p=>window.__GAME_DEBUG__.teleportPlayer(p),NEAR);
 await expect.poll(async()=>(await state(page)).cutscene?.id,{timeout:20000}).toBe('brutus-meeting');
 expect((await state(page)).cutscene).toMatchObject({reduced:true});await expect(scene.getByRole('status')).toContainText(REACTIONS.water);
 await page.screenshot({path:`${dir}/reduzido-reacao.png`});
 await expect.poll(async()=>(await state(page)).mode,{timeout:15000}).toBe('walking');
 expect((await state(page)).campaign.story.scenes['brutus-meeting']).toBe('watched');expect(errors).toEqual([]);
});

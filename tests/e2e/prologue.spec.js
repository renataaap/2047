import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {evidencePath} from '../helpers/evidence-path.js';
import {roadAccessFixture} from '../helpers/road-access-fixture.js';

// Story 002: prólogo 2027 → 2047 no Novo Jogo (sem gancho de debug: fluxo real).
const dir=evidencePath('prologue-0.14.0');
const state=page=>page.evaluate(()=>window.__GAME_DEBUG__.getState());
const TONES=['clean','odd','plasma','tunnel','black','ash'];
async function newGame(page,reduced=false){
 await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});
 await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0,subtitles:true})));
 await page.goto('/');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:60000});
 await page.getByRole('button',{name:'01 Novo jogo'}).click();
 await expect.poll(async()=>(await state(page))?.cutscene?.id,{timeout:60000}).toBe('prologue-2027');
}

test('Novo Jogo abre o prólogo 2027→2047 inteiro, sem avançar a simulação, e entrega o controle ao tutorial',async({page})=>{
 test.setTimeout(300000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await newGame(page);const scene=page.getByRole('region',{name:'Cena'});
 const metrics=[];const first=await state(page);expect(first.mode).toBe('cinematic');expect(first.campaign.story?.scenes?.['prologue-2027']).toBeUndefined();
 for(const tone of TONES){
  await expect.poll(async()=>(await state(page)).cutscene?.tone,{timeout:60000,intervals:[100]}).toBe(tone);
  if(tone==='black'){await expect(scene.getByRole('heading')).toContainText('Vinte anos depois');await expect(scene.getByRole('heading')).toHaveCSS('opacity','1');}
  else{await expect(scene.locator('.cutscene-grade')).toHaveCSS('opacity','1');await expect(scene.getByRole('status')).toHaveCSS('opacity','1');}
  await page.screenshot({path:`${dir}/${TONES.indexOf(tone)+1}-${tone}.png`});
  const s=await state(page);expect(s.simulation.steps).toBe(first.simulation.steps);// física e relógio parados durante a abertura
  metrics.push({tone,drawCalls:s.drawCalls,triangles:s.triangles,geometries:s.renderResources.geometries,textures:s.renderResources.textures});
 }
 await expect.poll(async()=>(await state(page)).mode,{timeout:60000}).toBe('walking');await expect(scene).toBeHidden();
 await page.waitForTimeout(1500);const after=await state(page);
 metrics.push({tone:'controle',drawCalls:after.drawCalls,triangles:after.triangles,geometries:after.renderResources.geometries,textures:after.renderResources.textures});
 await writeFile(`${dir}/metrics.json`,JSON.stringify(metrics,null,1));
 const ash=metrics.find(m=>m.tone==='ash');expect(after.renderResources.geometries).toBeLessThan(ash.geometries-20);// set de 2027 liberado ao fim
 expect(after.campaign.story.scenes).toMatchObject({'prologue-2027':'watched','intro-2047':'watched'});
 await expect(page.getByRole('button',{name:'Pular tutorial',exact:true})).toBeVisible();// tutorial começa depois da abertura
 expect(after.tutorial.completed).toEqual([]);expect(after.tutorial.step?.id).toBe(first.tutorial.step?.id);expect(after.tutorial.total).toBe(21);// 21 objetivos, nenhum avançou
 await page.screenshot({path:`${dir}/7-controle-tutorial.png`});
 expect(errors).toEqual([]);
});

test('Space pula o prólogo no meio; com redução de movimento só a cartela 2047, curta',async({page})=>{
 test.setTimeout(240000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await newGame(page);await expect.poll(async()=>(await state(page)).cutscene?.tone,{timeout:60000}).toBe('odd');
 await page.keyboard.press('Space');await expect.poll(async()=>(await state(page)).mode).toBe('walking');
 expect((await state(page)).campaign.story.scenes).toMatchObject({'prologue-2027':'skipped','intro-2047':'skipped'});
 await expect(page.getByRole('button',{name:'Pular tutorial',exact:true})).toBeVisible();
 await newGame(page,true);const scene=page.getByRole('region',{name:'Cena'});
 const reduced=await state(page);expect(reduced.cutscene).toMatchObject({reduced:true,tone:'black',card:{kicker:'2047',text:'Vinte anos depois'}});
 await expect(scene.getByRole('heading')).toContainText('Vinte anos depois');await page.screenshot({path:`${dir}/reduzido-cartela.png`});
 await expect.poll(async()=>(await state(page)).mode,{timeout:8000}).toBe('walking');
 expect((await state(page)).campaign.story.scenes).toMatchObject({'prologue-2027':'watched','intro-2047':'watched'});
 expect(errors).toEqual([]);
});

test('Continuar um save legado nunca abre o prólogo',async({page})=>{
 test.setTimeout(180000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('about:blank');await page.request.delete('/api/saves/1');
 const {data}=roadAccessFixture('core-1');delete data.campaign.story;
 expect((await page.request.post('/api/saves',{data:{slot:'1',data}})).status()).toBe(201);
 await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
 await page.goto('/');await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:60000});
 await page.getByRole('button',{name:'Continuar',exact:true}).click();
 await expect.poll(async()=>(await state(page))?.mode,{timeout:60000}).not.toBe('menu');
 const modes=new Set();for(let i=0;i<20;i++){const s=await state(page);modes.add(s.mode);expect(s.cutscene?.id).not.toBe('prologue-2027');await page.waitForTimeout(150);}
 expect(modes.has('cinematic')).toBe(false);
 expect((await state(page)).campaign.story?.scenes?.['prologue-2027']).toBeUndefined();
 expect((await page.request.delete('/api/saves/1')).status()).toBe(200);expect(errors).toEqual([]);
});

test('perfis Médio e Alto: o set de 2027 aparece inteiro, sem o mundo de 2047 vazando',async({page})=>{
 test.setTimeout(300000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));const metrics=[];
 for(const quality of ['medio','alto']){
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.addInitScript(q=>localStorage.setItem('aurora-settings',JSON.stringify({quality:q,scale:.75,volume:0,subtitles:true})),quality);
  await page.goto('/');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:60000});await page.getByRole('button',{name:'01 Novo jogo'}).click();
  for(const tone of ['clean','tunnel']){
   await expect.poll(async()=>(await state(page))?.cutscene?.tone,{timeout:60000,intervals:[100]}).toBe(tone);
   await expect(page.getByRole('region',{name:'Cena'}).getByRole('status')).toHaveCSS('opacity','1');
   await page.screenshot({path:`${dir}/${quality}-${tone}.png`});const s=await state(page);metrics.push({quality,tone,drawCalls:s.drawCalls,triangles:s.triangles});
  }
  await page.keyboard.press('Escape');await expect.poll(async()=>(await state(page)).mode).toBe('walking');
 }
 await writeFile(`${dir}/metrics-perfis.json`,JSON.stringify(metrics,null,1));expect(errors).toEqual([]);
});

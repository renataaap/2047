import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {evidencePath} from '../helpers/evidence-path.js';
import {roadAccessFixture} from '../helpers/road-access-fixture.js';
import {skipPrologue} from '../helpers/start-driving.js';

// Story 002: prólogo 2027 → 2047 no Novo Jogo (sem gancho de debug: fluxo real).
// Story 003: em seguida, a introdução do Dante no barracão e do Titã ('intro-2047').
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

test('Novo Jogo abre o prólogo 2027→2047 e a introdução do Dante, sem avançar a simulação, e entrega o controle ao tutorial',async({page})=>{
 test.setTimeout(420000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
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
 // Story 003: a introdução encadeada (barracão, Titã, Dante) e a volta ao olhar do jogador.
 await expect.poll(async()=>(await state(page)).cutscene?.id,{timeout:60000,intervals:[100]}).toBe('intro-2047');
 const introStart=await state(page);
 for(const [name,match] of [['8-intro-barracao',s=>s.cutscene?.tone==='ash'&&!s.cutscene?.caption],['9-intro-tita',s=>/Titã Rocha Clara/.test(s.cutscene?.caption?.text||'')],['10-intro-dante',s=>/Eu dirijo/.test(s.cutscene?.caption?.text||'')]]){
  await expect.poll(async()=>match(await state(page)),{timeout:60000,intervals:[100]}).toBe(true);
  await expect(scene.locator('.cutscene-grade')).toHaveCSS('opacity','1');if(name!=='8-intro-barracao')await expect(scene.getByRole('status')).toHaveCSS('opacity','1');
  await page.waitForTimeout(name==='10-intro-dante'?1200:400);await page.screenshot({path:`${dir}/${name}.png`});
  const s=await state(page);expect(s.simulation.steps).toBe(first.simulation.steps);
  metrics.push({tone:name,drawCalls:s.drawCalls,triangles:s.triangles,geometries:s.renderResources.geometries,textures:s.renderResources.textures});
 }
 await expect.poll(async()=>(await state(page)).mode,{timeout:60000}).toBe('walking');await expect(scene).toBeHidden();
 // Sem salto: mesma posição no plano; no eixo Y só o assentamento do spawn na superfície quando a física volta.
 { const a=introStart.playerPosition,b=(await state(page)).playerPosition;expect(Math.hypot(b[0]-a[0],b[2]-a[2])).toBeLessThan(.05);expect(Math.abs(b[1]-a[1])).toBeLessThan(.35); }
 await page.waitForTimeout(1500);const after=await state(page);
 metrics.push({tone:'controle',drawCalls:after.drawCalls,triangles:after.triangles,geometries:after.renderResources.geometries,textures:after.renderResources.textures});
 await writeFile(`${dir}/metrics.json`,JSON.stringify(metrics,null,1));
 const ash=metrics.find(m=>m.tone==='ash');expect(after.renderResources.geometries).toBeLessThan(ash.geometries-20);// set de 2027 liberado ao fim
 expect(after.campaign.story.scenes).toMatchObject({'prologue-2027':'watched','intro-2047':'watched'});
 await expect(page.getByRole('button',{name:'Pular tutorial',exact:true})).toBeVisible();// tutorial começa depois da abertura
 expect(after.tutorial.completed).toEqual([]);expect(after.tutorial.step?.id).toBe(first.tutorial.step?.id);expect(after.tutorial.total).toBe(21);// 21 objetivos, nenhum avançou
 await page.screenshot({path:`${dir}/11-controle-tutorial.png`});
 // Controle a pé imediato, com colisão/Y pela superfície real: anda para a frente e continua no chão.
 const before=after.playerPosition;await page.keyboard.down('KeyW');await expect.poll(async()=>{const p=(await state(page)).playerPosition;return Math.hypot(p[0]-before[0],p[2]-before[2]);},{timeout:20000}).toBeGreaterThan(.8);await page.keyboard.up('KeyW');
 const moved=await state(page);expect(moved.mode).toBe('walking');expect(Math.abs(moved.playerPosition[1]-before[1])).toBeLessThan(.6);
 expect(errors).toEqual([]);
});

test('Space pula o prólogo e depois a introdução; com redução de movimento só a cartela e a fala, curtas',async({page})=>{
 test.setTimeout(240000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await newGame(page);await expect.poll(async()=>(await state(page)).cutscene?.tone,{timeout:60000}).toBe('odd');
 await page.keyboard.press('Space');await expect.poll(async()=>(await state(page)).cutscene?.id).toBe('intro-2047');// cada cena se pula separadamente
 await page.waitForTimeout(1500);expect((await state(page)).cutscene?.id).toBe('intro-2047');
 await page.keyboard.press('Space');await expect.poll(async()=>(await state(page)).mode).toBe('walking');
 expect((await state(page)).campaign.story.scenes).toMatchObject({'prologue-2027':'skipped','intro-2047':'skipped'});
 await expect(page.getByRole('button',{name:'Pular tutorial',exact:true})).toBeVisible();
 await newGame(page,true);const scene=page.getByRole('region',{name:'Cena'});
 const reduced=await state(page);expect(reduced.cutscene).toMatchObject({reduced:true,tone:'black',card:{kicker:'2047',text:'Vinte anos depois'}});
 await expect(scene.getByRole('heading')).toContainText('Vinte anos depois');await page.screenshot({path:`${dir}/reduzido-cartela.png`});
 await expect.poll(async()=>(await state(page)).mode,{timeout:20000}).toBe('walking');
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
  await skipPrologue(page);// abertura inteira: prólogo e introdução do Dante
 }
 await writeFile(`${dir}/metrics-perfis.json`,JSON.stringify(metrics,null,1));expect(errors).toEqual([]);
});

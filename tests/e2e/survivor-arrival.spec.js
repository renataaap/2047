import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {evidencePath} from '../helpers/evidence-path.js';
import {skipPrologue} from '../helpers/start-driving.js';

// Story 004: chegada da sobrevivente com a primeira Semente ('first-seed'), fluxo real.
const dir=evidencePath('survivor-arrival-0.14.0');
const state=page=>page.evaluate(()=>window.__GAME_DEBUG__.getState());
async function newGame(page,reduced=false){
 if(reduced)await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
 await page.goto('/');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:90000});
 await page.getByRole('button',{name:'01 Novo jogo'}).click();await skipPrologue(page);
 await page.getByRole('button',{name:'Pular tutorial',exact:true}).click();await expect.poll(async()=>(await state(page)).tutorial.status).toBe('skipped');
}
const SHOTS=[
 ['1-chegada-estrada',s=>s.cutscene?.tone==='ash'&&!s.cutscene?.caption],
 ['2-chegada-abrigo',s=>/Dante Rocha Negra\?/.test(s.cutscene?.caption?.text||'')],
 ['3-semente',s=>/Semente de Ignição/.test(s.cutscene?.caption?.text||'')],
 ['4-aviso-vibracao',s=>/vibração/.test(s.cutscene?.caption?.text||'')],
 ['5-tita-nucleo',s=>/primeiro Núcleo/.test(s.cutscene?.caption?.text||'')],
];

test('a sobrevivente chega ao abrigo em cena, a Semente vem só do diálogo, uma vez, e o save não repete',async({page})=>{
 test.setTimeout(360000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await newGame(page);const scene=page.getByRole('region',{name:'Cena'});
 // Antes da chegada: ninguém no abrigo, sem interação.
 const before=await state(page);expect(before.mode).toBe('walking');expect(before.campaign.seed.received).toBe(false);
 expect(before.importedNpc.loaded&&before.importedNpc.visible).toBe(false);expect(before.campaign.story?.scenes?.['first-seed']).toBeUndefined();
 await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-19,z:14}));// 9 m do abrigo, a pé
 await expect.poll(async()=>(await state(page)).cutscene?.id,{timeout:20000}).toBe('first-seed');
 const start=await state(page);expect(start.mode).toBe('cinematic');const metrics=[];
 for(const [name,match] of SHOTS){
  await expect.poll(async()=>match(await state(page)),{timeout:30000,intervals:[100]}).toBe(true);
  await expect(scene.locator('.cutscene-grade')).toHaveCSS('opacity','1');if(name!=='1-chegada-estrada')await expect(scene.getByRole('status')).toHaveCSS('opacity','1');
  await page.waitForTimeout(name==='1-chegada-estrada'?1500:900);await page.screenshot({path:`${dir}/${name}.png`});
  const s=await state(page);expect(s.simulation.steps).toBe(start.simulation.steps);expect(s.campaign.seed.received).toBe(false);// só apresentação
  metrics.push({shot:name,drawCalls:s.drawCalls,triangles:s.triangles,geometries:s.renderResources.geometries,textures:s.renderResources.textures});
 }
 await expect.poll(async()=>(await state(page)).mode,{timeout:30000}).toBe('walking');await expect(scene).toBeHidden();
 const after=await state(page);expect(after.campaign.story.scenes['first-seed']).toBe('watched');expect(after.campaign.seed).toEqual(before.campaign.seed);
 expect(after.campaign.inventory).toEqual(before.campaign.inventory);// a liberação da Semente da cena é verificada no unitário (geometrias variam com o streaming)
 if(after.importedNpc.loaded)expect(after.importedNpc.visible).toBe(true);
 // Diálogo existente: a Semente entra uma vez, com integridade 100.
 await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-19,z:8}));await page.keyboard.press('KeyF');
 await expect(page.getByRole('heading',{name:'Sobrevivente',exact:true})).toBeVisible();await page.screenshot({path:`${dir}/6-dialogo.png`});
 await page.getByRole('button',{name:'Aceitar a Semente e assumir a viagem'}).click();await expect(page.getByRole('heading',{name:'Rádio de ondas curtas'})).toBeVisible();await page.keyboard.press('Escape');
 const taken=await state(page);expect(taken.campaign.seed).toEqual({received:true,integrity:100});expect(taken.campaign.decisions.filter(d=>d==='accepted-first-seed')).toHaveLength(1);
 expect(taken.campaign.inventory).toEqual(before.campaign.inventory);// a cena e o diálogo não concedem itens
 await page.keyboard.press('KeyF');expect((await state(page)).overlay).not.toBe('dialogue');// sem segunda entrega
 // Reinício real: salvar, recarregar a página e continuar.
 await page.keyboard.press('Escape');await page.getByRole('button',{name:'Salvar / carregar partida'}).click();await page.getByRole('button',{name:'Salvar neste slot'}).first().click();
 await expect(page.getByRole('dialog').getByRole('status')).toContainText('Partida salva',{timeout:20000});
 await page.reload();await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'Continuar',exact:true}).click();
 await expect.poll(async()=>(await state(page)).mode,{timeout:60000}).toBe('walking');
 await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-19,z:12}));await page.waitForTimeout(1500);
 const loaded=await state(page);expect(loaded.cutscene??null).toBeNull();expect(loaded.mode).toBe('walking');
 expect(loaded.campaign.seed).toEqual({received:true,integrity:100});expect(loaded.campaign.story.scenes['first-seed']).toBe('watched');
 expect(loaded.campaign.decisions.filter(d=>d==='accepted-first-seed')).toHaveLength(1);
 await page.screenshot({path:`${dir}/7-recarga.png`});
 await writeFile(`${dir}/metrics.json`,JSON.stringify(metrics,null,1));expect(errors).toEqual([]);
});

test('Esc pula a chegada no mesmo estado; com redução de movimento só o plano da Semente',async({page})=>{
 test.setTimeout(240000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await newGame(page);const before=await state(page);
 await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-19,z:14}));
 await expect.poll(async()=>(await state(page)).cutscene?.id,{timeout:20000}).toBe('first-seed');await page.waitForTimeout(1200);
 await page.keyboard.press('Escape');await expect.poll(async()=>(await state(page)).mode).toBe('walking');
 const skipped=await state(page);expect(skipped.campaign.story.scenes['first-seed']).toBe('skipped');expect(skipped.campaign.seed).toEqual(before.campaign.seed);
 await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-19,z:8}));await page.keyboard.press('KeyF');
 await expect(page.getByRole('heading',{name:'Sobrevivente',exact:true})).toBeVisible();// mesmo estado final: ela está lá
 await page.keyboard.press('Escape');
 await newGame(page,true);const scene=page.getByRole('region',{name:'Cena'});
 await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-19,z:14}));
 await expect.poll(async()=>(await state(page)).cutscene?.id,{timeout:20000}).toBe('first-seed');
 expect((await state(page)).cutscene).toMatchObject({reduced:true});await expect(scene.getByRole('status')).toContainText('Semente de Ignição');
 await page.screenshot({path:`${dir}/reduzido-semente.png`});
 await expect.poll(async()=>(await state(page)).mode,{timeout:15000}).toBe('walking');
 expect((await state(page)).campaign.story.scenes['first-seed']).toBe('watched');expect(errors).toEqual([]);
});

import {skipPrologue} from '../helpers/start-driving.js';
import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {installTerrainProbe} from '../helpers/terrain-probe.js';
import {evidencePath} from '../helpers/evidence-path.js';

test('chão do barracão e terreno renderizam em Baixo/Médio/Alto com limite de 16 texturas',async({page})=>{
 test.setTimeout(360000);
 const dir=evidencePath('terrain-visibility');await mkdir(dir,{recursive:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await installTerrainProbe(page,16);
 await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
 await page.goto('/');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:120000});
 await page.getByRole('button',{name:'01 Novo jogo'}).click();await skipPrologue(page);await page.waitForFunction(()=>window.__GAME_DEBUG__?.getState().mode==='walking');
 await page.getByRole('button',{name:'Pular tutorial',exact:true}).click();
 await page.evaluate(()=>window.__GAME_DEBUG__.setTime(9));
 await page.screenshot({path:`${dir}/barracao-inicial.png`});
 const profiles=[];
 for(const [quality,label]of [['baixo','Baixo'],['medio','Médio'],['alto','Alto'],['baixo','Baixo']]){
  if(profiles.length){
   await page.keyboard.press('Escape');await page.getByRole('button',{name:'Configurações',exact:true}).click();await page.getByRole('button',{name:label,exact:true}).click();
   await page.getByRole('button',{name:'Voltar',exact:true}).last().click();await page.getByRole('button',{name:'Voltar à viagem'}).click();
  }
  await expect.poll(async()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().pbr.quality)).toBe(quality);
  // Diagnostic camera position, not a claim of driving/walking a route.
  await page.evaluate(()=>{window.__GAME_DEBUG__.teleportPlayer({x:-5,z:38});window.__GAME_DEBUG__.setTime(9);window.__TERRAIN_PROBE__.arm();});
  await expect.poll(async()=>page.evaluate(()=>window.__TERRAIN_PROBE__.report().visibleTerrainDraws),{timeout:60000}).toBeGreaterThan(0);
  const report=await page.evaluate(()=>({gpu:window.__TERRAIN_PROBE__.report(),state:window.__GAME_DEBUG__.getState()}));
  expect(report.gpu.selectedLimit).toBe(16);expect(report.gpu.error).toBe(0);
  expect(report.gpu.programs.length).toBeGreaterThan(0);
  for(const p of report.gpu.programs){expect(p.linked,p.log).toBe(true);expect(p.samplerCount).toBeLessThanOrEqual(16);}
  expect(report.state.assets.errors).toEqual([]);expect(report.state.pbr.terrainBlend).toBe(true);expect(report.state.sectors).toBe(9);
  await page.screenshot({path:`${dir}/${profiles.length}-${quality}.png`});profiles.push({quality,...report});
 }
 expect(errors).toEqual([]);
 await writeFile(`${dir}/validation.json`,JSON.stringify({method:'Real rendered terrain and occlusion queries. SwiftShader hardware with capability selection limited to 16; this does not emulate a Windows GPU.',profiles,errors},null,2)+'\n');
});

test('Alta conserva todos os mapas em hardware com pelo menos 17 unidades de textura',async({page})=>{
 test.setTimeout(180000);
 const dir=evidencePath('terrain-native');await mkdir(dir,{recursive:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await installTerrainProbe(page,0);
 await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'alto',scale:.75,volume:0})));
 await page.goto('/');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:120000});await page.getByRole('button',{name:'01 Novo jogo'}).click();await skipPrologue(page);
 await page.waitForFunction(()=>window.__GAME_DEBUG__?.getState().mode==='walking');await page.getByRole('button',{name:'Pular tutorial',exact:true}).click();
 await page.evaluate(()=>{window.__GAME_DEBUG__.setTime(9);window.__GAME_DEBUG__.teleportPlayer({x:-5,z:38});window.__TERRAIN_PROBE__.arm();});
 await expect.poll(async()=>page.evaluate(()=>window.__TERRAIN_PROBE__.report().visibleTerrainDraws),{timeout:60000}).toBeGreaterThan(0);
 const report=await page.evaluate(()=>window.__TERRAIN_PROBE__.report());
 const required=report.hardwareLimit>=17?17:16;
 expect(report.programs.some(p=>p.samplerCount===required)).toBe(true);
 for(const p of report.programs){expect(p.linked,p.log).toBe(true);expect(p.samplerCount).toBeLessThanOrEqual(report.hardwareLimit);}
 expect(report.error).toBe(0);expect(errors).toEqual([]);
 await page.screenshot({path:`${dir}/alto.png`});await writeFile(`${dir}/validation.json`,JSON.stringify({report,errors},null,2)+'\n');
});

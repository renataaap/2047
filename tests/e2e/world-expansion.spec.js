import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {DISCOVERY_SITES} from '../../src/data/ambience.js';
import {createCampaign} from '../../src/game/missions/campaign.js';
import {upgradeCampaign} from '../../src/game/missions/network.js';
import {terrainGeometry} from '../../src/game/world/terrainGeometry.js';
import {meshHeightAt} from '../../src/game/world/surfaceHeight.js';
import {roadX} from '../../src/game/world/terrain.js';
const dir='evidence/world-0.8.0',state=p=>p.evaluate(()=>window.__GAME_DEBUG__.getState());
test.afterEach(async({page},info)=>{if(info.status!==info.expectedStatus){try{await writeFile(`${dir}/failure.json`,JSON.stringify(await state(page),null,2));}catch{}}});
async function boot(page){
 await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
 const campaign=upgradeCampaign(createCampaign(1510));for(const key in campaign.inventory.player)campaign.inventory.player[key]=0;
 const ground=terrainGeometry(0,0),playerY=meshHeightAt(ground,-13,22)+1.1;ground.dispose();
 const data={schemaVersion:3,truck:{position:[0,2,5],rotation:[0,0,0,1]},player:{position:[-13,playerY,22]},context:'walking',fuel:4,temperature:26,engineOn:false,campaign};
 await page.request.get('/api/saves');expect((await page.request.post('/api/saves',{data:{slot:'1',data}})).status()).toBe(201);
 await page.goto('/');await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect.poll(async()=>(await state(page)).mode).toBe('walking');await expect(page.locator('.travel-transition')).not.toHaveClass(/active/,{timeout:20000});
}
async function walkTo(page,x,z){await expect.poll(async()=>{const s=await state(page),dx=x-s.playerPosition[0],dz=z-s.playerPosition[2],distance=Math.hypot(dx,dz),approach=Math.min(1,distance/1.6),yaw=s.playerYaw||0;await page.evaluate(input=>window.__GAME_DEBUG__.setInput(input),distance<.45?{}:{x:(dx*Math.cos(yaw)-dz*Math.sin(yaw))/distance*approach,z:(dx*Math.sin(yaw)+dz*Math.cos(yaw))/distance*approach});return distance;},{timeout:60000,intervals:[250]}).toBeLessThan(.45);}
test('0.8: três locais alcançáveis a pé, reservas finitas, boletim e persistência',async({page})=>{
 test.setTimeout(360000);await mkdir(`${dir}/pois`,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await boot(page);const records=[];
 for(const p of DISCOVERY_SITES){
  // Diagnostics shorten only the long journey. Every ramp, entrance and interior uses Player/Rapier.
  await page.evaluate(p=>{window.__GAME_DEBUG__.teleport({x:p.truckX,z:p.z+20});window.__GAME_DEBUG__.teleportPlayer({x:p.x,z:p.z+p.depth/2+8.2});},{...p,truckX:roadX(p.z)});
  if(p.kind==='yard')await expect.poll(async()=>(await state(page)).discoveries.sites.find(s=>s.id==='yard')?.parkedModel,{timeout:30000}).toContain('/dump-truck/');
  if(p.kind==='yard')expect((await state(page)).discoveries.sites.find(s=>s.id==='yard').parkedFloorGap).toBeCloseTo(0,5);
  const steps=(await state(page)).simulation.steps;await expect.poll(async()=>(await state(page)).simulation.steps,{timeout:20000}).toBeGreaterThan(steps+30);await page.screenshot({path:`${dir}/pois/${p.id}-exterior.png`});
  await walkTo(page,p.x,p.z+p.depth/2-.6);await walkTo(page,p.terminal.x,p.z+p.depth/2-.6);await walkTo(page,p.terminal.x,p.terminal.z);
  await expect.poll(async()=>(await state(page)).interaction?.key).toBe(`discovery:${p.id}`);const reached=await state(page);const visual=reached.discoveries.sites.find(s=>s.id===p.id);expect(reached.playerPosition[1]).toBeGreaterThan(visual.floor+.8);
  await page.keyboard.press('KeyF');await expect(page.getByRole('heading',{name:p.name,exact:true})).toBeVisible();await page.getByRole('button',{name:p.action,exact:true}).click();await expect(page.getByRole('button',{name:p.reward?'Reserva já recolhida':'Boletim já registrado',exact:true})).toBeDisabled();await page.screenshot({path:`${dir}/pois/${p.id}.png`});records.push({id:p.id,reached,after:await state(page)});await page.keyboard.press('Escape');
 }
 await page.keyboard.press('KeyM');for(const p of DISCOVERY_SITES)await expect(page.getByRole('dialog')).toContainText(p.name);await page.keyboard.press('Escape');await page.keyboard.press('Escape');await page.getByRole('button',{name:'Salvar / carregar partida'}).click();await page.getByRole('button',{name:'Salvar neste slot'}).first().click();await expect(page.getByRole('dialog').getByRole('status')).toContainText('Partida salva',{timeout:20000});const saved=await state(page);
 await page.reload();await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect.poll(async()=>(await state(page)).campaign.world.claimed.length).toBe(2);const loaded=await state(page);expect(loaded.campaign.world.visited).toEqual(saved.campaign.world.visited);expect(loaded.campaign.world.read).toEqual(['weighbridge']);expect(loaded.campaign.inventory).toEqual(saved.campaign.inventory);expect(errors).toEqual([]);expect(loaded.assets.errors).toEqual([]);await writeFile(`${dir}/pois-flow.json`,JSON.stringify({records,saved,loaded,consoleErrors:errors},null,2));
});

test('0.8: dia e noite, luzes locais, pausa, áudio e relógio salvo',async({page})=>{
 test.setTimeout(180000);await mkdir(`${dir}/atmosphere`,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await boot(page);
 const samples=[];for(const [hour,period]of [[5.7,'Amanhecer'],[9,'Manhã'],[14,'Tarde'],[18.2,'Entardecer'],[23,'Noite']]){
  await page.evaluate(hour=>window.__GAME_DEBUG__.setTime(hour),hour);await expect.poll(async()=>(await state(page)).worldTime.period,{timeout:15000}).toBe(period);await expect(page.getByTestId('world-clock')).toContainText(period);await page.screenshot({path:`${dir}/atmosphere/${hour}.png`});samples.push(await state(page));
 }
 const night=await state(page);expect(night.ambience.lights).toBeGreaterThan(0);expect(night.worldTime.ambientIntensity).toBeGreaterThan(.3);expect(night.ambientAudio.spatialSources).toBe(3);
 const previous=night.playerPosition[2],steps=night.ambientAudio.steps;await page.keyboard.down('KeyW');await expect.poll(async()=>(await state(page)).playerPosition[2],{timeout:20000}).toBeLessThan(previous-1.5);await page.keyboard.up('KeyW');await expect.poll(async()=>(await state(page)).ambientAudio.steps).toBeGreaterThan(steps);
 await page.keyboard.press('Escape');const paused=await state(page);await page.waitForTimeout(1200);expect((await state(page)).campaign.world.daySeconds).toBe(paused.campaign.world.daySeconds);expect((await state(page)).ambientAudio.pausedGain).toBeLessThan(.05);
 await page.getByRole('button',{name:'Configurações',exact:true}).click();await page.getByRole('combobox',{name:'Duração de um dia'}).selectOption('96');await page.getByRole('button',{name:'Voltar',exact:true}).last().click();await page.getByRole('button',{name:'Voltar à viagem'}).click();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('aurora-settings')).dayMinutes)).toBe(96);
 await page.keyboard.press('Escape');await page.getByRole('button',{name:'Salvar / carregar partida'}).click();await page.getByRole('button',{name:'Salvar neste slot'}).first().click();await expect(page.getByRole('dialog').getByRole('status')).toContainText('Partida salva',{timeout:20000});const saved=await state(page);
 await page.reload();await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect.poll(async()=>(await state(page)).worldTime.period,{timeout:15000}).toBe('Noite');const loaded=await state(page);expect(loaded.campaign.world.daySeconds).toBeGreaterThanOrEqual(saved.campaign.world.daySeconds);expect(loaded.campaign.world.daySeconds-saved.campaign.world.daySeconds).toBeLessThan(180);expect(errors).toEqual([]);expect(loaded.assets.errors).toEqual([]);await writeFile(`${dir}/atmosphere-flow.json`,JSON.stringify({samples,paused,saved,loaded,consoleErrors:errors,note:'Only the existing development diagnostics choose sample hours; normal time advances in the real fixed-step loop and pauses in menus. Synthesized audio graph is inspected; no human listening/GPU claim.'},null,2));
});

test('0.8: ambientação por região, equipamentos e descarregamento dos novos modelos',async({page})=>{
 test.setTimeout(240000);await mkdir(`${dir}/regions`,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await boot(page);await page.evaluate(()=>window.__GAME_DEBUG__.setTime(13));await page.keyboard.press('KeyC');await expect.poll(async()=>(await state(page)).dante.wardrobe).toBe('dante');await page.screenshot({path:`${dir}/dante-0.8.png`});await page.keyboard.press('KeyC');
 await page.evaluate(()=>{window.__GAME_DEBUG__.teleport({x:-45,z:-2020});window.__GAME_DEBUG__.teleportPlayer({x:-42,z:-2020});});await expect.poll(async()=>(await state(page)).discoveries.sites.find(s=>s.id==='yard')?.parkedModel,{timeout:30000}).toContain('/dump-truck/');
 const samples=[];for(const [region,z]of [['cities',-7900],['salt',-11800],['glass',-15100],['storm',-19700],['ashes',-250]]){
  await page.evaluate(p=>{window.__GAME_DEBUG__.teleport({x:p.x,z:p.z});window.__GAME_DEBUG__.teleportPlayer({x:p.x+8,z:p.z+5});},{x:roadX(z),z});await expect.poll(async()=>(await state(page)).region).toBe(region);const start=(await state(page)).simulation.steps;await expect.poll(async()=>(await state(page)).simulation.steps,{timeout:20000}).toBeGreaterThan(start+30);
  const s=await state(page);expect(s.ambience.compositions).toBeLessThanOrEqual(9);expect(s.ambience.colliders).toBeLessThan(120);expect(s.discoveries.loaded).not.toContain('yard');await expect.poll(async()=>(await state(page)).assets.modelURLs).not.toContain('/assets/models/trucks/dump-truck/model.glb');await page.screenshot({path:`${dir}/regions/${region}.png`});samples.push({region,ambience:s.ambience,drawCalls:s.drawCalls,triangles:s.triangles,fps:s.fps,models:s.assets.modelURLs});
 }
 expect(errors).toEqual([]);expect((await state(page)).assets.errors).toEqual([]);await writeFile(`${dir}/streaming.json`,JSON.stringify({samples,consoleErrors:errors,renderer:'Software SwiftShader; diagnostic captures, not hardware benchmarks'},null,2));
});

test('0.8: perfis reais trocam texturas, preservam dados herdados e liberam variantes antigas',async({page})=>{
 test.setTimeout(240000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await boot(page);const initial=await state(page);expect(initial.pbr.quality).toBe('baixo');expect(initial.pbr.inheritedDataMaps.concrete).toEqual({source:'rock',normalMatches:true,roughnessMatches:true});
 await page.keyboard.press('Escape');await page.getByRole('button',{name:'Configurações',exact:true}).click();const samples=[];
 for(const quality of ['alto','baixo','alto','baixo']){
  await page.getByRole('button',{name:quality==='alto'?'Alto':'Baixo',exact:true}).click();
  await expect.poll(async()=>(await state(page)).pbr.quality,{timeout:45000}).toBe(quality);
  await expect.poll(async()=>(await state(page)).assets.textures,{timeout:20000}).toBe(initial.assets.textures);
  const s=await state(page);expect(s.pbr.inheritedDataMaps.concrete).toEqual({source:'rock',normalMatches:true,roughnessMatches:true});expect(s.assets.errors).toEqual([]);samples.push({quality,pbr:s.pbr,textures:s.assets.textures,bytes:s.assets.estimatedTextureBytes});
 }
 expect(samples[0].bytes).toBeGreaterThan(samples[1].bytes);expect(samples[2].bytes).toBe(samples[0].bytes);expect(samples[3].bytes).toBe(samples[1].bytes);
 await page.getByRole('button',{name:'Voltar',exact:true}).last().click();await page.getByRole('button',{name:'Voltar à viagem'}).click();await expect.poll(async()=>(await state(page)).mode).toBe('walking');await page.screenshot({path:`${dir}/quality-cycle.png`});
 expect(errors).toEqual([]);await writeFile(`${dir}/quality-cycle.json`,JSON.stringify({initial:{pbr:initial.pbr,textures:initial.assets.textures,bytes:initial.assets.estimatedTextureBytes},samples,consoleErrors:errors,note:'Real installed Poly Haven files; profile changes use UI and asset pruning, without external requests or a synthetic manifest.'},null,2));
});

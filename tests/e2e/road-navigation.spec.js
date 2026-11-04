import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {evidencePath} from '../helpers/evidence-path.js';
import {roadAccessFixture} from '../helpers/road-access-fixture.js';
import {createCampaign} from '../../src/game/missions/campaign.js';
import {upgradeCampaign} from '../../src/game/missions/network.js';
import {legacyHeightAt} from '../../src/game/world/terrain.js';
const dir=evidencePath('roads-navigation'),state=page=>page.evaluate(()=>window.__GAME_DEBUG__.getState());
async function boot(page,data){
 await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
 await page.request.get('/api/saves');expect((await page.request.post('/api/saves',{data:{slot:'1',data}})).status()).toBe(201);
 await page.goto('/');await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect.poll(async()=>(await state(page)).mode).toBe('driving');
}
test('GPS no HUD, destinos e perfis reais, minimapa a pé e recálculo',async({page})=>{
 test.setTimeout(240000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const {data}=roadAccessFixture('core-1');data.truck.position=[0,1.2,-550];data.player.position=[-3,1.2,-550];await boot(page,data);
 await expect(page.getByTestId('navigation-hud')).toBeVisible();await page.getByRole('button',{name:'Ampliar minimapa'}).click();await expect(page.getByTestId('navigation-hud')).toHaveClass(/expanded/);await page.getByRole('button',{name:'Ocultar minimapa'}).click();await expect(page.getByTestId('navigation-hud')).toHaveCount(0);await page.getByRole('button',{name:'Mostrar minimapa'}).click();
 await page.keyboard.press('KeyM');await expect(page.getByTestId('road-map')).toBeVisible();await page.getByRole('button',{name:'Rota A · rodovia e alça leste',exact:true}).click();await expect.poll(async()=>(await state(page)).navigation.segments.some(e=>e.id==='desvio-cinzas')).toBe(true);const paved=(await state(page)).navigation;
 await page.getByRole('button',{name:'Rota B · Cinza Nova e estrada do Vale',exact:true}).click();await expect.poll(async()=>(await state(page)).navigation.surfaces).toContain('terra');await expect(page.getByRole('button',{name:/^Mais econômica/})).toHaveAttribute('aria-pressed','true');const dirt=(await state(page)).navigation;
 await page.getByLabel('Destino da viagem').selectOption('posto-cinza-nova');await expect.poll(async()=>(await state(page)).navigation.destination.id).toBe('posto-cinza-nova');await page.getByRole('button',{name:/^Mais segura/}).click();await page.waitForTimeout(500);await page.screenshot({path:`${dir}/route-planner.png`});await page.keyboard.press('Escape');
 // Diagnostic relocation tests wrong-road recovery separately from physical trips.
 await page.evaluate(()=>window.__GAME_DEBUG__.teleport({x:-360,z:-900}));await expect.poll(async()=>(await state(page)).navigation.reroutes).toBeGreaterThan(0);const recalculated=(await state(page)).navigation;expect(recalculated.path[0].x).toBeCloseTo(-360,0);
 await page.keyboard.press('KeyF');await expect.poll(async()=>(await state(page)).mode).toBe('walking');await expect(page.getByTestId('minimap-svg')).toHaveAttribute('aria-label','Caminhos e interações próximas');await page.screenshot({path:`${dir}/foot-map.png`});expect(errors).toEqual([]);
 await writeFile(`${dir}/navigation.json`,JSON.stringify({paved,dirt,recalculated,errors,diagnosticRelocation:true,physicalJourney:false},null,2)+'\n');
});
test('save legado recebe recuperação próxima, sem duplicação, e persiste a rota',async({page})=>{
 test.setTimeout(240000);await mkdir(dir,{recursive:true});const c=upgradeCampaign(createCampaign(2047));delete c.geography;delete c.navigation;delete c.road.stocks['posto-cinza-nova'];
 const x=-286,z=-660,y=legacyHeightAt(x,z)+1.1,data={schemaVersion:3,truck:{position:[x,y,z],rotation:[0,0,0,1]},player:{position:[x-3,y,z]},context:'driving',fuel:12,temperature:26,engineOn:false,campaign:c};
 await boot(page,data);const migrated=await state(page);expect(migrated.campaign.geography.version).toBe(1);expect(migrated.campaign.geography.migrations.some(m=>m.reason==='new-building')).toBe(true);expect(Math.hypot(migrated.position[0]-x,migrated.position[2]-z)).toBeLessThan(180);expect(migrated.campaign.inventory).toEqual(c.inventory);expect(migrated.campaign.cores).toEqual(c.cores);expect(migrated.campaign.road.stocks['posto-cinza-nova']).toEqual({diesel:90,water:12});
 await page.keyboard.press('KeyM');await page.getByLabel('Destino da viagem').selectOption('garagem-cinza-nova');await page.getByRole('button',{name:/^Mais segura/}).click();await page.keyboard.press('Escape');await page.keyboard.press('Escape');await page.getByRole('button',{name:'Salvar / carregar partida'}).click();await page.getByRole('button',{name:'Salvar neste slot'}).first().click();await expect(page.getByRole('dialog').getByRole('status')).toContainText('Partida salva',{timeout:20000});const before=await state(page);
 await page.reload();await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect.poll(async()=>(await state(page)).mode).toBe('driving');const loaded=await state(page);expect(loaded.campaign.navigation.destination).toBe('garagem-cinza-nova');expect(loaded.campaign.inventory).toEqual(c.inventory);expect(loaded.campaign.geography).toEqual(before.campaign.geography);expect(loaded.campaign.road.stocks).toEqual(before.campaign.road.stocks);await writeFile(`${dir}/legacy-migration.json`,JSON.stringify({source:data,migrated,before,loaded},null,2)+'\n');
});
test('cidade em Baixo/Médio/Alto, cabine noturna e descarregamento',async({page})=>{
 test.setTimeout(420000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const {data}=roadAccessFixture('core-1');data.truck.position=[-226,3,-677];data.player.position=[-230,3,-675];await boot(page,data);await expect.poll(async()=>(await state(page)).city.loaded).toBe(true);
 const profiles=[];
 for(const [id,label]of [['baixo','Baixo'],['medio','Médio'],['alto','Alto']]){
  await page.keyboard.press('Escape');await page.getByRole('button',{name:'Configurações',exact:true}).click();await page.getByRole('button',{name:label,exact:true}).click();await page.getByRole('button',{name:'Voltar',exact:true}).last().click();await page.getByRole('button',{name:'Voltar à viagem'}).click();await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('aurora-settings')).quality)).toBe(id);await page.waitForTimeout(1500);await page.screenshot({path:`${dir}/city-${id}.png`});const s=await state(page);expect(s.city.loaded).toBe(true);expect(s.sectors).toBe(9);expect(s.drawCalls).toBeLessThan(400);expect(s.triangles).toBeLessThan(650000);expect(s.assets.errors).toEqual([]);profiles.push({profile:id,state:s});
 }
 await page.keyboard.press('KeyC');await page.keyboard.press('KeyL');await page.evaluate(()=>window.__GAME_DEBUG__.setTime(21));await page.waitForTimeout(700);await page.screenshot({path:`${dir}/city-night-cab.png`});
 await page.evaluate(()=>window.__GAME_DEBUG__.teleport({x:0,z:-4000}));await expect.poll(async()=>(await state(page)).city.loaded).toBe(false);expect((await state(page)).city.physicalBodies).toBe(0);await page.evaluate(()=>window.__GAME_DEBUG__.teleport({x:-226,z:-677}));await expect.poll(async()=>(await state(page)).city.loaded).toBe(true);const reloaded=await state(page);expect(reloaded.city.physicalBodies).toBe(profiles[0].state.city.physicalBodies);expect(errors).toEqual([]);await writeFile(`${dir}/city-profiles.json`,JSON.stringify({profiles,reloaded,errors,renderer:'Chromium ANGLE SwiftShader (software). Diagnostic positioning, not a human journey or GPU FPS measurement.'},null,2)+'\n');
});

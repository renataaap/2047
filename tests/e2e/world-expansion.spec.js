import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {DISCOVERY_SITES} from '../../src/data/ambience.js';
import {createCampaign} from '../../src/game/missions/campaign.js';
import {upgradeCampaign} from '../../src/game/missions/network.js';
import {roadX} from '../../src/game/world/terrain.js';
const dir='evidence/world-0.8.0',state=p=>p.evaluate(()=>window.__GAME_DEBUG__.getState());
async function boot(page){
 await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
 const campaign=upgradeCampaign(createCampaign(1510));for(const key in campaign.inventory.player)campaign.inventory.player[key]=0;
 const data={schemaVersion:3,truck:{position:[0,2,5],rotation:[0,0,0,1]},player:{position:[-13,1.1,22]},context:'walking',fuel:4,temperature:26,engineOn:false,campaign};
 await page.request.get('/api/saves');expect((await page.request.post('/api/saves',{data:{slot:'1',data}})).status()).toBe(201);
 await page.goto('/');await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect.poll(async()=>(await state(page)).mode).toBe('walking');await expect(page.locator('.travel-transition')).not.toHaveClass(/active/,{timeout:20000});
}
async function walkTo(page,x,z){await expect.poll(async()=>{const s=await state(page),dx=x-s.playerPosition[0],dz=z-s.playerPosition[2],distance=Math.hypot(dx,dz),yaw=s.playerYaw||0;await page.evaluate(input=>window.__GAME_DEBUG__.setInput(input),distance<.45?{}:{x:(dx*Math.cos(yaw)-dz*Math.sin(yaw))/distance,z:(dx*Math.sin(yaw)+dz*Math.cos(yaw))/distance});return distance;},{timeout:40000,intervals:[250]}).toBeLessThan(.45);}
test('0.8: três locais alcançáveis a pé, reservas finitas, boletim e persistência',async({page})=>{
 test.setTimeout(360000);await mkdir(`${dir}/pois`,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await boot(page);const records=[];
 for(const p of DISCOVERY_SITES){
  // Diagnostics shorten only the long journey. Every ramp, entrance and interior uses Player/Rapier.
  await page.evaluate(p=>{window.__GAME_DEBUG__.teleport({x:p.truckX,z:p.z+20});window.__GAME_DEBUG__.teleportPlayer({x:p.x,z:p.z+p.depth/2+8.2});},{...p,truckX:roadX(p.z)});
  if(p.kind==='yard')await expect.poll(async()=>(await state(page)).discoveries.sites.find(s=>s.id==='yard')?.parkedModel,{timeout:30000}).toContain('/dump-truck/');
  const steps=(await state(page)).simulation.steps;await expect.poll(async()=>(await state(page)).simulation.steps,{timeout:20000}).toBeGreaterThan(steps+30);await page.screenshot({path:`${dir}/pois/${p.id}-exterior.png`});
  await walkTo(page,p.x,p.z+p.depth/2-.6);await walkTo(page,p.terminal.x,p.z+p.depth/2-.6);await walkTo(page,p.terminal.x,p.terminal.z);
  await expect.poll(async()=>(await state(page)).interaction?.key).toBe(`discovery:${p.id}`);const reached=await state(page);const visual=reached.discoveries.sites.find(s=>s.id===p.id);expect(reached.playerPosition[1]).toBeGreaterThan(visual.floor+.8);
  await page.keyboard.press('KeyF');await expect(page.getByRole('heading',{name:p.name,exact:true})).toBeVisible();await page.getByRole('button',{name:p.action,exact:true}).click();await expect(page.getByRole('button',{name:p.reward?'Reserva já recolhida':'Boletim já registrado',exact:true})).toBeDisabled();await page.screenshot({path:`${dir}/pois/${p.id}.png`});records.push({id:p.id,reached,after:await state(page)});await page.keyboard.press('Escape');
 }
 await page.keyboard.press('KeyM');for(const p of DISCOVERY_SITES)await expect(page.getByRole('dialog')).toContainText(p.name);await page.keyboard.press('Escape');await page.keyboard.press('Escape');await page.getByRole('button',{name:'Salvar / carregar partida'}).click();await page.getByRole('button',{name:'Salvar neste slot'}).first().click();await expect(page.getByRole('dialog').getByRole('status')).toContainText('Partida salva',{timeout:20000});const saved=await state(page);
 await page.reload();await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect.poll(async()=>(await state(page)).campaign.world.claimed.length).toBe(2);const loaded=await state(page);expect(loaded.campaign.world.visited).toEqual(saved.campaign.world.visited);expect(loaded.campaign.world.read).toEqual(['weighbridge']);expect(loaded.campaign.inventory).toEqual(saved.campaign.inventory);expect(errors).toEqual([]);expect(loaded.assets.errors).toEqual([]);await writeFile(`${dir}/pois-flow.json`,JSON.stringify({records,saved,loaded,consoleErrors:errors},null,2));
});

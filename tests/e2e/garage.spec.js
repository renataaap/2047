import {skipPrologue} from '../helpers/start-driving.js';
import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {roadAccessFixture} from '../helpers/road-access-fixture.js';
import {controlledPhysics,walkPhysical,selectDestination,drivePhysical} from '../helpers/physical-drive.js';
import {evidencePath} from '../helpers/evidence-path.js';
const settle=page=>page.evaluate(()=>new Promise(resolve=>{let n=0;const frame=()=>++n===8?resolve():requestAnimationFrame(frame);requestAnimationFrame(frame);}));
const state=page=>page.evaluate(()=>window.__GAME_DEBUG__.getState()),dir=evidencePath('garage');
async function saveCurrent(page){
 await page.keyboard.press('Escape');await page.getByRole('button',{name:'Salvar / carregar partida'}).click();
 const pending=page.waitForResponse(r=>r.url().endsWith('/api/saves/1')&&r.request().method()==='PUT');await page.getByRole('button',{name:'Salvar neste slot'}).first().click();const response=await pending;expect(response.status()).toBe(200);const saved=await response.json();
 await expect(page.getByRole('dialog').getByRole('status')).toContainText('Partida salva',{timeout:30000});return saved;
}
async function boot(page,prepare){
 const {data}=roadAccessFixture('core-1');data.truck.position=[-320,3,-814];data.player.position=[-326,3,-805];data.fuel=12;data.engineOn=false;data.campaign.inventory.player.diesel=8;prepare?.(data);
 await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
 expect((await page.request.post('/api/saves',{data:{slot:'1',data}})).status()).toBe(201);
 await page.goto('/');await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:120000});await page.getByRole('button',{name:'Continuar',exact:true}).click();
 await page.waitForFunction(()=>window.__GAME_DEBUG__?.getState().mode==='driving');await page.evaluate(()=>{window.__GAME_DEBUG__.controlledStepping(true);window.__GAME_DEBUG__.step({handbrake:true},180);window.__GAME_DEBUG__.publish();});
 await page.keyboard.press('KeyG');await expect(page.getByRole('dialog',{name:'Garagem municipal'})).toBeVisible();
}
test('garagem: prévia, cancelamento, compra, equipamentos, segundo caminhão e persistência',async({page})=>{
 test.setTimeout(360000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await boot(page);const before=await state(page);await settle(page);await page.screenshot({path:`${dir}/original.png`});
 await page.getByRole('button',{name:'Pintura',exact:true}).click();await page.getByRole('button',{name:/Aurora Azul/}).click();const preview=await state(page);expect(preview.appearance.paint.skin).toBe('aurora');expect(preview.campaign.fleet.vehicles['titan-old'].paint.skin).toBe('original');
 await settle(page);await page.screenshot({path:`${dir}/aurora-preview.png`});await page.getByRole('button',{name:'Cancelar prévia'}).click();expect((await state(page)).campaign.inventory).toEqual(before.campaign.inventory);
 await page.getByRole('button',{name:/Aurora Azul/}).click();await page.getByRole('button',{name:/Confirmar pintura/}).click();await expect.poll(async()=>(await state(page)).garage.busy,{timeout:30000}).toBe(false);expect((await state(page)).campaign.fleet.vehicles['titan-old'].paint.skin).toBe('aurora');
 await page.getByRole('button',{name:'Acessórios',exact:true}).click();await page.getByRole('button',{name:/Comprar e instalar Proteção tubular/}).click();await expect.poll(async()=>(await state(page)).garage.record.accessories).toContain('guard');
 await page.getByRole('button',{name:'Mecânica',exact:true}).click();await page.getByRole('button',{name:/Comprar e instalar Ajuste da bomba/}).click();await expect.poll(async()=>(await state(page)).garage.stats.torque).toBeCloseTo(1792,6);
 await page.getByRole('button',{name:'Frota',exact:true}).click();await page.getByRole('button',{name:/^Basculante Municipal/}).click();await expect.poll(async()=>(await state(page)).garage.busy,{timeout:60000}).toBe(false);await settle(page);await page.screenshot({path:`${dir}/basculante-preview.png`});
 await page.getByRole('button',{name:/^Recuperar Basculante/}).click();await expect.poll(async()=>(await state(page)).garage.vehicles).toContain('dump-truck');await page.getByRole('button',{name:/^Basculante Municipal/}).click();await expect.poll(async()=>(await state(page)).garage.busy).toBe(false);await page.getByRole('button',{name:/^Ativar Basculante/}).click();
 await expect.poll(async()=>(await state(page)).garage.activeId,{timeout:60000}).toBe('dump-truck');const selected=await state(page);expect(selected.importedTruck.id).toBe('dump-truck');expect(selected.importedTruck.wheelBindings).toBe(6);expect(selected.fuel).toBe(0);expect(selected.campaign.network.cargo).toBe(before.campaign.network.cargo);expect(selected.integrity).toBe(before.integrity);
 await settle(page);await page.screenshot({path:`${dir}/basculante-active.png`});await page.getByRole('button',{name:'Reparos',exact:true}).click();await page.getByRole('button',{name:'Abastecer até 4 L dos recipientes'}).click();await expect.poll(async()=>(await state(page)).fuel).toBe(4);
 await page.getByRole('button',{name:/Sair da garagem/}).click();await expect.poll(async()=>(await state(page)).mode).toBe('driving');await page.keyboard.press('KeyE');
 await page.evaluate(()=>{const d=window.__GAME_DEBUG__;for(let i=0;i<8;i++)d.step({throttle:-.65},120);d.step({handbrake:true},240);d.publish();});await settle(page);const driven=await state(page);
 expect(driven.position[2]).toBeGreaterThan(-800);expect(driven.importedTruck.wheels.some(w=>Math.abs(w.rotation)>.1)).toBe(true);expect(driven.navigation).toBeTruthy();await settle(page);await page.screenshot({path:`${dir}/basculante-driving.png`});
 const persisted=await saveCurrent(page);expect(Math.hypot(...persisted.data.truck.position.map((v,i)=>v-driven.position[i]))).toBeLessThan(1);
 await page.reload();await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:120000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect.poll(async()=>{const s=await state(page);return s.mode==='driving'&&s.importedTruck.id==='dump-truck';},{timeout:60000}).toBe(true);const loaded=await state(page);expect(loaded.campaign.fleet.vehicles['titan-old'].paint.skin).toBe('aurora');expect(loaded.campaign.network.cargo).toBe(before.campaign.network.cargo);expect(Math.hypot(...loaded.position.map((v,i)=>v-persisted.data.truck.position[i]))).toBeLessThan(1);expect(loaded.fuel).toBeCloseTo(persisted.data.fuel,1);expect(errors).toEqual([]);
 await writeFile(`${dir}/flow.json`,JSON.stringify({notice:'Local garage fixture, not a journey from the barracão. Exit driven with actual Rapier at accelerated diagnostic time; no position assignments during driving.',before,selected,driven,loaded,errors},null,2)+'\n');
});


test('garagem: skins distintas, interior, prévia de peças e bloqueio por recursos',async({page})=>{
 test.setTimeout(240000);await mkdir(dir,{recursive:true});await boot(page);const initial=await state(page);
 await page.getByRole('button',{name:'Pintura',exact:true}).click();await page.getByRole('button',{name:/Cinzas Vermelhas/}).click();await settle(page);await page.screenshot({path:`${dir}/cinzas-vermelhas.png`});await page.getByRole('button',{name:/Confirmar pintura/}).click();await expect.poll(async()=>(await state(page)).garage.busy).toBe(false);
 await page.getByRole('button',{name:'Interior',exact:true}).click();await page.getByRole('button',{name:'Lona oliva e painel cinza'}).click();await settle(page);await page.screenshot({path:`${dir}/interior-personalizado.png`});await page.getByRole('button',{name:/Confirmar interior/}).click();await expect.poll(async()=>(await state(page)).garage.record.interior.seat).toBe('#566552');
 await page.getByRole('button',{name:'Acessórios',exact:true}).click();const funds=(await state(page)).campaign.inventory;await page.getByRole('button',{name:'Prévia de Faróis auxiliares'}).click();expect((await state(page)).appearance.accessories).toContain('lamps');await page.getByRole('button',{name:'Cancelar prévia'}).click();expect((await state(page)).campaign.inventory).toEqual(funds);expect((await state(page)).appearance.accessories).not.toContain('lamps');
 await page.getByRole('button',{name:/Comprar e instalar Faróis auxiliares/}).click();await expect.poll(async()=>(await state(page)).garage.record.accessories).toContain('lamps');await page.getByRole('button',{name:'Lateral',exact:true}).click();await settle(page);await page.screenshot({path:`${dir}/acessorios-lateral.png`});
 expect((await state(page)).campaign.network.cargo).toBe(initial.campaign.network.cargo);
});

test('garagem: falta de recursos não cobra, equipa nem grava uma compra',async({page})=>{
 test.setTimeout(150000);await boot(page,data=>{data.campaign.inventory.player.scrap=0;data.campaign.inventory.truck.scrap=0;});const before=await state(page);
 await page.getByRole('button',{name:'Pintura',exact:true}).click();await page.getByRole('button',{name:/Aurora Azul/}).click();await page.getByRole('button',{name:/Confirmar pintura/}).click();await expect(page.getByRole('status')).toContainText('Recursos insuficientes');expect((await state(page)).campaign.inventory).toEqual(before.campaign.inventory);expect((await state(page)).garage.record.paint.skin).toBe('original');
});

async function shunt(page,direction,targetZ){
 await page.evaluate(({direction,targetZ})=>{const d=window.__GAME_DEBUG__;let f=d.frame();for(let i=0;i<2400;i++){if(direction<0?f.position[2]>targetZ:f.position[2]<targetZ)break;f=d.step({throttle:direction*.65});}d.step({handbrake:true,brake:1},240);d.publish();},{direction,targetZ});
 await settle(page);
}

test('viagem real: barracão, GPS, garagem, personalização, retorno e basculante na cidade',async({page})=>{
 test.setTimeout(600000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));await page.goto('/');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:120000});await page.getByRole('button',{name:'01 Novo jogo'}).click();await skipPrologue(page);await page.waitForFunction(()=>window.__GAME_DEBUG__?.getState().mode==='walking');await page.getByRole('button',{name:'Pular tutorial',exact:true}).click();await controlledPhysics(page);
 await walkPhysical(page,[{x:-13,z:22},{x:-12,z:18.95},{x:-8.2,z:18.95},{x:-3,z:5}]);await page.keyboard.press('KeyF');await expect.poll(async()=>(await state(page)).mode).toBe('driving');
 await page.keyboard.press('KeyG');expect((await state(page)).mode).toBe('driving');await selectDestination(page,'garagem-cinza-nova');await page.keyboard.press('KeyE');
 const path=await page.evaluate(()=>{const p=structuredClone(window.__GAME_DEBUG__.route().path);for(const z of [-792,-804,-814]){const a=p.at(-1);p.push({x:-320,z,y:a.y,s:a.s+Math.hypot(a.x+320,a.z-z)});}return p;});
 const outward=await drivePhysical(page,{label:'barracao-garagem',path});await page.evaluate(()=>{window.__GAME_DEBUG__.step({handbrake:true},180);window.__GAME_DEBUG__.publish();});await page.keyboard.press('KeyE');await page.keyboard.press('KeyG');await expect(page.getByRole('dialog',{name:'Garagem municipal'})).toBeVisible();
 await page.getByRole('button',{name:'Pintura',exact:true}).click();await page.getByRole('button',{name:/Aurora Azul/}).click();await page.getByRole('button',{name:/Confirmar pintura/}).click();await expect.poll(async()=>(await state(page)).garage.busy).toBe(false);
 await page.getByRole('button',{name:'Acessórios',exact:true}).click();await page.getByRole('button',{name:/Comprar e instalar Proteção tubular/}).click();await expect.poll(async()=>(await state(page)).garage.busy).toBe(false);
 await page.getByRole('button',{name:'Mecânica',exact:true}).click();await page.getByRole('button',{name:/Comprar e instalar Ajuste da bomba/}).click();await expect.poll(async()=>(await state(page)).garage.record.upgrades).toContain('engine');await page.getByRole('button',{name:/Sair da garagem/}).click();await page.keyboard.press('KeyE');
 await shunt(page,-1,-786);const paintedDrive=await state(page);await page.screenshot({path:`${dir}/tita-personalizado-dirigindo.png`});await shunt(page,1,-812);await page.keyboard.press('KeyE');await page.keyboard.press('KeyG');await expect(page.getByRole('dialog',{name:'Garagem municipal'})).toBeVisible();
 await page.getByRole('button',{name:'Frota',exact:true}).click();await page.getByRole('button',{name:/^Basculante Municipal/}).click();await expect.poll(async()=>(await state(page)).garage.busy,{timeout:60000}).toBe(false);await page.getByRole('button',{name:/^Recuperar Basculante/}).click();await expect.poll(async()=>(await state(page)).garage.vehicles).toContain('dump-truck');await page.getByRole('button',{name:/^Basculante Municipal/}).click();await expect.poll(async()=>(await state(page)).garage.busy).toBe(false);await page.getByRole('button',{name:/^Ativar Basculante/}).click();await expect.poll(async()=>(await state(page)).garage.activeId,{timeout:60000}).toBe('dump-truck');
 await page.getByRole('button',{name:'Reparos',exact:true}).click();await page.getByRole('button',{name:'Abastecer até 4 L dos recipientes'}).click();await expect.poll(async()=>(await state(page)).fuel).toBe(4);await page.getByRole('button',{name:'Cabine',exact:true}).click();await settle(page);await page.screenshot({path:`${dir}/basculante-cabine.png`});await page.getByRole('button',{name:/Sair da garagem/}).click();await page.keyboard.press('KeyE');await shunt(page,-1,-786);
 await selectDestination(page,'posto-cinza-nova');const second=await drivePhysical(page,{label:'basculante-cinza-nova',cruise:6,wheelbase:3.982});await settle(page);await page.screenshot({path:`${dir}/basculante-cidade.png`});const finished=await state(page);expect(finished.importedTruck.id).toBe('dump-truck');expect(finished.wheelContacts.filter(Boolean).length).toBe(6);expect(finished.campaign.fleet.vehicles['titan-old'].paint.skin).toBe('aurora');expect(errors).toEqual([]);
 const saved=await saveCurrent(page);expect(Math.hypot(...saved.data.truck.position.map((v,i)=>v-finished.position[i]))).toBeLessThan(1);expect(saved.data.fuel).toBeCloseTo(finished.fuel,1);
 await page.context().storageState({path:'/tmp/aurora-garage-storage.json'});await writeFile(`${dir}/before-restart.json`,JSON.stringify(saved,null,2)+'\n');
 await writeFile(`${dir}/journey.json`,JSON.stringify({notice:'Actual Rapier at fixed 60 Hz, accelerated diagnostic time, physical walking and two trucks. No diagnostic teleport or resource injection. The last 34 m are a parking manoeuvre over the existing garage floor after the mapped apron.',outward,paintedDrive,second,finished,errors},null,2)+'\n');
});


test('bancada: acesso a pé com colisões reais e retorno ao controle',async({page})=>{
 test.setTimeout(180000);await boot(page);await page.getByRole('button',{name:/Sair da garagem/}).click();await page.keyboard.press('KeyF');await expect.poll(async()=>(await state(page)).mode).toBe('walking');
 await walkPhysical(page,[{x:-324,z:-810},{x:-326,z:-804.5}]);await expect.poll(async()=>(await state(page)).interaction?.key).toBe('garage:services');await page.keyboard.press('KeyF');await expect(page.getByRole('dialog',{name:'Garagem municipal'})).toBeVisible();await page.getByRole('button',{name:/Sair da garagem/}).click();expect((await state(page)).mode).toBe('walking');
});

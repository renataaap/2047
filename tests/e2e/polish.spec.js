import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='evidence/polish-0.8.2/functional',state=p=>p.evaluate(()=>window.__GAME_DEBUG__.getState());
async function boot(page){
 await mkdir(dir,{recursive:true});await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
 await page.goto('/');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'01 Novo jogo'}).click();await expect.poll(async()=>(await state(page)).mode).toBe('walking');await page.getByRole('button',{name:'Pular tutorial',exact:true}).click();
}
async function settle(page){const n=(await state(page)).simulation.steps;await expect.poll(async()=>(await state(page)).simulation.steps,{timeout:45000}).toBeGreaterThan(n+35);}
async function panelPaint(page){
 await page.locator('.field-interface').evaluate(async element=>{await Promise.all(element.getAnimations().map(animation=>animation.finished.catch(()=>{})));});
 await expect(page.locator('.field-interface')).toHaveCSS('opacity','1');
}
async function walkTo(page,x,z){await expect.poll(async()=>{const s=await state(page),dx=x-s.playerPosition[0],dz=z-s.playerPosition[2],d=Math.hypot(dx,dz),yaw=s.playerYaw,scale=Math.min(1,d/1.6);await page.evaluate(v=>window.__GAME_DEBUG__.setInput(v),d<.5?{}:{x:(dx*Math.cos(yaw)-dz*Math.sin(yaw))/d*scale,z:(dx*Math.sin(yaw)+dz*Math.cos(yaw))/d*scale});return d;},{timeout:60000,intervals:[250]}).toBeLessThan(.5);}
test('0.8.2: cabine, instrumentos reais, limites de olhar e exterior após F',async({page})=>{
 test.setTimeout(180000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await boot(page);
 await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-3,z:5}));await page.keyboard.press('KeyF');await expect.poll(async()=>(await state(page)).mode).toBe('driving');
 for(let i=0;i<3&&(await state(page)).camera!==1;i++)await page.keyboard.press('KeyC');await settle(page);
 const initial=await state(page);expect(initial.cockpit.inside).toBe(true);expect(initial.cockpit.detailMaterials).toContain('cloth');expect(initial.importedTruck.wheelBindings).toBe(6);
 await page.keyboard.press('KeyE');await page.keyboard.press('KeyL');await page.keyboard.down('KeyW');await expect.poll(async()=>(await state(page)).speedKmh,{timeout:30000}).toBeGreaterThan(10);await page.keyboard.up('KeyW');await page.keyboard.down('Space');await expect.poll(async()=>(await state(page)).speed,{timeout:20000}).toBeLessThan(.6);
 await expect.poll(async()=>(await state(page)).instruments.signals).toEqual({engine:true,parking:true,temperature:false,lights:true});await page.screenshot({path:`${dir}/cab.png`});
 await page.mouse.move(700,370);await page.mouse.down();await page.evaluate(()=>window.dispatchEvent(new MouseEvent('mousemove',{movementX:2000,movementY:2000})));await page.mouse.up();await settle(page);const look=await state(page);expect(look.cameraPose.cabYaw).toBe(-1.45);expect(look.cameraPose.cabPitch).toBe(.95);await page.screenshot({path:`${dir}/cab-look.png`});
 await page.keyboard.press('KeyF');await page.keyboard.up('Space');await expect.poll(async()=>(await state(page)).mode).toBe('walking');await settle(page);const exited=await state(page);expect(exited.cockpit.inside).toBe(false);expect(exited.importedTruck.visible).toBe(true);expect(exited.importedTruck.cabShellVisible).toBe(true);expect(exited.importedTruck.legacyCabVisible).toBe(false);expect(exited.assets.errors).toEqual([]);expect(errors).toEqual([]);await writeFile(`${dir}/cab.json`,JSON.stringify({initial,look,exited,errors},null,2));
});
test('0.8.2: entrada física da loja e serviços individuais de Zeca preservados',async({page})=>{
 test.setTimeout(180000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await boot(page);
 // Diagnostic travel to the site only. The doorway crossing uses the Rapier player.
 await page.evaluate(()=>{window.__GAME_DEBUG__.teleport({x:-40,z:-2245});window.__GAME_DEBUG__.teleportPlayer({x:-48.7,z:-2252.7});});await settle(page);await walkTo(page,-52.2,-2252.7);
 const inside=await state(page);expect(inside.playerPosition[0]).toBeLessThan(-51.7);await page.screenshot({path:`${dir}/store-interior.png`});
 await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-48.7,z:-2247.3}));await settle(page);await expect.poll(async()=>(await state(page)).interaction?.key).toBe('npc:posto-boa-viagem');await page.keyboard.press('KeyF');await expect(page.getByRole('heading',{name:'Zeca',exact:true})).toBeVisible();const npc=await state(page);expect(npc.roadVisual.actors['posto-boa-viagem'].wardrobe).toBe('zeca');expect(npc.roadVisual.actors['posto-boa-viagem'].features).toContain('utility-vest');await panelPaint(page);await page.screenshot({path:`${dir}/zeca.png`});expect(npc.assets.errors).toEqual([]);expect(errors).toEqual([]);await writeFile(`${dir}/store.json`,JSON.stringify({inside,npc,errors},null,2));
});
test('0.8.2: diário registra visita por entrada real, sem pagar reserva, e persiste',async({page})=>{
 test.setTimeout(240000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await boot(page);
 await page.evaluate(()=>{window.__GAME_DEBUG__.teleport({x:-18,z:-365});window.__GAME_DEBUG__.teleportPlayer({x:-30,z:-365});});await settle(page);const inventory=(await state(page)).campaign.inventory;
 await walkTo(page,-30,-379);await expect.poll(async()=>(await state(page)).campaign.world.visited).toContain('motel');expect((await state(page)).campaign.world.claimed).not.toContain('motel');expect((await state(page)).campaign.inventory).toEqual(inventory);
 await page.keyboard.press('KeyJ');await expect(page.getByRole('heading',{name:'Descobertas da estrada'})).toBeVisible();await expect(page.getByTestId('journal-site:motel')).toContainText('Visita registrada');await page.getByTestId('journal-site:motel').scrollIntoViewIfNeeded();await expect(page.getByTestId('journal-site:motel')).toBeInViewport();await panelPaint(page);await page.screenshot({path:`${dir}/journal.png`});await page.keyboard.press('Escape');
 await page.keyboard.press('Escape');await page.getByRole('button',{name:'Salvar / carregar partida'}).click();await page.getByRole('button',{name:'Salvar neste slot'}).first().click();await expect(page.getByRole('dialog').getByRole('status')).toContainText('Partida salva',{timeout:20000});await page.reload();await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect.poll(async()=>(await state(page)).mode).toBe('walking');await page.keyboard.press('KeyJ');await expect(page.getByTestId('journal-site:motel')).toHaveCount(1);expect((await state(page)).campaign.inventory).toEqual(inventory);expect(errors).toEqual([]);await writeFile(`${dir}/journal.json`,JSON.stringify({loaded:await state(page),errors},null,2));
});

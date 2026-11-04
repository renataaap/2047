import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {evidencePath} from '../helpers/evidence-path.js';
import {roadAccessFixture} from '../helpers/road-access-fixture.js';
test('cabine: aviso de salvamento não cobre minimapa compacto ou ampliado',async({page})=>{
 test.setTimeout(180000);const dir=evidencePath('navigation-layout');await mkdir(dir,{recursive:true});
 const errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));const {data}=roadAccessFixture('core-1');data.truck.position=[-226,3,-677];data.player.position=[-230,3,-675];
 await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
 await page.request.get('/api/saves');expect((await page.request.post('/api/saves',{data:{slot:'1',data}})).status()).toBe(201);await page.goto('/');await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect.poll(async()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().mode)).toBe('driving');await page.keyboard.press('KeyC');await expect(page.locator('.cab-hud')).toBeVisible();
 await expect(page.locator('.cab-hud .toast')).toContainText('Partida salva',{timeout:30000});
 for(const height of [720,600]){
  await page.setViewportSize({width:1280,height});
  for(const expanded of [false,true]){
   if(expanded)await page.getByRole('button',{name:'Ampliar minimapa'}).click();
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const map=await page.getByTestId('navigation-hud').boundingBox(),toast=await page.locator('.cab-hud .toast').boundingBox();
   const overlap=Math.max(0,Math.min(map.x+map.width,toast.x+toast.width)-Math.max(map.x,toast.x))*Math.max(0,Math.min(map.y+map.height,toast.y+toast.height)-Math.max(map.y,toast.y));
   await page.screenshot({path:`${dir}/${expanded?'expanded':'compact'}-${height}.png`});checks.push({height,expanded,map,toast,overlapSquarePixels:overlap});await writeFile(`${dir}/layout.json`,JSON.stringify({checks,errors,method:'Actual automatic save notification in the cockpit, two viewport heights and both minimap sizes. No notice or position edited during the test.'},null,2)+'\n');
   expect(overlap,'O aviso de salvamento cobre a navegação').toBe(0);expect(toast.y).toBeGreaterThanOrEqual(0);expect(toast.x+toast.width).toBeLessThanOrEqual(1280);
   if(expanded)await page.getByRole('button',{name:'Reduzir minimapa'}).click();
  }
 }
 expect(errors).toEqual([]);
});

import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {roadX} from '../src/game/world/terrain.js';

const state=page=>page.evaluate(()=>window.__GAME_DEBUG__.getState());
export async function captureTruck(page,stage){
 const dir=resolve(process.env.AURORA_EVIDENCE_ROOT||'evidence/current-e2e','truck-opacity',stage),shots=[],errors=[];await mkdir(dir,{recursive:true});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
 await page.goto('http://127.0.0.1:3000');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:90000});
 const take=async id=>{await page.screenshot({path:`${dir}/${id}.png`});const s=await state(page);shots.push({id,state:s});};
 await page.waitForTimeout(800);await take('menu');await page.getByRole('button',{name:'01 Novo jogo'}).click();await expect.poll(async()=>(await state(page)).mode,{timeout:30000}).toBe('walking');
 await page.getByRole('button',{name:'Pular tutorial',exact:true}).click();await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-3,z:5}));await page.keyboard.press('KeyF');await expect.poll(async()=>(await state(page)).mode).toBe('driving');
 await page.evaluate(p=>window.__GAME_DEBUG__.teleport(p),{x:roadX(-220),z:-220});await page.keyboard.down('Space');
 const settle=async()=>{const start=(await state(page)).simulation.steps;await expect.poll(async()=>(await state(page)).simulation.steps,{timeout:30000}).toBeGreaterThan(start+60);};
 const camera=async mode=>{for(let i=0;i<3&&(await state(page)).camera!==mode;i++)await page.keyboard.press('KeyC');await settle();};
 const orbit=async angle=>{await camera(2);await page.mouse.move(750,380);await page.mouse.down();await page.evaluate(angle=>{const p=window.__GAME_DEBUG__.getState().cameraPose;window.dispatchEvent(new MouseEvent('mousemove',{movementX:(p.angle-angle)/.005,movementY:(.18-p.elevation)/.004}));},angle);await page.mouse.up();await settle();};
 await settle();await take('traseira');await orbit(-Math.PI/2);await take('lateral-esquerda');await orbit(Math.PI);await take('frente');await orbit(Math.PI/2);await take('lateral-direita');await camera(1);await take('cabine');
 // Keep the controls held while taking the image: SwiftShader can spend seconds
 // capturing a frame, enough for engine braking and steering return after keyup.
 await orbit(-.9);await page.keyboard.up('Space');await page.keyboard.press('KeyE');await page.keyboard.down('KeyW');await expect.poll(async()=>(await state(page)).speedKmh,{timeout:45000}).toBeGreaterThan(10);await page.keyboard.down('KeyA');await expect.poll(async()=>Math.abs((await state(page)).steeringAngle),{timeout:20000}).toBeGreaterThan(.04);await take('movimento');await page.keyboard.up('KeyA');await page.keyboard.up('KeyW');
 await page.keyboard.down('Space');await expect.poll(async()=>(await state(page)).speed,{timeout:20000}).toBeLessThan(.6);await page.keyboard.press('KeyE');await page.evaluate(()=>window.__GAME_DEBUG__.setTime(18.2));await settle();await take('entardecer');
 await page.evaluate(()=>window.__GAME_DEBUG__.setTime(23));await page.keyboard.press('KeyL');await settle();await take('noite');await camera(1);await take('cabine-noite');await camera(0);await take('retorno-externa');
 await camera(1);await page.keyboard.press('KeyF');await expect.poll(async()=>(await state(page)).mode).toBe('walking');await page.keyboard.up('Space');await settle();await take('a-pe-apos-cabine');const exited=await state(page);
 const result={stage,shots,exited,consoleErrors:errors,renderer:'Chromium/ANGLE SwiftShader, low 75%; software only',notes:'Real game cameras/input; diagnostics shorten only travel and select lighting hours. No image editing or external renders.'};await writeFile(`${dir}/capture.json`,JSON.stringify(result,null,2)+'\n');expect(errors).toEqual([]);return result;
}

// Extra evidence: look back at the truck after a real cockpit exit, then inspect
// shadows/environment lighting with the real High setting and return to Low.
export async function captureTruckDetails(page){
 const dir=resolve(process.env.AURORA_EVIDENCE_ROOT||'evidence/current-e2e','truck-opacity','details'),shots=[],errors=[];await mkdir(dir,{recursive:true});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
 await page.goto('http://127.0.0.1:3000');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:90000});
 await page.getByRole('button',{name:'01 Novo jogo'}).click();await expect.poll(async()=>(await state(page)).mode).toBe('walking');
 await page.getByRole('button',{name:'Pular tutorial',exact:true}).click();await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-3,z:5}));await page.keyboard.press('KeyF');await expect.poll(async()=>(await state(page)).mode).toBe('driving');
 await page.evaluate(p=>{window.__GAME_DEBUG__.teleport(p);window.__GAME_DEBUG__.setTime(9);},{x:roadX(-220),z:-220});await page.keyboard.down('Space');
 const settle=async()=>{const start=(await state(page)).simulation.steps;await expect.poll(async()=>(await state(page)).simulation.steps,{timeout:60000}).toBeGreaterThan(start+35);};
 await settle();await page.keyboard.press('KeyC');expect((await state(page)).camera).toBe(1);await page.keyboard.press('KeyF');await expect.poll(async()=>(await state(page)).mode).toBe('walking');await page.keyboard.up('Space');
 const exited=await state(page);expect(exited.importedTruck.visible).toBe(true);expect(exited.importedTruck.cabShellVisible).toBe(true);expect(exited.importedTruck.legacyCabVisible).toBe(false);
 await page.evaluate(()=>{const s=window.__GAME_DEBUG__.getState();window.__GAME_DEBUG__.teleportPlayer({x:s.position[0]-10,z:s.position[2]});});
 await page.locator('canvas').click({position:{x:700,y:350}});await expect.poll(()=>page.evaluate(()=>!!document.pointerLockElement)).toBe(true);
 await page.evaluate(()=>{const s=window.__GAME_DEBUG__.getState(),dx=s.position[0]-s.playerPosition[0],dz=s.position[2]-s.playerPosition[2],yaw=Math.atan2(-dx,-dz);window.dispatchEvent(new MouseEvent('mousemove',{movementX:(s.playerYaw-yaw)/.0025,movementY:0}));});
 const take=async id=>{await settle();await page.screenshot({path:`${dir}/${id}.png`});const s=await state(page);expect(s.importedTruck.visible).toBe(true);expect(s.importedTruck.cabShellVisible).toBe(true);expect(s.importedTruck.wheelBindings).toBe(6);expect(s.assets.errors).toEqual([]);shots.push({id,state:s});};
 await take('a-pe-apos-cabine-dia');await page.evaluate(()=>document.exitPointerLock());
 for(const [quality,id]of [['Alto','alto-sombras'],['Baixo','retorno-baixo']]){
  await page.keyboard.press('Escape');await page.getByRole('button',{name:'Configurações',exact:true}).click();await page.getByRole('button',{name:quality,exact:true}).click();
  await page.getByRole('button',{name:'Voltar',exact:true}).last().click();await page.getByRole('button',{name:'Voltar à viagem'}).click();await take(id);
 }
 expect(errors).toEqual([]);const result={shots,exited,consoleErrors:errors,renderer:'Chromium/ANGLE SwiftShader, software only',notes:'Real cockpit exit, mouse look and Low/High/Low UI settings; diagnostics frame the truck and choose 09:00. No image editing.'};await writeFile(`${dir}/capture.json`,JSON.stringify(result,null,2)+'\n');return result;
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{const page=await browser.newPage({viewport:{width:1280,height:720}});if(process.argv[2]==='--details')await captureTruckDetails(page);else await captureTruck(page,process.argv[2]||'after');}finally{await browser.close();}
}

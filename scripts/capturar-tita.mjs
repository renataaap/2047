import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {roadX} from '../src/game/world/terrain.js';

const state=page=>page.evaluate(()=>window.__GAME_DEBUG__.getState());
export async function captureTruck(page,stage){
 const dir=`evidence/truck-opacity/${stage}`,shots=[],errors=[];await mkdir(dir,{recursive:true});
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

if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{await captureTruck(await browser.newPage({viewport:{width:1280,height:720}}),process.argv[2]||'after');}finally{await browser.close();}
}

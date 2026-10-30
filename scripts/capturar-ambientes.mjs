// Actual WebGL captures through the existing diagnostic teleport and mouse input.
import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {roadX} from '../src/game/world/terrain.js';
const stage=process.argv[2]||'after',dir=`evidence/world-0.8.0/${stage}`;
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[],shots=[];
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
try{
 await page.goto('http://127.0.0.1:3000');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:90000});
 await page.screenshot({path:`${dir}/menu.png`});await page.getByRole('button',{name:'01 Novo jogo'}).click();await expect(page.locator('.travel-transition')).not.toHaveClass(/active/,{timeout:20000});
 for(const shot of [{id:'barracao',x:-13,z:23,yaw:0},{id:'arredores',x:-6,z:40,yaw:.45},{id:'estrada',x:8,z:-310,yaw:0},{id:'oficina',x:9,z:-548,yaw:1.57},{id:'posto',x:-37,z:-2238,yaw:.45}]){
  await page.evaluate(p=>{window.__GAME_DEBUG__.teleport({x:p.truckX,z:p.z-8});window.__GAME_DEBUG__.teleportPlayer(p);},{...shot,truckX:roadX(shot.z)});
  await page.locator('canvas').click({position:{x:750,y:370}});
  await page.evaluate(yaw=>{const previous=window.__GAME_DEBUG__.getState().playerYaw;window.dispatchEvent(new MouseEvent('mousemove',{movementX:(previous-yaw)/.0025,movementY:0}));},shot.yaw);
  const first=await page.evaluate(()=>window.__GAME_DEBUG__.getState().simulation.steps);
  await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().simulation.steps),{timeout:30000}).toBeGreaterThan(first+60);
  await page.screenshot({path:`${dir}/${shot.id}.png`});const s=await page.evaluate(()=>window.__GAME_DEBUG__.getState());shots.push({shot,drawCalls:s.drawCalls,triangles:s.triangles,fps:s.fps,position:s.playerPosition,assets:s.assets,ambience:s.ambience,time:s.worldTime});
 }
 await writeFile(`${dir}/capture.json`,JSON.stringify({stage,shots,errors,renderer:'Chromium SwiftShader; low / 75%; no hardware GPU performance claim'},null,2));
 if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();}

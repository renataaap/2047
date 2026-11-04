// Actual browser captures. Diagnostic positioning is never evidence of driving a route.
import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {roadX} from '../src/game/world/terrain.js';
import {CORES} from '../src/data/network.js';
const stage=process.argv[2]||'after',dir=`evidence/roads-0.9.0/${stage}`;
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[],shots=[];
const state=()=>page.evaluate(()=>window.__GAME_DEBUG__.getState());
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
try{
 await page.goto('http://127.0.0.1:3000');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'01 Novo jogo'}).click();await expect.poll(async()=>(await state()).mode).toBe('walking');
 await page.getByRole('button',{name:'Pular tutorial',exact:true}).click();
 const poses=[{id:'entroncamento',x:20,z:-560,yaw:Math.PI/2},{id:'cidade',x:-320,z:-750,yaw:0},{id:'alternativa',x:-210,z:-1450,yaw:0},...CORES.map(k=>({id:`acesso-${k.id}`,x:k.x-22,z:k.z+38,yaw:0}))];
 for(const p of poses){
  await page.evaluate(v=>{window.__GAME_DEBUG__.teleport({x:v.truckX,z:v.z+50});window.__GAME_DEBUG__.teleportPlayer(v);window.__GAME_DEBUG__.setTime(9);},{...p,truckX:roadX(p.z+50)});
  await page.locator('canvas').click({position:{x:740,y:360}});await page.evaluate(yaw=>{const s=window.__GAME_DEBUG__.getState();window.dispatchEvent(new MouseEvent('mousemove',{movementX:(s.playerYaw-yaw)/.0025,movementY:0}));},p.yaw);
  const n=(await state()).simulation.steps;await expect.poll(async()=>(await state()).simulation.steps,{timeout:60000}).toBeGreaterThan(n+12);
  await page.screenshot({path:`${dir}/${p.id}.png`});shots.push({id:p.id,pose:p,state:await state()});await page.evaluate(()=>document.exitPointerLock());
 }
 await page.keyboard.press('KeyM');await expect(page.getByRole('dialog')).toBeVisible();await page.waitForTimeout(600);await page.screenshot({path:`${dir}/mapa.png`});
 expect(errors).toEqual([]);await writeFile(`${dir}/capture.json`,JSON.stringify({stage,renderer:'Chromium ANGLE SwiftShader, Baixo 75%, 1280x720',diagnosticPositioning:true,physicalJourney:false,shots,errors},null,2)+'\n');
}finally{await browser.close();}

import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {installTerrainProbe} from '../tests/helpers/terrain-probe.js';
// Capture the live game. All repositioning below is diagnostic, not a journey.
// Default to a new after directory, never silently replace baseline evidence.
const stage=process.argv[2]||'manual-after',quality=process.argv[3]||'alto',limit=Number(process.argv[4]??16),dir=`evidence/floor-0.9.1/${stage}`;
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await installTerrainProbe(page,limit);
await page.addInitScript(quality=>{
 localStorage.setItem('aurora-settings',JSON.stringify({quality,scale:.75,volume:0}));
},quality);
try{
 await page.goto('http://127.0.0.1:3000');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:120000});
 await page.getByRole('button',{name:'01 Novo jogo'}).click();await page.waitForFunction(()=>window.__GAME_DEBUG__?.getState().mode==='walking');
 await page.getByRole('button',{name:'Pular tutorial',exact:true}).click();
 await page.evaluate(()=>window.__GAME_DEBUG__.setTime(9));
 await page.waitForTimeout(1500);await page.screenshot({path:`${dir}/barracao.png`});
 await page.locator('canvas').click({position:{x:760,y:400}});
 await page.evaluate(()=>window.dispatchEvent(new MouseEvent('mousemove',{movementX:0,movementY:180})));await page.waitForTimeout(800);
 await page.screenshot({path:`${dir}/chao.png`});
 await page.evaluate(()=>{document.exitPointerLock();window.__GAME_DEBUG__.teleportPlayer({x:-5,z:38});window.__TERRAIN_PROBE__.arm();});
 await expect.poll(async()=>page.evaluate(()=>window.__TERRAIN_PROBE__.report().visibleTerrainDraws),{timeout:60000}).toBeGreaterThan(0);
 await page.waitForTimeout(1500);await page.screenshot({path:`${dir}/exterior.png`});
 const diagnostics=await page.evaluate(()=>({state:window.__GAME_DEBUG__.getState(),gpu:window.__TERRAIN_PROBE__.report()}));
 await writeFile(`${dir}/diagnostics.json`,JSON.stringify({stage,...diagnostics,errors},null,2));
 expect(errors).toEqual([]);console.log(JSON.stringify({stage,gpu:diagnostics.gpu,errors}));
}finally{await browser.close();}

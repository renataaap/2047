// Real game screenshots. Diagnostic travel is not a human 30-minute playthrough.
import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {roadX} from '../src/game/world/terrain.js';
const stage=process.argv[2]||'after',dir=`evidence/polish-0.8.2/${stage}`,only=process.argv[3]?.split(','),want=id=>!only||only.includes(id);
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[],shots=[];
const state=()=>page.evaluate(()=>window.__GAME_DEBUG__.getState());
const settle=async()=>{const n=(await state()).simulation.steps;await expect.poll(async()=>(await state()).simulation.steps,{timeout:60000}).toBeGreaterThan(n+35);};
const take=async id=>{await page.screenshot({path:`${dir}/${id}.png`});shots.push({id,state:await state()});};
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
try{
 await page.goto('http://127.0.0.1:3000');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:90000});if(want('menu'))await take('menu');
 await page.getByRole('button',{name:'01 Novo jogo'}).click();await expect.poll(async()=>(await state()).mode,{timeout:30000}).toBe('walking');
 for(const p of [
  {id:'barracao',x:-13,z:23,yaw:0},
  {id:'moradia',x:-13,z:22.3,yaw:Math.PI},
  {id:'barracao-noite',x:-13,z:23,yaw:0,hour:23},
  {id:'estrada',x:8,z:-310,yaw:0},
  {id:'dante',x:0,z:-45,yaw:0,third:true},
  {id:'dante-rosto',x:0,z:-45,yaw:Math.PI,third:true,truckZOffset:-15},
  {id:'sobrevivente',x:-19,z:9.2,yaw:0},
  {id:'zeca',x:-48.7,z:-2245.2,yaw:0},
  {id:'loja-interior',x:-52.2,z:-2252.7,yaw:Math.PI},
  {id:'loja-noite',x:-52.2,z:-2252.7,yaw:Math.PI,hour:23},
  {id:'oficina',x:9,z:-548,yaw:Math.PI/2},
  {id:'marta',x:-3.4,z:-547.8,yaw:0},
  {id:'motel',x:-30,z:-369,yaw:0},
  {id:'motel-interior',x:-30,z:-379,yaw:0},
  {id:'patio',x:-57,z:-2005,yaw:0},
  {id:'balanca',x:25,z:-2450,yaw:0},
  {id:'tomas',x:36.5,z:-2879.5,yaw:0},
  {id:'ivani',x:-28,z:-3476,yaw:0}
 ].filter(p=>want(p.id))){
  await page.evaluate(p=>{window.__GAME_DEBUG__.teleport({x:p.truckX,z:p.z+(p.truckZOffset||-6)});window.__GAME_DEBUG__.teleportPlayer(p);window.__GAME_DEBUG__.setTime(p.hour??9);},{...p,truckX:roadX(p.z)});
  const third=(await state()).footCamera==='third';if(third!==!!p.third)await page.keyboard.press('KeyC');
  await page.locator('canvas').click({position:{x:750,y:370}});await page.evaluate(yaw=>{const s=window.__GAME_DEBUG__.getState();window.dispatchEvent(new MouseEvent('mousemove',{movementX:(s.playerYaw-yaw)/.0025,movementY:0}));},p.yaw);
  await settle();await take(p.id);await page.evaluate(()=>document.exitPointerLock());
 }
 if(!only||only.some(id=>['tita-exterior','tita-interior','entardecer','noite-farois','cabine-noite','cabine-lateral','cabine-pedais'].includes(id))){
 // Start from the actual truck and use F/C and orbit mouse events.
 if((await state()).tutorial.status==='active')await page.getByRole('button',{name:'Pular tutorial',exact:true}).click();
 await page.evaluate(p=>{window.__GAME_DEBUG__.teleport(p);window.__GAME_DEBUG__.teleportPlayer({x:p.x-3,z:p.z});window.__GAME_DEBUG__.setTime(9);},{x:roadX(-220),z:-220});
 await settle();await page.keyboard.press('KeyF');await expect.poll(async()=>(await state()).mode,{timeout:30000}).toBe('driving');await page.keyboard.down('Space');
 const camera=async mode=>{for(let i=0;i<3&&(await state()).camera!==mode;i++)await page.keyboard.press('KeyC');await settle();};
 await camera(2);await page.mouse.move(750,380);await page.mouse.down();await page.evaluate(()=>{const p=window.__GAME_DEBUG__.getState().cameraPose;window.dispatchEvent(new MouseEvent('mousemove',{movementX:(p.angle+1.15)/.005,movementY:(.18-p.elevation)/.004}));});await page.mouse.up();await settle();if(want('tita-exterior'))await take('tita-exterior');
 if(want('tita-interior')){await camera(1);await take('tita-interior');}
 for(const [id,yaw,pitch]of [['cabine-lateral',-1.25,.35],['cabine-pedais',0,.9]])if(want(id)){
  await camera(1);const pose=(await state()).cameraPose;await page.mouse.down();await page.evaluate(v=>window.dispatchEvent(new MouseEvent('mousemove',v)),{movementX:(pose.cabYaw-yaw)/.003,movementY:(pitch-pose.cabPitch)/.003});await page.mouse.up();await settle();await take(id);
 }
 if(want('entardecer')){await camera(2);await page.evaluate(()=>window.__GAME_DEBUG__.setTime(18.2));await settle();await take('entardecer');}
 if(want('noite-farois')||want('cabine-noite')){await camera(2);await page.evaluate(()=>window.__GAME_DEBUG__.setTime(23));await page.keyboard.press('KeyL');await settle();if(want('noite-farois'))await take('noite-farois');if(want('cabine-noite')){await camera(1);await take('cabine-noite');}}
 }
 expect(errors).toEqual([]);await writeFile(`${dir}/${only?'capture-'+only.join('-'):'capture'}.json`,JSON.stringify({stage,shots,errors,renderer:'Chromium ANGLE SwiftShader; low 75%, 1280x720',diagnostics:'Travel/time only. Not a human playthrough. No edited images or external renders.'},null,2)+'\n');
}finally{await browser.close();}

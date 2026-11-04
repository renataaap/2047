import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {controlledPhysics,walkPhysical,selectDestination,drivePhysical} from '../tests/helpers/physical-drive.js';
const dir='evidence/roads-0.9.0/physical-city';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
try{
 await page.goto('http://127.0.0.1:3000');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'01 Novo jogo'}).click();await page.getByRole('button',{name:'Pular tutorial',exact:true}).click();await controlledPhysics(page);
 await walkPhysical(page,[{x:-13,z:22},{x:-12,z:18.95},{x:-8.2,z:18.95},{x:-12,z:9},{x:-19,z:8.2}]);await page.keyboard.press('KeyF');await page.getByRole('button',{name:'Aceitar a Semente e assumir a viagem'}).click();await page.keyboard.press('Escape');await expect.poll(async()=>page.evaluate(()=>window.__GAME_DEBUG__.frame().mode)).toBe('walking');
 await walkPhysical(page,[{x:-14,z:8},{x:-3,z:5}]);await page.keyboard.press('KeyF');await expect.poll(async()=>page.evaluate(()=>window.__GAME_DEBUG__.frame().mode)).toBe('driving');await page.keyboard.press('KeyE');await selectDestination(page,'posto-cinza-nova','fast');
 const drive=await drivePhysical(page,{label:'barracao-rodovia-entroncamento-cidade-posto',cruise:9});await page.keyboard.press('KeyE');await page.evaluate(()=>window.__GAME_DEBUG__.publish());await page.screenshot({path:`${dir}/arrived.png`});expect(errors).toEqual([]);await writeFile(`${dir}/drive.json`,JSON.stringify({drive,state:await page.evaluate(()=>window.__GAME_DEBUG__.getState()),errors,vehicleTeleports:0,playerTeleports:0},null,2)+'\n');
}catch(error){await page.screenshot({path:`${dir}/failure.png`});await writeFile(`${dir}/failure.json`,JSON.stringify({error:error.message,state:await page.evaluate(()=>window.__GAME_DEBUG__?.getState()),driver:await page.evaluate(()=>{const d=window.__AURORA_PHYSICAL_DRIVER__;return d?{position:d.frame.position,steps:d.steps,cursor:d.cursor,maxOffRoute:d.maxOffRoute,samples:d.samples}:null;}),errors},null,2)+'\n');throw error;}
finally{await browser.close();}

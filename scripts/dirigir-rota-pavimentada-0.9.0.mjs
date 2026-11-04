import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {roadAccessFixture} from '../tests/helpers/road-access-fixture.js';
import {roadX,roadHeight} from '../src/game/world/terrain.js';
import {controlledPhysics,selectDestination,drivePhysical} from '../tests/helpers/physical-drive.js';
const dir='evidence/roads-0.9.0/physical-route-a';await mkdir(dir,{recursive:true});
const {data}=roadAccessFixture('core-1'),z=-620;
data.truck.position=[roadX(z),roadHeight(z)+1.1,z];data.player.position=[roadX(z)-3,roadHeight(z)+1.1,z];
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
 await page.request.get('http://127.0.0.1:3000/api/saves');expect((await page.request.post('http://127.0.0.1:3000/api/saves',{data:{slot:'1',data}})).status()).toBe(201);
 await page.goto('http://127.0.0.1:3000');await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect.poll(async()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().mode)).toBe('driving');await controlledPhysics(page);await page.evaluate(()=>window.__GAME_DEBUG__.step({handbrake:true},120));await page.keyboard.press('KeyE');await selectDestination(page,'core-1','safe');
 const route=await page.evaluate(()=>window.__GAME_DEBUG__.route());expect(route.segments.some(s=>s.id==='desvio-cinzas')).toBe(true);
 const proof=await drivePhysical(page,{label:'rota-a-bifurcacao-alca-leste-nucleo-1',cruise:9,maxSeconds:650});expect(proof.samples.some(p=>p.position[0]>300)).toBe(true);expect(proof.finish.integrity).toBeGreaterThan(80);await page.waitForTimeout(500);await page.screenshot({path:`${dir}/arrived.png`});expect(errors).toEqual([]);await writeFile(`${dir}/drive.json`,JSON.stringify({fixture:data,proof,segments:route.segments,errors,note:'Starts from a saved fixture at the fork; real physics through the entire paved alternative. Separate from the new-game pilot via the city. Accelerated diagnostic time; no teleports during the drive.'},null,2)+'\n');
}catch(e){await page.screenshot({path:`${dir}/failure.png`});await writeFile(`${dir}/failure.json`,JSON.stringify({error:e.message,state:await page.evaluate(()=>window.__GAME_DEBUG__.getState()),errors},null,2)+'\n');throw e;}
finally{await browser.close();}

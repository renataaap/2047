import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='evidence/roads-0.9.0/integration';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];const state=()=>page.evaluate(()=>window.__GAME_DEBUG__.getState());
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
try{
 await page.goto('http://127.0.0.1:3000');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'01 Novo jogo'}).click();await expect(page.getByTestId('navigation-hud')).toBeVisible();
 await page.getByRole('button',{name:'Pular tutorial',exact:true}).click();await page.evaluate(()=>{window.__GAME_DEBUG__.teleport({x:-320,z:-700});window.__GAME_DEBUG__.teleportPlayer({x:-320,z:-750});});
 await expect.poll(async()=>(await state()).city.loaded,{timeout:60000}).toBe(true);const steps=(await state()).simulation.steps;await expect.poll(async()=>(await state()).simulation.steps,{timeout:60000}).toBeGreaterThan(steps+15);await page.screenshot({path:`${dir}/city-streets.png`});
 await page.keyboard.press('KeyM');await expect(page.getByTestId('route-planner')).toBeVisible();await page.getByLabel('Destino da viagem').selectOption('core-1');await page.getByRole('button',{name:'Rota B · Cinza Nova e estrada do Vale',exact:true}).click();await expect.poll(async()=>(await state()).navigation.surfaces).toContain('terra');await expect(page.getByRole('button',{name:/^Mais econômica/})).toHaveAttribute('aria-pressed','true');await page.screenshot({path:`${dir}/map-planner.png`});
 expect(errors).toEqual([]);await writeFile(`${dir}/smoke.json`,JSON.stringify({state:await state(),errors,diagnosticPositioning:true,physicalJourney:false},null,2)+'\n');
}finally{await browser.close();}

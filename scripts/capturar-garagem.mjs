import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {enterFromNewTutorial} from '../tests/helpers/start-driving.js';
const stage=process.argv[2]||'inspection',dir=`evidence/garage-0.10.0/${stage}`;await mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:720}});try{
 await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
 await page.goto('http://127.0.0.1:3000');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:120000});await page.getByRole('button',{name:'01 Novo jogo'}).click();await enterFromNewTutorial(page);
 await page.evaluate(()=>{window.__GAME_DEBUG__.teleport({x:-320,z:-785});window.__GAME_DEBUG__.setTime(9);});
 await page.waitForFunction(()=>[...document.querySelectorAll('.cab-access-transition')].every(e=>Number(getComputedStyle(e).opacity)<.01),{timeout:60000});
 await page.evaluate(()=>new Promise(resolve=>{let n=0;const step=()=>++n===8?resolve():requestAnimationFrame(step);requestAnimationFrame(step);}));await page.screenshot({path:`${dir}/garagem.png`});
 await writeFile(`${dir}/garage-scene.json`,JSON.stringify({notice:'Diagnostic framing of the real game, not proof of driving to the garage.',state:await page.evaluate(()=>window.__GAME_DEBUG__.getState())},null,2)+'\n');
}finally{await browser.close();}

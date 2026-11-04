// Run after npm run build + npm start. Uses normal UI/input, no development API.
// AURORA_GRAPHICS_ONLY=1 substitutes an empty GET /api/saves when Turso is absent.
import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {installTerrainProbe} from '../tests/helpers/terrain-probe.js';
const dir='evidence/floor-0.9.1/production',graphicsOnly=process.env.AURORA_GRAPHICS_ONLY==='1';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{
 if(graphicsOnly)await page.route('**/api/saves',r=>r.request().method()==='GET'?r.fulfill({json:{saves:[]}}):r.continue());
 await installTerrainProbe(page,16);
 await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'alto',scale:.75,volume:0})));
 await page.goto('http://127.0.0.1:3000');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:120000});
 await expect(page.getByText('0.9.1',{exact:true})).toBeVisible();await page.getByRole('button',{name:'01 Novo jogo'}).click();
 await expect(page.getByTestId('tutorial-guide')).toBeVisible({timeout:30000});await page.getByRole('button',{name:'Pular tutorial',exact:true}).click();
 expect(await page.evaluate(()=>typeof window.__GAME_DEBUG__)).toBe('undefined');
 await page.screenshot({path:`${dir}/barracao-alto-16.png`});
 await page.keyboard.down('KeyW');await page.waitForTimeout(800);await page.keyboard.up('KeyW');
 await page.keyboard.down('KeyD');await page.waitForTimeout(1800);await page.keyboard.up('KeyD');
 await page.evaluate(()=>window.__TERRAIN_PROBE__.arm());
 await expect.poll(async()=>page.evaluate(()=>window.__TERRAIN_PROBE__.report().visibleTerrainDraws),{timeout:60000}).toBeGreaterThan(0);
 const gpu=await page.evaluate(()=>window.__TERRAIN_PROBE__.report());
 expect(gpu.selectedLimit).toBe(16);expect(gpu.error).toBe(0);expect(gpu.programs.length).toBeGreaterThan(0);
 for(const program of gpu.programs){expect(program.linked,program.log).toBe(true);expect(program.samplerCount).toBeLessThanOrEqual(16);}
 await page.screenshot({path:`${dir}/terreno-alto-16.png`});
 await writeFile(`${dir}/validation.json`,JSON.stringify({version:'0.9.1',graphicsOnly,saveAPI:graphicsOnly?'GET list replaced with original empty fixture; production Turso persistence NOT tested':'real API, requires configured Turso',mode:'next start, production, High, 16-unit capability selection on SwiftShader; normal UI/input, no debug API and no claim of a journey',gpu,errors},null,2)+'\n');
 expect(errors).toEqual([]);
 console.log(JSON.stringify({passed:true,visibleTerrainDraws:gpu.visibleTerrainDraws,samplerCounts:gpu.programs.map(p=>p.samplerCount),errors}));
}finally{await browser.close();}

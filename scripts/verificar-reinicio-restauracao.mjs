// Run after a real server stop/start, using the private QA contexts produced by
// restoration.spec.js. Cookies are never copied to the report or repository.
import {chromium,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
const root=process.env.AURORA_EVIDENCE_ROOT||'evidence/restoration-0.11.0/final';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[];
try{for(const [name,storage]of [['activation','/tmp/aurora-restoration-storage.json'],['streaming','/tmp/aurora-restoration-network-storage.json']]){
 const dir=`${root}/restoration/${name}`,before=JSON.parse(await readFile(`${dir}/before-restart.json`,'utf8')),context=await browser.newContext({storageState:storage,viewport:{width:1280,height:720}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const response=await page.request.get('http://127.0.0.1:3000/api/saves/1');expect(response.status()).toBe(200);const after=await response.json();expect(after.data).toEqual(before.data);expect(after.version).toBe(before.version);
 await page.goto('http://127.0.0.1:3000');await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:120000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.waitForFunction(()=>window.__GAME_DEBUG__?.getState().mode==='walking',null,{timeout:120000});await page.evaluate(()=>{window.__GAME_DEBUG__.controlledStepping(true);window.__GAME_DEBUG__.publish();});
 await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().restoration.vegetation.synchronized),{timeout:120000}).toBe(true);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));const loaded=await page.evaluate(()=>window.__GAME_DEBUG__.getState());
 expect(loaded.campaign.world.recovery).toEqual(before.data.campaign.world.recovery);expect(loaded.campaign.inventory).toEqual(before.data.campaign.inventory);expect(loaded.campaign.cores).toEqual(before.data.campaign.cores);expect(loaded.campaign.network.cargo).toBe(before.data.campaign.network.cargo);expect(loaded.restoration.cinematic.active).toBe(false);expect(loaded.restoration.cinematic.pending).toBeNull();expect(loaded.importedTruck.wheelBindings).toBe(6);expect(loaded.restoration.vegetation.total).toBeGreaterThan(0);expect(errors).toEqual([]);await page.screenshot({path:`${dir}/after-server-restart.png`});
 const proof={realServerRestart:true,backend:'local libSQL/SQLite',rawDataEqual:true,versionEqual:true,version:after.version,records:Object.keys(loaded.campaign.world.recovery.cores).length,loaded,errors};await writeFile(`${dir}/restart.json`,JSON.stringify(proof,null,2)+'\n');results.push({scenario:name,passed:true,records:proof.records,rawDataEqual:true,versionEqual:true});await context.close();
}}finally{await browser.close();}
await writeFile(`${root}/restoration/restart-summary.json`,JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results));

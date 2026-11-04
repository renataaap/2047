// Restart the dev server after garage.spec.js, then run this with the QA context.
// Cookie storage stays in /tmp and is never included in the repository.
import {chromium,expect} from '@playwright/test';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=process.env.AURORA_EVIDENCE_ROOT||'evidence/garage-0.10.0/final',dir=`${root}/garage`,before=JSON.parse(await readFile(`${dir}/before-restart.json`,'utf8'));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({storageState:'/tmp/aurora-garage-storage.json',viewport:{width:1280,height:720}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{
 const response=await page.request.get('http://127.0.0.1:3000/api/saves/1');expect(response.status()).toBe(200);const after=await response.json();expect(after.data).toEqual(before.data);expect(after.version).toBe(before.version);
 await page.goto('http://127.0.0.1:3000');await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:120000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.waitForFunction(()=>{const s=window.__GAME_DEBUG__?.getState();return s?.mode==='driving'&&s.importedTruck.id==='dump-truck';});
 const loaded=await page.evaluate(()=>window.__GAME_DEBUG__.getState());expect(loaded.campaign.fleet.active).toBe('dump-truck');expect(loaded.appearance.paint).toEqual(before.data.campaign.fleet.vehicles['dump-truck'].paint);expect(loaded.campaign.fleet.vehicles['titan-old'].paint.skin).toBe('aurora');expect(loaded.campaign.inventory).toEqual(before.data.campaign.inventory);
 for(const [id,record] of Object.entries(before.data.campaign.fleet.vehicles))for(const key of ['paint','interior','ownedSkins','ownedAccessories','accessories','ownedUpgrades','upgrades','inventory'])expect(loaded.campaign.fleet.vehicles[id][key]).toEqual(record[key]);
 for(const key of ['seed','cores','flags','completedMissions','decisions','restoration','navigation'])expect(loaded.campaign[key]).toEqual(before.data.campaign[key]);expect(Math.hypot(...loaded.position.map((v,i)=>v-before.data.truck.position[i]))).toBeLessThan(1);expect(loaded.fuel).toBeCloseTo(before.data.fuel,1);expect(errors).toEqual([]);
 await mkdir(dir,{recursive:true});await page.screenshot({path:`${dir}/after-server-restart.png`});await writeFile(`${dir}/restart.json`,JSON.stringify({realServerRestart:true,rawSavedDataEqual:true,versionEqual:true,loadedFleet:loaded.campaign.fleet,loadedTruck:loaded.importedTruck,appearance:loaded.appearance,position:loaded.position,fuel:loaded.fuel,errors},null,2)+'\n');
 console.log(JSON.stringify({passed:true,active:loaded.campaign.fleet.active,vehicles:Object.keys(loaded.campaign.fleet.vehicles),rawSavedDataEqual:true}));
}finally{await browser.close();}

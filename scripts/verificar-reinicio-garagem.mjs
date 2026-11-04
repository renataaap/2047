// Restart the dev server after garage.spec.js, then run this with the QA context.
// Cookie storage stays in /tmp and is never included in the repository.
import {chromium,expect} from '@playwright/test';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=process.env.AURORA_EVIDENCE_ROOT||'evidence/garage-0.10.0/final',dir=`${root}/garage`,before=JSON.parse(await readFile(`${dir}/before-restart.json`,'utf8'));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({storageState:'/tmp/aurora-garage-storage.json',viewport:{width:1280,height:720}}),page=await context.newPage();
try{
 const response=await page.request.get('http://127.0.0.1:3000/api/saves/1');expect(response.status()).toBe(200);const after=await response.json();expect(after.data).toEqual(before.data);expect(after.version).toBe(before.version);
 await page.goto('http://127.0.0.1:3000');await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:120000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.waitForFunction(()=>window.__GAME_DEBUG__?.getState().importedTruck.id==='dump-truck');
 const loaded=await page.evaluate(()=>window.__GAME_DEBUG__.getState());expect(loaded.campaign.fleet.active).toBe('dump-truck');expect(loaded.appearance.paint).toEqual(before.data.campaign.fleet.vehicles['dump-truck'].paint);expect(loaded.campaign.fleet.vehicles['titan-old'].paint.skin).toBe('aurora');expect(loaded.campaign.inventory).toEqual(before.data.campaign.inventory);
 await mkdir(dir,{recursive:true});await page.screenshot({path:`${dir}/after-server-restart.png`});await writeFile(`${dir}/restart.json`,JSON.stringify({realServerRestart:true,rawSavedDataEqual:true,versionEqual:true,loadedFleet:loaded.campaign.fleet,loadedTruck:loaded.importedTruck,appearance:loaded.appearance},null,2)+'\n');
 console.log(JSON.stringify({passed:true,active:loaded.campaign.fleet.active,vehicles:Object.keys(loaded.campaign.fleet.vehicles),rawSavedDataEqual:true}));
}finally{await browser.close();}

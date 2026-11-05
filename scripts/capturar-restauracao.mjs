// Real in-game frames with diagnostic positioning. Not evidence of a driven trip.
import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {roadAccessFixture} from '../tests/helpers/road-access-fixture.js';
import {anchor} from '../src/game/missions/network.js';
const phase=process.argv[2]||'before',root=process.env.AURORA_EVIDENCE_ROOT||'evidence/restoration-0.11.0';
const variants=(phase==='before'?['devastated','legacy-restored']:['devastated','response','recovering','advanced']).filter(v=>!process.env.AURORA_CAPTURE_VARIANTS||process.env.AURORA_CAPTURE_VARIANTS.split(',').includes(v));
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const codeCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),results=[];
const settle=page=>page.evaluate(()=>new Promise(resolve=>{let n=0;const tick=()=>++n===10?resolve():requestAnimationFrame(tick);requestAnimationFrame(tick);}));
const views=[
 {id:'acesso',x:7,z:-2770},{id:'estacionamento',x:7,z:-2876},
 {id:'nucleo',x:30,z:-2855},{id:'encosta',x:110,z:-2890},
 {id:'area-aberta',x:75,z:-2970},{id:'cabine',x:7,z:-2805,camera:1},
 {id:'a-pe',x:40,z:-2855,foot:true},{id:'solo',x:70,z:-2900,foot:true,down:true},
];
try{
 for(const variant of variants){
  const context=await browser.newContext({viewport:{width:1280,height:720},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0,cameraDistance:18})));
  const {data}=roadAccessFixture('core-1');data.truck.position=[7,3,-2876];data.player.position=[4,3,-2876];data.campaign.world.daySeconds=9*3600;
  if(variant!=='devastated')expect(anchor(data.campaign,'core-1')?.success).toBe(true);
  if(phase!=='before'&&variant!=='devastated'){
   const {ensureRecovery}=await import('../src/game/restoration/progress.js');ensureRecovery(data.campaign);
   data.campaign.world.recovery.cores['core-1'].age={response:12,recovering:110,advanced:240}[variant];
  }
  expect((await page.request.post('http://127.0.0.1:3000/api/saves',{data:{slot:'1',data}})).status()).toBe(201);
  const started=performance.now();await page.goto('http://127.0.0.1:3000');await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:120000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.waitForFunction(()=>window.__GAME_DEBUG__?.getState().mode==='driving');
  await page.evaluate(()=>{const d=window.__GAME_DEBUG__;d.controlledStepping(true);d.step({handbrake:true},120);d.publish();});
  const loadMs=performance.now()-started;const dir=`${root}/${phase}/${variant}`;await mkdir(dir,{recursive:true});const captures=[];
  for(const view of views.filter(v=>!process.env.AURORA_CAPTURE_VIEWS||process.env.AURORA_CAPTURE_VIEWS.split(',').includes(v.id))){
   const s=await page.evaluate(()=>window.__GAME_DEBUG__.getState());
   if(s.mode==='walking'){await page.evaluate(()=>{const d=window.__GAME_DEBUG__,p=d.frame().position;d.teleportPlayer({x:p[0]-3,z:p[2]});});await page.keyboard.press('KeyF');await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().mode)).toBe('driving');}
   await page.evaluate(p=>{const d=window.__GAME_DEBUG__;d.teleport({x:p.x,z:p.z});d.step({handbrake:true},120);d.setTime(9);d.publish();},view);
   while((await page.evaluate(()=>window.__GAME_DEBUG__.getState().camera))!==(view.camera||0))await page.keyboard.press('KeyC');
   if(view.foot){await page.keyboard.press('KeyF');await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().mode)).toBe('walking');await page.evaluate(p=>{window.__GAME_DEBUG__.teleportPlayer({x:p.x-3,z:p.z});window.__GAME_DEBUG__.publish();},view);if(view.down){await page.mouse.click(650,350);await page.mouse.move(650,560,{steps:4});}}
   if(phase!=='before'&&variant!=='devastated')await page.evaluate(age=>window.__GAME_DEBUG__.setRecoveryAge('core-1',age),{response:12,recovering:110,advanced:240}[variant]);
   await settle(page);if(phase!=='before')await page.waitForFunction(()=>window.__GAME_DEBUG__.getState().restoration?.vegetation.pendingCells===0,null,{timeout:90000});await page.screenshot({path:`${dir}/${view.id}.png`});const state=await page.evaluate(()=>window.__GAME_DEBUG__.getState());captures.push({view,state});
  }
  expect(errors).toEqual([]);const result={codeCommit,variant,quality:'baixo',scale:.75,viewport:[1280,720],diagnosticPositioning:true,humanTrip:false,loadMs,captureDurationMs:performance.now()-started,captures,errors};await writeFile(`${dir}/frames.json`,JSON.stringify(result,null,2)+'\n');results.push({variant,frames:captures.length,errors});await context.close();
 }
 await mkdir(`${root}/${phase}`,{recursive:true});await writeFile(`${root}/${phase}/index.json`,JSON.stringify({codeCommit,results,notice:'Real game, same authored poses and 09h. Diagnostic positioning, not a human drive. SwiftShader, not Windows GPU.'},null,2)+'\n');console.log(JSON.stringify(results));
}finally{await browser.close();}

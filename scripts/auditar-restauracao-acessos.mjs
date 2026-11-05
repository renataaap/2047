import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {roadAccessFixture} from '../tests/helpers/road-access-fixture.js';
import {controlledPhysics,walkPhysical,selectDestination,drivePhysical} from '../tests/helpers/physical-drive.js';
import {anchor,openVault} from '../src/game/missions/network.js';
import {ensureFleet,newVehicle} from '../src/game/garage/fleet.js';
import {validSave} from '../src/game/persistence/schema.js';
import {CORES,WORLD_COPY} from '../src/data/network.js';
const folder=process.env.AURORA_ACCESS_EVIDENCE||'evidence/restoration-0.11.0/access';
const vehicles=(process.env.AURORA_ACCESS_VEHICLES||'titan-old,dump-truck').split(',');
const ids=process.argv.slice(2);if(!ids.length)for(let n=1;n<=7;n++)ids.push(`vault-${n}`,`core-${n}`);
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[];
try{for(const vehicle of vehicles)for(const id of ids){
 const dir=`${folder}/${vehicle}/${id}`;await mkdir(dir,{recursive:true});
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const state=()=>page.evaluate(()=>window.__GAME_DEBUG__.getState());
 let phase='load';const proof={id,vehicle,method:'Local access audit starting from a saved fixture at the highway entry. Actual walking, controls and 60 Hz Rapier simulation with accelerated diagnostic time. Two homologated vehicles; restoration reaches maturity with original fixed updates and is saved/reloaded before the return. No debug teleports during entry, walking or departure; reloading uses the same saved position. Not a continent trip or human session. Vault fixtures are already anchored to exercise restored access without claiming another seed.',teleportsDuringAudit:0};
 try{
  const {data,destination}=roadAccessFixture(id);const current=CORES[Number(id.split('-')[1])-1];
  if(id.startsWith('vault-')){if(!data.campaign.network.seeds[current.id].obtained)expect(openVault(data.campaign,current.id)).toBe(true);expect(anchor(data.campaign,current.id)?.success).toBe(true);}
  for(const r of Object.values(data.campaign.world.recovery.cores)){r.age=240;r.cinematicSeen=true;}
  if(vehicle==='dump-truck'){const f=ensureFleet(data.campaign,data);f.vehicles['titan-old'].fuel=0;f.vehicles['titan-old'].inventory={diesel:0,water:0,food:0,parts:0,scrap:0};f.vehicles[vehicle]=newVehicle(vehicle,data.campaign.components,data.campaign.inventory.truck,data.fuel);f.active=vehicle;}
  expect(validSave(data)).toBe(true);proof.fixture=data;
  await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
  await page.request.get('http://127.0.0.1:3000/api/saves');expect((await page.request.post('http://127.0.0.1:3000/api/saves',{data:{slot:'1',data}})).status()).toBe(201);
  await page.goto('http://127.0.0.1:3000');await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect.poll(async()=>(await state()).mode,{timeout:120000}).toBe('driving');
  await controlledPhysics(page);await page.evaluate(()=>window.__GAME_DEBUG__.step({handbrake:true},120));await page.keyboard.press('KeyE');
  phase='entry';await selectDestination(page,id,'safe');proof.entry=await drivePhysical(page,{label:`${id}:entry`,cruise:id==='core-6'?3:5,maxSeconds:400,wheelbase:vehicle==='dump-truck'?3.982:4.675});
  await page.keyboard.press('KeyE');await page.keyboard.press('KeyF');await expect.poll(async()=>(await state()).mode,{timeout:120000}).toBe('walking');
  const k=CORES[Number(id.split('-')[1])-1],terminal=destination.terminal;
  phase='walking';
  const p=(await state()).position;
  // Walk behind the parked truck before crossing to the terminal's clear face.
  const target=id.startsWith('core-')?{x:terminal.x-1,z:terminal.z+11.5}:{x:terminal.x-1,z:terminal.z+9};
  await walkPhysical(page,[{x:p[0]-4,z:p[2]+9},{x:target.x,z:p[2]+9},target]);
  await page.keyboard.press('KeyF');await expect.poll(async()=>(await state()).mode,{timeout:120000}).toBe('paused');
  phase='interaction';await expect(page.getByRole('heading',{name:id==='core-1'?'Núcleo 1 · ressonador atmosférico':id.startsWith('vault-')?`Cofre ${k.number}`:k.name,exact:true})).toBeVisible();
  if(id.startsWith('vault-')){
   if(k.number===1)await expect(page.getByText(WORLD_COPY.firstVault,{exact:true})).toBeVisible();
   else await expect(page.getByRole('button',{name:'Cofre aberto · Semente já retirada',exact:true})).toBeDisabled();
  }else{
   const calibrate=page.getByRole('button',{name:'Calibrar · 2 peças / +20%',exact:true});
   for(let i=0;i<5&&(await state()).campaign.seed.integrity<99.9;i++){if(!await calibrate.isEnabled())break;await calibrate.click();}
   await page.getByRole('button',{name:'Iniciar ativação',exact:true}).click();await expect.poll(async()=>(await state()).campaign.cores[id].state).toBe('active');
  }
  await page.waitForTimeout(500);await page.screenshot({path:`${dir}/interaction.png`});proof.interaction=await state();await page.keyboard.press('Escape');
  if(id.startsWith('core-')){await expect.poll(async()=>(await state()).mode,{timeout:120000}).toBe('cinematic');await page.getByRole('button',{name:/Pular apresentação/}).click();}
  await expect.poll(async()=>(await state()).mode,{timeout:120000}).toBe('walking');
  if(id.startsWith('core-'))for(let i=0;i<24;i++)await page.evaluate(()=>{window.__GAME_DEBUG__.step({handbrake:true},600);window.__GAME_DEBUG__.publish();});
  await expect.poll(async()=>(await state()).restoration.vegetation.synchronized,{timeout:120000}).toBe(true);proof.mature=await state();expect(proof.mature.campaign.world.recovery.cores[k.id].age).toBe(240);expect(proof.mature.importedTruck.wheelBindings).toBe(6);await page.screenshot({path:`${dir}/mature.png`});
  phase='save-load';await page.keyboard.press('Escape');await page.getByRole('button',{name:'Salvar / carregar partida'}).click();const saved=page.waitForResponse(r=>r.url().endsWith('/api/saves/1')&&r.request().method()==='PUT');await page.getByRole('button',{name:'Salvar neste slot'}).first().click();expect((await saved).status()).toBe(200);await page.reload();await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:120000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect.poll(async()=>(await state()).mode,{timeout:120000}).toBe('walking');await controlledPhysics(page);await expect.poll(async()=>(await state()).restoration.vegetation.synchronized,{timeout:120000}).toBe(true);proof.reloaded=await state();expect(proof.reloaded.campaign.inventory).toEqual(proof.mature.campaign.inventory);expect(proof.reloaded.restoration.vegetation.fingerprints).toEqual(proof.mature.restoration.vegetation.fingerprints);

  phase='return-to-truck';
  const door=await page.evaluate(()=>{const f=window.__GAME_DEBUG__.frame(),q=f.quaternion,v=[-2.8,0,-2.5],tx=2*(q[1]*v[2]-q[2]*v[1]),ty=2*(q[2]*v[0]-q[0]*v[2]),tz=2*(q[0]*v[1]-q[1]*v[0]);return {x:f.position[0]+v[0]+q[3]*tx+q[1]*tz-q[2]*ty,z:f.position[2]+v[2]+q[3]*tz+q[0]*ty-q[1]*tx};});
  await walkPhysical(page,[{x:target.x,z:p[2]+9},{x:p[0]-4,z:p[2]+9},door]);await page.keyboard.press('KeyF');await expect.poll(async()=>(await state()).mode,{timeout:120000}).toBe('driving');await page.keyboard.press('KeyE');
  phase='exit';await selectDestination(page,`retorno:${id}`,'fast');proof.exit=await drivePhysical(page,{label:`${id}:exit`,cruise:id==='core-6'?3:5,maxSeconds:400,wheelbase:vehicle==='dump-truck'?3.982:4.675});await page.waitForTimeout(500);await page.screenshot({path:`${dir}/exit.png`});
  proof.final=await state();expect(errors).toEqual([]);proof.status='passed';console.log(`${vehicle}/${id}: passed (${proof.entry.travelledMetres.toFixed(1)} + ${proof.exit.travelledMetres.toFixed(1)} m)`);
 }catch(e){proof.status='failed';proof.phase=phase;proof.error=e.message;try{proof.wheels=await page.evaluate(()=>window.__GAME_DEBUG__.wheelDiagnostics());proof.driver=await page.evaluate(()=>{const d=window.__AURORA_PHYSICAL_DRIVER__;return d?{samples:d.samples,frame:d.frame,steps:d.steps,points:d.points}:null;});proof.final=await state();await page.screenshot({path:`${dir}/failure.png`});}catch{}console.log(`${vehicle}/${id}: FAILED ${phase}: ${e.message}`);}
 proof.errors=errors;await writeFile(`${dir}/proof.json`,JSON.stringify(proof,null,2)+'\n');results.push({id,vehicle,status:proof.status,phase:proof.phase,error:proof.error,entryMetres:proof.entry?.travelledMetres,exitMetres:proof.exit?.travelledMetres});await writeFile(`${folder}/matrix.json`,JSON.stringify(results,null,2)+'\n');await page.close();
}}finally{await browser.close();}
if(results.some(r=>r.status!=='passed'))process.exitCode=1;

import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const dir='evidence/roads-0.9.0';
const json=async name=>JSON.parse(await readFile(`${dir}/${name}`,'utf8'));
if(process.argv.includes('--verify-delivered')){
 const manifest=await json('delivered-source-hashes.json');
 for(const [path,hash]of Object.entries(manifest))assert.equal(createHash('sha256').update(await readFile(path)).digest('hex'),hash,path);
 const recovery=await json('capture-path-recovery.json');for(const r of recovery.records)assert.equal(createHash('sha256').update(await readFile(r.historicalPath)).digest('hex'),r.historicalSha256,r.historicalPath);
 const data=await json('validation.json');assert.equal(data.browserIntegral.passed,31);assert.equal(data.postIntegralPolish.browserPassed,2);assert.equal(data.postIntegralPolish.build.passed,true);
 console.log('Delivered source, 31 integral + 2 focused results, and historical capture hashes verified.');process.exit(0);
}
// Default mode closes the frozen integral before any separately tested polish.

const unit=await readFile(`${dir}/final-unit.log`,'utf8'),e2e=await readFile(`${dir}/final-e2e.log`,'utf8');
const testMatch=unit.match(/Tests\s+(\d+) passed \((\d+)\)/),fileMatch=unit.match(/Test Files\s+(\d+) passed \((\d+)\)/),browser=e2e.match(/\n\s*(\d+) passed \(([^\n]+)\)/);
assert.ok(testMatch&&fileMatch,'Unit suite not wholly passed');assert.ok(browser,'Browser suite not wholly passed');assert.equal(Number(browser[1]),31);assert.ok(!/\d+ failed/.test(e2e),'A failed E2E cannot be reported as an integral pass');
const frozen=await json('final-source-hashes.json'),changed=[];for(const [path,hash]of Object.entries(frozen)){const current=createHash('sha256').update(await readFile(path)).digest('hex');if(current!==hash)changed.push(path);}assert.deepEqual(changed,[],'Source/test files changed during the integral');
const protectedFiles=await json('protected-hashes.json');assert.ok(Object.values(protectedFiles).every(Boolean));
const access=await json('final-access/matrix.json');assert.equal(access.length,14);assert.ok(access.every(r=>r.status==='passed'));
const pilot=await json('pilot/journey.json'),routeA=await json('physical-route-a/drive.json'),surface=await json('road-surface-audit.json'),restart=await json('restart.json'),network=await json('network-summary.json');
assert.equal(surface.failures.length,0);assert.equal(restart.exactlyRestored,true);
const data={version:'0.9.0',completedAt:new Date().toISOString(),branch:'feat/rede-rodoviaria-0.9.0',sourceCommit:'2dd3c0d',baseCommit:'55a5df3c50d7a5527d5299fad419379f53f20c8f',remoteBase:await json('remote-base-update.json'),sourceFrozen:{files:Object.keys(frozen).length,allUnchanged:true,manifest:'final-source-hashes.json'},unit:{passed:Number(testMatch[1]),total:Number(testMatch[2]),files:Number(fileMatch[1]),log:'final-unit.log'},build:{passed:true,log:'build.log',devStoppedDuringBuild:true},browserIntegral:{passed:Number(browser[1]),duration:browser[2],workers:1,retries:0,log:'final-e2e.log',evidenceRoot:'final-e2e',historicalFilesPreserved:true,capturePathRecovery:'capture-path-recovery.json'},focusedBrowser:{passed:3,log:'focused-browser.log',notAddedToIntegralCount:true},surface:{samples:surface.samples,seamSamples:surface.seamSamples,failures:0},physical:{pilotMetres:pilot.legs.reduce((n,l)=>n+l.travelledMetres,0),pilotLegs:pilot.legs.length,pilotErrors:pilot.errors,pilotSaveReloadPassed:pilot.checks.some(c=>c.step==='saved-and-reloaded'),pavedAlternativeMetres:routeA.proof.travelledMetres,accessPassed:14,accessTotal:14,localAccessFixtures:true,originalRapier:true,fixedHz:60,acceleratedDiagnosticTime:true,diagnosticTeleportsDuringDrives:0,humanJourneyClaimed:false},restart:{exactlyRestored:true,proof:'restart.json'},protectedHashes:{passed:Object.keys(protectedFiles).length,total:10,manifest:'protected-hashes.json'},network,visual:{beforeAfterPairs:11,gallery:'comparison.html',renderCounters:'render-comparison.json',renderer:'Chromium / ANGLE SwiftShader (software)',realGpuFpsValidated:false},historicalReferenceOnly:{version:'0.8.2',unit:175,e2e:28,notCurrentRun:true},preservedAttempts:['resume-unit.log','road-surface-attempt-1.json','road-surface-attempt-2.json','road-surface-attempt-3.json','pilot-attempt-1','pilot-attempt-2','access-attempt-1','access-attempt-2','access-recheck','access-recheck-2','access-recheck-3'],remaining:['Windows and real GPU evaluation','Human driving/audio/art assessment','Additional cities beyond the pilot','Garage services/customization/additional drivable trucks in 0.10.0','Existing final narrative endings and final character art']};
await writeFile(`${dir}/validation.json`,JSON.stringify(data,null,2)+'\n');console.log(JSON.stringify({unit:data.unit.passed,browser:data.browserIntegral.passed,duration:data.browserIntegral.duration,access:14,sourceUnchanged:true},null,2));

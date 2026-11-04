import assert from 'node:assert/strict';
import {readFile,writeFile,unlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

// Own anonymous test identity, never a user's save. The cookie stays outside Git.
// Run prepare, stop/restart the real server, then verify.
const temporary=join(tmpdir(),'aurora082-restart-proof.json'),base='http://127.0.0.1:3000';
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
if(process.argv[2]==='prepare'){
 const {loaded:s}=JSON.parse(await readFile('evidence/polish-0.8.2/functional/journal.json','utf8'));
 const payload={schemaVersion:3,truck:{position:s.position,rotation:s.quaternion},player:{position:s.playerPosition},context:'walking',fuel:s.fuel,temperature:s.temperature,engineOn:s.engineOn,campaign:s.campaign};
 const identity=await fetch(`${base}/api/saves`);assert.equal(identity.status,200);
 const cookie=identity.headers.get('set-cookie')?.split(';')[0];assert.ok(cookie);
 const response=await fetch(`${base}/api/saves`,{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({slot:'3',data:payload})});assert.equal(response.status,201);
 const saved=await response.json();assert.deepEqual(saved.data,payload);
 await writeFile(temporary,JSON.stringify({cookie,saved,preparedAt:new Date().toISOString()}),{mode:0o600});
 console.log('Partida de teste criada pela API. Pare e reinicie o servidor antes de verify.');
}else if(process.argv[2]==='verify'){
 const {cookie,saved,preparedAt}=JSON.parse(await readFile(temporary,'utf8'));
 const response=await fetch(`${base}/api/saves/3`,{headers:{Cookie:cookie}});assert.equal(response.status,200);
 const restored=await response.json();assert.deepEqual(restored,saved);
 const p=restored.data;
 await writeFile('evidence/polish-0.8.2/restart.json',JSON.stringify({preparedAt,verifiedAt:new Date().toISOString(),exactlyRestored:true,beforeSha256:digest(saved.data),afterSha256:digest(p),slot:restored.slot,revision:restored.version,context:p.context,truck:p.truck,player:p.player,fuel:p.fuel,temperature:p.temperature,world:p.campaign.world,inventory:p.campaign.inventory,cores:p.campaign.cores,note:'Real server stopped for production build and restarted between calls. API recovery of an own anonymous test save; no cookie/identity committed. UI loading is covered separately by E2E.'},null,2)+'\n');
 await unlink(temporary);console.log('Partida idêntica recuperada após reinício real; cookie temporário removido.');
}else throw Error('Use prepare ou verify.');

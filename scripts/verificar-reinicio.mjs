// Run with the development server / browser suite stopped: Next dev owns one lock.
import {spawn} from 'node:child_process';
import {mkdtemp,writeFile,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:net';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {createCampaign} from '../src/game/missions/campaign.js';
import {upgradeCampaign} from '../src/game/missions/network.js';
import {terrainGeometry} from '../src/game/world/terrainGeometry.js';
import {meshHeightAt} from '../src/game/world/surfaceHeight.js';
import {visitSite,siteAction} from '../src/game/world/worldProgress.js';
const root=fileURLToPath(new URL('..',import.meta.url)),out=join(root,'evidence/world-0.8.0');await mkdir(out,{recursive:true});
const socket=createServer();await new Promise(resolve=>socket.listen(0,'127.0.0.1',resolve));const port=socket.address().port;await new Promise(resolve=>socket.close(resolve));
const base=`http://127.0.0.1:${port}`,temporary=await mkdtemp(join(tmpdir(),'aurora-restart-08-')),databaseUrl=`file:${temporary}/test.db`;
let server,output='',cookie='';const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function start(){
 server=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port',String(port)],{cwd:root,detached:true,env:{...process.env,TURSO_DATABASE_URL:databaseUrl,NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
 server.stdout.on('data',b=>{output+=b;});server.stderr.on('data',b=>{output+=b;});
 for(let i=0;i<180;i++){if(server.exitCode!==null)throw new Error(`Server exited ${server.exitCode}`);try{const r=await fetch(`${base}/api/saves`,{signal:AbortSignal.timeout(3000)});if(r.ok)return;}catch{}await delay(250);}throw new Error('Server readiness timeout');
}
async function stop(){if(!server)return;const current=server;server=undefined;try{process.kill(-current.pid,'SIGTERM');}catch{}for(let i=0;i<60&&current.exitCode===null&&current.signalCode===null;i++)await delay(100);if(current.exitCode===null&&current.signalCode===null)try{process.kill(-current.pid,'SIGKILL');}catch{}}
async function api(path,method='GET',body){const r=await fetch(`${base}${path}`,{method,headers:{...(cookie?{cookie}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});if(!cookie)cookie=r.headers.get('set-cookie')?.split(';')[0]||'';return {status:r.status,body:await r.json()};}
try{
 await start();await api('/api/saves');const campaign=upgradeCampaign(createCampaign(1510));for(const k in campaign.inventory.player)campaign.inventory.player[k]=0;
 for(const id of ['motel','yard','weighbridge']){visitSite(campaign,id);assert.equal(siteAction(campaign,id).ok,true);}campaign.world.daySeconds=23.25*3600;campaign.world.days=2;
 const ground=terrainGeometry(0,0),playerY=meshHeightAt(ground,-13,22)+1.1;ground.dispose();
 const data={schemaVersion:3,truck:{position:[0,2,5],rotation:[0,0,0,1]},player:{position:[-13,playerY,22]},context:'walking',fuel:4,temperature:26,engineOn:false,campaign};
 assert.equal((await api('/api/saves','POST',{slot:'3',data})).status,201);assert.ok(cookie);const first=server.pid;await stop();await start();const second=server.pid;assert.notEqual(first,second);
 const loaded=await api('/api/saves/3');assert.equal(loaded.status,200);assert.deepEqual(loaded.body.data,data);assert.equal(loaded.body.version,1);assert.equal((await api('/api/saves/3','DELETE')).status,200);
 const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');await writeFile(join(out,'restart-persistence.json'),JSON.stringify({passed:true,version:'0.8.0',realServerRestart:true,processIds:[first,second],isolatedLocalDatabase:true,schemaVersion:3,exactSaveRoundTrip:true,world:loaded.body.data.campaign.world,payloadHashes:[digest(data),digest(loaded.body.data)],temporaryDataDeleted:true,notes:'Private test cookie reused; no user database/cookie/credential recorded. Night clock, two finite claims and recovered bulletin are initial valid saved-game conditions. Production Turso not tested.'},null,2)+'\n');
 console.log('PASS: clock, finite POI reserves and recovered information survive a real server restart.');
}finally{await stop();await writeFile(join(out,'restart-server.log'),output);await rm(temporary,{recursive:true,force:true});}

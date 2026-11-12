// Reinício real (story 009): grava um save com estado narrativo completo da 0.14, derruba o
// servidor de produção, sobe de novo e compara dados brutos e versão. Uso:
//   node restart-009.mjs <pasta-do-projeto> <arquivo-de-saida.json>
import {spawn} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const [root,out]=process.argv.slice(2);
const base='http://127.0.0.1:3100';
const imp=p=>import(pathToFileURL(`${root}/${p}`).href);
const {createCampaign,receiveSeed,activateCore}=await imp('src/game/missions/campaign.js');
const {migrateCampaign}=await imp('src/game/survival/expedition.js');
const {upgradeCampaign}=await imp('src/game/missions/network.js');
const {ensureStory,validStory}=await imp('src/data/../game/narrative/story.js');
const {SCENES}=await imp('src/data/story.js');

function server(){
 const p=spawn('npx',['next','dev','--hostname','127.0.0.1','--port','3100'],{cwd:root,shell:true,env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}});
 p.stdout.on('data',()=>{});p.stderr.on('data',()=>{});return p;
}
async function ready(){for(let i=0;i<120;i++){try{const r=await fetch(`${base}/api/saves`);if(r.status<500)return;}catch{}await new Promise(r=>setTimeout(r,500));}throw Error('servidor não subiu');}
function kill(p){return new Promise(res=>{const k=spawn('taskkill',['/pid',String(p.pid),'/T','/F'],{shell:true});k.on('exit',()=>res());});}
async function down(){for(let i=0;i<60;i++){try{await fetch(`${base}/api/saves`);}catch{return;}await new Promise(r=>setTimeout(r,500));}throw Error('servidor não caiu');}

const c=createCampaign();receiveSeed(c);activateCore(c);const campaign=upgradeCampaign(migrateCampaign(c));const story=ensureStory(campaign);
for(const id of SCENES)story.scenes[id]=id==='brutus-meeting'?'skipped':'watched';
Object.assign(story.choices,{'ch2-water-share':'share','ch3-brutus-toll':'water','ch4-titan-part':'keep'});
if(!validStory(story))throw Error('fixture narrativa inválida');
const data={schemaVersion:3,truck:{position:[0,2,5],rotation:[0,0,0,1]},player:{position:[-3,1,5]},context:'walking',fuel:120,temperature:30,engineOn:false,campaign};

const report={method:'next dev (SQLite local; produção exige Turso e responde 500 sem ele) na porta 3100; save gravado pela API, processo encerrado com taskkill /T /F, servidor reiniciado e save relido com o mesmo cookie de identidade',backend:'libSQL/SQLite local (local.db)'};
let p=server();await ready();
const first=await fetch(`${base}/api/saves`);const cookie=(first.headers.getSetCookie?.()||[first.headers.get('set-cookie')]).filter(Boolean).map(s=>s.split(';')[0]).join('; ');
const h={'content-type':'application/json',cookie};
await fetch(`${base}/api/saves/1`,{method:'DELETE',headers:h});
const post=await fetch(`${base}/api/saves`,{method:'POST',headers:h,body:JSON.stringify({slot:'1',data})});report.postStatus=post.status;
const before=await (await fetch(`${base}/api/saves/1`,{headers:h})).json();
await kill(p);await down();report.serverStopped=true;
p=server();await ready();
const after=await (await fetch(`${base}/api/saves/1`,{headers:h})).json();
await kill(p);
const pick=s=>s.save??s;
report.versionBefore=pick(before).version;report.versionAfter=pick(after).version;
report.rawEqual=JSON.stringify(pick(before).data)===JSON.stringify(pick(after).data);
report.storyAfter=pick(after).data?.campaign?.story;report.storyValid=validStory(report.storyAfter);
report.passed=post.status===201&&report.rawEqual&&report.versionBefore===report.versionAfter&&report.storyValid&&Object.keys(report.storyAfter.scenes).length===SCENES.length;
writeFileSync(out,JSON.stringify(report,null,1));console.log(JSON.stringify({passed:report.passed,post:report.postStatus,rawEqual:report.rawEqual,version:[report.versionBefore,report.versionAfter],scenes:Object.keys(report.storyAfter?.scenes||{}).length}));
process.exit(report.passed?0:1);

import {spawn} from 'node:child_process';
import {open,mkdir,writeFile} from 'node:fs/promises';
const dir='evidence/roads-0.9.0';await mkdir(dir,{recursive:true});
const jobs=[
 {id:'pilot-attempt-3',script:'scripts/percorrer-piloto-0.9.0.mjs'},
 {id:'final-access',script:'scripts/auditar-acessos-0.9.0.mjs',env:{AURORA_ACCESS_EVIDENCE:`${dir}/final-access`}},
 {id:'physical-route-a',script:'scripts/dirigir-rota-pavimentada-0.9.0.mjs'},
 {id:'after-captures',script:'scripts/capturar-rede-rodoviaria.mjs',args:['after']},
];
const results=[];
for(const job of jobs){
 console.log(`START ${job.id}`);const started=new Date().toISOString(),log=await open(`${dir}/${job.id}.log`,'w');
 const child=spawn(process.execPath,[job.script,...(job.args||[])],{stdio:['ignore',log.fd,log.fd],env:{...process.env,...job.env}});
 const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);});await log.close();results.push({id:job.id,started,finished:new Date().toISOString(),code});await writeFile(`${dir}/physical-validation.json`,JSON.stringify(results,null,2)+'\n');console.log(`END ${job.id}: ${code}`);if(code){process.exitCode=code;break;}
}

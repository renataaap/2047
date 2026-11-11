import { spawn } from 'node:child_process';
const url='http://localhost:3000';
const open=()=>{if(process.platform==='win32')spawn('cmd.exe',['/c','start','',url],{stdio:'ignore'}).unref();};
const answers=async()=>{try{await fetch(url,{signal:AbortSignal.timeout(1500)});return true;}catch{return false;}};

// Se outro jogo (por exemplo, de outra pasta ou versão) já ocupa a porta 3000, o navegador
// mostraria ESSE jogo em vez deste. Avisa e para, em vez de abrir a versão errada.
if(await answers()){
 console.log('\nJá existe um jogo aberto em '+url+' (talvez de outra pasta ou versão).');
 console.log('Feche a outra janela preta do 2047 (ou aperte Ctrl+C nela) e abra este arquivo de novo.\n');
 process.exit(1);
}
console.log('Iniciando 2047: Rede Aurora. Mantenha esta janela aberta enquanto joga.');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3000'],{stdio:'inherit',env:{...process.env,NEXT_PUBLIC_AURORA_DEBUG:'0'}});
let stopped=false;server.on('exit',code=>{stopped=true;process.exitCode=code||0;});
for(let attempt=0;attempt<90&&!stopped;attempt++){
 try{const response=await fetch(url);if(response.ok){console.log(`Abra ${url}`);open();break;}}catch{}
 await new Promise(resolve=>setTimeout(resolve,500));
}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{server.kill(signal);});

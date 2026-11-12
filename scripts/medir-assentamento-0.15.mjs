// 0.15: mede a distância entre a base dos modelos do ambiente (garagem do Dante, barris, carros
// abandonados) e a superfície pisável, e captura as cenas. Uso:
//   AURORA_BASE_URL=http://127.0.0.1:3100 node scripts/medir-assentamento-0.15.mjs <etapa>
import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {roadX} from '../src/game/world/terrain.js';
import {skipPrologue} from '../tests/helpers/start-driving.js';
const base=process.env.AURORA_BASE_URL||'http://127.0.0.1:3000',stage=process.argv[2]||'antes';
const dir=`evidence/grounding-0.15/${stage}`;await mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1280,height:720}});page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'medio',scale:1,volume:0,footCamera:'third'})));
 await page.goto(base);await page.getByRole('button',{name:'01 Novo jogo'}).click({timeout:120000});await skipPrologue(page);
 await page.getByRole('button',{name:'Pular tutorial',exact:true}).click();
 const state=()=>page.evaluate(()=>window.__GAME_DEBUG__.getState());
 // Gira a câmera a pé com o mesmo caminho do mouse (pointer lock simulado).
 const turn=dx=>page.evaluate(dx=>{const c=document.querySelector('canvas');Object.defineProperty(document,'pointerLockElement',{configurable:true,get:()=>c});document.dispatchEvent(new MouseEvent('mousemove',{movementX:dx,movementY:0}));window.dispatchEvent(new MouseEvent('mousemove',{movementX:dx,movementY:0}));},dx);
 const wait=async ids=>{for(let i=0;i<120;i++){const g=(await state()).environmentModels?.grounding||[];if(ids.every(id=>g.some(x=>x.id===id)))return g;await page.waitForTimeout(500);}throw Error('modelos não carregaram: '+ids);};
 const settle=async()=>{for(let i=0;i<30;i++){const m=(await state()).mode;if(m==='walking')return;if(m==='cinematic')await page.keyboard.press('Escape');await page.waitForTimeout(500);}};
 const report={stage,base,shots:[]};
 const shot=async(id,p,dx,ids)=>{await page.evaluate(p=>window.__GAME_DEBUG__.teleportPlayer(p),p);await page.waitForTimeout(800);await settle();if(dx)await turn(dx);const g=await wait(ids);await page.waitForTimeout(1500);await settle();await page.waitForTimeout(1500);await page.screenshot({path:`${dir}/${id}.png`});report.shots.push({id,player:p,grounding:g.filter(x=>ids.includes(x.id))});};
 // Barris e garagem: jogador ao sul olhando para +z (meia-volta).
 await shot('garagem-barris',{x:-14.5,z:10},1257,['dantes-garage','shelter-barrel','shelter-barrel-2']);
 await turn(-1257);
 await shot('sedan',{x:roadX(-180)-15,z:-172},0,['abandoned-sedan']);
 await shot('hatch',{x:roadX(-470)+14,z:-462},0,['evacuated-hatch']);
 report.all=(await state()).environmentModels;report.errors=errors;
 await writeFile(`${dir}/grounding.json`,JSON.stringify(report,null,1));
 for(const s of report.shots)for(const g of s.grounding)console.log(s.id.padEnd(16),g.id.padEnd(18),'base',g.base,'folga máx',g.maxGap,'mín',g.minGap);
}finally{await browser.close();if(errors.length)console.log('erros',errors);}

import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {evidencePath} from '../helpers/evidence-path.js';
import {skipPrologue} from '../helpers/start-driving.js';

// Story 010: minimapa no canto superior esquerdo, tutorial/objetivo no topo central, controles
// contextuais no centro inferior; nada se sobrepõe em três resoluções e quatro contextos.
const dir=evidencePath('hud-layout-0.14.0');
const state=page=>page.evaluate(()=>window.__GAME_DEBUG__.getState());
const SIZES=[[1280,720],[960,640],[1920,1080]];
const SELECTORS=['.navigation-hud','.hud-top>.tutorial-guide','.hud-top>.objective','.compass','.pause-button','.survival-hud','.hud-controls','.interaction','.cargo-hud','.game-tools','.camera-label','.toast','.freight-hud','.speed-panel','.resource-panel'];

async function measure(page){
 return page.evaluate(sel=>{const out={};for(const s of sel){const e=document.querySelector('.hud '+s)||document.querySelector(s);if(!e)continue;const cs=getComputedStyle(e),r=e.getBoundingClientRect();
  if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)<.05||r.width<2||r.height<2)continue;out[s]={x:r.x,y:r.y,w:r.width,h:r.height};}return out;},SELECTORS);
}
function overlaps(boxes){
 const list=Object.entries(boxes),bad=[];
 for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const [a,A]=list[i],[b,B]=list[j];
  const area=Math.max(0,Math.min(A.x+A.w,B.x+B.w)-Math.max(A.x,B.x))*Math.max(0,Math.min(A.y+A.h,B.y+B.h)-Math.max(A.y,B.y));if(area>4)bad.push(`${a} × ${b}: ${Math.round(area)} px²`);}
 return bad;
}
async function check(page,name,report,expectControls){
 for(const [w,h] of SIZES){
  await page.setViewportSize({width:w,height:h});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.waitForTimeout(300);
  const boxes=await measure(page),bad=overlaps(boxes);await page.screenshot({path:`${dir}/${name}-${w}x${h}.png`});report.push({name,w,h,boxes,overlaps:bad});
  expect(bad,`${name} ${w}×${h}`).toEqual([]);
  const map=boxes['.navigation-hud'];expect(map,'minimapa visível').toBeTruthy();expect(map.x).toBeLessThan(w*.08);expect(map.y).toBeLessThan(40);
  const top=boxes['.hud-top>.tutorial-guide']||boxes['.hud-top>.objective'];expect(top,'tutorial ou objetivo no topo').toBeTruthy();if(top){expect(Math.abs(top.x+top.w/2-w/2)).toBeLessThan(24);expect(top.y).toBeLessThan(60);}
  const c=boxes['.hud-controls'];if(expectControls){expect(c,'controles visíveis').toBeTruthy();expect(Math.abs(c.x+c.w/2-w/2)).toBeLessThan(24);expect(c.y+c.h).toBeGreaterThan(h-60);}else expect(c).toBeUndefined();
 }
}

test('HUD: minimapa, tutorial/objetivo e controles nas novas posições, sem sobreposição',async({page})=>{
 test.setTimeout(300000);await mkdir(dir,{recursive:true});const errors=[],report=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1280,height:720});await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
 await page.goto('/');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'01 Novo jogo'}).click();await skipPrologue(page);
 await expect(page.locator('.hud-top .tutorial-guide')).toBeVisible();await expect(page.getByTestId('hud-controls')).toHaveAttribute('data-context','walking');
 await expect(page.getByTestId('hud-controls')).toContainText('interagir');
 await check(page,'a-pe-tutorial',report,true);
 await page.getByRole('button',{name:'Pular tutorial',exact:true}).click();await expect(page.locator('.hud-top .objective')).toBeVisible();
 await check(page,'a-pe-objetivo',report,true);
 await page.setViewportSize({width:1280,height:720});
 await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-3,z:5}));await page.keyboard.press('KeyF');await expect.poll(async()=>(await state(page)).mode).toBe('driving');
 await expect(page.getByTestId('hud-controls')).toHaveAttribute('data-context','driving');await expect(page.getByTestId('hud-controls')).toContainText('freio de mão');
 await check(page,'dirigindo',report,true);
 await page.setViewportSize({width:1280,height:720});await page.keyboard.press('KeyC');await expect(page.locator('.cab-hud')).toBeVisible();
 await check(page,'cabine',report,true);
 // Configuração: ocultar controles (salva com as demais configurações).
 await page.setViewportSize({width:1280,height:720});await page.keyboard.press('Escape');await page.getByRole('button',{name:/Ajustes|Configurações/}).first().click();
 await page.getByRole('checkbox',{name:'Mostrar controles na tela'}).uncheck();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('aurora-settings')).showControls)).toBe(false);
 await page.keyboard.press('Escape');await page.keyboard.press('Escape');await expect.poll(async()=>(await state(page)).mode).toBe('driving');
 await expect(page.getByTestId('hud-controls')).toHaveCount(0);await page.screenshot({path:`${dir}/controles-ocultos.png`});
 await writeFile(`${dir}/layout.json`,JSON.stringify(report,null,1));expect(errors).toEqual([]);
});

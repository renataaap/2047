import {expect} from '@playwright/test';
// 0.14 (story 002): Novo Jogo abre o prólogo 2027→2047. Regressões que não testam o prólogo
// o pulam pela ação real (Esc), que leva ao mesmo estado de assisti-lo.
export async function skipPrologue(page){
 await page.waitForFunction(()=>['walking','cinematic'].includes(window.__GAME_DEBUG__?.getState().mode),null,{timeout:60000});
 if(await page.evaluate(()=>window.__GAME_DEBUG__.getState().mode)==='cinematic'){await page.keyboard.press('Escape');await page.waitForFunction(()=>window.__GAME_DEBUG__.getState().mode==='walking');}
}
// Legacy driving regressions opt out of the new optional guide, then use the real entry action.
export async function enterFromNewTutorial(page){
 await skipPrologue(page);
 await page.getByRole('button',{name:'Pular tutorial',exact:true}).click();
 await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-3,z:5}));
 await page.keyboard.press('KeyF');await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().mode)).toBe('driving');
}

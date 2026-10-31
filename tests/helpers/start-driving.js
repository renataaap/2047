import {expect} from '@playwright/test';
// Legacy driving regressions opt out of the new optional guide, then use the real entry action.
export async function enterFromNewTutorial(page){
 await page.waitForFunction(()=>window.__GAME_DEBUG__?.getState().mode==='walking');
 await page.getByRole('button',{name:'Pular tutorial',exact:true}).click();
 await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-3,z:5}));
 await page.keyboard.press('KeyF');await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().mode)).toBe('driving');
}

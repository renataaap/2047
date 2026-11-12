import {expect} from '@playwright/test';

// Called only after closing a successfully activated terminal. Exercise the
// public skip control rather than mutating the mission/presentation state.
// 0.14 (story 006): a ativação que abre o capítulo 5 encadeia a cena 'horizon-eve' logo depois da
// apresentação; regressões que não a testam também a pulam pela ação real (Esc).
export async function skipRestorationPresentation(page){
 await expect(page.getByRole('button',{name:/Pular apresentação/})).toBeVisible();
 await page.getByRole('button',{name:/Pular apresentação/}).click();
 await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().mode)).toBe('walking');
 await page.waitForTimeout(500);
 for(let i=0;i<10&&await page.evaluate(()=>!!window.__GAME_DEBUG__.getState().cutscene&&window.__GAME_DEBUG__.getState().mode==='cinematic');i++){await page.keyboard.press('Escape');await page.waitForTimeout(400);}
 await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().mode)).toBe('walking');
}

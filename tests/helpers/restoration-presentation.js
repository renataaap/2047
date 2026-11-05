import {expect} from '@playwright/test';

// Called only after closing a successfully activated terminal. Exercise the
// public skip control rather than mutating the mission/presentation state.
export async function skipRestorationPresentation(page){
 await expect(page.getByRole('button',{name:/Pular apresentação/})).toBeVisible();
 await page.getByRole('button',{name:/Pular apresentação/}).click();
 await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().mode)).toBe('walking');
}

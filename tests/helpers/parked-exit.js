import {expect} from '@playwright/test';
const state=page=>page.evaluate(()=>window.__GAME_DEBUG__.getState());

// A diagnostic teleport is not a settled vehicle. Use real controls/physics,
// and never move Dante toward an NPC until the actual exit has succeeded.
export async function parkedExit(page){
 await expect.poll(async()=>(await state(page)).mode).toBe('driving');
 await page.keyboard.down('Space');
 try{
  const start=(await state(page)).simulation.steps;
  await expect.poll(async()=>(await state(page)).simulation.steps,{timeout:30000}).toBeGreaterThanOrEqual(start+120);
  await expect.poll(async()=>(await state(page)).speed,{timeout:15000}).toBeLessThan(.3);
  if((await state(page)).engineOn)await page.keyboard.press('KeyE');
  await expect.poll(async()=>(await state(page)).engineOn).toBe(false);
  await page.keyboard.press('KeyF');
  await expect.poll(async()=>(await state(page)).mode).toBe('walking');
 }finally{await page.keyboard.up('Space');}
}

import {test,expect} from '@playwright/test';
import {captureTruck} from '../../scripts/capturar-tita.mjs';

test('Titã: sólidos opacos, vidros próprios, seis rodas e retorno correto da cabine',async({page})=>{
 test.setTimeout(480000);const result=await captureTruck(page,'after',test.info().project.use.baseURL);
 for(const {id,state:s}of result.shots){
  expect(s.importedTruck.status).toBe('imported');expect(s.importedTruck.visible).toBe(true);expect(s.importedTruck.wheelBindings).toBe(6);expect(s.assets.errors).toEqual([]);
  for(const m of s.importedTruck.materials){
   const glass=['glass','lens'].includes(m.role);expect(m.transparent).toBe(glass);expect(m.depthWrite).toBe(!glass);expect(m.depthTest).toBe(true);expect(m.alphaTest).toBe(0);expect(m.alphaMap).toBe(false);
   if(glass)expect(m.opacity).toBeLessThan(1);else expect(m.opacity).toBe(1);
  }
  const inside=id==='cabine'||id==='cabine-noite';expect(s.importedTruck.legacyCabVisible).toBe(inside);expect(s.importedTruck.cabShellVisible).toBe(!inside);
 }
 const moving=result.shots.find(s=>s.id==='movimento').state;
 expect(moving.speedKmh).toBeGreaterThan(10);expect(moving.importedTruck.wheels.some(w=>Math.abs(w.rotation)>.1)).toBe(true);expect(moving.importedTruck.wheels.some(w=>Math.abs(w.steering)>.03)).toBe(true);expect(moving.wheelContacts.filter(Boolean).length).toBeGreaterThan(3);expect(moving.importedTruck.wheels.every(w=>Number.isFinite(w.y))).toBe(true);
 expect(result.shots.find(s=>s.id==='noite').state.headlights).toBe(true);expect(result.exited.mode).toBe('walking');expect(result.exited.importedTruck.visible).toBe(true);expect(result.exited.importedTruck.legacyCabVisible).toBe(false);expect(result.exited.importedTruck.cabShellVisible).toBe(true);expect(result.consoleErrors).toEqual([]);
});

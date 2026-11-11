import { describe,it,expect } from 'vitest';
import { createStudioHook,installStudioHook } from '../../src/game/core/studioHook.js';

// A fake game and debug object: records keys and steps, assigns no game state.
const makeFixture=()=>{
 const sent=[],steps=[],deferred=[];
 const game={mode:'driving',diagnosticStepping:false,context(){return this.mode;}};
 const debug={getState:()=>({mode:game.mode}),controlledStepping:on=>{game.diagnosticStepping=!!on;},step:(input,count)=>{steps.push({input,count,keysAtStep:[...down]});}};
 const down=new Set();
 const target={dispatchEvent:e=>{sent.push(`${e.type}:${e.code}`);if(e.type==='keydown')down.add(e.code);else down.delete(e.code);return true;}};
 const hook=createStudioHook(game,debug,target,(code,type)=>({code,type}),fn=>deferred.push(fn));
 return {game,debug,hook,sent,steps,deferred,down};
};

describe('hook de estado do estúdio',()=>{
 it('expõe cena e estado pelo jogo e pelo debug existentes',()=>{
  const {game,hook}=makeFixture();
  expect(hook.scene).toBe('driving');game.mode='walking';
  expect(hook.scene).toBe('walking');expect(hook.state).toEqual({mode:'walking'});
 });
 it('press segura a tecla só no primeiro passo controlado',()=>{
  const {game,hook,sent,steps}=makeFixture();
  game.diagnosticStepping=true;
  hook.press('KeyF');hook.step(3);
  expect(steps).toEqual([{input:{},count:1,keysAtStep:['KeyF']},{input:{},count:2,keysAtStep:[]}]);
  expect(sent).toEqual(['keydown:KeyF','keyup:KeyF']);
 });
 it('o primeiro step liga o passo controlado',()=>{
  const {game,hook}=makeFixture();
  hook.step();expect(game.diagnosticStepping).toBe(true);
 });
 it('sem passo controlado, press solta a tecla no quadro adiado',()=>{
  const {hook,sent,deferred}=makeFixture();
  hook.press('KeyE');expect(sent).toEqual(['keydown:KeyE']);
  expect(deferred).toHaveLength(1);deferred[0]();
  expect(sent).toEqual(['keydown:KeyE','keyup:KeyE']);
 });
 it('hold mantém a tecla através dos passos até soltar',()=>{
  const {game,hook,sent,steps}=makeFixture();
  game.diagnosticStepping=true;
  hook.hold('KeyW',true);hook.hold('KeyW',true);hook.step(2);
  expect(steps.map(s=>s.keysAtStep)).toEqual([['KeyW'],['KeyW']]);
  hook.hold('KeyW',false);hook.hold('KeyW',false);
  expect(sent).toEqual(['keydown:KeyW','keyup:KeyW']);
 });
 it('press de tecla já segurada não a solta',()=>{
  const {game,hook,sent,down}=makeFixture();
  game.diagnosticStepping=true;
  hook.hold('KeyW',true);hook.press('KeyW');hook.step();
  expect(down.has('KeyW')).toBe(true);expect(sent).toEqual(['keydown:KeyW']);
 });
 it('fora do navegador não instala nada',()=>{
  const {game,debug}=makeFixture();
  const uninstall=installStudioHook(game,debug);
  expect(typeof uninstall).toBe('function');expect(()=>uninstall()).not.toThrow();
 });
});

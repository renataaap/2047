// Development-only game-state hook for the Claude Code Game Studios checks,
// installed by Game's existing debug guard (NODE_ENV !== 'production') beside
// installDiagnosticSteps. Players never see it.
//
//   window.game  scene, state, press(code), hold(code, on), step(n)
//   ?manual=1    controlled stepping from the start: only step() moves physics
//
// The first step() switches to controlled stepping (the debug.controlledStepping
// the E2Es use); the real loop stops advancing physics from then on. Without
// stepping, a press() is let go two frames later.
//
// It adds no loop and assigns no game state. Keys go through the real Input
// listeners as KeyboardEvents; step() reuses debug.step, the same fixed update
// the diagnostic E2Es drive. Rendering stays on the existing RAF, so step's
// draw argument has no effect, and the hook has no events log (no loop()).

/**
 * Builds the hook over a Game and its debug object.
 * @param {object} game the running Game (context(), snapshot via debug.getState)
 * @param {object} debug the development debug object with step/controlledStepping
 * @param {{dispatchEvent:(e:Event)=>boolean}} target where KeyboardEvents are sent (window)
 * @param {(code:string,type:'keydown'|'keyup')=>Event} makeKey creates one key event
 * @param {(fn:()=>void)=>void} defer runs fn after the next frame; lets a press go when the real loop is running
 * @returns {{scene:string,state:unknown,press(code:string):void,hold(code:string,on:boolean):void,step(n?:number,draw?:boolean):void}}
 */
export function createStudioHook(game,debug,target,makeKey,defer){
 const held=new Set(),pressed=new Set();
 const send=(code,type)=>{target.dispatchEvent(makeKey(code,type));};
 const release=()=>{for(const code of pressed){if(!held.has(code))send(code,'keyup');}pressed.clear();};
 return {
  get scene(){return game.context();},
  get state(){return debug.getState();},
  press(code){if(held.has(code)||pressed.has(code))return;pressed.add(code);send(code,'keydown');if(!game.diagnosticStepping)defer(release);},
  hold(code,on){if(on){if(held.has(code))return;held.add(code);if(!pressed.has(code))send(code,'keydown');}else{if(!held.delete(code))return;if(!pressed.has(code))send(code,'keyup');}},
  step(n=1){
   if(!game.diagnosticStepping)debug.controlledStepping(true);
   // The first fixed step sees pressed keys; they are let go after it.
   debug.step({},1);release();
   if(n>1)debug.step({},n-1);
  }
 };
}

/**
 * Installs window.game in a browser. Returns an uninstall function.
 * @param {object} game the running Game
 * @param {object} debug the development debug object
 * @returns {()=>void}
 */
export function installStudioHook(game,debug){
 if(typeof window==='undefined')return()=>{};
 const hook=createStudioHook(game,debug,window,(code,type)=>new KeyboardEvent(type,{code,bubbles:true}),fn=>requestAnimationFrame(()=>requestAnimationFrame(fn)));
 if(new URLSearchParams(window.location.search).get('manual')==='1')debug.controlledStepping(true);
 window.game=hook;
 return()=>{if(window.game===hook)delete window.game;};
}

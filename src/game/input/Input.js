export class Input {
  constructor(actions,canvas) {
    this.keys=new Set();this.override={};this.context='menu';this.drag=false;
    this.down=e=>{if(this.context!=='driving')return;if(['Space','Tab','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();if(e.repeat)return;this.keys.add(e.code);if(e.code==='KeyE')actions.engine();if(e.code==='KeyC')actions.camera();if(e.code==='KeyL')actions.lights();if(e.code==='Escape')actions.pause();};
    this.up=e=>this.keys.delete(e.code);this.blur=()=>{this.clear();if(this.context==='driving')actions.pause();};
    this.pointerDown=e=>{if(this.context==='driving'){this.drag=true;canvas.setPointerCapture?.(e.pointerId);}};this.pointerUp=()=>this.drag=false;this.move=e=>{if(this.drag&&this.context==='driving')actions.orbit(e.movementX,e.movementY);};this.wheel=e=>{if(this.context==='driving')actions.zoom(e.deltaY);};
    window.addEventListener('keydown',this.down);window.addEventListener('keyup',this.up);window.addEventListener('blur',this.blur);canvas.addEventListener('pointerdown',this.pointerDown);canvas.addEventListener('pointerup',this.pointerUp);canvas.addEventListener('pointermove',this.move);canvas.addEventListener('wheel',this.wheel,{passive:true});this.canvas=canvas;
  }
  setContext(context){this.context=context;this.clear();}
  clear(){this.keys.clear();this.override={};this.drag=false;}
  read(){if(this.context!=='driving')return {throttle:0,steer:0,handbrake:true};return {throttle:Number(this.keys.has('KeyW'))-Number(this.keys.has('KeyS')),steer:Number(this.keys.has('KeyA'))-Number(this.keys.has('KeyD')),handbrake:this.keys.has('Space'),...this.override};}
  dispose(){window.removeEventListener('keydown',this.down);window.removeEventListener('keyup',this.up);window.removeEventListener('blur',this.blur);this.canvas.removeEventListener('pointerdown',this.pointerDown);this.canvas.removeEventListener('pointerup',this.pointerUp);this.canvas.removeEventListener('pointermove',this.move);this.canvas.removeEventListener('wheel',this.wheel);this.clear();}
}

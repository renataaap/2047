import {useEffect,useRef,useCallback} from 'react';
export default function usePanelNavigation(ref,onClose,identity,volume=0){
 const volumeRef=useRef(volume);volumeRef.current=volume;const closeRef=useRef(onClose);closeRef.current=onClose;const audio=useRef();
 const close=useCallback(()=>{
  const backdrop=ref.current?.closest('.panel-backdrop');
  if(backdrop&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){const ghost=backdrop.cloneNode(true);ghost.inert=true;ghost.setAttribute('aria-hidden','true');ghost.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));ghost.classList.add('panel-closing');document.body.append(ghost);setTimeout(()=>ghost.remove(),140);}
  closeRef.current();
 },[ref]);
 useEffect(()=>{
  const previous=document.activeElement;
  const enabled=()=>[...ref.current.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled)')].filter(n=>n.getClientRects().length);
  (ref.current.querySelector('.narrative-choices button')||enabled()[0])?.focus();
  const key=e=>{
   if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();return;}
   const nodes=enabled(),index=nodes.indexOf(document.activeElement);
   if(e.code==='Tab'){if(e.shiftKey&&index<=0){e.preventDefault();nodes.at(-1)?.focus();}else if(!e.shiftKey&&(index===nodes.length-1||index<0)){e.preventDefault();nodes[0]?.focus();}return;}
   if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
   if(['ArrowDown','ArrowUp','KeyW','KeyS','Home','End'].includes(e.code)){
    e.preventDefault();e.stopImmediatePropagation();let next=e.code==='Home'?0:e.code==='End'?nodes.length-1:(index+(['ArrowUp','KeyW'].includes(e.code)?-1:1)+nodes.length)%nodes.length;nodes[next]?.focus();
   }
  };
  const feedback=()=>{if(volumeRef.current<=0)return;try{audio.current ||= new (window.AudioContext||window.webkitAudioContext)();const a=audio.current;a.resume().catch(()=>{});const o=a.createOscillator(),g=a.createGain();o.frequency.value=480;g.gain.setValueAtTime(.018*volumeRef.current,a.currentTime);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+.035);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+.04);}catch{}};
  const panel=ref.current;panel.addEventListener('focusin',feedback);window.addEventListener('keydown',key,true);
  return()=>{window.removeEventListener('keydown',key,true);panel.removeEventListener('focusin',feedback);previous?.isConnected&&previous.focus();};
 },[identity,close,ref]);
 useEffect(()=>()=>{audio.current?.close().catch(()=>{});},[]);
 return {close,closing:false};
}

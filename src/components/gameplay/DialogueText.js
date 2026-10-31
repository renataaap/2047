import { useEffect,useState } from 'react';
export default function DialogueText({text}){
 const [n,setN]=useState(0);
 useEffect(()=>{setN(0);if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setN(text.length);return;}const timer=setInterval(()=>setN(v=>{const next=Math.min(text.length,v+5);if(next===text.length)clearInterval(timer);return next;}),20);return()=>clearInterval(timer);},[text]);
 return <div className="speech"><p className="transmission" aria-label={text}>{text.slice(0,n)}<span aria-hidden="true">{n<text.length?'▏':''}</span></p>{<button aria-label="Exibir texto completo" aria-pressed={n>=text.length} className="reveal-speech" onClick={()=>setN(text.length)}>Exibir texto completo</button>}</div>;
}

export const DEFAULT_SETTINGS={quality:'medio',volume:.65,scale:1,subtitles:true};
export function loadSettings(){try{const s=JSON.parse(localStorage.getItem('aurora-settings')||'null');return normalizeSettings(s);}catch{return {...DEFAULT_SETTINGS};}}
export function normalizeSettings(s){return {quality:['baixo','medio','alto'].includes(s?.quality)?s.quality:'medio',volume:Number.isFinite(s?.volume)?Math.max(0,Math.min(1,s.volume)):.65,scale:[.75,1,1.25].includes(s?.scale)?s.scale:1,subtitles:typeof s?.subtitles==='boolean'?s.subtitles:true};}
export function saveSettings(s){try{localStorage.setItem('aurora-settings',JSON.stringify(s));}catch{/* Os ajustes continuam ativos nesta sessão. */}}

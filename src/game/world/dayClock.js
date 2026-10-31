import {upgradeWorld} from './worldProgress.js';
export const DAY_SECONDS=86400;
export function advanceDay(c,dt,minutes=48){
 if(!Number.isFinite(dt)||dt<0||dt>3600)return;
 const w=upgradeWorld(c),length=[24,48,96].includes(minutes)?minutes:48,total=w.daySeconds+dt*DAY_SECONDS/(length*60);
 w.days=Math.min(1e7,w.days+Math.floor(total/DAY_SECONDS));w.daySeconds=total%DAY_SECONDS;
}
const mix=(a,b,t)=>a+(b-a)*t;
const keys=[
 {h:0,top:'#0a1426',bottom:'#263446',fog:'#263544',sun:'#b7cce4'},
 {h:5,top:'#1f3045',bottom:'#62545c',fog:'#555563',sun:'#dba37b'},
 {h:6.5,top:'#718393',bottom:'#cfad83',fog:'#9b9c94',sun:'#ffd09b'},
 {h:12,top:'#627d91',bottom:'#c8bda2',fog:'#9da9aa',sun:'#fff0d8'},
 {h:17,top:'#606e7c',bottom:'#d5b28b',fog:'#a69b88',sun:'#ffd1a0'},
 {h:19,top:'#202d46',bottom:'#6e5960',fog:'#50586b',sun:'#b7cce4'},
 {h:24,top:'#0a1426',bottom:'#263446',fog:'#263544',sun:'#b7cce4'},
];
export function timeSample(seconds){
 const hour=(((Number.isFinite(seconds)?seconds:32400)%DAY_SECONDS)+DAY_SECONDS)%DAY_SECONDS/3600;
 const index=keys.findIndex((p,i)=>keys[i+1]&&hour>=p.h&&hour<keys[i+1].h),a=keys[Math.max(0,index)],b=keys[Math.max(0,index)+1],t=(hour-a.h)/(b.h-a.h),smooth=t*t*(3-2*t),angle=(hour-6)/12*Math.PI,elevation=Math.sin(angle),daylight=Math.max(0,Math.min(1,(elevation+.12)/.5));
 const period=hour<5||hour>=19?'Noite':hour<6.5?'Amanhecer':hour<12?'Manhã':hour<17?'Tarde':'Entardecer';
 return {hour,period,label:`${String(Math.floor(hour)).padStart(2,'0')}:${String(Math.floor(hour*60)%60).padStart(2,'0')}`,a,b,blend:smooth,angle,elevation,night:1-daylight,sunIntensity:.12+3.15*Math.sqrt(Math.max(0,elevation)),ambientIntensity:mix(.38,2.05,daylight),environmentIntensity:mix(.055,.4,daylight)};
}

export const distance=(a,b)=>Math.hypot(b.x-a.x,b.z-a.z);
export const mix=(a,b,t)=>a+(b-a)*t;
export function cubic(points,t){const u=1-t,w=[u*u*u,3*u*u*t,3*u*t*t,t*t*t];return {x:w.reduce((s,v,i)=>s+v*points[i].x,0),y:w.reduce((s,v,i)=>s+v*(points[i].y||0),0),z:w.reduce((s,v,i)=>s+v*points[i].z,0)};}
export function projectSpan(p,a,b){const dx=b.x-a.x,dz=b.z-a.z,n=dx*dx+dz*dz,t=n?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/n)):0;return {x:mix(a.x,b.x,t),y:mix(a.y||0,b.y||0,t),z:mix(a.z,b.z,t),t,distance:Math.hypot(p.x-mix(a.x,b.x,t),p.z-mix(a.z,b.z,t))};}
export function sampleCurve(e,step=3){
 const control=e.controlPoints,estimate=e.shape?Math.abs(e.end.z-e.start.z)*1.8:3*Math.max(...control.slice(1).map((p,i)=>distance(control[i],p))),count=Math.max(2,Math.ceil(estimate/step)),points=[];let length=0;
 for(let i=0;i<=count;i++){const t=i/count,p=e.shape?e.shape(t):cubic(control,t);if(i)length+=distance(points[i-1],p);points.push({...p,s:length});}
 for(let i=0;i<points.length;i++){const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],l=Math.hypot(b.x-a.x,b.z-a.z)||1;points[i].nx=-(b.z-a.z)/l;points[i].nz=(b.x-a.x)/l;}
 return {...e,samples:points,length,incline:points.slice(1).reduce((n,p,i)=>Math.max(n,Math.abs(p.y-points[i].y)/Math.max(.001,distance(points[i],p))),0)};
}
export function projectPolyline(p,points){let best=null;for(let i=1;i<points.length;i++){const hit=projectSpan(p,points[i-1],points[i]);if(!best||hit.distance<best.distance)best={...hit,index:i,s:mix(points[i-1].s||0,points[i].s||0,hit.t)};}return best;}
// A turn stays inside a physically paved junction. Radius is capped at either
// adjacent edge length; no smoothing across an arbitrary disconnected shortcut.
export function roundJunctions(points,radius=22){
 let s=0;const source=points.map((p,i)=>({...p,s:i?(s+=distance(points[i-1],p)):0}));if(source.length<3)return source;
 const at=target=>{for(let j=1;j<source.length;j++)if(source[j].s>=target){const a=source[j-1],b=source[j],t=(target-a.s)/Math.max(.001,b.s-a.s);return {x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),z:mix(a.z,b.z,t),s:target};}return source.at(-1);};
 const corners=[];let lastEnd=-1;
 for(let i=1;i<source.length-1;i++){const b=source[i];if(!b.junction)continue;const r=Math.min(radius,b.s*.45,(source.at(-1).s-b.s)*.45),a=at(b.s-r),c=at(b.s+r),ab=distance(a,b),bc=distance(b,c);if(r<2||((b.x-a.x)*(c.x-b.x)+(b.z-a.z)*(c.z-b.z))/Math.max(.001,ab*bc)>.92||a.s<lastEnd)continue;corners.push({a,b,c});lastEnd=c.s;}
 const out=[];let cursor=0;
 for(const {a,b,c} of corners){while(cursor<source.length&&source[cursor].s<a.s)out.push(source[cursor++]);out.push(a);for(let j=1;j<=12;j++){const t=j/12,u=1-t;out.push({x:u*u*a.x+2*u*t*b.x+t*t*c.x,y:u*u*a.y+2*u*t*b.y+t*t*c.y,z:u*u*a.z+2*u*t*b.z+t*t*c.z});}while(cursor<source.length&&source[cursor].s<=c.s)cursor++;}
 out.push(...source.slice(cursor));s=0;return out.map((p,i)=>({...p,s:i?(s+=distance(out[i-1],p)):0}));
}

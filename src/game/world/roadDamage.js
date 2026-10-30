// The tutorial manoeuvring area stays intact. A shallow failure beyond km .25
// is represented by the road mesh and its identical Rapier collider.
export const ROAD_DAMAGE=[{z:-322,offset:2.5,radius:1.35,depth:.22}];
export function roadDepression(x,z,centerX){let d=0;for(const p of ROAD_DAMAGE){const r=Math.hypot(x-centerX-p.offset,z-p.z)/p.radius;if(r<1)d+=p.depth*(1-r*r)**2;}return d;}
export function roadbedCarve(x,z,centerX){let d=0;for(const p of ROAD_DAMAGE){const r=Math.hypot(x-centerX-p.offset,z-p.z)/6;if(r<1)d+=.6*(1-r*r)**2;}return d;}

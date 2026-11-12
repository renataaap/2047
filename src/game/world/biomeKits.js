import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {randomSeed} from './terrain.js';

// Procedural landmark kits for the five biomes (design/art/art-bible.md §3, §6).
// Every kit is indexed geometry with position/normal/uv/color so a sector can
// merge all instances of one material into a single draw call. Colours are
// vertex colours (albedo ≤ 0.72) on materials that borrow rock/rust data maps,
// so no texture or sampler is added. Rule of thumb: silhouette first, every
// break has a cause (gravity, corrosion, wind, improvisation).

const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const UP=V(0,1,0);
const color=hex=>new THREE.Color(hex);

function finish(g,tone,shade){
 if(!g.index)throw Error('kit geometry must be indexed');
 for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);
 if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
 const p=g.attributes.position,c=new Float32Array(p.count*3);
 for(let i=0;i<p.count;i++){const k=Math.min(1,shade?shade(p.getX(i),p.getY(i),p.getZ(i)):1);c[i*3]=tone.r*k;c[i*3+1]=tone.g*k;c[i*3+2]=tone.b*k;}
 g.setAttribute('color',new THREE.BufferAttribute(c,3));
 return g;
}
function place(g,{p=[0,0,0],r=[0,0,0],s=[1,1,1]}={}){
 return g.applyMatrix4(new THREE.Matrix4().compose(V(...p),new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)),V(...s)));
}
// A straight member between two points (legs, braces, rebar).
function beam(a,b,t){
 const d=b.clone().sub(a),len=d.length(),g=new THREE.BoxGeometry(t,len,t);
 g.applyMatrix4(new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(.5),new THREE.Quaternion().setFromUnitVectors(UP,d.normalize()),V(1,1,1)));
 return g;
}
// Grime: darker at the foot and under slabs; soot patches by position.
const grime=(h,base=.72)=>(x,y,z)=>base+(1-base)*Math.min(1,Math.max(0,y/(h*.35)))-.06*Math.max(0,Math.sin(x*.9+z*1.3));
// Deterministic jitter shared by coincident seam vertices.
function jitter(g,amount,seed,keepBase=true){
 const p=g.attributes.position,h=k=>{const s=Math.sin(k*12.9898+seed*78.233)*43758.5453;return s-Math.floor(s)-.5;};
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(keepBase&&y<.01)continue;const key=Math.round(x*10)*7+Math.round(y*10)*131+Math.round(z*10)*1733;
  p.setXYZ(i,x+h(key)*amount,y+h(key+1)*amount*.6,z+h(key+2)*amount);}
 g.computeVertexNormals();return g;
}
const merge=parts=>{const g=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());return g;};

// ── Cidades Esqueleto ────────────────────────────────────────────────────
// Ruined tower: slabs, exposed columns, spandrel bands that read as window
// rows, dark core, collapsed corner and broken crown (no intact flat roof).
export function ruinTower(seed){
 const r=randomSeed(seed),w=10+r()*6,d=9+r()*5,floors=6+Math.floor(r()*8),fh=3.2,h=floors*fh,parts=[];
 const concrete=color(['#8a8176','#7f786e','#948a7c','#857d73'][seed%4]),core=color('#2c2824'),collapseFloor=Math.max(2,floors-2-Math.floor(r()*3)),corner=[r()<.5?-1:1,r()<.5?-1:1];
 parts.push(finish(place(new THREE.BoxGeometry(w*.42,h*.92,d*.42),{p:[0,h*.46,0]}),core));
 for(let i=0;i<=floors;i++){
  const y=i*fh,broken=i>=collapseFloor,shrink=broken?.45+r()*.3:1;
  if(i===floors&&r()<.6)continue;
  const sw=(w+.5)*shrink,sd=(d+.5)*(broken?.6+r()*.3:1),ox=broken?corner[0]*-(w-sw)/2:0,oz=broken?corner[1]*-(d-sd)/2:0;
  parts.push(finish(place(new THREE.BoxGeometry(sw,.34,sd),{p:[ox,y,oz],r:[broken?(r()-.5)*.14:0,0,broken?(r()-.5)*.12:0]}),concrete,grime(h)));
  if(i<floors&&i>0&&!broken)for(const s of [-1,1]){parts.push(finish(place(new THREE.BoxGeometry(w+.1,.85,.22),{p:[0,y+.55,s*(d/2+.12)]}),concrete,grime(h,.82)));parts.push(finish(place(new THREE.BoxGeometry(.22,.85,d+.1),{p:[s*(w/2+.12),y+.55,0]}),concrete,grime(h,.82)));}
 }
 const cols=[[-1,-1],[1,-1],[-1,1],[1,1],[0,-1],[0,1]];
 for(const [cx,cz] of cols){
  const inCorner=cx===corner[0]&&cz===corner[1],top=inCorner?collapseFloor*fh-1.2*r():h-(r()<.4?fh*r():0);
  parts.push(finish(place(new THREE.BoxGeometry(.62,top,.62),{p:[cx*(w/2-.3),top/2,cz*(d/2-.3)]}),concrete,grime(h)));
 }
 for(let i=0;i<3;i++){const x=(r()-.5)*w*.8,z=(r()-.5)*d*.8,y=collapseFloor*fh;parts.push(finish(beam(V(x,y,z),V(x+(r()-.5)*.5,y+1.2+r()*1.5,z+(r()-.5)*.5),.07),color('#5a3a2a')));}
 return {geometry:merge(parts),material:'concrete',size:[w,h,d],radius:Math.hypot(w,d)/2};
}
// Interrupted viaduct: deck on pillars ending in a tilted, fallen span.
export function viaductStub(seed){
 const r=randomSeed(seed),len=34+r()*16,parts=[],c=color('#867e72');
 parts.push(finish(place(new THREE.BoxGeometry(10,1.1,len),{p:[0,9,0]}),c,grime(9,.75)));
 for(const z of [-len*.35,len*.1])parts.push(finish(place(new THREE.CylinderGeometry(1.1,1.3,9,10),{p:[0,4.5,z]}),c,grime(9)));
 parts.push(finish(place(new THREE.BoxGeometry(10,1.1,14),{p:[0,4.6,len/2+5.5],r:[.62,0,.05]}),c,grime(9,.7)));
 for(const s of [-1,1])parts.push(finish(place(new THREE.BoxGeometry(.3,.9,len),{p:[s*4.85,10,0]}),color('#9a9184')));
 return {geometry:merge(parts),material:'concrete',size:[10,10,len+12],radius:(len+12)/2};
}

// ── Leito Seco ───────────────────────────────────────────────────────────
// Beached hull: lofted shell with a salt tide band below the old waterline,
// deck plate and wheelhouse. Lies rolled and half buried.
export function beachedHull(seed){
 const r=randomSeed(seed),L=14+r()*16,B=4+r()*3,D=2.6+r()*1.8,nu=16,nv=10,pos=[],uv=[],idx=[];
 const half=u=>B/2*Math.sqrt(Math.max(.03,1-Math.pow((u-.42)/.58,2)))*(u<.08?.7+u*3.5:1);
 for(let i=0;i<=nu;i++){const u=i/nu,w=half(u);for(let j=0;j<=nv;j++){const t=Math.PI*j/nv;pos.push(-Math.cos(t)*w,-Math.sin(t)*D*(.55+.45*w/(B/2)),(u-.5)*L);uv.push(u*L/4,j/nv*2);}}
 for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*(nv+1)+j,b=a+nv+1;idx.push(a,b,a+1,b,b+1,a+1);}
 const shell=new THREE.BufferGeometry();shell.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));shell.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));shell.setIndex(idx);shell.computeVertexNormals();
 const rust=color(['#9c4a2a','#7a4a34','#5d6f7a','#8a5a3a'][seed%4]),salt=color('#cfc6b0'),tide=-D*.42;
 const shade=(x,y)=>y<tide?1.18:.78+.22*Math.max(0,Math.sin(x*2.1));
 const shellC=finish(shell,rust,shade),cc=shellC.attributes.color,pp=shellC.attributes.position;
 for(let i=0;i<pp.count;i++)if(pp.getY(i)<tide){cc.setXYZ(i,salt.r*.92,salt.g*.92,salt.b*.9);}
 const parts=[shellC,finish(place(new THREE.BoxGeometry(B*.8,.18,L*.8),{p:[0,-.35,0]}),color('#8a7d6a')),finish(place(new THREE.BoxGeometry(B*.55,2.2,L*.18),{p:[0,.9,-L*.22]}),color('#a39888'),(x,y)=>.75+.25*y/2)];
 if(r()<.7)parts.push(finish(beam(V(0,0,L*.1),V(.6,5+r()*3,L*.12),.22),rust));
 // The hull rim is at y=0 and the keel at -D: lift it so only the keel is
 // buried and the salt tide band on the side stays visible.
 return {geometry:merge(parts),material:'metal',size:[B,D,L],radius:L/2,lift:D*.62,roll:.22+r()*.28};
}
// Pier pilings: a line of leaning posts with salt-white feet.
export function pierPilings(seed){
 const r=randomSeed(seed),n=7+Math.floor(r()*7),parts=[],wood=color('#5e5144'),salt=color('#cfc6b0');
 for(let i=0;i<n;i++){const h=1.6+r()*2.6,lean=(r()-.5)*.25;const g=place(new THREE.CylinderGeometry(.2,.26,h,7),{p:[(r()-.5)*.5,h/2-.3,i*2.6],r:[lean,0,(r()-.5)*.2]});
  parts.push(finish(g,wood,(x,y)=>y<.5?1.55:.8+.2*y/h));if(r()<.25)parts.push(finish(place(new THREE.BoxGeometry(.25,.25,2.6),{p:[0,h-.4,i*2.6+1.3]}),wood));}
 return {geometry:merge(parts),material:'concrete',size:[1,4,n*2.6],radius:n*1.3};
}
// Salt crust: cluster of raised polygon plates (reads as dried sea floor).
export function saltCrust(seed){
 const r=randomSeed(seed),n=18+Math.floor(r()*16),parts=[],R=14+r()*10;
 for(let i=0;i<n;i++){const a=r()*Math.PI*2,d=Math.sqrt(r())*R,rad=1.2+r()*2.4,tone=color(r()<.7?'#cfc6b0':'#b9b09b');
  parts.push(finish(place(new THREE.CylinderGeometry(rad,rad*1.04,.12,6),{p:[Math.cos(a)*d,.04+r()*.05,Math.sin(a)*d],r:[(r()-.5)*.06,r()*3,(r()-.5)*.06]}),tone,(x,y)=>y>.06?1.04:.82));}
 return {geometry:merge(parts),material:'concrete',size:[R*2,.2,R*2],radius:R,flat:true};
}

// ── Cordilheira Vítrea ───────────────────────────────────────────────────
// Faceted rock spire with strata bands (no smooth face, 30–60° facets).
export function rockSpire(seed){
 const r=randomSeed(seed),h=14+r()*30,rb=3+r()*5,g=new THREE.CylinderGeometry(rb*(.12+r()*.18),rb,h,6,5);
 g.translate(0,h/2,0);jitter(g,rb*.35,seed);
 const slate=color(r()<.5?'#4a5058':'#5d6f7a');
 const parts=[finish(g,slate,(x,y)=>.78+.16*Math.sin(y*1.7)+.08*Math.sin(y*.43))];
 if(r()<.6){const g2=new THREE.CylinderGeometry(rb*.1,rb*.55,h*.55,5,3);g2.translate(rb*.7,h*.27,rb*.3);jitter(g2,rb*.25,seed+7);parts.push(finish(g2,slate,(x,y)=>.74+.14*Math.sin(y*1.9)));}
 return {geometry:merge(parts),material:'rock',size:[rb*2,h,rb*2],radius:rb};
}
// Glass shards: dark vitrified blades leaning the same way (wind/plasma).
export function glassShards(seed){
 const r=randomSeed(seed),n=3+Math.floor(r()*5),parts=[],lean=.4+r()*.5;
 for(let i=0;i<n;i++){const h=2+r()*5.5,rad=.35+r()*.6;const g=new THREE.CylinderGeometry(0,rad,h,4,1);g.translate(0,h/2,0);
  place(g,{p:[(r()-.5)*5,-.3,(r()-.5)*5],r:[lean+(r()-.5)*.25,r()*1.5,(r()-.5)*.3]});parts.push(finish(g,color('#2f3740')));}
 return {geometry:merge(parts),material:'glass',size:[6,6,6],radius:3.5};
}

// ── Zonas de Tempestade ──────────────────────────────────────────────────
// Lattice power pylon, leaning downwind.
export function stormPylon(seed){
 const r=randomSeed(seed),h=20+r()*10,b=3.2,t=.9,parts=[],steel=color('#55524c');
 const corners=[[-1,-1],[1,-1],[1,1],[-1,1]],at=(k,y)=>{const s=b+(t-b)*y/h;return V(corners[k][0]*s,y,corners[k][1]*s);};
 for(let k=0;k<4;k++)parts.push(finish(beam(at(k,0),at(k,h),.32),steel));
 for(let y=4;y<h;y+=4)for(let k=0;k<4;k++){parts.push(finish(beam(at(k,y),at((k+1)%4,y),.14),steel));parts.push(finish(beam(at(k,y-4),at((k+1)%4,y),.1),steel));}
 for(const y of [h*.78,h*.92]){parts.push(finish(beam(V(-5-r(),y,0),V(5+r(),y,0),.28),steel));for(const s of [-1,1])parts.push(finish(beam(V(s*4.6,y,0),V(s*4.6,y-1.6,0),.06),color('#3a3632')));}
 return {geometry:merge(parts),material:'metal',size:[b*2,h,b*2],radius:b+1,lean:.06+r()*.06};
}
// Fulgurite: fused, branching glass lumps where plasma struck.
export function fulgurite(seed){
 const r=randomSeed(seed),n=2+Math.floor(r()*3),parts=[];
 for(let i=0;i<n;i++){const h=1.2+r()*2.8,g=new THREE.CylinderGeometry(.15+r()*.2,.55+r()*.5,h,5,3);g.translate(0,h/2,0);jitter(g,.25,seed+i);place(g,{p:[(r()-.5)*2.4,-.2,(r()-.5)*2.4],r:[(r()-.5)*.5,0,(r()-.5)*.5]});parts.push(finish(g,color('#3b3446'),(x,y)=>.8+.2*y/h));}
 return {geometry:merge(parts),material:'glass',size:[3,4,3],radius:2};
}
// Plasma scar: forked emissive cracks on the ground (hidden after restoration).
export function plasmaScar(seed){
 const r=randomSeed(seed),parts=[],walk=(x,z,a,depth,len)=>{for(let i=0;i<len;i++){const l=1.6+r()*2.4,nx=x+Math.cos(a)*l,nz=z+Math.sin(a)*l;
  parts.push(finish(beam(V(x,.06,z),V(nx,.06,nz),.18),color('#8d5bd9')));x=nx;z=nz;a+=(r()-.5)*.9;if(depth<2&&r()<.22)walk(x,z,a+(r()<.5?-1:1)*(.6+r()*.5),depth+1,3+Math.floor(r()*4));}};
 walk(0,0,r()*Math.PI*2,0,7+Math.floor(r()*6));
 return {geometry:merge(parts),material:'plasma',size:[20,.1,20],radius:12,flat:true};
}

// ── Mar de Cinzas ────────────────────────────────────────────────────────
// Brick smokestack with reinforcement rings and a broken crown.
export function smokestack(seed){
 const r=randomSeed(seed),h=24+r()*20,rb=1.9+r()*.8,parts=[],brick=color('#7d5a48');
 const g=new THREE.CylinderGeometry(rb*.72,rb,h,12,1,true);g.translate(0,h/2,0);parts.push(finish(g,brick,grime(h,.68)));
 for(let y=6;y<h-3;y+=5+r()*3){const k=1-(y/h)*.28;parts.push(finish(place(new THREE.CylinderGeometry(rb*k+.12,rb*k+.12,.35,12,1,true),{p:[0,y,0]}),color('#4a3e36')));}
 const crown=new THREE.CylinderGeometry(rb*.7,rb*.72,2.4,12,1,true);crown.translate(0,1.2,0);place(crown,{p:[.3,h-.4,0],r:[0,0,.32]});parts.push(finish(crown,brick,()=>.7));
 return {geometry:merge(parts),material:'concrete',size:[rb*2,h,rb*2],radius:rb};
}
// Silo cluster: three or four steel silos, one collapsed and leaning.
export function siloCluster(seed){
 const r=randomSeed(seed),n=3+Math.floor(r()*2),parts=[],steel=color('#7a7268');
 for(let i=0;i<n;i++){const h=10+r()*7,rad=2.6+r()*1.2,x=i*(rad*2+.8)-n*rad,collapsed=i===n-1&&r()<.7;
  const body=new THREE.CylinderGeometry(rad,rad,h*(collapsed?.6:1),14);body.translate(0,h*(collapsed?.3:.5),0);
  const roof=new THREE.CylinderGeometry(.4,rad*1.02,2.2,14);roof.translate(0,h*(collapsed?.6:1)+1.1,0);
  for(const g of [body,roof]){place(g,{p:[x,0,0],r:[0,0,collapsed?.18:0]});parts.push(finish(g,steel,(px,py,pz)=>.68+.25*Math.min(1,py/h)-.12*Math.max(0,Math.sin(px*3+pz*2))));}}
 return {geometry:merge(parts),material:'metal',size:[n*7,20,6],radius:n*3.6};
}
// Hangar skeleton: arched ribs, some fallen, a few corrugated panels left.
export function hangarFrame(seed){
 const r=randomSeed(seed),R=9+r()*4,n=5+Math.floor(r()*3),gap=5,parts=[],steel=color('#5f5a52'),sheet=color('#7a7468');
 for(let i=0;i<n;i++){const fallen=r()<.25;const g=new THREE.TorusGeometry(R,.28,4,12,Math.PI);place(g,{p:[0,fallen?-R*.55:0,i*gap],r:[fallen?1.25:0,0,fallen?.2:0]});parts.push(finish(g,steel));
  if(!fallen&&i<n-1&&r()<.55){const a=.4+r()*1.6;parts.push(finish(place(new THREE.BoxGeometry(.08,4,gap),{p:[Math.cos(a)*R,Math.sin(a)*R,i*gap+gap/2],r:[0,0,a]}),sheet,(x,y)=>.75+.2*Math.sin(y*4)));}}
 return {geometry:merge(parts),material:'metal',size:[R*2,R,n*gap],radius:Math.max(R,n*gap/2)};
}

// Kit tables by biome: [builder, weight, near, far (m from the road axis), collider].
export const BIOME_KITS={
 // Ranges frame the road (art bible §3.5): landmarks start just outside the
 // ±8 m quiet corridor so they read from the cab, not only from the map.
 ashes:[[smokestack,2,60,260,'cylinder'],[siloCluster,2,45,220,'box'],[hangarFrame,2,40,200,'box'],[saltCrust,1,25,140,null]],
 cities:[[ruinTower,7,38,240,'box'],[viaductStub,1,40,180,'box'],[hangarFrame,1,45,200,'box']],
 salt:[[beachedHull,4,32,240,'box'],[pierPilings,3,25,160,null],[saltCrust,5,18,220,null]],
 glass:[[rockSpire,6,30,260,'cylinder'],[glassShards,4,20,160,null]],
 storm:[[stormPylon,3,35,260,'box'],[fulgurite,3,22,160,null],[plasmaScar,4,18,150,null],[ruinTower,2,60,260,'box']],
};
export const KIT_VARIANTS=4;

import * as THREE from 'three';

// Story 002: cenário próprio de 2027 para o prólogo — um trecho de rodovia ainda habitado
// (asfalto inteiro, faixas pintadas, guard-rail, postes com fios, árvores, posto aceso,
// carros andando, cidade e torre de rádio ao fundo, colina com túnel). É um "set" isolado
// no alto, dentro de uma cúpula de céu própria, montado só durante o prólogo e descartado
// ao fim: não toca terreno, física, colisores, saves nem o mundo de 2047.
// Materiais sem névoa (o ciclo de dia reescreve a névoa da cena a cada frame).
export const SET_ORIGIN=Object.freeze({x:0,y:1500,z:0});
const DOME=300;

function rng(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}

const SKY_VERT=`varying vec3 vDir;void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const SKY_FRAG=`uniform float odd,storm,flash,time;varying vec3 vDir;
float n(vec2 p){return sin(p.x)*sin(p.y);}
void main(){vec3 d=normalize(vDir);float h=d.y;
 vec3 clear=mix(vec3(.80,.86,.90),vec3(.30,.52,.82),smoothstep(-.02,.55,h));
 float cloud=smoothstep(.35,.9,n(d.xz*7.+vec2(time*.02,0.))*.5+n(d.xz*13.+1.3)*.5+.35)*smoothstep(.05,.3,h)*.55;
 clear=mix(clear,vec3(.97),cloud);
 vec3 sunDir=normalize(vec3(.45,.55,.7));clear+=vec3(1.,.93,.75)*pow(max(dot(d,sunDir),0.),600.)*3.+vec3(1.,.9,.7)*pow(max(dot(d,sunDir),0.),12.)*.18;
 vec3 oddDir=normalize(vec3(-.25,.42,-.87));float o=pow(max(dot(d,oddDir),0.),60.)*3.+pow(max(dot(d,oddDir),0.),6.)*.75;
 float band=exp(-pow((h-.32-.05*sin(d.x*7.+time*.4))*11.,2.));
 vec3 col=clear+odd*(vec3(.45,1.,.82)*o+vec3(.25,.85,.7)*band*.35);
 col=mix(col,col*vec3(.9,1.,.97),odd*.25);
 float roll=n(d.xz*5.+vec2(time*.15,time*.05))*.5+n(d.xz*11.-vec2(time*.22,0.))*.5;
 vec3 st=mix(vec3(.16,.08,.26),vec3(.48,.26,.70),smoothstep(-.05,.45,1.-h))+vec3(.55,.30,.85)*smoothstep(.2,.9,roll)*.35;
 st+=vec3(.75,.65,1.)*flash*smoothstep(.0,.6,roll+.4);
 col=mix(col,st,storm);
 gl_FragColor=vec4(col,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

/** Builds the 2027 set. Returns {group, update(t, {odd, storm}), dispose()}. Browser and Node safe. */
export function buildPrologueSet(){
 const group=new THREE.Group();group.name='prologue-2027-set';group.position.set(SET_ORIGIN.x,SET_ORIGIN.y,SET_ORIGIN.z);group.visible=false;
 const owned=[];const keep=o=>{owned.push(o);return o;};
 const lam=(color,extra={})=>keep(new THREE.MeshLambertMaterial({color,fog:false,...extra}));
 const glow=(color,i=1)=>keep(new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(i),fog:false,toneMapped:false}));
 const add=(geo,mat,pos,rot)=>{const m=new THREE.Mesh(keep(geo),mat);if(pos)m.position.set(...pos);if(rot)m.rotation.set(...rot);group.add(m);return m;};
 const inst=(geo,mat,list,colors)=>{const m=new THREE.InstancedMesh(keep(geo),mat,list.length),o=new THREE.Object3D();
  list.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.rotation.set(0,p[3]||0,0);o.scale.set(p[4]??1,p[5]??p[4]??1,p[6]??p[4]??1);o.updateMatrix();m.setMatrixAt(i,o.matrix);if(colors)m.setColorAt(i,colors[i]);});
  m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;group.add(m);return m;};
 const r=rng(2027);

 // Céu e luz próprios do set (somem com o grupo invisível).
 const skyMat=keep(new THREE.ShaderMaterial({vertexShader:SKY_VERT,fragmentShader:SKY_FRAG,side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{odd:{value:0},storm:{value:0},flash:{value:0},time:{value:0}}}));
 const sky=add(new THREE.SphereGeometry(DOME,32,16),skyMat);sky.renderOrder=-10;sky.frustumCulled=false;
 const sun=new THREE.DirectionalLight('#fff1d6',1.25);sun.position.set(120,160,190);group.add(sun,sun.target);
 const fill=new THREE.HemisphereLight('#bcd7ff','#58703c',.55);group.add(fill);

 // Chão: campo verde com variação e colinas no horizonte.
 const groundGeo=new THREE.CircleGeometry(DOME-2,64);groundGeo.rotateX(-Math.PI/2);
 {const c=[],p=groundGeo.attributes.position;for(let i=0;i<p.count;i++){const k=.8+r()*.25;c.push(.30*k,.42*k,.18*k);}groundGeo.setAttribute('color',new THREE.Float32BufferAttribute(c,3));}
 add(groundGeo,lam('#ffffff',{vertexColors:true}));
 const hillMat=lam('#5d7650');// anel de colinas dentro da cúpula
 inst(new THREE.SphereGeometry(1,20,10,0,Math.PI*2,0,Math.PI/2),hillMat,Array.from({length:14},(_,i)=>i/14*Math.PI*2+.2).filter(a=>Math.abs(Math.cos(a))>.4).map(a=>{const d=222+r()*20;return [Math.cos(a)*d,-2,Math.sin(a)*d,0,28+r()*17,14+r()*16,24+r()*14];}));// fora do eixo da estrada

 // Rodovia conservada: asfalto, acostamento, faixas.
 add(new THREE.PlaneGeometry(9,560),lam('#3a3c40'),[0,.04,30],[-Math.PI/2,0,0]);
 add(new THREE.PlaneGeometry(13,560),lam('#8a8576'),[0,.02,30],[-Math.PI/2,0,0]);
 const white=lam('#e9e8e0'),yellow=lam('#e2b334');
 for(const x of [-4.25,4.25])add(new THREE.PlaneGeometry(.16,560),white,[x,.06,30],[-Math.PI/2,0,0]);
 inst(new THREE.PlaneGeometry(.16,3.2).rotateX(-Math.PI/2),yellow,Array.from({length:62},(_,i)=>[0,.06,280-i*9]));

 // Guard-rail e postes com fios (até a boca do túnel).
 const rail=lam('#b6bdc2'),posts=[];for(let z=258;z>-118;z-=4)for(const x of [-6.6,6.6])posts.push([x,.45,z]);
 inst(new THREE.BoxGeometry(.12,.9,.12),rail,posts);
 for(const x of [-6.6,6.6])add(new THREE.BoxGeometry(.06,.32,376),rail,[x*1.01,.78,70]);
 const poleZ=[];for(let z=250;z>-110;z-=36)poleZ.push(z);
 const wood=lam('#5b4632');inst(new THREE.CylinderGeometry(.14,.18,10,8),wood,poleZ.map(z=>[-10,5,z]));
 inst(new THREE.BoxGeometry(2.4,.14,.14),wood,poleZ.map(z=>[-10,9.4,z]));
 {const pts=[];for(let i=0;i<poleZ.length-1;i++)for(const dx of [-1.05,0,1.05])pts.push(-10+dx,9.5,poleZ[i],-10+dx,9.1,(poleZ[i]+poleZ[i+1])/2,-10+dx,9.1,(poleZ[i]+poleZ[i+1])/2,-10+dx,9.5,poleZ[i+1]);
  const g=keep(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));group.add(new THREE.LineSegments(g,keep(new THREE.LineBasicMaterial({color:'#1d1d1d',fog:false}))));}

 // Árvores verdes (instanciadas), fora da pista e do posto.
 const trees=[];while(trees.length<110){const side=r()<.5?-1:1,x=side*(13+r()*120),z=-100+r()*370;if(x>12&&x<40&&z>30&&z<80)continue;if(x>-2&&x<34&&z>190)continue;trees.push([x,0,z,r()*6,.8+r()*.7]);}
 const leafColors=trees.map(()=>new THREE.Color().setHSL(.25+r()*.06,.42+r()*.15,.24+r()*.08));
 inst(new THREE.CylinderGeometry(.22,.3,3,6).translate(0,1.5,0),wood,trees);
 inst(new THREE.ConeGeometry(2.4,7,8).translate(0,6,0),lam('#ffffff'),trees,leafColors);

 // Posto com cobertura acesa, bombas e loja com vitrine.
 add(new THREE.BoxGeometry(26,.2,22),lam('#b9b4a8'),[25,.1,55]);
 const white2=lam('#f2f0ea'),red=lam('#b5262a');
 add(new THREE.BoxGeometry(16,.7,10),white2,[22,5.4,55]);add(new THREE.BoxGeometry(16.1,.28,10.1),red,[22,5.15,55]);
 add(new THREE.PlaneGeometry(15,9),glow('#fff4d6',1.25),[22,5.04,55],[Math.PI/2,0,0]);
 inst(new THREE.BoxGeometry(.4,5,.4),white2,[[15,2.5,51],[29,2.5,51],[15,2.5,59],[29,2.5,59]]);
 inst(new THREE.BoxGeometry(.9,1.6,.6),lam('#d9d4c8'),[[19,.8,55],[25,.8,55]]);
 inst(new THREE.PlaneGeometry(.5,.35),glow('#7fe0ff',1.1),[[19,1.25,54.69],[25,1.25,54.69]].map(p=>[...p,Math.PI]));
 add(new THREE.BoxGeometry(12,4.2,7),lam('#e8dfcc'),[31,2.1,64]);
 add(new THREE.PlaneGeometry(9,2.2),glow('#ffe2a8',1.15),[31,1.7,60.48],[0,Math.PI,0]);
 add(new THREE.BoxGeometry(.35,11,.35),lam('#7d7f82'),[12,5.5,40]);
 add(new THREE.BoxGeometry(3.2,2.4,.35),red,[12,10.5,40]);add(new THREE.PlaneGeometry(2.6,.5),glow('#ffffff',1.2),[12,10.2,39.8],[0,Math.PI,0]);

 // Placa verde de rodovia (sem marca), outdoor e cidade/torre ao fundo.
 add(new THREE.BoxGeometry(.2,6,.2),lam('#8d9296'),[-8.2,3,150]);add(new THREE.BoxGeometry(.2,6,.2),lam('#8d9296'),[-3.8,3,150]);
 add(new THREE.BoxGeometry(5.4,2.2,.15),lam('#1f6b3d'),[-6,5.6,150]);
 inst(new THREE.PlaneGeometry(3.8,.18),white,[[-6,6.1,150.09,Math.PI],[-6,5.5,150.09,Math.PI],[-6,4.9,150.09,Math.PI]].map(p=>[...p,1,1,1]));
 add(new THREE.BoxGeometry(10,4.5,.3),lam('#f0c45a'),[-24,7.5,95],[0,.35,0]);
 const city=[];for(let i=0;i<34;i++){const x=-150+i*9+r()*4,h=10+r()*38;city.push([x,h/2,-262+r()*14,0,5+r()*5,h,5+r()*5]);}
 inst(new THREE.BoxGeometry(1,1,1),lam('#8e9fb0'),city);
 inst(new THREE.PlaneGeometry(1.2,.8),glow('#ffe6b0',.9),Array.from({length:90},()=>{const b=city[Math.floor(r()*city.length)];return [b[0]+(r()-.5)*b[4]*.8,2+r()*(b[5]-3),b[2]+b[6]/2+.05];}));
 add(new THREE.CylinderGeometry(.35,1.4,48,6),lam('#9a9ea3'),[62,24,-175]);
 const beacon=add(new THREE.SphereGeometry(.9,10,8),glow('#ff3a2a',1.6),[62,48.6,-175]);

 // Colina com túnel: perfil extrudado com o arco furado; portal de concreto e luzes internas.
 const hill=new THREE.Shape();hill.moveTo(-90,0);hill.quadraticCurveTo(-60,30,0,32);hill.quadraticCurveTo(60,30,90,0);hill.lineTo(-90,0);
 const arch=new THREE.Path();arch.moveTo(-6,0);arch.lineTo(-6,5);arch.absarc(0,5,6,Math.PI,0,true);arch.lineTo(6,0);arch.lineTo(-6,0);hill.holes.push(arch);
 const hillGeo=new THREE.ExtrudeGeometry(hill,{depth:60,bevelEnabled:false,curveSegments:20});hillGeo.translate(0,0,-185);
 add(hillGeo,[lam('#61794f'),lam('#6d6a64',{side:THREE.DoubleSide})]);
 const ring=new THREE.Shape();ring.moveTo(-8.5,0);ring.lineTo(-8.5,5);ring.absarc(0,5,8.5,Math.PI,0,true);ring.lineTo(8.5,0);ring.lineTo(-8.5,0);ring.holes.push(arch);
 add(new THREE.ExtrudeGeometry(ring,{depth:1.2,bevelEnabled:false,curveSegments:20}),lam('#a7a49c'),[0,0,-125.6]);
 add(new THREE.PlaneGeometry(9,60),lam('#2c2d30'),[0,.05,-155],[-Math.PI/2,0,0]);
 inst(new THREE.BoxGeometry(.5,.18,1.4),glow('#ffb35a',1.4),Array.from({length:10},(_,i)=>[0,10.75,-129-i*5.5]));
 const lampLight=new THREE.PointLight('#ffb35a',30,40,1.6);lampLight.position.set(0,8,-150);group.add(lampLight);

 // Carros: duas faixas, mão dupla; param quando a tempestade chega.
 const cars=[];const carColors=['#b42a2a','#e8e6df','#2c5aa0','#a7acb2','#d9a52b','#2f6b4f'];
 const glass=lam('#20262c'),tire=lam('#141414'),head=glow('#fff3d0',1.6),tail=glow('#ff2d2d',1.4);
 const wheelGeo=keep(new THREE.CylinderGeometry(.36,.36,.25,10).rotateZ(Math.PI/2));
 carColors.forEach((c,i)=>{const car=new THREE.Group(),dir=i%2?1:-1;
  const b=new THREE.Mesh(keep(new THREE.BoxGeometry(1.8,.75,4.3)),lam(c));b.position.y=.75;car.add(b);
  const cab=new THREE.Mesh(keep(new THREE.BoxGeometry(1.55,.6,2.1)),glass);cab.position.set(0,1.42,-.2);car.add(cab);
  for(const [x,z] of [[-.85,1.35],[.85,1.35],[-.85,-1.35],[.85,-1.35]]){const w=new THREE.Mesh(wheelGeo,tire);w.position.set(x,.36,z);car.add(w);}
  for(const x of [-.6,.6]){const h=new THREE.Mesh(keep(new THREE.BoxGeometry(.32,.14,.05)),head);h.position.set(x,.85,-2.16);car.add(h);const t=new THREE.Mesh(keep(new THREE.BoxGeometry(.32,.14,.05)),tail);t.position.set(x,.85,2.16);car.add(t);}
  // dir -1: afasta-se da câmera (−z) pela faixa direita; dir +1: vem na contramão pela esquerda.
  car.rotation.y=dir>0?Math.PI:0;car.position.x=dir>0?-2.1:2.1;
  group.add(car);cars.push({car,dir,z:220-i*55,speed:16+r()*6});});

 let last=0;
 return {group,
  /** t: segundos do prólogo; odd/storm 0..1 conforme o plano. */
  update(t,{odd=0,storm=0,reduced=false}={}){
   const dt=Math.max(0,Math.min(.25,t-last));last=t;const u=skyMat.uniforms;u.time.value=t;u.odd.value=odd;u.storm.value=storm;
   u.flash.value=reduced?0:storm*Math.pow(Math.max(0,Math.sin(t*2.1)*Math.sin(t*3.3)),6)*.6;
   sun.intensity=1.25*(1-.75*storm);fill.intensity=.55*(1-.5*storm);fill.color.set(storm>.5?'#8a7ab8':'#bcd7ff');
   beacon.visible=storm<.35&&Math.sin(t*4)>-.2;
   for(const c of cars){c.speed*=storm>.4?Math.pow(.35,dt):1;c.z+=c.dir*c.speed*dt;if(c.z<-115)c.z=255;if(c.z>255)c.z=-115;c.car.position.z=c.z;}
  },
  dispose(){group.removeFromParent();for(const o of owned)o.dispose?.();owned.length=0;}
 };
}

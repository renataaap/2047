import * as THREE from 'three';
import {mergeGeometries,mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';

// Story 002: cenário próprio de 2027 para o prólogo — um trecho de rodovia ainda habitado
// (asfalto inteiro, faixas pintadas, guard-rail, postes com fios, árvores, posto aceso,
// carros andando, cidade e torre de rádio ao fundo, colina com túnel). É um "set" isolado
// no alto, dentro de uma cúpula de céu própria, montado só durante o prólogo e descartado
// ao fim: não toca terreno, física, colisores, saves nem o mundo de 2047.
// Perspectiva aérea: a névoa da cena pertence ao mundo e o ciclo de dia a reescreve a cada
// frame; por isso o set aplica a SUA cor/densidade só durante o render (attach) e devolve os
// valores do mundo logo depois. Mesmo tipo de névoa (FogExp2): nenhum shader recompila.
// Polimento (11/11): relevo com ruído no chão e na colina, árvores folhosas e coníferas com
// copa irregular, carros com perfil, prédios com recuos, nuvens fbm e sombras de contato.
// Tudo procedural: nenhuma textura externa, nenhum pacote novo.
export const SET_ORIGIN=Object.freeze({x:0,y:1500,z:0});
const DOME=300;
// Névoa do set: casa com o horizonte do céu limpo e com o da tempestade.
export const SET_HAZE=Object.freeze({clear:new THREE.Color(.80,.86,.90),storm:new THREE.Color(.40,.24,.58),clearDensity:.0024,stormDensity:.0062});

function rng(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
const fract=x=>x-Math.floor(x);
const hash=(i,j)=>fract(Math.sin(i*127.1+j*311.7)*43758.5453);
const ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
function vnoise(x,z){const i=Math.floor(x),j=Math.floor(z),fx=x-i,fz=z-j,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);
 const a=hash(i,j),b=hash(i+1,j),c=hash(i,j+1),d=hash(i+1,j+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
/** fbm de 4 oitavas em [0,1]. Determinístico (sem Math.random). */
export function fbm(x,z){let s=0,a=.5,n=0;for(let k=0;k<4;k++){s+=a*vnoise(x,z);n+=a;x=x*2.03+17.1;z=z*2.03+5.3;a*=.5;}return s/n;}

/** Altura do chão do set (coordenadas locais): plano junto à pista, ao posto e ao túnel; colinas no anel lateral, sem tocar a cúpula. */
export function groundHeight(x,z){
 const r=Math.hypot(x,z),ax=Math.abs(x);
 const road=ss(14,34,ax);
 const station=1-ss(0,10,Math.max(9-x,x-44,30-z,z-80,0));
 const tunnel=1-ss(0,18,Math.max(-200-z,z+118,ax-96,0));
 let h=road*(1-station)*(fbm(x*.011,z*.011)*5-1.6);
 const side=ss(.28,.62,ax/Math.max(r,1));
 h+=side*ss(165,235,r)*(1-ss(268,296,r))*(10+fbm(x*.006+3,z*.006)*30);
 return h*(1-tunnel*.85);
}

// Céu: gradiente, nuvens fbm projetadas num teto, sol, luz anômala (odd) e tempestade de plasma.
const SKY_VERT=`varying vec3 vDir;void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const SKY_FRAG=`uniform float odd,storm,flash,time;uniform vec3 hazeClear,hazeStorm;varying vec3 vDir;
float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int k=0;k<5;k++){s+=a*vn(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
void main(){vec3 d=normalize(vDir);float h=d.y;
 vec2 uv=d.xz/max(h,.06)*.55;
 vec3 clear=mix(hazeClear,vec3(.28,.50,.80),smoothstep(-.02,.5,h));
 float c=fbm(uv+vec2(time*.012,time*.004));
 float cloud=smoothstep(.52,.78,c)*smoothstep(.03,.22,h);
 vec3 cloudCol=mix(vec3(.72,.75,.80),vec3(.98,.98,.97),smoothstep(.55,.85,fbm(uv*1.7+3.1)));
 clear=mix(clear,cloudCol,cloud*.85);
 vec3 sunDir=normalize(vec3(.47,.62,.74));float sd=max(dot(d,sunDir),0.);
 clear+=vec3(1.,.93,.75)*(pow(sd,900.)*4.+pow(sd,10.)*.16)*(1.-cloud*.7);
 vec3 oddDir=normalize(vec3(-.25,.42,-.87));float o=pow(max(dot(d,oddDir),0.),60.)*3.+pow(max(dot(d,oddDir),0.),6.)*.75;
 float band=exp(-pow((h-.32-.05*sin(d.x*7.+time*.4))*11.,2.))*(.6+.4*fbm(d.xz*9.+time*.3));
 vec3 col=clear+odd*(vec3(.45,1.,.82)*o+vec3(.25,.85,.7)*band*.35);
 col=mix(col,col*vec3(.9,1.,.97),odd*.25);
 float roll=fbm(uv*.7+vec2(time*.09,time*.03));
 vec3 st=mix(vec3(.13,.07,.22),hazeStorm,smoothstep(.55,-.05,h))+vec3(.55,.30,.85)*smoothstep(.45,.8,roll)*.35;
 st+=vec3(.75,.65,1.)*flash*smoothstep(.35,.75,roll);
 col=mix(col,st,storm);
 gl_FragColor=vec4(col,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

// Sombra de contato (mancha radial suave), instanciável; recebe a névoa do set.
const BLOB_VERT=`varying vec2 vUv;
#include <fog_pars_vertex>
void main(){vUv=uv;vec4 p=vec4(position,1.);
#ifdef USE_INSTANCING
p=instanceMatrix*p;
#endif
vec4 mvPosition=modelViewMatrix*p;gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`;
const BLOB_FRAG=`uniform float strength;varying vec2 vUv;
#include <fog_pars_fragment>
void main(){float a=strength*(1.-smoothstep(.15,1.,length(vUv*2.-1.)));gl_FragColor=vec4(0.,0.,0.,a);
#include <fog_fragment>
}`;

/** Cor por vértice com ruído (macrovariação sem textura). */
function tint(geo,base,amp,scale,extra){
 const p=geo.attributes.position,c=new Float32Array(p.count*3),col=new THREE.Color(base),t=new THREE.Color();
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+(fbm(x*scale+11,z*scale-7)-.5)*2*amp;
  t.copy(col).multiplyScalar(k);extra?.(t,x,y,z);c[i*3]=t.r;c[i*3+1]=t.g;c[i*3+2]=t.b;}
 geo.setAttribute('color',new THREE.BufferAttribute(c,3));return geo;
}
/** Desloca vértices radialmente com ruído; mesma posição ⇒ mesmo deslocamento (sem rachar). */
function lumpy(geo,amp,scale){
 const p=geo.attributes.position,v=new THREE.Vector3();
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const n=fbm(v.x*scale+v.y*.7+2,v.z*scale-v.y*.4)-.5;v.multiplyScalar(1+n*amp);p.setXYZ(i,v.x,v.y,v.z);}
 return geo;
}
function smoothNormals(geo){geo.deleteAttribute('normal');geo.deleteAttribute('uv');const m=mergeVertices(geo,1e-3);m.computeVertexNormals();geo.dispose();return m;}
/** Material de placa desenhado em canvas (navegador). No Node devolve null e o chamador usa o substituto. */
function signMaterial(w,h,draw,owned){
 if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;owned.push(t);const m=new THREE.MeshLambertMaterial({map:t});owned.push(m);return m;
}
function merged(parts){const g=mergeGeometries(parts.map(p=>{p.deleteAttribute('uv');return p;}));parts.forEach(p=>p.dispose());return g;}

function broadleafCrown(){
 return smoothNormals(lumpy(merged([[0,6.2,0,2.6],[1.3,5.3,.5,1.9],[-1.2,5.5,-.6,2.0],[.3,7.4,-.4,1.7]].map(([x,y,z,s])=>new THREE.IcosahedronGeometry(1,2).scale(s,s*.82,s).translate(x,y,z))),.22,.9));
}
function conifer(){
 return smoothNormals(lumpy(merged([[3.4,2.5,3.6],[5.6,1.9,3.0],[7.5,1.25,2.6]].map(([y,r,h])=>new THREE.ConeGeometry(r,h,10,2).translate(0,y,0))),.12,1.6));
}
/** Carroceria, área envidraçada e rodas por perfil lateral extrudado (frente em −z). */
function carGeometries(){
 const body=new THREE.Shape();body.moveTo(-2.15,.32);body.lineTo(2.15,.32);body.lineTo(2.18,.86);body.lineTo(1.5,.98);body.lineTo(-1.25,.99);body.lineTo(-2.12,.84);body.lineTo(-2.15,.32);
 const cab=new THREE.Shape();cab.moveTo(-.95,.96);cab.lineTo(1.2,.96);cab.lineTo(.92,1.46);cab.lineTo(-.22,1.48);cab.lineTo(-.95,.96);
 const make=(s,w,b)=>{const g=new THREE.ExtrudeGeometry(s,{depth:w,bevelEnabled:true,bevelSize:b,bevelThickness:b,bevelSegments:2,curveSegments:2});g.translate(0,0,-w/2);g.rotateY(-Math.PI/2);g.computeVertexNormals();return g;};
 const wheels=merged([[-.84,1.35],[.84,1.35],[-.84,-1.38],[.84,-1.38]].map(([x,z])=>new THREE.CylinderGeometry(.34,.34,.24,14).rotateZ(Math.PI/2).translate(x,.34,z)));
 const lamps=z=>merged([-.6,.6].map(x=>new THREE.BoxGeometry(.34,.12,.05).translate(x,.81,z)));
 return {body:make(body,1.66,.07),cab:make(cab,1.46,.05),wheels,heads:lamps(-2.2),tails:lamps(2.2)};
}

/** Builds the 2027 set. Returns {group, fog, update(t, {odd, storm}), attach(scene), dispose()}. Browser and Node safe. */
export function buildPrologueSet(){
 const group=new THREE.Group();group.name='prologue-2027-set';group.position.set(SET_ORIGIN.x,SET_ORIGIN.y,SET_ORIGIN.z);group.visible=false;
 const owned=[];const keep=o=>{owned.push(o);return o;};
 const lam=(color,extra={})=>keep(new THREE.MeshLambertMaterial({color,...extra}));
 const glow=(color,i=1)=>keep(new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(i),toneMapped:false}));
 const add=(geo,mat,pos,rot)=>{const m=new THREE.Mesh(keep(geo),mat);if(pos)m.position.set(...pos);if(rot)m.rotation.set(...rot);group.add(m);return m;};
 const inst=(geo,mat,list,colors)=>{const m=new THREE.InstancedMesh(keep(geo),mat,list.length),o=new THREE.Object3D();
  list.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.rotation.set(0,p[3]||0,0);o.scale.set(p[4]??1,p[5]??p[4]??1,p[6]??p[4]??1);o.updateMatrix();m.setMatrixAt(i,o.matrix);if(colors)m.setColorAt(i,colors[i]);});
  m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.computeBoundingSphere();group.add(m);return m;};
 const r=rng(2027);
 const fog={color:SET_HAZE.clear.clone(),density:SET_HAZE.clearDensity};

 // Céu e luz próprios do set (somem com o grupo invisível).
 const skyMat=keep(new THREE.ShaderMaterial({vertexShader:SKY_VERT,fragmentShader:SKY_FRAG,side:THREE.BackSide,depthWrite:false,fog:false,
  uniforms:{odd:{value:0},storm:{value:0},flash:{value:0},time:{value:0},hazeClear:{value:SET_HAZE.clear},hazeStorm:{value:SET_HAZE.storm}}}));
 const sky=add(new THREE.SphereGeometry(DOME,40,20),skyMat);sky.renderOrder=-10;sky.frustumCulled=false;
 const sun=new THREE.DirectionalLight('#fff1d6',1.35);sun.position.set(120,160,190);group.add(sun,sun.target);
 const fill=new THREE.HemisphereLight('#bcd7ff','#58703c',.6);group.add(fill);
 const blobMat=keep(new THREE.ShaderMaterial({vertexShader:BLOB_VERT,fragmentShader:BLOB_FRAG,transparent:true,depthWrite:false,fog:true,
  uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{strength:{value:.42}}])}));
 const blobGeo=keep(new THREE.PlaneGeometry(2,2).rotateX(-Math.PI/2));

 // Chão: anel subdividido com relevo (colinas no anel lateral) e cor de vértice (capim; terra seca na borda da pista).
 const groundGeo=new THREE.RingGeometry(.5,DOME-2,128,40);groundGeo.rotateX(-Math.PI/2);
 {const p=groundGeo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,groundHeight(p.getX(i),p.getZ(i)));groundGeo.computeVertexNormals();}
 const dryCol=new THREE.Color('#8a8159'),paleCol=new THREE.Color('#7f8a52');
 tint(groundGeo,'#5f7a3d',.22,.03,(c,x,y,z)=>{c.lerp(dryCol,(1-ss(9,20,Math.abs(x)))*.75);c.lerp(paleCol,ss(.55,.8,fbm(x*.02,z*.02))*.35);});
 add(groundGeo,lam('#ffffff',{vertexColors:true}));

 // Rodovia conservada: asfalto com desgaste nas trilhas de roda, acostamento, faixas.
 const asphalt=tint(new THREE.PlaneGeometry(9,560,8,280),'#3c3e42',.12,.08,(c,x)=>c.multiplyScalar(1-.12*Math.exp(-Math.pow((Math.abs(x)-2.2)/.5,2))));
 add(asphalt,lam('#ffffff',{vertexColors:true}),[0,.04,30],[-Math.PI/2,0,0]);
 add(tint(new THREE.PlaneGeometry(13,560,4,140),'#8a8576',.15,.1),lam('#ffffff',{vertexColors:true}),[0,.02,30],[-Math.PI/2,0,0]);
 const white=lam('#e9e8e0'),yellow=lam('#e2b334');
 for(const x of [-4.25,4.25])add(new THREE.PlaneGeometry(.16,560),white,[x,.06,30],[-Math.PI/2,0,0]);
 inst(new THREE.PlaneGeometry(.16,3.2).rotateX(-Math.PI/2),yellow,Array.from({length:62},(_,i)=>[0,.06,280-i*9]));

 // Guard-rail (duas lâminas) e postes com fios em catenária (até a boca do túnel).
 const rail=lam('#b6bdc2'),posts=[];for(let z=258;z>-118;z-=4)for(const x of [-6.6,6.6])posts.push([x,.45,z]);
 inst(new THREE.BoxGeometry(.12,.9,.12),lam('#8f969b'),posts);
 for(const x of [-6.6,6.6])for(const y of [.84,.66])add(new THREE.BoxGeometry(.06,.14,376),rail,[x*1.01,y,70]);
 const poleZ=[];for(let z=250;z>-110;z-=36)poleZ.push(z);
 const wood=lam('#5b4632');inst(new THREE.CylinderGeometry(.14,.19,10,8),wood,poleZ.map(z=>[-10,5,z]));
 inst(new THREE.BoxGeometry(2.4,.14,.14),wood,poleZ.map(z=>[-10,9.4,z]));
 {const pts=[],y=t=>9.5-1.6*t*(1-t);for(let i=0;i<poleZ.length-1;i++)for(const dx of [-1.05,0,1.05]){const a=poleZ[i],b=poleZ[i+1];for(let k=0;k<6;k++){const t0=k/6,t1=(k+1)/6;pts.push(-10+dx,y(t0),a+(b-a)*t0,-10+dx,y(t1),a+(b-a)*t1);}}
  const g=keep(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));group.add(new THREE.LineSegments(g,keep(new THREE.LineBasicMaterial({color:'#1d1d1d'}))));}

 // Árvores: folhosas e coníferas, copa irregular, apoiadas no relevo, com sombra de contato.
 const leaf=[],pine=[];
 while(leaf.length+pine.length<130){const side=r()<.5?-1:1,x=side*(13+r()*125),z=-100+r()*370;
  if(x>8&&x<46&&z>28&&z<82)continue;if(x>-2&&x<34&&z>190)continue;if(Math.hypot(x,z)>DOME-25)continue;
  const s=.75+r()*.65,t=[x,groundHeight(x,z)-.15,z,r()*6.3,s,s*(.9+r()*.25),s];(r()<.62?leaf:pine).push(t);}
 const all=[...leaf,...pine];
 inst(new THREE.CylinderGeometry(.2,.32,4.6,7).translate(0,2.3,0),lam('#4e3d2c'),all.map(t=>[t[0],t[1],t[2],t[3],t[4]*.9,t[5],t[4]*.9]));
 inst(broadleafCrown(),lam('#ffffff'),leaf,leaf.map(()=>new THREE.Color().setHSL(.22+r()*.07,.42+r()*.15,.21+r()*.07)));
 inst(conifer(),lam('#ffffff'),pine,pine.map(()=>new THREE.Color().setHSL(.30+r()*.05,.32+r()*.12,.18+r()*.06)));
 inst(blobGeo,blobMat,all.map(t=>[t[0],t[1]+.2,t[2],0,2.6*t[4]]));

 // Posto com cobertura acesa, bombas e loja com vitrine. Faces luminosas voltadas a +z: todas as câmeras olham de +z para −z.
 add(tint(new THREE.BoxGeometry(26,.2,22,8,1,8),'#b9b4a8',.08,.15),lam('#ffffff',{vertexColors:true}),[25,.1,55]);
 const white2=lam('#f2f0ea'),red=lam('#b5262a');
 add(new THREE.BoxGeometry(16,.7,10),white2,[22,5.4,55]);add(new THREE.BoxGeometry(16.1,.28,10.1),red,[22,5.15,55]);
 add(new THREE.PlaneGeometry(15,9),glow('#fff4d6',1.25),[22,5.04,55],[Math.PI/2,0,0]);
 inst(new THREE.BoxGeometry(.4,5,.4),white2,[[15,2.5,51],[29,2.5,51],[15,2.5,59],[29,2.5,59]]);
 inst(new THREE.BoxGeometry(.9,1.6,.6),lam('#d9d4c8'),[[19,.8,55],[25,.8,55]]);
 inst(new THREE.PlaneGeometry(.5,.35),glow('#7fe0ff',1.1),[[19,1.25,55.31],[25,1.25,55.31]]);
 add(new THREE.BoxGeometry(12,4.2,7),lam('#e8dfcc'),[31,2.1,64]);add(new THREE.BoxGeometry(12.6,.4,7.6),lam('#8c3a2c'),[31,4.4,64]);
 add(new THREE.PlaneGeometry(9,2.2),glow('#ffe2a8',1.15),[31,1.7,67.52]);
 add(new THREE.BoxGeometry(.35,11,.35),lam('#7d7f82'),[12,5.5,40]);
 add(new THREE.BoxGeometry(3.2,2.4,.35),red,[12,10.5,40]);add(new THREE.PlaneGeometry(2.6,.5),glow('#ffffff',1.2),[12,10.2,40.2]);

 // Placa verde de rodovia (sem marca), outdoor sobre pernas e cidade/torre ao fundo.
 add(new THREE.BoxGeometry(.2,6,.2),lam('#8d9296'),[-8.2,3,149.8]);add(new THREE.BoxGeometry(.2,6,.2),lam('#8d9296'),[-3.8,3,149.8]);
 add(new THREE.BoxGeometry(5.4,2.2,.15),lam('#1f6b3d'),[-6,5.6,150]);
 const green=signMaterial(512,208,(x,w,h)=>{x.fillStyle='#1f6b3d';x.fillRect(0,0,w,h);x.strokeStyle='#e9ecef';x.lineWidth=7;x.strokeRect(10,10,w-20,h-20);
  x.fillStyle='#f2f4f5';x.font='bold 54px Arial, sans-serif';x.textBaseline='middle';x.fillText('CENTRO',36,72);x.fillText('TÚNEL',36,146);x.textAlign='right';x.fillText('24 km',w-36,72);x.fillText('1 km',w-36,146);},owned);
 if(green)add(new THREE.PlaneGeometry(5.2,2.05),green,[-6,5.6,150.09]);
 else inst(new THREE.PlaneGeometry(3.8,.18),white,[[-6,6.1,150.09],[-6,5.5,150.09],[-6,4.9,150.09]]);
 // Limite de velocidade (círculo branco com aro vermelho), no acostamento direito.
 const limit=signMaterial(256,256,(x,w)=>{x.clearRect(0,0,w,w);x.fillStyle='#c62828';x.beginPath();x.arc(128,128,124,0,7);x.fill();x.fillStyle='#fafafa';x.beginPath();x.arc(128,128,96,0,7);x.fill();
  x.fillStyle='#111';x.font='bold 104px Arial, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('80',128,136);},owned);
 add(new THREE.CylinderGeometry(.05,.05,2.6,6),lam('#8d9296'),[8.2,1.3,182]);
 if(limit){limit.transparent=true;limit.alphaTest=.5;add(new THREE.CircleGeometry(.45,24),limit,[8.2,2.55,182.06]);}
 {const gy=groundHeight(-24,95);add(new THREE.BoxGeometry(10,4.5,.3),lam('#d8d4ca'),[-24,gy+7.5,95],[0,.35,0]);
  const ad=signMaterial(512,230,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#2f7fc1');g.addColorStop(1,'#9fd3f0');x.fillStyle=g;x.fillRect(0,0,w,h);
   x.fillStyle='#f6c945';x.beginPath();x.arc(w-90,70,42,0,7);x.fill();x.fillStyle='#2d6a3a';x.beginPath();x.moveTo(0,h);x.quadraticCurveTo(w*.35,h*.55,w*.7,h*.8);x.quadraticCurveTo(w*.85,h*.7,w,h*.75);x.lineTo(w,h);x.fill();
   x.fillStyle='#ffffff';x.font='bold 46px Arial, sans-serif';x.fillText('FÉRIAS NO LITORAL',28,72);x.font='28px Arial, sans-serif';x.fillText('Saída 14 · próximo verão',30,116);},owned);
  if(ad){const m=add(new THREE.PlaneGeometry(9.6,4.2),ad,[-24,gy+7.5,95],[0,.35,0]);m.translateZ(.16);}
  inst(new THREE.BoxGeometry(.3,6,.3),lam('#6d6f72'),[[-27.4,gy+2.6,96.2,.35],[-20.6,gy+2.6,93.8,.35]]);}
 // Cidade: torres com recuo/coroamento e faixas de janela; cores variadas de concreto e vidro.
 const palette=['#7f8a94','#9c958a','#66798c','#8a7a6c','#a7a39b','#717d88'].map(c=>new THREE.Color(c));
 const base=[],top=[],bands=[],baseCol=[],topCol=[];
 for(let i=0;i<30;i++){const x=-118+i*8+r()*3,h=12+r()*42,w=5+r()*4,d=5+r()*4,z=-250+r()*10,c=palette[Math.floor(r()*palette.length)];
  base.push([x,h/2,z,0,w,h,d]);baseCol.push(c);
  if(r()<.55){const th=4+r()*10;top.push([x+(r()-.5)*1.5,h+th/2,z,0,w*(.55+r()*.2),th,d*(.6+r()*.2)]);topCol.push(c.clone().multiplyScalar(.92));}
  for(let y=3;y<h-1.5;y+=3.2)bands.push([x,y,z+d/2+.04,0,w*.86,.9,1]);}
 inst(new THREE.BoxGeometry(1,1,1),lam('#ffffff'),base,baseCol);
 if(top.length)inst(new THREE.BoxGeometry(1,1,1),lam('#ffffff'),top,topCol);
 inst(new THREE.PlaneGeometry(1,1),lam('#3b4754'),bands);
 const cityLights=inst(new THREE.PlaneGeometry(1.2,.8),glow('#ffe6b0',.9),Array.from({length:70},()=>{const b=bands[Math.floor(r()*bands.length)];return [b[0]+(r()-.5)*b[4]*.8,b[1],b[2]+.03];}));
 add(new THREE.CylinderGeometry(.35,1.4,48,6),lam('#9a9ea3'),[62,24,-175]);
 inst(new THREE.BoxGeometry(2.6,.12,.12),lam('#9a9ea3'),[[62,32,-175],[62,40,-175,Math.PI/2]]);
 const beacon=add(new THREE.SphereGeometry(.9,10,8),glow('#ff3a2a',1.6),[62,48.6,-175]);

 // Colina com túnel: perfil extrudado com o arco furado; relevo com ruído longe do portal.
 const hill=new THREE.Shape();hill.moveTo(-96,0);hill.quadraticCurveTo(-62,30,0,33);hill.quadraticCurveTo(62,30,96,0);hill.lineTo(-96,0);
 const arch=new THREE.Path();arch.moveTo(-6,0);arch.lineTo(-6,5);arch.absarc(0,5,6,Math.PI,0,true);arch.lineTo(6,0);arch.lineTo(-6,0);hill.holes.push(arch);
 const hillGeo=new THREE.ExtrudeGeometry(hill,{depth:60,steps:12,bevelEnabled:false,curveSegments:28});hillGeo.translate(0,0,-185);
 {const p=hillGeo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
  const amt=ss(9,16,Math.hypot(x,Math.max(0,y-5)))*ss(.5,6,y),n=fbm(x*.045+1,z*.045+y*.03)-.5;
  p.setXYZ(i,x+n*4*amt,y+(n*6+(fbm(x*.02,z*.02)-.5)*5*ss(4,20,y))*amt,z+(fbm(z*.05,y*.05)-.5)*5*amt*ss(-127,-131,z));}
  hillGeo.computeVertexNormals();}
 const ridgeCol=new THREE.Color('#7b7a5c');
 tint(hillGeo,'#617a4c',.25,.04,(c,x,y)=>c.lerp(ridgeCol,ss(22,34,y)*.3));
 add(hillGeo,[lam('#ffffff',{vertexColors:true}),lam('#6d6a64',{side:THREE.DoubleSide})]);
 const ring=new THREE.Shape();ring.moveTo(-8.5,0);ring.lineTo(-8.5,5);ring.absarc(0,5,8.5,Math.PI,0,true);ring.lineTo(8.5,0);ring.lineTo(-8.5,0);ring.holes.push(arch);
 add(new THREE.ExtrudeGeometry(ring,{depth:1.2,bevelEnabled:true,bevelSize:.08,bevelThickness:.08,bevelSegments:1,curveSegments:20}),lam('#a7a49c'),[0,0,-125.6]);
 add(new THREE.BoxGeometry(22,2.2,1.4),lam('#9d9a92'),[0,13.6,-125.2]);
 add(new THREE.PlaneGeometry(9,60),lam('#2c2d30'),[0,.05,-155],[-Math.PI/2,0,0]);
 // Interior: calçadas de serviço e barra de azulejo claro nas paredes (refletem as luzes âmbar).
 for(const x of [-5.3,5.3]){add(new THREE.BoxGeometry(1.3,.32,60),lam('#8a877f'),[x,.16,-155]);add(new THREE.BoxGeometry(.08,2.2,60),lam('#c9c4b4'),[x>0?5.92:-5.92,1.42,-155]);}
 inst(new THREE.BoxGeometry(.5,.18,1.4),glow('#ffb35a',1.4),Array.from({length:10},(_,i)=>[0,10.75,-129-i*5.5]));
 const lampLight=new THREE.PointLight('#ffb35a',30,40,1.6);lampLight.position.set(0,8,-150);group.add(lampLight);

 // Carros: perfil com capô/porta-malas e vidros inclinados; duas faixas, mão dupla; param na tempestade.
 const cars=[];const carColors=['#b42a2a','#e8e6df','#2c5aa0','#a7acb2','#d9a52b','#2f6b4f'];
 const cg=carGeometries();Object.values(cg).forEach(keep);
 const glass=lam('#1c2228'),tire=lam('#141414'),head=glow('#fff3d0',1.6),tail=glow('#ff2d2d',1.4);
 carColors.forEach((c,i)=>{const car=new THREE.Group(),dir=i%2?1:-1;
  car.add(new THREE.Mesh(cg.body,lam(c)),new THREE.Mesh(cg.cab,glass),new THREE.Mesh(cg.wheels,tire),new THREE.Mesh(cg.heads,head),new THREE.Mesh(cg.tails,tail));
  const shadow=new THREE.Mesh(blobGeo,blobMat);shadow.position.y=.03;shadow.scale.set(1.25,1,2.5);car.add(shadow);
  // dir -1: afasta-se da câmera (−z) pela faixa direita; dir +1: vem na contramão pela esquerda.
  car.rotation.y=dir>0?Math.PI:0;car.position.x=dir>0?-2.1:2.1;
  group.add(car);cars.push({car,dir,z:220-i*55,speed:16+r()*6});});

 let last=0,detach=null;
 return {group,fog,
  /** t: segundos do prólogo; odd/storm 0..1 conforme o plano. */
  update(t,{odd=0,storm=0,reduced=false}={}){
   const dt=Math.max(0,Math.min(.25,t-last));last=t;const u=skyMat.uniforms;u.time.value=t;u.odd.value=odd;u.storm.value=storm;
   u.flash.value=reduced?0:storm*Math.pow(Math.max(0,Math.sin(t*2.1)*Math.sin(t*3.3)),6)*.6;
   sun.intensity=1.35*(1-.75*storm);fill.intensity=.6*(1-.5*storm);fill.color.set(storm>.5?'#8a7ab8':'#bcd7ff');
   fog.color.copy(SET_HAZE.clear).lerp(SET_HAZE.storm,storm);fog.density=SET_HAZE.clearDensity+(SET_HAZE.stormDensity-SET_HAZE.clearDensity)*storm;
   beacon.visible=storm<.35&&Math.sin(t*4)>-.2;cityLights.visible=storm<.5;
   for(const c of cars){c.speed*=storm>.4?Math.pow(.35,dt):1;c.z+=c.dir*c.speed*dt;if(c.z<-115)c.z=255;if(c.z>255)c.z=-115;c.car.position.z=c.z;}
  },
  /** Aplica a névoa do set à cena só enquanto ela é desenhada com o set visível; devolve a do mundo logo depois. */
  attach(scene){
   if(detach||!scene)return;const before=scene.onBeforeRender,after=scene.onAfterRender,saved=new THREE.Color();let savedDensity=null;
   scene.onBeforeRender=function(...a){before.apply(this,a);const f=scene.fog;if(group.visible&&f?.isFogExp2){saved.copy(f.color);savedDensity=f.density;f.color.copy(fog.color);f.density=fog.density;}};
   scene.onAfterRender=function(...a){const f=scene.fog;if(savedDensity!==null&&f){f.color.copy(saved);f.density=savedDensity;savedDensity=null;}after.apply(this,a);};
   detach=()=>{scene.onBeforeRender=before;scene.onAfterRender=after;detach=null;};
  },
  dispose(){detach?.();group.removeFromParent();for(const o of owned)o.dispose?.();owned.length=0;}
 };
}

import * as THREE from 'three';
import {bevelGeometry} from '../render/materials.js';
import {mergeStatic} from '../render/mergeStatic.js';
import {createInstruments} from './Instruments.js';

// Authored interior fits the imported cab. No physics, wheel or source GLB changes.
export const CABIN_EYE=Object.freeze([-.6,.97,-2.05]);
function surface(kind,data=false){
 if(typeof document==='undefined')return null;
 const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');
 ctx.fillStyle=data?'#c7c7c7':kind==='cloth'?'#62685c':kind==='metal'?'#9b9f91':'#8a9286';ctx.fillRect(0,0,256,256);
 let seed=822;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<6000;i++){const v=random()>.5?240:20;ctx.fillStyle=`rgba(${v},${v},${v},${data?.12:.08})`;ctx.fillRect(random()*256,random()*256,1,kind==='metal'?random()*7+1:1);}
 if(kind==='cloth'){ctx.strokeStyle=data?'#777777':'#2b302b60';ctx.lineWidth=.6;for(let i=0;i<256;i+=3){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,256);ctx.moveTo(0,i);ctx.lineTo(256,i);ctx.stroke();}}
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=data?THREE.NoColorSpace:THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.setScalar(kind==='cloth'?4:2);return texture;
}
function labelAtlas(){
 if(typeof document==='undefined')return null;
 const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');
 const texts=['ONDAS CURTAS  /  7.047 MHz','VENTILACAO  /  DESEMBACADOR','TITA  /  ROCHA CLARA','LUZES     AR     RESERVA','CADERNO DE ESTRADA','FILTROS  /  PECAS','DIESEL  /  TEMPERATURA','REDE AURORA'];
 texts.forEach((text,i)=>{ctx.fillStyle='#242c29';ctx.fillRect(0,i*32,1024,32);ctx.fillStyle='#c8c7b6';ctx.font='22px monospace';ctx.textAlign='center';ctx.fillText(text,512,i*32+24);});
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
export function createCabin({instrumentsFactory=createInstruments}={}){
 const group=new THREE.Group();group.name='Interior Titã / oficina de estrada';
 const mats={},textures=[];
 const material=(name,color,roughness,metalness=0,kind)=>{const m=new THREE.MeshStandardMaterial({color,roughness,metalness});m.name=`Cabin_${name}`;if(kind){m.map=surface(kind);m.bumpMap=surface(kind,true);m.bumpScale=kind==='cloth'?.002:.001;for(const t of [m.map,m.bumpMap])if(t)textures.push(t);}mats[name]=m;return m;};
 const vinyl=material('vinyl','#b7bca7',.88,0,'vinyl'),cloth=material('cloth','#c2bba3',.96,0,'cloth'),paint=material('paint','#c9c7b2',.68,.25,'metal'),metal=material('metal','#8c938a',.42,.8),rubber=material('rubber','#202824',.96),stitch=material('stitch','#aaa38a',.9),paper=material('paper','#c8bd98',.99);
 const lining=material('lining','#e1d7b6',.97);lining.map=vinyl.map;lining.bumpMap=vinyl.bumpMap;lining.bumpScale=.0007;
 const glass=new THREE.MeshPhysicalMaterial({color:'#9aaeb0',roughness:.18,metalness:0,transparent:true,opacity:.12,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true});mats.glass=glass;
 const glow=new THREE.MeshStandardMaterial({color:'#d6b978',emissive:'#ffd39a',emissiveIntensity:.3,roughness:.7});mats.glow=glow;
 const atlas=labelAtlas(),textMat=material('labels','#ffffff',.92);textMat.map=atlas;if(atlas)textures.push(atlas);
 const add=(g,m,x,y,z,parent=group,rotation=[0,0,0])=>{const mesh=new THREE.Mesh(g,m);mesh.position.set(x,y,z);mesh.rotation.set(...rotation);mesh.castShadow=m!==glass&&m!==glow;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 const box=(w,h,d,m,x,y,z,parent=group,rot=[0,0,0])=>add(bevelGeometry(w,h,d,.025),m,x,y,z,parent,rot);
 const ball=(sx,sy,sz,m,x,y,z,parent=group)=>{const g=new THREE.SphereGeometry(1,20,12);g.scale(sx,sy,sz);return add(g,m,x,y,z,parent);};
 const tube=(points,r,m,parent=group)=>add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),18,r,6,false),m,0,0,0,parent);
 const label=(row,w,h,x,y,z)=>{const g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,(7-row+uv.getY(i))/8);return add(g,textMat,x,y,z);};
 // Solid shell: tall dashboard, thin pillars and headliner; clear central view.
 box(2.15,.1,1.9,rubber,0,-.2,-2.48);box(2.15,.75,.08,lining,0,.22,-1.58);box(2.2,.08,1.92,lining,0,1.23,-2.48);
 box(2.14,.73,.075,lining,0,.125,-3.34); // Solid firewall below the windshield/dashboard.
 for(const s of [-1,1]){
  box(.07,1.37,.09,paint,s*1.08,.56,-3.32,group,[.05,0,s*.035]);box(.065,1.3,.08,paint,s*1.08,.58,-1.62);
  box(.075,.58,1.45,lining,s*1.075,.18,-2.48);box(.04,.07,1.55,rubber,s*1.035,.49,-2.48);
  box(.06,.16,.65,paint,s*1.025,.25,-2.43);box(.09,.06,.46,rubber,s*.98,.34,-2.43);
  box(.07,.025,.22,metal,s*.98,.48,-2.12);box(.04,.14,.09,rubber,s*.97,.11,-2.12);
  box(.06,.015,.16,metal,s*.94,.18,-2.11);ball(.025,.025,.025,rubber,s*.94,.11,-2.03);
  box(.04,.22,.58,rubber,s*1.02,-.03,-2.2); // moulded door storage
  box(.32,.045,.09,vinyl,s*.65,1.14,-3.16,group,[0,0,s*.05]);
  add(new THREE.PlaneGeometry(1.45,.7),glass,s*1.02,.83,-2.48,group,[0,s*Math.PI/2,0]);
  tube([[s*1.03,.78,-3.12],[s*1.26,.78,-3.08],[s*1.3,.94,-3.08]],.014,metal);
  ball(.11,.18,.045,rubber,s*1.3,.96,-3.08);box(.16,.27,.012,metal,s*1.3,.96,-3.028);
 }
 // Curved instrument binnacle and passenger dashboard (not a single black cube).
 const shape=new THREE.Shape();shape.moveTo(-1.02,-.16);shape.lineTo(.4,-.16);shape.quadraticCurveTo(.48,-.1,.46,.13);shape.quadraticCurveTo(-.2,.23,-.92,.2);shape.quadraticCurveTo(-1.05,.17,-1.02,-.16);
 const binnacle=new THREE.ExtrudeGeometry(shape,{depth:.13,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.018,bevelThickness:.018,curveSegments:12});
 add(binnacle,vinyl,0,.61,-3.18);box(.58,.42,.47,vinyl,.72,.53,-3.14);box(.5,.18,.025,paint,.72,.53,-2.888);box(.1,.022,.03,metal,.72,.59,-2.86);
 for(const x of [-.98,.38,.85]){const y=x===.85?.7:.77,z=x===.85?-2.877:-3.025;box(.2,.08,.03,rubber,x,y,z);for(let i=0;i<5;i++)box(.14,.006,.025,metal,x,y-.029+i*.014,z+.02);}
 for(const x of [.42,.54,.66,.78]){box(.07,.07,.035,rubber,x,.34,-2.867);box(.035,.01,.012,stitch,x,.36,-2.842);}
 label(1,.54,.035,.72,.63,-2.872);label(2,.5,.038,-.5,.47,-3.02);label(3,.43,.035,.65,.26,-2.775);
 box(.5,.14,.025,vinyl,.65,.24,-2.8);for(const x of [.42,.88])box(.025,.22,.04,metal,x,.23,-2.83);
 const radio=box(.48,.16,.16,paint,.65,.06,-2.85);label(0,.4,.035,.65,.105,-2.762);
 for(const x of [.46,.84])add(new THREE.CylinderGeometry(.025,.025,.035,16),rubber,x,.04,-2.75,group,[Math.PI/2,0,0]);
 tube([[.86,.04,-2.76],[.96,-.01,-2.65],[.94,-.09,-2.5],[.81,-.07,-2.48]],.009,rubber);
 // Upholstered seats with shaped bolsters, seams, headrests and metal runners.
 for(const x of [-.61,.62]){
  for(const dx of [-.22,.22])box(.045,.11,.62,metal,x+dx,-.07,-2.08);
  ball(.32,.12,.35,cloth,x,.12,-2.12);ball(.29,.38,.11,cloth,x,.51,-1.79);
  for(const side of [-1,1]){ball(.075,.1,.32,vinyl,x+side*.27,.17,-2.1);ball(.065,.32,.11,vinyl,x+side*.27,.51,-1.79);tube([[x+side*.24,.25,-1.68],[x+side*.24,.66,-1.68],[x+side*.16,.8,-1.68]],.003,stitch);}
  for(let i=0;i<5;i++){tube([[x-.2,.226,-2.35+i*.105],[x,.238,-2.35+i*.105],[x+.2,.226,-2.35+i*.105]],.002,stitch);}
  for(const dx of [-.12,.12])box(.018,.15,.018,metal,x+dx,.91,-1.8);
  ball(.24,.14,.09,vinyl,x,1.03,-1.79);box(.05,.055,.045,metal,x-.3,.16,-1.93);tube([[x-.3,.16,-1.93],[x-.3,.55,-1.74],[x-.3,.9,-1.65]],.013,rubber);
 }
 // Footwell and three separate pedals; no hidden geometry in the driver's sightline.
 box(.67,.025,.65,rubber,-.62,-.13,-2.9);for(let i=0;i<12;i++)box(.6,.004,.015,vinyl,-.62,-.114,-3.15+i*.045);
 for(const [x,w]of [[-.87,.1],[-.63,.12],[-.4,.07]]){tube([[x,-.12,-2.95],[x,.04,-3.13]],.012,metal);box(w,.13,.035,rubber,x,.055,-3.08,group,[-.35,0,0]);}
 const steeringWheel=new THREE.Group();steeringWheel.position.set(-.62,.64,-2.66);steeringWheel.rotation.x=-.48;group.add(steeringWheel);
 add(new THREE.TorusGeometry(.235,.021,10,40),rubber,0,0,0,steeringWheel);ball(.067,.062,.03,vinyl,0,0,.01,steeringWheel);
 for(const s of [-1,1])box(.17,.04,.025,paint,s*.12,-.005,.005,steeringWheel,[0,0,s*.15]);box(.035,.17,.026,paint,0,-.13,.005,steeringWheel);
 tube([[-.62,.64,-2.68],[-.62,.18,-3]],.035,rubber);tube([[-.76,.52,-2.78],[-.92,.52,-2.71]],.012,metal);ball(.035,.022,.025,rubber,-.94,.52,-2.7);
 const lever=new THREE.Group();lever.position.set(.01,.18,-2.23);group.add(lever);ball(.09,.045,.1,rubber,0,0,0,lever);add(new THREE.CylinderGeometry(.013,.016,.34,12),metal,0,.18,0,lever);ball(.038,.045,.034,vinyl,0,.36,0,lever);
 // Personal storage and travel objects are attached to the cab, not collectibles.
 box(.32,.035,.24,paper,.65,.82,-3.16,group,[0,.1,0]);label(4,.29,.045,.65,.83,-3.02);
 tube([[.98,.07,-2.1],[.95,.09,-1.93],[.85,.12,-1.83]],.008,stitch);box(.14,.22,.09,paint,.86,-.01,-1.95);
 add(new THREE.CylinderGeometry(.04,.035,.14,16),metal,.29,.02,-2.08);add(new THREE.TorusGeometry(.035,.006,6,18),metal,.34,.04,-2.08,group,[Math.PI/2,0,0]);
 box(.14,.36,.1,paint,-.96,-.01,-1.77);label(5,.13,.05,-.96,.03,-1.71);
 // Thin two-piece windshield, edge seals and parked wipers.
 for(const s of [-1,1]){const pane=add(new THREE.PlaneGeometry(1.01,.7),glass,s*.52,.84,-3.3);pane.rotation.x=.06;tube([[s*.13,.47,-3.27],[s*.32,.64,-3.27],[s*.7,.66,-3.27]],.009,rubber);}
 box(.025,.73,.035,rubber,0,.85,-3.29);box(2.1,.045,.06,rubber,0,1.21,-3.3);box(2.1,.04,.06,rubber,0,.46,-3.3);
 box(.3,.035,.2,paint,0,1.176,-2.24);box(.22,.015,.14,glow,0,1.15,-2.24);
 const dome=new THREE.PointLight('#f4d6a4',0,2.4,2);dome.position.set(0,1.08,-2.3);group.add(dome);
 const instruments=instrumentsFactory();instruments.group.position.set(.05,-.83,-.06);group.add(instruments.group);
 mergeStatic(group); // Keeps the wheel, shift lever, instruments and light as groups.
 for(const mesh of group.children)if(mesh.isMesh&&(mesh.material===glass||mesh.material===glow))mesh.castShadow=false;
 let inside=false;group.visible=false;
 return {group,eye:CABIN_EYE,steeringWheel,lever,instruments,materials:mats,
  setInside(value){inside=value;group.visible=value;},
  update(state){glow.emissiveIntensity=inside?.2+(state.headlights?1.1:0):0;dome.intensity=inside?.6+(state.worldNight||0)*1.2:0;dome.visible=dome.intensity>.01;},
  snapshot(){return {inside,eye:[...CABIN_EYE],drawBatches:group.children.filter(o=>o.isMesh).length,detailMaterials:Object.keys(mats),dome:!!dome.visible};},
  dispose(){const geometries=new Set(),allMaterials=new Set(Object.values(mats)),allTextures=new Set(textures);group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:[o.material]).filter(Boolean)){allMaterials.add(m);for(const t of Object.values(m))if(t?.isTexture&&!t.userData.assetManaged)allTextures.add(t);}});geometries.forEach(g=>g.dispose());allMaterials.forEach(m=>m.dispose());allTextures.forEach(t=>t.dispose());group.removeFromParent();}
 };
}

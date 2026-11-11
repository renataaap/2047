import * as THREE from 'three';
import {CUTSCENES} from '../cutscene.js';
import {sceneSeen} from '../story.js';
import {smooth} from '../../restoration/progress.js';
import {POINTS} from '../../../data/campaign.js';

// Story 004 (brief MVP 5): a sobrevivente chega ao barracão com a primeira Semente.
// Id 'first-seed' (data/story.js SCENES). Apresentação pura: a Semente continua vindo só de
// receiveSeed() no diálogo existente; a cena não concede item, não move o relógio nem a física.
// Antes da chegada a sobrevivente não está no abrigo (sem visual, colisor nem interação).
// Ela chega quando o tutorial pede "Converse com a sobrevivente" ou, sem tutorial ativo
// (pulado, concluído ou save legado), quando Dante se aproxima a pé do abrigo.
// Ritmo (~21,6 s): corrida pela estrada 4,6 s; chegada sem fôlego 4 s; a Semente 5 s;
// o aviso sobre vibração 4 s; o pedido, olhando para o Titã, 4 s — e volta ao olhar do jogador.
export const ARRIVAL_RADIUS=12;
const SHOTS=[
 {duration:4.6,tone:'ash',light:{exposure:.92}},
 {duration:4,tone:'ash',light:{exposure:.95},caption:{speaker:'survivor',text:'Dante? Dante Rocha Negra? Me disseram que você ainda tinha um caminhão.'}},
 {duration:5,tone:'garage',light:{exposure:1.05},audio:{cue:'pulse'},caption:{speaker:'survivor',text:'Tirei isto do primeiro Cofre. Uma Semente de Ignição. Desde então ela não para de pulsar.'}},
 {duration:4,tone:'garage',light:{exposure:1},caption:{speaker:'survivor',text:'Não deixe ela sacudir. O cristal perde o alinhamento com a vibração.'}},
 {duration:4,tone:'ash',light:{exposure:.98},caption:{speaker:'survivor',text:'A engenheira no rádio disse que só você e esse caminhão chegam ao primeiro Núcleo. Não temos muito tempo.'}},
];
const TOTAL=SHOTS.reduce((a,s)=>a+s.duration,0);
const STARTS=SHOTS.map((_,i)=>SHOTS.slice(0,i).reduce((a,s)=>a+s.duration,0));
const BACK_SECONDS=1.1;
// Trajeto relativo ao abrigo [dx,dz]: vem correndo pela estrada e entra andando sob o toldo.
const PATH={start:[16,-21],mid:[4,-5],end:[0,0]};
const RUN_END=SHOTS[0].duration,WALK_END=RUN_END+3;

/** True when the survivor stands at the shelter (after her arrival, or once the Seed was taken). */
export function survivorPresent(c){return !!c?.seed?.received||sceneSeen(c,'first-seed');}

/**
 * Whether her arrival should start now. Pure: tutorial = TutorialController.snapshot(),
 * where = {mode, overlay, foot:{x,z}|null}. The scene only plays from free play (walking/driving).
 */
export function arrivalDue(c,tutorial,where){
 if(!c||survivorPresent(c)||!['walking','driving'].includes(where?.mode)||where.overlay)return false;
 if(tutorial?.status==='active')return tutorial.step?.id==='mission';
 const f=where.foot;return !!f&&Math.hypot(f.x-POINTS.shelter.x,f.z-POINTS.shelter.z)<=ARRIVAL_RADIUS;
}

const ground=(g,x,z)=>g.world?.groundHeight?.(x,z)??0;
const S=POINTS.shelter;
const v=new THREE.Vector3(),look=new THREE.Vector3(),shake=new THREE.Vector3();

/** Survivor position along the arrival path at time t (seconds), plus speed and heading. */
export function arrivalPath(t){
 const lerp=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k];
 let p,a,b,dur;
 if(t<RUN_END){a=PATH.start;b=PATH.mid;dur=RUN_END;p=lerp(a,b,Math.max(0,t)/dur);}
 else if(t<WALK_END){a=PATH.mid;b=PATH.end;dur=WALK_END-RUN_END;const k=(t-RUN_END)/dur;p=lerp(a,b,k*(2-k));}// desacelera ao chegar
 else return {x:S.x,z:S.z,speed:0,heading:null};
 const d=Math.hypot(b[0]-a[0],b[1]-a[1]);
 const speed=t<RUN_END?d/dur:d/dur*2*(1-(t-RUN_END)/dur);
 return {x:S.x+p[0],z:S.z+p[1],speed,heading:Math.atan2(b[0]-a[0],b[1]-a[1])};
}

function seedProp(){
 const group=new THREE.Group();group.name='Semente de Ignição · cena';
 const metal=new THREE.MeshStandardMaterial({color:0x4b4f52,metalness:.85,roughness:.38});
 const glass=new THREE.MeshStandardMaterial({color:0xb7e6ff,emissive:0x6fc8ff,emissiveIntensity:1.4,transparent:true,opacity:.82,roughness:.12});
 const core=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.28,14),glass);
 for(const y of [-.16,.16]){const cap=new THREE.Mesh(new THREE.CylinderGeometry(.095,.095,.05,14),metal);cap.position.y=y;group.add(cap);}
 for(let i=0;i<3;i++){const rib=new THREE.Mesh(new THREE.BoxGeometry(.018,.3,.018),metal);const a=i*Math.PI*2/3;rib.position.set(Math.sin(a)*.085,0,Math.cos(a)*.085);group.add(rib);}
 group.add(core);const light=new THREE.PointLight(0x7fd0ff,.5,2.2,2);group.add(light);
 group.rotation.z=Math.PI/2;// atravessada nas mãos, como um cilindro pesado
 return {group,glass,light,materials:[metal,glass]};
}

function actorAnchor(g){return g.npcActor?.anchor||g.features?.npc||null;}
function placeActor(g,x,z,heading,speed){
 const a=actorAnchor(g);if(!a)return;a.position.set(x,ground(g,x,z),z);if(Number.isFinite(heading))a.rotation.y=heading;
 g.npcCinematic={speed,heading:Number.isFinite(heading)?heading:a.rotation.y};
}

function frame(p){
 const g=p.g,cam=g.rendering.camera,t=p.elapsed;let i=0;
 while(i<SHOTS.length-1&&t>=STARTS[i]+SHOTS[i].duration)i++;
 const e=smooth(0,1,Math.min(1,(t-STARTS[i])/SHOTS[i].duration));
 const path=arrivalPath(t),dante=g.player.body.translation(),truck=g.vehicle?.body?.translation?.()??{x:0,z:-54};
 // Depois de chegar, ela encara o Dante se ele estiver perto; senão, a porta do barracão.
 const target=Math.hypot(dante.x-S.x,dante.z-S.z)<15?dante:{x:S.x+6,z:S.z+17};
 const facing=path.heading??Math.atan2(target.x-S.x,target.z-S.z);
 placeActor(g,path.x,path.z,facing,path.speed);
 const sy=ground(g,path.x,path.z),fx=Math.sin(facing),fz=Math.cos(facing),side=[fz,-fx];
 const seed=v.set(path.x+fx*.36,sy+1.04,path.z+fz*.36);
 if(p.seed){p.seed.group.position.copy(seed);p.seed.group.rotation.y=facing;const pulse=.5+.5*Math.sin(t*5.3)*Math.sin(t*1.7+.6);p.seed.glass.emissiveIntensity=.7+pulse*1.1;p.seed.light.intensity=.25+pulse*.55;}
 const head={x:path.x,y:sy+1.55,z:path.z};let fov;
 if(i===0){cam.position.set(S.x-4,ground(g,S.x-4,S.z-4)+1.5,S.z-4);// fora da linha das colunas do toldo (-17,2)/(-17,13)
 look.set(head.x,head.y-.3,head.z);fov=THREE.MathUtils.lerp(50,40,e);}
 else if(i===1){const k=THREE.MathUtils.lerp(3.4,2.6,e);cam.position.set(S.x+k,ground(g,S.x+k,S.z+k*.85)+1.6,S.z+k*.85);look.set(head.x,head.y-.05,head.z);fov=40;}
 else if(i===2){const d=THREE.MathUtils.lerp(1.3,1.05,e);cam.position.set(seed.x+fx*d+side[0]*.32,seed.y+.24,seed.z+fz*d+side[1]*.32);look.copy(seed);fov=THREE.MathUtils.lerp(34,30,e);}
 else if(i===3){const d=THREE.MathUtils.lerp(2.3,2,e);cam.position.set(path.x+fx*d+side[0]*.55,sy+1.6,path.z+fz*d+side[1]*.55);look.set(head.x,head.y-.08,head.z);fov=38;}
 else{const tx=truck.x-path.x,tz=truck.z-path.z,n=Math.hypot(tx,tz)||1,bx=-tx/n,bz=-tz/n;cam.position.set(path.x+bx*1.9-bz*.45,sy+1.75,path.z+bz*1.9+bx*.45);look.set(truck.x,ground(g,truck.x,truck.z)+1.8,truck.z);fov=THREE.MathUtils.lerp(44,40,e);}
 // Câmera na mão nos planos de chegada: urgência sem enjoar (amplitude de centímetros).
 if(i<2){const a=.035*(1-e*.5);shake.set(Math.sin(t*7.1)*a,Math.sin(t*9.3+1)*a*.7,Math.sin(t*6.2+2)*a);cam.position.add(shake);}
 cam.up.set(0,1,0);cam.lookAt(look);cam.fov=fov;
 const back=i===SHOTS.length-1?smooth(p.duration-BACK_SECONDS,p.duration,t):0;
 if(back>0){cam.position.lerp(p.saved.position,back);cam.quaternion.slerp(p.saved.quaternion,back);cam.fov=THREE.MathUtils.lerp(cam.fov,p.saved.fov,back);}
 cam.updateProjectionMatrix();
}

function enter(p){
 const g=p.g;p.home=actorAnchor(g)?.position.clone()??null;p.seed=seedProp();g.rendering.scene?.add(p.seed.group);
 // Sem movimento (redução): ela já está no abrigo, com a Semente nas mãos, e a câmera não se move.
 const h=Math.atan2(6,17);placeActor(g,S.x,S.z,h,0);const sy=ground(g,S.x,S.z);
 p.seed.group.position.set(S.x+Math.sin(h)*.36,sy+1.04,S.z+Math.cos(h)*.36);p.seed.group.rotation.y=h;
}
function exit(p){
 const g=p.g,a=actorAnchor(g);
 if(a&&p.home)a.position.copy(p.home);p.home=null;// volta exatamente ao ponto do colisor
 g.npcCinematic=null;
 if(p.seed){p.seed.group.removeFromParent();p.seed.group.traverse(o=>o.geometry?.dispose());p.seed.materials.forEach(m=>m.dispose());p.seed.light.dispose?.();p.seed=null;}
}

// Redução de movimento: só o plano da Semente, curto e com a câmera parada.
export const SURVIVOR_ARRIVAL={id:'first-seed',frame,enter,exit,reducedSeconds:2.6,reducedShot:2,shots:SHOTS};
export const SURVIVOR_ARRIVAL_SECONDS=TOTAL;
CUTSCENES[SURVIVOR_ARRIVAL.id]=SURVIVOR_ARRIVAL;

import * as THREE from 'three';
import {CUTSCENES} from '../cutscene.js';
import {sceneSeen,choiceOf} from '../story.js';
import {smooth} from '../../restoration/progress.js';
import {NETWORK_POINTS} from '../../../data/network.js';

// Story 005 (brief MVP 6): primeiro encontro físico com Brutus, vulgo Garcia ('brutus-meeting').
// Coerência com o que já existe (data/story.js CHOICE_SCENES 'ch3-brutus-toll'): a decisão do
// pedágio é tomada com os homens de Garcia junto à bomba de Afonso, e Garcia só fala pelo rádio.
// Por isso o encontro em pessoa vem DEPOIS da decisão — no mesmo instante ou em qualquer visita
// seguinte — e a fala dele reage ao que Dante fez. A cena não muda a escolha, a relação
// (derivada da escolha em narrative/story.js), o inventário, o relógio nem a física.
// Antes do encontro Garcia não está no mundo; depois, fica junto à bomba, com colisor.
export const BRUTUS_RADIUS=16;
const TOLL='ch3-brutus-toll';
const SITE=NETWORK_POINTS.find(p=>p.id==='afonso');
/** Onde Garcia para (perto da bomba, entre ela e o abrigo) e de onde ele vem (o sal aberto). */
export const BRUTUS_SPOT={x:SITE.x+5,z:SITE.z+3},BRUTUS_FROM={x:SITE.x+19,z:SITE.z-12};

// Falas: diretrizes de NARRATIVA_0.14.0.md §4 — protege os dele, não confia em engenheiros que
// "sumiram vinte anos", quer as Sementes porque acha que a Rede acende primeiro para quem as tem.
// Não é sádico. Nunca menciona a Voz.
export const REACTIONS={
 pay:'Pagou sem discutir. Ou você é esperto, ou não sabe o que leva aí atrás.',
 refuse:'Disse não para os meus homens. Coragem ou pressa — no Leito, as duas terminam igual.',
 water:'Água para o meu povoado, sem eu pedir duas vezes. Vim ver com os meus olhos quem faz isso.',
};
const SHOTS=[
 {duration:4.5,tone:'ash',light:{exposure:.94},caption:{speaker:'brutus',text:'Então é você o motorista do caminhão velho.'}},
 {duration:5,tone:'ash',light:{exposure:.98},caption:{speaker:'brutus',text:REACTIONS.refuse}},// texto trocado pela escolha (captionFor)
 {duration:5.5,tone:'garage',light:{exposure:1},caption:{speaker:'brutus',text:'Vinte anos os engenheiros sumiram. Essa Rede vai acender primeiro para quem estiver segurando as Sementes.'}},
 {duration:4,tone:'garage',light:{exposure:1.02},caption:{speaker:'brutus',text:'Eu protejo os meus, Dante. Vou estar olhando a sua estrada.'}},
];
const TOTAL=SHOTS.reduce((a,s)=>a+s.duration,0);
const STARTS=SHOTS.map((_,i)=>SHOTS.slice(0,i).reduce((a,s)=>a+s.duration,0));
const WALK_END=4.2,BACK_SECONDS=1.1;

/** Garcia is in the world once the toll was decided and the meeting was shown (watched or skipped). */
export function brutusPresent(c){return !!choiceOf(c,TOLL)&&sceneSeen(c,'brutus-meeting');}
/** Pure trigger: decided toll, not yet met, Dante on foot near the pump, nothing open. */
export function brutusDue(c,where){
 if(!c||!choiceOf(c,TOLL)||sceneSeen(c,'brutus-meeting')||where?.mode!=='walking'||where.overlay)return false;
 const f=where.foot;return !!f&&Math.hypot(f.x-BRUTUS_SPOT.x,f.z-BRUTUS_SPOT.z)<=BRUTUS_RADIUS;
}
/** Garcia's position while he walks up from the salt (seconds since the scene started). */
export function brutusPath(t){
 const k=Math.min(1,Math.max(0,t/WALK_END)),e=k*(2-k);
 return {x:BRUTUS_FROM.x+(BRUTUS_SPOT.x-BRUTUS_FROM.x)*e,z:BRUTUS_FROM.z+(BRUTUS_SPOT.z-BRUTUS_FROM.z)*e,speed:k<1?Math.hypot(BRUTUS_SPOT.x-BRUTUS_FROM.x,BRUTUS_SPOT.z-BRUTUS_FROM.z)/WALK_END*2*(1-k):0};
}

const ground=(g,x,z)=>g.world?.groundHeight?.(x,z)??0;
const look=new THREE.Vector3();

function frame(p){
 const g=p.g,cam=g.rendering.camera,t=p.elapsed,actor=g.brutusActor;let i=0;
 while(i<SHOTS.length-1&&t>=STARTS[i]+SHOTS[i].duration)i++;
 const e=smooth(0,1,Math.min(1,(t-STARTS[i])/SHOTS[i].duration));
 const d=g.player.body.translation(),b=brutusPath(t),by=ground(g,b.x,b.z);
 const walking=b.speed>.05,facing=walking?Math.atan2(BRUTUS_SPOT.x-BRUTUS_FROM.x,BRUTUS_SPOT.z-BRUTUS_FROM.z):Math.atan2(d.x-b.x,d.z-b.z);
 actor?.place?.(b.x,by,b.z,facing,b.speed);
 const tx=d.x-b.x,tz=d.z-b.z,n=Math.hypot(tx,tz)||1,ux=tx/n,uz=tz/n,sx=uz,sz=-ux;// u: Garcia→Dante; s: lateral
 const head={x:b.x,y:by+1.6,z:b.z};
 if(i===0){// Plano aberto, baixo, do lado do Dante: Garcia vem do sal com a bomba atrás.
  const cx=d.x-sx*2.2-ux*1.2,cz=d.z-sz*2.2-uz*1.2;cam.position.set(cx,ground(g,cx,cz)+1.1,cz);look.set(head.x,head.y-.35,head.z);cam.fov=THREE.MathUtils.lerp(46,38,e);
 }else if(i===1){// Médio frontal: a reação à escolha.
  const k=THREE.MathUtils.lerp(3.6,3,e),cx=b.x+ux*k+sx*.8,cz=b.z+uz*k+sz*.8;cam.position.set(cx,by+1.55,cz);look.set(head.x,head.y-.1,head.z);cam.fov=36;
 }else if(i===2){// Por cima do ombro do Dante: os dois frente a frente.
  const cx=d.x+ux*1.5+sx*.75,cz=d.z+uz*1.5+sz*.75;cam.position.set(cx,ground(g,cx,cz)+1.75,cz);look.set(head.x,head.y-.15,head.z);cam.fov=THREE.MathUtils.lerp(40,34,e);
 }else{// Close baixo em Garcia, quase contra a luz.
  const k=THREE.MathUtils.lerp(2.1,1.7,e),cx=b.x+ux*k-sx*.45,cz=b.z+uz*k-sz*.45;cam.position.set(cx,by+1.35,cz);look.set(head.x,head.y,head.z);cam.fov=32;
 }
 cam.up.set(0,1,0);cam.lookAt(look);
 const back=i===SHOTS.length-1?smooth(p.duration-BACK_SECONDS,p.duration,t):0;
 if(back>0){cam.position.lerp(p.saved.position,back);cam.quaternion.slerp(p.saved.quaternion,back);cam.fov=THREE.MathUtils.lerp(cam.fov,p.saved.fov,back);}
 cam.updateProjectionMatrix();
}
function enter(p){const g=p.g,s=BRUTUS_SPOT,d=g.player.body.translation();g.brutusActor?.place?.(s.x,ground(g,s.x,s.z),s.z,Math.atan2(d.x-s.x,d.z-s.z),0);}// sem movimento: já parado
function exit(p){const g=p.g,s=BRUTUS_SPOT,d=g.player.body.translation();g.brutusActor?.place?.(s.x,ground(g,s.x,s.z),s.z,Math.atan2(d.x-s.x,d.z-s.z),0);}// sempre termina no ponto do colisor
/** Shot 1 reacts to the toll decision; the others are fixed. */
function captionFor(g,index){const taken=choiceOf(g.campaign,TOLL);return index===1&&REACTIONS[taken]?{speaker:'brutus',text:REACTIONS[taken]}:null;}

// Redução de movimento: câmera parada, só a reação à escolha.
export const BRUTUS_MEETING={id:'brutus-meeting',frame,enter,exit,captionFor,reducedSeconds:2.6,reducedShot:1,shots:SHOTS};
export const BRUTUS_MEETING_SECONDS=TOTAL;
CUTSCENES[BRUTUS_MEETING.id]=BRUTUS_MEETING;

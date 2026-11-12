import * as THREE from 'three';
import {CUTSCENES} from '../cutscene.js';
import {smooth} from '../../restoration/progress.js';

// Story 003 (brief MVP 3 e 4): nova introdução de Dante no barracão e apresentação do Titã.
// Toca logo depois do prólogo (fila do CutscenePlayer) com o id 'intro-2047', que já era o
// registro "2047" da abertura. Apresentação pura: não move Dante, o Titã nem o relógio;
// o último plano entra nos olhos do Dante e devolve exatamente a câmera salva do jogo.
// Poses relativas a âncoras vivas do mundo (Dante e Titã), com altura acima do terreno:
// assim a cena acompanha o spawn real (superfície triangular) sem números soltos de mapa.
// Metas de ritmo (~19 s): exterior 5 s, Titã 6 s, Dante 5 s, volta ao controle 3 s.
const SHOTS=[
 // Barracão e Titã sob a poeira de 2047, ao nível do chão.
 {duration:5,tone:'ash',light:{exposure:.95},cam:{a:{at:'mid',off:[17,15,3.2],look:[0,0,1.6],fov:52},b:{at:'mid',off:[13,12,2.6],look:[0,0,1.4],fov:48}}},
 // O Titã de perto: câmera baixa correndo ao longo do flanco, até a cabine.
 {duration:6,tone:'ash',light:{exposure:.95},cam:{a:{at:'truck',off:[-5.2,7.5,.9],look:[0,1.5,1.6],fov:46},b:{at:'truck',off:[-4.6,-2.8,1.5],look:[0,-3.2,2.1],fov:42}},
  caption:{speaker:'dante',text:'Titã Rocha Clara. Dois mil e três, barulhento e teimoso. Ainda pega.'}},
 // Dante dentro do barracão, junto à bancada.
 {duration:5,tone:'garage',light:{exposure:1.05},gesture:'interact',cam:{a:{at:'dante',off:[1.6,-3.4,1.55],look:[0,0,1.45],fov:44},b:{at:'dante',off:[1.1,-2.9,1.6],look:[0,0,1.5],fov:40}},
  caption:{speaker:'dante',text:'Eu dirijo. O resto não é comigo.'}},
 // A câmera entra nos olhos do Dante e devolve o controle.
 {duration:3,tone:'garage',light:{exposure:1},cam:{a:{at:'dante',off:[.9,-2.6,1.6],look:[0,0,1.5],fov:44},b:{at:'dante',off:[0,-.25,1.49],look:[0,-6,1.4],fov:60}},back:true},
];
const TOTAL=SHOTS.reduce((a,s)=>a+s.duration,0);
const STARTS=SHOTS.map((_,i)=>SHOTS.slice(0,i).reduce((a,s)=>a+s.duration,0));
const BACK_SECONDS=1.1;
const v=new THREE.Vector3(),A={pos:new THREE.Vector3(),look:new THREE.Vector3(),fov:0},B={pos:new THREE.Vector3(),look:new THREE.Vector3(),fov:0};

/** Âncoras vivas: Dante (corpo do jogador), Titã (corpo do veículo) e o ponto médio entre eles. */
export function anchors(g){
 const d=g.player.body.translation(),t=g.vehicle?.body?.translation?.()??{x:d.x+13,z:d.z-17};
 return {dante:{x:d.x,z:d.z},truck:{x:t.x,z:t.z},mid:{x:(d.x+t.x)/2,z:(d.z+t.z)/2}};
}
function place(g,base,off,out){const x=base.x+off[0],z=base.z+off[1];return out.set(x,(g.world?.groundHeight?.(x,z)??0)+off[2],z);}
function pose(g,P,an,out){const base=an[P.at];place(g,base,P.off,out.pos);place(g,base,P.look,out.look);out.fov=P.fov;return out;}

function frame(p){
 const g=p.g,cam=g.rendering.camera;let i=0;
 while(i<SHOTS.length-1&&p.elapsed>=STARTS[i]+SHOTS[i].duration)i++;
 const s=SHOTS[i],e=smooth(0,1,Math.min(1,(p.elapsed-STARTS[i])/s.duration)),an=p.anchors||(p.anchors=anchors(g));
 if(s.gesture&&p.gestured!==i){p.gestured=i;g.playerVisual?.gesture?.(s.gesture);}
 pose(g,s.cam.a,an,A);pose(g,s.cam.b,an,B);
 cam.position.copy(A.pos).lerp(B.pos,e);cam.up.set(0,1,0);cam.lookAt(v.copy(A.look).lerp(B.look,e));cam.fov=THREE.MathUtils.lerp(A.fov,B.fov,e);
 const back=s.back?smooth(p.duration-BACK_SECONDS,p.duration,p.elapsed):0;
 if(back>0){cam.position.lerp(p.saved.position,back);cam.quaternion.slerp(p.saved.quaternion,back);cam.fov=THREE.MathUtils.lerp(cam.fov,p.saved.fov,back);}
 cam.updateProjectionMatrix();
}
function enter(p){p.anchors=null;p.gestured=-1;}
function exit(p){p.anchors=null;}

// Redução de movimento: câmera fixa no próprio olhar do jogador, só a fala do Dante (plano 2).
export const INTRO_DANTE={id:'intro-2047',frame,enter,exit,reducedSeconds:1.8,reducedShot:2,
 shots:SHOTS.map(({cam,gesture,back,...shot})=>shot)};
export const INTRO_DANTE_SECONDS=TOTAL;
CUTSCENES[INTRO_DANTE.id]=INTRO_DANTE;

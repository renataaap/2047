import * as THREE from 'three';
import {CUTSCENES} from '../cutscene.js';
import {smooth} from '../../restoration/progress.js';
import {buildPrologueSet,SET_ORIGIN} from './Prologue2027Set.js';

// Story 002 (brief MVP 2): prólogo de 2027 e corte para 2047 ("Vinte anos depois").
// Capítulo 'prologue' = "Prólogo — O Último Ano" (docs/NARRATIVA_0.14.0.md). Apresentação pura.
// 2027 acontece num set próprio (Prologue2027Set): rodovia conservada, posto aceso, carros,
// árvores, cidade e torre de rádio, colina com túnel — montado ao começar e descartado ao fim.
// 2047 usa o mundo real já carregado (barracão e Titã). Não altera relógio, física nem save.
// Uma só definição cobre 'prologue-2027' e, via `also`, 'intro-2047': pular não deixa meia abertura.
// Metas de ritmo (~41 s): 0–15 estrada e sinais anormais; 15–30 céu, rádio cai, plasma, túnel; 30–41 corte para 2047.
// Poses: [x, z, altura]. space 'set': coordenadas do set (altura absoluta no set);
// space 'world': altura acima do terreno de 2047.
const R=(a,b,space='set')=>({a,b,space});
const SHOTS=[
 // 2027: rodovia viva, tráfego e rádio comum.
 {duration:7,tone:'clean',light:{exposure:1},cam:R([[22,250,16],[0,110,0],56],[[6,205,4.5],[0,90,2],52]),caption:{speaker:'radio',text:'Trânsito normal na rodovia. Sol firme até o fim da tarde.'}},
 // Primeiro sinal: a luz do céu não é a do sol.
 {duration:8,tone:'odd',light:{exposure:1},cam:R([[3,178,1.7],[0,60,4],50],[[3,168,1.7],[-20,-90,60],60]),caption:{speaker:'dante',text:'Aquela luz não é do sol.'},audio:{cue:'pulse'}},
 // O céu muda, o rádio cai (a torre apaga), os carros param: tempestade de plasma.
 {duration:7,tone:'plasma',light:{exposure:1},cam:R([[-15,150,7],[0,-60,10],62],[[-10,132,4],[0,-120,30],72]),caption:{speaker:'radio',text:'Sem sinal... repito... sem sinal...'},audio:{cue:'pulse'}},
 // Dante se abriga no túnel; lá fora, o plasma.
 {duration:8,tone:'tunnel',light:{exposure:.85},cam:R([[1.5,-172,1.8],[0,-110,3],60],[[1.5,-160,1.8],[0,-110,2.5],56]),caption:{speaker:'dante',text:'Túnel. Aqui dentro eu espero.'}},
 // Corte: 2047.
 {duration:3,tone:'black',light:{exposure:.45},cam:R([[0,-48,1.3],[0,-90,1.8],56],[[0,-48,1.3],[0,-90,1.8],56],'world'),card:{kicker:'2047',text:'Vinte anos depois'}},
 // O mundo devastado: seco, cinza, sem luz de cidade — o barracão e o Titã.
 {duration:8,tone:'ash',light:{exposure:.9},cam:R([[-30,50,12],[0,5,3],58],[[-12,30,6],[0,5,2.5],52],'world'),caption:{speaker:'dante',text:'Vinte anos. O céu ficou. O resto, não.'}},
];
const TOTAL=SHOTS.reduce((a,s)=>a+s.duration,0);
const STARTS=SHOTS.map((_,i)=>SHOTS.slice(0,i).reduce((a,s)=>a+s.duration,0));
const SET_SHOTS=4;// planos 0..3 acontecem no set de 2027
const BACK_SECONDS=.6;
const v=new THREE.Vector3();

function point(g,p,space,out){
 if(space==='set')return out.set(SET_ORIGIN.x+p[0],SET_ORIGIN.y+p[2],SET_ORIGIN.z+p[1]);
 return out.set(p[0],g.world.groundHeight(p[0],p[1])+p[2],p[1]);
}
function pose(g,P,space,out){point(g,P[0],space,out.pos);point(g,P[1],space,out.look);out.fov=P[2];return out;}
const A={pos:new THREE.Vector3(),look:new THREE.Vector3(),fov:0},B={pos:new THREE.Vector3(),look:new THREE.Vector3(),fov:0};

// Mostra o set só nos planos de 2027; o céu/poeira do jogo ficam ocultos enquanto ele aparece.
// O far da câmera cai para o raio da cúpula: o mundo de 2047, 1500 m abaixo, nem é desenhado
// (em Médio/Alto o far original o incluiria atrás do chão do set).
const SET_FAR=640;
function showSet(p,on){
 if(!p.set)return;p.set.group.visible=on;const r=p.g.rendering;
 if(r.sky)r.sky.visible=on?false:p.hidden.sky;if(r.dust)r.dust.visible=on?false:p.hidden.dust;
 r.camera.far=on?Math.min(p.hidden.far,SET_FAR):p.hidden.far;r.camera.updateProjectionMatrix();
}

// Câmera procedural: segue a tabela acima e, no último plano, devolve a câmera salva do jogo.
function frame(p){
 const g=p.g,cam=g.rendering.camera;let i=0;
 while(i<SHOTS.length-1&&p.elapsed>=STARTS[i]+SHOTS[i].duration)i++;
 const s=SHOTS[i],e=smooth(0,1,Math.min(1,(p.elapsed-STARTS[i])/s.duration));
 showSet(p,i<SET_SHOTS);
 if(p.set&&i<SET_SHOTS)p.set.update(p.elapsed,{odd:smooth(STARTS[1],STARTS[1]+5,p.elapsed),storm:smooth(STARTS[2],STARTS[2]+3,p.elapsed),reduced:p.reduced});
 pose(g,s.cam.a,s.cam.space,A);pose(g,s.cam.b,s.cam.space,B);
 cam.position.copy(A.pos).lerp(B.pos,e);cam.up.set(0,1,0);
 cam.lookAt(v.copy(A.look).lerp(B.look,e));cam.fov=THREE.MathUtils.lerp(A.fov,B.fov,e);
 const back=i===SHOTS.length-1?smooth(p.duration-BACK_SECONDS,p.duration,p.elapsed):0;
 if(back>0){cam.position.lerp(p.saved.position,back);cam.quaternion.slerp(p.saved.quaternion,back);cam.fov=THREE.MathUtils.lerp(cam.fov,p.saved.fov,back);}
 cam.updateProjectionMatrix();
}
function enter(p){
 const r=p.g.rendering;if(!r?.scene||p.reduced)return;// reduzido: só a cartela, sem set
 p.hidden={sky:r.sky?.visible??true,dust:r.dust?.visible??true,far:r.camera.far};p.set=buildPrologueSet();r.scene.add(p.set.group);
}
function exit(p){
 if(!p.set)return;showSet(p,false);p.set.dispose();p.set=null;
}

// Redução de movimento: só a cartela "2047 / Vinte anos depois" (plano 4), câmera parada, sem set.
export const PROLOGUE={id:'prologue-2027',also:['intro-2047'],frame,enter,exit,reducedSeconds:2.4,reducedShot:4,
 shots:SHOTS.map(({cam,...shot})=>shot)};
export const PROLOGUE_SECONDS=TOTAL;
CUTSCENES[PROLOGUE.id]=PROLOGUE;

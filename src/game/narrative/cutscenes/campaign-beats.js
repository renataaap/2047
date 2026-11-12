import * as THREE from 'three';
import {CUTSCENES} from '../cutscene.js';
import {sceneSeen,chapterOf} from '../story.js';
import {smooth} from '../../restoration/progress.js';

// Story 006 (brief MVP 7): cenas dos acontecimentos importantes da campanha.
// Todas são apresentação pura de um resultado já salvo: nenhuma concede item, muda escolha,
// relação, relógio ou física. Cada uma toca uma vez (campaign.story.scenes) e é pulável.
// Os gatilhos são TRANSIÇÕES observadas nesta sessão por viagem real (nunca por carregar um save
// já adiante, nem por teleporte de diagnóstico), para não surpreender saves antigos:
//  first-contact      ch1 — ao fechar o rádio depois de aceitar a Semente (primeiro contato com Renata)
//  skeleton-discovery ch2 — ao entrar nas Cidades Esqueleto
//  brutus-meeting     ch3 — story 005 (brutus.js)
//  voice-signal       ch4 — quando a Voz fala do Titã (fragmento 'signal-stubborn' recém-recebido)
//  horizon-eve        ch5 — logo depois da ativação que abre o último capítulo
// As três escolhas já têm a sua apresentação (CHOICE_SCENES no painel) e o encontro com Garcia.
// A Voz nunca é nomeada nem descrita: só fala, chiada, sem rosto.

const ground=(g,x,z)=>g.world?.groundHeight?.(x,z)??0;
const look=new THREE.Vector3();
const BACK_SECONDS=1.1;

/** Where the scene frames: the truck when driving, Dante on foot otherwise. Road runs toward -z. */
function anchor(p){
 const g=p.g,walking=p.returnMode==='walking',b=walking?g.player.body.translation():(g.vehicle?.body?.translation?.()||g.truck?.root?.position||{x:0,y:0,z:0});
 return {x:b.x,z:b.z,y:ground(g,b.x,b.z),walking};
}

// Planos relativos ao ponto de ancoragem; a câmera fica sempre acima do terreno.
const KINDS={
 crane:(a,e)=>({pos:[a.x+6,THREE.MathUtils.lerp(9,7,e),a.z+16],look:[a.x,a.y+1.5,a.z-30],fov:THREE.MathUtils.lerp(48,42,e)}),
 side:(a,e)=>({pos:[a.x+THREE.MathUtils.lerp(5.5,4.6,e),a.walking?1.6:2.3,a.z+1.5],look:[a.x,a.y+(a.walking?1.5:2.2),a.z],fov:38}),
 ahead:(a,e)=>({pos:[a.x-2.2,a.walking?1.4:2,a.z-THREE.MathUtils.lerp(9,7.5,e)],look:[a.x,a.y+(a.walking?1.4:2),a.z],fov:40}),
 horizon:(a,e)=>({pos:[a.x+2.4,a.walking?1.7:3.2,a.z+3],look:[a.x+THREE.MathUtils.lerp(0,-6,e),a.y+THREE.MathUtils.lerp(6,9,e),a.z-220],fov:THREE.MathUtils.lerp(44,36,e)}),
 high:(a,e)=>({pos:[a.x-14,THREE.MathUtils.lerp(16,22,e),a.z+12],look:[a.x,a.y,a.z-24],fov:46}),
};

function frame(p){
 const g=p.g,cam=g.rendering.camera,t=p.elapsed,shots=p.def.shots;let i=0,start=0;
 while(i<shots.length-1&&t>=start+shots[i].duration){start+=shots[i].duration;i++;}
 const e=smooth(0,1,Math.min(1,(t-start)/shots[i].duration)),a=anchor(p),v=KINDS[shots[i].kind||'side'](a,e);
 // Altura relativa ao chão sob a câmera: nunca dentro do terreno.
 cam.position.set(v.pos[0],ground(g,v.pos[0],v.pos[2])+v.pos[1],v.pos[2]);
 if(shots[i].kind!=='crane'&&shots[i].kind!=='high')cam.position.y=Math.max(cam.position.y,a.y+v.pos[1]);
 cam.up.set(0,1,0);look.set(...v.look);cam.lookAt(look);cam.fov=v.fov;
 const back=i===shots.length-1?smooth(p.duration-BACK_SECONDS,p.duration,t):0;
 if(back>0){cam.position.lerp(p.saved.position,back);cam.quaternion.slerp(p.saved.quaternion,back);cam.fov=THREE.MathUtils.lerp(cam.fov,p.saved.fov,back);}
 cam.updateProjectionMatrix();
}

const beat=(id,shots,reducedShot)=>({id,frame,shots,reducedShot,reducedSeconds:2.6});

// Falas novas seguem NARRATIVA_0.14.0.md §4: Dante fala pouco e por fatos; Renata é técnica e
// admite o que não sabe; a Voz é curta, chiada e sempre um passo à frente.
export const CAMPAIGN_BEATS={
 'first-contact':beat('first-contact',[
  {duration:4,kind:'side',tone:'ash',light:{exposure:.95},caption:{speaker:'renata',text:'Ainda está aí, Dante? A Semente aparece no meu painel.'}},
  {duration:6,kind:'ahead',tone:'ash',light:{exposure:.97},caption:{speaker:'renata',text:'Vinte anos esperando um motor que ainda pegasse. Não sei se o Núcleo responde. Precisamos tentar.'}},
  {duration:3.5,kind:'horizon',tone:'ash',light:{exposure:1},caption:{speaker:'dante',text:'Eu dirijo. O resto não é comigo.'}},
 ],2),
 'skeleton-discovery':beat('skeleton-discovery',[
  {duration:4.5,kind:'high',tone:'ash',light:{exposure:.93},card:{kicker:'Capítulo 2',text:'As Cidades que Ficaram'}},
  {duration:4.6,kind:'horizon',tone:'ash',light:{exposure:.96},caption:{speaker:'renata',text:'Cidade grande morre devagar. Os viadutos ficaram por teimosia. Um de cada vez.'}},
  {duration:3.5,kind:'side',tone:'ash',light:{exposure:1},caption:{speaker:'dante',text:'Tem gente morando lá embaixo. Dá para ver a fumaça.'}},
 ],1),
 'voice-signal':beat('voice-signal',[
  {duration:3.5,kind:'side',tone:'odd',light:{exposure:.9},caption:{speaker:'voice',text:'…ele é teimoso… …mas chega…'}},
  {duration:4,kind:'ahead',tone:'odd',light:{exposure:.92},caption:{speaker:'dante',text:'Teimoso. É o que eu digo do Titã. Ninguém mais diz isso.'}},
  {duration:4.1,kind:'crane',tone:'ash',light:{exposure:.97},caption:{speaker:'renata',text:'Dante? Perdi você por um instante. Tem mais alguém nesta frequência?'}},
 ],0),
 'horizon-eve':beat('horizon-eve',[
  {duration:4.5,kind:'crane',tone:'garage',light:{exposure:1.02},card:{kicker:'Capítulo 5',text:'Horizonte'}},
  {duration:6.8,kind:'horizon',tone:'plasma',light:{exposure:.95},caption:{speaker:'renata',text:'Seis campos ancorados. O último fica depois das frentes de plasma. Tenho medo de quando a Rede fechar o circuito.'}},
  {duration:4,kind:'side',tone:'garage',light:{exposure:1},caption:{speaker:'dante',text:'Seis vezes alguém me disse que não dava. O Titã ainda está aqui.'}},
 ],1),
};
for(const def of Object.values(CAMPAIGN_BEATS))CUTSCENES[def.id]=def;
export const CAMPAIGN_BEAT_IDS=Object.keys(CAMPAIGN_BEATS);

/** Session memory for transition triggers (never saved). */
export function createBeatMemory(){return {init:false,resync:0,region:null,chapter:null,fragments:new Set(),pending:[]};}
/** Marks the next observation as a baseline: loading a save or a diagnostic teleport never triggers a scene. */
export function resyncBeats(mem){mem.resync=RESYNC_FRAMES;}
/** Observations taken as baseline after a load/teleport (the region is recomputed a frame later). */
export const RESYNC_FRAMES=5;
/** Accepting the first Seed opens the channel: the scene plays when the radio panel closes. */
export function noteFirstContact(mem,c){if(c?.flags?.renataContact&&!sceneSeen(c,'first-contact')&&!mem.pending.includes('first-contact'))mem.pending.push('first-contact');}

/** Pure: compares the campaign with the last observation and queues scenes for real transitions. */
export function observeBeats(mem,c,region){
 const chapter=chapterOf(c),fragments=new Set(c?.flags?.voiceFragments||[]);
 const add=id=>{if(!sceneSeen(c,id)&&!mem.pending.includes(id))mem.pending.push(id);};
 if(!mem.init||mem.resync>0){mem.init=true;mem.resync=Math.max(0,mem.resync-1);mem.region=region;mem.chapter=chapter;mem.fragments=fragments;return mem.pending;}
 if(region!==mem.region){if(region==='cities'&&chapter==='ch2')add('skeleton-discovery');mem.region=region;}
 if(chapter!==mem.chapter){if(chapter==='ch5'&&mem.chapter==='ch4')add('horizon-eve');mem.chapter=chapter;}
 if(fragments.has('signal-stubborn')&&!mem.fragments.has('signal-stubborn'))add('voice-signal');
 mem.fragments=fragments;return mem.pending;
}
/** Pure: the next pending scene can start now (free play, nothing open). */
export function beatDue(mem,c,where){
 if(!mem.pending.length||!['walking','driving'].includes(where?.mode)||where.overlay)return null;
 while(mem.pending.length&&sceneSeen(c,mem.pending[0]))mem.pending.shift();
 return mem.pending[0]||null;
}

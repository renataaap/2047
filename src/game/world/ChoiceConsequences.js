import * as THREE from 'three';
import {SHELTERS} from '../../data/network.js';
import {heightAt} from './terrain.js';
import {bevelGeometry} from '../render/materials.js';
import {choiceOf} from '../narrative/story.js';

// Story 007 (brief MVP 8): consequências visíveis e persistentes das três escolhas.
// Puramente visual e derivado do estado salvo (campaign.story.choices): sem colisores, sem
// mudar terreno, física, missões, tuning ou componentes. Materiais só de cor (zero samplers novos,
// fora do orçamento do TerrainBlend). Cada ramo tem um cenário próprio; sem escolha, nada aparece.
// Os conjuntos ficam longe da pista (a estrada passa a 20+ m dos abrigos) e são montados só
// quando Dante chega perto, uma vez por local.
export const CONSEQUENCES={
 'ch2-water-share':{site:'lia',options:['share','keep']},
 'ch3-brutus-toll':{site:'afonso',options:['pay','refuse','water']},
 'ch4-titan-part':{site:'noemia',options:['give','keep']},
};
const BUILD_RADIUS=420;

/** Which branch is visible for each choice (null when not decided). Pure. */
export function consequenceState(c){const out={};for(const [id,d] of Object.entries(CONSEQUENCES)){const o=choiceOf(c,id);out[id]=d.options.includes(o)?o:null;}return out;}

export class ChoiceConsequences{
 /** @param {THREE.Scene} scene @param {object} m shared materials (rust/steel/dark/paint) */
 constructor(scene,m){
  this.scene=scene;this.m=m;this.sites=new Map();this.last={};
  const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.8,...extra});
  this.own={water:mat(0x3f6f86,{roughness:.35}),cloth:mat(0x8a2f24),green:mat(0x56703a),soil:mat(0x4a3b2c),lamp:mat(0x2b2b2b,{emissive:0x9fd8ff,emissiveIntensity:1.6}),fire:mat(0x2a1d16,{emissive:0xd8742c,emissiveIntensity:1.1})};
 }
 /** Builds sites near Dante once and shows the branch saved in the campaign. */
 update(c,focus){
  for(const [id,d] of Object.entries(CONSEQUENCES)){
   const s=SHELTERS.find(x=>x.id===d.site);if(!s)continue;
   if(!this.sites.has(id)&&Math.hypot(focus.x-s.x,focus.z-s.z)<BUILD_RADIUS)this.sites.set(id,this.build(id,s));
  }
  const state=consequenceState(c);
  for(const [id,site] of this.sites)for(const [option,group] of Object.entries(site.branches))group.visible=state[id]===option;
  this.last=state;
 }
 build(id,s){
  const root=new THREE.Group();root.name=`Consequência ${id}`;this.scene.add(root);const branches={};
  const branch=name=>{const g=new THREE.Group();g.name=`${id}:${name}`;g.visible=false;root.add(g);branches[name]=g;return g;};
  const put=(g,geo,mat,x,y,z,ry=0,rx=0,rz=0)=>{const o=new THREE.Mesh(geo,mat);o.position.set(s.x+x,heightAt(s.x+x,s.z+z)+y,s.z+z);o.rotation.set(rx,ry,rz);o.castShadow=o.receiveShadow=true;g.add(o);return o;};
  const drum=(g,x,z,mat,tipped=false)=>put(g,new THREE.CylinderGeometry(.42,.42,1.1,12),mat,x,tipped?.42:.55,z,0,0,tipped?Math.PI/2:0);
  const {rust,steel,dark,paint}=this.m,{water,cloth,green,soil,lamp,fire}=this.own;
  if(id==='ch2-water-share'){// Lia: lado oeste do abrigo, longe da estrada.
   const share=branch('share');// cisterna cheia, horta em vasos e varal: o abrigo voltou a viver
   for(let i=0;i<3;i++)drum(share,-8,-2+i*1.1,water);put(share,bevelGeometry(2.6,.12,1.2),steel,-8,1.15,-1,0);
   for(let i=0;i<5;i++){put(share,new THREE.CylinderGeometry(.32,.26,.45,10),soil,-10.5,.22,-3+i*1.2);put(share,new THREE.SphereGeometry(.38,8,6),green,-10.5,.62,-3+i*1.2);}
   for(const z of [2,5])put(share,new THREE.CylinderGeometry(.05,.05,2.2,6),steel,-9,1.1,z);put(share,new THREE.BoxGeometry(.05,.6,2.9),cloth,-9,1.6,3.5);
   const keep=branch('keep');// tambores vazios tombados e a fila de galões secos
   drum(keep,-8,-1.5,rust,true);drum(keep,-8.4,.2,dark,true);drum(keep,-7.6,1.6,rust);
   for(let i=0;i<6;i++)put(keep,bevelGeometry(.35,.5,.25),dark,-10,.25,-2.5+i*.7,i*.3);
  }else if(id==='ch3-brutus-toll'){// Afonso/Garcia: além do ponto de Garcia, longe da pista.
   const mast=(g,x,z,mat)=>{put(g,new THREE.CylinderGeometry(.07,.09,4.2,6),steel,x,2.1,z);return put(g,new THREE.BoxGeometry(.04,.9,1.4),mat,x,3.6,z+.7);};
   const pay=branch('pay');// bandeira de Garcia hasteada junto à bomba: o pedágio virou regra
   mast(pay,11,7,cloth);put(pay,bevelGeometry(3.2,.18,.18),paint,12.5,1.1,9);put(pay,bevelGeometry(.25,1.1,.25),dark,11,.55,9);put(pay,bevelGeometry(.25,1.1,.25),dark,14,.55,9);
   const refuse=branch('refuse');// barreira derrubada, pneus queimando: Garcia não esqueceu
   put(refuse,bevelGeometry(3.2,.18,.18),paint,12.5,.25,9,.35);for(const [x,z] of [[11,10.5],[13.6,10.8],[12.2,11.9]]){put(refuse,new THREE.TorusGeometry(.42,.16,6,12),dark,x,.17,z,0,Math.PI/2);}
   put(refuse,new THREE.SphereGeometry(.3,8,6),fire,12.3,.4,11.2);
   const water=branch('water');// tambores de água entregues e a bandeira baixada: trégua
   for(let i=0;i<4;i++)drum(water,10.5+i*1.1,8.5,this.own.water);put(water,new THREE.CylinderGeometry(.07,.09,4.2,6),steel,11,2.1,11);put(water,new THREE.BoxGeometry(.04,.9,1.4),cloth,11,1.2,11.7,0,0,.25);
  }else if(id==='ch4-titan-part'){// Noêmia: repetidor de reserva além do mastro (x+8), fora da parede leste (x+5).
   const give=branch('give');// segundo repetidor de pé, com a peça do Titã e a luz de sinal acesa
   put(give,new THREE.CylinderGeometry(.12,.16,9,8),steel,11,4.5,5);put(give,new THREE.TorusGeometry(1.1,.08,4,14),rust,11,8.4,5);put(give,bevelGeometry(.9,.6,.5),dark,11,.3,5.6);
   put(give,new THREE.SphereGeometry(.16,8,6),lamp,11,9.1,5);put(give,bevelGeometry(1.2,.28,.6),steel,11,.75,5.6);// a colmeia do radiador
   const keep=branch('keep');// o repetidor de reserva continua no chão, desmontado
   put(keep,new THREE.CylinderGeometry(.12,.16,9,8),steel,11,.2,5,0,0,Math.PI/2);put(keep,new THREE.TorusGeometry(1.1,.08,4,14),rust,15.4,.12,5.6,0,Math.PI/2);put(keep,bevelGeometry(.9,.6,.5),dark,9.6,.3,6.2,.6);
  }
  return {root,branches};
 }
 snapshot(){const out={};for(const [id,site] of this.sites)out[id]=Object.entries(site.branches).find(([,g])=>g.visible)?.[0]||null;return {built:[...this.sites.keys()],visible:out};}
 dispose(){for(const {root} of this.sites.values()){root.removeFromParent();root.traverse(o=>o.geometry?.dispose());}this.sites.clear();Object.values(this.own).forEach(m=>m.dispose());}
}

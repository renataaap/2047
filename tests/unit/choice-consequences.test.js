import {test,expect} from 'vitest';
import * as THREE from 'three';
import {ChoiceConsequences,CONSEQUENCES,consequenceState} from '../../src/game/world/ChoiceConsequences.js';
import {CHOICES} from '../../src/data/story.js';
import {SHELTERS} from '../../src/data/network.js';
import {ensureStory} from '../../src/game/narrative/story.js';
import {createCampaign} from '../../src/game/missions/campaign.js';
import {roadX} from '../../src/game/world/terrain.js';

// Story 007: consequências visíveis das escolhas, derivadas do save.
const m={rust:new THREE.MeshStandardMaterial(),steel:new THREE.MeshStandardMaterial(),dark:new THREE.MeshStandardMaterial(),paint:new THREE.MeshStandardMaterial()};
const campaign=choices=>{const c=createCampaign(7);Object.assign(ensureStory(c).choices,choices);return c;};
const site=id=>SHELTERS.find(s=>s.id===CONSEQUENCES[id].site);

test('cobre as três escolhas existentes, com um cenário por opção',()=>{
 expect(Object.keys(CONSEQUENCES).sort()).toEqual(Object.keys(CHOICES).sort());
 for(const [id,d] of Object.entries(CONSEQUENCES))expect(d.options.sort()).toEqual(Object.keys(CHOICES[id].options).sort());
 expect(consequenceState(createCampaign(1))).toEqual({'ch2-water-share':null,'ch3-brutus-toll':null,'ch4-titan-part':null});
});

test('cada ramo aparece só com a sua escolha; sem escolha, nada; persistido pelo save (derivado)',()=>{
 for(const [id,d] of Object.entries(CONSEQUENCES))for(const option of d.options){
  const scene=new THREE.Scene(),w=new ChoiceConsequences(scene,m),s=site(id),c=campaign({[id]:option});
  w.update(c,{x:s.x,z:s.z});expect(w.snapshot().visible[id]).toBe(option);
  const reloaded=JSON.parse(JSON.stringify(c));w.update(reloaded,{x:s.x,z:s.z});expect(w.snapshot().visible[id]).toBe(option);
  w.update(createCampaign(2),{x:s.x,z:s.z});expect(w.snapshot().visible[id]).toBeNull();
  w.dispose();
 }
});

test('ramos opostos são cenários distintos',()=>{
 for(const [id,d] of Object.entries(CONSEQUENCES)){
  const s=site(id),w=new ChoiceConsequences(new THREE.Scene(),m);w.update(createCampaign(3),{x:s.x,z:s.z});
  const sig=d.options.map(o=>w.sites.get(id).branches[o].children.map(o=>`${o.geometry.type}@${o.position.toArray().map(v=>v.toFixed(1))}`).join('|'));
  expect(new Set(sig).size).toBe(d.options.length);w.dispose();
 }
});

test('só visual: sem colisores, longe da pista e montado apenas perto do local',()=>{
 const scene=new THREE.Scene(),w=new ChoiceConsequences(scene,m);w.update(createCampaign(4),{x:0,z:0});expect(w.snapshot().built).toEqual([]);
 for(const [id] of Object.entries(CONSEQUENCES)){const s=site(id);w.update(createCampaign(4),{x:s.x,z:s.z});
  w.sites.get(id).root.traverse(o=>{if(!o.isMesh)return;expect(o.userData.entityType).toBeUndefined();expect(Math.abs(o.position.x-roadX(o.position.z))).toBeGreaterThan(8);
   const mats=Array.isArray(o.material)?o.material:[o.material];for(const mat of mats)for(const k of ['map','normalMap','roughnessMap','metalnessMap','aoMap','emissiveMap'])expect(mat[k]??null).toBeNull();});
 }
 w.dispose();
});

test('não toca em componentes, inventário ou escolhas',()=>{
 const c=campaign({'ch4-titan-part':'give'}),before=JSON.stringify(c),s=site('ch4-titan-part'),w=new ChoiceConsequences(new THREE.Scene(),m);
 w.update(c,{x:s.x,z:s.z});expect(JSON.stringify(c)).toBe(before);w.dispose();
});

import {describe,it,expect} from 'vitest';
import {createCampaign,receiveSeed,calibrate} from '../../src/game/missions/campaign.js';
import {upgradeCampaign,syncFirst} from '../../src/game/missions/network.js';
import {RoadController} from '../../src/game/missions/RoadController.js';
import {ROAD_POINTS} from '../../src/data/road.js';

describe('reprodução das falhas relatadas',()=>{
 it('calibra com peças da mochila sem criar outro inventário',()=>{
  const c=upgradeCampaign(createCampaign());receiveSeed(c);syncFirst(c);c.seed.integrity=60;c.network.seeds['core-1'].integrity=60;c.inventory.truck.parts=0;c.inventory.player.parts=2;
  expect(calibrate(c,{usePlayer:true,useTruck:false})).toBe(true);expect(c.seed.integrity).toBe(80);expect(c.inventory.player.parts).toBe(0);
 });
 it('identifica a bomba como objeto próprio, além de Zeca',()=>{
  const point=ROAD_POINTS.find(p=>p.id==='posto-boa-viagem'),g={player:{body:{translation:()=>point.pump}},current:point.pump,state:{speed:0,engineOn:false}};
  const target=new RoadController(g).target();expect(target.type).toBe('pump');expect(target.text).toBe('Abastecer caminhão');
 });
});

import {calibrationStatus} from '../../src/game/missions/seedService.js';
import {activateCore,clone} from '../../src/game/missions/campaign.js';
import {anchor,calibrateNetwork,openVault} from '../../src/game/missions/network.js';
import {validSave} from '../../src/game/persistence/schema.js';
import {InteractionResolver} from '../../src/game/interactions/InteractionResolver.js';
const damaged=()=>{const c=upgradeCampaign(createCampaign(1510));receiveSeed(c);syncFirst(c);c.seed.integrity=c.network.seeds['core-1'].integrity=70;c.inventory.player.parts=2;c.inventory.truck.parts=2;return c;};
const context={usePlayer:true,useTruck:true,atTerminal:true,engineOff:true,parked:true};
const saved=c=>({schemaVersion:3,truck:{position:[7,2,-2880],rotation:[0,0,0,1]},player:{position:[23,1,-2882]},context:'walking',fuel:4,temperature:26,engineOn:false,campaign:clone(c)});
describe('calibração acessível, sem pagamento parcial ou Semente duplicada',()=>{
 for(const [player,truck] of [[2,0],[0,2],[1,1]])it(`paga exatamente duas peças: mochila ${player}, Titã ${truck}`,()=>{const c=damaged();c.inventory.player.parts=player;c.inventory.truck.parts=truck;expect(calibrate(c,context)).toBe(true);expect(c.inventory.player.parts+c.inventory.truck.parts).toBe(0);expect(c.seed.integrity).toBe(90);expect(c.network.seeds['core-1'].integrity).toBe(90);});
 for(const [change,code] of [[{engineOff:false},'engine'],[{parked:false},'parking'],[{atTerminal:false},'terminal'],[{usePlayer:false,useTruck:false},'parts']])it(`recusa ${code} sem consumir`,()=>{const c=damaged(),before=clone(c);expect(calibrationStatus(c,'core-1',{...context,...change}).code).toBe(code);expect(calibrate(c,{...context,...change})).toBe(false);expect(c).toEqual(before);});
 it('estoque insuficiente e peças distantes não são acessíveis',()=>{const c=damaged();c.inventory.player.parts=1;const before=clone(c);expect(calibrate(c,{...context,useTruck:false})).toBe(false);expect(c).toEqual(before);c.inventory.truck.parts=0;expect(calibrate(c,context)).toBe(false);expect(c.inventory.player.parts).toBe(1);});
 it('100% não cobra; ativada não reaparece no terminal',()=>{const c=damaged();c.seed.integrity=c.network.seeds['core-1'].integrity=100;const before=clone(c.inventory);expect(calibrationStatus(c,'core-1',context).code).toBe('full');expect(calibrate(c,context)).toBe(false);expect(anchor(c,'core-1').success).toBe(true);expect(calibrationStatus(c,'core-1',context).code).toBe('consumed');expect(calibrate(c,context)).toBe(false);expect(c.inventory).toEqual(before);expect(c.network.cargo).toBeNull();expect(openVault(c,'core-2')).toBe(true);expect(calibrate(c,context)).toBe(false);});
 it('save danificado → falha real → save → calibrar → sucesso → save',()=>{
  const original=damaged();expect(validSave(saved(original))).toBe(true);const c=upgradeCampaign(saved(original).campaign);const failed=anchor(c,'core-1');expect(failed.success).toBe(false);expect(c.seed.integrity).toBe(62);expect(c.network.cargo).toBe('core-1');expect(validSave(saved(c))).toBe(true);
  const resumed=upgradeCampaign(saved(c).campaign);expect(calibrate(resumed,context)).toBe(true);expect(resumed.seed.integrity).toBe(82);expect(anchor(resumed,'core-1').success).toBe(true);expect(validSave(saved(resumed))).toBe(true);const final=upgradeCampaign(saved(resumed).campaign);expect(final.network.cargo).toBeNull();expect(final.cores['core-1'].state).toBe('active');expect(calibrate(final,context)).toBe(false);
 });
 it('a mesma regra e os mesmos inventários calibram Núcleos seguintes',()=>{const c=damaged();calibrate(c,context);anchor(c,'core-1');openVault(c,'core-2');c.seed.integrity=c.network.seeds['core-2'].integrity=60;c.inventory.player.parts=2;c.inventory.truck.parts=0;expect(calibrateNetwork(c,'core-2',context)).toBe(true);expect(c.network.seeds['core-2'].integrity).toBe(80);expect(c.inventory.player.parts).toBe(0);expect(anchor(c,'core-2').success).toBe(true);expect(calibrateNetwork(c,'core-2',context)).toBe(false);});
});
describe('alvos individuais: distância, olhar, visibilidade e execução estável',()=>{
 const targets=[{key:'npc:zeca',type:'npc',position:{x:0,z:-2},range:4.5,priority:25},{key:'pump:posto',type:'pump',position:{x:4,z:-2},range:3,priority:23}];
 it('distingue todos os NPCs da Estrada Viva e suas bombas',()=>{const r=new RoadController({state:{engineOn:false,speed:0},current:{x:0,z:0}}),all=r.candidates();for(const p of ROAD_POINTS){const npc=all.find(t=>t.key===`npc:${p.id}`);expect(npc.text).toBe(`Falar com ${p.npc}`);expect(npc.position).toEqual(p.talk);if(p.kind==='gas')expect(all.find(t=>t.key===`pump:${p.id}`).position).toEqual(p.pump);}});
 it('seleciona NPC, troca perto da bomba e respeita paredes e direção',()=>{const r=new InteractionResolver();expect(r.select(targets,{x:0,z:0,yaw:0},()=>true).key).toBe('npc:zeca');expect(r.select(targets,{x:4,z:-2,yaw:0},()=>true).key).toBe('pump:posto');expect(r.select(targets,{x:0,z:0,yaw:0},()=>false)).toBeNull();expect(r.select([targets[0]],{x:0,z:-5,yaw:0},()=>true)).toBeNull();});
 it('F executa a entidade publicada; alvo oculto ou fora de alcance cancela',()=>{const r=new InteractionResolver(),observer={x:0,z:0,yaw:0};r.select(targets,observer,()=>true);let executed;expect(r.execute('pump:posto',observer,()=>true,t=>executed=t)).toBe(false);expect(r.execute('npc:zeca',observer,()=>true,t=>executed=t)).toBe(true);expect(executed.key).toBe('npc:zeca');expect(r.execute('npc:zeca',{x:0,z:10},()=>true,()=>{})).toBe(false);expect(r.execute('npc:zeca',observer,()=>false,()=>{})).toBe(false);});
});

import {beforeAll} from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import {targetVisible} from '../../src/game/interactions/visibility.js';
beforeAll(async()=>{await RAPIER.init();});
it('raycast aceita o próprio Titã e rejeita uma parede, mesmo junto ao alvo',()=>{
 const w=new RAPIER.World({x:0,y:0,z:0}),body=w.createRigidBody(RAPIER.RigidBodyDesc.fixed());body.userData={interactionKey:'truck:titan'};w.createCollider(RAPIER.ColliderDesc.cuboid(1.4,1.5,3).setTranslation(0,1,0),body);w.step();const at={x:-3,y:1.5,z:0},target={key:'truck:titan',position:{x:0,y:1,z:0}};expect(targetVisible(w,at,target)).toBe(true);w.createCollider(RAPIER.ColliderDesc.cuboid(.05,2,2).setTranslation(-.4,1,0));w.step();expect(targetVisible(w,at,target)).toBe(false);w.free();
});

import {truckEntryTarget} from '../../src/game/interactions/truckEntryTarget.js';
import {eligible} from '../../src/game/interactions/InteractionResolver.js';
it('retorno rápido usa a porta junto à cabine, inclusive com o Titã girado',()=>{
 const p={x:0,y:0,z:5},q={x:0,y:0,z:0,w:1},observer={x:-2.8,z:2.5,yaw:0},t=truckEntryTarget(p,q,observer,'Entrar');expect(t.position).toEqual({x:-2.1,y:.75,z:2.5});expect(eligible(t,observer)).toBe(true);
 const rotated=truckEntryTarget({x:10,y:0,z:20},{x:0,y:Math.sin(Math.PI/4),z:0,w:Math.cos(Math.PI/4)},{x:7.5,z:22.8,yaw:Math.PI});expect(rotated.position.x).toBeCloseTo(7.5);expect(rotated.position.z).toBeCloseTo(22.1);
});

import {it,expect} from 'vitest';
import {NetworkController} from '../../src/game/missions/NetworkController.js';
import {createCampaign} from '../../src/game/missions/campaign.js';
import {upgradeCampaign} from '../../src/game/missions/network.js';
import {SHELTERS,CORES} from '../../src/data/network.js';
import {relationOf} from '../../src/game/narrative/story.js';
function game(site,n){const c=upgradeCampaign(createCampaign());for(const k of CORES.slice(0,n))c.cores[k.id].state='active';const s=SHELTERS.find(x=>x.id===site);const saves=[];
 const g={campaign:c,state:{networkPoint:site,overlay:'network',speed:0,engineOn:false},context:()=>'walking',player:{body:{translation:()=>({x:s.x,y:0,z:s.z-1})}},current:{x:s.x+400,y:0,z:s.z},checkpoint:n=>saves.push(n)};return {g,c,saves};}
it('Lia: a escolha da água é aplicada uma vez, cobra da mochila, salva e muda a relação',()=>{const {g,c,saves}=game('lia',1);const ctl=new NetworkController(g);c.inventory.player.water=3;c.network.quests.supply='completed';expect(ctl.action('storyChoice',{id:'ch2-water-share',option:'share'})).toBe(true);expect(c.inventory.player.water).toBe(1);expect(saves.length).toBe(1);expect(relationOf(c,'lia')).toBe('ally');expect(ctl.action('storyChoice',{id:'ch2-water-share',option:'keep'})).toBe(false);expect(c.story.choices['ch2-water-share']).toBe('share');});
it('escolha só vale no abrigo certo e no capítulo certo',()=>{const early=game('lia',0);expect(new NetworkController(early.g).action('storyChoice',{id:'ch2-water-share',option:'share'})).toBe(false);const wrong=game('noemia',1);expect(new NetworkController(wrong.g).action('storyChoice',{id:'ch2-water-share',option:'share'})).toBe(false);});
it('opções que usam o caminhão exigem o Titã estacionado perto',()=>{const {g,c}=game('afonso',3);const ctl=new NetworkController(g);c.inventory.truck.water=4;expect(ctl.action('storyChoice',{id:'ch3-brutus-toll',option:'water'})).toBe(false);expect(ctl.failureReason).toMatch(/Estacione/);expect(c.story?.choices?.['ch3-brutus-toll']).toBeUndefined();});

import {choose} from '../narrative/story.js';
import {CHOICES,CHOICE_SCENES} from '../../data/story.js';
import {calibrationStatus} from './seedService.js';
import { NETWORK_POINTS,ROUTES,CORES } from '../../data/network.js';
import { near } from './campaign.js';
import { openVault,anchor,calibrateNetwork,questAction,networkLoot,networkBuy } from './network.js';
import { rest } from '../survival/expedition.js';

export function interactionPoint(p){return {x:p.kind==='vault'||p.kind==='network-core'?p.x-1:p.x,z:p.z+(p.kind==='vault'?6:p.kind==='network-core'?8:p.kind==='shelter'?-1:0)};}
export class NetworkController {
constructor(game){this.g=game;}
candidates(){return NETWORK_POINTS.map(p=>({id:'network',key:`${p.kind==='shelter'?'npc':p.kind}:${p.id}`,type:p.kind==='shelter'?'npc':p.kind==='network-core'?'terminal':p.kind,point:p.id,position:interactionPoint(p),range:p.kind==='network-core'?5:4,priority:p.kind==='shelter'?25:20,text:p.kind==='shelter'?`Falar com ${p.npc}`:p.name}));}
target(){const p=this.g.player.body.translation();return this.candidates().find(k=>near(p,k.position,k.range))||null;}
calibration(p){const g=this.g,player=g.player.body.translation();return calibrationStatus(g.campaign,p.core,{usePlayer:true,useTruck:near(player,g.current,40),atTerminal:near(player,interactionPoint(p),5),engineOff:!g.state.engineOn,parked:this.parked(p)});}
parked(p){const g=this.g,delivery=p.kind==='network-core'?{x:p.x-14,z:p.z+10}:p;return !g.state.engineOn&&g.state.speed<.6&&near(g.current,delivery,p.kind==='network-core'?15:35);}
action(type,payload){if(!['openVault','networkCalibrate','networkActivate','networkLoot','networkBuy','questAccept','questComplete','questDefer','networkRest','networkPlan','storyChoice'].includes(type))return undefined;
const g=this.g,c=g.campaign;this.failureReason='';
if(type==='networkPlan'){const r=ROUTES.find(r=>r.id===payload?.id);if(!r||!['safe','short'].includes(payload.path))return false;c.network.routes[r.id]=payload.path;return true;}
const p=NETWORK_POINTS.find(p=>p.id===g.state.networkPoint);if(!p||g.context()!=='walking'||g.state.overlay!=='network'||!near(g.player.body.translation(),interactionPoint(p),p.kind==='network-core'?5:4))return false;
let ok=false;
if(type==='openVault'&&p.kind==='vault'&&this.parked(p)){ok=openVault(c,p.core);if(ok)g.resetCargo();}
if(type==='networkCalibrate'&&p.kind==='network-core'){const status=this.calibration(p);ok=calibrateNetwork(c,p.core,{...status.access,atTerminal:status.code!=='terminal',engineOff:!g.state.engineOn,parked:this.parked(p)});this.failureReason=ok?'':status.message;}
if(type==='networkActivate'&&p.kind==='network-core'&&this.parked(p)){const result=anchor(c,p.core);ok=!!result;if(ok){g.state.activationResult={...result,core:p.core};if(result.success)g.restoration?.cinematic.queue(p.core);}}
if(type==='networkLoot'&&p.kind==='cache')ok=networkLoot(c,p.id);
if(type==='networkBuy'&&p.kind==='shelter')ok=networkBuy(c,p.id,payload);
if(type==='networkRest'&&p.kind==='shelter')ok=rest(c);
if(type==='questDefer'&&p.quest&&p.kind==='shelter'){const key=`quest-${p.quest}-deferred`;if(!c.decisions.includes(key))c.decisions.push(key);ok=true;}
if(type==='storyChoice'&&p.kind==='shelter'&&CHOICE_SCENES[payload?.id]?.site===p.id){const opts=Object.values(CHOICES[payload.id].options),needsTruck=opts.some(o=>o.cost?.bag==='truck'||o.component);if(!needsTruck||this.parked(p)){const r=choose(c,payload.id,payload.option);ok=r.ok;if(!ok)this.failureReason=r.message;}else this.failureReason='Estacione o caminhão perto do abrigo, desligue o motor e volte a pé.'}
if(['questAccept','questComplete'].includes(type)&&p.kind==='shelter'&&p.quest&&(p.quest==='supply'||this.parked(p)))ok=questAction(c,p.quest,type==='questAccept'?'accept':'complete');
if(ok&&['openVault','networkActivate','questComplete','storyChoice'].includes(type))g.checkpoint(10+(CORES.find(k=>k.id===p.core)?.number||0));
return ok;
}
}
import {restoreState} from '../persistence/restore.js';
import * as THREE from 'three';
import {LOGISTICS_SITES} from '../../data/contracts.js';
import {ensureLogistics,refreshOffers,offerDetails,acceptContract,loadContract,completeContract,cancelContract,parkingGate,deliveryQuote,contractTarget,contractRoutes,stepLogistics,siteUnlocked} from './contracts.js';
import {commercialPayload,capacity,seedOnBoard,suppliesMass} from './manifest.js';
import {cargoDamage} from '../cargo/integrity.js';
export class LogisticsController {
 constructor(game){this.game=game;this.reset();ensureLogistics(game.campaign);}
 reset(){this.site=null;this.message='';this.busy=false;this.sample={filtered:[0,0,0]};this.routes=[];this.routeKey='';}
 candidates(){const g=this.game;return Object.values(LOGISTICS_SITES).filter(s=>siteUnlocked(g.campaign,s)).map(s=>({id:'logistics',key:`logistics:${s.id}`,type:'equipment',site:s.id,position:{...s.terminal,y:g.world.groundHeight(s.terminal.x,s.terminal.z)+1.4},range:3.8,priority:30,text:s.board?`Consultar fretes · ${s.name}`:'Depósito · devolver mercadoria'}));}
 access(){const g=this.game,s=LOGISTICS_SITES[this.site],p=g.player.body.translation();return !!s&&g.context()==='walking'&&g.state.overlay==='contracts'&&siteUnlocked(g.campaign,s)&&Math.hypot(p.x-s.terminal.x,p.z-s.terminal.z)<3.8&&g.visibleTarget({key:`logistics:${s.id}`,position:{...s.terminal,y:g.world.groundHeight(s.terminal.x,s.terminal.z)+1.4}});}
 gate(){const g=this.game;return parkingGate(LOGISTICS_SITES[this.site],g.current,new THREE.Euler().setFromQuaternion(g.currentQ,'YXZ').y,g.state,g.activeVehicleId);}
 open(site){const g=this.game;this.site=site;if(LOGISTICS_SITES[site]?.board)refreshOffers(g.campaign,site);this.message=site?'Estacione na faixa, desligue o motor e confira o manifesto.':'Caderno profissional. Procure um quadro físico para contratar ou operar a carga.';this.refreshRoutes();g.openPanel('contracts');}
 mass(){const g=this.game,t=g.vehicle.tuning,c=g.campaign;return t.chassisMass+(seedOnBoard(c)?t.seedMass:0)+suppliesMass(c.inventory.truck)+this.payload().mass+Math.max(0,g.state.fuel||0)*t.engine.dieselKgPerLiter;}
 refreshRoutes(){const g=this.game,a=g.campaign.logistics?.active;this.routes=contractRoutes(g.campaign,g.current,this.mass());this.routeKey=`${a?.id}/${a?.state}`;}
 step(dt,accel,impact){const g=this.game,l=g.campaign.logistics,m=l?.cargo,target=contractTarget(g.campaign),yaw=new THREE.Euler().setFromQuaternion(g.currentQ,'YXZ').y;
  const damage=m&&g.cargoGrace<=0?cargoDamage(this.sample,accel,impact,dt,g.campaign.components.suspension*.7+g.campaign.components.frame*.3):0;
  const metres=Math.hypot(g.current.x-g.previous.x,g.current.z-g.previous.z);
  stepLogistics(g.campaign,dt,metres,damage,!!target&&parkingGate(target,g.current,yaw,g.state,g.activeVehicleId).ok);
 }
 payload(){return commercialPayload(this.game.campaign,this.game.activeVehicleId);}
 async action(type,payload){
  const g=this.game,c=g.campaign,l=ensureLogistics(c);
  if(type==='contractFocus'){l.focus=payload==='contract'&&l.active?'contract':'campaign';g.navigation.route=null;g.emit();return true;}
  if(type==='contractProfile'){if(!['safe','fast','economy'].includes(payload))return false;l.preference=payload;l.focus=l.active?'contract':'campaign';g.navigation.route=null;g.emit();return true;}
  if(this.busy||g.state.saving||g.garage?.busy)return false;
  if(type!=='contractCancel'&&!this.access()||type==='contractCancel'&&l.cargo&&!this.access()){this.message='Procure o terminal logístico e interaja com F. O caderno remoto só permite consultar o frete.';g.emit();return false;}
  if(!g.saves.slot){this.message='É necessário um slot livre ou uma partida carregada para confirmar o frete.';g.emit();return false;}
  const backup=structuredClone(c);this.busy=true;let result;
  try{
   if(type==='contractAccept')acceptContract(c,this.site,payload,g.activeVehicleId);
   else if(type==='contractLoad'){loadContract(c,this.site,g.activeVehicleId,this.gate());this.sample.filtered=[0,0,0];g.resetCargo();}
   else if(type==='contractDeliver')result=completeContract(c,this.site,this.gate());
   else if(type==='contractCancel')cancelContract(c,this.site,this.gate());
   else throw Error('Operação de frete desconhecida.');
   if(!await g.save())throw Error('A gravação falhou. A operação foi desfeita; nenhum pagamento foi confirmado.');
   this.message=result?result.failed?'Perda registrada e salva. Nenhum pagamento concedido.':`Entrega salva. Pagamento: ${Object.entries(result.reward).filter(([,n])=>n).map(([k,n])=>`${n} ${k==='scrap'?(n===1?'material recuperado':'materiais recuperados'):(n===1?'peça':'peças')}`).join(' + ')} · ${result.xp} XP.`:type==='contractLoad'?'Carga lacrada e salva no caminhão. Confira o peso e siga o GPS.':type==='contractCancel'?'Frete encerrado e salvo. Mercadoria devolvida, sem pagamento ou XP.':'Contrato aceito e salvo. Siga até a área de coleta.';
   if(this.site)refreshOffers(c,this.site);g.ambientAudio?.cue('door',g.current);this.refreshRoutes();return true;
  }catch(e){restoreState(c,backup);this.message=e.message;this.refreshRoutes();return false;}
  finally{this.busy=false;g.cargoVisual?.update(0);g.emit();}
 }
 snapshot(){const g=this.game,c=g.campaign,l=c.logistics;if(!l)return null;const a=l.active,detail=a?offerDetails(c,a):null,s=LOGISTICS_SITES[this.site];
  return {site:this.site,siteName:s?.name||'Caderno profissional',contractor:s?.contractor||'',theme:s?.theme||'',access:!!g.player&&this.access(),busy:this.busy,message:this.message,offers:(l.offers[this.site]||[]).map(o=>offerDetails(c,o)),active:detail,cargo:l.cargo,target:contractTarget(c),gate:this.site?this.gate():{ok:false,message:'Consulte o quadro no depósito.'},delivery:this.site?deliveryQuote(c,this.site,this.gate()):null,capacity:detail?capacity(c,g.activeVehicleId,detail.cargo,detail.quantity):null,routes:this.routes,clock:l.clock,history:l.history,career:c.career,focus:l.focus,preference:l.preference};
 }
}

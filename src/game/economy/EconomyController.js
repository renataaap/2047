import {restoreState} from '../persistence/restore.js';
export const TRADE_ACTIONS=['roadGas','roadShopBuy','roadService','roadSell','networkBuy','buy','sell'];
// Existing controllers still validate the actual NPC/pump and physical access.
// This wrapper adds a serialized optimistic save and rolls back the whole trade.
export class EconomyController {
 constructor(game){this.game=game;this.busy=false;this.applying=false;}
 async transact(type,payload){const g=this.game;if(this.busy||g.logistics?.busy||g.garage?.busy||g.state.saving)return false;
  if(!g.saves.slot){g.state.notice='É necessário um slot livre ou uma partida carregada para confirmar a troca.';g.emit();return false;}
  const backup=structuredClone(g.campaign),fuel=g.state.fuel,temperature=g.state.temperature;this.busy=true;
  try{this.applying=true;const ok=g.action(type,payload);this.applying=false;if(!ok)return false;
   if(!await g.save())throw Error('Falha ao gravar a troca. Recursos, estoque e combustível foram restaurados.');
   g.state.notice='Troca confirmada e salva.';return true;
  }catch(e){restoreState(g.campaign,backup);g.state.fuel=fuel;g.state.temperature=temperature;g.state.notice=e.message;return false;}
  finally{this.applying=false;this.busy=false;g.emit();}
 }
}

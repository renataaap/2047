import {test,expect,vi} from 'vitest';
import {EconomyController} from '../../src/game/economy/EconomyController.js';

// Uma compra feita durante um salvamento automático (ex.: logo após concluir uma missão) espera a
// fila de saves terminar em vez de ser recusada com "Ação indisponível" (falha intermitente da
// regressão phase4 na loja da Lia, 12/11/2026).
function fakeGame(){
 let release;const g={campaign:{stock:1},state:{saving:true,fuel:10,temperature:30,notice:''},saves:{slot:'1'},emit:vi.fn(),
  saveQueue:new Promise(r=>{release=()=>{g.state.saving=false;r();};}),
  action:vi.fn(()=>{g.campaign.stock--;return true;}),save:vi.fn(async()=>true)};
 return {g,release:()=>release()};
}

test('compra durante um salvamento em andamento espera a fila e então é feita uma vez',async()=>{
 const {g,release}=fakeGame(),e=new EconomyController(g);
 const pending=e.transact('networkBuy','water');await Promise.resolve();
 expect(e.busy).toBe(true);expect(g.action).not.toHaveBeenCalled();// nada aplicado enquanto salva
 expect(await e.transact('networkBuy','water')).toBe(false);// clique duplo não cria segunda compra
 release();expect(await pending).toBe(true);
 expect(g.action).toHaveBeenCalledTimes(1);expect(g.save).toHaveBeenCalledTimes(1);expect(g.campaign.stock).toBe(0);expect(e.busy).toBe(false);
});

test('sem salvamento em andamento a compra segue direto; falha ao gravar restaura tudo',async()=>{
 const {g}=fakeGame();g.state.saving=false;g.save=vi.fn(async()=>false);const e=new EconomyController(g);
 expect(await e.transact('networkBuy','water')).toBe(false);expect(g.campaign.stock).toBe(1);expect(g.state.notice).toMatch(/restaurados/);
});

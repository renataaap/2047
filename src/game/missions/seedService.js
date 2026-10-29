import {CORES} from '../../data/network.js';

export const CALIBRATION_COST=2;
const messages={
 consumed:'O Núcleo já foi ativado. Procure a próxima Semente no próximo Cofre.',
 missing:'A Semente deste Núcleo ainda não está disponível para calibração.',
 terminal:'Aproxime-se do terminal para calibrar a Semente.',
 engine:'Desligue o motor do caminhão antes de calibrar a Semente.',
 parking:'Estacione o caminhão na área marcada e desligue o motor.',
 full:'A Semente está totalmente calibrada.',
 parts:'Faltam 2 peças acessíveis para calibrar a Semente.',
 ready:'Calibrar utiliza 2 peças acessíveis e recupera 20% de integridade.',
};

export function calibrationStatus(c,id='core-1',context={}){
 const access={usePlayer:context.usePlayer===true,useTruck:context.useTruck!==false};
 const player=access.usePlayer?Math.max(0,c.inventory.player.parts||0):0,truck=access.useTruck?Math.max(0,c.inventory.truck.parts||0):0;
 const known=CORES.some(k=>k.id===id),active=c.cores[id]?.state==='active';
 const carried=c.network?c.network.cargo===id:id==='core-1'&&c.seed.received&&c.stage!=='activated';
 let code='ready';
 if(active||id==='core-1'&&c.stage==='activated')code='consumed';
 else if(!known||!carried)code='missing';
 else if(context.atTerminal===false)code='terminal';
 else if(context.engineOff===false)code='engine';
 else if(context.parked===false)code='parking';
 else if(c.seed.integrity>=100)code='full';
 else if(player+truck<CALIBRATION_COST)code='parts';
 return {core:id,code,canCalibrate:code==='ready',message:code==='parts'&&player+truck===1?'Falta 1 peça acessível; a calibração exige 2 peças.':messages[code],integrity:code==='consumed'||code==='missing'?null:c.seed.integrity,parts:player+truck,playerParts:player,truckParts:truck,requiredParts:CALIBRATION_COST,access};
}

export function calibrateSeed(c,id='core-1',context={}){
 const status=calibrationStatus(c,id,context);if(!status.canCalibrate)return false;
 // Plan first. A failed condition never removes a partial payment.
 const fromPlayer=Math.min(CALIBRATION_COST,status.playerParts),fromTruck=CALIBRATION_COST-fromPlayer;
 c.inventory.player.parts-=fromPlayer;c.inventory.truck.parts-=fromTruck;
 c.seed.integrity=Math.min(100,c.seed.integrity+20);
 if(c.network?.seeds[id])c.network.seeds[id].integrity=c.seed.integrity;
 return true;
}

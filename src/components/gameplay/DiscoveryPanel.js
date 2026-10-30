import {DISCOVERY_SITES} from '../../data/ambience.js';
import {ITEMS} from '../../data/campaign.js';
import {bagWeight} from '../../game/missions/campaign.js';
export default function DiscoveryPanel({state,act}){
 const p=DISCOVERY_SITES.find(p=>p.id===state.discovery);if(!p)return null;
 const w=state.campaign.world,done=p.reward?w?.claimed.includes(p.id):w?.read.includes(p.id);
 return <><p className="eyebrow">MAR DE CINZAS · KM {(-p.z/1000).toFixed(2)}</p><p>{p.information}</p>{p.reward&&<><p>Reserva finita. A coleta vai para a mochila.</p><div className="loot-list">{Object.entries(p.reward).map(([id,n])=><span key={id}>{ITEMS[id].name} × {n}</span>)}</div><p>Mochila: {bagWeight(state.campaign.inventory.player).toFixed(1)} / 40 kg</p></>}<button className="primary" disabled={done} onClick={()=>act('siteAction',p.id)}>{done?(p.reward?'Reserva já recolhida':'Boletim já registrado'):p.action}</button><p role="status">{state.notice||'O local continua acessível após a inspeção.'}</p></>;
}

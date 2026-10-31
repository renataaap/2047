import {discoveryEntries} from '../../game/world/discoveryJournal.js';

export default function DiscoveryJournal({campaign}){
 const entries=discoveryEntries(campaign);
 return <section className="discovery-journal" aria-labelledby="discovery-journal-title"><div className="journal-heading"><span aria-hidden="true">◇</span><h3 id="discovery-journal-title">Descobertas da estrada</h3><small>{entries.length} registros</small></div><p className="panel-note">Anotações de locais explorados e campos restaurados. Os registros acompanham a partida salva.</p>{entries.length?<ol>{entries.map(p=><li key={p.id} data-testid={`journal-${p.id}`}><span className="journal-km">KM {p.km.toFixed(2)}</span><div><small>{p.kind}</small><h4>{p.name}</h4><p>{p.detail}</p><span className={p.complete?'journal-complete':'journal-visited'}>{p.status}</span></div></li>)}</ol>:<p className="journal-empty">Explore um local e inspecione seus objetos para começar o caderno.</p>}</section>;
}

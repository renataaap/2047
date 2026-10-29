import {useState} from 'react';
import DialogueText from './DialogueText.js';
import {COPY as T} from '../../data/campaign.js';
export default function NarrativeDialogue({act,onClose}){
 const [page,setPage]=useState(0);
 const lines=[{speaker:T.survivor,text:T.introduction},{speaker:T.dante,text:T.danteLine}];
 const line=lines[page];
 return <div className="narrative-dialogue"><div className="speaker-line"><span>{line.speaker}</span><small>ABRIGO 07 · {page+1} / {lines.length}</small></div><DialogueText key={page} text={line.text}/><div className="dialogue-pagination"><button disabled={page===0} onClick={()=>setPage(v=>v-1)}>Fala anterior</button><button disabled={page===lines.length-1} onClick={()=>setPage(v=>v+1)}>Próxima fala <span aria-hidden="true">→</span></button></div><div className="narrative-choices" aria-label="Respostas"><button onClick={()=>act('receive')}><span aria-hidden="true">01</span>{T.receive}</button><button onClick={onClose}><span aria-hidden="true">02</span>{T.decline}</button></div></div>;
}

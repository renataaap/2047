import {CHOICES,CHOICE_SCENES} from '../../data/story.js';
import {chapterOf,chapterIndex,canChoose,choiceOf} from '../../game/narrative/story.js';
import {ITEMS,COMPONENTS} from '../../data/campaign.js';
import DialogueText from './DialogueText.js';

const costLabel=o=>o.cost?Object.entries(o.cost.items).map(([k,n])=>`${n} ${ITEMS[k]?.name.toLowerCase()} (${o.cost.bag==='player'?'mochila':'compartimento'})`).join(', '):o.component?Object.entries(o.component).map(([k,d])=>`${COMPONENTS[k]} do Titã ${d}%`).join(', '):'';

// A narrative decision offered at a shelter. Once taken it shows the
// reaction, so the person keeps acknowledging what Dante did (art bible §7:
// one important choice marked as such; text never animates letter by letter
// here beyond the existing DialogueText).
export default function StoryChoice({campaign:c,site,act}){
 const id=Object.keys(CHOICE_SCENES).find(k=>CHOICE_SCENES[k].site===site);
 if(!id||chapterIndex(chapterOf(c))<chapterIndex(CHOICES[id].chapter))return null;
 const scene=CHOICE_SCENES[id],taken=choiceOf(c,id);
 if(taken)return <section className="story-choice taken" aria-label="Decisão tomada"><DialogueText text={scene.after[taken]}/></section>;
 return <section className="story-choice" aria-label="Decisão importante"><span className="eyebrow">Decisão importante · não pode ser desfeita</span><DialogueText text={scene.prompt}/><div className="story-options">{Object.entries(CHOICES[id].options).map(([key,o])=>{const gate=canChoose(c,id,key),cost=costLabel(o);return <button key={key} className="wide-link" disabled={!gate.ok} title={gate.ok?'':gate.message} onClick={()=>act('storyChoice',{id,option:key})}>{o.label}{cost&&<small> · {cost}</small>}</button>;})}</div></section>;
}

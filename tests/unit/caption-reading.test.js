import {test,expect} from 'vitest';
import {CUTSCENES} from '../../src/game/narrative/cutscene.js';
import '../../src/game/narrative/cutscenes/prologue.js';
import '../../src/game/narrative/cutscenes/intro-dante.js';
import '../../src/game/narrative/cutscenes/survivor-arrival.js';
import '../../src/game/narrative/cutscenes/campaign-beats.js';
import {REACTIONS,BRUTUS_MEETING} from '../../src/game/narrative/cutscenes/brutus.js';

// Story 008: legendas legíveis. Limite de leitura de ~17 caracteres por segundo (referência usual
// de legendagem), com folga de arredondamento; nenhuma cena passa de 45 s.
const MAX_CPS=17.5;

test('toda legenda de cena cabe no tempo de leitura do seu plano',()=>{
 const over=[];
 for(const d of Object.values(CUTSCENES)){
  const total=d.shots.reduce((a,s)=>a+s.duration,0);expect(total,d.id).toBeLessThanOrEqual(45);
  d.shots.forEach((s,i)=>{if(s.caption&&s.caption.text.length/s.duration>MAX_CPS)over.push(`${d.id}#${i}`);});
 }
 const reaction=BRUTUS_MEETING.shots[1].duration;for(const [k,t] of Object.entries(REACTIONS))if(t.length/reaction>MAX_CPS)over.push(`brutus:${k}`);
 expect(over).toEqual([]);
 expect(Object.keys(CUTSCENES).length).toBeGreaterThanOrEqual(8);
});

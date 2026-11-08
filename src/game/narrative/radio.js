import {TRANSMISSIONS,SPEAKERS,SITE_FRAGMENTS} from '../../data/story.js';
import {biomeAt} from '../../data/network.js';
import {chapterOf,choiceOf,logRadio} from './story.js';

// Picks the next narrative transmission. Pure: it never changes the campaign.
// Only offered while cruising (no maneuvers, panels or cinematics).
export const RADIO_GAP=75;
export function eligible(c,t,z){
 if(c.story?.radio?.includes(t.id))return false;
 if(!t.chapters.includes(chapterOf(c)))return false;
 if(t.renata&&!c.flags?.renataContact)return false;
 if(t.region&&biomeAt(z)!==t.region)return false;
 if(t.after&&!c.story?.radio?.includes(t.after))return false;
 if(t.quest&&Object.entries(t.quest).some(([id,s])=>c.network?.quests?.[id]!==s))return false;
 if(t.choice&&Object.entries(t.choice).some(([id,o])=>choiceOf(c,id)!==o))return false;
 return true;
}
export function cruising(ctx){return ctx.driving&&!ctx.overlay&&!ctx.cinematic&&ctx.speed>5&&Math.abs(ctx.steer||0)<.35;}
export function nextTransmission(c,ctx){
 if(!cruising(ctx)||!(ctx.sinceLast>=RADIO_GAP))return null;
 return TRANSMISSIONS.find(t=>eligible(c,t,ctx.z))||null;
}
// Records the transmission once and grants its fragment, if any.
export function playTransmission(c,t){
 if(!logRadio(c,t.id))return null;
 if(t.fragment&&!c.flags.voiceFragments.includes(t.fragment))c.flags.voiceFragments.push(t.fragment);
 return {id:t.id,speaker:SPEAKERS[t.speaker],text:t.text,seconds:Math.min(14,3+t.text.length/16)};
}
export function grantSiteFragment(c,siteId){
 const f=SITE_FRAGMENTS[siteId];if(!f||!Array.isArray(c.flags?.voiceFragments)||c.flags.voiceFragments.includes(f.id))return false;
 c.flags.voiceFragments.push(f.id);return true;
}
// Legacy saves that explored a site before 0.14 receive its clue once.
export function syncSiteFragments(c){for(const id of c.world?.visited||[])grantSiteFragment(c,id);}
export function radioLog(c){return (c.story?.radio||[]).map(id=>TRANSMISSIONS.find(t=>t.id===id)).filter(Boolean).map(t=>({id:t.id,speaker:SPEAKERS[t.speaker],text:t.text}));}

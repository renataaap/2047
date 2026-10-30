export function workerDefinition(base,id){
 const palettes={dante:{jacket:'#59624d',trousers:'#484332'},zeca:{jacket:'#9a8062',trousers:'#384148'},tomas:{jacket:'#a36a38',trousers:'#363e42'},ivani:{jacket:'#80645f',trousers:'#424439'},survivor:{jacket:'#6b7173',trousers:'#4b4b44'}};
 const key=id==='core1-tech'?'tomas':id==='posto-boa-viagem'?'zeca':id;
 let hash=0;for(const c of id)hash=(hash*31+c.charCodeAt(0))>>>0;
 const style=['dante','zeca','tomas','ivani','survivor'].includes(key)?key:id.includes('oficina')?'mechanic':id.includes('posto')?'trader':'traveler';
 return {...base,wardrobe:base?.url?.includes('/aurora-workers/')?style:null,palette:palettes[key]||{jacket:['#646d62','#8a795f','#6d696b','#6a777b'][hash%4],trousers:'#41483f'}};
}

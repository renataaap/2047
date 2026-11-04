import {CORES,ROUTES,SHELTERS,biomeAt} from './network.js';
import {ROAD_POINTS} from './road.js';
import {DISCOVERY_SITES} from './ambience.js';
import {POIS} from './expedition.js';
import {roadX,roadHeight} from '../game/world/roadProfile.js';

export const ROAD_NETWORK_VERSION=1;
export const PILOT_CITY={id:'cinza-nova',name:'Cinza Nova',x:-240,z:-760,height:roadHeight(-760),bounds:{minX:-425,maxX:-60,minZ:-995,maxZ:-555},garage:{x:-320,z:-820,door:{x:-320,z:-795}},parking:{x:-320,z:-700},loading:{x:-390,z:-820}};
export const CITY_GAS={id:'posto-cinza-nova',kind:'gas',name:'Posto de Cinza Nova',npc:'Nilo',title:'Operador do reservatório',x:-205,z:-680,face:1,talk:{x:-206,z:-679.5},pump:{x:-202,z:-680},stock:{diesel:90,water:12},line:'O tanque veio do depósito municipal. O estoque é contado, como tudo nesta cidade. Estacione junto à bomba e desligue o motor.'};
const nodes=new Map(),edges=[],pads=[],destinations=[];
const node=(id,x,z,y=roadHeight(z),junction=false)=>{if(!nodes.has(id))nodes.set(id,{id,x,z,y,junction});return id;};
const main=z=>node(`rodovia:${z}`,roadX(z),z);
const point=id=>nodes.get(id);
function link(id,from,to,options={}){
 const a=point(from),b=point(to),controls=options.controls||[{x:a.x,y:a.y,z:a.z},{x:a.x+(b.x-a.x)/3,y:a.y+(b.y-a.y)/3,z:a.z+(b.z-a.z)/3},{x:a.x+(b.x-a.x)*2/3,y:a.y+(b.y-a.y)*2/3,z:a.z+(b.z-a.z)*2/3},{x:b.x,y:b.y,z:b.z}];
 edges.push({id,from,to,start:a,end:b,controlPoints:controls,type:'secondary',width:10,surface:'asfalto',condition:.7,speedKmh:40,risk:.15,region:biomeAt((a.z+b.z)/2),access:'truck',unlocked:true,connections:[],...options});
}
const junctionZ=[-20,-620,-2100,-650,-1750,...ROUTES.flatMap(r=>[-r.start,-r.end,-r.at-30,-r.at+30]),-1070,-1130,...CORES.flatMap(k=>[k.z+140,k.z-140,k.vault.z+100,k.vault.z-100]),...ROAD_POINTS.filter(p=>p.kind!=='tech').flatMap(p=>[p.z+65,p.z-65]),...DISCOVERY_SITES.flatMap(p=>[p.z+55,p.z-55]),...POIS.flatMap(p=>[p.z+55,p.z-55])];
const zs=[...new Set([80,0,-21000,...Array.from({length:105},(_,i)=>-i*200),...junctionZ])].filter(z=>z>=-21000&&z<=80).sort((a,b)=>b-a);
zs.forEach(main);
for(let i=1;i<zs.length;i++){
 const za=zs[i-1],zb=zs[i],z=(za+zb)/2,region=biomeAt(z),hazard=ROUTES.find(r=>Math.abs(-z-r.at)<30),blocked=z<-1070&&z>-1130?'core-1':hazard&&!['flood','salt'].includes(hazard.kind)?hazard.core:null;
 link(`eixo:${za}:${zb}`,main(za),main(zb),{legacy:true,type:region==='glass'?'mountain':'highway',width:region==='glass'?6:10,surface:region==='glass'?'vidro':region==='salt'?'sal':'asfalto',speedKmh:region==='glass'?38:70,condition:.65,blockedUntil:blocked,weatherClosure:hazard?.kind==='storm'?'plasma-front':null,risk:hazard?.kind==='flood'?.8:region==='glass'?.5:.2,shape:t=>{const z=za+(zb-za)*t;return {x:roadX(z),y:roadHeight(z)+.09,z};}});
}
function detour(id,start,end,offset,legacy=true){const z=-(start+end)/2,mid=node(`${id}:meio`,roadX(z)+offset,z,roadHeight(z));for(const [part,from,to,t0]of [[id,main(-start),mid,0],[`${id}:sul`,mid,main(-end),.5]])link(part,from,to,{legacy,type:legacy?'highway':'secondary',surface:legacy?'asfalto':'terra',width:legacy?10:8,speedKmh:legacy?55:32,risk:legacy?.1:.65,condition:legacy?.8:.4,shape:t=>{const f=t0+t*.5,z=-start-(end-start)*f;return {x:roadX(z)+Math.sin(f*Math.PI)*offset,y:roadHeight(z)+(legacy?.09:0),z};}});destination(`via:${id}`,`${legacy?'Alça leste':'Desvio oeste'} · ${ROUTES.find(r=>id.endsWith(r.id))?.name||'Travessia do Mar de Cinzas'}`,'waypoint',roadX(z)+offset,z,mid);}
detour('desvio-cinzas',650,1750,350);
ROUTES.forEach(r=>{detour(`desvio:${r.id}`,r.start,r.end,130);detour(`oeste:${r.id}`,r.start,r.end,-80,false);});

// A compact street grid with paved turning bulbs and distinct civic/industrial blocks.
for(const x of [-360,-240,-120])for(const z of [-620,-760,-900])node(`cidade:${x}:${z}`,x,z,PILOT_CITY.height,true);
for(const z of [-620,-760,-900])for(const [a,b] of [[-360,-240],[-240,-120]])link(`urbana:${a}:${b}:${z}`,`cidade:${a}:${z}`,`cidade:${b}:${z}`,{type:'urban',width:14,speedKmh:30,condition:.8,city:PILOT_CITY.id});
for(const x of [-360,-240,-120])for(const [a,b] of [[-620,-760],[-760,-900]])link(`urbana:${x}:${a}:${b}`,`cidade:${x}:${a}`,`cidade:${x}:${b}`,{type:'urban',width:14,speedKmh:30,condition:.8,city:PILOT_CITY.id});
link('entrada-cinza-nova',main(-620),'cidade:-120:-620',{type:'highway',width:14,speedKmh:40,city:PILOT_CITY.id,controls:[point(main(-620)),{x:-35,y:roadHeight(-620),z:-620},{x:-65,y:PILOT_CITY.height,z:-620},point('cidade:-120:-620')]});
node('servidao:vale',-230,-1430,roadHeight(-1430));node('servidao:retorno',-150,-1820,roadHeight(-1820));
link('terra:saida-cidade','cidade:-240:-900','servidao:vale',{type:'dirt',surface:'terra',width:9,speedKmh:32,condition:.45,risk:.5,controls:[point('cidade:-240:-900'),{x:-240,y:PILOT_CITY.height,z:-1080},{x:-315,y:roadHeight(-1270),z:-1260},point('servidao:vale')]});
link('terra:vale','servidao:vale','servidao:retorno',{type:'dirt',surface:'terra',width:9,speedKmh:32,condition:.45,risk:.5,controls:[point('servidao:vale'),{x:-165,y:roadHeight(-1560),z:-1560},{x:-195,y:roadHeight(-1710),z:-1730},point('servidao:retorno')]});
link('terra:retorno','servidao:retorno',main(-2100),{type:'dirt',surface:'terra',width:10,speedKmh:35,condition:.5,risk:.4,controls:[point('servidao:retorno'),{x:-12,y:roadHeight(-1930),z:-1930},{x:roadX(-2100),y:roadHeight(-2030),z:-2030},point(main(-2100))]});

function destination(id,name,kind,x,z,nodeId,extra={}){destinations.push({id,name,kind,x,z,nodeId,...extra});}
function access(id,name,kind,x,z,park,span=140){
 const h=roadHeight(park.z),to=node(`estacionamento:${id}`,park.x,park.z,h,true),entry=main(z+span),exit=main(z-span),a=point(entry),b=point(exit),p=point(to);
 const approach=(a.z-p.z)/3,depart=(p.z-b.z)/3;
 const slope=z=>(roadHeight(z+.1)-roadHeight(z-.1))/.2;
 link(`acesso:${id}`,entry,to,{type:'access',width:11,speedKmh:22,site:id,controls:[a,{x:a.x,y:a.y-slope(a.z)*approach,z:a.z-approach},{x:p.x,y:h,z:p.z+approach},p]});
 link(`saida:${id}`,to,exit,{type:'access',width:11,speedKmh:22,site:id,controls:[p,{x:p.x,y:h,z:p.z-depart},{x:b.x,y:b.y+slope(b.z)*depart,z:b.z+depart},b]});
 pads.push({id,x:park.x,z:park.z,width:26,length:40,y:h,kind});destination(id,name,kind,park.x,park.z,to,{terminal:{x,z},accessEntry:entry,accessExit:exit});
 if(['core','vault'].includes(kind))destination(`retorno:${id}`,`Retorno à rodovia · ${name}`,'waypoint',b.x,b.z,exit);
}
for(const k of CORES){const park=k.number===1?{x:7,z:-2880}:{x:k.x-14,z:k.z+10};access(k.id,k.name,'core',k.x,k.z,park);if(k.number>1)access(`vault-${k.number}`,`Cofre ${k.number}`,'vault',k.vault.x,k.vault.z,{x:k.vault.x-14,z:k.vault.z+12},100);}
for(const p of ROAD_POINTS.filter(p=>p.kind!=='tech'))access(p.id,p.name,p.kind,p.x,p.z,{x:p.x+(p.face||1)*15,z:p.z},65);
for(const p of DISCOVERY_SITES)access(p.id,p.name,'poi',p.x,p.z,{x:p.x+15,z:p.z+16},55);
for(const p of POIS)access(`explore:${p.id}`,p.name,'poi',p.x,p.z,{x:p.x+14,z:p.z+15},55);
// The first vault belongs to the inhabited shelter and is approached on foot.
const firstVault=main(-20);
destination('vault-1','Cofre 1 · acesso pelo Abrigo 07','vault',0,-20,firstVault,{terminal:{x:-36,z:-20},accessEntry:main(0),accessExit:main(-200)});
destination('retorno:vault-1','Retorno à rodovia · Cofre 1','waypoint',roadX(-200),-200,main(-200));
destination('shelter','Abrigo 07','shelter',0,5,main(0),{terminal:{x:-19,z:5}});
destination('home','Barracão de Dante','home',0,5,main(0),{terminal:{x:-13,z:22}});
for(const p of SHELTERS)destination(p.id,p.name,'shelter',roadX(p.z),p.z,main(p.z),{terminal:{x:p.x,z:p.z-1}});
function cityBay(id,name,kind,x,z,street){const n=node(`cidade:${id}`,x,z,PILOT_CITY.height,true);link(`cidade:acesso:${id}`,street,n,{type:'urban',width:12,speedKmh:18,city:PILOT_CITY.id});pads.push({id,x,z,width:28,length:34,y:PILOT_CITY.height,kind});destination(id,name,kind,x,z,n);}
cityBay(CITY_GAS.id,CITY_GAS.name,'gas',-226,-680,'cidade:-240:-620');
cityBay('cinza-nova',PILOT_CITY.name,'city',-320,-700,'cidade:-360:-760');
cityBay('garagem-cinza-nova','Garagem municipal','garage',-320,-780,'cidade:-240:-760');
cityBay('carga-cinza-nova','Pátio de carga de Cinza Nova','loading',-390,-820,'cidade:-360:-900');
link('cidade:saida:posto','cidade:posto-cinza-nova','cidade:-240:-760',{type:'urban',width:12,speedKmh:18,city:PILOT_CITY.id});
link('cidade:saida:patio','cidade:cinza-nova','cidade:-240:-760',{type:'urban',width:12,speedKmh:18,city:PILOT_CITY.id});
destination('vale-cinzas','Entroncamento do Vale · estrada de terra','junction',-230,-1430,'servidao:vale');
export const ROAD_NODES=[...nodes.values()];
export const ROAD_EDGES=edges;
export const ROAD_PADS=pads;
export const ROAD_DESTINATIONS=destinations;
export const CITY_JUNCTIONS=ROAD_NODES.filter(n=>n.junction&&n.id.startsWith('cidade:'));

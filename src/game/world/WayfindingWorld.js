import {CORES,ROUTES} from '../../data/network.js';
import {ROAD_DESTINATIONS,PILOT_CITY} from '../../data/roadNetwork.js';
import {NODE_BY_ID} from '../navigation/roadIndex.js';
import {roadX,heightAt} from './terrain.js';
import {PropBatch} from './PropBatch.js';

export const ROAD_SIGNS=[
 {id:'city-entry',x:roadX(-620)+13,z:-580,text:'CINZA NOVA  ←'},
 {id:'workshop',x:roadX(-550)+13,z:-510,text:'OFICINA DO COTOVELO  ←'},
 {id:'city-fuel',x:-252,z:-646,text:'POSTO DE CINZA NOVA  →'},
 {id:'city-exit',x:-224,z:-944,text:'VALE / NÚCLEO 1  ↑'},
 {id:'city-garage',x:-283,z:-744,text:'GARAGEM MUNICIPAL  ←'},
 {id:'city-industrial',x:-105,z:-798,text:'ÁREA INDUSTRIAL  →'},
 ...ROAD_DESTINATIONS.filter(d=>['core','vault'].includes(d.kind)).map(d=>{const n=NODE_BY_ID.get(d.accessEntry),side=d.x>n.x?'→':'←';return {id:`access:${d.id}`,x:n.x+13,z:n.z+28,text:`${d.name.replace('Núcleo','NÚCLEO').replace('Cofre','COFRE')}  ${side}`};}),
 ...ROUTES.map(r=>({id:`detour:${r.id}`,x:roadX(-r.start)+13,z:-r.start+30,text:`${r.name} · DESVIOS  ←  →`})),
];
export class WayfindingWorld{
 constructor(scene,physics,materials){this.scene=scene;this.physics=physics;this.m=materials;this.live=new Map();this.labels=new Map();}
 build(p){const b=new PropBatch(this.physics,this.m,{x:p.x,y:heightAt(p.x,p.z),z:p.z});for(const x of [-1.5,1.5])b.box(.12,3.2,.12,this.m.rust,x,1.6,0,true);b.box(3.8,.95,.14,this.m.steel,0,2.85,0,true);b.label(p.text,3.68,.84,0,2.85,.081,this.labels);b.finish();b.group.name=`wayfinding:${p.id}`;b.sign=p;this.scene.add(b.group);return b;}
 update(position,menu=false){for(const p of ROAD_SIGNS){const r=Math.hypot(position.x-p.x,position.z-p.z);if(r<500&&!this.live.has(p.id))this.live.set(p.id,this.build(p));if(r>650&&this.live.has(p.id)){const b=this.live.get(p.id);b.dispose();this.live.delete(p.id);const mat=this.labels.get(p.text);mat?.map?.dispose();mat?.dispose();this.labels.delete(p.text);}}for(const b of this.live.values())b.group.visible=!menu;}
 snapshot(){return {loaded:this.live.size,ids:[...this.live.keys()],cachedLabels:this.labels.size};}
 dispose(){for(const b of this.live.values())b.dispose();this.live.clear();for(const mat of this.labels.values()){mat.map?.dispose();mat.dispose();}this.labels.clear();}
}

import {LOGISTICS_SITES} from '../../data/contracts.js';
import {siteUnlocked} from './contracts.js';
import {PropBatch} from '../world/PropBatch.js';
export class LogisticsWorld {
 constructor(game){this.game=game;this.live=new Map();this.labels=new Map();}
 update(focus,hidden=false){const g=this.game;for(const s of Object.values(LOGISTICS_SITES)){
  const near=Math.hypot(focus.x-s.bay.x,focus.z-s.bay.z)<Math.min(g.rendering.preset.distance,650)+80;
  if((!near||!siteUnlocked(g.campaign,s))&&this.live.has(s.id)){this.live.get(s.id).dispose();this.live.delete(s.id);}
  if(near&&siteUnlocked(g.campaign,s)&&!this.live.has(s.id))this.build(s);
  const b=this.live.get(s.id);if(b)b.group.visible=!hidden;
 }}
 build(s){const g=this.game,m={...g.materials,lamp:g.materials.light},y=g.world.groundHeight(s.bay.x,s.bay.z)+.035,b=new PropBatch(g.physics,m,{x:s.bay.x,y,z:s.bay.z}),w=s.bay.halfWidth,l=s.bay.halfLength;
  for(const x of [-w,w])b.box(.1,.025,l*2,m.lamp,x,0,0);for(const z of [-l,l])for(let x=-w;x<w;x+=1.4)b.box(.8,.025,.1,m.paint,x,0,z);
  const x=s.terminal.x-s.bay.x,z=s.terminal.z-s.bay.z;
  for(const dx of [-.7,.7])b.box(.055,2.2,.055,m.steel,x+dx,1.1,z);
  b.box(1.6,1.1,.09,m.rust,x,1.65,z);b.label(s.board?'FRETES · '+s.name.toUpperCase():'DEPÓSITO · DEVOLUÇÕES',2.5,.58,x,2.48,z-.06,this.labels,Math.PI);
  b.label('MANIFESTO · MOTOR DESLIGADO',1.5,.38,x,1.7,z-.065,this.labels,Math.PI);b.box(.65,.08,.35,m.steel,x,1.02,z-.16);b.lamp(x,2.9,z-.15);
  const body=b.solid(x,1.1,z,1.6,2.2,.12);body.userData={interactionKey:`logistics:${s.id}`};
  b.finish();g.rendering.scene.add(b.group);this.live.set(s.id,b);
 }
 snapshot(){return {sites:[...this.live.keys()],meshes:[...this.live.values()].reduce((n,b)=>n+b.group.children.length,0),colliders:[...this.live.values()].reduce((n,b)=>n+b.bodies.length,0)};}
 dispose(){for(const b of this.live.values())b.dispose();for(const m of this.labels.values()){m.map?.dispose();m.dispose();}this.live.clear();this.labels.clear();}
}

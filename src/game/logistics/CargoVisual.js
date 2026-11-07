import * as THREE from 'three';
import {PropBatch} from '../world/PropBatch.js';
import {CARGO_TYPES} from '../../data/contracts.js';
import {cargoPlacement,manifestMass} from './manifest.js';
import {CargoDoors} from './CargoDoors.js';
export class CargoVisual {
 constructor(game){this.game=game;this.key='';this.bind();}
 bind(){this.clear();this.doors?.dispose();const g=this.game;this.root=new THREE.Group();this.root.name='Manifesto de transporte';this.root.userData.keepWithImportedTruck=true;g.truck.root.add(this.root);this.doors=g.activeVehicleId==='titan-old'?new CargoDoors(g.truckVisual.visual):null;this.key='';}
 clear(){this.batch?.dispose();this.batch=null;this.root?.removeFromParent();}
 update(dt){
  const g=this.game,c=g.campaign,m=c.logistics?.cargo,p=m&&cargoPlacement(c,g.activeVehicleId,m.type),key=p?`${m.contract}/${m.type}/${g.activeVehicleId}/${p.center.join('/')}`:'';
  if(key!==this.key){this.batch?.dispose();this.batch=null;this.key=key;if(p)this.build(m,p);}
  this.root.visible=!!p&&g.state.mode!=='menu';this.doors?.update(!!p&&g.state.speed<.2&&!g.state.engineOn&&!g.garage?.active,dt);
 }
 build(manifest,p){
  const g=this.game,m=g.materials,t=CARGO_TYPES[manifest.type],model=t.model,b=new PropBatch(null,m),n=manifest.quantity,w=t.width,d=t.depth,h=t.height;
  // Two pallet rails and slats, then a compact, tied consignment. Quantity is
  // represented by individual drums/crates/sacks, never by the supplies bag.
  b.box(w,.05,d,m.wood,0,.095,0);for(const x of [-w*.38,w*.38])b.box(.12,.07,d,m.wood,x,.035,0);
  if(['generator','machinery'].includes(model)){
   for(let i=0;i<n;i++){
    const cd=d/n,z=(i-(n-1)/2)*cd;
    b.box(w-.18,h-.24,cd-.14,m.paint,0,h/2,z);for(const x of [-w*.5+.09,w*.5-.09])b.box(.1,h,.1,m.steel,x,h/2,z-cd*.43);
    for(let j=0;j<8;j++)b.box(w*.55,.035,.025,m.dark,0,.3+j*.11,z-cd/2-.001);
    b.cylinder(.18,.48,m.steel,w*.3,h-.22,z+cd*.24,[0,0,Math.PI/2]);
   }
   for(const z of [-d*.35,d*.35])b.box(w,.055,.12,m.rubber,0,h*.98,z);
  }else for(let i=0;i<n;i++){
   const cols=Math.min(n,model==='barrels'?3:2),row=Math.floor(i/cols),rows=Math.ceil(n/cols),cw=w/cols*.88,ch=(h-.12)/rows,x=(i%cols-(cols-1)/2)*w/cols,y=.12+row*ch;
   if(model==='barrels'){b.cylinder(.24,ch-.04,m.paint,x,y+(ch-.04)/2,0);for(const v of [.1,.5,.9])b.ring(.245,.019,m.steel,x,y+ch*v,0);b.cylinder(.055,.025,m.dark,x+.1,y+ch-.0275,0);}
   else if(model==='sacks'){b.part(new THREE.SphereGeometry(1,12,8).scale(cw/2,ch*.45,d*.45),m.cloth||m.wood,x,y+ch*.45,0);b.box(cw*.6,.025,.04,m.rubber,x,y+ch*.83,0);}
   else {b.box(cw,ch-.035,d*.85,model==='instruments'?m.steel:m.wood,x,y+(ch-.035)/2,0);for(const dx of [-cw*.36,cw*.36])b.box(.035,ch,.9*d,m.rubber,x+dx,y+ch/2,0);b.box(cw*.5,ch*.2,.015,m.paint,x,y+ch*.63,-d*.44);}
  }
  for(const x of [-w*.42,w*.42]){b.box(.035,h,.03,m.rubber,x,h/2,-d*.48);b.box(.035,.025,d,m.rubber,x,h+.015,0);b.box(.035,h,.03,m.rubber,x,h/2,d*.48);}
  b.finish();b.group.position.set(p.center[0],p.floor,p.center[2]);this.root.add(b.group);this.batch=b;
 }
 snapshot(){const m=this.game.campaign.logistics?.cargo;return {visible:!!this.root?.visible&&!!this.batch,type:m?.type||null,mass:manifestMass(m),pieces:this.batch?.count||0,meshes:this.batch?.group.children.length||0,position:this.batch?.group.position.toArray()||null,doors:this.doors?.snapshot()||null};}
 dispose(){this.clear();this.doors?.dispose();}
}

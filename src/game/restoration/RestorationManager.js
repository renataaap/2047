import {RestorationCinematic} from './RestorationCinematic.js';
import {RestorationEffects} from './RestorationEffects.js';
import {CORES} from '../../data/network.js';
import {ensureRecovery,recoverySummary} from './progress.js';
import {RECOVERY_TERRAIN_ROLES,updateRecoveryTerrain} from './RestorationTerrain.js';
import {RestorationVegetation} from './RestorationVegetation.js';
import {RestorationAtmosphere} from './RestorationAtmosphere.js';

export class RestorationManager{
 constructor(game){this.g=game;this.vegetation=new RestorationVegetation(game.rendering.scene,game.physics,game.world);this.atmosphere=new RestorationAtmosphere(game.rendering);this.cinematic=new RestorationCinematic(game);this.effects=new RestorationEffects(game.rendering.scene,game.world);}
 update(c,p,dt,menu=false){
  ensureRecovery(c);for(const role of RECOVERY_TERRAIN_ROLES)if(this.g.materials[role])updateRecoveryTerrain(this.g.materials[role],c);
  if(!this.priming)this.vegetation.update(c,p,this.g.settings.quality,dt,menu,this.g.presentationDt||dt);
  this.effects.update(c,this.cinematic,this.cinematic.active?this.g.presentationDt:dt,menu);return this.atmosphere.update(c,p,this.g.settings.quality,this.cinematic.active?this.g.presentationDt:dt,menu);
 }
 async prime(c,p){const token=this.primeGeneration=(this.primeGeneration||0)+1,started=performance.now();this.priming=true;try{do{if(this.g.disposed||this.primeGeneration!==token)return;this.vegetation.update(c,p,this.g.settings.quality,0,false,.08);await new Promise(resolve=>setTimeout(resolve,0));}while(this.vegetation.pendingCells>0);}finally{if(this.primeGeneration===token){this.priming=false;this.lastPrimeMs=performance.now()-started;}}}
 snapshot(c){const vegetation=this.vegetation.snapshot(c),progress=recoverySummary(c);return {version:1,priming:!!this.priming,lastPrimeMs:this.lastPrimeMs||0,cinematic:this.cinematic.snapshot(),progress,local:this.atmosphere.current,vegetation,cores:Object.fromEntries(CORES.map(k=>{const counts=this.vegetation.coreCounts(k.id);return [k.id,{...counts,plants:counts.total>0,count:counts.total,stage:progress[k.number-1].stage}];}))};}
 reset(){this.primeGeneration=(this.primeGeneration||0)+1;this.priming=false;this.cinematic.reset();this.vegetation.reset();}
 dispose(){this.cinematic.reset();this.effects.dispose();this.vegetation.dispose();this.atmosphere.dispose();}
}

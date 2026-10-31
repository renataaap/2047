import * as THREE from 'three';
import {heightAt} from '../world/terrain.js';
// Reuses an actual licensed game asset. This set dressing has no gameplay colliders
// and is hidden during play; the game keeps its one renderer and animation loop.
export class MenuScene {
 constructor(scene,assets){this.scene=scene;this.assets=assets;this.group=new THREE.Group();this.group.name='Menu roadside composition';scene.add(this.group);}
 async load(definition){
  if(!definition?.rightsCleared)return;
  const lease=await this.assets.model(definition.url);if(this.disposed){lease.release();return;}this.lease=lease;
  const model=lease.scene;model.position.set(-11,heightAt(-11,27),27);model.rotation.y=.16;this.group.add(model);
  const lamp=new THREE.PointLight('#e5a765',22,20,2);lamp.position.set(-5,3.8,13);this.group.add(lamp);
 }
 update(visible){this.group.visible=visible;}
 dispose(){this.disposed=true;this.group.removeFromParent();this.lease?.release();}
}

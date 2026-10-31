import {it,expect} from 'vitest';
import * as THREE from 'three';
import {dressWorker} from '../../src/game/player/WorkerWardrobe.js';
import {workerDefinition} from '../../src/game/player/workerDefinition.js';
it('equipamentos seguem ossos existentes sem mover o personagem e liberam recursos',()=>{
 const model=new THREE.Group(),head=new THREE.Bone(),spine=new THREE.Bone();head.name='head';head.position.y=1.6;spine.name='spine';spine.position.y=1.1;model.add(head,spine);model.position.set(40,2,-100);
 const before=model.position.clone(),wardrobe=dressWorker(model,'dante');expect(wardrobe.style).toBe('dante');expect(wardrobe.meshes).toBeGreaterThan(2);expect(model.position.equals(before)).toBe(true);expect(head.children.some(o=>o.isMesh)).toBe(true);expect(spine.children.some(o=>o.isMesh)).toBe(true);
 const object=head.children[0];model.updateMatrixWorld(true);const matrix=object.matrixWorld.clone();head.rotation.y=.5;model.updateMatrixWorld(true);expect(object.matrixWorld.equals(matrix)).toBe(false);wardrobe.dispose();expect(head.children).toHaveLength(0);expect(spine.children).toHaveLength(0);
});
it('personagens prioritários têm silhuetas/equipamentos próprios e GLB final permanece substituível',()=>{
 const base={url:'/assets/models/aurora-workers/worker.glb'};expect(workerDefinition(base,'dante').wardrobe).toBe('dante');expect(workerDefinition(base,'posto-boa-viagem').wardrobe).toBe('zeca');expect(workerDefinition(base,'core1-tech').wardrobe).toBe('tomas');expect(workerDefinition(base,'ivani').wardrobe).toBe('ivani');expect(workerDefinition({url:'/assets/models/final.glb'},'dante').wardrobe).toBeNull();
});

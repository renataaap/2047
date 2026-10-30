import * as THREE from 'three';

// Imported roots need not be centred or have their lowest vertex at y=0.
export function groundStaticModel(model,x,z){
 model.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(model);
 if(bounds.isEmpty())throw new Error('Modelo estático sem geometria visível');
 const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
 model.position.add(new THREE.Vector3(x-center.x,-bounds.min.y,z-center.z));model.updateMatrixWorld(true);
 return size;
}

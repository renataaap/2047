import * as THREE from 'three';
// Open only the two original rear leaves. The atlas, normals, opacity and all
// wheel pivots remain untouched; cached GLB geometries are never mutated.
export class CargoDoors {
 constructor(visual){
  this.parts=[];this.meshes=[];this.angle=0;
  visual?.traverse(mesh=>{if(!mesh.isMesh||!['Titan_Paint','Titan_Metal'].includes(mesh.material?.name))return;
   const g=mesh.geometry,p=g.attributes.position,indices=g.index,sets=[[],[],[]];
   for(let i=0;i<(indices?.count??p.count);i+=3){const ids=[0,1,2].map(j=>indices?indices.getX(i+j):i+j),rear=ids.every(id=>p.getZ(id)>4.25)&&ids.reduce((n,id)=>n+p.getY(id),0)/3>.1;
    sets[rear?(ids.reduce((n,id)=>n+p.getX(id),0)<0?1:2):0].push(...ids);
   }
   if(!sets[1].length||!sets[2].length)return;
   const make=ids=>{const next=new THREE.BufferGeometry();for(const [name,a]of Object.entries(g.attributes)){const data=new a.array.constructor(ids.length*a.itemSize);for(let i=0;i<ids.length;i++)for(let k=0;k<a.itemSize;k++)data[i*a.itemSize+k]=a.array[ids[i]*a.itemSize+k];next.setAttribute(name,new THREE.BufferAttribute(data,a.itemSize,a.normalized));}next.computeBoundingSphere();return next;};
   const own=sets.map(make);this.parts.push({mesh,original:g,own});mesh.geometry=own[0];
   for(let side=1;side<=2;side++){const hinge=new THREE.Group(),x=side===1?-1.17:1.17;hinge.position.set(x,0,4.43);const leaf=new THREE.Mesh(own[side],mesh.material);leaf.position.set(-x,0,-4.43);leaf.castShadow=true;leaf.receiveShadow=true;hinge.add(leaf);mesh.parent.add(hinge);this.meshes.push({hinge,side});}
  });
 }
 update(open,dt){this.angle+=((open?Math.PI*.62:0)-this.angle)*(1-Math.exp(-Math.min(dt,.1)*5));for(const {hinge,side}of this.meshes)hinge.rotation.y=this.angle*(side===1?-1:1);}
 snapshot(){return {leaves:this.meshes.length,angle:this.angle,triangles:this.parts.reduce((n,p)=>n+(p.own[1].attributes.position.count+p.own[2].attributes.position.count)/3,0)};}
 dispose(){for(const {mesh,original,own}of this.parts){mesh.geometry=original;own.forEach(g=>g.dispose());}this.meshes.forEach(p=>p.hinge.removeFromParent());this.parts=[];this.meshes=[];}
}

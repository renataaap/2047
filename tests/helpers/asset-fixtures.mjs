// Original diagnostic fixtures, deliberately simple. Never game assets or Poly Haven content.
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import sharp from 'sharp';
import { digest } from '../../scripts/lib/polyhaven.mjs';

class BlobReader {
  readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.();}).catch(e=>this.onerror?.(e));}
  readAsDataURL(blob){blob.arrayBuffer().then(data=>{this.result=`data:${blob.type};base64,${Buffer.from(data).toString('base64')}`;this.onloadend?.();}).catch(e=>this.onerror?.(e));}
}
export async function fixtures(){
  globalThis.FileReader ||= BlobReader;
  const truck=new THREE.Group(),material=new THREE.MeshStandardMaterial({color:'#be7335',roughness:.6});
  const body=new THREE.Mesh(new THREE.BoxGeometry(2,1.7,8),material);body.name='FixtureBody';body.position.y=.5;truck.add(body);
  const wheels=[];
  for(const z of [-2.5,1.45,2.9])for(const x of [-1.2,1.2]){const i=wheels.length,w=new THREE.Mesh(new THREE.CylinderGeometry(.61,.61,.4,16).rotateZ(Math.PI/2),new THREE.MeshStandardMaterial({color:'#222222'}));w.name=`FixtureWheel${i}`;w.position.set(x,-.62,z);truck.add(w);wheels.push({node:w.name,spinAxis:'x',spinSign:-1});}
  const exportGLB=(scene,animations=[])=>new GLTFExporter().parseAsync(scene,{binary:true,animations});
  const truckGLB=Buffer.from(await exportGLB(truck));
  const actor=new THREE.Group(),geometry=new THREE.CapsuleGeometry(.25,1.2,4,8),hip=new THREE.Bone(),spine=new THREE.Bone();hip.name='FixtureHip';spine.name='FixtureSpine';spine.position.y=.5;hip.add(spine);
  const count=geometry.attributes.position.count,skinIndex=new Uint16Array(count*4),skinWeight=new Float32Array(count*4);
  for(let i=0;i<count;i++){skinIndex[i*4]=geometry.attributes.position.getY(i)>.1?1:0;skinWeight[i*4]=1;}
  geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(skinIndex,4));geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(skinWeight,4));
  const skin=new THREE.SkinnedMesh(geometry,new THREE.MeshStandardMaterial({color:'#647a86'}));skin.name='FixtureSkin';skin.add(hip);skin.bind(new THREE.Skeleton([hip,spine]));skin.position.y=.85;actor.add(skin);
  const q=a=>new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),a).toArray();
  const idle=new THREE.AnimationClip('FixtureIdle',1,[new THREE.QuaternionKeyframeTrack('FixtureSpine.quaternion',[0,.5,1],[...q(0),...q(.04),...q(0)])]);
  const walk=new THREE.AnimationClip('FixtureWalk',1,[new THREE.QuaternionKeyframeTrack('FixtureSpine.quaternion',[0,.5,1],[...q(-.12),...q(.12),...q(-.12)])]);
  const npcGLB=Buffer.from(await exportGLB(actor,[idle,walk]));
  const pngs={color:await sharp({create:{width:16,height:16,channels:3,background:'#ac9c7d'}}).png().toBuffer(),normal:await sharp({create:{width:16,height:16,channels:3,background:{r:128,g:128,b:255}}}).png().toBuffer(),arm:await sharp({create:{width:16,height:16,channels:3,background:{r:245,g:210,b:0}}}).png().toBuffer()};
  const maps=Object.fromEntries(Object.entries(pngs).map(([kind,buffer])=>[kind,{url:`/assets/test-fixtures/${kind}.png`,sha256:digest(buffer),width:16,height:16}]));
  const ids=['road_damaged_2','gravel_road','dirt','rocky_terrain_03','mud_cracked_dry_03','rusty_metal_05','corrugated_iron','cracked_concrete_02','broken_brick_wall','garage_floor','brown_leather'];
  const materials={schemaVersion:1,assets:Object.fromEntries(ids.map(id=>[id,{id,status:'installed',normalConvention:'OpenGL',armChannels:{r:'ao',g:'roughness',b:'metalness'},tileMeters:[2,2],maps}]))};
  const models={schemaVersion:1,trucks:{initial:{id:'original-test-fixture',url:'/assets/test-fixtures/truck.glb',status:'installed',rightsCleared:true,license:'Original project test fixture',source:'tests/helpers/asset-fixtures.mjs',attribution:'Original diagnostic fixture; not a selected truck model',wheels}},characters:{survivor:{url:'/assets/test-fixtures/npc.glb',status:'installed',rightsCleared:true,license:'Original project test fixture',source:'tests/helpers/asset-fixtures.mjs',attribution:'Original rig test',idle:'FixtureIdle',walk:'FixtureWalk',inPlace:true}}};
  return {truckGLB,npcGLB,pngs,materials,models};
}

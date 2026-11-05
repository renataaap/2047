import * as THREE from 'three';
import {CORES} from '../../data/network.js';
import {ECOLOGY} from './definitions.js';
const slots=new WeakMap();
export const RECOVERY_TERRAIN_ROLES=['ground','cityGround','cityRestored','salt','saltRestored','glassGround','glassRestored','stormGround','stormRestored','rock'];
function binding(material){if(!slots.has(material))slots.set(material,{value:CORES.map(k=>new THREE.Vector4(k.x,k.z,-1,ECOLOGY[k.region].width))});return slots.get(material);}
export function updateRecoveryTerrain(material,c){const b=binding(material);CORES.forEach((k,i)=>b.value[i].z=c.cores[k.id]?.state==='active'?(c.world?.recovery?.cores[k.id]?.age??240):-1);}
// Must follow coreAt/restoredAt, including the legacy early salt inlet. There is
// no new texture sampler: a compact analytic field modulates the existing PBR.
export const recoveryTerrainGLSL=`
uniform vec4 auroraRecovery[7];

float recoveryNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);vec4 h=fract(sin(vec4(dot(i,vec2(127.1,311.7)),dot(i+vec2(1.,0.),vec2(127.1,311.7)),dot(i+vec2(0.,1.),vec2(127.1,311.7)),dot(i+vec2(1.),vec2(127.1,311.7))))*43758.5453);return mix(mix(h.x,h.y,f.x),mix(h.z,h.w,f.x),f.y);}
int recoveryCore(float z){if(z>=-3200.)return 0;if(z>=-5800.)return 3;if(z>=-8350.)return 1;if(z>=-10000.)return 2;if(z>=-12600.)return 3;if(z>=-15600.)return 4;if(z>=-17600.)return 5;return 6;}
`;
export function applyRecoveryTerrain(material){
 const previous=material.onBeforeCompile.recoveryBase||material.onBeforeCompile;
 const previousKey=material.customProgramCacheKey.recoveryBase||material.customProgramCacheKey;
 const live=binding(material);
 const compile=shader=>{
  previous.call(material,shader);shader.uniforms.auroraRecovery=live;
  const blended=!!material.userData.terrainBlend;
  if(!blended){
  shader.vertexShader='varying vec3 recoveryPosition; varying vec3 recoveryNormal;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vec4 recoveryVertex=vec4(position,1.0);
   #ifdef USE_INSTANCING
   recoveryVertex=instanceMatrix*recoveryVertex;
   #endif
   recoveryPosition=(modelMatrix*recoveryVertex).xyz;recoveryNormal=normalize(mat3(modelMatrix)*normal);`);
  }
  const coordinates=blended?'#define recoveryPosition auroraPosition\n#define recoveryNormal auroraNormal\n':'varying vec3 recoveryPosition; varying vec3 recoveryNormal;\n';
  shader.fragmentShader=coordinates+recoveryTerrainGLSL+'\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   int rc=recoveryCore(recoveryPosition.z);vec4 rf=auroraRecovery[rc];
   float ra=max(rf.z,0.0);float rr=180.0+ra*18.0;
   float rd=length(vec2(recoveryPosition.x-rf.x,(recoveryPosition.z-rf.y)*.55));
   float ri=(1.0-smoothstep(rr-160.,rr+50.,rd))*(1.0-smoothstep(rf.w-220.,rf.w,abs(recoveryPosition.x)))*step(0.0,rf.z);
   float rn=recoveryNoise(recoveryPosition.xz*.065),rb=recoveryNoise(recoveryPosition.xz*.018+21.0);
   float rs=1.0-smoothstep(.18,.62,1.0-abs(normalize(recoveryNormal).y));
   float rm=rc==3?.48:(rc==4||rc==5)?.66:rc==6?.7:rc==1||rc==2?.85:1.0;
   float recoveryWet=(.38+.62*smoothstep(0.,50.,ra))*ri*rm*(.35+.65*smoothstep(.22,.8,rn))*rs;
   float recoveryCover=smoothstep(.5,.79,rb)*(.18+.82*smoothstep(0.,180.,ra))*ri*rs;
   vec3 recoveryOrganic=rc==3?vec3(.26,.29,.17):rc==4||rc==5?vec3(.13,.22,.16):vec3(.14,.23,.105);
   diffuseColor.rgb*=mix(vec3(1.),vec3(.55,.63,.58),recoveryWet*.72);
   diffuseColor.rgb=mix(diffuseColor.rgb,recoveryOrganic,recoveryCover*.32);
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=max(.52,roughnessFactor-recoveryWet*.24);');
 };
 compile.recoveryBase=previous;material.onBeforeCompile=compile;
 const key=function(){return previousKey.call(material)+'|aurora-recovery-terrain-v2';};key.recoveryBase=previousKey;material.customProgramCacheKey=key;
 material.userData.recoveryTerrain={samplers:0,extraVaryings:material.userData.terrainBlend?0:2,deterministic:true};material.needsUpdate=true;
}

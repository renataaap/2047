// Three.js r186 MeshStandardMaterial hooks, checked against installed shader chunks.
// Geometry, not a shader displacement, remains the source of the Rapier terrain.
const names = ['rock','gravel','cracked'];
// Worst case for this material: albedo, normal, AO, roughness, metalness,
// Three's DFG LUT, sunlight shadow and the High profile's environment map.
// Counting only the nine layer textures misses these eight engine samplers.
const baseSamplers = 8;
const materialUniforms = new WeakMap();
export function terrainTextureBudget(maxTextures) {
 const limit = Number.isFinite(maxTextures) && maxTextures > 0 ? Math.floor(maxTextures) : 16;
 let available = Math.max(0, limit - baseSamplers);
 const colors = available >= names.length ? [...names] : [];
 available -= colors.length;
 const normals = colors.length ? names.slice(0, Math.min(names.length, available)) : [];
 available -= normals.length;
 const roughness = colors.length ? names.slice(0, Math.min(names.length, available)) : [];
 const blendSamplers = colors.length + normals.length + roughness.length;
 return {maxTextures:limit,baseSamplers,blendSamplers,totalSamplers:baseSamplers+blendSamplers,colors,normals,roughness};
}
export function applyTerrainBlend(material, layers, maxTextures) {
 const budget = terrainTextureBudget(maxTextures);
 material.userData.terrainBlendBudget = budget;
 if (!budget.colors.length) {
 material.onBeforeCompile = () => {};
 material.customProgramCacheKey = () => 'aurora-terrain-base-r186';
 material.userData.terrainBlend = false; material.needsUpdate = true;
 return false;
 }
 // Three reuses programs without calling onBeforeCompile again. All cached
 // programs must share live uniform slots before PBRLibrary prunes old variants.
 const bindings = materialUniforms.get(material) || {};
 materialUniforms.set(material, bindings);
 const bind = (name,value) => {
 if (bindings[name]) bindings[name].value = value;
 else bindings[name] = {value};
 };
 for (const name of names) {
 const maps=layers[name],prefix=`aurora_${name}`;
 bind(`${prefix}Color`,maps.color); bind(`${prefix}Normal`,maps.normal);
 bind(`${prefix}Rough`,maps.arm || maps.roughness);
 bind(`${prefix}Scale`,{x:1/maps.tileMeters[0],y:1/maps.tileMeters[1]});
 }
 material.onBeforeCompile = shader => {
 const declarations = ['varying vec3 auroraPosition;', 'varying vec3 auroraNormal;'];
 for (const name of names) {
 const maps = layers[name], prefix = `aurora_${name}`;
 shader.uniforms[`${prefix}Color`] = bindings[`${prefix}Color`];
 if (budget.normals.includes(name)) shader.uniforms[`${prefix}Normal`] = bindings[`${prefix}Normal`];
 if (budget.roughness.includes(name)) shader.uniforms[`${prefix}Rough`] = bindings[`${prefix}Rough`];
 shader.uniforms[`${prefix}Scale`] = bindings[`${prefix}Scale`];
 declarations.push(`uniform sampler2D ${prefix}Color; uniform vec2 ${prefix}Scale;`);
 if (budget.normals.includes(name)) declarations.push(`uniform sampler2D ${prefix}Normal;`);
 if (budget.roughness.includes(name)) declarations.push(`uniform sampler2D ${prefix}Rough;`);
 }
 shader.vertexShader = 'varying vec3 auroraPosition; varying vec3 auroraNormal;\n' + shader.vertexShader;
 shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nauroraPosition = (modelMatrix * vec4(position, 1.0)).xyz; auroraNormal = normalize(mat3(modelMatrix) * normal);');
 shader.fragmentShader = declarations.join('\n') + '\n' + shader.fragmentShader;
 const weights = `\n float az = auroraPosition.z;\n float at = max(0.0, -az - 240.0);\n float ax = sin(at / 390.0) * 24.0 * min(at / 300.0, 1.0);\n float ad = abs(auroraPosition.x - ax);\n if (az < -650.0 && az > -1750.0) ad = min(ad, abs(auroraPosition.x - ax - sin(clamp((-az - 650.0)/1100.0,0.0,1.0)*3.14159265)*350.0));\n float an = clamp(.5 + .26*sin(auroraPosition.x*.047 + sin(az*.031)) + .24*sin(az*.019 + auroraPosition.x*.023),0.0,1.0);\n float ar = clamp(smoothstep(.07,.36,1.0-normalize(auroraNormal).y) + smoothstep(4.0,12.0,auroraPosition.y - sin(az/180.0)*1.3)*.4,0.0,.92);\n float ag = (1.0-smoothstep(8.0,23.0,ad))*(1.0-ar)*.88;\n float ac = smoothstep(.35,.8,an)*(1.0-ar)*(1.0-ag)*.75;\n vec2 auv = auroraPosition.xz;\n `;
 const color = names.map((name, i) => `diffuseColor.rgb = mix(diffuseColor.rgb, texture2D(aurora_${name}Color, auv*aurora_${name}Scale).rgb, ${['ar','ag','ac'][i]});`).join('\n');
 shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n' + weights + color);
 const roughness = budget.roughness.map(name => `roughnessFactor = mix(roughnessFactor, texture2D(aurora_${name}Rough, auv*aurora_${name}Scale).g, ${['ar','ag','ac'][names.indexOf(name)]});`).join('\n');
 shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n' + roughness);
 const normal = budget.normals.map(name => `auroraMapN = normalize(mix(auroraMapN, texture2D(aurora_${name}Normal, auv*aurora_${name}Scale).xyz*2.0-1.0, ${['ar','ag','ac'][names.indexOf(name)]}));`).join('\n');
 shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_maps>', `\n #ifdef USE_NORMALMAP_TANGENTSPACE\n vec3 auroraMapN = texture2D(normalMap, vNormalMapUv).xyz*2.0-1.0;\n ${normal}\n auroraMapN.xy *= normalScale;\n normal = normalize(tbn * auroraMapN);\n #else\n #include <normal_fragment_maps>\n #endif\n `);
 };
 material.customProgramCacheKey = () => `aurora-terrain-blend-r186-v2:${budget.normals.join(',')}:${budget.roughness.join(',')}`;
 material.userData.terrainBlend = true; material.needsUpdate = true;
 return true;
}

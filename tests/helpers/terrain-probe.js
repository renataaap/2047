// Observe real WebGL programs and occlusion queries. The optional capability
// override selects the 16-unit path on SwiftShader; it does not emulate a GPU.
export async function installTerrainProbe(page,textureUnits=16){
 await page.addInitScript(limit=>{
  const original=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type,...args){
   const gl=original.call(this,type,...args);
   if(!gl||type!=='webgl2'||gl.__terrainProbe)return gl;
   gl.__terrainProbe=true;
   const get=gl.getParameter.bind(gl),hardwareLimit=get(gl.MAX_TEXTURE_IMAGE_UNITS);
   if(limit)gl.getParameter=name=>name===gl.MAX_TEXTURE_IMAGE_UNITS?Math.min(limit,hardwareLimit):get(name);
   const terrain=new Set(),queries=[];
   const link=gl.linkProgram.bind(gl);
   gl.linkProgram=program=>{
    link(program);
    if(gl.getAttachedShaders(program).some(shader=>gl.getShaderSource(shader).includes('auroraPosition')))terrain.add(program);
   };
   const samplerTypes=[gl.SAMPLER_2D,gl.SAMPLER_CUBE,gl.SAMPLER_2D_SHADOW,gl.SAMPLER_2D_ARRAY,gl.SAMPLER_2D_ARRAY_SHADOW,gl.INT_SAMPLER_2D,gl.UNSIGNED_INT_SAMPLER_2D];
   let armed=false;
   const draw=gl.drawElements.bind(gl);
   gl.drawElements=(...parameters)=>{
    if(armed&&queries.length<24&&terrain.has(get(gl.CURRENT_PROGRAM))){
     const query=gl.createQuery();gl.beginQuery(gl.ANY_SAMPLES_PASSED,query);draw(...parameters);gl.endQuery(gl.ANY_SAMPLES_PASSED);queries.push(query);
    }else draw(...parameters);
   };
   window.__TERRAIN_PROBE__={
    arm(){armed=true;for(const q of queries)gl.deleteQuery(q);queries.length=0;},
    report(){return {
     hardwareLimit,selectedLimit:gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
     programs:[...terrain].filter(p=>gl.isProgram(p)).map(program=>{
      const samplers=Array.from({length:gl.getProgramParameter(program,gl.ACTIVE_UNIFORMS)},(_,i)=>gl.getActiveUniform(program,i)).filter(u=>samplerTypes.includes(u.type)).map(u=>({name:u.name,size:u.size}));
      const recoveryLocation=gl.getUniformLocation(program,'auroraRecovery[0]');
      return {recoveryCore:recoveryLocation?Array.from(gl.getUniform(program,recoveryLocation)):null,linked:gl.getProgramParameter(program,gl.LINK_STATUS),log:gl.getProgramInfoLog(program),samplers,samplerCount:samplers.reduce((sum,s)=>sum+s.size,0)};
     }),
     completedQueries:queries.filter(q=>gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE)).length,
     visibleTerrainDraws:queries.filter(q=>gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE)&&gl.getQueryParameter(q,gl.QUERY_RESULT)).length,
     error:gl.getError(),
    };},
   };
   return gl;
  };
 },textureUnits);
}

// Development-only caller, installed exclusively by Game's existing debug guard.
// It advances the very same fixed update. No positions, velocities, fuel, damage
// or mission progress are assigned. Rendering remains on the existing RAF.
export function installDiagnosticSteps(game,debug){
 const frame=()=>{const p=game.vehicle.body.translation(),q=game.vehicle.body.rotation();return {position:[p.x,p.y,p.z],quaternion:[q.x,q.y,q.z,q.w],playerPosition:Object.values(game.player.body.translation()),playerYaw:game.player.yaw,speed:game.vehicle.signedSpeed(),mode:game.state.mode,engineOn:game.state.engineOn,steps:game.loop.totalSteps,surface:game.state.surface,fuel:game.state.fuel,integrity:game.campaign.seed.integrity,massKg:game.vehicle.body.mass(),loaded:game.state.loaded,wheelContacts:Array.from({length:6},(_,i)=>game.vehicle.controller.wheelIsInContact(i))};};
 debug.controlledStepping=enabled=>{game.diagnosticStepping=!!enabled;game.last=performance.now();game.loop.reset();};
 debug.frame=frame;
 debug.route=()=>game.navigation.route?{path:game.navigation.route.path,segments:game.navigation.route.segments,destination:game.navigation.route.destination}:null;
 debug.publish=()=>game.emit();
 debug.step=(input,count=1)=>{
  if(!game.diagnosticStepping||!game.active())throw Error('Controlled physics stepping requires an active development game.');
  if(!Number.isInteger(count)||count<1||count>600)throw Error('Invalid physics step count');
  game.input.override={...input};
  for(let i=0;i<count;i++){
   if(game.loop.totalSteps%15===0){const p=game.context()==='walking'?game.player.body.translation():game.current;game.world.update(p,game.rendering.preset.distance);game.cityWorld.update(p,game.rendering.preset.distance,game.dayNight.current?.night||0);game.wayfindingWorld.update(p);game.networkWorld.update(game.campaign,p,0);game.roadWorld.update(game.campaign,p,0);game.features.update(game.campaign,p,0,game.rendering,game.storm());game.navigation.update(game.current,game.campaign,game.state.massKg||9000);}
   game.loop.advance(1/60,dt=>game.fixedUpdate(dt));
  }
  game.last=performance.now();return frame();
 };
}

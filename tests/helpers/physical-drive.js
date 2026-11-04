import {expect} from '@playwright/test';

export async function controlledPhysics(page){
 await page.evaluate(()=>window.__GAME_DEBUG__.controlledStepping(true));
}
export async function walkPhysical(page,points){
 for(const target of points){
  let done=false;
  for(let batch=0;batch<160&&!done;batch++){
   const result=await page.evaluate(({x,z})=>{
    const d=window.__GAME_DEBUG__;let frame=d.frame(),distance=0,maxStep=0;
    if(frame.mode!=='walking')throw Error(`Walking requires walking, got ${frame.mode}`);
    for(let i=0;i<120;i++){
     const p=frame.playerPosition,dx=x-p[0],dz=z-p[2],r=Math.hypot(dx,dz);
     if(r<.5){d.step({},12);d.publish();return {done:true,frame:d.frame(),distance,maxStep};}
     const yaw=frame.playerYaw||0,scale=Math.min(1,r/1.1),old=p;
     frame=d.step({x:(dx*Math.cos(yaw)-dz*Math.sin(yaw))/r*scale,z:(dx*Math.sin(yaw)+dz*Math.cos(yaw))/r*scale});
     const moved=Math.hypot(frame.playerPosition[0]-old[0],frame.playerPosition[2]-old[2]);distance+=moved;maxStep=Math.max(maxStep,moved);
    }
    d.publish();return {done:false,frame,distance,maxStep};
   },target);
   if(result.maxStep>.2)throw Error('Walking position jumped instead of capsule movement');
   done=result.done;
   if(batch>25&&result.distance<.01)throw Error(`Physical walking blocked near ${result.frame.playerPosition} on the way to ${target.x},${target.z}`);
  }
  expect(done,`walk to ${target.x},${target.z}`).toBe(true);
 }
}

export async function selectDestination(page,id,preference='safe',via=null){
 await page.keyboard.press('KeyM');await expect(page.getByTestId('route-planner')).toBeVisible();
 await page.getByLabel('Destino da viagem').selectOption(id);
 if(via==='vale-cinzas')await page.getByRole('button',{name:'Rota B · Cinza Nova e estrada do Vale',exact:true}).click();
 else {const labels={fast:'Mais rápida',safe:'Mais segura',economy:'Mais econômica'};await page.getByRole('button',{name:new RegExp(`^${labels[preference]}`)}).click();}
 await page.keyboard.press('Escape');await expect.poll(async()=>page.evaluate(()=>window.__GAME_DEBUG__.frame().mode)).toBe('driving');
}

// Pure pursuit controls the original Rapier truck. The test never assigns a
// position/velocity or changes fuel, load, damage or gear state.
export async function drivePhysical(page,{cruise=9,maxSeconds=700,label='route',path=null,wheelbase=4.675}={}){
 await page.evaluate(({cruise,label,path,wheelbase})=>{
  const d=window.__GAME_DEBUG__,r=d.route();if(!r?.path?.length)throw Error('No active graph route');
  const points=path||r.path,frame=d.frame();
  const angle=v=>Math.atan2(Math.sin(v),Math.cos(v));
  const pointAt=s=>{let lo=0,hi=points.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(points[mid].s<s)lo=mid;else hi=mid;}const a=points[lo],b=points[hi],t=Math.max(0,Math.min(1,(s-a.s)/Math.max(.001,b.s-a.s)));return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t};};
  const driver={label,cruise,points,cursor:1,start:frame,frame,travelled:0,maxStep:0,maxOffRoute:0,steps:0,samples:[],done:false,lastProgress:0,stallSteps:0};
  driver.run=count=>{
   for(let tick=0;tick<count&&!driver.done;tick++){
    const f=d.frame();if(f.mode!=='driving')throw Error(`Drive requires driving, got ${f.mode}`);if(!f.engineOn)throw Error('Engine stopped during physical route');const p={x:f.position[0],z:f.position[2]};let best;
    for(let i=Math.max(1,driver.cursor-12);i<Math.min(points.length,driver.cursor+85);i++){
     const a=points[i-1],b=points[i],dx=b.x-a.x,dz=b.z-a.z,n=dx*dx+dz*dz,t=Math.max(0,Math.min(1,n?((p.x-a.x)*dx+(p.z-a.z)*dz)/n:0)),x=a.x+dx*t,z=a.z+dz*t,distance=Math.hypot(p.x-x,p.z-z);
     if(!best||distance<best.distance)best={distance,index:i,s:a.s+(b.s-a.s)*t};
    }
    driver.cursor=best.index;driver.maxOffRoute=Math.max(driver.maxOffRoute,best.distance);const end=points.at(-1),remaining=Math.max(0,end.s-best.s),atEnd=Math.hypot(p.x-end.x,p.z-end.z)<3.2||remaining<1.5;
    if(atEnd){let previous=f;for(let j=0;j<60;j++){const next=d.step({handbrake:true,brake:1}),moved=Math.hypot(next.position[0]-previous.position[0],next.position[2]-previous.position[2]);driver.travelled+=moved;driver.maxStep=Math.max(driver.maxStep,moved);previous=next;driver.steps++;}driver.frame=previous;driver.done=Math.abs(driver.frame.speed)<.3&&Math.hypot(driver.frame.position[0]-end.x,driver.frame.position[2]-end.z)<4;if(driver.done)break;if(Math.hypot(driver.frame.position[0]-end.x,driver.frame.position[2]-end.z)>7)throw Error(`Physical parking overshot the bay at ${driver.frame.position}`);continue;}
    const speed=Math.abs(f.speed),look=Math.max(7,4+speed*1.5),aim=pointAt(Math.min(end.s,best.s+look)),q=f.quaternion,yaw=Math.atan2(2*(q[3]*q[1]+q[0]*q[2]),1-2*(q[1]*q[1]+q[0]*q[0])),error=angle(Math.atan2(-(aim.x-p.x),-(aim.z-p.z))-yaw);
    const a=pointAt(best.s+4),b=pointAt(best.s+12),c=pointAt(best.s+26),v=pointAt(best.s+34),bend=Math.abs(angle(Math.atan2(v.x-c.x,v.z-c.z)-Math.atan2(b.x-a.x,b.z-a.z)))/22;
    let target=Math.min(driver.cruise,Math.sqrt(1.05/Math.max(.001,bend)),Math.sqrt(2*.65*Math.max(0,remaining-2)));
    if(p.x<-60&&p.x>-440&&p.z<-540&&p.z>-1000)target=Math.min(target,4.8);
    if(f.surface==='terra')target=Math.min(target,6.8);
    if(Math.abs(error)>1)target=Math.min(target,2.4);
    const maxSteer=Math.min(.62,Math.atan(2.5*wheelbase/(speed*speed+5))),desired=Math.atan(2*wheelbase*Math.sin(error)/look),steer=Math.max(-1,Math.min(1,(Math.abs(error)>2?Math.sign(error)*.62:desired)/maxSteer));
    const braking=speed>target+.35,throttle=braking?-1:speed<target-.25?.85:0,handbrake=braking&&remaining<45;
    const next=d.step({throttle,steer,handbrake}),moved=Math.hypot(next.position[0]-f.position[0],next.position[2]-f.position[2]);driver.travelled+=moved;driver.maxStep=Math.max(driver.maxStep,moved);driver.frame=next;driver.steps++;
    if(moved>1)throw Error('Vehicle position jumped instead of integration');
    if(best.s-driver.lastProgress>.2){driver.lastProgress=best.s;driver.stallSteps=0;}else driver.stallSteps++;
    if(driver.steps%120===0)driver.samples.push({position:next.position,speed:next.speed,fuel:next.fuel,surface:next.surface,target,throttle,handbrake,remaining,offRoute:best.distance,progress:best.s,steps:next.steps});
    if(driver.stallSteps>60*24)throw Error(`Physical route stalled at ${next.position}, progress ${best.s}, speed ${next.speed}`);
    if(best.distance>22)throw Error(`Physical driver left the built corridor by ${best.distance} m at ${next.position}`);
   }
   d.publish();return {done:driver.done,position:driver.frame.position,speed:driver.frame.speed,steps:driver.steps,travelled:driver.travelled,maxStep:driver.maxStep,maxOffRoute:driver.maxOffRoute};
  };
  window.__AURORA_PHYSICAL_DRIVER__=driver;
 },{cruise,label,path,wheelbase});
 let result;
 for(let batch=0;batch<Math.ceil(maxSeconds/3)+5;batch++){
  result=await page.evaluate(()=>window.__AURORA_PHYSICAL_DRIVER__.run(180));
  if(result.done)break;
 }
 const proof=await page.evaluate(()=>{const d=window.__AURORA_PHYSICAL_DRIVER__;return {label:d.label,start:d.start,finish:d.frame,travelledMetres:d.travelled,maxStepMetres:d.maxStep,maxOffRouteMetres:d.maxOffRoute,simulatedSeconds:d.steps/60,samples:d.samples,done:d.done,parkingDistanceMetres:Math.hypot(d.frame.position[0]-d.points.at(-1).x,d.frame.position[2]-d.points.at(-1).z),teleportsDuringDrive:0,method:'Actual Game.fixedUpdate at 60 Hz, original controls, drivetrain, resources, collisions and Rapier. Accelerated diagnostic time; not human real-time gameplay.'};});
 expect(proof.done,JSON.stringify(result)).toBe(true);expect(proof.maxStepMetres).toBeLessThan(1);expect(proof.parkingDistanceMetres).toBeLessThan(4);return proof;
}

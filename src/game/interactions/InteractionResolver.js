// One descriptor is presented by the HUD and executed by F. Geometry is checked
// through the injected visibility function, keeping selection deterministic/testable.
export function eligible(target,observer,visible=()=>true){
 const dx=target.position.x-observer.x,dz=target.position.z-observer.z,d=Math.hypot(dx,dz);
 if(d>target.range||Math.abs((target.position.y??observer.y)-observer.y)>3)return false;
 const dot=d<.01?1:(dx*-Math.sin(observer.yaw||0)+dz*-Math.cos(observer.yaw||0))/d;
 return (d<2.2||dot>-.65)&&visible(target);
}
export class InteractionResolver {
 constructor(){this.presented=null;}
 select(candidates,observer,visible){
  const ranked=candidates.filter(t=>eligible(t,observer,visible)).map(t=>{
   const dx=t.position.x-observer.x,dz=t.position.z-observer.z,d=Math.hypot(dx,dz),dot=d<.01?1:(dx*-Math.sin(observer.yaw||0)+dz*-Math.cos(observer.yaw||0))/d;
   return {target:t,score:(t.priority||0)+(1-d/t.range)*60+dot*15+(t.available===false?-4:0)+(this.presented?.key===t.key?5:0)};
  }).sort((a,b)=>b.score-a.score||a.target.key.localeCompare(b.target.key));
  this.presented=ranked[0]?.target||null;return this.presented;
 }
 execute(key,observer,visible,dispatch){const target=this.presented;if(!target||key&&target.key!==key||!eligible(target,observer,visible))return false;dispatch(target);return true;}
}

import {ROAD_NETWORK_VERSION} from '../../data/roadNetwork.js';
import {NETWORK_EDGES} from '../navigation/roadIndex.js';
import {edgeAllowed} from '../navigation/routePlanner.js';
import {inCityBuilding} from '../../data/cityLayout.js';
import {heightAt,legacyHeightAt,roadX,roadHeight,roadHalfWidth,detourX,networkDetourX,routeAt} from '../world/terrain.js';
import {terrainGeometry} from '../world/terrainGeometry.js';
import {meshHeightAt} from '../world/surfaceHeight.js';
import {roadDepression} from '../world/roadDamage.js';
import {upgradeTravel} from './travelState.js';
import {upgradeRoad} from '../missions/road.js';

function oldPhysicalHeight(x,z,cache){const cx=Math.round(x/1024),cz=Math.round(z/1024),key=`${cx},${cz}`;if(!cache.has(key))cache.set(key,terrainGeometry(cx,cz,legacyHeightAt));let y=meshHeightAt(cache.get(key),x,z)??legacyHeightAt(x,z);if(Math.abs(x-roadX(z))<roadHalfWidth(z))y=Math.max(y,roadHeight(z)+.09-roadDepression(x,z,roadX(z)));if(z<-650&&z>-1750&&Math.abs(x-detourX(z))<5||routeAt(z)&&Math.abs(x-networkDetourX(z))<5)y=Math.max(y,roadHeight(z)+.09);return y;}
function safePoint(position,c,margin){let best=null;for(const e of NETWORK_EDGES){if(!edgeAllowed(e,c))continue;for(let i=1;i<e.samples.length;i++){const p=e.samples[i],d=Math.hypot(position[0]-p.x,position[2]-p.z);if(d>180||best&&d>=best.distance||inCityBuilding(p.x,p.z,margin))continue;best={...p,previous:e.samples[i-1],distance:d};}}return best;}
export function migrateRoadSave(source,groundHeight=heightAt){
 const save=structuredClone(source),c=upgradeTravel(save.campaign);if(c.geography.version>=ROAD_NETWORK_VERSION)return {save,relocations:[],migrated:false};upgradeRoad(c);
 const relocations=[],legacyMeshes=new Map();
 for(const entity of ['truck','player']){
  const from=[...save[entity].position],old=oldPhysicalHeight(from[0],from[2],legacyMeshes),ground=groundHeight(from[0],from[2]),blocked=inCityBuilding(from[0],from[2],entity==='truck'?5:1);let to=[...from],reason;
  if(blocked){const safe=safePoint(from,c,entity==='truck'?5:1);if(!safe)throw Error('Não foi encontrada uma posição segura próxima para migrar a partida.');to=[safe.x,groundHeight(safe.x,safe.z)+(entity==='truck'?1.05:1.1),safe.z];reason='new-building';if(entity==='truck'){const yaw=Math.atan2(-(safe.x-safe.previous.x),-(safe.z-safe.previous.z));save.truck.rotation=[0,Math.sin(yaw/2),0,Math.cos(yaw/2)];}}
  else if(Math.abs(ground-old)>.24){to[1]+=ground-old;reason='surface-height';}
  if(reason){save[entity].position=to;relocations.push({version:ROAD_NETWORK_VERSION,entity,reason,from,to});}
 }
 for(const g of legacyMeshes.values())g.dispose();
 c.geography={version:ROAD_NETWORK_VERSION,migrations:[...c.geography.migrations,...relocations].slice(-16)};
 return {save,relocations,migrated:true};
}

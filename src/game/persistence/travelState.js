import {ROAD_NETWORK_VERSION,ROAD_DESTINATIONS} from '../../data/roadNetwork.js';
export function upgradeTravel(c){c.navigation={version:1,destination:null,preference:'safe',via:null,viaCompleted:false,...c.navigation};c.geography={version:0,migrations:[],...c.geography};return c;}
export function validTravel(c){
 const n=c.navigation,g=c.geography,vec=v=>Array.isArray(v)&&v.length===3&&v.every(n=>Number.isFinite(n)&&Math.abs(n)<=100000);
 if(n!==undefined&&(!n||n.version!==1||!['fast','safe','economy'].includes(n.preference)||n.destination!==null&&!ROAD_DESTINATIONS.some(d=>d.id===n.destination)||n.via!=null&&!ROAD_DESTINATIONS.some(d=>d.id===n.via&&['junction','waypoint'].includes(d.kind))||n.viaCompleted!==undefined&&typeof n.viaCompleted!=='boolean'))return false;
 if(g!==undefined&&(!g||![0,ROAD_NETWORK_VERSION].includes(g.version)||!Array.isArray(g.migrations)||g.migrations.length>16||g.migrations.some(m=>!m||m.version!==ROAD_NETWORK_VERSION||!['truck','player'].includes(m.entity)||!['new-building','surface-height'].includes(m.reason)||!vec(m.from)||!vec(m.to))))return false;
 return true;
}

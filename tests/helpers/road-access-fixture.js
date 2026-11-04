import {createCampaign,receiveSeed} from '../../src/game/missions/campaign.js';
import {upgradeCampaign,anchor,openVault,syncFirst} from '../../src/game/missions/network.js';
import {CORES} from '../../src/data/network.js';
import {ROAD_DESTINATIONS} from '../../src/data/roadNetwork.js';
import {NODE_BY_ID} from '../../src/game/navigation/roadIndex.js';
import {validSave} from '../../src/game/persistence/schema.js';

// A local access audit starts at the entry, with a canonical saved campaign.
// This fixture does not represent a journey across the whole continent.
export function roadAccessFixture(id){
 const destination=ROAD_DESTINATIONS.find(d=>d.id===id);
 const number=Number(id.split('-')[1]);
 const campaign=upgradeCampaign(createCampaign(2047));
 campaign.geography.version=1;campaign.road.generator=true;
 Object.assign(campaign.inventory.truck,{parts:20,water:10,scrap:20,diesel:0,food:2});
 Object.assign(campaign.inventory.player,{parts:4,water:2,scrap:0,diesel:0,food:2});
 for(const name of Object.keys(campaign.components))campaign.components[name]=100;
 receiveSeed(campaign);syncFirst(campaign);
 for(const core of CORES.filter(k=>k.number<number)){
  if(core.number>1&&!openVault(campaign,core.id))throw Error(`Fixture could not open ${core.id}`);
  if(!anchor(campaign,core.id)?.success)throw Error(`Fixture could not activate ${core.id}`);
 }
 if(id.startsWith('core-')&&number>1&&!openVault(campaign,id))throw Error(`Fixture could not load ${id}`);
 const start=NODE_BY_ID.get(destination.accessEntry);
 const data={schemaVersion:3,truck:{position:[start.x,start.y+1.1,start.z],rotation:[0,0,0,1]},player:{position:[start.x-3,start.y+1.1,start.z]},context:'driving',fuel:80,temperature:26,engineOn:false,campaign};
 if(!validSave(data))throw Error(`Invalid access fixture ${id}`);
 return {data,destination};
}

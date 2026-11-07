import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {roadAccessFixture} from '../helpers/road-access-fixture.js';
import {ensureFleet,captureFleet} from '../../src/game/garage/fleet.js';
import {ensureLogistics,refreshOffers,acceptContract,loadContract,stepLogistics,completeContract} from '../../src/game/logistics/contracts.js';
import {evidencePath} from '../helpers/evidence-path.js';
test('API: contratos opcionais nos três slots, revisão e dados inválidos',async({request})=>{
 const dir=evidencePath('contracts-api');await mkdir(dir,{recursive:true});const saves=[];
 for(const slot of ['1','2','3']){const {data}=roadAccessFixture('core-1');ensureFleet(data.campaign,data);ensureLogistics(data.campaign);const c=data.campaign,o=refreshOffers(c,'cinza')[0];acceptContract(c,'cinza',o.id,c.fleet.active);
  if(slot!=='1')loadContract(c,'cinza',c.fleet.active,{ok:true});
  if(slot==='3'){for(let i=0;i<Math.ceil(c.logistics.active.route.distance);i++)stepLogistics(c,1/60,1);completeContract(c,'cotovelo',{ok:true});}captureFleet(c,data);
  const response=await request.post('/api/saves',{data:{slot,data}});expect(response.status()).toBe(201);const saved=await response.json();expect(saved.data.campaign.logistics).toEqual(c.logistics);expect(saved.data.campaign.career).toEqual(c.career);expect(saved.data.campaign.economy).toEqual(c.economy);saves.push(saved);
 }
 const old=saves[1],written=await request.put('/api/saves/2',{data:{version:old.version,data:old.data}});expect(written.status()).toBe(200);const current=await written.json();expect((await request.put('/api/saves/2',{data:{version:old.version,data:old.data}})).status()).toBe(409);
 const invalid=structuredClone(current.data);invalid.campaign.logistics.cargo.quantity++;
 const rejected=await request.put('/api/saves/2',{data:{version:current.version,data:invalid}});expect(rejected.status()).toBe(400);expect((await(await request.get('/api/saves/2')).json()).data.campaign.logistics).toEqual(old.data.campaign.logistics);
 await request.storageState({path:'/tmp/aurora-contracts-three-slots-storage.json'});await writeFile(`${dir}/slots-before-restart.json`,JSON.stringify({method:'Synthetic schema/transaction fixtures. Not a physical delivery demonstration.',saves:[saves[0],current,saves[2]],duplicateStatus:409,invalidStatus:400},null,2)+'\n');
});

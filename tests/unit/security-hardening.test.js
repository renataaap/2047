import {it,expect} from 'vitest';
import {validSave} from '../../src/game/persistence/schema.js';
import {identity,withIdentity} from '../../src/lib/api.js';
import {createCampaign} from '../../src/game/missions/campaign.js';
import {upgradeCampaign} from '../../src/game/missions/network.js';
const save=c=>({schemaVersion:3,truck:{position:[0,2,5],rotation:[0,0,0,1]},player:{position:[-3,1,5]},context:'driving',fuel:40,temperature:30,engineOn:false,campaign:c});
it('SEC-007: save malformado é recusado sem lançar exceção',()=>{for(const key of ['components','inventory','flags','network','cores']){for(const bad of [null,undefined,7,'x',[]]){const c=upgradeCampaign(createCampaign());c[key]=bad;expect(()=>validSave(save(c))).not.toThrow();expect(validSave(save(c))).toBe(false);}}for(const bad of [null,undefined,0,'',[],{}])expect(validSave(bad)).toBe(false);expect(validSave(save(upgradeCampaign(createCampaign())))).toBe(true);});
it('SEC-007: Origin inválido responde 400, não 500',async()=>{const handler=withIdentity(async()=>Response.json({ok:true}));const r=await handler(new Request('http://127.0.0.1:3000/api/saves',{method:'POST',headers:{origin:'null',host:'127.0.0.1:3000'}}),{});expect(r.status).toBe(400);});
it('SEC-004: só UUIDv4 estrito é aceito como identidade do cliente',()=>{const req=c=>new Request('http://127.0.0.1:3000/api/saves',{headers:{cookie:`playerId=${c}`}});const good='3f1c2b7e-9a4d-4c1b-8e2f-0a1b2c3d4e5f';expect(identity(req(good)).id).toBe(good);for(const weak of ['00000000-0000-0000-0000-000000000000','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','3f1c2b7e-9a4d-1c1b-8e2f-0a1b2c3d4e5f']){const id=identity(req(weak)).id;expect(id).not.toBe(weak);expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4/);}});

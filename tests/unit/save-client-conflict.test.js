import {it,expect,vi,afterEach} from 'vitest';
import {SaveClient} from '../../src/game/persistence/client.js';
const reply=(status,body)=>Promise.resolve({ok:status<300,status,json:()=>Promise.resolve(body)});
afterEach(()=>vi.unstubAllGlobals());
function server(stored){return vi.fn((url,o={})=>{if(url==='/api/saves')return reply(200,{saves:[{slot:'1'}]});if(o.method==='PUT')return reply(409,{error:{message:'VERSION_CONFLICT'}});return reply(200,stored);});}
it('adota a revisão do servidor quando um PUT anterior gravou estes mesmos dados',async()=>{const data={schemaVersion:3,fuel:12};vi.stubGlobal('fetch',server({slot:'1',version:8,data}));const s=new SaveClient();s.slot='1';s.version=7;const saved=await s.save(data,'1');expect(saved.version).toBe(8);expect(s.version).toBe(8);expect(s.pending).toBe(false);});
it('recusa sobrescrever progresso diferente gravado por outra aba',async()=>{vi.stubGlobal('fetch',server({slot:'1',version:8,data:{schemaVersion:3,fuel:99}}));const s=new SaveClient();s.slot='1';s.version=7;await expect(s.save({schemaVersion:3,fuel:12},'1')).rejects.toMatchObject({status:409});expect(s.version).toBe(7);expect(s.pending).toBe(false);});

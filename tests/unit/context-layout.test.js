import {describe,it,expect} from 'vitest';
import {planCell,placementAllowed,reserved,roadClearance} from '../../src/game/world/contextLayout.js';
import {RESERVATIONS} from '../../src/data/ambience.js';
describe('ambientação contextual',()=>{
 it('reproduz composições e não depende da ordem de carregamento',()=>{const first=planCell(-8);planCell(-3);expect(planCell(-8)).toEqual(first);expect(planCell(-9)).not.toEqual(first);});
 it('preserva ruas, rotas alternativas, estabelecimentos e áreas de missão no continente',()=>{let count=0;for(let i=-131;i<=0;i++)for(const p of planCell(i)){count++;expect(roadClearance(p.x,p.z)).toBeGreaterThanOrEqual(9+p.radius);expect(reserved(p.x,p.z,p.radius)).toBe(false);}expect(count).toBeGreaterThan(100);for(const p of RESERVATIONS)expect(placementAllowed(p.x,p.z,1)).toBe(false);});
 it('recusa declive excessivo e alturas inválidas',()=>{expect(placementAllowed(40,-300,3,(x)=>x*4)).toBe(false);expect(placementAllowed(40,-300,3,()=>NaN)).toBe(false);});
 it('representa as cinco regiões com vocabulários distintos',()=>{const kinds=z=>new Set(planCell(Math.round(z/160),()=>0).map(p=>p.kind));expect([...kinds(-11200)]).toContain('boat');expect([...kinds(-8800)]).toContain('facade');expect([...kinds(-19100)]).toContain('antenna');});
});

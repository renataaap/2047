# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: restoration.spec.js >> cinemática completa e redução de movimento devolvem o controle sem cobrar de novo
- Location: tests/e2e/restoration.spec.js:34:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 201
Received: 409
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - main [ref=e3]:
    - generic "Mundo 3D da Rede Aurora e Titã Rocha Clara" [ref=e4]
    - generic:
      - generic:
        - generic:
          - generic:
            - text: Mar de Cinzas
            - generic: "02"
          - heading "Obtenha a Semente 2" [level=2]
          - paragraph: Cofre 2, km 6.15. Substituir a manivela do mecanismo · 1 peça no Titã.
          - generic:
            - generic: ABRIGO 07
            - generic: 2.9 / 21,0 KM
        - generic [aria-hidden]:
          - generic: "NO"
          - generic: "N"
          - generic: NE
          - generic: ▾
        - button "Uma pausa na estrada" [ref=e5] [cursor=pointer]:
          - generic [ref=e8]: ESC
      - navigation [ref=e9]:
        - button "J · Missões" [ref=e10] [cursor=pointer]
        - button "M · Mapa" [ref=e11] [cursor=pointer]
        - button "Tab · Inventário" [ref=e12] [cursor=pointer]
        - button "V · Inspeção" [ref=e13] [cursor=pointer]
        - button "R · Rádio" [ref=e14] [cursor=pointer]
        - button "H · Expedição" [ref=e15] [cursor=pointer]
      - generic:
        - text: EXPLORAÇÃO A PÉ · primeira pessoa · C alternar
        - time: · 09:01 · Manhã
      - generic:
        - generic:
          - text: Hidratação
          - strong: 100%
          - meter "Hidratação 100%"
        - generic:
          - text: Saciedade
          - strong: 100%
          - meter "Saciedade 100%"
        - generic:
          - text: Fadiga
          - strong: 0%
          - meter "Fadiga 0%"
      - complementary "Navegação inercial" [ref=e16]:
        - generic [ref=e17]:
          - generic [ref=e18]: MAPA INERCIAL
          - generic [ref=e19]:
            - button "Ampliar minimapa" [ref=e20] [cursor=pointer]: +
            - button "Ocultar minimapa" [ref=e21] [cursor=pointer]: ×
        - img "Caminhos e interações próximas" [ref=e22]:
          - generic "Rodovia · asfalto" [ref=e25]
          - generic "Rodovia · asfalto" [ref=e26]
          - generic "Acesso ao estacionamento · asfalto" [ref=e27]
          - generic "Acesso ao estacionamento · asfalto" [ref=e28]
          - generic "Tomás" [ref=e30]
          - generic "Terminal do Núcleo 1" [ref=e32]
          - generic [ref=e38]: N ↑
        - generic [ref=e39]: Observe os acessos e interlocutores
        - button "Cofre 2 3,3 km · posição estimada" [ref=e41] [cursor=pointer]:
          - strong [ref=e42]: Cofre 2
          - generic [ref=e43]: 3,3 km · posição estimada
      - button "F Operar o Núcleo" [ref=e44] [cursor=pointer]:
        - generic [ref=e45]: F
        - text: Operar o Núcleo
      - generic: WASD mover · Shift correr · Espaço pular · clique para olhar · F interagir
      - status: Partida salva no servidor.
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | import {mkdir,writeFile} from 'node:fs/promises';
  3  | import {roadAccessFixture} from '../helpers/road-access-fixture.js';
  4  | import {installTerrainProbe} from '../helpers/terrain-probe.js';
  5  | import {evidencePath} from '../helpers/evidence-path.js';
  6  | import {anchor} from '../../src/game/missions/network.js';
  7  | import {heightAt} from '../../src/game/world/terrain.js';
  8  | import {CORES} from '../../src/data/network.js';
  9  | const state=page=>page.evaluate(()=>window.__GAME_DEBUG__.getState());
  10 | const waitPlants=page=>expect.poll(async()=>(await state(page)).restoration.vegetation.pendingCells,{timeout:120000,intervals:[500]}).toBe(0);
  11 | function fixture(id='core-1',active=false,legacy=false){const {data}=roadAccessFixture(id),k=CORES.find(k=>k.id===id);data.context='walking';data.truck.position=[k.number===1?7:k.x-14,heightAt(k.x-14,k.z+10)+1.7,k.z+10];data.player.position=[k.x-1,heightAt(k.x-1,k.z+10)+1.1,k.z+10];data.campaign.world.daySeconds=9*3600;if(active){expect(anchor(data.campaign,id)?.success).toBe(true);for(const r of Object.values(data.campaign.world.recovery.cores)){r.age=240;r.cinematicSeen=true;}if(legacy)delete data.campaign.world.recovery;}return data;}
> 12 | async function boot(page,data){await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0,footCamera:'first'})));expect((await page.request.post('/api/saves',{data:{slot:'1',data}})).status()).toBe(201);await page.goto('/');await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:120000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect.poll(async()=>(await state(page)).mode).toBe('walking');await page.evaluate(()=>{window.__GAME_DEBUG__.controlledStepping(true);window.__GAME_DEBUG__.step({handbrake:true},120);window.__GAME_DEBUG__.publish();});}
     |                                                                                                                                                                                                                                                              ^ Error: expect(received).toBe(expected) // Object.is equality
  13 | function collectErrors(page){const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});return errors;}
  14 | async function activate(page){await page.keyboard.press('KeyF');await expect(page.getByRole('button',{name:'Iniciar ativação',exact:true})).toBeEnabled();await page.getByRole('button',{name:'Iniciar ativação',exact:true}).click();await expect.poll(async()=>(await state(page)).campaign.cores['core-1'].state).toBe('active');await page.keyboard.press('Escape');}
  15 | async function advance(page,seconds){for(let i=0;i<Math.ceil(seconds/10);i++)await page.evaluate(n=>{window.__GAME_DEBUG__.step({handbrake:true},n);window.__GAME_DEBUG__.publish();},Math.round(Math.min(10,seconds-i*10)*60));}
  16 | async function save(page){await page.keyboard.press('Escape');await page.getByRole('button',{name:'Salvar / carregar partida'}).click();const response=page.waitForResponse(r=>r.url().endsWith('/api/saves/1')&&r.request().method()==='PUT');await page.getByRole('button',{name:'Salvar neste slot'}).first().click();expect((await response).status()).toBe(200);}
  17 | 
  18 | test('primeiro Núcleo: ativação, pular, estágios, diário e recarga sem duplicação',async({page})=>{
  19 |  test.setTimeout(600000);const dir=evidencePath('restoration/activation');await mkdir(dir,{recursive:true});const errors=collectErrors(page);await boot(page,fixture());const before=await state(page);await activate(page);await expect(page.getByRole('button',{name:/Pular apresentação/})).toBeVisible();const movie=await state(page);expect(movie.mode).toBe('cinematic');expect(movie.campaign.network.cargo).toBeNull();expect(movie.campaign.world.recovery.cores['core-1'].age).toBe(0);await page.screenshot({path:`${dir}/presentation.png`});await page.getByRole('button',{name:/Pular apresentação/}).click();await expect.poll(async()=>(await state(page)).mode).toBe('walking');await advance(page,.2);await waitPlants(page);const response=await state(page);expect(response.restoration.local.rainVisible).toBe(true);expect(response.restoration.vegetation.grass).toBeGreaterThan(0);
  20 |  await advance(page,60);await waitPlants(page);const initial=await state(page);expect(initial.restoration.progress[0].stage).toBe(2);await page.screenshot({path:`${dir}/initial.png`});await advance(page,180);await waitPlants(page);const advanced=await state(page);expect(advanced.restoration.progress[0].stage).toBe(3);expect(advanced.restoration.vegetation.trees).toBeGreaterThan(0);expect(advanced.restoration.vegetation.shrubs).toBeGreaterThan(0);expect(advanced.campaign.world.recovery.cores['core-1'].observed).toBe(14);expect(advanced.campaign.inventory).toEqual(before.campaign.inventory);expect(advanced.campaign.completedMissions.filter(id=>id==='aurora-1')).toHaveLength(1);await page.screenshot({path:`${dir}/advanced.png`});
  21 |  await page.keyboard.press('KeyJ');await expect(page.getByTestId('journal-nature:core-1:3')).toBeVisible();await page.keyboard.press('Escape');await page.keyboard.press('KeyM');await expect(page.getByLabel('Recuperação ambiental')).toContainText('Recuperação avançada');await page.keyboard.press('Escape');await save(page);
  22 |  const persisted=await (await page.request.get('/api/saves/1')).json();expect(persisted.data.campaign.world.recovery.cores['core-1']).toMatchObject({age:240,observed:14,cinematicSeen:true});await page.reload();await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:120000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect.poll(async()=>(await state(page)).mode).toBe('walking');await waitPlants(page);const loaded=await state(page);expect(loaded.campaign.inventory).toEqual(advanced.campaign.inventory);expect(loaded.restoration.vegetation.fingerprints).toEqual(advanced.restoration.vegetation.fingerprints);expect(loaded.restoration.cinematic.active).toBe(false);expect(loaded.restoration.cinematic.pending).toBeNull();expect(loaded.importedTruck.wheelBindings).toBe(6);await page.screenshot({path:`${dir}/reloaded.png`});expect(errors).toEqual([]);await writeFile(`${dir}/proof.json`,JSON.stringify({method:'Canonical local fixture at terminal. Real UI activation and skip; 60 Hz original simulation for 240 seconds of ecological time, not a human journey.',before,response,movie,initial,advanced,loaded,persisted: persisted.data.campaign.world.recovery,errors},null,2)+'\n');
  23 | });
  24 | 
  25 | test('solo restaurado sobrevive a Baixo/Médio/Alto/Baixo com 16 samplers e sem duplicar setores',async({page})=>{
  26 |  test.setTimeout(600000);const dir=evidencePath('restoration/profiles');await mkdir(dir,{recursive:true});const errors=collectErrors(page);await installTerrainProbe(page,16);const data=fixture('core-1',true);data.player.position=[107,heightAt(107,-2890)+1.1,-2890];await boot(page,data);const profiles=[];
  27 |  for(const [quality,label]of [['baixo','Baixo'],['medio','Médio'],['alto','Alto'],['baixo','Baixo']]){
  28 |   if(profiles.length){await page.keyboard.press('Escape');await page.getByRole('button',{name:'Configurações',exact:true}).click();await page.getByRole('button',{name:label,exact:true}).click();await page.getByRole('button',{name:'Voltar',exact:true}).last().click();await page.getByRole('button',{name:'Voltar à viagem'}).click();}
  29 |   await expect.poll(async()=>(await state(page)).pbr.quality,{timeout:60000}).toBe(quality);await waitPlants(page);await page.evaluate(()=>window.__TERRAIN_PROBE__.arm());await expect.poll(()=>page.evaluate(()=>window.__TERRAIN_PROBE__.report().visibleTerrainDraws),{timeout:60000}).toBeGreaterThan(0);const s=await state(page),gpu=await page.evaluate(()=>window.__TERRAIN_PROBE__.report());expect(s.restoration.vegetation.grass).toBeGreaterThan(100);expect(s.restoration.vegetation.treeColliders).toBeLessThanOrEqual(12);expect(s.sectors).toBe(9);expect(s.assets.errors).toEqual([]);for(const p of gpu.programs){expect(p.linked,p.log).toBe(true);expect(p.samplerCount).toBeLessThanOrEqual(16);}expect(gpu.error).toBe(0);expect(gpu.programs.some(p=>p.recoveryCore?.[2]===240)).toBe(true);profiles.push({quality,state:s,gpu});await page.screenshot({path:`${dir}/${profiles.length}-${quality}.png`});
  30 |  }
  31 |  expect(profiles[3].state.restoration.vegetation.fingerprints).toEqual(profiles[0].state.restoration.vegetation.fingerprints);expect(profiles[3].state.restoration.vegetation.total).toBe(profiles[0].state.restoration.vegetation.total);expect(errors).toEqual([]);await writeFile(`${dir}/proof.json`,JSON.stringify({method:'Real shader links/occlusion samples on SwiftShader selecting the 16 texture-unit path. Not Windows driver emulation.',profiles,errors},null,2)+'\n');
  32 | });
  33 | 
  34 | test('cinemática completa e redução de movimento devolvem o controle sem cobrar de novo',async({page})=>{
  35 |  test.setTimeout(300000);const dir=evidencePath('restoration/cinematic');await mkdir(dir,{recursive:true});const errors=collectErrors(page),proof=[];
  36 |  for(const reduced of [false,true]){await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});await boot(page,fixture());const before=await state(page);await activate(page);await expect.poll(async()=>(await state(page)).restoration.cinematic.active).toBe(true);const during=await state(page);expect(during.restoration.cinematic.reducedMotion).toBe(reduced);await page.screenshot({path:`${dir}/${reduced?'reduced':'full'}.png`});await expect.poll(async()=>(await state(page)).mode,{timeout:30000}).toBe('walking');const after=await state(page);expect(after.campaign.inventory).toEqual(before.campaign.inventory);expect(after.campaign.world.recovery.cores['core-1'].age).toBe(0);expect(after.restoration.cinematic.pending).toBeNull();await page.keyboard.press('KeyM');await expect(page.getByTestId('route-planner')).toBeVisible();await page.keyboard.press('Escape');proof.push({reduced,before,during,after});}
  37 |  expect(errors).toEqual([]);await writeFile(`${dir}/proof.json`,JSON.stringify({proof,errors},null,2)+'\n');
  38 | });
  39 | 
  40 | test('sete campos legados migram e os cinco biomas mantêm vegetação e identidade próprias',async({page})=>{
  41 |  test.setTimeout(600000);const dir=evidencePath('restoration/biomes');await mkdir(dir,{recursive:true});const errors=collectErrors(page),proof=[];
  42 |  for(const id of ['core-2','core-3','core-4','core-5','core-6','core-7']){await boot(page,fixture(id,true,true));await waitPlants(page);const s=await state(page),k=CORES.find(k=>k.id===id);expect(s.restoration.progress[k.number-1].stage).toBe(3);expect(s.campaign.world.recovery.cores[id]).toMatchObject({migrated:true,cinematicSeen:true,age:240});expect(s.restoration.local.region).toBe(k.region);expect(s.restoration.vegetation.grass).toBeGreaterThan(0);expect(s.restoration.local.rainVisible).toBe(true);expect(s.assets.errors).toEqual([]);await page.screenshot({path:`${dir}/${id}-${k.region}.png`});proof.push({id,state:s});}
  43 |  expect(errors).toEqual([]);await writeFile(`${dir}/proof.json`,JSON.stringify({method:'Local fixtures after legacy migration; real renders at identical 09h/Baixo. Not evidence of a driven continent journey.',proof,errors},null,2)+'\n');
  44 | });
  45 | 
```
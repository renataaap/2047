# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase4.spec.js >> Fase 4: save 2, Cofres 2–7, missões, restauração local e recarga integral
- Location: tests/e2e/phase4.spec.js:18:1

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 300
Received:    301
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
            - text: Cidades Esqueleto
            - generic: "03"
          - heading "Obtenha a Semente 3" [level=2]
          - paragraph: Cofre 3, km 8.05. Desobstruir o acesso com uma talha · 2 peças no Titã.
          - generic:
            - generic: ABRIGO 07
            - generic: 7.2 / 21,0 KM
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
        - time: · 09:05 · Manhã
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
      - button "F Núcleo 2 · Viaduto" [ref=e16] [cursor=pointer]:
        - generic [ref=e17]: F
        - text: Núcleo 2 · Viaduto
      - generic: WASD mover · Shift correr · Espaço pular · clique para olhar · F interagir
      - status: Partida salva no servidor.
```

# Test source

```ts
  1  | import { test,expect } from '@playwright/test';
  2  | import { createCampaign,receiveSeed,activateCore } from '../../src/game/missions/campaign.js';
  3  | import { migrateCampaign } from '../../src/game/survival/expedition.js';
  4  | import { upgradeCampaign } from '../../src/game/missions/network.js';
  5  | import { CORES,SHELTERS,ROUTES,SUPPLY_CACHES } from '../../src/data/network.js';
  6  | import { interactionPoint } from '../../src/game/missions/NetworkController.js';
  7  | import { roadX,roadHeight,networkDetourX } from '../../src/game/world/terrain.js';
  8  | import { mkdir,writeFile } from 'node:fs/promises';
  9  | const dir='evidence/phase4';
  10 | function legacy(){const c=createCampaign();receiveSeed(c);activateCore(c);const campaign=migrateCampaign(c);Object.assign(campaign.components,{radiator:75,filters:75,transmission:75});Object.assign(campaign.inventory.truck,{parts:60,water:18,scrap:30,diesel:15,food:8});Object.assign(campaign.inventory.player,{parts:2,water:4,scrap:8,diesel:0,food:3});return {schemaVersion:2,truck:{position:[0,2,5],rotation:[0,0,0,1]},player:{position:[-3,1,5]},context:'driving',fuel:140,temperature:30,engineOn:false,campaign};}
  11 | test.afterEach(async({page},info)=>{if(info.status!==info.expectedStatus){await mkdir(dir,{recursive:true});try{await writeFile(`${dir}/failure-0.7.0.json`,JSON.stringify(await state(page),null,2));}catch{}}});
  12 | const state=page=>page.evaluate(()=>window.__GAME_DEBUG__.getState());
  13 | async function boot(page,data){await page.setViewportSize({width:960,height:640});await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:.15,subtitles:true})));await page.request.get('/api/saves');expect((await page.request.post('/api/saves',{data:{slot:'1',data}})).status()).toBe(201);await page.goto('/');await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:60000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.waitForFunction(()=>window.__GAME_DEBUG__?.getState().mode==='driving');}
  14 | async function enter(page){const s=await state(page);if(s.mode==='paused')await page.keyboard.press('Escape');if((await state(page)).mode==='walking'){await page.evaluate(()=>{const p=window.__GAME_DEBUG__.getState().position;window.__GAME_DEBUG__.teleportPlayer({x:p[0]-3,z:p[2]});});await page.keyboard.press('KeyF');await expect.poll(async()=>(await state(page)).mode).toBe('driving');}}
  15 | async function visit(page,p){await enter(page);const core=p.kind==='network-core';await page.evaluate(({x,z})=>window.__GAME_DEBUG__.teleport({x,z}),{x:p.x-(core?14:12),z:p.z+(core?10:17)});await page.keyboard.down('Space');await page.waitForTimeout(1000);await expect.poll(async()=>(await state(page)).speed,{timeout:10000}).toBeLessThan(.6);await page.keyboard.press('KeyF');await page.keyboard.up('Space');await expect.poll(async()=>(await state(page)).mode).toBe('walking');await page.evaluate(p=>window.__GAME_DEBUG__.teleportPlayer(p),interactionPoint(p));await page.keyboard.press('KeyF');await expect(page.getByRole('heading',{name:p.kind==='shelter'?p.npc:p.name,exact:true})).toBeVisible();}
  16 | async function side(page,id){const s=SHELTERS.find(s=>s.id===id);await visit(page,{...s,kind:'shelter'});await page.getByRole('button',{name:'Aceitar missão',exact:true}).click();await page.getByRole('button',{name:'Entregar e concluir',exact:true}).click();await expect.poll(async()=>(await state(page)).campaign.network.quests[s.quest]).toBe('completed');}
  17 |
  18 | test('Fase 4: save 2, Cofres 2–7, missões, restauração local e recarga integral',async({page})=>{
  19 |  test.setTimeout(300000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await boot(page,legacy());
  20 |  expect((await state(page)).objective.title).toBe('Obtenha a Semente 2');
  21 |  await visit(page,{id:'vault-3',name:'Cofre 3',x:CORES[2].vault.x,z:CORES[2].vault.z,kind:'vault'});await expect(page.getByRole('button',{name:'Liberar e embarcar Semente'})).toBeDisabled();
  22 |  await side(page,'lia');await page.getByRole('button',{name:'Comprar Água',exact:true}).click();expect((await state(page)).campaign.network.stocks.lia.water).toBe(14);await page.getByRole('button',{name:'Descansar · 1 comida + 1 água',exact:true}).click();
  23 |  const legs=[];
  24 |  for(const k of CORES.slice(1)){
  25 |   if(k.number===4)await side(page,'afonso');if(k.number===5)await side(page,'noemia');
  26 |   await visit(page,{id:`vault-${k.number}`,name:`Cofre ${k.number}`,x:k.vault.x,z:k.vault.z,kind:'vault'});const before=await state(page);await page.getByRole('button',{name:'Liberar e embarcar Semente',exact:true}).click();await expect.poll(async()=>(await state(page)).campaign.network.cargo).toBe(k.id);await expect(page.getByRole('button',{name:'Cofre aberto · Semente já retirada'})).toBeDisabled();
  27 |   if(k.number===2){await page.screenshot({path:`${dir}/vault-2.png`});const cache=SUPPLY_CACHES[0];await visit(page,{...cache,kind:'cache'});await page.getByRole('button',{name:'Recolher depósito',exact:true}).click();await expect(page.getByRole('button',{name:'Depósito recolhido',exact:true})).toBeDisabled();}
> 28 |   await visit(page,{...k,kind:'network-core',core:k.id});await expect(page.getByTestId('activation-chance')).toHaveText('100%');const arrival=await state(page);await page.getByRole('button',{name:'Iniciar ativação',exact:true}).click();await expect.poll(async()=>(await state(page)).campaign.cores[k.id].state).toBe('active');await page.keyboard.press('Escape');await expect.poll(async()=>(await state(page)).networkVisual.cores[k.id]?.plants).toBe(true);await expect.poll(async()=>(await state(page)).networkVisual.rain).toBe(true);const after=await state(page);expect(after.networkVisual.cores[k.id].count).toBe(160);expect(after.networkVisual.vaults[k.id]).toBeUndefined();expect(after.campaign.network.cargo).toBeNull();expect(after.drawCalls).toBeLessThanOrEqual(300);expect(after.triangles).toBeLessThanOrEqual(500000);
     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             ^ Error: expect(received).toBeLessThanOrEqual(expected)
  29 |   if(k.number===3){expect(arrival.networkVisual.floods['city-tunnel']).toBe(true);expect(after.networkVisual.floods['city-tunnel']).toBe(false);}
  30 |   if(k.number===2){expect(arrival.networkVisual.barriers['city-viaduct']).toBe(true);expect(after.networkVisual.barriers['city-viaduct']).toBe(false);expect(after.campaign.restoration.cities).toBe(false);}
  31 |   if([2,4,5,7].includes(k.number)){await page.screenshot({path:`${dir}/core-${k.number}-restored.png`});await enter(page);const z=k.z+170;await page.evaluate(p=>window.__GAME_DEBUG__.teleport(p),{x:roadX(z),z});for(let i=0;i<3&&(await state(page)).camera!==1;i++)await page.keyboard.press('KeyC');await page.waitForTimeout(700);await page.screenshot({path:`${dir}/biome-${k.region}-cab.png`});}legs.push({core:k.id,before,arrival,after});
  32 |  }
  33 |  await visit(page,{...SHELTERS[3],kind:'shelter'});await expect(page.getByText('Lia chegou à Última Parada com a notícia da primeira chuva.',{exact:true})).toBeVisible();expect((await state(page)).networkVisual.liaVisible).toBe(true);await page.screenshot({path:`${dir}/lia-reappeared.png`});await page.keyboard.press('Escape');await page.keyboard.press('KeyR');await expect(page.getByRole('dialog')).toContainText('A Voz');await page.screenshot({path:`${dir}/radio.png`});await page.keyboard.press('Escape');await page.keyboard.press('KeyJ');await expect(page.getByRole('heading',{name:'Caderno de missões',level:2,exact:true})).toBeVisible();await page.screenshot({path:`${dir}/journal.png`});await page.keyboard.press('Escape');await page.keyboard.press('KeyM');await page.screenshot({path:`${dir}/continent-map.png`});await page.keyboard.press('Escape');await page.keyboard.press('Escape');await page.getByRole('button',{name:'Salvar / carregar partida'}).click();const savedResponse=page.waitForResponse(r=>r.url().endsWith('/api/saves/1')&&r.request().method()==='PUT');await page.getByRole('button',{name:'Salvar neste slot'}).first().click();expect((await savedResponse).status()).toBe(200);const persisted=await (await page.request.get('/api/saves/1')).json();expect(persisted.data.schemaVersion).toBe(3);expect(persisted.data.campaign.network.quests).toEqual({supply:'completed',pump:'completed',relay:'completed'});expect(persisted.data.campaign.flags.finalChoice).toBeNull();const regions=await (await page.request.get('/api/world/regions?slot=1')).json();expect(regions.regions.every(r=>r.restored)).toBe(true);expect(regions.regions.flatMap(r=>r.coreStates)).toHaveLength(7);
  34 |  await page.reload();await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:60000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect.poll(async()=>(await state(page)).networkVisual.liaVisible).toBe(true);const loaded=await state(page);expect(loaded.campaign.cores).toEqual(persisted.data.campaign.cores);expect(loaded.campaign.inventory).toEqual(persisted.data.campaign.inventory);expect(loaded.campaign.network.looted).toEqual(['cache-2']);expect(loaded.objective.title).toBe('Sete campos ancorados');expect(errors).toEqual([]);await writeFile(`${dir}/network-journey.json`,JSON.stringify({legs,persisted: persisted.data,loaded,regions,consoleErrors:errors},null,2));
  35 | });
  36 |
  37 | test('Fase 4: bloqueio físico, desvio transitável e frente climática persistida',async({page})=>{
  38 |  test.setTimeout(180000);await mkdir(dir,{recursive:true});const data=legacy();data.truck.position=[roadX(-6628),roadHeight(-6628)+1.7,-6628];data.engineOn=true;await boot(page,data);await expect.poll(async()=>(await state(page)).networkVisual.barriers['city-viaduct']).toBe(true);await page.keyboard.down('KeyW');await page.waitForTimeout(5000);await page.keyboard.up('KeyW');const blocked=await state(page);expect(blocked.position[2]).toBeGreaterThan(-6641);
  39 |  const z=-6628;await page.evaluate(p=>window.__GAME_DEBUG__.teleport(p),{x:networkDetourX(z),z});await page.waitForTimeout(500);await page.keyboard.down('KeyW');await page.waitForTimeout(5000);await page.keyboard.up('KeyW');const detour=await state(page);expect(detour.position[2]).toBeLessThan(blocked.position[2]-2);await page.screenshot({path:`${dir}/city-detour.png`});
  40 |  await page.keyboard.press('Escape');const stormSave=legacy();stormSave.schemaVersion=3;stormSave.campaign=upgradeCampaign(stormSave.campaign);stormSave.campaign.network.clock=62;stormSave.truck.position=[roadX(-19050),roadHeight(-19050)+1.7,-19050];expect((await page.request.post('/api/saves',{data:{slot:'2',data:stormSave}})).status()).toBe(201);await page.getByRole('button',{name:'Salvar / carregar partida'}).click();await page.getByRole('button',{name:'Carregar este slot'}).nth(1).click();await expect.poll(async()=>(await state(page)).networkVisual.barriers['storm-front']).toBe(true);const front=await state(page);expect(front.position[1]).toBeGreaterThan(roadHeight(front.position[2])-.5);expect(front.sectors).toBe(9);await page.screenshot({path:`${dir}/storm-front.png`});await page.keyboard.press('KeyR');const clock=(await state(page)).campaign.network.clock;await page.waitForTimeout(800);expect((await state(page)).campaign.network.clock).toBe(clock);await page.keyboard.press('Escape');await expect.poll(async()=>(await state(page)).networkVisual.barriers['storm-front'],{timeout:12000}).toBe(false);const calm=await state(page);expect(calm.weather.interference).toBeLessThan(front.weather.interference);await page.screenshot({path:`${dir}/storm-calm.png`});await writeFile(`${dir}/roads-weather.json`,JSON.stringify({blocked,detour,front,calm},null,2));
  41 | });
  42 |
```

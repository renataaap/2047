# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3.spec.js >> Fase 3: migração, água/comida, oficina, Mãe Ivani, Leito Seco e persistência
- Location: tests/e2e/phase3.spec.js:4:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "poi:depot"
Received: "truck:exit"

Call Log:
- Timeout 20000ms exceeded while waiting on the predicate
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
            - generic: 1.6 / 21,0 KM
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
        - text: ACOMPANHAMENTO
        - time: · 09:07 · Manhã
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
      - generic:
        - generic:
          - generic: TITÃ ROCHA CLARA
          - generic:
            - strong: "00"
            - generic:
              - text: KM/H
              - generic: D1
          - generic:
            - generic:
              - generic: RPM
              - strong: "650"
              - meter "RPM"
            - generic:
              - generic: AUTOMÁTICO
              - generic: 0 Nm
            - generic:
              - text: "MASSA TOTAL:"
              - generic: 8.83 t
          - generic: Motor funcionando
        - generic:
          - generic:
            - generic: W
            - generic: S
            - generic: Acelerar / freio / ré
          - generic:
            - generic: A
            - generic: D
            - generic: Direção
          - generic:
            - generic: C
            - generic: Câmera
            - generic: E
            - generic: Motor
            - generic: L
            - generic: Faróis
        - generic:
          - generic:
            - generic: DIESEL
            - strong: "30.0"
            - generic: L
          - generic:
            - generic: MOTOR
            - generic: 64°C
            - generic: Areia
      - button "F Descer do caminhão" [ref=e16] [cursor=pointer]:
        - generic [ref=e17]: F
        - text: Descer do caminhão
      - status: Partida salva no servidor.
```

# Test source

```ts
  1  | import { test,expect } from '@playwright/test';
  2  | import { createCampaign,receiveSeed,activateCore } from '../../src/game/missions/campaign.js';
  3  | import { mkdir,writeFile } from 'node:fs/promises';
  4  | test('Fase 3: migração, água/comida, oficina, Mãe Ivani, Leito Seco e persistência',async({page})=>{
  5  |  test.setTimeout(180000);await mkdir('evidence/phase3',{recursive:true});await page.setViewportSize({width:960,height:640});await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:.2,subtitles:true})));
  6  |  test.info().annotations.push({type:'validation',description:'Legacy gameplay; waits observe published interaction, without altering player or quest conditions.'});
  7  |  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  8  |  const campaign=createCampaign();receiveSeed(campaign);activateCore(campaign);await page.request.get('/api/saves');const old={schemaVersion:1,truck:{position:[0,2,5],rotation:[0,0,0,1]},player:{position:[-3,1,5]},context:'driving',fuel:30,temperature:40,engineOn:true,campaign};expect((await page.request.post('/api/saves',{data:{slot:'1',data:old}})).status()).toBe(201);
  9  |  await page.goto('/');await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:60000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.waitForFunction(()=>window.__GAME_DEBUG__?.getState().mode==='driving');
  10 |  let state=await page.evaluate(()=>window.__GAME_DEBUG__.getState());expect(state.campaign.expedition.hydration).toBe(100);expect(state.campaign.restoration.ashes).toBe(true);
  11 |  await page.keyboard.down('KeyW');await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().campaign.expedition.hydration),{timeout:20000}).toBeLessThan(100);await page.keyboard.up('KeyW');state=await page.evaluate(()=>window.__GAME_DEBUG__.getState());expect(state.campaign.expedition.hydration).toBeLessThan(100);expect(state.campaign.expedition.satiety).toBeLessThan(100);
  12 |  await page.keyboard.press('KeyH');const stopped=await page.evaluate(()=>window.__GAME_DEBUG__.getState().campaign.expedition.hydration);await page.waitForTimeout(700);expect(await page.evaluate(()=>window.__GAME_DEBUG__.getState().campaign.expedition.hydration)).toBe(stopped);await page.getByRole('button',{name:/Beber 1 L de água/}).first().click();await page.getByRole('button',{name:/Comer 1 ração/}).first().click();state=await page.evaluate(()=>window.__GAME_DEBUG__.getState());expect(state.campaign.inventory.player.water).toBe(3);expect(state.campaign.inventory.player.food).toBe(2);await page.screenshot({path:'evidence/phase3/survival.png'});await page.keyboard.press('Escape');
> 13 |  await page.evaluate(()=>window.__GAME_DEBUG__.teleport({x:-33,z:-1640}));await page.waitForTimeout(700);await page.keyboard.press('KeyF');await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-38,z:-1647}));await page.keyboard.down('KeyW');await page.waitForTimeout(650);await page.keyboard.up('KeyW');await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-38,z:-1651}));await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().interaction?.key),{timeout:20000}).toBe('poi:depot');await page.keyboard.press('KeyF');await expect(page.getByRole('heading',{name:'Oficina abandonada',exact:true})).toBeVisible();await page.getByRole('button',{name:'Recolher suprimentos',exact:true}).click();await expect(page.getByRole('button',{name:'Suprimentos já recolhidos'})).toBeDisabled();await page.keyboard.press('Escape');await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().expeditionVisual.lootVisible.depot)).toBe(false);await page.screenshot({path:'evidence/phase3/workshop.png'});
     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     ^ Error: expect(received).toBe(expected) // Object.is equality
  14 |  await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-36,z:-1640}));await page.keyboard.press('KeyF');await page.waitForFunction(()=>window.__GAME_DEBUG__.getState().mode==='driving');await page.evaluate(()=>window.__GAME_DEBUG__.teleport({x:-22,z:-3470}));await page.waitForTimeout(700);await page.keyboard.press('KeyF');await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-28,z:-3481}));await page.keyboard.press('KeyF');await expect(page.getByRole('heading',{name:'Posto de Mãe Ivani'})).toBeVisible();const beforeTrade=await page.evaluate(()=>window.__GAME_DEBUG__.getState().campaign);await page.getByRole('button',{name:'Comprar Água',exact:true}).click();await page.getByRole('button',{name:'Descansar · 1 comida + 1 água',exact:true}).click();state=await page.evaluate(()=>window.__GAME_DEBUG__.getState());expect(state.campaign.expedition.stock.water).toBe(8);expect(state.campaign.inventory.player.scrap).toBe(beforeTrade.inventory.player.scrap-1);expect(state.campaign.expedition.fatigue).toBe(0);await page.screenshot({path:'evidence/phase3/ivani.png'});await page.keyboard.press('Escape');
  15 |  await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-25,z:-3470}));await page.keyboard.press('KeyF');await page.waitForFunction(()=>window.__GAME_DEBUG__.getState().mode==='driving');await page.evaluate(()=>window.__GAME_DEBUG__.teleport({x:10,z:-4300}));await page.waitForTimeout(900);expect((await page.evaluate(()=>window.__GAME_DEBUG__.getState())).region).toBe('salt');expect((await page.evaluate(()=>window.__GAME_DEBUG__.getState())).surface).toBe('sal');await page.keyboard.down('KeyW');await page.waitForTimeout(4000);await page.keyboard.up('KeyW');state=await page.evaluate(()=>window.__GAME_DEBUG__.getState());expect(state.temperature).toBeGreaterThan(40);expect(state.worldVisual.rain).toBe(false);await page.screenshot({path:'evidence/phase3/salt.png'});
  16 |  await page.evaluate(()=>window.__GAME_DEBUG__.teleport({x:38,z:-5090}));await page.waitForTimeout(700);await page.keyboard.press('KeyF');await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:42,z:-5101}));await page.keyboard.press('KeyF');await expect(page.getByRole('heading',{name:'Estação meteorológica'})).toBeVisible();await page.getByRole('button',{name:'Recolher suprimentos',exact:true}).click();await expect(page.getByRole('dialog').getByRole('status')).toContainText('A mochila está cheia');await page.keyboard.press('Escape');await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:35,z:-5090}));await page.keyboard.press('KeyF');await page.keyboard.press('Tab');for(let i=0;i<4;i++)await page.getByRole('button',{name:'Transferir Peças mecânicas para Titã',exact:true}).click();await page.keyboard.press('Escape');await page.keyboard.press('KeyF');await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:42,z:-5101}));await page.keyboard.press('KeyF');await page.getByRole('button',{name:'Recolher suprimentos',exact:true}).click();await expect(page.getByRole('button',{name:'Suprimentos já recolhidos'})).toBeDisabled();await page.keyboard.press('Escape');await page.keyboard.down('KeyD');await page.waitForTimeout(1800);await page.keyboard.up('KeyD');const wall=await page.evaluate(()=>window.__GAME_DEBUG__.getState().playerPosition);expect(wall[0]).toBeGreaterThan(43);expect(wall[0]).toBeLessThan(46.3);await page.screenshot({path:'evidence/phase3/station.png'});
  17 |  await page.keyboard.press('Escape');await page.getByRole('button',{name:'Salvar / carregar partida'}).click();const savedResponse=page.waitForResponse(r=>r.url().endsWith('/api/saves/1')&&r.request().method()==='PUT');await page.getByRole('button',{name:'Salvar neste slot'}).first().click();expect((await savedResponse).status()).toBe(200);const saved=await page.evaluate(()=>window.__GAME_DEBUG__.getState());const persisted=await (await page.request.get('/api/saves/1')).json();expect(persisted.data.schemaVersion).toBe(3);expect(persisted.data.campaign.expedition.looted).toEqual(['depot','station']);
  18 |  await page.reload();await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:60000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__?.getState().campaign.expedition.looted.length)).toBe(2);const loaded=await page.evaluate(()=>window.__GAME_DEBUG__.getState());expect(loaded.campaign.expedition.stock.water).toBe(8);expect(loaded.campaign.inventory).toEqual(saved.campaign.inventory);await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().expeditionVisual.lootVisible.station),{timeout:15000}).toBe(false);expect(errors).toEqual([]);await writeFile('evidence/phase3/expedition.json',JSON.stringify({old,saved,loaded,consoleErrors:errors},null,2));
  19 | });
  20 |
```

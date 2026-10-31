# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: critical-gameplay.spec.js >> Semente danificada: falha natural, peças na mochila, calibração, ativação e recarga
- Location: tests/e2e/critical-gameplay.spec.js:30:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "walking"
Received: "menu"

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
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
            - generic: "01"
          - heading "Leve a Semente ao Núcleo 1" [level=2]
          - paragraph: Prepare o Titã. A rodovia está soterrada no km 1,1. M abre as duas rotas.
          - generic:
            - generic: ABRIGO 07
            - generic: 2.9 / 3,0 KM
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
        - time: · 09:00 · Manhã
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
      - button "F Operar o Núcleo" [ref=e16] [cursor=pointer]:
        - generic [ref=e17]: F
        - text: Operar o Núcleo
      - generic: WASD mover · Shift correr · Espaço pular · clique para olhar · F interagir
      - generic:
        - text: Integridade da Semente
        - strong: 70.0%
        - meter
        - generic: Evite choques e frenagens bruscas.
      - status: Partida recuperada.
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | import {mkdir,writeFile} from 'node:fs/promises';
  3  | import {createCampaign,receiveSeed} from '../../src/game/missions/campaign.js';
  4  | import {upgradeCampaign,syncFirst} from '../../src/game/missions/network.js';
  5  | const dir='evidence/critical-gameplay';
  6  | const state=page=>page.evaluate(()=>window.__GAME_DEBUG__.getState());
  7  | async function boot(page,data){
  8  |  await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0,footCamera:'first'})));
  9  |  if(data){await page.request.get('/api/saves');expect((await page.request.post('/api/saves',{data:{slot:'1',data}})).status()).toBe(201);}
  10 |  await page.goto('/');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:90000});
> 11 |  if(data)await page.getByRole('button',{name:'Continuar',exact:true}).click();else await page.getByRole('button',{name:'01 Novo jogo'}).click();await expect.poll(async()=>(await state(page)).mode).toBe('walking');await expect(page.locator('.travel-transition')).not.toHaveClass(/active/,{timeout:15000});
     |                                                                                                                                                                                                      ^ Error: expect(received).toBe(expected) // Object.is equality
  12 | }
  13 | async function teleportPlayer(page,x,z){await page.evaluate(p=>window.__GAME_DEBUG__.teleportPlayer(p),{x,z});}
  14 | function fixture(){const c=upgradeCampaign(createCampaign(1510));receiveSeed(c);syncFirst(c);c.seed.integrity=c.network.seeds['core-1'].integrity=70;c.inventory.player.parts=4;c.inventory.truck.parts=0;c.road.generator=true;return {schemaVersion:3,truck:{position:[7,2,-2880],rotation:[0,0,0,1]},player:{position:[23,1,-2882]},context:'walking',fuel:4,temperature:26,engineOn:false,campaign:c};}
  15 | test('alvos reais, Zeca/bomba/Tomás, Dante e duas perspectivas',async({page})=>{
  16 |  test.setTimeout(240000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  17 |  await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));await page.goto('/');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:90000});await page.waitForTimeout(1200);await page.screenshot({path:`${dir}/menu-after.png`});await page.getByRole('button',{name:'01 Novo jogo'}).click();await expect.poll(async()=>(await state(page)).mode).toBe('walking');await expect(page.locator('.travel-transition')).not.toHaveClass(/active/,{timeout:20000});
  18 |  const initial=await state(page);expect(initial.dante.loaded).toBe(true);expect(initial.dante.visible).toBe(false);await page.keyboard.press('KeyC');await expect.poll(async()=>(await state(page)).dante.visible).toBe(true);await page.waitForTimeout(1000);await page.screenshot({path:`${dir}/dante-third-person.png`});
  19 |  const startZ=(await state(page)).playerPosition[2];await page.keyboard.down('KeyW');await expect.poll(async()=>(await state(page)).playerPosition[2],{timeout:20000}).toBeLessThan(startZ-1.2);const walking=await state(page);expect(walking.dante.state).toBe('walk');expect(walking.dante.position[0]).toBeCloseTo(walking.playerPosition[0],3);expect(walking.dante.position[2]).toBeCloseTo(walking.playerPosition[2],3);await page.keyboard.up('KeyW');await page.keyboard.press('KeyC');await expect.poll(async()=>(await state(page)).dante.visible).toBe(false);
  20 |  await teleportPlayer(page,-19,5);await page.keyboard.press('KeyF');await expect(page.getByRole('heading',{name:'Sobrevivente',exact:true})).toBeVisible();await page.getByRole('button',{name:'Exibir texto completo'}).click();await page.waitForTimeout(1800);await page.screenshot({path:`${dir}/dialogue-after.png`});await page.keyboard.press('Escape');
  21 |  await page.evaluate(()=>window.__GAME_DEBUG__.teleport({x:-29,z:-2234}));
  22 |  for(const p of [{x:-48.7,z:-2249.5},{x:-47.2,z:-2248.3},{x:-48.3,z:-2251.2}]){
  23 |   await teleportPlayer(page,p.x,p.z);await expect.poll(async()=>(await state(page)).interaction?.text).toBe('Falar com Zeca');await page.keyboard.press('KeyF');await expect(page.getByRole('heading',{name:'Zeca',exact:true})).toBeVisible();await expect(page.getByRole('dialog').locator('.place-subtitle')).toHaveText('Posto Boa Viagem');await page.getByRole('button',{name:'Exibir texto completo'}).click();await expect(page.getByRole('dialog')).toContainText('A bomba ainda puxa.');await page.keyboard.press('Escape');
  24 |  }
  25 |  await teleportPlayer(page,-48.7,-2249.5);await page.keyboard.press('KeyF');await page.getByRole('button',{name:'Compras e serviços',exact:true}).click();await expect(page.getByRole('button',{name:'Comprar',exact:true}).first()).toBeEnabled();await page.screenshot({path:`${dir}/zeca-services.png`});await page.keyboard.press('Escape');
  26 |  await teleportPlayer(page,-44.7,-2250);await expect.poll(async()=>(await state(page)).interaction?.type).toBe('pump');await page.getByRole('button',{name:'F Abastecer caminhão',exact:true}).click();await expect(page.getByRole('heading',{name:'Bomba de combustível'})).toBeVisible();const fuelBefore=(await state(page)).fuel;await page.getByRole('button',{name:'Comprar',exact:true}).first().click();expect((await state(page)).fuel).toBeGreaterThan(fuelBefore);await page.keyboard.press('Escape');
  27 |  await page.evaluate(()=>window.__GAME_DEBUG__.teleport({x:7,z:-2880}));await teleportPlayer(page,36.5,-2884);await expect.poll(async()=>(await state(page)).interaction?.text).toBe('Falar com Tomás');await page.keyboard.press('KeyF');await expect(page.getByRole('heading',{name:'Tomás · Técnico do Núcleo 1'})).toBeVisible();await page.keyboard.press('Escape');
  28 |  const final=await state(page);expect(final.assets.errors).toEqual([]);expect(errors).toEqual([]);await writeFile(`${dir}/targets-avatar.json`,JSON.stringify({initial,final,consoleErrors:errors},null,2));
  29 | });
  30 | test('Semente danificada: falha natural, peças na mochila, calibração, ativação e recarga',async({page})=>{
  31 |  test.setTimeout(180000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await boot(page,fixture());await page.keyboard.press('KeyF');await expect(page.getByRole('heading',{name:'Núcleo 1 · ressonador atmosférico'})).toBeVisible();await expect(page.getByRole('button',{name:'Calibrar · 2 peças / +20%'})).toBeEnabled();const before=await state(page);await page.getByRole('button',{name:'Iniciar ativação',exact:true}).click();await expect.poll(async()=>(await state(page)).campaign.cores['core-1'].state).toBe('failed');const failed=await state(page);expect(failed.integrity).toBe(62);expect(failed.campaign.network.cargo).toBe('core-1');expect(failed.campaign.inventory).toEqual(before.campaign.inventory);await page.screenshot({path:`${dir}/seed-failed.png`});
  32 |  await page.getByRole('button',{name:'Calibrar · 2 peças / +20%'}).click();const calibrated=await state(page);expect(calibrated.integrity).toBe(82);expect(calibrated.campaign.inventory.player.parts).toBe(2);expect(calibrated.campaign.inventory.truck.parts).toBe(0);await expect(page.getByTestId('activation-chance')).toHaveText('100%');await page.getByRole('button',{name:'Iniciar ativação',exact:true}).click();await expect.poll(async()=>(await state(page)).campaign.cores['core-1'].state).toBe('active');await expect(page.getByRole('button',{name:'Calibrar · 2 peças / +20%'})).toBeDisabled();await expect(page.locator('.calibration-status')).toContainText('próxima Semente');await page.screenshot({path:`${dir}/seed-activated.png`});const completed=await state(page);
  33 |  await page.keyboard.press('Escape');await page.keyboard.press('Escape');await page.getByRole('button',{name:'Salvar / carregar partida'}).click();await page.getByRole('button',{name:'Salvar neste slot'}).first().click();await expect(page.getByRole('dialog').getByRole('status')).toContainText('Partida salva',{timeout:15000});await page.reload();await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect.poll(async()=>(await state(page)).campaign.cores['core-1'].state).toBe('active');const loaded=await state(page);expect(loaded.campaign.inventory).toEqual(completed.campaign.inventory);expect(loaded.campaign.network.cargo).toBeNull();expect(errors).toEqual([]);await writeFile(`${dir}/seed-recovery.json`,JSON.stringify({before,failed,calibrated,completed,loaded,consoleErrors:errors,note:'Damage and RNG are initial saved-game conditions, never edited during the test. Failed activation/calibration/success use real UI rules.'},null,2));
  34 | });
  35 |
```

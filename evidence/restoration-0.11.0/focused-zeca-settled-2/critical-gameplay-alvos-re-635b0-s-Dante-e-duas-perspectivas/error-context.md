# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: critical-gameplay.spec.js >> alvos reais, Zeca/bomba/Tomás, Dante e duas perspectivas
- Location: tests/e2e/critical-gameplay.spec.js:17:1

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 4
Received:    0
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - main [ref=e3]:
    - generic "Mundo 3D da Rede Aurora e Titã Rocha Clara" [ref=e4]
    - generic:
      - generic:
        - region "Tutorial" [ref=e5]:
          - generic [ref=e6]: CAPÍTULO 01 — O ÚLTIMO MOTOR
          - generic [ref=e7]:
            - generic [ref=e8]: O abrigo
            - generic [ref=e9]: 1 / 21
          - heading "W A S D Caminhe pelo barracão" [level=2] [ref=e10]:
            - generic [ref=e11]: W A S D
            - text: Caminhe pelo barracão
          - paragraph [ref=e12]: Percorra 3 m. Clique no cenário para olhar com o mouse. Saída pelas portas laterais abertas.
          - progressbar "Progresso do tutorial" [ref=e13]
          - button "Pular tutorial" [ref=e14] [cursor=pointer]
        - generic [aria-hidden]:
          - generic: "NO"
          - generic: "N"
          - generic: NE
          - generic: ▾
        - button "Uma pausa na estrada" [ref=e15] [cursor=pointer]:
          - generic [ref=e18]: ESC
      - navigation [ref=e19]:
        - button "J · Missões" [ref=e20] [cursor=pointer]
        - button "M · Mapa" [ref=e21] [cursor=pointer]
        - button "Tab · Inventário" [ref=e22] [cursor=pointer]
        - button "V · Inspeção" [ref=e23] [cursor=pointer]
        - button "R · Rádio" [ref=e24] [cursor=pointer]
        - button "H · Expedição" [ref=e25] [cursor=pointer]
      - generic:
        - text: EXPLORAÇÃO A PÉ · primeira pessoa · C alternar
        - time: · 09:02 · Manhã
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
      - complementary "Navegação inercial" [ref=e26]:
        - generic [ref=e27]:
          - generic [ref=e28]: MAPA INERCIAL
          - generic [ref=e29]:
            - button "Ampliar minimapa" [ref=e30] [cursor=pointer]: +
            - button "Ocultar minimapa" [ref=e31] [cursor=pointer]: ×
        - img "Caminhos e interações próximas" [ref=e32]:
          - generic "Rodovia · asfalto"
          - generic "Rodovia · asfalto"
          - generic "Rodovia · asfalto"
          - generic "Sobrevivente" [ref=e36]
          - generic "Cofre 1" [ref=e38]
          - generic [ref=e44]: N ↑
        - generic [ref=e45]: Observe os acessos e interlocutores
        - button "Abrigo 07 2,5 km · posição estimada" [ref=e47] [cursor=pointer]:
          - strong [ref=e48]: Abrigo 07
          - generic [ref=e49]: 2,5 km · posição estimada
      - button "F Conversar com a sobrevivente" [ref=e50] [cursor=pointer]:
        - generic [ref=e51]: F
        - text: Conversar com a sobrevivente
      - generic: WASD mover · Shift correr · Espaço pular · clique para olhar · F interagir
```

# Test source

```ts
  1  | import {skipRestorationPresentation} from '../helpers/restoration-presentation.js';
  2  | import {evidencePath} from '../helpers/evidence-path.js';
  3  | import {test,expect} from '@playwright/test';
  4  | import {mkdir,writeFile} from 'node:fs/promises';
  5  | import {createCampaign,receiveSeed} from '../../src/game/missions/campaign.js';
  6  | import {upgradeCampaign,syncFirst} from '../../src/game/missions/network.js';
  7  | const dir=evidencePath('critical-gameplay');
  8  | const state=page=>page.evaluate(()=>window.__GAME_DEBUG__.getState());
  9  | async function boot(page,data){
  10 |  await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0,footCamera:'first'})));
  11 |  if(data){await page.request.get('/api/saves');expect((await page.request.post('/api/saves',{data:{slot:'1',data}})).status()).toBe(201);}
  12 |  await page.goto('/');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:90000});
  13 |  if(data)await page.getByRole('button',{name:'Continuar',exact:true}).click();else await page.getByRole('button',{name:'01 Novo jogo'}).click();await expect.poll(async()=>(await state(page)).mode,{timeout:30000}).toBe('walking');await expect(page.locator('.travel-transition')).not.toHaveClass(/active/,{timeout:15000});
  14 | }
  15 | async function teleportPlayer(page,x,z){await page.evaluate(p=>window.__GAME_DEBUG__.teleportPlayer(p),{x,z});}
  16 | function fixture(){const c=upgradeCampaign(createCampaign(1510));receiveSeed(c);syncFirst(c);c.seed.integrity=c.network.seeds['core-1'].integrity=70;c.inventory.player.parts=4;c.inventory.truck.parts=0;c.road.generator=true;return {schemaVersion:3,truck:{position:[7,2,-2880],rotation:[0,0,0,1]},player:{position:[23,1,-2882]},context:'walking',fuel:4,temperature:26,engineOn:false,campaign:c};}
  17 | test('alvos reais, Zeca/bomba/Tomás, Dante e duas perspectivas',async({page})=>{
  18 |  test.setTimeout(240000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  19 |  await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));await page.goto('/');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:90000});await page.waitForTimeout(1200);await page.screenshot({path:`${dir}/menu-after.png`});await page.getByRole('button',{name:'01 Novo jogo'}).click();await expect.poll(async()=>(await state(page)).mode,{timeout:30000}).toBe('walking');await expect(page.locator('.travel-transition')).not.toHaveClass(/active/,{timeout:20000});
  20 |  const initial=await state(page);expect(initial.dante.loaded).toBe(true);expect(initial.dante.visible).toBe(false);await page.keyboard.press('KeyC');await expect.poll(async()=>(await state(page)).dante.visible).toBe(true);await page.waitForTimeout(1000);await page.screenshot({path:`${dir}/dante-third-person.png`});
  21 |  const startZ=(await state(page)).playerPosition[2];await page.keyboard.down('KeyW');await expect.poll(async()=>(await state(page)).playerPosition[2],{timeout:20000}).toBeLessThan(startZ-1.2);const walking=await state(page);expect(walking.dante.state).toBe('walk');expect(walking.dante.position[0]).toBeCloseTo(walking.playerPosition[0],3);expect(walking.dante.position[2]).toBeCloseTo(walking.playerPosition[2],3);await page.keyboard.up('KeyW');await page.keyboard.press('KeyC');await expect.poll(async()=>(await state(page)).dante.visible).toBe(false);
  22 |  await teleportPlayer(page,-19,5);await page.keyboard.press('KeyF');await expect(page.getByRole('heading',{name:'Sobrevivente',exact:true})).toBeVisible();await page.getByRole('button',{name:'Exibir texto completo'}).click();await page.waitForTimeout(1800);await page.screenshot({path:`${dir}/dialogue-after.png`});await page.keyboard.press('Escape');
  23 |  // This test relocates fixtures; settle that new pose with the original 60 Hz
  24 |  // physics before opening a panel that pauses the world. Wall-clock delays are
  25 |  // not a reliable parking preparation on software rendering.
  26 |  await page.evaluate(()=>{const d=window.__GAME_DEBUG__;d.controlledStepping(true);d.teleport({x:-29,z:-2234});d.step({handbrake:true},180);d.publish();d.controlledStepping(false);});
> 27 |  const parkedAtPump=await state(page);expect(parkedAtPump.engineOn).toBe(false);expect(parkedAtPump.speed).toBeLessThan(.1);expect(parkedAtPump.wheelContacts.filter(Boolean).length).toBeGreaterThanOrEqual(4);expect(Math.hypot(parkedAtPump.position[0]+44,parkedAtPump.position[2]+2250)).toBeLessThan(26);await writeFile(`${dir}/zeca-parking.json`,JSON.stringify({method:'Diagnostic relocation followed by three seconds of original 60 Hz physics with handbrake. No assigned speed or bypass of purchase rules.',state:parkedAtPump},null,2)+'\n');
     |                                                                                                                                                                                       ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  28 |  for(const p of [{x:-48.7,z:-2249.5},{x:-47.2,z:-2248.3},{x:-48.3,z:-2251.2}]){
  29 |   await teleportPlayer(page,p.x,p.z);await expect.poll(async()=>(await state(page)).interaction?.text).toBe('Falar com Zeca');await page.keyboard.press('KeyF');await expect(page.getByRole('heading',{name:'Zeca',exact:true})).toBeVisible();await expect(page.getByRole('dialog').locator('.place-subtitle')).toHaveText('Posto Boa Viagem');await page.getByRole('button',{name:'Exibir texto completo'}).click();await expect(page.getByRole('dialog')).toContainText('A bomba ainda puxa.');await page.keyboard.press('Escape');
  30 |  }
  31 |  await teleportPlayer(page,-48.7,-2249.5);await page.keyboard.press('KeyF');await page.getByRole('button',{name:'Compras e serviços',exact:true}).click();await writeFile(`${dir}/zeca-before-services.json`,JSON.stringify(await state(page),null,2)+'\n');await page.screenshot({path:`${dir}/zeca-before-services.png`});await expect(page.getByRole('button',{name:'Comprar',exact:true}).first()).toBeEnabled();await page.screenshot({path:`${dir}/zeca-services.png`});await page.keyboard.press('Escape');
  32 |  await teleportPlayer(page,-44.7,-2250);await expect.poll(async()=>(await state(page)).interaction?.type).toBe('pump');await page.getByRole('button',{name:'F Abastecer caminhão',exact:true}).click();await expect(page.getByRole('heading',{name:'Bomba de combustível'})).toBeVisible();const fuelBefore=(await state(page)).fuel;await page.getByRole('button',{name:'Comprar',exact:true}).first().click();expect((await state(page)).fuel).toBeGreaterThan(fuelBefore);await page.keyboard.press('Escape');
  33 |  await page.evaluate(()=>window.__GAME_DEBUG__.teleport({x:7,z:-2880}));await teleportPlayer(page,36.5,-2884);await expect.poll(async()=>(await state(page)).interaction?.text).toBe('Falar com Tomás');await page.keyboard.press('KeyF');await expect(page.getByRole('heading',{name:'Tomás · Técnico do Núcleo 1'})).toBeVisible();await page.keyboard.press('Escape');
  34 |  const final=await state(page);expect(final.assets.errors).toEqual([]);expect(errors).toEqual([]);await writeFile(`${dir}/targets-avatar.json`,JSON.stringify({initial,final,consoleErrors:errors},null,2));
  35 | });
  36 | test('Semente danificada: falha natural, peças na mochila, calibração, ativação e recarga',async({page})=>{
  37 |  test.setTimeout(180000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await boot(page,fixture());await page.keyboard.press('KeyF');await expect(page.getByRole('heading',{name:'Núcleo 1 · ressonador atmosférico'})).toBeVisible();await expect(page.getByRole('button',{name:'Calibrar · 2 peças / +20%'})).toBeEnabled();const before=await state(page);await page.getByRole('button',{name:'Iniciar ativação',exact:true}).click();await expect.poll(async()=>(await state(page)).campaign.cores['core-1'].state).toBe('failed');const failed=await state(page);expect(failed.integrity).toBe(62);expect(failed.campaign.network.cargo).toBe('core-1');expect(failed.campaign.inventory).toEqual(before.campaign.inventory);await page.screenshot({path:`${dir}/seed-failed.png`});
  38 |  await page.getByRole('button',{name:'Calibrar · 2 peças / +20%'}).click();const calibrated=await state(page);expect(calibrated.integrity).toBe(82);expect(calibrated.campaign.inventory.player.parts).toBe(2);expect(calibrated.campaign.inventory.truck.parts).toBe(0);await expect(page.getByTestId('activation-chance')).toHaveText('100%');await page.getByRole('button',{name:'Iniciar ativação',exact:true}).click();await expect.poll(async()=>(await state(page)).campaign.cores['core-1'].state).toBe('active');await expect(page.getByRole('button',{name:'Calibrar · 2 peças / +20%'})).toBeDisabled();await expect(page.locator('.calibration-status')).toContainText('próxima Semente');await page.screenshot({path:`${dir}/seed-activated.png`});const completed=await state(page);
  39 |  await page.keyboard.press('Escape');await skipRestorationPresentation(page);await page.keyboard.press('Escape');await page.getByRole('button',{name:'Salvar / carregar partida'}).click();await page.getByRole('button',{name:'Salvar neste slot'}).first().click();await expect(page.getByRole('dialog').getByRole('status')).toContainText('Partida salva',{timeout:15000});await page.reload();await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect.poll(async()=>(await state(page)).campaign.cores['core-1'].state).toBe('active');const loaded=await state(page);expect(loaded.campaign.inventory).toEqual(completed.campaign.inventory);expect(loaded.campaign.network.cargo).toBeNull();expect(errors).toEqual([]);await writeFile(`${dir}/seed-recovery.json`,JSON.stringify({before,failed,calibrated,completed,loaded,consoleErrors:errors,note:'Damage and RNG are initial saved-game conditions, never edited during the test. Failed activation/calibration/success use real UI rules.'},null,2));
  40 | });
  41 | 
```
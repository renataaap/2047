# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tutorial-assets.spec.js >> tutorial: barracão, direção real, reparo, missão, gerador, conclusão e recarga
- Location: tests/e2e/tutorial-assets.spec.js:28:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 25000ms exceeded while waiting on the predicate
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
            - generic [ref=e8]: Conhecendo o Titã
            - generic [ref=e9]: 4 / 21
          - heading "F Entre no Titã Rocha Clara" [level=2] [ref=e10]:
            - generic [ref=e11]: F
            - text: Entre no Titã Rocha Clara
          - paragraph [ref=e12]: Saia do barracão e aproxime-se da cabine na estrada.
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
        - time: · 09:08 · Manhã
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
      - button "F Entrar no Titã" [ref=e26] [cursor=pointer]:
        - generic [ref=e27]: F
        - text: Entrar no Titã
      - generic: WASD mover · Shift correr · Espaço pular · clique para olhar · F interagir
      - status: Partida salva no servidor.
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | import {mkdir,writeFile} from 'node:fs/promises';
  3  | const dir='evidence/tutorial-assets';
  4  | const state=p=>p.evaluate(()=>window.__GAME_DEBUG__.getState());
  5  | async function newGame(page){
  6  |  await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
  7  |  await page.goto('/');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'01 Novo jogo'}).click();await expect.poll(async()=>(await state(page)).mode).toBe('walking');
  8  | }
  9  | test('arquivos reais: oito PBR, garagem com interior e Titã com seis rodas',async({page})=>{
  10 |  test.setTimeout(150000);await mkdir(dir,{recursive:true});const errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>{if(/^https?:/.test(r.url())&&new URL(r.url()).origin!=='http://127.0.0.1:3000')external.push(r.url());});
  11 |  await newGame(page);await expect(page.getByTestId('tutorial-guide')).toContainText('O ÚLTIMO MOTOR');await expect.poll(async()=>(await state(page)).environmentModels.ids).toContain('dantes-garage');await page.waitForTimeout(1200);const initial=await state(page);expect(initial.pbr.installed).toBe(8);expect(initial.pbr.terrainBlend).toBe(true);expect(initial.pbr.applied.weatheredMetal).toBe('rust_coarse_01');expect(initial.importedTruck.status).toBe('imported');expect(initial.importedTruck.wheelBindings).toBe(6);for(const w of initial.importedTruck.wheels)expect(Math.abs(w.center[1]-w.y)).toBeLessThan(.02);expect(initial.assets.errors).toEqual([]);await page.screenshot({path:`${dir}/chapter-start.png`});
  12 |  await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-3,z:5}));await page.keyboard.press('KeyF');await expect.poll(async()=>(await state(page)).mode).toBe('driving');await page.waitForTimeout(500);await page.screenshot({path:`${dir}/truck-real.png`});await page.keyboard.press('KeyE');await page.keyboard.down('KeyW');await expect.poll(async()=>(await state(page)).speedKmh,{timeout:20000}).toBeGreaterThan(10);await page.keyboard.up('KeyW');const driven=await state(page);expect(driven.importedTruck.wheels.some(w=>Math.abs(w.rotation)>.1)).toBe(true);await page.keyboard.press('KeyC');await page.screenshot({path:`${dir}/cockpit.png`});await page.keyboard.down('Space');await expect.poll(async()=>(await state(page)).speed,{timeout:15000}).toBeLessThan(.6);await page.keyboard.press('KeyF');await page.keyboard.up('Space');await expect.poll(async()=>(await state(page)).mode).toBe('walking');await page.evaluate(()=>{window.__GAME_DEBUG__.teleport({x:-60,z:-2246});window.__GAME_DEBUG__.teleportPlayer({x:-85,z:-2246});});await expect.poll(async()=>(await state(page)).environmentModels.ids).toContain('abandoned-petrol-forecourt');await page.waitForTimeout(1200);await page.screenshot({path:`${dir}/gas-station-real.png`});expect(errors).toEqual([]);expect(external).toEqual([]);await writeFile(`${dir}/real-assets-browser.json`,JSON.stringify({initial,driven,consoleErrors:errors,externalRequests:external},null,2));
  13 | });
  14 |
  15 | test('progresso parcial retoma; pular e repetir preservam recursos e campanha',async({page})=>{
  16 |  test.setTimeout(120000);await newGame(page);await walkTo(page,-13,18.0);const partial=await state(page);expect(partial.tutorial.completed).toEqual(['walk']);
  17 |  await page.keyboard.press('Escape');await page.getByRole('button',{name:'Salvar / carregar partida'}).click();await page.getByRole('button',{name:'Salvar neste slot'}).first().click();await expect(page.getByRole('dialog').getByRole('status')).toContainText('Partida salva',{timeout:20000});await page.reload();await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:60000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect(page.getByTestId('tutorial-guide')).toContainText('Observe o ambiente');expect((await state(page)).tutorial.completed).toEqual(['walk']);
  18 |  await page.getByRole('button',{name:'Pular tutorial',exact:true}).click();expect((await state(page)).tutorial.status).toBe('skipped');await page.keyboard.press('Escape');await page.getByRole('button',{name:'Repetir tutorial · voltar ao abrigo'}).click();const repeated=await state(page);expect(repeated.tutorial.completed).toEqual([]);expect(repeated.campaign.inventory).toEqual(partial.campaign.inventory);expect(repeated.campaign.stage).toBe(partial.campaign.stage);expect(repeated.mode).toBe('walking');
  19 | });
  20 |
  21 | async function walkTo(page,x,z){
  22 |  await expect.poll(async()=>{
  23 |   const s=await state(page),dx=x-s.playerPosition[0],dz=z-s.playerPosition[2],d=Math.hypot(dx,dz),yaw=s.playerYaw||0;
  24 |   if(d<.7){await page.evaluate(()=>window.__GAME_DEBUG__.setInput({}));return true;}
  25 |   const input={x:(dx*Math.cos(yaw)-dz*Math.sin(yaw))/d,z:(dx*Math.sin(yaw)+dz*Math.cos(yaw))/d};await page.evaluate(v=>window.__GAME_DEBUG__.setInput(v),input);return false;
> 26 |  },{timeout:25000,intervals:[200,200,300]}).toBe(true);
     |                                             ^ Error: expect(received).toBe(expected) // Object.is equality
  27 | }
  28 | test('tutorial: barracão, direção real, reparo, missão, gerador, conclusão e recarga',async({page})=>{
  29 |  test.setTimeout(360000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await newGame(page);
  30 |  await walkTo(page,-13,18.0);await expect.poll(async()=>(await state(page)).tutorial.completed).toContain('walk');
  31 |  await page.locator('canvas').click({position:{x:700,y:350}});await page.mouse.move(780,350,{steps:3});await expect.poll(async()=>(await state(page)).tutorial.completed).toContain('look');
  32 |  await walkTo(page,-11.3,21.2);await page.keyboard.press('KeyF');await expect(page.getByRole('heading',{name:'Caderno de viagem',exact:true})).toBeVisible();await page.keyboard.press('Escape');
  33 |  await walkTo(page,-14.7,21.2);await page.keyboard.press('KeyF');await expect(page.getByRole('heading',{name:'Bancada de ferramentas'})).toBeVisible();await page.keyboard.press('Escape');
  34 |  // Walk through the actual opened side door; never teleport out of the garage.
  35 |  await walkTo(page,-13,22);await walkTo(page,-12,18.95);await walkTo(page,-8.2,18.95);await walkTo(page,-3,5);await page.keyboard.press('KeyF');await page.keyboard.press('KeyC');await page.keyboard.press('KeyE');
  36 |  await page.keyboard.down('KeyW');await expect.poll(async()=>(await state(page)).speedKmh,{timeout:20000}).toBeGreaterThan(8);await page.keyboard.down('KeyD');await expect.poll(async()=>(await state(page)).tutorial.facts,{timeout:15000}).toContain('turn');await page.keyboard.up('KeyD');await page.keyboard.up('KeyW');await page.keyboard.down('KeyS');await expect.poll(async()=>(await state(page)).tutorial.facts,{timeout:15000}).toContain('brake');await page.keyboard.up('KeyS');
  37 |  await page.keyboard.down('KeyS');await expect.poll(async()=>(await state(page)).tutorial.facts,{timeout:15000}).toContain('reverse');await page.keyboard.up('KeyS');await page.keyboard.down('Space');await expect.poll(async()=>(await state(page)).speed,{timeout:15000}).toBeLessThan(.25);await page.keyboard.up('Space');
  38 |  // Input-only steering toward the training rectangle. The Rapier body does the movement.
  39 |  await expect.poll(async()=>{const s=await state(page),yaw=Math.atan2(2*(s.quaternion[3]*s.quaternion[1]+s.quaternion[0]*s.quaternion[2]),1-2*(s.quaternion[1]**2+s.quaternion[0]**2)),dx=-s.position[0],dz=-54-s.position[2],target=Math.atan2(-dx,-dz),error=Math.atan2(Math.sin(target-yaw),Math.cos(target-yaw));await page.evaluate(v=>window.__GAME_DEBUG__.setInput(v),{throttle:s.speedKmh>14?-.4:s.speedKmh>10?0:.7,steer:Math.max(-.5,Math.min(.5,error*2))});return s.position[2];},{timeout:40000,intervals:[300]}).toBeLessThan(-49);
  40 |  await page.evaluate(()=>window.__GAME_DEBUG__.setInput({handbrake:true}));await expect.poll(async()=>(await state(page)).tutorial.facts,{timeout:15000}).toContain('park');await page.keyboard.press('KeyE');await page.keyboard.press('KeyF');await page.keyboard.press('KeyV');const beforeRepair=await state(page);await page.getByRole('button',{name:'Reparo de campo · 2 peças / +25% Radiador',exact:true}).click();await page.keyboard.press('Escape');await expect.poll(async()=>(await state(page)).tutorial.completed).toContain('maintenance');expect((await state(page)).campaign.inventory.truck.parts).toBe(beforeRepair.campaign.inventory.truck.parts-2);await page.screenshot({path:`${dir}/training-done.png`});
  41 |  // Long return/travel sections use diagnostics only to shorten this automated regression.
  42 |  await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-19,z:5}));await page.keyboard.press('KeyF');await page.getByRole('button',{name:'Aceitar a Semente e assumir a viagem'}).click();await page.keyboard.press('Escape');await page.keyboard.press('Tab');await expect(page.getByRole('heading',{name:'Inventário',exact:true})).toBeVisible();await page.keyboard.press('Escape');await page.keyboard.press('KeyM');await page.getByRole('button',{name:'Planejar desvio seguro'}).click();await page.keyboard.press('Escape');
  43 |  await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:(window.__GAME_DEBUG__.getState().position[0])-3,z:window.__GAME_DEBUG__.getState().position[2]}));await page.keyboard.press('KeyF');await page.keyboard.press('KeyE');await page.evaluate(()=>window.__GAME_DEBUG__.teleport({x:220,z:-900}));await expect.poll(async()=>(await state(page)).tutorial.completed).toContain('travel');
  44 |  await page.evaluate(()=>window.__GAME_DEBUG__.teleport({x:-36,z:-1640}));await page.keyboard.down('Space');await page.keyboard.press('KeyE');await page.keyboard.press('KeyF');await page.keyboard.up('Space');await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-38,z:-1651}));await page.keyboard.press('KeyF');await page.getByRole('button',{name:'Recolher suprimentos'}).click();await page.keyboard.press('Escape');
  45 |  await page.evaluate(()=>window.__GAME_DEBUG__.teleport({x:7,z:-2880}));await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:36.5,z:-2884}));await page.keyboard.press('KeyF');await expect(page.getByRole('heading',{name:'Tomás · Técnico do Núcleo 1'})).toBeVisible();await page.getByRole('button',{name:'Ligar o gerador · 4 L de diesel + 1 peça'}).click();await page.keyboard.press('Escape');await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:23,z:-2882}));await page.keyboard.press('KeyF');await page.getByRole('button',{name:'Iniciar ativação'}).click();await page.keyboard.press('Escape');await expect.poll(async()=>(await state(page)).tutorial.status).toBe('completed');const completed=await state(page);expect(completed.campaign.cores['core-1'].state).toBe('active');await page.screenshot({path:`${dir}/tutorial-completed.png`});
  46 |  await page.keyboard.press('Escape');await page.getByRole('button',{name:'Salvar / carregar partida'}).click();await page.getByRole('button',{name:'Salvar neste slot'}).first().click();await expect(page.getByRole('dialog').getByRole('status')).toContainText('Partida salva',{timeout:20000});await page.reload();await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:60000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect.poll(async()=>(await state(page)).tutorial.status).toBe('completed');expect((await state(page)).campaign.inventory).toEqual(completed.campaign.inventory);expect(errors).toEqual([]);await writeFile(`${dir}/tutorial-flow.json`,JSON.stringify({completed,loaded:await state(page),consoleErrors:errors,travel:'Long return and campaign travel shortened by diagnostic teleport; walking, driving, steering, braking, reverse, parking and repair use real simulation'},null,2));
  47 | });
  48 |
```

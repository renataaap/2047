# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase2.spec.js >> fatia vertical: abrigo, carga, preparo, rota, Núcleo, transformação e recarga
- Location: tests/e2e/phase2.spec.js:17:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Tomás · Técnico do Núcleo 1' })
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Tomás · Técnico do Núcleo 1' }) with timeout 15000ms
  - waiting for getByRole('heading', { name: 'Tomás · Técnico do Núcleo 1' })

```

```yaml
- alert
- main:
  - text: Mar de Cinzas 01
  - heading "Leve a Semente ao Núcleo 1" [level=2]
  - paragraph: Prepare o Titã. A rodovia está soterrada no km 1,1. M abre as duas rotas.
  - text: ABRIGO 07 2.9 / 3,0 KM
  - button "Uma pausa na estrada": ESC
  - navigation:
    - button "J · Missões"
    - button "M · Mapa"
    - button "Tab · Inventário"
    - button "V · Inspeção"
    - button "R · Rádio"
    - button "H · Expedição"
  - text: ACOMPANHAMENTO
  - time: · 09:08 · Manhã
  - text: Hidratação
  - strong: 100%
  - meter "Hidratação 100%"
  - text: Saciedade
  - strong: 100%
  - meter "Saciedade 100%"
  - text: Fadiga
  - strong: 0%
  - meter "Fadiga 0%"
  - text: TITÃ ROCHA CLARA
  - strong: "00"
  - text: KM/H N RPM
  - strong: "0"
  - meter "RPM"
  - text: "AUTOMÁTICO 0 Nm MASSA TOTAL: 11.01 t Motor desligado W S Acelerar / freio / ré A D Direção C Câmera E Motor L Faróis DIESEL"
  - strong: "8.0"
  - text: L MOTOR 33°C Asfalto
  - button "F Descer do caminhão"
  - text: Integridade da Semente
  - strong: 100.0%
  - meter
  - text: Evite choques e frenagens bruscas.
  - status: Partida salva no servidor.
```

# Test source

```ts
  1  | import {enterFromNewTutorial} from '../helpers/start-driving.js';
  2  | import { test,expect,request } from '@playwright/test';
  3  | import { createCampaign } from '../../src/game/missions/campaign.js';
  4  | import { mkdir,writeFile } from 'node:fs/promises';
  5  | const dir='evidence/phase2';
  6  | const payload=()=>({schemaVersion:1,truck:{position:[0,2,5],rotation:[0,0,0,1]},player:{position:[-3,1,5]},context:'driving',fuel:4,temperature:26,engineOn:true,campaign:createCampaign()});
  7  | test('API: cookies, isolamento, CRUD, validação e conflito',async({request:api})=>{
  8  |  const list=await api.get('/api/saves');expect(list.status()).toBe(200);const cookie=list.headers()['set-cookie'];expect(cookie).toContain('HttpOnly');expect(cookie).toContain('SameSite=Strict');
  9  |  const data=payload();const created=await api.post('/api/saves',{data:{slot:'1',data}});expect(created.status()).toBe(201);expect((await api.post('/api/saves',{data:{slot:'1',data}})).status()).toBe(409);
  10 |  const other=await request.newContext();expect((await other.get('http://127.0.0.1:3000/api/saves/1')).status()).toBe(404);await other.dispose();
  11 |  expect((await api.put('/api/saves/1',{data:{data,version:1}})).status()).toBe(200);expect((await api.put('/api/saves/1',{data:{data,version:1}})).status()).toBe(409);
  12 |  expect((await api.post('/api/saves',{data:{slot:'2',data:{...data,fuel:-1}}})).status()).toBe(400);expect((await api.post('/api/saves',{data:null})).status()).toBe(400);
  13 |  expect((await api.post('/api/saves',{data:'{"x":"'+'a'.repeat(140000)+'"}',headers:{'Content-Type':'application/json'}})).status()).toBe(400);
  14 |  expect((await api.get('/api/saves/4')).status()).toBe(400);for(const route of ['/api/game/items','/api/game/missions','/api/world/regions?slot=1'])expect((await api.get(route)).status()).toBe(200);
  15 |  expect((await api.delete('/api/saves/1')).status()).toBe(200);expect((await api.get('/api/saves/1')).status()).toBe(404);
  16 | });
  17 | test('fatia vertical: abrigo, carga, preparo, rota, Núcleo, transformação e recarga',async({page})=>{
  18 |  test.setTimeout(180000);await page.setViewportSize({width:960,height:640});await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:.3,subtitles:true})));
  19 |  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await mkdir(dir,{recursive:true});
  20 |  await page.goto('/');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:60000});await page.getByRole('button',{name:'01 Novo jogo'}).click();await enterFromNewTutorial(page);await page.waitForFunction(()=>window.__GAME_DEBUG__?.getState().mode==='driving');await page.keyboard.press('KeyE');
  21 |  await page.keyboard.press('KeyF');await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().mode)).toBe('walking');
  22 |  const beforeWalk=await page.evaluate(()=>window.__GAME_DEBUG__.getState().playerPosition);await page.keyboard.down('KeyW');await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().playerPosition[2]),{timeout:20000}).toBeLessThan(beforeWalk[2]-.2);await page.keyboard.up('KeyW');const afterWalk=await page.evaluate(()=>window.__GAME_DEBUG__.getState().playerPosition);expect(afterWalk[2]).toBeLessThan(beforeWalk[2]-.2);
  23 |  await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-19,z:5}));await page.keyboard.press('KeyF');await expect(page.getByRole('heading',{name:'Sobrevivente',exact:true})).toBeVisible();await page.screenshot({path:`${dir}/shelter.png`});await page.getByRole('button',{name:'Aceitar a Semente e assumir a viagem'}).click();await expect(page.getByRole('heading',{name:'Rádio de ondas curtas'})).toBeVisible();await page.keyboard.press('Escape');
  24 |  await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:-3,z:5}));await page.keyboard.press('Tab');await expect(page.getByRole('heading',{name:'Inventário',exact:true})).toBeVisible();for(let i=0;i<4;i++)await page.getByRole('button',{name:'Transferir Peças mecânicas para Titã',exact:true}).click();for(let i=0;i<4;i++)await page.getByRole('button',{name:'Transferir Diesel para Titã',exact:true}).click();await page.getByRole('button',{name:'Abastecer 4 L'}).click();expect(await page.evaluate(()=>window.__GAME_DEBUG__.getState().fuel)).toBeGreaterThan(7);
  25 |  await page.keyboard.press('Escape');await page.keyboard.press('KeyV');await page.getByRole('button',{name:'Reparo de campo · 2 peças / +25% Radiador',exact:true}).click();await page.getByRole('button',{name:'Reparo de campo · 2 peças / +25% Suspensão',exact:true}).click();const prepared=await page.evaluate(()=>window.__GAME_DEBUG__.getState());expect(prepared.campaign.components.suspension).toBe(63);expect(prepared.campaign.components.radiator).toBe(60);await page.screenshot({path:`${dir}/maintenance.png`});await page.keyboard.press('Escape');
  26 |  await page.keyboard.press('KeyF');await page.keyboard.press('KeyM');await page.getByRole('button',{name:'Planejar desvio seguro'}).click();await page.screenshot({path:`${dir}/routes.png`});await page.keyboard.press('Escape');
  27 |  await page.keyboard.down('KeyW');await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().speedKmh),{timeout:20000}).toBeGreaterThan(4);await page.keyboard.up('KeyW');const travel=await page.evaluate(()=>window.__GAME_DEBUG__.getState());expect(travel.speedKmh).toBeGreaterThan(4);expect(travel.integrity).toBeGreaterThan(95);expect(travel.campaign.inventory.truck.parts).toBe(2);
  28 |  await page.evaluate(()=>window.__GAME_DEBUG__.teleport({x:220,z:-900}));await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().campaign.flags.stormEncountered)).toBe(true);await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().campaign.flags.chosenRoute)).toBe('safe');await page.screenshot({path:`${dir}/storm.png`});
> 29 |  await page.evaluate(()=>window.__GAME_DEBUG__.teleport({x:7,z:-2880}));await page.waitForTimeout(800);await page.keyboard.press('KeyE');await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().engineOn)).toBe(false);await page.keyboard.press('KeyF');await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:36.5,z:-2884}));await page.keyboard.press('KeyF');await expect(page.getByRole('heading',{name:'Tomás · Técnico do Núcleo 1'})).toBeVisible();await page.getByRole('button',{name:'Ligar o gerador · 4 L de diesel + 1 peça'}).click();await expect(page.getByText('Gerador ligado',{exact:true})).toBeVisible();await page.keyboard.press('Escape');await page.evaluate(()=>window.__GAME_DEBUG__.teleportPlayer({x:23,z:-2882}));await page.keyboard.press('KeyF');await expect(page.getByRole('heading',{name:'Núcleo 1 · ressonador atmosférico'})).toBeVisible();await expect(page.getByRole('button',{name:'Iniciar ativação'})).toBeEnabled();await expect(page.getByTestId('activation-chance')).toHaveText('100%');await page.getByRole('button',{name:'Iniciar ativação'}).click();await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().campaign.restoration.ashes)).toBe(true);await page.keyboard.press('Escape');await page.waitForTimeout(2000);await page.screenshot({path:`${dir}/restored.png`});
     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                           ^ Error: expect(locator).toBeVisible() failed
  30 |  await page.keyboard.press('Escape');await page.getByRole('button',{name:'Salvar / carregar partida'}).click();await page.getByRole('button',{name:'Salvar neste slot'}).first().click();await expect(page.getByRole('dialog').getByRole('status')).toContainText('Partida salva',{timeout:20000});
  31 |  const saved=await page.evaluate(()=>window.__GAME_DEBUG__.getState());await page.reload();await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:60000});await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__?.getState().campaign.restoration.ashes)).toBe(true);const loaded=await page.evaluate(()=>window.__GAME_DEBUG__.getState());expect(loaded.campaign.components).toEqual(saved.campaign.components);expect(loaded.campaign.flags.chosenRoute).toBe('safe');expect(loaded.campaign.cores['core-1'].state).toBe('active');expect(loaded.campaign.completedMissions).toContain('aurora-1');expect(loaded.worldVisual.rain).toBe(true);expect(loaded.worldVisual.plants).toBe(true);expect(loaded.worldVisual.barrierOpen).toBe(true);expect(loaded.worldVisual.plantCount).toBe(220);await page.waitForTimeout(1800);await page.screenshot({path:`${dir}/loaded.png`});expect(errors).toEqual([]);await writeFile(`${dir}/vertical-slice.json`,JSON.stringify({prepared,travel,saved,loaded,consoleErrors:errors},null,2));
  32 | });
  33 |
```

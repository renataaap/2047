# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: driving.spec.js >> condução: partida fria, instrumentos reais, marchas, freio, exploração e ré segura
- Location: tests/e2e/driving.spec.js:7:1

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 12
Received:   6.205957583348323
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
          - heading "Fale com a sobrevivente no abrigo" [level=2]
          - paragraph: Pare, desça com F e procure a sobrevivente sob o toldo.
          - generic:
            - generic: ABRIGO 07
            - generic: 0.0 / 3,0 KM
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
        - text: CABINE
        - time: · 09:03 · Manhã
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
            - strong: "02"
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
              - generic: 8.81 t
          - generic: Motor funcionando
        - generic:
          - generic:
            - generic: DIESEL
            - strong: "4.0"
            - generic: L
          - generic:
            - generic: MOTOR
            - generic: 36°C
            - generic: Asfalto
      - button "F Descer do caminhão" [ref=e16] [cursor=pointer]:
        - generic [ref=e17]: F
        - text: Descer do caminhão
```

# Test source

```ts
  1  | import {enterFromNewTutorial} from '../helpers/start-driving.js';
  2  | import { test,expect } from '@playwright/test';
  3  | import { mkdir,writeFile } from 'node:fs/promises';
  4  | const dir='evidence/reformulation-1';
  5  | const state=page=>page.evaluate(()=>window.__GAME_DEBUG__.getState());
  6  | async function start(page){await page.setViewportSize({width:1280,height:720});await page.addInitScript(()=>{if(!localStorage.getItem('aurora-settings'))localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:.2,subtitles:true}));});await page.goto('/');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:60000});await page.getByRole('button',{name:'01 Novo jogo'}).click();await enterFromNewTutorial(page);await page.waitForFunction(()=>window.__GAME_DEBUG__?.getState().mode==='driving');}
  7  | test('condução: partida fria, instrumentos reais, marchas, freio, exploração e ré segura',async({page})=>{
  8  |  test.setTimeout(120000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await start(page);
  9  |  expect((await state(page)).engineOn).toBe(false);expect((await state(page)).gearLabel).toBe('N');await page.keyboard.down('KeyW');await page.waitForTimeout(500);await page.keyboard.up('KeyW');expect((await state(page)).tractionForceN).toBe(0);expect((await state(page)).rpm).toBe(0);
  10 |  await page.keyboard.press('KeyC');await page.waitForTimeout(800);await page.screenshot({path:`${dir}/cold-start.png`});await page.keyboard.press('KeyE');await expect.poll(async()=>(await state(page)).rpm).toBeGreaterThan(600);await page.waitForTimeout(700);const idle=await state(page);expect(idle.audio.state).toBe('running');expect(idle.instruments.rpm).toBeGreaterThan(600);expect(idle.audio.expectedFiringHz).toBeCloseTo(idle.rpm/20,0);await page.screenshot({path:`${dir}/cab-idle.png`});
> 11 |  const samples=[];await page.keyboard.down('KeyW');for(let i=0;i<8;i++){await page.waitForTimeout(700);samples.push(await state(page));}await page.keyboard.up('KeyW');const driven=await state(page);expect(driven.speedKmh).toBeGreaterThan(12);expect(driven.gear).toBeGreaterThan(1);expect(driven.shiftCount).toBeGreaterThan(0);expect(driven.rpm).toBeLessThanOrEqual(2400);expect(driven.massKg).toBeGreaterThan(8800);expect(Math.abs(driven.instruments.speed-driven.speedKmh)).toBeLessThan(3);expect(Math.abs(driven.instruments.rpm-driven.rpm)).toBeLessThan(200);expect(driven.fuel).toBeLessThan(idle.fuel);expect(driven.drawCalls).toBeLessThanOrEqual(300);expect(driven.triangles).toBeLessThanOrEqual(500000);const eye=driven.cameraPose.position;expect(Math.hypot(eye[0]-driven.position[0],eye[1]-driven.position[1],eye[2]-driven.position[2])).toBeLessThan(3.2);await page.screenshot({path:`${dir}/cab-driving.png`});
     |                                                                                                                                                                                                                               ^ Error: expect(received).toBeGreaterThan(expected)
  12 |  await page.keyboard.down('KeyS');await page.waitForTimeout(700);await page.keyboard.up('KeyS');const slowing=await state(page);expect(slowing.speedKmh).toBeLessThan(driven.speedKmh);expect(slowing.gear).toBeGreaterThanOrEqual(0);await page.keyboard.down('Space');await expect.poll(async()=>(await state(page)).speed,{timeout:15000}).toBeLessThan(.6);await page.keyboard.press('KeyF');await page.keyboard.up('Space');await expect.poll(async()=>(await state(page)).mode).toBe('walking');await page.screenshot({path:`${dir}/outside-truck.png`});
  13 |  await page.evaluate(()=>{const s=window.__GAME_DEBUG__.getState();window.__GAME_DEBUG__.teleportPlayer({x:s.position[0]-3,z:s.position[2]});});await page.keyboard.press('KeyF');await expect.poll(async()=>(await state(page)).mode).toBe('driving');await page.keyboard.down('KeyS');await expect.poll(async()=>(await state(page)).gearLabel).toBe('R');await expect.poll(async()=>(await state(page)).signedSpeed).toBeLessThan(-.25);await page.keyboard.up('KeyS');const reverse=await state(page);expect(Math.abs(reverse.signedSpeed)).toBeLessThan(3.3);await page.screenshot({path:`${dir}/reverse.png`});expect(errors).toEqual([]);await writeFile(`${dir}/driving-browser.json`,JSON.stringify({idle,samples,driven,slowing,reverse,consoleErrors:errors},null,2));
  14 | });
  15 | test('câmera externa respeita paredes e ajustes de condução persistem',async({page})=>{
  16 |  test.setTimeout(90000);await mkdir(dir,{recursive:true});await start(page);await page.keyboard.press('Escape');await page.getByRole('button',{name:'Configurações',exact:true}).click();await page.getByRole('slider',{name:'Distância da câmera externa'}).focus();await page.keyboard.press('End');await page.getByRole('slider',{name:'Resposta da direção'}).focus();await page.keyboard.press('End');await page.getByRole('checkbox',{name:'Movimento da cabine'}).uncheck();await page.screenshot({path:`${dir}/driving-settings.png`});await page.getByRole('button',{name:'Voltar',exact:true}).last().click();await page.getByRole('button',{name:'Voltar à viagem'}).click();
  17 |  await page.evaluate(()=>window.__GAME_DEBUG__.teleport({x:-22,z:-4}));await page.keyboard.down('Space');await page.keyboard.press('KeyC');await page.keyboard.press('KeyC');await page.mouse.move(650,350);await page.mouse.down();await page.mouse.move(704,275,{steps:6});await page.mouse.up();await page.waitForTimeout(1000);const collision=await state(page);expect(collision.cameraPose.distance).toBe(25);expect(collision.cameraPose.position[2]).toBeLessThan(13.7);await page.screenshot({path:`${dir}/camera-collision.png`});await page.keyboard.up('Space');
  18 |  await page.reload();await expect(page.getByRole('button',{name:'Configurações',exact:true})).toBeEnabled({timeout:60000});await page.getByRole('button',{name:'Configurações',exact:true}).click();await expect(page.getByRole('slider',{name:'Distância da câmera externa'})).toHaveValue('25');await expect(page.getByRole('slider',{name:'Resposta da direção'})).toHaveValue('1.5');await expect(page.getByRole('checkbox',{name:'Movimento da cabine'})).not.toBeChecked();await writeFile(`${dir}/camera-browser.json`,JSON.stringify(collision,null,2));
  19 | });
  20 |
```

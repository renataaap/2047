# 2047: Rede Aurora

Fase 1: base jogável 3D de uma jornada de sobrevivência. Dante Rocha Negra dirige o **Titã Rocha Clara** pelo **Mar de Cinzas**. Mundo e caminhão reais em Three.js; suspensão e colisões com Rapier. Somente a primeira fase foi implementada.

## Executar

Requer Node.js 20.9+ (verificado com 24.19.0), npm e navegador desktop com WebGL2.

```sh
npm ci
npm run db:migrate
npm run dev
```

Abra `http://localhost:3000` e clique em **Novo jogo**. A partida começa ao volante com motor ligado; E alterna a ignição. O objetivo desta fase é percorrer os 3 km da velha rodovia. Não há persistência de progresso nesta fase; Continuar e Carregar partida estão desabilitados.

```sh
npm test
npm run build
npm start
```

Navegador de testes:

```sh
npx playwright install chromium
npm run test:e2e
# Se já houver Chromium de sistema:
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e
```

O e2e inicia e encerra seu próprio servidor de desenvolvimento. Os screenshots e métricas ficam em `evidence/`; o relatório detalhado em `playwright-report/`. Em produção, `window.__GAME_DEBUG__` não é exposto.

Verificações adicionais reproduzíveis:

```sh
node scripts/measure-vehicle.js
# Em um terminal: npm start -- --port 3100
# Em outro terminal:
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium node scripts/smoke-production.js
```

## Controles

| Tecla | Ação |
| --- | --- |
| W / S | Acelerar / frear; segure S após parar para dar ré |
| A / D | Direção |
| Espaço | Freio de mão |
| E | Ligar/desligar o motor |
| C | Externa → cabine → livre |
| Mouse arrastado / roda | Orbitar / zoom na câmera livre |
| L | Faróis |
| Esc | Pausa / voltar |

A pausa contém recuperação para reposicionar um caminhão tombado. Qualidade Baixo/Médio/Alto, escala de resolução, legendas e volume são persistidos em localStorage. Esses ajustes não são saves de progresso.

## Organização

`src/game/core/Game.js` coordena módulos separados de física, mundo, veículo, entrada, renderização e áudio, fora do React. O passo fixo é 1/60 s; a renderização interpola os estados; React recebe snapshots a 10 Hz. `dispose()` libera recursos e listeners. Textos de interface estão em `src/data/pt-BR.js`, parâmetros em `src/data/config.js`.

A grade móvel mantém nove setores de 1.024 m, gerados com seed 2047, com culling de frustum e setor. A estrada tem 3 km e o terreno continua além dela. Chunks são gerados um por frame nas mudanças de janela. Props repetidos usam instâncias; terreno e estrada compartilham materiais.

`GET /api/game/config` retorna a configuração. `src/lib/repository.js` é o único importador do driver libSQL, com migração idempotente inicial. Saves, identidade anônima, validação de payloads e demais rotas serão implementados na Fase 2. Produção exige Turso e recusa arquivo local; o deploy Vercel está reservado para a Fase 6.

Consulte `DECISOES.md`, `ASSETS_PENDENTES.md`, `CHECKLIST_MANUAL.md` e `RELATORIO_FASE_1.md` para decisões, limites e provas. FPS de laboratório não é uma promessa de desempenho em qualquer dispositivo.

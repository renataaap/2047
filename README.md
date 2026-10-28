# 2047: Rede Aurora

Jogo 3D de navegador em JavaScript, Next.js, Three.js e Rapier. Fase 2: abrigo → recebimento da Semente → preparo do Titã → escolha entre duas rotas → Núcleo 1 → restauração → salvar/carregar.

## Windows
1. Instale Node.js LTS em https://nodejs.org.
2. Extraia o ZIP inteiro e abra a pasta que contém package.json.
3. Dê dois cliques em **INICIAR_JOGO.bat**. Na primeira execução, a instalação usa Internet e pode levar alguns minutos.
4. O iniciador abre http://localhost:3000 depois de o servidor responder. Mantenha a janela aberta enquanto joga. Se o navegador não abrir automaticamente, acesse esse endereço manualmente.

A execução do arquivo .bat em Windows ainda requer verificação humana; os comandos internos foram usados no ambiente Linux de desenvolvimento.

## Instalação manual / Linux / macOS

```sh
npm ci
npm run db:migrate
npm run dev
```

Requer Node.js 20.9+ (verificado com 24.19.0) e navegador desktop com WebGL2. Abra http://localhost:3000.

## Primeira viagem

Novo jogo começa ao volante com o motor ligado e diesel na reserva. Pare, pressione F e caminhe até a sobrevivente no abrigo. F abre o diálogo; aceite a Semente. Transfira diesel e peças ao compartimento do Titã pelo inventário, abasteça e repare radiador/suspensão. M abre as rotas: desvio pavimentado a leste, atalho irregular a oeste. No Núcleo, estacione no retângulo de balizadores, desligue o motor, desça e use o terminal. Confira a chance e calibre se precisar. A primeira ativação não permite avançar fora da sequência dos sete Núcleos.

| Tecla | Ação |
| --- | --- |
| W / S, A / D | Acelerar/frear/ré e direção; a pé, caminhar |
| Espaço | Freio de mão; a pé, pular |
| Shift | Correr a pé |
| F | Descer parado, entrar ou interagir com alvo próximo |
| E | Motor (somente dirigindo) |
| C | Externa → cabine → livre |
| Arrastar / roda do mouse | Orbitar / zoom na câmera livre |
| Clique no mundo / mouse | Olhar a pé, com pointer lock |
| L | Faróis |
| M / R / Tab / V | Mapa / rádio / inventário / inspeção |
| Esc | Pausa / voltar |

A pausa contém salvar/carregar, ajustes, resgate e retorno ao menu. Resgate cobra diesel e integridade para não devolver recursos consumidos. Ajustes gráficos/volume/legendas são locais; progresso usa API e libSQL.

## Testes e produção

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
# Alternativa com Chromium de sistema:
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e
```

Em produção, configure TURSO_DATABASE_URL (libsql:// ou https://) e TURSO_AUTH_TOKEN antes de `npm start`. Disco local é recusado em produção. SAVE_COOKIE_SECRET pode assinar o cookie anônimo (use segredo aleatório forte e estável). HttpOnly e SameSite=Strict sempre; Secure em HTTPS/produção. No localhost HTTP de desenvolvimento, Secure fica desativado para funcionar no Windows.

O banco file:local.db é criado no projeto, atrás de src/lib/repository.js, e deve ser preservado para continuar partidas locais. Não vem no ZIP; não substitua seu banco ao instalar uma atualização. O cookie identifica o dono: apagar cookies ou trocar localhost por 127.0.0.1 muda a identidade e pode ocultar seus slots. Use sempre o mesmo navegador e endereço.

GET /api/game/config, /api/game/items, /api/game/missions, /api/world/regions?slot=1; GET/POST /api/saves; GET/PUT/DELETE /api/saves/[slot]. Limite 128 KiB; erros padronizados; revisão otimista. Não há HTTP por frame: API apenas para catálogo/listagem, carregar e salvar manual/checkpoint.

O jogo roda fora do React. Passo fixo 1/60 s, interpolação, HUD 10 Hz, janela móvel 3×3, instâncias e LOD. window.__GAME_DEBUG__ existe somente em desenvolvimento. Cada fase tem relatório com provas e limitações. Consulte CHECKLIST_MANUAL.md, DECISOES.md e ASSETS_PENDENTES.md. Sessões humanas longas, sensação dos controles e ~60 FPS em GPU integrada a 1080p permanecem não verificados.

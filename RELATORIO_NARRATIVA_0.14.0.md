# 0.14.0 — Narrativa, cinematografia e consequências (EM ANDAMENTO, NÃO CONCLUÍDA)

**Branch:** `feat/narrativa-0.14.0`
**Base:** 0.12.1, `b97bcb8` (branch `claude/code-game-studios-skill-e1w3ae`).
**A 0.13.0 não existe** no repositório em 08/11/2026. Tráfego, segunda cidade, rotinas de NPC e a reforma visual não estão disponíveis, e esta versão não depende deles. A auditoria e as decisões de design estão em [`docs/NARRATIVA_0.14.0.md`](docs/NARRATIVA_0.14.0.md), um documento com spoilers e seção restrita.

## Incrementos

| Incremento | Estado | O que existe de fato |
|---|---|---|
| A — Auditoria narrativa | **Feito** | Mapa do que existe (Brutus ausente do código, `finalChoice`/`titanForced` sem uso, uma única fala da Voz), capítulos, diretrizes de personagem, análise dos finais com recomendação |
| B — Estado narrativo | **Feito** | `src/game/narrative/story.js`: capítulo derivado dos Núcleos; cenas assistidas/puladas; escolhas aplicadas uma vez com custo atômico; relações derivadas; registro de rádio; qualidade de ancoragem gravada a cada ativação. Bloco opcional `campaign.story`, validado. Saves antigos continuam válidos. |
| E — Rádio e Voz | **Feito (primeira leva)** | 22 transmissões por capítulo, região, missão e escolha. Tocam só em cruzeiro (velocidade > 18 km/h, volante quase reto, sem painel nem cena), com intervalo de 75 s, uma vez cada. Legenda no topo central e registro consultável no painel R. 6 fontes de fragmento da Voz: 1 já existente, 3 no rádio e 2 na exploração a pé (Balança 07 e Motel), com entrada no diário. |
| C — Prólogo 2027 (story 002) | **Feito (aprovado pelo criador)** | O Novo Jogo abre o prólogo (`src/game/narrative/cutscenes/prologue.js`, ~41 s, pulável): seis planos (2027 limpo → luz estranha → plasma → túnel → cartela "2047 / Vinte anos depois" → mundo devastado sobre o barracão e o Titã). Depois disso, o jogador recebe o controle com o tutorial em 1/21. 2027 acontece num **set próprio** (`Prologue2027Set.js`), montado só durante o prólogo e descartado ao fim. O set fica a 1500 m de altura, com cúpula de céu própria, materiais sem névoa e luzes próprias. Tem rodovia inteira, guard-rail, postes com fios, árvores, posto aceso, carros nas duas mãos, cidade e torre de rádio (que apaga quando as comunicações caem) e colina com túnel real e luzes internas. Com redução de movimento, só aparece a cartela 2047, sem set. Saves existentes ou legados nunca o veem. **A arte do set é procedural e low-poly: polimento visual pendente, não é arte final.** |
| C — Introdução de Dante (story 003) | Pendente | — |
| D — Personagens (cenas de conversa) | Parcial | Falas novas de Renata, Lia, Afonso, Noêmia, Joel e Garcia no rádio. **As três escolhas agora são jogáveis** nos painéis dos abrigos (Lia no Viaduto; homens de Garcia na bomba de Afonso; Noêmia na Cordilheira), com pedido, custo, "decisão importante", reação persistente e efeito em relações e rádio. Opções que usam o caminhão exigem o Titã estacionado. Ainda não há cena 3D de Brutus. |
| Sistema de cutscenes (story 001) | **Feito (sem conteúdo)** | `src/game/narrative/cutscene.js`: cenas descritas por dados (planos com câmera, legenda, luz e áudio) e um único `CutscenePlayer`. A cena suspende física, entrada, áudio e rádio. Esc, Space, Enter ou o botão pulam e levam ao mesmo estado de assistir até o fim. Com redução de movimento, a câmera fica fixa e a cena dura até 1,8 s. A cena fica registrada como `watched`/`skipped` em `campaign.story.scenes`, e um pulo nunca rebaixa uma cena assistida. A cinemática da restauração passou a herdar do mesmo player, com a trajetória original. O registro `CUTSCENES` está vazio: o conteúdo e o momento em que cada cena começa ficam para as stories 002–006. |
| F — Cutscenes da campanha | Pendente | Só a cena ambiental da 0.11, agora sobre o sistema da story 001 |
| G — Consequências visíveis | Pendente | Por enquanto as consequências são falas e relações |
| H — Finais | Regras aprovadas em 09/11 | Renascimento parcial = campo instável (Semente <60% na ancoragem) que para no estágio 2, com aviso da Renata e marca no diário; Último destino exige o Titã no trecho final (motor de 2003 sem eletrônica); Brutus/Garcia com a motivação aprovada. **Nenhum final está implementado** (1.0). |
| I — Polimento | Pendente | — |

## Validação

- `npm test`: **345/345 em 42 arquivos** (18 testes novos: `narrative-story`, `narrative-radio`). Incluem um teste que procura termos do segredo da Voz em todo texto exibido.
- `npm run build`: aprovado.
- **E2E novo `narrative.spec.js`:** Novo Jogo → tutorial → motor → acelerar na estrada real até a primeira transmissão. Confere a legenda visível no topo, o texto e o registro no save. Passou. Captura: `evidence/narrative-0.14.0/radio-line.png` (não versionada nesta etapa; gerada em `AURORA_EVIDENCE_ROOT`).
- **Regressão E2E: 9/9 em 10,1 min** (`driving`, `phase4`, `world-expansion` e `narrative`), sobre o código do commit do rádio narrativo. Cobre condução, os sete Núcleos/fase 4, POIs/diário e o rádio novo. Não é a integral.
- **09/11 (escolhas, ancoragem instável, segurança):** 358/358 unitários e build. Regressão E2E com `phase4`, `restoration`, `interface`, `contracts-api`, `driving` e `narrative`: **12/13**. A falha foi no próprio teste do rádio: a legenda dura ~8 s e sumiu antes da medição (o jogo funcionou). Depois de corrigir o teste para medir assim que a legenda aparece: **`narrative` 4/4** (2 testes × 2 repetições), incluindo a escolha da Lia salva no servidor.
- **11/11 (story 001, sistema de cutscenes):**
  - **Ambiente:** o worktree tinha um junction `node_modules` apontando para `C:\Temp\renatinha\2047\node_modules`, e o Turbopack recusava o build. Removi só o vínculo (`rmdir` sem `/s`; o original manteve as 60 pastas) e rodei `npm ci` no worktree.
  - **Unitários:** `npm test` deu **372/372 em 46 arquivos** na fonte final. São 14 testes novos em `tests/unit/cutscene.test.js`, cobrindo validação, fila, início, atualização, fim, pulo, redução de movimento, `watched`/`skipped`, pausa, retomada/limpeza, exclusão mútua com a restauração e o teclado. No teclado, Esc/Space/Enter só pulam no contexto `cinematic`; fora dele mantêm freio de mão, salto e pausa, e uma tecla segurada depois do pulo não vaza.
  - **Checagem de mutação:** três quebras propositais (gravar sempre `watched`, não restaurar a exposição, Esc pular fora de cena) foram detectadas.
  - **Correção encontrada:** uma cena iniciada ao volante ou a pé voltava ao modo de um painel antigo (`resumeMode`). Escrevi o teste, vi falhar e corrigi.
  - **Build:** `npm run build` aprovado.
  - **E2E novo `cutscene.spec.js`** (3 testes, fixture de teste registrada pelo gancho de debug `playCutscene`, que só existe em desenvolvimento):
    - Ao volante: a cena abre, `simulation.steps` não avança, o rádio fica mudo e Esc pula. O caminhão continua no lugar (<0,1 m), e depois Esc volta a pausar, L acende os faróis, E liga o motor e W acelera.
    - Assistir até o fim e pular terminam no mesmo estado funcional, com `watched`×`skipped`, e a cena não se repete.
    - A pé: o botão pula e Dante continua no lugar. Com redução de movimento, Enter pula e a cena termina sozinha em ≤1,8 s. Space volta a saltar.
  - **Regressão relevante: 10/10 em 5,4 min** (`cutscene`, `narrative` e os 5 de `restoration`, incluindo a cinemática completa e a redução de movimento da restauração), sem retries. Depois disso, só o spec mudou (fixture mais longa e espera da animação antes da captura). A rechecagem de `cutscene.spec.js` deu **3/3**; ela não é um caso inédito.
  - **Ambiente dos E2E:** rodaram no Chrome do sistema (`PLAYWRIGHT_CHROMIUM_EXECUTABLE`), headless com SwiftShader. Os navegadores do Playwright não estão instalados nesta máquina.
  - **Evidências:** as capturas curadas estão em `production/qa/evidence/story-001-sistema-de-cutscenes/`; as brutas ficam em `evidence/current-e2e/` (não versionadas).
- **11/11 (story 002, prólogo; branch `feat/narrativa-0.14.0`):**
  - **Unitários e build:** `npm test` deu **385/385 em 47 arquivos** na fonte congelada (hashes em `production/qa/evidence/story-002-prologo-2027-e-transicao/stamp.txt`). São novos `tests/unit/prologue.test.js` (12 testes) e 1 teste de regressão em `cutscene.test.js`. `npm run build` foi aprovado.
  - **Defeitos reais corrigidos:**
    - Pular uma cena antes de o modelo do Dante carregar travava o fim da cena (`actor.anchor` indefinido). O teste foi visto falhando antes da correção.
    - O plano de plasma passava a câmera dentro do Titã.
    - A cartela 2047 ficava invisível (fade de 0,8 s num plano de 2 s).
    - Com redução de movimento, o modo reduzido mostrava "trânsito normal" em vez da cartela. Agora a cena tem `reducedShot`.
    - As poses das câmeras do set estavam com os eixos trocados (vista aérea a ~260 m).
    - Colinas atravessavam a cúpula.
    - Em Médio e Alto, o `far` desenhava o mundo de 2047 atrás do set. Agora o `far` é limitado a 640 m só durante o set.
  - **Ajustes de teste:**
    - Novo `skipPrologue` nos helpers. Specs que fazem Novo Jogo sem testar o prólogo o pulam pela ação real (Esc).
    - `cutscene.spec` passou a comparar só as cenas da fixture.
    - `game.spec` usava `URL.pathname`, que gera `C:\C:\...` no Windows. Defeito antigo do harness, corrigido com `fileURLToPath`.
  - **E2E novo `prologue.spec.js`** (4 testes): prólogo inteiro sem avançar `simulation.steps`; tutorial 1/21 intacto; pulo por Space; cartela no modo reduzido; save legado via Continuar nunca abre o prólogo; perfis Médio e Alto.
  - **Métricas no jogo real (Baixo):** de 79 a 104 draw calls e de 16 mil a 32 mil triângulos durante o set, contra ~200 e ~251 mil na jogabilidade. As geometrias caem de 296 para 218 ao fim (o set é liberado). Em Médio e Alto continuam ~240 draw calls durante o set, provavelmente pelo mapa de sombras renderizado em volta do jogador (custo não visível). **Pendente:** pausar a atualização do mapa de sombras durante o set.
  - **Regressões E2E:**
    - Primeira rodada de 14 specs, **antes** do set de 2027 e das correções: 29 aprovados e 6 falhas. Está preservada em `evidence/current-e2e/story002-pre-set/` e **não vale para a versão final**.
    - **Regressão final** (15 specs, 41 testes, fonte congelada conferida pelos hashes de `stamp.txt`, 11/11 das 13h39 às 14h01): **40 aprovados, 1 falha, em 22,3 min.** A falha foi em `assets.spec.js:9` ("Poly Haven instalado"), em 2 ms: o Chrome do sistema fechou durante a abertura (`browserType.launch: Target page, context or browser has been closed`), antes de carregar a página. É **ambiente**, não defeito do jogo. A rechecagem isolada deu **1/1 em 22,3 s** e não conta como caso inédito. O `tutorial-assets`, intermitente na rodada anterior, passou. Logs brutos em `evidence/current-e2e/story002-final/` (não versionados). O registro está em `production/qa/evidence/story-002-prologo-2027-e-transicao/validation.json`.
- **11/11 (story 002, polimento visual do set de 2027, sobre `72986a8`):**
  - **Pedido do criador:** "não quero transformar o prólogo em uma apresentação visualmente inferior ao gameplay". Os pontos pedidos foram estrada e sinalização, veículos, fachadas, vegetação, túnel, materiais e luz, e cidade.
  - **Feito, tudo procedural, sem assets nem pacotes novos:**
    - Céu com nuvens fbm, sem as listras `sin×sin`.
    - Névoa própria do set, aplicada só durante o render (`onBeforeRender`/`onAfterRender`) e devolvida ao mundo logo depois, no mesmo tipo FogExp2, sem recompilar shaders. Dá perspectiva aérea e escurece com a tempestade.
    - Relevo com ruído no campo e na colina do túnel.
    - Árvores folhosas e coníferas com copa irregular e sombra de contato.
    - Carros com perfil extrudado (capô, porta-malas, vidros inclinados).
    - Cidade com recuos, coroamentos, faixas de janela e paleta variada; as luzes apagam na tempestade.
    - Placa de destinos e de 80 km/h com texto, outdoor genérico ("Férias no litoral"), guard-rail com duas lâminas e fios em catenária.
    - Portal com testeira; interior do túnel com calçadas e barra de azulejo.
  - **Defeito antigo corrigido:** placa, vitrine, telas das bombas e letreiro do posto estavam virados para −z. Como todas as câmeras olham de +z, eles nunca apareciam.
  - **Sombras:** o mapa de sombras do mundo de 2047 fica congelado durante o set (`shadowMap.autoUpdate`). Em Médio/Alto o set caiu de ~240 para 89–97 draw calls.
  - **Validação:** 388/388 unitários, build, prólogo 4/4 e specs afetadas 10/11. A falha foi do harness: origem fixa na porta 3000. Corrigido para usar o `baseURL`; a rechecagem deu 2/2.
    - Ambiente: a porta 3000 estava ocupada por um servidor da pasta principal, aberto pelo usuário às 13h47. Ele não foi interrompido, e os testes rodaram na porta 3100.
    - Uma rodada intermediária (polish-b1) acessou esse servidor, que não tem prólogo, e foi descartada.
    - A regressão final das 13h39 segue válida: os testes do prólogo passaram nela depois das 13h47.
  - **Capturas:** `production/qa/evidence/story-002-prologo-2027-e-transicao/`. São 1–7 (planos), `alto-clean`, `reduzido-cartela` e `antes-1/2` (visual anterior, para comparação).
  - **Story 002 concluída** com sign-off do criador em 11/11. A arte do set continua procedural, **não é arte final**; falta medir numa GPU física no Windows.
- **Sem** integral de E2E, playtest humano, Windows/GPU ou revisão de texto por outra pessoa.

## Limitações conhecidas

- A legenda do rádio entra com uma animação de 250 ms. No SwiftShader dos testes ela fica mais lenta; a primeira captura saiu vazia por isso. A legenda das cutscenes usa a mesma animação (~1 s de relógio real sob SwiftShader), e o E2E espera a opacidade 1 antes da captura.
- Cutscenes: hoje uma cena da fila só começa por `begin()` (em `Game.resume()` ou pelo gancho de debug). O momento seguro de cada cena real fica para as stories 002–006. O botão "Pular cena" tem foco automático, então Enter/Space podem chamar o pulo duas vezes; o pulo é idempotente.
- `biomeAt` ainda usa só o eixo z (legado). As falas presas a uma região podem tocar em trecho próximo ao limite de bioma.
- Sem voz gravada: o rádio é só texto e o chiado existente.
- O registro guarda as transmissões como tocadas no momento em que aparecem. Se o jogo fechar antes do próximo save, a fala pode tocar outra vez.

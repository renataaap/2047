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
| C — Prólogo 2027 / introdução de Dante | Pendente | — |
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
- **Sem** integral de E2E, playtest humano, Windows/GPU ou revisão de texto por outra pessoa.

## Limitações conhecidas

- A legenda do rádio entra com uma animação de 250 ms. No SwiftShader dos testes ela fica mais lenta; a primeira captura saiu vazia por isso. A legenda das cutscenes usa a mesma animação (~1 s de relógio real sob SwiftShader), e o E2E espera a opacidade 1 antes da captura.
- Cutscenes: hoje uma cena da fila só começa por `begin()` (em `Game.resume()` ou pelo gancho de debug). O momento seguro de cada cena real fica para as stories 002–006. O botão "Pular cena" tem foco automático, então Enter/Space podem chamar o pulo duas vezes; o pulo é idempotente.
- `biomeAt` ainda usa só o eixo z (legado). As falas presas a uma região podem tocar em trecho próximo ao limite de bioma.
- Sem voz gravada: o rádio é só texto e o chiado existente.
- O registro guarda as transmissões como tocadas no momento em que aparecem. Se o jogo fechar antes do próximo save, a fala pode tocar outra vez.

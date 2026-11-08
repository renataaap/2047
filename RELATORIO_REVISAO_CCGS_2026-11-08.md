# Revisão geral com Claude Code Game Studios — 08/11/2026

**Branch:** `feat/narrativa-0.14.0` (0.14.0 em andamento, sobre a 0.12.1 `b97bcb8`; a 0.13.0 não existe). Pedido: usar as skills do CCGS para revisar o jogo e mudar o que for preciso, inclusive a estética (interfaces e decoração), porque o jogo parecia simples demais. Direção de referência: [`docs/VISAO_CRIATIVA.md`](docs/VISAO_CRIATIVA.md).

## 1. O que mudou no jogo

| Área | Antes (capturas reais) | Agora |
|---|---|---|
| Mundo distante | 18 caixas cinza por setor nas Cidades e na Tempestade; nada característico nos outros biomas | Vestimenta procedural por bioma: torres em ruína com lajes, pilares, faixas de janela e topo quebrado, e viaduto interrompido (Cidades); cascos encalhados com faixa de sal, estacas de píer e crosta poligonal (Leito Seco); agulhas facetadas e lâminas vítreas (Cordilheira); torres de energia inclinadas, fulguritos e cicatrizes violeta que somem com a restauração (Tempestade); chaminés, silos e galpões (Mar de Cinzas). `src/game/world/biomeKits.js`, `BiomeDressing.js` |
| Cordilheira | morros esticados 2,8× formavam paredes cinza retas | 1,7× mais agulhas e lâminas |
| HUD | 8 botões permanentes; barras de sobrevivência sempre visíveis em 100%; minimapa empilhado na coluna esquerda da cabine; texto de 10 px | botão **Painéis** com lista e até 3 atalhos por contexto; barras só em alerta; minimapa no teto da cabine, livrando pista, mostradores e retrovisor; texto ≥13–14 px; foco visível; redução de movimento |
| Rádio e narrativa (antes desta revisão) | 1 fala da Voz | 22 transmissões, registro no painel R, 6 pistas da Voz |
| Economia (`/balance-check`) | frete curto rendia mais que o longo | prêmio pela distância; demanda oscila |

**Orçamento medido** (setor de 1024 m, por geometria): no máximo 10 mil triângulos, 4 draw calls e 18 colliders simples por setor. Nenhuma textura nova e nenhum sampler novo; os materiais `kit*` emprestam os mapas de rocha e ferrugem e acompanham Baixo/Alto/Baixo. Nada fica a menos de raio+8 m de qualquer pista, das reservas ou a menos de 70 m de locais nomeados.

## 2. Skills do CCGS

**Usadas (com resultado):**
| Skill | Resultado |
|---|---|
| `/balance-check` | 3 problemas críticos; o principal (vaivém curto) foi corrigido; os outros 2 (faltam gastos, níveis 3–6 vazios) estão registrados |
| `/art-bible` | `design/art/art-bible.md` completa (9 seções), com diretor de arte, UX e artista técnico; conflitos resolvidos pelo padrão técnico restrito |
| `/asset-audit` | NON-COMPLIANT: 7 PBR em 2048 no Alto contra o teto de 1k da bíblia; 3 GLBs CC BY-NC em uso; ~35 MB de candidatos não carregados; 0 ausentes; 107/107 PNG em potência de 2 |
| `/tech-debt` | `docs/tech-debt-register.md` com 12 itens; críticos: repositório de 1,81 GiB e licença CC BY-NC |
| `/playtest-report` | `docs/PLAYTEST_MODELO.md` para as suas sessões A e B |
| `/security-audit` | `production/security/security-audit-2026-11-08-full.md`: FIX BEFORE SHIPPING (1 alto: a API aceita qualquer save coerente); categorias 1–3 NOT ASSESSED nesta stack |

**Não se aplicam a este projeto, e por quê:**
- **Específicas de motor:** `/setup-engine` e `/test-helpers` (Godot/Unity/Unreal), e os agentes `godot-*`, `unity-*` e `ue-*`. O jogo é Three.js/Next.js.
- **Dependem de GDDs, epics e stories, que o projeto não tem** (ele usa relatórios por versão): `/design-review`, `/review-all-gdds`, `/consistency-check`, `/propagate-design-change`, `/map-systems`, `/design-system`, `/create-epics`, `/create-stories`, `/dev-story`, `/story-done`, `/story-readiness`, `/sprint-plan`, `/sprint-status`, `/qa-plan`, `/regression-suite`, `/content-audit`, `/test-evidence-review`, `/create-architecture`, `/architecture-*`, `/create-control-manifest`, `/estimate`. Para usá-las seria preciso migrar a documentação com `/adopt` ou `/reverse-document`, um trabalho grande que não deixa o jogo melhor agora.
- **Lançamento e pós-lançamento** (o jogo não está em release): `/launch-checklist`, `/release-checklist`, `/day-one-patch`, `/hotfix`, `/team-release`, `/team-live-ops`, `/gate-check`, `/milestone-review`.
- **Sem dados ainda:** `/perf-profile` (não há medição em GPU real), `/soak-test` e `/test-flakiness` (precisam de várias rodadas de CI), `/bug-triage` (não há bugs registrados).
- **Repetem o que já foi feito** ou servem para começar do zero: `/start`, `/brainstorm`, `/prototype`, `/vertical-slice`, `/onboard`, `/help`, `/project-stage-detect`, `/scope-check`, `/retrospective`.
- **Planejadas para os próximos passos:** `/ux-review` e `/playtest-report analyze` (depois do seu playtest), `/team-narrative` (cenas da 0.14), `/quick-design` (novos tipos de frete), `/patch-notes` e `/changelog` (ao fechar a versão), `/localize` (se houver outro idioma).

## 3. Validação desta rodada

- `npm test`: **350/350** (43 arquivos), incluindo `biome-dressing.test.js` com geometria, orçamento por setor, determinismo, folga da pista e cicatrizes de plasma.
- `npm run build`: aprovado.
- Regressão E2E (layout, interface, expansão do mundo/PBR, terreno, restauração, polimento, narrativa, contratos, garagem): **ver seção 5**.
- Capturas reais antes e depois em SwiftShader (não versionadas; geradas na sessão). **Não** houve teste em GPU Windows, playtest humano nem integral.

## 4. Limites e pendências honestas

- Os kits são procedurais e de silhueta forte, mas **não são arte final**. Ainda faltam os kits transversais (borda viva da estrada, fiação caída, ocupações com lona, carros), as vinhetas narrativas e a "regra das 3 escalas" com LOD.
- A névoa forte deixa os marcos distantes lavados; isso pede uma passada de atmosfera (bíblia §2) que não foi feita.
- O retrovisor continua um retângulo preto e o teto da cabine ocupa ~25% da tela: `CabinInterior.js` é arquivo protegido e não foi alterado.
- Decisões que dependem de você: política de `evidence/` (repositório perto do limite de 2 GB); troca dos carros CC BY-NC; aceitar ou não o risco SEC-001; perfil Alto em 2k ou 1k; as três decisões de história de `docs/NARRATIVA_0.14.0.md` §7.

## 5. Resultado da regressão E2E
*(preenchido ao final da rodada)*

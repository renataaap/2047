# Security Audit Report

**Date**: 2026-11-08
**Scope**: full
**Engine**: nenhum motor de jogo (JavaScript ESM, Next.js 16.4.3, Three.js r186, Rapier 0.21); `engine.name` não definido
**Audited by**: security-engineer via /security-audit (modo autônomo; gravação aprovada pelo modo)
**Files scanned**: `src/` (171 .js), `scripts/`, `tests/`, configs, `.github/`, `package-lock.json`
**Multiplayer**: `platform.multiplayer` e `platform.online` não definidos; a resposta da Fase 1 foi single-player, por `design/game-brief.md` (multiplayer fora do escopo). Por isso o HIGH não foi elevado a CRITICAL.

## Executive Summary

| Severity | Count | Must Fix Before Release |
|---|---|---|
| CRITICAL | 0 | — |
| HIGH | 1 | Sim |
| MEDIUM | 2 | Recomendado |
| LOW | 4 | Opcional |

**Release recommendation (revisada em 09/11): sem HIGH aberto, porque SEC-001 virou risco aceito. As categorias 1–3 continuam NOT ASSESSED, então a recomendação é NOT ASSESSED, não CLEAR TO SHIP.** Original em 08/11: FIX BEFORE SHIPPING. Há um HIGH aberto (SEC-001). Categorias 1, 2 e 3 estão **NOT ASSESSED**: não existe lista de padrões de busca para esta stack. Elas não foram revisadas nem aprovadas; os achados abaixo surgiram durante a leitura de outras categorias. O jogo local single-player não é bloqueado. Antes de qualquer publicação hospedada (Turso, internet): SEC-002, SEC-004 e uma decisão formal sobre o SEC-001.

## HIGH

### SEC-001: a API de saves aceita qualquer estado coerente (pula progressão)
**Category**: Cheat/Anti-Tamper (incidental na Categoria 1)
**File**: `src/app/api/saves/[slot]/route.js:7`, `src/app/api/saves/route.js:5`, `src/lib/api.js:13`, `src/game/persistence/schema.js:15-28`
**Description**: o servidor valida só coerência interna e limites dos valores. Não compara com o save anterior, não verifica transições e não tem MAC. O POST cria um slot em qualquer estágio. Prova em memória: `validSave` aceitou os sete Núcleos ativos com `travelSeconds:0`, combustível 180 e 500 de comida no baú.
**Attack scenario**: o jogador envia `PUT /api/saves/1` com uma campanha concluída ou edita `local.db` com uma ferramenta de SQLite. O impacto fica restrito à própria campanha (isolada por `player_id`).
**Remediation**: decisão de produto. (a) Aceitar o risco formalmente, porque o jogo é single-player. (b) Validar transições no PUT (contadores só crescem, Núcleo só depois de Semente/Cofre, inventário limitado pelo tempo) e aceitar no POST só uma campanha inicial. Se houver recurso online, (b) é obrigatório.
**Effort**: baixo (a) / médio (b)

## MEDIUM

### SEC-002: sem limite de requisições, identidades ilimitadas e chaves desconhecidas persistidas
**Category**: incidental nas Categorias 2 e 3
**File**: `src/lib/api.js:8,11`, `src/app/api/saves/route.js:5`, `src/lib/repository.js:12-15`
**Description**: `validSave` não é estrito. Aceitou 100 mil caracteres numa chave desconhecida, e isso é gravado. Cada requisição sem cookie cria uma identidade com 3 slots de até 128 KiB. Sem limite por IP ou identidade. `listSaves` faz parse de todos os payloads.
**Attack scenario**: um script em laço esgota a cota do Turso e degrada o serviço.
**Remediation**: gravar só a projeção canônica dos campos; reduzir o limite ao tamanho medido de um save; limite de requisições por IP e identidade na borda; cota e alerta; colunas com resumo para `listSaves`.
**Effort**: médio

### SEC-003: o debug de desenvolvimento fica ativo no lançador que o jogador usa
**Category**: Data exposure / Cheat
**File**: `INICIAR_JOGO.bat:22` → `scripts/launch-local.js:4` (`next dev`); `src/game/core/Game.js:105-108`
**Description**: `window.__GAME_DEBUG__` (teleport, setRecoveryAge, setTime, setInput, step) depende de `NODE_ENV!=='production'`, e o lançador local roda `next dev`. O build de produção está correto (`scripts/smoke-production.js` confirma `debugAbsent`).
**Attack scenario**: pelo console, o jogador se teleporta ao Núcleo e acelera a restauração; o próximo save grava o resultado.
**Remediation**: ligar o debug a uma flag explícita (ex.: `NEXT_PUBLIC_AURORA_DEBUG`), ou lançar com `next build` + `next start --hostname 127.0.0.1` e permitir explicitamente o banco local no desktop (hoje `repository.js:7` recusa `file:` em produção).
**Effort**: médio

## LOW

- **SEC-004 — Cookie de identidade.** `SAVE_COOKIE_SECRET` é opcional e falta no `.env.example`; a regex aceita IDs fracos escolhidos pelo cliente; não há tamanho mínimo de segredo nem revogação; ativar o segredo depois invalida identidades sem assinatura. Correção: exigir em produção, aceitar só UUIDv4 estrito e segredo ≥32 bytes, migrar o cookie sem assinatura uma vez e suportar `kid`. Esforço baixo. Fazer **antes** de haver jogadores em produção.
- **SEC-005 — Cabeçalhos HTTP.** `next.config.js` não define CSP, `frame-ancestors`, `nosniff` nem `Referrer-Policy`. Não há XSS conhecido (sem `dangerouslySetInnerHTML`, `innerHTML`, `eval`). A CSP precisa de nonce e de `'wasm-unsafe-eval'` para o Rapier. Esforço baixo a médio.
- **SEC-006 — `dev` e `start` escutam em 0.0.0.0** (`package.json:7,9`), expondo o debug e a API na rede local. O lançador já usa 127.0.0.1. Correção: 127.0.0.1 por padrão e um script separado para LAN. Esforço baixo.
- **SEC-007 — O validador lança exceção em vez de rejeitar.** Com `components`/`inventory` nulos ou do tipo errado, ou com `Origin: null`, a API responde 500 em vez de 400 (16 de 3.096 mutações). Nada é gravado. Correção: checar `plain()` antes dos subvalidadores, ou envolver em try e devolver `false`; transformar a varredura em teste. Esforço baixo.

## Accepted Risk
- **SEC-001 — aceito em 09/11/2026** (decisão delegada pelo criador): o jogo é single-player e não comercial; o jogador só consegue alterar a própria campanha. Reabrir se surgir placar, economia compartilhada, conquista online ou venda.

## Correções aplicadas em 09/11/2026
- **SEC-003:** o lançador do jogador (`scripts/launch-local.js`, usado pelo `INICIAR_JOGO.bat`) roda com `NEXT_PUBLIC_AURORA_DEBUG=0`, então `window.__GAME_DEBUG__` não existe na sessão do jogador. O modo de desenvolvimento continua com debug para testes e scripts.
- **SEC-004 (parcial):** identidade só aceita UUIDv4 estrito; `SAVE_COOKIE_SECRET` documentado no `.env.example`. A exigência obrigatória em produção ficou de fora, para não quebrar um preview já configurado.
- **SEC-006:** `npm run dev` e `npm start` escutam em 127.0.0.1; `npm run dev:lan` para a rede local.
- **SEC-007:** `validSave` nunca lança (recusa e a API responde 400); `Origin` inválido responde 400. Testes em `tests/unit/security-hardening.test.js`.
- Continuam abertos: SEC-002 (limite de requisições/projeção canônica, antes de hospedar) e SEC-005 (cabeçalhos).

## Dependency Inventory

| Plugin / Library | Version | Source | Known CVEs |
|---|---|---|---|
| next | 16.4.3 | npm | `npm audit`: nenhum em 08/11 |
| react / react-dom | 19.3.1 | npm | nenhum |
| three | 0.186.1 | npm | nenhum |
| @dimforge/rapier3d-compat | 0.21.0 | npm | nenhum |
| @libsql/client | 0.18.0 | npm | nenhum |
| @playwright/test (dev) | 1.64.1 | npm | nenhum |
| vitest (dev) | 5.0.5 | npm | nenhum |
| sharp (dev) | 0.35.5 | npm | nenhum |

`npm audit`: 0 vulnerabilidades em 138 pacotes, todos de `registry.npmjs.org` e com `integrity`. Sem `addons/`, `plugins/` ou `vendor/`. Poly Haven baixado com verificação MD5/SHA-256. Fora do escopo de segurança: os GLBs CC BY-NC impedem venda (ver `docs/tech-debt-register.md`, TD-011).

**Data exposure (Categoria 4):** nenhum segredo fixo na árvore atual. `.env*` e `local.db*` estão no gitignore, e não há cookie em arquivo rastreado. Os erros da API são genéricos. Há commits antigos que mencionam `SAVE_COOKIE_SECRET` (4771193, a8a8802, c5b6a80, c201b9b) e não foram inspecionados: recomenda-se rodar gitleaks ou trufflehog no histórico.

## Remediation Priority Order
1. SEC-001 — decidir aceitar o risco ou validar transições — baixo/médio
2. SEC-002 e SEC-004 — antes de qualquer publicação hospedada — médio / baixo
3. SEC-003 — flag de debug explícita — médio
4. SEC-007 — validador sem exceção + teste de varredura — baixo
5. SEC-005 — cabeçalhos — baixo/médio
6. SEC-006 — escutar em 127.0.0.1 — baixo
7. gitleaks no histórico do Git

## Re-Audit Trigger
Rodar `/security-audit quick` depois de corrigir o SEC-001. No `workflow: minimal`, o portão de lançamento não lê este relatório, mas o HIGH aberto mantém a recomendação FIX BEFORE SHIPPING. As categorias 1–3 continuam sem varredura até existir uma lista de padrões para esta stack.

Observação: o `local.db` mudou de tamanho durante a auditoria porque a regressão E2E rodava em paralelo e grava saves de teste. O auditor só executou SELECT.

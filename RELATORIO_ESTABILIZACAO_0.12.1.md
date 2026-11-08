# 0.12.1 — Estabilização da 0.12.0 (em andamento, não concluída)

**Branch:** `claude/code-game-studios-skill-e1w3ae`, que contém `feat/contratos-economia-0.12.0` (`3351e07`) por merge comum, sem reescrever histórico. A 0.12.0 continua sobre a 0.11.0 (`69afd07`), e a `main` continua na 0.10.0 (`4771193`). PRs #5 e #6 seguem abertos e sem revisão em 08/11/2026.

Esta é uma etapa de correções. Não há sistema novo, nem mudança de física, GLB, shader, narrativa ou formato de save.

## Estado confirmado do Git (08/11/2026)

| Ref | Commit | Observação |
|---|---|---|
| `main` | `4771193` | 0.10.0 |
| `feat/restauracao-ambiental-0.11.0` | `69afd07` | PR #5 → `main`; contém a `main` (+10 commits) |
| `feat/contratos-economia-0.12.0` | `3351e07` | PR #6 → branch 0.11; contém a 0.11 (+8 commits) |

Ordem de integração recomendada: o #5 primeiro, **sem squash**, e depois o #6 apontando para a `main`.

## Correções

| # | Problema encontrado na auditoria | Correção | Arquivos |
|---|---|---|---|
| 1 | A demanda regional só diminuía. O bônus de demanda no frete nunca valia nada e as regiões abastecidas ficavam baratas para sempre. | A cada época de 900 s de simulação ativa, a demanda abaixo de 10000 volta 500 pontos e, a partir daí, sobe 250 pontos até 12000 enquanto ninguém entrega. O bônus do frete (até +2 sucatas) passa a funcionar, e os preços ficam até 20% mais altos nessas regiões. Ofertas já anunciadas mantêm o prêmio. | `economy/market.js`, `logistics/contracts.js` |
| 2 | Depois de um HTTP 409, todo save da sessão falhava até recarregar. | Se o servidor já tem exatamente os dados enviados (resposta perdida), o jogo adota a revisão dele. Se os dados forem diferentes (outra aba), recusa sobrescrever e explica o que fazer. | `persistence/client.js` |
| 3 | O rollback com `Object.assign` mantinha blocos criados durante a transação que falhou. | `restoreState` remove esses blocos antes de restaurar. Aplicado na garagem, na economia e na logística. | `persistence/restore.js` e os três controllers |
| 4 | A baia de carga usava as medidas do Titã para qualquer veículo que não fosse o basculante. O tanque de 180 L estava fixo no posto e na garagem. | As medidas e o tanque passam a vir do catálogo (`footprint`, `fuelCapacity`). Veículo sem medidas homologadas é recusado com mensagem, em vez de ser tratado como Titã. Prepara o terceiro caminhão. | `garage/catalog.js`, `contracts.js`, `market.js`, `fleet.js` |
| 5 | O manifesto mostrava ao jogador o ID interno `frete:modelo:época`. | Removido da interface. O ID continua no save. | `ContractsPanel.js` |
| 6 | A mensagem "Transfira recursos ao Titã" aparecia mesmo com o basculante ativo. | Texto neutro: "ao caminhão". Não é fala narrativa. | `world/worldProgress.js` |
| 7 | Não havia CI. | GitHub Actions roda `npm test` e `npm run build` em PRs e na `main`. | `.github/workflows/ci.yml` |

## Validação nesta etapa

- `npm test`: **326/326 em 40 arquivos**, com 8 testes novos (`demand-recovery`, `save-client-conflict`, `stabilization-0.12.1`).
- `npm run build`: aprovado depois das correções 1 e 2. Será repetido no fim desta etapa.
- E2E focados (contratos API, contratos e garagem): ver a seção de resultados abaixo.
- **Não houve** uma integral de E2E nesta etapa. Windows/GPU, áudio, diversão e balanceamento humano continuam pendentes.

## Pendências desta etapa (0.12.x)

1. Seus playtests: primeira hora e 10 fretes (sessões A e B do dossiê). Os valores 500/250/12000 da demanda são hipóteses até lá.
2. Política de evidências: o repositório tem 1,8 GiB e `evidence/` cresce a cada versão. Proposta: guardar no Git só `validation.json` e capturas comparativas selecionadas, e o resto como artefato fora do histórico. Precisa da sua decisão.
3. Turso/preview do Vercel: confirmar se as variáveis estão configuradas; sem elas, o save falha no preview.
4. Integral de E2E antes de propor o merge.

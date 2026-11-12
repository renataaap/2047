# Story 004: Chegada da sobrevivente com a primeira Semente

> **Epic**: 2047 — Rede Aurora
> **Status**: Ready
> **Layer**: Presentation
> **Type**: Visual/Feel
> **Estimate**: M
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: —

## Context

**GDD**: `design/game-brief.md`
**Requirement**: Brief MVP feature 5 — Cena de chegada da sobrevivente com a primeira Semente

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Three.js 0.186.1 (Next.js 16, Rapier 0.21) | **Risk**: NOT ASSESSED (no VERSION.md risk rating)
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal)

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

- Semente continua vinda de `seedService`/inventário; a cena só apresenta o resultado, sem conceder item extra nem duplicar.

---

## Acceptance Criteria

- [ ] A sobrevivente chega ao barracão em cena cinematográfica e entrega a primeira Semente.
- [ ] A Semente aparece no inventário uma única vez, com integridade/estado coerentes com o tutorial.
- [ ] Cena pulável; pular entrega o mesmo estado final.
- [ ] Segue o fluxo do tutorial (encontrar a sobrevivente → receber a Semente → preparar o caminhão → partir).
- [ ] Reentrada/reinício real após a cena não repete nem perde a Semente.
- [ ] Captura retida e sign-off.

---

## Implementation Notes

- Ler `src/game/missions/seedService.js`, `campaign.js`, `src/game/tutorial/*`. Nunca mostrar a identidade da Voz.

---

## Out of Scope

- Story 005: encontro com Brutus.

---

## Files

- `src/game/narrative/cutscenes/survivor-arrival.js` (novo)
- `src/game/tutorial/definitions.js`, `src/game/missions/seedService.js` (somente gancho)
- `production/qa/evidence/story-004-evidence.md`

---

## QA Test Cases

*N/A — no qa-lead specs at this tier; implement against the Acceptance Criteria above*

---

## Test Evidence

*qa.level: minimal — tests waived, but a Visual/Feel retained screenshot is required.*

**Story Type**: Visual/Feel
**Required evidence**: captura retida + sign-off em `production/qa/evidence/story-004-evidence.md`
**Status**: [x] Criada: `production/qa/evidence/story-004-chegada-da-sobrevivente/` (capturas 1–7, reduzido, `metrics.json`, `validation.json`, logs) — sign-off do criador pendente

---

## Dependencies

- Depends on: `production/epics/2047-rede-aurora/story-001-sistema-de-cutscenes.md`, `production/epics/2047-rede-aurora/story-003-dante-barracao-e-tita.md`
- Unlocks: story-005

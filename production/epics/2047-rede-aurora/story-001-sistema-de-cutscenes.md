# Story 001: Sistema reutilizável de cutscenes narrativas

> **Epic**: 2047 — Rede Aurora
> **Status**: In Progress
> **Layer**: Presentation
> **Type**: Integration
> **Estimate**: L
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: 2026-11-11

## Context

**GDD**: `design/game-brief.md`
**Requirement**: Brief MVP feature 1 — Sistema reutilizável de cutscenes narrativas

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Three.js 0.186.1 (Next.js 16, Rapier 0.21) | **Risk**: NOT ASSESSED (no VERSION.md risk rating)
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal)

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

- Base: `RestorationCinematic.js` já apresenta resultado salvo (Esc/Space/Enter/botão pula; redução de movimento = câmera fixa e curta). Generalizar sem quebrá-la.
- Estado narrativo em `campaign.story` (opcional, validado, schema 3); usar o loop e AudioContext existentes (sem outro RAF).

---

## Acceptance Criteria

- [ ] Uma cutscene é descrita por dados (planos com câmera, duração, legenda/fala, iluminação, áudio) e executada por um único player reutilizável.
- [ ] Esc/Space/Enter/botão pulam a cena; pular leva ao mesmo estado final que assistir inteira.
- [ ] Com redução de movimento, usa câmera fixa e curta.
- [ ] Física e entrada do jogador ficam suspensas/restauradas sem teleporte nem perda de controle ao terminar.
- [ ] Cenas já vistas são registradas em `campaign.story` (opcional); saves 1–3 e legados carregam sem migração destrutiva e sem repetir cenas.
- [ ] A cinemática da restauração (`RestorationCinematic`) funciona sobre o mesmo sistema, ou segue funcionando sem regressão.
- [ ] Menus/pausa não avançam o tempo da cena; nenhum frame pesado intermediário.
- [ ] Teste unitário cobre fila, pulo, registro de cena vista e validação do estado.

---

## Implementation Notes

- Ler `src/game/restoration/RestorationCinematic.js`, `src/game/narrative/story.js`, `src/game/narrative/radio.js`, `src/components/game/GameView.js`, `src/app/narrative.css`.
- Nunca exibir a identidade da Voz em legendas ou dados.
- Preservar `campaign.story`, `voiceFragments` como único inventário de pistas.

---

## Out of Scope

- Story 002–006: conteúdo das cenas específicas.

---

## Files

- `src/game/narrative/cutscene.js` — criado (CUTSCENES, validCutscene, CutscenePlayer; retorno ao modo ativo)
- `src/game/restoration/RestorationCinematic.js` — alterado (subclasse de CutscenePlayer; trajetória original preservada)
- `src/game/core/Game.js` — alterado (this.cutscenes no tick, pulo/resume/reset, bloqueio do rádio, gancho de debug playCutscene só em dev)
- `src/components/game/GameView.js` — alterado (overlay cutscene-presentation com legenda e botão Pular)
- `src/app/narrative.css` — alterado (.cutscene-presentation, .cutscene-caption)
- `tests/unit/cutscene.test.js` — criado (14 testes)
- `tests/e2e/cutscene.spec.js` — criado (3 testes E2E)
- `production/qa/evidence/story-001-sistema-de-cutscenes/` — capturas, validation.json, stamp.txt

## QA Test Cases

*N/A — no qa-lead specs at this tier; implement against the Acceptance Criteria above*

---

## Test Evidence

*qa.level: minimal — tests waived (advisory).*

**Story Type**: Integration
**Required evidence**: teste unitário ou nota de playtest
**Status**: [x] `tests/unit/cutscene.test.js` (14) + `tests/e2e/cutscene.spec.js` (3); ver `production/qa/evidence/story-001-sistema-de-cutscenes/validation.json`

---

## Dependencies

- Depends on: None
- Unlocks: story-002, 003, 004, 005, 006

# Story 009: Regressão E2E integral e playtest humano da 0.14.0

> **Epic**: 2047 — Rede Aurora
> **Status**: Ready
> **Layer**: Feature
> **Type**: Integration
> **Estimate**: M
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: —

## Context

**GDD**: `design/game-brief.md`
**Requirement**: Brief MVP feature 10 — Regressão E2E integral e playtest humano da 0.14.0

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Three.js 0.186.1 (Next.js 16, Rapier 0.21) | **Risk**: NOT ASSESSED (no VERSION.md risk rating)
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal)

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

- Não rodar WebGL/E2E e build em paralelo; cookies/traces só em /tmp e nunca publicados.
- Distinguir integral de rechecagens focadas; não somar rechecagens como casos inéditos.

---

## Acceptance Criteria

- [ ] Unitários e build aprovados na fonte final congelada.
- [ ] Suíte E2E integral (`tests/e2e`) executada uma vez na fonte final, com resultado e duração registrados; falhas relatadas sem esconder.
- [ ] Mudanças de fonte após a integral listadas e cobertas por rechecagens identificadas como tal.
- [ ] Saves 1–3 e legados carregam; reinício real preserva `campaign.story` e cenas vistas.
- [ ] Playtest humano em Windows/GPU real: primeiro minuto completo (prólogo → barracão → Semente → partida) sem travar, com notas de ritmo, legibilidade e diversão.
- [ ] Relatório em `RELATORIO_NARRATIVA_0.14.0.md` e `production/qa/evidence/` atualizado, com pendências humanas (audição, equilíbrio) explícitas.

---

## Implementation Notes

- Seguir o padrão dos relatórios anteriores (validation.json, freeze de hashes). Ler `docs/POLITICA_EVIDENCIAS.md`.

---

## Out of Scope

- Novas funcionalidades; correções só se a regressão as exigir.

---

## Files

- `tests/e2e/narrative.spec.js` (e specs das cenas)
- `RELATORIO_NARRATIVA_0.14.0.md`, `production/qa/evidence/story-009-evidence.md`

---

## QA Test Cases

*N/A — no qa-lead specs at this tier; implement against the Acceptance Criteria above*

---

## Test Evidence

*qa.level: minimal — tests waived (advisory); the integral run and human playtest are this story's deliverable.*

**Story Type**: Integration
**Required evidence**: log da integral + notas do playtest
**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: `production/epics/2047-rede-aurora/story-008-refinamento-narrativo.md`
- Unlocks: None

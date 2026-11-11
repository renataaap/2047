# Story 005: Primeiro encontro físico e cinematográfico com Brutus

> **Epic**: 2047 — Rede Aurora
> **Status**: Ready
> **Layer**: Presentation
> **Type**: Visual/Feel
> **Estimate**: M
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: —

## Context

**GDD**: `design/game-brief.md`
**Requirement**: Brief MVP feature 6 — Primeiro encontro físico e cinematográfico com Brutus

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Three.js 0.186.1 (Next.js 16, Rapier 0.21) | **Risk**: NOT ASSESSED (no VERSION.md risk rating)
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal)

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

- Brutus/Garcia já existem como dados e diálogos (`src/data/story.js`, escolha do Leito Seco); a cena não pode contradizê-los.

---

## Acceptance Criteria

- [ ] Brutus aparece fisicamente no mundo (posição e colisão corretas) no ponto narrativo definido.
- [ ] Encontro cinematográfico com enquadramento, fala e animação; pulável.
- [ ] O estado (`campaign.story`) registra o encontro uma vez; reentrada não repete.
- [ ] Compatível com as escolhas de Garcia/Leito Seco já implementadas, em qualquer ordem.
- [ ] Controle devolvido sem teleporte nem caminhão preso.
- [ ] Captura retida e sign-off.

---

## Implementation Notes

- Ler `src/data/story.js`, `docs/NARRATIVA_0.14.0.md` seções 4–5 (diretrizes de personagens). Personagens provisórios (MakeHuman CC0).

---

## Out of Scope

- Story 006: demais cutscenes de campanha.

---

## Files

- `src/game/narrative/cutscenes/brutus.js` (novo)
- `src/data/story.js`, `src/game/narrative/story.js`
- `production/qa/evidence/story-005-evidence.md`

---

## QA Test Cases

*N/A — no qa-lead specs at this tier; implement against the Acceptance Criteria above*

---

## Test Evidence

*qa.level: minimal — tests waived, but a Visual/Feel retained screenshot is required.*

**Story Type**: Visual/Feel
**Required evidence**: captura retida + sign-off em `production/qa/evidence/story-005-evidence.md`
**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: `production/epics/2047-rede-aurora/story-001-sistema-de-cutscenes.md`, `production/epics/2047-rede-aurora/story-004-chegada-da-sobrevivente.md`
- Unlocks: story-006

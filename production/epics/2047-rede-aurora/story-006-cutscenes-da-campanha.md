# Story 006: Cutscenes dos acontecimentos importantes da campanha

> **Epic**: 2047 — Rede Aurora
> **Status**: Ready
> **Layer**: Presentation
> **Type**: Integration
> **Estimate**: L
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: —

## Context

**GDD**: `design/game-brief.md`
**Requirement**: Brief MVP feature 7 — Cutscenes dos acontecimentos importantes da campanha

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Three.js 0.186.1 (Next.js 16, Rapier 0.21) | **Risk**: NOT ASSESSED (no VERSION.md risk rating)
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal)

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

- Capítulo é derivado dos Núcleos (nunca gravado); usar os gatilhos já existentes (ativação de Núcleo, escolhas, fragmentos da Voz).

---

## Acceptance Criteria

- [ ] Lista de acontecimentos importantes definida a partir de `docs/NARRATIVA_0.14.0.md` (ao menos um por capítulo/Núcleo narrativo e as três escolhas).
- [ ] Cada acontecimento dispara sua cena uma única vez, pelo sistema da story 001.
- [ ] A cena só apresenta resultado já salvo (save antes, cena depois); nenhum pagamento ou recompensa depende de assisti-la.
- [ ] Todas puláveis, com redução de movimento respeitada.
- [ ] Fragmentos da Voz continuam via `voiceFragments`; a identidade da Voz nunca é exibida.
- [ ] Cenas não bloqueiam o jogo em contratos, garagem ou navegação (gatilhos em estados seguros).
- [ ] Captura retida de ao menos uma cena por capítulo e sign-off.

---

## Implementation Notes

- Ler `src/game/narrative/story.js`, `radio.js`, `src/game/restoration/RestorationCinematic.js`, `src/game/missions/NetworkController.js`.
- Não alterar missões, tuning, GLBs ou texto narrativo para favorecer testes.

---

## Out of Scope

- Story 007: mudanças persistentes nos cenários.
- Epílogos e quatro finais (1.0.0).

---

## Files

- `src/game/narrative/cutscenes/*.js`
- `src/game/narrative/story.js`, `src/game/missions/NetworkController.js`
- `tests/unit/cutscene-triggers.test.js`
- `production/qa/evidence/story-006-evidence.md`

---

## QA Test Cases

*N/A — no qa-lead specs at this tier; implement against the Acceptance Criteria above*

---

## Test Evidence

*qa.level: minimal — tests waived (advisory); retained screenshots recommended.*

**Story Type**: Integration
**Required evidence**: teste de gatilhos ou nota de playtest
**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: `production/epics/2047-rede-aurora/story-001-sistema-de-cutscenes.md`, `production/epics/2047-rede-aurora/story-005-encontro-com-brutus.md`
- Unlocks: story-007

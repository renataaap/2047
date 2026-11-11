# Story 002: Prólogo cinematográfico de 2027 e transição para 2047

> **Epic**: 2047 — Rede Aurora
> **Status**: Ready
> **Layer**: Presentation
> **Type**: Visual/Feel
> **Estimate**: L
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: —

## Context

**GDD**: `design/game-brief.md`
**Requirement**: Brief MVP feature 2 — Prólogo cinematográfico de 2027 e transição para 2047

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Three.js 0.186.1 (Next.js 16, Rapier 0.21) | **Risk**: NOT ASSESSED (no VERSION.md risk rating)
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal)

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

- Meta de ritmo (não rígida): 0–15 s estrada e civilização com sinais anormais; 15–30 s céu muda, comunicações falham, tempestades de plasma, Dante se abriga num túnel; 30–40 s corte para 2047.

---

## Acceptance Criteria

- [ ] Novo jogo dispara o prólogo de 2027: estrada, sinais de civilização e primeiros acontecimentos anormais na atmosfera.
- [ ] Céu muda, rádio/comunicação falha, tempestade de plasma começa e Dante se abriga num túnel.
- [ ] Corte para 2047 ("vinte anos depois") mostrando mundo devastado, com contraste claro com 2027.
- [ ] Total curto (~40 s de meta) e pulável a qualquer momento; pular chega ao mesmo estado.
- [ ] Reentrada em save existente ou legado não repete o prólogo.
- [ ] Reaproveita o sistema da story 001, sem novos pacotes externos nem assets de terceiros sem licença registrada.
- [ ] Tutorial de 21 objetivos preservado e inicia depois da abertura.
- [ ] Captura retida e sign-off de ritmo, legibilidade e desempenho em GPU integrada.

---

## Implementation Notes

- Look: realismo ambiental PBR, luz natural, áudio sintetizado (diesel, rádio de ondas curtas, chiado). Consultar `design/art/art-bible.md`.
- Texto narrativo conforme `docs/NARRATIVA_0.14.0.md` (seção da Voz é restrita).

---

## Out of Scope

- Story 003: introdução de Dante no barracão e Titã.

---

## Files

- `src/game/narrative/cutscenes/prologue.js` (novo)
- `src/game/core/Game.js`, `src/game/world/*` (cenário/clima da cena)
- `production/qa/evidence/story-002-evidence.md`

---

## QA Test Cases

*N/A — no qa-lead specs at this tier; implement against the Acceptance Criteria above*

---

## Test Evidence

*qa.level: minimal — tests waived, but a Visual/Feel retained screenshot is required.*

**Story Type**: Visual/Feel
**Required evidence**: captura retida + sign-off em `production/qa/evidence/story-002-evidence.md`
**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: `production/epics/2047-rede-aurora/story-001-sistema-de-cutscenes.md`
- Unlocks: story-003

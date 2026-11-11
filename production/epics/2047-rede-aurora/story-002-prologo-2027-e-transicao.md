# Story 002: Prólogo cinematográfico de 2027 e transição para 2047

> **Epic**: 2047 — Rede Aurora
> **Status**: Complete
> **Layer**: Presentation
> **Type**: Visual/Feel
> **Estimate**: L
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: 2026-11-11

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

- [x] Novo jogo dispara o prólogo de 2027: estrada, sinais de civilização e primeiros acontecimentos anormais na atmosfera.
- [x] Céu muda, rádio/comunicação falha, tempestade de plasma começa e Dante se abriga num túnel.
- [x] Corte para 2047 ("vinte anos depois") mostrando mundo devastado, com contraste claro com 2027.
- [x] Total curto (~40 s de meta) e pulável a qualquer momento; pular chega ao mesmo estado.
- [x] Reentrada em save existente ou legado não repete o prólogo.
- [x] Reaproveita o sistema da story 001, sem novos pacotes externos nem assets de terceiros sem licença registrada.
- [x] Tutorial de 21 objetivos preservado e inicia depois da abertura.
- [x] Captura retida e sign-off de ritmo, legibilidade e desempenho em GPU integrada.

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
**Status**: [x] Criada: `production/qa/evidence/story-002-prologo-2027-e-transicao/` (capturas 1–7, Alto, cartela reduzida, antes/depois, `validation.json`, `stamp.txt`)

---

## Dependencies

- Depends on: `production/epics/2047-rede-aurora/story-001-sistema-de-cutscenes.md`
- Unlocks: story-003

---

## Completion Notes

- **Concluída em 11/11/2026** com sign-off do criador ("eu aprovo o prólogo"), depois de ver as capturas do set polido.
- Commits: `72986a8` (prólogo validado) e `e197e81` (polimento visual do set de 2027).
- Validação: 388/388 unitários, build, prólogo 4/4 e regressão de 15 specs com 40/41 (falha de ambiente; rechecagem 1/1). Specs afetadas pelo polimento: 10/11 (falha do harness corrigida; rechecagem 2/2).
- Ressalvas registradas: a arte do set é procedural e **não é arte final**. O desempenho em GPU integrada foi medido por draw calls no SwiftShader (~95 no set contra ~200 na jogabilidade), não num Windows com GPU física.

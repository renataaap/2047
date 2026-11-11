# Story 008: Refinamento de diálogos, câmeras, iluminação e animações

> **Epic**: 2047 — Rede Aurora
> **Status**: Ready
> **Layer**: Presentation
> **Type**: Visual/Feel
> **Estimate**: M
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: —

## Context

**GDD**: `design/game-brief.md`
**Requirement**: Brief MVP feature 9 — Refinamento de diálogos, câmeras, iluminação e animações

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Three.js 0.186.1 (Next.js 16, Rapier 0.21) | **Risk**: NOT ASSESSED (no VERSION.md risk rating)
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal)

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

- Falas dos módulos data protegidos: mudar texto só com decisão do autor; refino de ritmo/legenda sem reescrever o roteiro aprovado.

---

## Acceptance Criteria

- [ ] Todas as cutscenes (stories 002–006) revisadas em ritmo, enquadramento e transições; nenhuma passa de duração-meta sem motivo.
- [ ] Legendas legíveis (tamanho, contraste, tempo de leitura) em 1080p e janelas menores.
- [ ] Iluminação coerente com a hora e o clima do cenário; contraste devastado × restaurado preservado.
- [ ] Animações de Dante, sobrevivente e Brutus sem pop de pose (PlayerVisual/SeatedPose restauram pose antes do mixer).
- [ ] Entrada e saída do caminhão sem cortes bruscos nas cenas.
- [ ] Orçamento de desempenho mantido em GPU integrada nos perfis de qualidade existentes.
- [ ] Sign-off do autor com capturas antes/depois.

---

## Implementation Notes

- Ler `design/art/art-bible.md` e `docs/VISAO_CRIATIVA.md`. Sem novos pacotes externos.

---

## Out of Scope

- Arte final de personagens e rostos (fase "melhorar regiões e arte").

---

## Files

- `src/game/narrative/cutscenes/*.js`, `src/app/narrative.css`
- `production/qa/evidence/story-008-evidence.md`

---

## QA Test Cases

*N/A — no qa-lead specs at this tier; implement against the Acceptance Criteria above*

---

## Test Evidence

*qa.level: minimal — tests waived, but a Visual/Feel retained screenshot is required.*

**Story Type**: Visual/Feel
**Required evidence**: capturas antes/depois + sign-off em `production/qa/evidence/story-008-evidence.md`
**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: `production/epics/2047-rede-aurora/story-006-cutscenes-da-campanha.md`, `production/epics/2047-rede-aurora/story-007-consequencias-visiveis-das-escolhas.md`
- Unlocks: story-009

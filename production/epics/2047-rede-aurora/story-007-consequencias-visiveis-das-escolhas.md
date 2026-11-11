# Story 007: Consequências visíveis das escolhas nos cenários

> **Epic**: 2047 — Rede Aurora
> **Status**: Ready
> **Layer**: Feature
> **Type**: Integration
> **Estimate**: L
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: —

## Context

**GDD**: `design/game-brief.md`
**Requirement**: Brief MVP feature 8 — Consequências visíveis das escolhas nos cenários

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Three.js 0.186.1 (Next.js 16, Rapier 0.21) | **Risk**: NOT ASSESSED (no VERSION.md risk rating)
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal)

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

- Escolhas existentes: dividir água com Lia; negociar com Garcia no Leito Seco; ceder peça do Titã a Noêmia. Relações em `campaign.story`.
- Respeitar `campaign.world.recovery`, BiomeDressing/biomeKits e o orçamento de samplers do TerrainBlend (zero samplers novos).

---

## Acceptance Criteria

- [ ] Cada uma das três escolhas produz ao menos uma mudança visível e persistente no cenário (props, NPCs, estado de um local).
- [ ] A mudança é derivada do estado salvo, reaparece após recarregar e não afeta saves sem a escolha.
- [ ] Diferente de decisões opostas: cenários distintos para cada ramo.
- [ ] Sem alterar física, colisão do terreno, missões ou tuning; reservar faixas/terminais livres na vegetação.
- [ ] Peça cedida a Noêmia não remove nem duplica componentes do Titã de forma inconsistente com a garagem.
- [ ] Desempenho sem queda mensurável nos perfis Baixo/Alto.
- [ ] Capturas comparativas por ramo e sign-off.

---

## Implementation Notes

- Ler `src/game/world/*`, `src/game/restoration/*`, `src/game/narrative/story.js`, `src/game/garage/*`.

---

## Out of Scope

- Regiões 2–5 com acabamento final (arte, fase posterior).
- Epílogos/finais.

---

## Files

- `src/game/world/*` (ganchos de cenário por escolha)
- `src/game/narrative/story.js`
- `tests/unit/choice-consequences.test.js`

---

## QA Test Cases

*N/A — no qa-lead specs at this tier; implement against the Acceptance Criteria above*

---

## Test Evidence

*qa.level: minimal — tests waived (advisory).*

**Story Type**: Integration
**Required evidence**: teste unitário do estado derivado ou nota de playtest
**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: `production/epics/2047-rede-aurora/story-006-cutscenes-da-campanha.md`
- Unlocks: story-008

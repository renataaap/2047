# Story 003: Nova introdução de Dante no barracão e apresentação do Titã

> **Epic**: 2047 — Rede Aurora
> **Status**: Complete
> **Layer**: Presentation
> **Type**: Visual/Feel
> **Estimate**: M
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: 2026-11-11

## Context

**GDD**: `design/game-brief.md`
**Requirement**: Brief MVP features 3 e 4 — Nova introdução de Dante no barracão; apresentação do Titã Rocha Clara

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Three.js 0.186.1 (Next.js 16, Rapier 0.21) | **Risk**: NOT ASSESSED (no VERSION.md risk rating)
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal)

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

- Preservar GLB e materiais por função do Titã (0.8.1), seis rodas, opacidade; não alterar física para mudar a aparência.

---

## Acceptance Criteria

- [x] Após a transição para 2047, a câmera apresenta o barracão e o Titã Rocha Clara.
- [x] Dante é introduzido (fala, postura, animação) e o jogador recebe o controle no barracão, sem salto de posição.
- [x] A cena é curta (~20 s de meta) e pulável; pular leva ao mesmo estado de controle.
- [x] Controle a pé funciona imediatamente depois, com Y/colisão corretos (spawn pela superfície triangular).
- [x] O tutorial de 21 objetivos segue intacto e coerente com a nova abertura (explorar o barracão, conhecer o Titã, interações básicas).
- [x] Saves existentes não repetem a cena.
- [x] Captura retida e sign-off de enquadramento, iluminação e fala.

---

## Implementation Notes

- Ler `src/game/tutorial/definitions.js`, `TutorialController.js`, `TutorialWorld.js`, `src/game/player/*`.
- Personagens MakeHuman CC0 são provisórios; não alegar arte final.

---

## Out of Scope

- Story 004: sobrevivente e primeira Semente.
- Story 008: refinamento de câmera/animação.

---

## Files

- `src/game/narrative/cutscenes/intro-dante.js` (novo)
- `src/game/tutorial/definitions.js`, `src/game/tutorial/TutorialController.js`
- `production/qa/evidence/story-003-evidence.md`

---

## QA Test Cases

*N/A — no qa-lead specs at this tier; implement against the Acceptance Criteria above*

---

## Test Evidence

*qa.level: minimal — tests waived, but a Visual/Feel retained screenshot is required.*

**Story Type**: Visual/Feel
**Required evidence**: captura retida + sign-off em `production/qa/evidence/story-003-evidence.md`
**Status**: [x] Criada: `production/qa/evidence/story-003-dante-barracao-e-tita/` (capturas 1–4 e 8–11, `metrics-e2e.json`, `validation.json`)

---

## Dependencies

- Depends on: `production/epics/2047-rede-aurora/story-001-sistema-de-cutscenes.md`, `production/epics/2047-rede-aurora/story-002-prologo-2027-e-transicao.md`
- Unlocks: story-004

---

## Completion Notes

- **Concluída em 11/11/2026** com sign-off do criador (enquadramento, iluminação e fala aprovados).
- `intro-2047` virou cena própria (`src/game/narrative/cutscenes/intro-dante.js`, ~19 s, 4 planos ancorados em Dante e no Titã), encadeada depois do prólogo pela fila do `CutscenePlayer`. O prólogo deixou de carimbar `intro-2047` via `also`; saves que já tinham a abertura registrada não repetem nenhuma das duas.
- Encadeamento: `finish()` inicia a próxima cena da fila; uma cena encadeada ignora pulos nos primeiros 0,3 s (anti-pulo duplo). Cada cena se pula separadamente; o helper `skipPrologue` pressiona Esc por cena.
- Sem salto de posição: o último plano entra nos olhos do Dante e devolve a câmera salva; E2E confere deslocamento < 5 cm no plano e anda com W logo depois, no chão.
- Tutorial de 21 objetivos intacto (1/21 "Caminhe pelo barracão" ao receber o controle); `definitions.js`/`TutorialController.js` não precisaram mudar.
- Validação: 395/395 unitários; `prologue.spec.js` 4/4 e `restoration.spec.js` 5/5 na porta 3100. **Não** houve regressão das outras 12 specs que usam `skipPrologue` nem integral.
- Ressalvas: personagens MakeHuman CC0 provisórios, não arte final; Windows/GPU física pendente.

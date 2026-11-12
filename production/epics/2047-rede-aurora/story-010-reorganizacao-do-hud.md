# Story 010: Reorganização do HUD (minimapa, tutorial e controles)

> **Epic**: 2047 — Rede Aurora (0.14)
> **Status**: Ready
> **Layer**: Presentation
> **Type**: UI
> **Pedido do criador**: 12/11/2026, com as decisões tomadas na mesma data (ver Notas)

## Context

**Pedido:** "colocar o minimapa no lugar do tutorial atual e o tutorial ficar aparecendo na tela na parte de cima no meio; os controles de volta no canto inferior do meio da tela."

**Estado atual (código em `feat/narrativa-0.14.0`):**
- Tutorial: `TutorialHud` dentro de `.hud-top`, no canto superior esquerdo (`left:3.4vw; top:30px`), no lugar do card de objetivo quando o tutorial está ativo.
- Minimapa: `NavigationMap` (`.navigation-hud`), no lado direito (`right:3.4vw; bottom:150px; width:230px`).
- Controles: `.drive-help` continua no `Hud.js`, mas fica oculto por `display:none` em `navigation.css` (desde a 0.9.0) e em `tutorial.css`.

---

## Acceptance Criteria

- [ ] O minimapa ocupa a posição superior esquerda onde hoje fica o tutorial, com tutorial ativo ou não. O objetivo não pode ficar coberto.
- [ ] O tutorial fica centralizado no topo da tela e não cobre o minimapa, o objetivo nem a mira/interação central.
- [ ] Os controles voltam ao centro da parte de baixo da tela, conforme o contexto: a pé (WASD, F, C, Tab, J/M) ou dirigindo (W/S, A/D, Espaço, E, C, L). Somem durante cutscene, menu, pausa e garagem.
- [ ] Há uma opção nas Configurações para ocultar os controles, salva junto com as outras configurações. Ligada por padrão.
- [ ] Nada se sobrepõe em 1280×720, 960×640 e 1920×1080, com e sem tutorial, a pé, dirigindo e na cabine. O teste de não sobreposição da 0.9.0 é estendido para cobrir os novos elementos.
- [ ] Aviso de frete, garagem, carga, rádio e toasts continuam visíveis e sem sobreposição.
- [ ] Capturas retidas de cada tela tocada (a pé, dirigindo, cabine, tutorial ativo), com sign-off do criador.

---

## Implementation Notes

- Só CSS/JSX do HUD (`Hud.js`, `NavigationMap.js`, `TutorialHud.js`, CSS em `src/app/`). Não muda lógica do tutorial, GPS, rotas, saves nem física.
- Os textos das teclas vêm de `src/data` (já existem `T.drive`, `T.steer`...). Nenhum texto fixo no componente.
- `RoutePlanner` reutiliza `RoadMapSvg` do `NavigationMap`: não pode quebrar.
- Preservar a regra de não sobreposição do HUD da 0.9.0 (`14bd88a`).

## Out of Scope

- Login/cadastro: fica para a 0.15 (usuário + senha, jogar sem conta continua possível, saves do cookie migram para a conta ao se cadastrar).

## Test Evidence

**Story Type**: UI
**Required evidence**: capturas em `production/qa/evidence/story-010-reorganizacao-do-hud/` + teste E2E de layout
**Status**: [ ] Not yet created

## Dependencies

- Depends on: nenhuma (independente das cutscenes)
- Unlocks: story-009 (regressão final da 0.14)

## Notas (decisões do criador, 12/11/2026)

- HUD entra na 0.14; login/cadastro vira a 0.15.
- Controles conforme o contexto, com opção para ocultar.
- Ao concluir a 0.14 com tudo validado, integrar na main sem pedir de novo.

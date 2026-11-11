# Retomar a Story 002 — Prólogo de 2027 e transição para 2047

Branch `feat/narrativa-0.14.0`, worktree `C:\Temp\renatinha\2047-narrativa-0.14.0`.

## Estado

- **Funcional e validado** (commit "prólogo 2027 validado"): Novo Jogo abre o prólogo, de ~41 s e pulável. São seis planos: 2027 limpo, luz estranha, plasma, túnel, cartela "2047 / Vinte anos depois" e mundo devastado. Ao fim, o controle volta no barracão com o tutorial em 1/21. Saves existentes ou legados nunca veem o prólogo. Com redução de movimento, aparece só a cartela.
- Validação: 385/385 unitários, build, E2E do prólogo 4/4 e regressão final de 15 specs com 40/41. A única falha foi de ambiente (o Chrome fechou ao abrir), e a rechecagem deu 1/1. Detalhes em `production/qa/evidence/story-002-prologo-2027-e-transicao/validation.json` e no `RELATORIO_NARRATIVA_0.14.0.md`.
- **Status da story: In Progress.** Não marcar como Complete antes do sign-off humano do visual e do ritmo.

## Polimento visual do set de 2027 (pedido do criador)

O pedido foi: "não quero transformar o prólogo em uma apresentação visualmente inferior ao gameplay". Os pontos são estrada e sinalização, veículos, fachadas, vegetação, portal e interior do túnel, materiais e iluminação, e composição da cidade. A preferência é por uma cena pequena, bem composta e com silhuetas convincentes.

**Feito em 11/11** (detalhes no `RELATORIO_NARRATIVA_0.14.0.md`). Plano executado, tudo procedural e sem assets externos:
1. Céu com nuvens fbm em vez das listras `sin×sin`.
2. Perspectiva aérea: o set aplica a própria névoa só durante o render (`scene.onBeforeRender`/`onAfterRender`) e devolve a do mundo. Mesmo tipo FogExp2, sem recompilar shaders.
3. Relevo com ruído no campo e na colina do túnel. As colinas ficam num anel lateral, sem tocar a cúpula.
4. Árvores folhosas (copa com lobos irregulares) e coníferas, com sombra de contato.
5. Carros com perfil extrudado (capô, porta-malas, vidros inclinados) e sombra de contato.
6. Cidade com recuos, coroamentos, faixas de janela e paleta variada; as luzes da cidade apagam com a tempestade.
7. Sinalização, guard-rail com duas lâminas, fios em catenária, portal com testeira e interior do túnel.
8. Mapa de sombras do mundo de 2047 congelado durante o set (`shadowMap.autoUpdate`). Isso remove o custo invisível em Médio/Alto.

Validado: 388/388 unitários, build, prólogo 4/4, specs afetadas 10/11 com falha do harness corrigida e rechecagem 2/2, e capturas novas. **Falta só o sign-off humano** para marcar a story como Complete.

**Atenção ao rodar E2E:** o Playwright reaproveita qualquer servidor que já esteja na porta 3000. Se o `INICIAR_JOGO.bat` estiver aberto na pasta principal, o teste acessa o jogo errado. Feche o jogo antes ou use outra porta.

## Continua provisório (não é arte final)

- O set é geometria procedural com Lambert e cor de vértice, sem texturas PBR nem modelos importados.
- Dante não aparece em cena em 2027: o túnel é visto do ponto de vista dele.
- Sem voz gravada; o áudio é o sintetizado existente.
- Falta sign-off humano de ritmo, legibilidade e desempenho em GPU integrada no Windows.

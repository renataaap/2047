# Estado do projeto — 2047: Rede Aurora

Versão: **0.5.1 — integração parcial de assets; Fase 2 em andamento**. Repositório privado: https://github.com/renataaap/2047.


Em 29/10/2026, o pedido de assets ampliou a Fase 2. Veja **RELATORIO_INTEGRACAO_ASSETS.md**, `docs/INTEGRACAO_ASSETS.md` e `docs/CATALOGO_ASSETS.json` antes de retomar. Foram integrados três GLBs de carros Renafox com PBR próprio, colisões e streaming, sob **CC BY-NC 4.0, para uso não comercial**. Créditos/licença preservados. O exterior do Titã ainda é o modelo anterior. Validação atual: **87 unitários, suíte completa de 14 e2e, repetição final de 5 e2e e build passaram**. A auditoria solicitada pelo usuário está em `docs/AUDITORIA_FASES_2026-10-29.md`: o jogo ainda não tem todas as fases concluídas.

O loader PBR, downloader/importer offline, mistura de solo, cache, contratos GLB/rodas e AnimationMixer estão preparados e testados com fixtures originais de diagnóstico. Isso NÃO significa que os modelos escolhidos ou materiais Poly Haven estejam instalados. **Poly Haven: 0 materiais instalados.** Dos 20 ZIPs recebidos, 17 ultrapassam o limite de transferência de 32 MiB, incluindo LP 608 e todos os mapas 4K. O caminhão Saia recebido tem 1.970.772 triângulos e licença CC BY-ND; não foi adaptado/distribuído. O pacote City People foi inspecionado (11 personagens, 28 animações); licença ausente e usuário não a encontrou. Não foi integrado/distribuído.

A rede do ambiente bloqueia Poly Haven; o usuário não tem acesso para alterar a configuração. Para continuar, receber mapas em ZIPs menores que 32 MiB ou volumes de 25 MB; manter todas as partes de um arquivo dividido. Também pode executar BAIXAR_TEXTURAS.bat no Windows. Não pedir novamente autorização para GitHub nem para a conta renataaap já escolhida.

A versão 0.4.0 encerrou as quatro fases do roteiro original. Em 29/10/2026, o usuário substituiu a direção estilizada por realismo e pediu começar a **Fase 1 de um novo roteiro**. A antiga Fase 5 narrativa não foi iniciada.

A 0.5.0 implementa motor diesel/torque/RPM, oito marchas automáticas/ré segura, massa física da carga, resistências por piso, freios, suspensão, direção e câmeras. Cabine oca, instrumentos 3D, volante, HUD e áudio ligados ao estado real. Entrega verificada: **74 testes unitários, 11 e2e e build passando**. O resultado está em `RELATORIO_REFORMULACAO_FASE_1.md`.

Histórico do encerramento da 0.5.0: roteiro em `docs/REFORMULACAO_REALISTA.md`. Etapa iniciada nesta versão: **Fase 2 da reformulação gráfica**, com downloads reais do Poly Haven/PBR e reconstrução visual. Nenhum asset externo foi instalado na Fase 1.


## O que preservar
- Jogo real em Next.js App Router + JavaScript, Three.js, Rapier e libSQL; React apenas monta o jogo e as interfaces. `src/game/core/Game.js` coordena os módulos.
- `src/data/network.js` define cinco biomas, sete Núcleos/Cofres, abrigos, rotas e missões. `src/game/missions/network.js` contém as regras puras; `NetworkController.js` confere contexto/proximidade antes das transações. `NetworkWorld.js` cria estruturas e colisores por proximidade.
- Janela 3×3 de setores, estrada de 21 km, enseada de sal antiga preservada, entregas na ordem. Configurações e textos em `src/data`.
- Save schemaVersion 3 aceita/migra versões 1/2. Inventário, decisões, integridades, clima e restauração ficam na API/libSQL. Desenvolvimento cria `local.db`; produção exige Turso. Não incluir banco, segredos ou dependências no Git.
- F permite descer com o caminhão parado em qualquer trecho (raio de 24 m) e entrar/interagir. Segurar Espaço até pressionar F evita rolamento nas rampas. Manter o botão de saída e a busca de posição livre do hotfix 0.3.1.
- Novo jogo inicia em N, motor desligado. E liga; W engata avanço; S freia e, após parada sustentada, engata R. Em ré, W freia antes de permitir avanço.
- Ajustes da condução em `src/data/truck-tuning.js`. Instrumentos/volante acompanham a simulação. As configurações têm sensibilidade da direção, distância externa e movimento da cabine.
- J: missões; M: mapa; R: rádio; H: sobrevivência; Tab: inventário; V: manutenção. E é somente ignição. WASD, Espaço, C e L mantêm as funções documentadas no README.
- A identidade da Voz e os quatro finais não foram colocados no jogo. A sétima ancoragem encerra os sistemas de mundo, sem escolher um final.

## Verificação e retomada
- Execute `npm ci`, `npm test`, `npm run build` e `npm run test:e2e` conforme README. Chromium de sistema pode ser selecionado por PLAYWRIGHT_CHROMIUM_EXECUTABLE.
- Há evidências em `evidence/phase4`, além das regressões das fases anteriores. Relatórios antigos preservam o histórico; o relatório da reformulação tem os números atuais. O conteúdo histórico está nas tags v0.3.1/v0.4.0.
- GPU integrada/60 FPS, Windows real, sensação dos controles e travessia humana completa precisam de avaliação manual. O teste de travessia usa teleporte de diagnóstico somente para encurtar as distâncias.
- Nenhum deploy Vercel/Turso foi feito; pertence à Fase 6. Não substituir esse planejamento por outra hospedagem sem pedido.
- O usuário vai abrir a mesma conversa do ChatGPT pelo celular para continuar o desenvolvimento. Consulte `CONTINUAR_NO_CELULAR.md`. Jogo desktop; não foram pedidos controles de toque.

## Referências
Leia README, DECISOES, CHECKLIST_MANUAL e o relatório da fase atual antes de editar. A especificação estilizada original está em `docs/PROMPT_MESTRE.md`, como referência histórica. O novo roteiro/realismo está em `docs/REFORMULACAO_REALISTA.md`. Não reinicie as fases nem avance automaticamente para a seguinte.

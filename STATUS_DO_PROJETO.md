# Estado do projeto — 2047: Rede Aurora

**Estado atual: 0.7.0 — interações, calibração, avatar e apresentação**, na branch local `feat/tutorial-assets`, sobre o checkpoint 0.6.0 `77c96ec`. Ler RELATORIO_CORRECOES_CRITICAS.md e docs/DIAGNOSTICO_CORRECOES_CRITICAS.md. Tutorial/assets 0.6.0 preservados. Seleção central distingue NPC/bomba/gerador/terminal e executa o alvo exibido; calibração usa peças acessíveis da mochila/Titã sem cobrar por falhas; Dante/NPCs têm modelo anatômico CC0 provisório e clips in-place; C alterna perspectivas a pé. Menu usa cenário 3D real e fade; diálogos enquadram o interlocutor e separam serviços. Falas/decisões protegidas por hashes. A arte dos personagens ainda não é final realista. Todas as seis fases **não** terminaram: consultar docs/AUDITORIA_FASES_2026-10-29.md.

**Validação concluída:** 136 testes unitários e build Next.js passaram. Os 20 cenários de navegador passaram entre a execução integral e as rechecagens, sem afirmar uma única rodada integral verde. Corrigidos o spawn na superfície física da Cordilheira e as esperas por estado real no teste de sobrevivência; as três últimas regressões de avatar/câmeras, entrada/saída e tutorial completo também passaram. Detalhes e logs no relatório.

**Publicação bloqueada por acesso técnico:** o usuário autorizou explicitamente publicar código, histórico Git, relatórios e assets em Da-Hora-stack/2047. A nova tentativa por Git retornou 403 (credencial renataaap); o aplicativo também retornou 403, Resource not accessible by integration. A conta aparece como colaboradora com push, mas isso não concede à integração acesso de escrita ao repositório. As instalações listadas pela conexão não incluem Da-Hora-stack. Nenhuma branch/tag foi publicada; não pedir autorização de conteúdo novamente. Após corrigir o acesso da conexão, publicar normalmente, sem alterar main à força. Ver docs/CONTINUAR_CORRECOES_0.7.0.md.

**As afirmações históricas abaixo sobre zero materiais e repositório renataaap descrevem a cópia antiga.** O repositório oficial fornecido agora contém oito materiais; não foram baixados novamente. A conta conectada tem acesso de escrita ao novo repositório.

Versão: **0.5.0 — Fase 1 da reformulação realista**. Repositório privado: https://github.com/renataaap/2047.

A versão 0.4.0 encerrou as quatro fases do roteiro original. Em 29/10/2026, o usuário substituiu a direção estilizada por realismo e pediu começar a **Fase 1 de um novo roteiro**. A antiga Fase 5 narrativa não foi iniciada.

A 0.5.0 implementa motor diesel/torque/RPM, oito marchas automáticas/ré segura, massa física da carga, resistências por piso, freios, suspensão, direção e câmeras. Cabine oca, instrumentos 3D, volante, HUD e áudio ligados ao estado real. Entrega verificada: **74 testes unitários, 11 e2e e build passando**. O resultado está em `RELATORIO_REFORMULACAO_FASE_1.md`.

Roteiro vigente: `docs/REFORMULACAO_REALISTA.md`. Próxima etapa: **Fase 2 da reformulação gráfica**, com downloads reais do Poly Haven/PBR e reconstrução visual. Nenhum asset externo foi instalado na Fase 1.


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

# Estado do projeto — 2047: Rede Aurora

**0.9.0 — rede rodoviária em validação**, branch `feat/rede-rodoviaria-0.9.0`, derivada da 0.8.2 `55a5df3`. O PR #1 da base não foi sobrescrito e a main permanece protegida. Grafo conectado, cidade piloto Cinza Nova, posto finito, ruas/pátios/garagem física, alternativas de piso, GPS no HUD e planejador M. [Arquitetura](docs/ARQUITETURA_RODOVIARIA_0.9.0.md) · [acessibilidade](docs/ACESSIBILIDADE_NUCLEOS_0.9.0.md) · [teste Windows](docs/TESTE_MANUAL_0.9.0.md).

Nesta atualização: 196 testes unitários e três novos E2Es focados aprovados. Viagem desde Novo jogo de 3,18 km com oficina, cidade, combustível, terra, gerador, ativação e recarga; alternativa pavimentada de 2,51 km desde a bifurcação; 14/14 acessos físicos locais aprovados. Simulação original com tempo de diagnóstico acelerado, sem teleporte de diagnóstico nos percursos. Build e E2E integral ainda pendentes neste checkpoint; os resultados abaixo da 0.8.2 são históricos. Garagem sem compra/customização; Windows/GPU, sessão humana e finais continuam pendentes.

Os registros seguintes preservam o histórico da base.

**Estado atual: 0.8.2 — polimento em revisão**, branch feat/polimento-0.8.2, derivada da main d8a3b2a (0.8.1). Ler [RELATORIO_POLIMENTO_0.8.2.md](RELATORIO_POLIMENTO_0.8.2.md), docs/INCREMENTOS_0.8.2.md e docs/TESTE_MANUAL_0.8.2.md. Cabine modular e âncora dos olhos; instrumentos reais; seis identidades de roupas/equipamentos; pose sentada e transições; terreno PBR recuperado sem trocar malha física; oficina/barracão/POIs/fábricas refinados; loja acessível; diário único derivado dos saves existentes.

**Validação nova 0.8.2 (01/11/2026):** 175 unitários/25 arquivos, build e **28/28 E2Es numa única integral (30,8 min)** aprovados. Reinício real recuperou dados idênticos. Checkpoint de código/testes 37ac96d; nenhum código foi alterado durante a integral. Base executada novamente: 167 unitários, build e 25/25 E2Es numa integral. Falhas anteriores e rechecagens estão documentadas; não são somadas como cenários extras. Provas em [validation.json](evidence/polish-0.8.2/validation.json). Revisão no [PR #1](https://github.com/renataaap/2047/pull/1); main e histórico preservados, sem force push. Windows/GPU, sessão humana e arte final continuam pendentes.

**Limites:** personagens ainda usam base CC0 compartilhada; não há arte facial final, subida completa com contato nem retrovisores dinâmicos. Windows/GPU, audição e viagem humana de 30 minutos continuam pendentes. Capturas usam diagnóstico de posição/horário, sem alegar viagem humana. O roteiro manual está disponível. Jogo inteiro/finais não concluídos.

**Histórico 0.8.1 — correção de transparência do Titã**, na branch feat/tutorial-assets, sobre a 0.8.0 (`034506a`). Ler [RELATORIO_CORRECAO_TITA_0.8.1.md](RELATORIO_CORRECAO_TITA_0.8.1.md). O único material BLEND original foi separado por função no GLB; sólidos escrevem profundidade e vidros/lentes continuam transparentes. Posições, normais, UVs, três PNGs e seis pivôs preservados. O exterior volta corretamente ao descer pela câmera interna. Cockpit ainda provisório. Resultados desta correção em `evidence/truck-opacity/`; não confundir com as rodadas históricas abaixo.

**Validação nova da 0.8.1:** 167 unitários/24 arquivos, build e dez E2Es relevantes aprovados (uma rodada 10/10, não a suíte inteira). Onze pares de capturas reais, saída pela cabine e inspeção adicional Baixo/Alto/Baixo com sombras. Windows/GPU real continua pendente.

**Expansão preservada: 0.8.0 — Mundo vivo**, base 32d55b7. Ler [RELATORIO_EXPANSAO_0.8.0.md](RELATORIO_EXPANSAO_0.8.0.md), docs/DIAGNOSTICO_0.8.0.md e docs/RETOMAR_0.8.0.md. Ambiente contextual, mobiliário, três POIs finitos, ciclo solar, áudio espacial original e equipamentos no rig existente foram implementados. Todos os sistemas 0.7.0 e quatro módulos narrativos estão preservados. O jogo e seus quatro finais não estão terminados.

**Validação histórica da 0.8.0:** 161 testes unitários/23 arquivos, build de produção e recuperação exata após reinício real aprovados. Os 24 cenários únicos de navegador passaram entre a tentativa integral, rechecagens e sequência restante; não houve uma única integral verde. A rodada completa inicial foi 16/23 e a seguinte foi interrompida pelo ambiente após 14 aprovações/1 falha. Tutorial completo, primeira entrega, sete Núcleos, sobrevivência, novos POIs, atmosfera, regiões e ciclos de qualidade passaram; logs em evidence/world-0.8.0/validation.json. Cinco pares de capturas reais e vistas adicionais foram inspecionados. Windows/GPU real e audição humana continuam necessários.

**GitHub:** origin é o repositório oficial privado https://github.com/renataaap/2047, branch feat/tutorial-assets. O usuário já escolheu essa conta e autorizou publicar código, histórico, relatórios e assets. Não pedir novamente. A correção usa branch feat/tutorial-assets e tag v0.8.1; os refs históricos são preservados. Não fazer force push nem sobrescrever alterações de colaboradores. O antigo remote official/Da-Hora-stack não é o destino desta entrega.

**Registro histórico 0.7.0:** 136 unitários, build e 20 cenários únicos entre execução integral/rechecagens, sem uma única rodada verde; tags v0.6.0 e v0.7.0 publicadas, v0.7.0 em 07ae390. Esses resultados não são a validação nova da 0.8.0. Relatório antigo em RELATORIO_CORRECOES_CRITICAS.md. Tutorial, InteractionResolver, seedService, saves 1–3, PBR locais e Y explícito de saves/saídas permanecem requisitos.

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

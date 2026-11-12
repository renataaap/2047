# Estado do projeto — 2047: Rede Aurora

**0.14.0 — narrativa, cinematografia e consequências: implementada e validada automaticamente; sign-off e playtest humano pendentes.** Branch `feat/narrativa-0.14.0`, fonte final `13dbfbc`. [Relatório](RELATORIO_NARRATIVA_0.14.0.md) · [design](docs/NARRATIVA_0.14.0.md) · stories em `production/epics/2047-rede-aurora/`.

Novo Jogo abre o prólogo 2027→2047 e a introdução do Dante; a sobrevivente chega com a primeira Semente; primeiro contato com a Dra. Renata; uma cena por capítulo (Cidades Esqueleto, Garcia em pessoa na bomba de Afonso, sinal da Voz sem revelar a identidade, véspera do Horizonte); cenário próprio para cada opção das três escolhas; legendas legíveis. HUD reorganizado a pedido do criador: minimapa no canto superior esquerdo, tutorial/objetivo no topo central, controles conforme o contexto embaixo no centro (ocultáveis nas Configurações).

Validação: **426 unitários/54 arquivos e build** na fonte final; **integral de 72 E2Es: 71/72 em 45,2 min** sobre `c4fb98c` — a falha revelou um defeito real (compra recusada durante o salvamento automático), corrigido em `13dbfbc` e coberto por rechecagens focadas (3/3 e 12/12, não somadas à integral); **reinício real aprovado** (SQLite local). Pendentes: sign-off do criador, playtest no Windows/GPU, audição, Turso de produção. Os quatro finais não estão implementados (1.0). A próxima etapa pedida é a **0.15 — login e cadastro** (usuário + senha; jogar sem conta continua possível; saves do cookie migram para a conta).

**0.12.1 — estabilização em andamento** na branch `claude/code-game-studios-skill-e1w3ae` (contém a 0.12.0 por merge). Demanda regional com recuperação e escassez, save que se recupera de 409, rollback completo, medidas de veículo no catálogo e CI. 326 unitários, build e 11/11 E2Es focados aprovados; sem integral nem playtest humano. [Relatório](RELATORIO_ESTABILIZACAO_0.12.1.md). A seção 0.12.0 abaixo continua válida.

**0.12.0 — contratos, economia e carreira: implementação validada automaticamente, em revisão no [PR #6](https://github.com/renataaap/2047/pull/6).** Branch `feat/contratos-economia-0.12.0`, sobre a 0.11.0/PR #5 ainda aberto; main preservada na 0.10.0. Seis quadros físicos/sete depósitos, doze modelos de encomenda, carga 3D com massa/COM reais, coleta/entrega estacionada, GPS, pagamento único após salvar, preços regionais, carreira e histórico. Campanha, restauração, garagem e dois caminhões preservados. [Relatório](RELATORIO_CONTRATOS_0.12.0.md) · [comparação real](docs/COMPARACAO_CONTRATOS_0.12.0.md) · [validação](evidence/contracts-0.12.0/validation.json) · [playtest Windows](docs/TESTE_MANUAL_CONTRATOS_0.12.0.md).

Validação nova: **318 unitários/37 arquivos e build na fonte final `81b8142`; 51/51 E2Es numa integral de 74,1 min em `593e83b`; 6/6 rechecagens de pagamento em `513b9a4`; 1/1 rechecagem dos rótulos finais em `81b8142`**. Não é uma integral de 52 casos na fonte posterior. Entregas reais por Rapier nos dois caminhões, 14 acessos locais aos depósitos e recuperação exata de cinco saves após reinício real aprovadas. O save do Titã concluiu duas entregas consecutivas, chegou a 264 XP/nível 2 e preservou carreira/histórico. São testes automatizados com tempo acelerado, não playtest humano. Windows/GPU real, audição e equilíbrio continuam pendentes.

Para usar: **M → Pátio de carga de Cinza Nova → estacionar nas faixas → E desligar → F descer → F no quadro FRETES**. Aceite, abra o manifesto e confirme o carregamento; dirija pelo GPS e repita a parada/terminal no destino para conferir e descarregar. **Fretes / carreira** consulta o trabalho e permite retomar a campanha. A branch ainda precisa ser selecionada para experimentar a 0.12.0: comandos e configuração no [relatório](RELATORIO_CONTRATOS_0.12.0.md#como-experimentar-esta-branch). Não apague banco/saves.

**Histórico 0.11.0 — implementação da restauração ambiental 2.0 validada automaticamente**, branch `feat/restauracao-ambiental-0.11.0`, base main `4771193`/0.10.0. Fonte e harness `7668207`, aplicação idêntica a `8479b9a`; [PR #5](https://github.com/renataaap/2047/pull/5). Main permanece preservada durante revisão.

Recuperação independente por Núcleo, gramíneas/arbustos/árvores jovens originais, solo em manchas sem novos samplers, chuva, atmosfera, apresentação pulável, áudio sintetizado, diário/mapa e reações contextuais. 257 unitários/34 arquivos, build e **44/44 E2Es numa integral de 61,9 min**, sem falhas/skips/retries; 277 arquivos congelados e onze hashes protegidos iguais. Separadamente: 28/28 acessos locais com os dois veículos, 2/2 acessos à garagem restaurada e reinício real aprovado em dois saves ambientais e um da frota. Comparação de 48 PNGs reais; poses de diagnóstico não são viagens humanas.

[Relatório](RELATORIO_RESTAURACAO_0.11.0.md) · [validação](evidence/restoration-0.11.0/validation.json) · [comparação](docs/COMPARACAO_RESTAURACAO_0.11.0.md) · [acessos](docs/ACESSIBILIDADE_RESTAURACAO_0.11.0.md) · [teste Windows](docs/TESTE_MANUAL_RESTAURACAO_0.11.0.md). Pendentes: avaliação Windows/GPU/audição humana, arte botânica mais detalhada e vegetação em frestas/muros urbanos. Não anunciar arte final de todos os biomas. Traces/cookies privados ficam em /tmp; não publicar. Tentativas anteriores e a interrupção do ambiente estão preservadas; a integral verde é a de final/. Os registros seguintes são históricos.

**Histórico 0.10.0 — garagem e frota:** garagem municipal de Cinza Nova funcional, três skins, prévias 3D, acessórios, interior, três upgrades reais e dois caminhões dirigíveis. Base 0.9.1 com a correção do chão preservada. [Relatório](RELATORIO_GARAGEM_0.10.0.md) · [incrementos](docs/INCREMENTOS_GARAGEM_0.10.0.md) · [teste Windows](docs/TESTE_MANUAL_GARAGEM_0.10.0.md) · [PR #4](https://github.com/renataaap/2047/pull/4).

Validação histórica da 0.10.0: **225 unitários, build, 39/39 E2Es numa integral de 50,8 minutos, 2/2 rechecagens posteriores do harness e reinício real aprovados**. As rechecagens não são contadas como cenários inéditos da integral; o código da aplicação permaneceu igual. [Registros](evidence/garage-0.10.0/validation.json). Windows/GPU física e audição humana continuam pendentes; três modelos adicionais ainda não são dirigíveis.

Para usar: **M → Garagem municipal**, siga até Cinza Nova, estacione na faixa interna, desligue com **E** e abra com **G**. A bancada também atende a pé por **F**. Arraste para orbitar e use a roda para zoom; as confirmações cobram recursos existentes e salvam no slot atual. Não é necessário começar outra campanha nem apagar banco/cookies.


**Histórico: hotfix 0.9.1 — chão**, priorizado pelo usuário antes da garagem 0.10.0. Base main `c223f9e`, PR #2 já integrado. Branch `fix/chao-inicial-0.9.1`. Shader adaptado à capacidade de texturas e uniforms atualizados nos programas em cache; mapas locais, terreno físico e saves preservados. [Relatório](RELATORIO_CORRECAO_CHAO_0.9.1.md) · [teste Windows](docs/TESTE_MANUAL_CHAO_0.9.1.md). Código da correção em `dee7c2d`; validação final registrada no relatório e em `evidence/floor-0.9.1`. Windows/GPU real continua pendente. À época, a garagem 0.10.0 ainda não havia sido implementada.

**Histórico 0.9.0:** [PR #2](https://github.com/renataaap/2047/pull/2) integrado à main em `c223f9e`. Os resultados a seguir pertencem àquela versão.

**0.9.0 — rede rodoviária validada automaticamente, em revisão Windows**, branch `feat/rede-rodoviaria-0.9.0`, derivada da 0.8.2 `55a5df3`. O PR #1 da base foi integrado à main durante esta validação (`5cb4323`); seus arquivos são idênticos à base utilizada. A 0.9.0 continua na branch própria para revisão. Grafo conectado, cidade piloto Cinza Nova, posto finito, ruas/pátios/garagem física, alternativas de piso, GPS no HUD e planejador M. [Arquitetura](docs/ARQUITETURA_RODOVIARIA_0.9.0.md) · [acessibilidade](docs/ACESSIBILIDADE_NUCLEOS_0.9.0.md) · [teste Windows](docs/TESTE_MANUAL_0.9.0.md).

Nesta atualização: 196 unitários/27 arquivos, build, reinício real e **31/31 E2Es numa integral de 37,6 min** aprovados. Depois, um ajuste apenas de CSS do HUD e de caminhos das evidências passou em **2/2 verificações focadas**, incluindo o novo teste de não sobreposição; não é apresentado como uma integral de 32 testes. Viagem desde Novo jogo de 3,18 km com oficina, cidade, combustível, terra, gerador, ativação e recarga; alternativa pavimentada de 2,51 km desde a bifurcação; 14/14 acessos físicos locais aprovados. Simulação original com tempo de diagnóstico acelerado, sem teleporte de diagnóstico nos percursos. Código da integral: 2dd3c0d; polimento posterior: 14bd88a. [Relatório 0.9.0](RELATORIO_REDE_RODOVIARIA_0.9.0.md) e [validação](evidence/roads-0.9.0/validation.json). Os resultados abaixo da 0.8.2 são históricos. Garagem sem compra/customização; Windows/GPU, sessão humana e finais continuam pendentes.

Os registros seguintes preservam o histórico da base.

**Histórico da base: 0.8.2 — polimento em revisão à época**, branch feat/polimento-0.8.2, derivada da main d8a3b2a (0.8.1). Ler [RELATORIO_POLIMENTO_0.8.2.md](RELATORIO_POLIMENTO_0.8.2.md), docs/INCREMENTOS_0.8.2.md e docs/TESTE_MANUAL_0.8.2.md. Cabine modular e âncora dos olhos; instrumentos reais; seis identidades de roupas/equipamentos; pose sentada e transições; terreno PBR recuperado sem trocar malha física; oficina/barracão/POIs/fábricas refinados; loja acessível; diário único derivado dos saves existentes.

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

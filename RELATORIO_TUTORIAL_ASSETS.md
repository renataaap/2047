# 0.6.0 — Tutorial jogável e assets locais

## 1. Diagnóstico e proteção

O pedido foi aplicado uma única vez. A cópia local começava em `renataaap/2047`, commit `18079f8` (0.5.2). O novo pedido aponta para `Da-Hora-stack/2047`, cujo commit `a8a8802` é um snapshot com histórico independente. Ele contém a Estrada Viva e oito materiais que não existiam na cópia local. A implementação parte desse snapshot oficial, em `feat/tutorial-assets`; a main antiga permanece preservada em `checkpoint/interface-0.5.2`. Não foi usado reset, force push ou restauração destrutiva.

Foram recuperados os módulos de interface 0.5.2, ferramentas de assets e carros Renafox ausentes no snapshot. Foram mantidos gerador/Tomás, postos, oficinas, módulos de saqueadores, sete Núcleos, cinco biomas, inventários, física, rádio, missões e persistência oficiais. O diagnóstico está em `docs/DIAGNOSTICO_TUTORIAL_ASSETS.md`.

## 2. Textos e narrativa

As falas em `src/data/campaign.js` são iguais nas duas bases. O conteúdo adicional de `src/data/road.js`, `network.js` e `expedition.js` foi preservado. Não há outra revisão textual no workspace. Nenhuma fala definitiva foi inventada ou substituída. As únicas alterações em textos existentes são versão/créditos técnicos em `pt-BR.js`; as instruções funcionais novas ficam em `src/game/tutorial/definitions.js`.

As conversas mantêm a interface inferior, revelação/avanço, escolhas e navegação por teclado da 0.5.2. Serviços práticos mantêm painéis próprios. A sobreposição dos controladores da Rede e da Estrada foi corrigida: Tomás e os postos abriam um painel vazio da Rede, impedindo a conclusão da introdução. Agora usam o controlador e as transações próprios. A ativação inicial também verifica o gerador no código, além do botão desabilitado.

## 3. Tutorial implementado

**CAPÍTULO 01 — O ÚLTIMO MOTOR** tem 21 objetivos:

1. Caminhar 3 m no barracão.
2. Olhar com o mouse.
3. Inspecionar bancada e caderno com F.
4. Entrar no Titã.
5. Observar a cabine e os instrumentos.
6. Ligar o motor.
7. Acelerar até 8 km/h.
8. Frear até parar.
9. Fazer uma curva em movimento.
10. Percorrer 2 m em ré.
11. Estacionar no retângulo físico de treinamento, alinhado, abaixo de 0,4 m/s e com freio de estacionamento mantido.
12. Desligar o motor estacionado.
13. Descer e abrir a inspeção.
14. Realizar um reparo que consome peças existentes.
15. Aceitar a Semente no diálogo existente.
16. Consultar o inventário/carga.
17. Planejar uma rota no mapa.
18. Chegar à bifurcação e reconhecer uma rota real.
19. Explorar e recolher suprimentos na oficina abandonada.
20. Preparar o gerador com Tomás.
21. Entregar e ativar o Núcleo 1.

O controlador observa deslocamentos, velocidade, orientação, comandos e transações bem sucedidas. Não move o Rapier por roteiro, não fornece recursos duplicados e não altera a ordem dos Núcleos. Teleportes de diagnóstico não contam como caminhada/ré. Eventos já realizados podem ser reconhecidos sem exigir sua repetição artificial.

Novas partidas começam a pé na garagem. As portas laterais do asset foram abertas na preparação; o percurso de saída é físico e foi exercitado no navegador. Há bancada/caderno interativos e marcação na estrada a aproximadamente 59 m do ponto inicial do caminhão. O reparo inicial tem duas peças no compartimento, além das peças já existentes na mochila. As instruções explicam a transferência e o abastecimento; o sistema de inventário é o mesmo da campanha.

O HUD mostra objetivo, tecla e progresso, sem prender o controle. A pé, os indicadores de direção são ocultados. O jogador pode pular o guia pelo HUD/pausa e repeti-lo pela pausa. Repetir reinicia somente as instruções, preservando posição, recursos, missões e decisões; para rever todo o início, volte ao abrigo. Se todos os componentes já estiverem a 100%, a inspeção confirma a manutenção em vez de exigir um reparo impossível.

## 4. Persistência

O save continua em schemaVersion 3. `campaign.tutorial` é um campo opcional, versionado e validado. Saves 1–3 sem esse campo continuam sem tutorial automático. Etapas concluídas, fatos observados, caminhada/ré e status são salvos junto da campanha. Há checkpoints em marcos da introdução e salvamento manual nos slots existentes. Recarregar retoma o próximo objetivo; concluir não reinicia as instruções nem escolhe um final da história.

## 5. Texturas efetivas

Os oito materiais já estavam no repositório oficial: road_damaged_2, gravel_road, mud_cracked_dry_03, dirt, rocky_terrain_03, rusty_metal_05, rust_coarse_01 e corrugated_iron. Foram verificadas imagens PNG reais de 2048×2048, não somente nomes no manifesto. Não houve outro download do Poly Haven.

`scripts/preparar-texturas-locais.mjs` valida payload/hash, registra os originais e cria perfis locais: 512 px no Baixo, 1024 no Médio, cor até 2048 no Alto e dados até 1024. Os originais de 16 bits foram preservados. AO/rugosidade individuais e ARM não são carregados redundantemente.

Cascalho e chapa tinham diferenças entre ARM e mapas individuais. Foram criados `arm_compatible.png` com AO em R, rugosidade em G e metalness em B. Os mapas originais permanecem intactos. A comparação e os hashes estão em `evidence/tutorial-assets/texture-validation.json` e nos manifestos de cada material. Cores usam sRGB, dados não; normais OpenGL e UVs métricos são preservados. O solo usa a mistura existente de terra/rocha/cascalho/solo rachado; ferrugem grossa é aplicada à bancada. Height não desloca a superfície sem física equivalente.

O jogo usa arquivos locais. A rede deste ambiente continua impedindo conferência de checksums na origem; a procedência herdada do snapshot oficial está explicitamente registrada. KTX2/HDRI externo não foram instalados.

## 6. Assets 3D

Os dez anexos foram transferidos integralmente. As duas cópias do posto são idênticas por SHA-256; ZIP/GLB da garagem representam a mesma obra. Licenças CC BY 4.0 constam dos arquivos recebidos. Fontes/créditos/alterações estão em `public/assets/models/manifest.json`, nos LICENSE.txt e no link de créditos do menu.

| Asset | Estado nesta entrega | Triângulos |
| --- | --- | ---: |
| Truck (old one), Alt | Titã inicial carregado, seis rodas vinculadas ao Rapier | 47.500 |
| Old garage, Yury Misiyuk | Barracão inicial, portas laterais abertas, colisão triangular | 2.200 |
| Rusty Barrel, mxtc | Dois exemplares junto à bancada, PBR próprio e colisão | 1.660 por exemplar |
| Abandoned Gas Station, SURVIVED | Estrutura abandonada junto ao posto do km 2,25, streaming e colisão triangular | 7.927 |
| Dump Truck, ElectroNick | GLB preparado; rig e uso dirigível pendentes | 34.307 |
| Semi Truck 1960, Brian Trepanier | GLB preparado; orientação/rig e uso dirigível pendentes | 134.205 |
| Semi Truck Baked, 3DE_Study | GLB preparado; rig/cabine e uso dirigível pendentes | 40.023 |
| Tatra 815, Randonavt | GLB preparado e reduzido; rig e uso dirigível pendentes | 129.977 |

O Titã deriva do modelo inicial escolhido. O chassi foi adaptado às dimensões existentes; os componentes das rodas preservam UVs/texturas, foram separados e o eixo traseiro foi duplicado para corresponder às seis rodas físicas. A posição/orientação foram corrigidas e os pivôs são validados antes de substituir o visual. Massa, motor, transmissão e colisores do caminhão não foram substituídos. A cabine funcional anterior permanece como cockpit provisório na câmera interna. A carga e os faróis não são escondidos pela troca do exterior.

Os três carros Renafox continuam sob CC BY-NC 4.0, para desenvolvimento não comercial. Personagens Fab sem licença identificada continuam fora do jogo. Os quatro caminhões preparados não são apresentados como veículos desbloqueados ou dirigíveis. O posto importado é uma estrutura explorável junto ao serviço existente; não acrescenta outro estoque/economia.

## 7. Arquivos principais

- Tutorial: `src/game/tutorial/{definitions,TutorialController,TutorialWorld}.js`, `src/components/gameplay/TutorialHud.js`, `src/app/tutorial.css`.
- Integração: `src/game/core/Game.js`, `src/game/persistence/schema.js`, `src/game/missions/NetworkController.js`, `src/components/{game/GameView,hud/Hud,menus/Panel,gameplay/MissionPanel}.js`.
- Materiais: `src/game/render/{PBRLibrary,materials}.js`, `scripts/{preparar-texturas-locais,baixar-polyhaven}.mjs`, `public/assets/polyhaven/`.
- Modelos: `scripts/preparar-modelos.py`, `src/game/{vehicle/TruckVisual,world/EnvironmentModels}.js`, `public/assets/models/`, `public/assets/CREDITOS.txt`.
- Verificação: `tests/unit/{tutorial,installed-assets}.test.js`, `tests/e2e/tutorial-assets.spec.js`, adaptação das regressões para entrar no caminhão após o novo início a pé.

## 8. Verificação

Resultados finais e capturas em `evidence/tutorial-assets/`. A primeira execução do percurso completo passou. A primeira tentativa de estacionamento ultrapassou o retângulo porque o controle automatizado acelerava até 47 km/h; o teste foi corrigido para manter velocidade de manobra, sem alargar a área nem afrouxar a regra do jogo. Uma repetição encontrou uma tolerância de navegação do teste que encerrava a caminhada antes dos 3 m; o destino do teste foi ajustado para percorrer a distância real exigida.

O teste de percurso usa comandos da simulação para caminhar, olhar, sair pela porta, acelerar, virar, frear, engatar ré, estacionar e reparar. O retorno longo ao abrigo e os trechos de campanha usam teleporte de diagnóstico para encurtar a automação; a ativação exige os mesmos recursos e interações. Isso não equivale a uma travessia humana contínua de 3 km.

Os números finais de testes/build estão no fechamento abaixo. Não se declara 60 FPS: o navegador disponível utiliza ANGLE SwiftShader, com renderização em CPU. Na primeira medição, o Baixo utilizou aproximadamente 32 MiB de texturas do terreno, 46–68 draw calls e 128–131 mil triângulos; cerca de 1,3–1,7 FPS em software. Texturas dos GLBs não entram nesse contador de mapas de terreno. Windows/GPU integrada, conforto da direção e sessões longas exigem avaliação humana.

## 9. Pendências explícitas

- Quatro caminhões preparados ainda precisam de rig, cockpit/orientação e validação física própria antes de troca/progressão. Não existe seleção funcional de três níveis de caminhão.
- NPCs realistas dependem da licença do pacote Fab; nenhum personagem desse pacote foi distribuído.
- Uma atualização narrativa diferente dos textos encontrados continua aguardando fornecimento; o tutorial técnico já funciona sem ela.
- Materiais adicionais de concreto/vidro/madeira/couro, arte das outras regiões, KTX2 e medição em GPU real permanecem no roteiro gráfico.
- O snapshot oficial contém módulos de saqueadores/IA, mas não os instancia no Game. Esses módulos foram preservados; perseguição no runtime não foi anunciada como funcional nesta entrega.
- Os quatro finais, demais expansões narrativas e conclusão artística do continente não fazem parte desta entrega. Sete Núcleos funcionais não significam que todas as fases do projeto estejam encerradas.

## 10. Próxima etapa

Validar a experiência em Windows com GPU real, revisar a adaptação do Titã externamente e substituir o cockpit provisório. Depois preparar os rigs dos caminhões seguintes e integrar a revisão narrativa quando estiver disponível. Continuar a reforma gráfica sobre os materiais existentes, sem reiniciar fases já entregues.

## Fechamento da validação

- **113 testes unitários passaram** em 14 arquivos; build Next.js passou com dez rotas.
- Os três cenários novos passaram juntos: assets reais/rodas, progresso parcial/pular/repetir e tutorial completo com recarga.
- Execução integral inicial de 18 e2e: **12 passaram e seis falharam**. Houve esperas fixas incompatíveis com a renderização em software, uma verificação duplicada do gerador que eu havia acrescentado ao teste e uma expectativa antiga de cache vazio que não considerava o Titã importado permanente.
- Repetição focada de sete cenários: seis passaram; o último problema era a expectativa de zero modelos no cache. Após corrigir para manter o Titã e descarregar os modelos do cenário, o teste de colisão/streaming passou isoladamente. Assim, **os 18 cenários foram verificados com sucesso entre a execução inicial e as repetições**, sem declarar uma única execução integral verde.
- O aceite de aceleração mantém velocidade acima de 40 km/h, combustível consumido, deslocamento e orçamento gráfico. Agora mede oito segundos **simulados**, separadamente do tempo de parede. Resultado: 46,08 km/h em 8 s simulados, 50,70 s de parede, ~0,42 FPS no Médio em SwiftShader, 90 draw calls, 226.416 triângulos e console sem erros. O resultado anterior de oito segundos de parede foi 11,29 km/h nesse mesmo ambiente; não representa uma medição em GPU real.
- Logs: `unit.log`, `build.log`, `new-features-e2e.log`, `e2e.log`, `regression-recheck.log`, `collision-recheck.log`. Capturas reais: `chapter-start.png`, `truck-real.png`, `cockpit.png`, `gas-station-real.png`, `training-done.png`, `tutorial-completed.png`.
- A captura do posto foi refeita após preparar o setor e posicionar o caminhão fora da câmera. As tentativas de diagnóstico anteriores não foram usadas como imagem final da estrutura.

O usuário já encaminhou um pedido posterior para corrigir seleção contextual, calibração, personagem/câmeras, NPCs e apresentação inicial. Ele deve começar após o fechamento deste checkpoint, preservando o tutorial e os assets desta entrega.

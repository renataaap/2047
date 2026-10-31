# 2047: Rede Aurora — expansão 0.8.0

**Entrega técnica validada — 30/10/2026.** Incrementos A–E, 161 testes unitários, build de produção, reinício real e capturas concluídos. Os 24 cenários únicos de navegador passaram entre rodadas; não houve uma única rodada integral verde. Windows/GPU real, avaliação auditiva e arte final continuam pendentes. Repositório oficial privado: [renataaap/2047](https://github.com/renataaap/2047/tree/feat/tutorial-assets), branch feat/tutorial-assets, release v0.8.0.

Base: 32d55b7, branch feat/tutorial-assets, repositório privado renataaap/2047. Preservados o tutorial, a física, transmissão, seis rodas, exploração, comércio, Sementes, sete Núcleos, menus, diálogos, materiais locais e saves. Não houve reinício do projeto. Os quatro módulos narrativos permanecem idênticos à base; o rótulo técnico de release em pt-BR passou para 0.8.0.

## 1. Incrementos e resultado jogável

| Incremento | Implementação concreta | Checkpoint |
| --- | --- | --- |
| A — diagnóstico | Leituras obrigatórias, árvore limpa, base conferida com remoto, auditoria de assets e capturas reais antes das mudanças | e31ce5e |
| B — ambiente inicial | Área doméstica, armazenamento, reservatório, cozinha externa, varal, cercas, ferramentas e canteiros; decoração contextual de estradas e estabelecimentos, com reservas físicas de circulação | 8f50dee |
| C — exploração | Três locais com entrada/rampa, interiores/áreas acessíveis, inspeção, reservas finitas e registro de informação; mapa e persistência integrados | 5e55019 |
| D — atmosfera | Ciclo solar, luzes noturnas, relógio salvo/configurável, céu procedural e áudio espacial original no contexto existente | 8857da9 |
| E — polimento | Equipamentos individuais no rig, superfícies originais de detalhe, canteiros após restauração, pequenos detritos ao vento, depressão física no asfalto e otimização da geometria | 1a5598b + correções e542555, 56b9c34, 737d484 e 44e5986 |

As regiões existentes receberam vocabulários de decoração diferentes: postes/cabos/guardrails/acampamentos no Mar de Cinzas; fachadas, abrigo de ônibus e semáforos nas Cidades; barcos, boias e píeres no sal; contenções/sinalização na serra; antenas, instrumentos meteorológicos e barreiras de vento nas tempestades. O acabamento do Mar de Cinzas recebeu prioridade. Isso não significa que os cinco biomas tenham arte final pronta.

## 2. Novos locais de exploração

| Local | Localização | Conteúdo e ação permanente |
| --- | --- | --- |
| Motel Última Luz | km 0,38 | Recepção, quartos interrompidos, mobiliário, janelas e cobertura deteriorada; reserva única de 2 águas e 1 comida |
| Pátio dos Retornantes | km 2,02 | Área cercada, cobertura de manutenção, pneus/peças/caixas e caminhão de caçamba licenciado imobilizado; reserva única de 2 peças e 3 materiais |
| Balança Rodoviária 07 | km 2,46 | Plataforma desativada e cabine lateral acessível; boletim recuperável sobre a entrada do Núcleo 1 e Tomás, registrado no mapa, sem recompensa material |

Os três acessos foram percorridos a pé com Player/Rapier, incluindo as rampas. A coleta valida visita e capacidade antes de alterar o inventário; mochila cheia não perde a reserva, e repetir a ação não duplica recursos. O estado continua após save/load. O restante da decoração não virou uma coleção de itens saqueáveis.

O novo motel e as demais composições modulares são arte original do projeto, não modelos escaneados baixados. O caminhão parado reutiliza o GLB existente; ele não recebeu física dirigível, cockpit ou desbloqueio de campanha.

## 3. Distribuição, colisão e streaming

- contextLayout usa seed própria determinística, bioma, faixa da estrada, declividade e reservas de missão/estabelecimentos. Carregar setores em outra ordem não muda a composição.
- Ruas, alternativas, terminais, NPCs, novos acessos e treino têm áreas reservadas. Rochas procedurais antigas também respeitam essas reservas.
- AmbientWorld carrega células de 160 m e estabelecimentos próximos; peças estáticas são unidas por material. Colliders existem para móveis/estruturas maiores, não para cada ferramenta ou detrito.
- DiscoveryWorld mantém piso/rampa visual e físico; a posição de Dante pode usar a superfície elevada do POI. Y explícito de saves/saídas continua preservado.
- Leases de modelos, geometrias, corpos e texturas de placas são liberados ao descarregar. A base mantém LOD, instâncias, culling, perfis gráficos e cache.
- A depressão da pista no km 0,322 usa a mesma geometria para render e Rapier, com espaço escavado no terreno abaixo. Não invade o treino. Raios físicos verificam profundidade e correspondência com a malha.

A primeira implementação subdividia o setor inteiro. A otimização concentrou os vértices no dano: **12.453 → 611 vértices e 23.680 → 894 triângulos** no trecho gerado do setor inicial. Luzes pontuais sem intensidade ficam fora da renderização durante o dia. Esses números são de geometria, não um benchmark de FPS em GPU.

## 4. Relógio, iluminação e áudio

- Amanhecer, manhã, tarde, entardecer e noite, com ângulo solar, cores, iluminação e exposição graduais. A noite mantém luz ambiente, luar e os faróis reais existentes; estabelecimentos habitados usam luminárias, com no máximo duas luzes pontuais próximas.
- Relógio avança no fixedUpdate somente durante gameplay ativo. Pausa não acumula tempo, e carregar recupera horário/dia. Configuração permite 24/48/96 minutos de simulação ativa por dia do mundo; padrão 48. Quedas de FPS com descarte de tempo físico podem aumentar a duração de parede.
- Céu e iluminação ambiental são procedurais. Não foi instalado um HDRI externo nem um sistema meteorológico novo em substituição ao existente.
- AmbientAudio reutiliza o AudioContext iniciado pelo motor: fontes localizadas de gerador, metal/ferramentas e água, passos por superfície e sinais de porta/reparo. A presença em interiores reduz o ambiente, preservando o áudio do motor.
- Os sons são síntese original Web Audio, sem gravações externas. Avaliação auditiva humana e sons profissionais continuam pendentes.
- O primeiro teste encontrou áudio dependente do próximo frame para pausar. O comando agora inicia o fade imediatamente, inclusive sob renderização lenta; rechecagem passou.

## 5. Personagens e apresentação

Dante, Zeca, Tomás e Ivani usam equipamentos/silhuetas adicionais: boné, mochila e ferramentas, avental, proteção auditiva, óculos e cabelo preso conforme a identidade. Outros atendentes recebem variações de ofício. As peças acompanham os ossos do rig existente, sem outro controlador ou deslocamento por root motion.

A base anatômica e os rostos continuam compartilhados/provisórios. Não foi instalado um Dante fotorealista final. A animação de escalada/assento na cabine continua pendente; os gestos anteriores funcionam. O adaptador deixa de aplicar esses acessórios automaticamente quando houver um GLB final externo.

O menu e os diálogos existentes foram preservados; a nova iluminação atua na cena do menu, com o enquadramento e as transições existentes. Nenhuma fala ou consequência narrativa foi reescrita.

## 6. Assets e licenças

- Oito Poly Haven reais da base continuam locais e aplicados. Não houve novo download da API/CDN.
- Tentativas de transferir os seis ZIPs extras de concreto, madeira, piso, tijolos, container e couro falharam pelo limite de 32 MiB do ambiente. **Essas texturas não foram instaladas.** Registro em evidence/world-0.8.0/asset-transfer.json.
- Detalhes de madeira, concreto e tecido têm mapas procedurais originais; concreto também reaproveita mapas de dados da biblioteca PBR existente. Não receberam nomes falsos de assets baixados.
- Dump truck by ElectroNick: reaproveitado como cenário parado, preservando CC BY 4.0 e crédito. Garagem, posto e barris anteriores mantêm seus créditos.
- Equipamentos dos personagens são adaptações originais no rig MakeHuman CC0. Fab e Soldier/Mixamo permanecem fora.
- Carros Renafox continuam CC BY-NC 4.0. A expansão não representa auditoria/liberação comercial integral do projeto.

## 7. Arquivos modificados

A lista completa está em [docs/ARQUIVOS_0.8.0.md](docs/ARQUIVOS_0.8.0.md), comparada à base 32d55b7. Pontos principais:

- Ambiente: src/data/ambience.js; src/game/world/{contextLayout,PropBatch,decorCompositions,AmbientWorld,DiscoveryWorld,worldProgress,roadDamage}.js; World, terrainGeometry e roadGeometry.
- Atmosfera: src/game/world/dayClock.js; src/game/render/{DayNight,detailSurfaces,SceneRenderer}.js; src/game/audio/{AmbientAudio,EngineAudio}.js.
- Personagens: src/game/player/{WorkerWardrobe,workerDefinition,CharacterActor}.js.
- Integração: Game, exitPolicy, network/upgradeCampaign, validação de schema; DiscoveryPanel, MissionPanel, NetworkMap, Hud e configuração de duração do dia.
- Verificação: oito novos arquivos unitários, world-expansion.spec.js, esperas observadas na regressão, scripts de captura/reinício, evidências e documentação.

## 8. Testes, inspeção e problemas resolvidos

**161 testes unitários / 23 arquivos passaram.** Os 136 casos anteriores permanecem, com 25 novos casos; a expectativa de configuração inclui a duração do dia. **24 cenários únicos de navegador foram aprovados entre rodadas**, incluindo tutorial completo, primeira entrega, sete Núcleos, sobrevivência, NPCs, calibração, entrada/saída, persistência, três POIs, atmosfera, regiões e troca real de perfis. Não houve uma única execução integral verde de 24 casos.

| Execução nova da 0.8.0 | Resultado | Evidência em evidence/world-0.8.0 |
| --- | --- | --- |
| npm test, código atual | 161/161, 23 arquivos | final-unit.log |
| Primeira tentativa integral | Interrompida após 2 aprovações e 2 falhas; diagnóstico preservado | full-e2e-first.log |
| npm run test:e2e, primeira integral concluída | 16 aprovados / 7 falhas, todas investigadas | full-e2e.log; regression-failures |
| Nova tentativa integral | 14 aprovados / 1 falha antes da interrupção do ambiente; não concluída | final-e2e.log |
| Sobrevivência/saída rechecadas | 1/1 após parada, acomodação física e modo a pé confirmado | legacy-exit-final.log |
| Sequência restante e perfis reais | 12/12: assets, Cofres, missões, clima, tutorial e quatro cenários 0.8 | remaining-e2e.log |
| Polimento de acesso/modelo/streaming | 2/2; após o último contato visual, coleta/save/load novamente 1/1 | visual-recheck.log; contact-recheck.log |
| Reinício real do servidor | Aprovado: mesmo payload após dois processos reais, banco temporário isolado | restart-persistence.json |
| npm run build | Aprovado: compilação de produção e rotas Next.js | build.log |

Os 136 unitários e 20 cenários da 0.7.0 são um registro histórico separado. O consolidado novo, com os casos individuais e seus logs, está em [validation.json](evidence/world-0.8.0/validation.json).

Problemas encontrados e corrigidos:

- A inserção de duração do dia havia duplicado quality e forçado Médio ao carregar. A normalização foi corrigida e recebeu teste de recuperação dos três perfis; o orçamento de 300 chamadas não foi aumentado.
- O céu ultrapassava o plano distante em Baixo/Médio. A projeção passou a manter o céu ao fundo, com background sincronizado; a PMREM é criada de céu diurno neutro, inclusive ao escolher Alto à noite.
- O concreto mantinha normal/roughness de variantes liberadas após troca de qualidade. O carregador agora atualiza os vínculos antes do prune e respeita mapas próprios. Testes unitários e quatro trocas de perfil com arquivos reais confirmam liberação e quantidade estável de texturas no cache.
- Esperas de aceleração/freio observam a simulação; os drivers de teste desaceleram perto dos destinos para não oscilar em frames lentos. Saída após teleporte de diagnóstico mantém Espaço, aguarda acomodação e confirma walking. Não foram reduzidos limites de velocidade, frenagem, colisão ou progressão.
- O novo fixture de teste usa a superfície triangular real no spawn. Y explícito dos saves continua preservado. Modelos do ambiente são sincronizados em preparePosition para evitar leases antigos após deslocamentos de diagnóstico.
- A pausa de áudio deixou de depender do próximo frame; o fade inicia imediatamente.
- Inspeção das imagens levou a conferir a menor cota do modelo estático, dimensionar seu colisor real e completar suportes/travessas de placas. O letreiro traseiro do barracão foi orientado para dentro. A oclusão de contato é um mapa procedural original; não foi apresentada como sombra física nova.
- Os faróis existentes receberam intensidade/alcance e decaimento adequados à nova noite. As imagens com e sem faróis mostram a diferença real.

No aceite de condução: **8,0167 segundos simulados**, 46,18 km/h, diesel 4 → 3,9265 L, **125 draw calls / 267.466 triângulos**, sem erros de console. A medição/captura levou 58,512 s de parede e a média foi **0,416 FPS em SwiftShader**. Isso não aprova desempenho em hardware: Windows/GPU real continuam necessários. O orçamento de 300 chamadas/500 mil triângulos foi mantido. Dados em [acceptance.json](evidence/acceptance.json).

Os quatro módulos narrativos foram comparados por SHA-256 com 32d55b7 e permanecem byte a byte idênticos: [prova](evidence/world-0.8.0/narrative-preservation.json). Rótulos técnicos de release/rodapé foram atualizados separadamente.

### Imagens reais

[Comparação visual completa](docs/COMPARACAO_VISUAL_0.8.0.md): cinco pares nas mesmas posições, viewport 1280×720, Baixo/75%. As cores/iluminação mudaram com o novo relógio. Capturas adicionais mostram moradia, ferramentas, bancada externa e cabine noturna com/sem faróis. As imagens dos três POIs mostram também suas áreas acessíveis; fases e modelos não são considerados prontos só pela presença de arquivos.

São imagens do WebGL do projeto, sem imagens promocionais, montagem ou render externo. A inspeção encontrou questões de apoio, iluminação e letreiro que foram corrigidas antes do fechamento. Arte modular, rostos e diversos interiores ainda exigem acabamento; as imagens permitem avaliar esse limite diretamente.

## 9. Pendências e próxima etapa

Continuam pendentes: avaliação humana de navegação, conforto, áudio e desempenho no Windows/GPU real; arte final individual de personagens/rostos/cabine; animação completa de entrada/saída; gravações sonoras profissionais; materiais extras não transferidos; acabamento artístico aprofundado das fachadas/interiores e dos demais biomas. O depósito e o ferro-velho novos não foram declarados POIs concluídos: foram priorizados os três acessíveis desta entrega.

Economia dinâmica, contratos, Código da Última Estrada, facções/reputação, progressão de caminhões, eventos, rotinas e os quatro finais são somente o [roadmap posterior](docs/ROADMAP_APOS_0.8.0.md). Sete ancoragens não encerram a narrativa. Não foram ativados saqueadores/perseguições por esta expansão.

Próxima etapa: usar [TESTE_MANUAL_0.8.0.md](docs/TESTE_MANUAL_0.8.0.md) em hardware real, registrar os pontos fracos e priorizar acabamento artístico. [Auditoria do escopo](docs/AUDITORIA_0.8.0.md). Código, histórico, relatórios, créditos e imagens compõem a entrega na branch feat/tutorial-assets e tag v0.8.0 do origin privado renataaap/2047. O envio usa Git normal, sem force push. O GitHub transfere o projeto; não sincroniza saves locais entre aparelhos.

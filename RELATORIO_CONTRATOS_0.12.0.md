# 0.12.0 — Contratos de transporte, economia regional e carreira

**Estado deste checkpoint: implementação em validação.** Não é uma aprovação artística/humana nem uma integral E2E concluída. Branch `feat/contratos-economia-0.12.0`, base `69afd07`/0.11.0. O PR #5 permanece aberto e a main está em `4771193`/0.10.0 (consulta remota nesta tarefa). Nenhum merge, rebase destrutivo ou force push foi realizado.

## Mudança de comportamento

O motorista encontra quadros físicos nos estabelecimentos existentes, aceita uma encomenda, estaciona para coletar, vê a mercadoria no veículo, escolhe a navegação do frete, dirige, estaciona no destino e confirma o descarregamento. Pagamento em materiais recuperados/peças e experiência são confirmados após salvar. A campanha da Rede continua independente.

Não existe pagamento por passar perto do destino. A operação exige Dante junto ao terminal, caminhão inteiro na faixa, alinhamento, velocidade até 0,2 m/s, motor desligado, manifesto correto e distância física coerente com uma rota conectada. Uma carga retirada só pode ser cancelada após devolução a um depósito.

## Base preservada

Next.js/React/JavaScript, Three.js/WebGL2, Rapier, libSQL, três slots e schema 3. Quatro módulos narrativos, tuning, cabine, SeatedPose, materiais do Titã, catálogo dos veículos, dois GLBs e TerrainBlend têm hashes protegidos em `evidence/contracts-0.12.0/protected-base.json`. VehiclePhysics recebe apenas massa/COM/inércia adicionais; não foram aumentados torque, aderência, freio ou capacidades para favorecer o frete. A campanha não depende da carreira.

Os 257 unitários e 44 cenários históricos da 0.11.0 continuam documentados na versão anterior. Nesta tarefa, a referência anterior às alterações foi uma nova execução de 257 unitários, um build e um E2E de comércio/atores. O arquivo de validação final distinguirá essa referência das rodadas da 0.12.0.

## Contratos e locais

Catálogo declarativo em `src/data/contracts.js`: seis quadros, um depósito de recebimento/devolução e doze modelos. As ofertas são filtradas por Núcleos já ativos, carreira, veículo disponível, peso, espaço e conexão no grafo. Não há destino gerado aleatoriamente fora da rede.

| Quadro | Encomendas iniciais do catálogo | Carga / peso |
| --- | --- | --- |
| Cinza Nova | Água para a oficina; reabastecimento do Abrigo 07 | 3 tambores / 630 kg; 4 sacos / 300 kg |
| Cotovelo | Instrumentos para Cinza Nova; gerador para o pátio | 2 caixas técnicas / 180 kg; 1 máquina / 4.200 kg |
| Mãe Ivani | Ferramentas para a reserva; reserva urgente de água | 4 volumes / 720 kg; 3 tambores / 630 kg |
| Janelas | Medidores para a parada; filtros para a oficina | 4 caixas / 360 kg; 4 volumes / 500 kg |
| Passo | Bombas para Janelas; peças para a parada | 2 conjuntos / 2.800 kg; 4 volumes / 720 kg |
| Horizonte | Equipamentos de socorro; filtros para a serra | 2 caixas / 170 kg; 4 volumes / 500 kg |

Abrigo 07 recebe alimentos e também permite devolver frete para liberar o berço da Semente. Não oferece um segundo quadro de contratos iniciais.

No máximo duas ofertas por quadro. IDs `frete:modelo:época`; época de 900 segundos de simulação ativa, validade nominal de até 1.200 s. Menus e o relógio do computador não avançam as ofertas. Aceite preserva a oferta até a conclusão; urgências começam a contar após a coleta. Encerrar/cancelar fecha o modelo naquela época. Não há prêmio por aceitar/cancelar nem mercadoria convertível em suprimentos próprios.

Estados: disponível, aguardando coleta, em transporte, pronto para entrega, falha de integridade, concluído ou cancelado. Disponibilidade é derivada das ofertas; encerramentos ficam no histórico e no registro compacto por modelo/época.

## Carga e física

Manifesto separado da mochila de 40 kg e do compartimento de suprimentos de 240 kg. Capacidade de transporte confirmada no catálogo: Titã 8.800 kg de chassi / 6.000 kg de berço; Basculante 6.500 / 3.200 kg. Ambos conservam seis rodas.

A validação soma Semente de 2.200 kg, suprimentos e frete. O diesel do tanque afeta a massa física, mas não ocupa o berço. A acomodação também verifica dimensões e reserva o espaço real da Semente. Cargas pequenas podem ficar na faixa traseira dos dois veículos; o gerador exige Titã e berço livre. Uma nova Semente não pode atravessar um frete pesado: o jogador recebe orientação para devolver a mercadoria, inclusive no Abrigo 07, sem perder a campanha.

Modelos autorais em `CargoVisual`: paletes, tambores com anéis/tampas, sacos, caixas de madeira, caixas técnicas e máquinas com carcaça/ventilação. Reutilizam materiais locais. A mercadoria acompanha a raiz do chassi e é removida no descarregamento. Não tem coletável que conceda itens nem colliders por caixa. As cintas são apresentação da embalagem; não há habilidade ou bônus fictício de amarração.

O baú do Titã permanece opaco. `CargoDoors` separa somente os triângulos das duas folhas traseiras originais (pintura e metal), mantendo UVs, normais e atlas. As portas abrem suavemente com frete, motor desligado e veículo parado; fecham para dirigir. O GLB em disco, cabine, paredes laterais, seis pivôs e rodas não são modificados.

VehiclePhysics combina a massa comercial, o centro de acomodação e a inércia de volume com a carga anterior. Sem frete, o cálculo anterior é preservado. Consumo e desgaste continuam pelos sistemas existentes; conduzir a mesma distância com mais massa exige mais trabalho. Integridade comercial usa filtro próprio, independente da Semente.

A garagem transfere um único manifesto somente para veículo próprio e compatível, preservando quantidade/integridade. Se a gravação falhar, veículo, carga e recursos voltam ao estado anterior.

## Economia e recompensas

`market.js` centraliza cotação em unidades inteiras. UI e transações usam as mesmas funções para combustível, recipientes, suprimentos, oficina e recompra de peças. Fórmula: tarifa regional × escassez de estoque × demanda × recuperação local, limitada a 75%–175% da referência. Compra arredonda para cima; recompra para baixo, nunca acima de dois materiais por duas peças.

Tarifas determinísticas: cidades favorecem peças recuperadas; sal exige mais água; serra e tempestade encarecem manutenção. Recuperação reduz moderadamente a cotação ao longo do crescimento de 0.11.0. Não cria estoques gratuitos. Os preços variam apenas a partir de dados do mundo/salvamento, sem rolagem aleatória a cada visita.

Cada vendedor tem orçamento de recompra inicial finito (20 materiais), teto 50, financiado pelas compras do motorista. Estoques de mercadoria já eram finitos e continuam persistentes. Uma entrega comunitária reduz demanda até o limite de 80% e coloca apenas uma pequena reserva (até quatro unidades) no estoque existente, respeitando os tetos antigos. O restante do frete é consumo comunitário, não recurso oferecido novamente ao jogador.

Prêmio anunciado: base 3 + combustível estimado de ida/volta convertido em escambo + reserva de desgaste + dificuldade + distância + demanda. Piso de quatro materiais; cargas de dificuldade 2+ incluem uma peça. A qualidade multiplica o prêmio por `0,55 + 0,45 × integridade/100`. Atraso em urgências reduz 20% do pagamento e 10% do XP, sem obrigar condução insegura. Abaixo da integridade mínima: registrar perda sem pagamento/XP. Estas são hipóteses iniciais, não aprovação de balanceamento humano.

## Carreira e interface

XP apenas ao concluir uma entrega. Bônus de cuidado de 20% em XP para integridade ≥90%. Títulos aos 0/180/500/1.000/1.800/3.000 XP: Motorista de Abrigo, Transportador de Estrada, Motorista Experiente, Operador Regional, Caminhoneiro Veterano e Condutor da Aurora. Encomendas pesadas/frágeis posteriores exigem nível 2; não bloqueiam Núcleos.

Contadores de frágeis, pesados, logística, manutenção e planejamento representam serviços realizados. Experiência em cargas frágeis libera medidores/socorro; logística libera reserva urgente; pesados libera bombas; manutenção libera filtros da serra, sempre respeitando nível, campanha e capacidade. Não alteram magicamente pneus ou potência. Estatísticas: entregas, distância com carga, boas condições, especiais, regiões, uso por caminhão e recursos recebidos. Histórico recente de 60 canhotos; registro por época impede repetir uma recompensa antiga.

Painel industrial com encomendas, manifesto, motorista e histórico; consulta remota em **Fretes / carreira**. Contratar, coletar e descarregar exigem quadro físico por **F**. HUD curto mostra destino, peso, integridade e prazo opcional, separado da Semente. O minimapa existente navega; o mapa M e o manifesto permitem retomar frete/campanha. Os três perfis usam o grafo real, com distância, tempo, consumo, piso e risco. A rota não é recalculada a cada frame.

## Persistência, concorrência e rollback

`campaign.logistics`, `career` e `economy` são extensões opcionais/versionadas do schema 3. Saves antigos recebem estados vazios, preservando inventários, frota, Núcleos, recuperação e slots. A API valida formato, IDs, épocas, massa, carga ativa, história, finanças e estatísticas.

Confirmações de contrato e comércio são serializadas no cliente. Uma revisão otimista salva o conjunto completo; o sucesso só aparece após a resposta. Cliques repetidos ficam bloqueados. Falha/409 restaura o snapshot anterior; em conflito real é necessário recarregar a revisão atual, sem sobrescrever outro progresso. Nenhum cookie ou segredo aparece nas evidências publicadas.

## Validação disponível neste checkpoint

- 314/314 unitários em 37 arquivos na última execução agregada, `logs/final-unit.log` (57 novos testes sobre os 257 da base).
- Titã: frete comum, coleta e massa real, 776,81 m por Rapier, estacionamento, entrega, pagamento único e recarga. 7 materiais / 108 XP, 0,435 L durante a viagem, integridade 100%.
- Basculante: frete comum e depois uma rodada separada de instrumentos frágeis, em sentido inverso. Ambas com física real e persistência.
- Falha de API 409 no aceite: rollback observado no navegador, sem carga, recurso ou XP duplicado; nova tentativa após retirar a falha funciona.
- Ensaio de pista em `payload-physics.json`: 4.200 kg fazem o Titã levar 6,85 s em vez de 5,15 s para 8 m/s; frenagem a partir de 8 m/s cresce de 5,64 para 7,92 m. Basculante de 2.800 kg: 5,72 s vs. 4,52 s e 6,83 m vs. 5,07 m. Pista plana, seis rodas, Rapier 60 Hz.
- Distância carregada coerente a 30/60/120 FPS de apresentação; testes de volume/Seed, finanças, dados inválidos, estado/manifesto, transferencia e portas reais.

A auditoria local de 14 acessos regionais passou em 6,5 min e a candidata tem 5/5 E2Es em rodada separada (5 min), incluindo gerador pesado e três slots. Build final, integral E2E e reinício real ainda serão registrados. Não usar esse checkpoint como conclusão integral.

## Evidências e desempenho

Raiz nova `evidence/contracts-0.12.0`, sem substituir versões anteriores. `focused-3` contém primeiro frete Titã; `focused-4`, frete comum Basculante; `focused-5`, instrumentos e conflito. Algumas capturas iniciais do Titã ocorreram durante o fade da cabine; preservadas, não tomadas como prova artística. O harness posterior espera opacidade zero dos dois fades.

Na mesma parada de Cinza Nova, Titã vazio/com carga: 105→110 draw calls, 165.152→167.348 triângulos, 114→126 geometrias e 70→70 texturas. É o custo incremental do frete nesta implementação, não comparação de FPS entre versões ou aprovação em hardware Windows. Streaming carrega apenas terminais próximos; a carga usa poucos lotes por material, recursos compartilhados e descarte no unload/troca de veículo.

## Arquivos e assets

Dados: `src/data/contracts.js`. Lógica: `src/game/logistics/{contracts,manifest,career,LogisticsController,CargoVisual,CargoDoors,LogisticsWorld}.js`; economia: `src/game/economy/{market,EconomyController}.js`. Integração: Game, VehiclePhysics, fleet, Navigator, schema, placement, comércio existente. UI: ContractsPanel, HUD, RoutePlanner e painéis de serviço existentes. Testes específicos em contracts, regional-economy, logistics-integration e E2Es de contratos/acesso. Ensaio reproduzível em `scripts/medir-carga-0.12.0.mjs`. A lista exata do commit ficará no registro final.

Nenhum pacote externo ou novo modelo foi baixado. Carga/quadro são geometria autoral do projeto; portas mantêm licença/atribuição do Titã. Materiais PBR, rig e modelos locais anteriores preservados. Créditos em `public/assets/CREDITOS.txt`; a restrição CC BY-NC dos carros continua. Não se declara liberação comercial de todo o projeto.

## Limitações e continuação

Necessários: playtest no Windows/GPU real, audição, avaliação de duração, variedade, manobras e recompensas por pessoas. A automação acelerada não representa uma viagem humana desde o início de uma partida. Não há empilhadeira, simulação de cintas/mercadoria solta, reboque, rotinas de carregadores ou economia global multiplayer. Especializações habilitam cinco encomendas com requisitos moderados; faltam mais benefícios logísticos e mais composições de docas. As entregas não reformam automaticamente edifícios: seu efeito comunitário inicial é a demanda/pequena reserva persistente.

Próximas melhorias possíveis: fretes com coleta distante do quadro, operações de recuperação, reputação regional, interfaces de expedição com animação dedicada e apresentação mais detalhada da comunidade abastecida. Ampliar só após validar os trabalhos atuais e o balanceamento humano. Os quatro finais e arte final do continente continuam no roadmap anterior.

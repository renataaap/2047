# Diagnóstico — interações, Semente e apresentação (0.7.0)

Base preservada: checkpoint 0.6.0 `77c96ec`, na branch `feat/tutorial-assets`, descendente do snapshot oficial `a8a8802`. O texto do pedido está em PEDIDO_CORRECOES_CRITICAS_2026-10-29.md. Este pedido foi executado depois do tutorial/assets, conforme a ordem solicitada. Prompts duplicados não criaram implementações paralelas.

## Causas reproduzidas

1. **NPC/estabelecimento:** o snapshot original permitia que NetworkController retornasse pontos da Estrada Viva e ganhasse a prioridade em Game.interaction. A 0.6.0 removeu essa interceptação. Ainda faltavam entidades de bomba/equipamento, seleção pelo olhar/visibilidade e estabilidade entre indicação e F. Um teste anterior à correção demonstrou que a bomba não tinha tipo próprio.
2. **Calibração:** campaign.calibrate e network.calibrateNetwork só debitavam o inventário do caminhão; a UI desabilitava a ação mesmo com duas peças na mochila. O teste vermelho está em evidence/critical-gameplay/reproduction-unit.log.
3. **Estado da Semente:** a falha de ativação já mantinha a carga e retirava oito pontos de integridade. O sucesso já consumia a carga. A apresentação não explicava adequadamente a diferença, e a dependência exclusiva de peças no Titã impedia a recuperação em situações válidas. Não foi criado um segundo depósito/inventário de Semente nem uma migração que duplica cargas.
4. **Avatar/câmera:** Player só tinha cápsula física e visão em primeira pessoa. O slot de NPC aceitava GLB licenciado, mas o pacote Fab recebido continuava sem licença identificada.
5. **Menu/diálogo:** a composição existente era funcional; o pedido exige novo enquadramento 3D, composição e diferenciação entre conversa e transação, preservando todas as falas.
6. **Spawn em relevo:** a regressão dos sete Núcleos encontrou Dante caindo sob o terreno na Cordilheira. Player.teleport usava a função analítica, enquanto a malha visual e o colisor interpolam triângulos. Em x=-47/z=-12783, a altura analítica era -30,599 m e a superfície física -27,552 m. World.groundHeight agora interpola o triângulo real, sem depender de um broadphase ainda não atualizado. Player recebe esse amostrador para spawn e preserva Y explícito de saves/saída. O teste físico simula 240 passos na região e a travessia dos sete Núcleos passou novamente.

## Decisões implementadas

- InteractionResolver escolhe descritores com chave estável, tipo, posição, raio, prioridade e disponibilidade. Considera distância, direção, visibilidade por raycast e pequena histerese. Game mantém o descritor publicado; F/botão executam esse alvo e revalidam alcance/visibilidade. O comando não procura outro NPC durante a execução.
- NetworkController trata somente os pontos da Rede; transações duplicadas e sem uso da Estrada Viva foram removidas dali. RoadController fornece NPCs, bombas e gerador como entidades diferentes e valida a posição da entidade selecionada.
- seedService concentra a elegibilidade e o pagamento da calibração para todos os Núcleos. Usa mochila e, até 40 m, compartimento do Titã; preserva estacionamento e motor desligado. Valida tudo antes de debitar. Guarda os dois inventários existentes e espelha a integridade na Semente carregada da Rede.
- Após sucesso, o terminal exibe integridade/chance indisponíveis e orienta buscar a próxima Semente no próximo Cofre. Após falha, mantém a carga, explica a recuperação e permite calibrar quando há recursos acessíveis.
- O requisito de gerador para ativar o primeiro Núcleo permanece. Ele não foi usado para desabilitar indevidamente a calibração.
- Um asset anatômico MakeHuman, explicitamente CC0, recebeu roupas/detalhes, rig e sete clips originais. O arquivo final é local. Isso substitui cápsulas visuais nos personagens prioritários, mas a arte continua provisória; não é um Dante escaneado/final realista. O Fab e Soldier/Mixamo não foram incorporados.
- A câmera a pé alterna com C, acompanha o corpo físico, admite mouse e varre esfera contra obstáculos, inclusive o Titã. Primeira pessoa oculta Dante. O modelo não controla a posição física.
- O menu usa o mesmo renderizador e loop com um posto GLB real de ambientação; esse cenário de apresentação fica oculto durante a partida, sem colisores que alterem o mapa. Há fade na nova partida/continuação. Conversas enquadram o interlocutor com colisão e suavização, preservando os controles após fechar.

## Texto protegido

src/data/campaign.js, road.js, network.js e expedition.js devem continuar idênticos aos do checkpoint 0.6.0. Novas mensagens de bloqueio/calibração, cabeçalhos e rótulos são textos funcionais; os diálogos e consequências não foram reescritos. A comprovação de hashes fica em evidence/critical-gameplay/narrative-protection.json.

# CODEX — 2047: REDE AURORA
## Correções críticas de gameplay, personagem 3D, menu principal e sistema de diálogos

**Repositório:** https://github.com/Da-Hora-stack/2047

Quero corrigir problemas que estão prejudicando minha experiência no 2047: Rede Aurora e realizar uma reformulação visual significativa.

Não quero começar outro projeto.

Trabalhe sobre a versão mais atual disponível no ambiente de desenvolvimento, preservando as alterações locais e os sistemas existentes.

**Atenção: o GitHub pode não conter minha atualização mais recente dos textos e diálogos. Não sobrescreva essa atualização com versões antigas.**

# 1. PROBLEMA CRÍTICO — INTERAÇÕES COM NPCs E ESTABELECIMENTOS

Existe um problema no sistema de interação.

Exemplo real:

No Posto Boa Viagem, quando me aproximo do Zeca, dependendo da posição do personagem, aparece uma interação com o posto em vez da opção de conversar com Zeca.

Isso prejudica a imersão e pode abrir o painel errado.

## Causa encontrada na versão publicada

Inspecione:

- `src/game/core/Game.js`
- `src/game/missions/NetworkController.js`
- `src/game/missions/RoadController.js`
- `src/data/road.js`
- `src/components/gameplay/MissionPanel.js`
- `src/components/gameplay/RoadPanelContent.js`
- `src/components/gameplay/NetworkPanelContent.js`

A implementação publicada permite que `NetworkController.target()` encontre elementos de `ROAD_POINTS` e os identifique como interações de rede.

Como `Game.interaction()` prioriza esse controlador, ele pode impedir que o `RoadController` reconheça corretamente o NPC.

Corrija o problema estruturalmente.

## Resultado esperado

Quando Dante estiver próximo do Zeca:

- A interação deverá ser **Falar com Zeca**.
- O painel deverá identificar Zeca como interlocutor.
- O estabelecimento poderá aparecer como informação secundária.
- O diálogo correto deverá ser exibido.
- As compras e serviços deverão continuar funcionando.

Quando Dante estiver próximo de uma bomba de combustível:

- A interação poderá ser **Abastecer caminhão**, se as condições permitirem.

Quando Dante estiver próximo de um equipamento:

- A interação deverá identificar o equipamento.

Não trate NPCs, prédios e objetos como o mesmo alvo interativo.

## Novo sistema de seleção de alvos

Implemente uma resolução consistente de interações considerando:

1. Proximidade real.
2. Posição do alvo.
3. Direção da câmera.
4. Visibilidade do alvo.
5. Tipo da entidade.
6. Prioridade contextual.
7. Disponibilidade da ação.

Use a mesma entidade selecionada para apresentar a indicação e executar a interação.

Evite que o alvo mude indevidamente entre mostrar o botão e pressionar F.

A solução deverá funcionar também com:

- Tomás.
- Dona Marta.
- Lurdes.
- Seu Gil.
- Cacá.
- Rute.
- Nando.
- Baiano.
- Tica.
- Valéria.
- Outros NPCs da campanha.

Teste aproximação frontal, lateral, por trás e em distâncias diferentes.

Não corrija apenas o Zeca. Corrija a arquitetura do sistema de interação.

# 2. PROBLEMA CRÍTICO — REPARO E CALIBRAÇÃO DA SEMENTE

Existe um problema quando tento consertar ou calibrar uma Semente de Ignição depois de depositá-la no primeiro Núcleo.

Quero que esse fluxo seja revisado e corrigido.

## Arquivos a investigar

- `src/game/missions/campaign.js`
- `src/game/missions/network.js`
- `src/game/missions/NetworkController.js`
- `src/game/core/Game.js`
- `src/components/gameplay/MissionPanel.js`
- `src/components/gameplay/NetworkPanelContent.js`
- `src/game/persistence/schema.js`

A versão publicada exige que a Semente esteja marcada como carga e que determinadas condições de estacionamento e inventário sejam satisfeitas.

Investigue se essas regras estão impedindo indevidamente a calibração após a entrega no terminal.

## Fluxo desejado

### Antes da entrega

A Semente poderá sofrer danos durante o transporte.

O jogador deverá visualizar sua integridade.

### Ao chegar ao Núcleo

O jogador estaciona, desliga o motor, sai do caminhão e interage com o terminal.

Se a Semente estiver danificada, deverá poder calibrá-la antes de tentar ativar o Núcleo.

### Se a ativação falhar

O jogador deverá receber uma explicação clara e poder tentar novamente após realizar a calibração necessária.

A Semente não pode ficar inacessível por uma inconsistência de estado.

### Se a ativação for concluída com sucesso

O Núcleo passa para o estado ativado e a Semente utilizada deixa de ser uma carga reparável.

O jogo deverá explicar que a próxima Semente precisa ser obtida no próximo Cofre.

Não permita reparar ou duplicar uma Semente já consumida por uma ativação bem-sucedida.

## Recursos para reparo

Verifique se as peças estão:

- Na mochila do jogador.
- No compartimento do caminhão.

Permita utilizar recursos dos compartimentos acessíveis no contexto, respeitando as distâncias e as regras existentes.

Caso o jogador esteja sem peças, apresente uma explicação específica.

Exemplos de mensagens funcionais:

- Faltam 2 peças para calibrar a Semente.
- Estacione e desligue o caminhão.
- Aproxime-se do terminal.
- A Semente está totalmente calibrada.
- O Núcleo já foi ativado. Procure a próxima Semente.

Esses exemplos são apenas textos técnicos de interface, não substituições dos diálogos narrativos.

## Testes necessários

Verifique:

- Semente com 100% de integridade.
- Semente danificada.
- Peças apenas na mochila.
- Peças apenas no caminhão.
- Falta de recursos.
- Caminhão ligado.
- Caminhão desligado.
- Caminhão estacionado corretamente.
- Primeira ativação falha.
- Segunda tentativa após calibração.
- Ativação concluída.
- Salvamento e carregamento antes e depois da ativação.

Nenhuma ação deve consumir peças se falhar.

Não altere artificialmente a integridade apenas para fazer o teste passar.

# 3. MELHORIA IMPORTANTE — DANTE PRECISA TER UM MODELO 3D

Atualmente, quando saio do caminhão, não encontro uma representação tridimensional convincente do personagem.

Quero que Dante Rocha Negra exista visualmente no mundo.

Não quero apenas uma câmera flutuando pelo cenário.

## Modelo do protagonista

Implemente um personagem 3D com aparência coerente com o universo pós-apocalíptico.

Direção artística:

- Caminhoneiro experiente.
- Roupas resistentes e desgastadas.
- Botas de trabalho.
- Jaqueta ou camisa apropriada.
- Cores discretas.
- Mochila ou equipamentos quando adequado.
- Proporções humanas realistas.

Não transforme Dante em um personagem de fantasia, futurista ou excessivamente militarizado.

Utilize um modelo licenciado e tecnicamente compatível com o projeto.

Se não houver um GLB adequado disponível, prepare a integração e informe o arquivo necessário. Não afirme que um personagem realista foi instalado quando não foi.

## Animações

O personagem deverá ter:

- Idle.
- Caminhada.
- Corrida.
- Rotação.
- Entrada e saída do caminhão.
- Interação com objetos.
- Animação de reparo, quando possível.

Integre as animações ao controlador existente.

Preserve as colisões e as regras de movimentação.

Não use animações independentes que desloquem o personagem para fora do colisor físico.

# 4. CÂMERA EM TERCEIRA PESSOA

Quero poder ver Dante enquanto exploro a pé.

Implemente uma câmera em terceira pessoa, posicionada atrás do personagem.

Características:

- Movimento suave.
- Câmera acompanhando Dante.
- Rotação pelo mouse.
- Colisão da câmera com obstáculos.
- Distância adequada.
- Personagem centralizado ou levemente deslocado.
- Boa visibilidade dos objetos interativos.

Também quero poder alternar entre:

- Primeira pessoa.
- Terceira pessoa.

O modelo do protagonista não deve obstruir a câmera em primeira pessoa.

Preserve os controles atuais e implemente a alternância sem conflitos.

# 5. REFORMULAÇÃO COMPLETA DA TELA INICIAL

Não estou satisfeita com a tela inicial.

Ela parece simples demais e não transmite a atmosfera, a qualidade e a personalidade do jogo.

Quero uma melhoria visual perceptível.

**Não quero apenas mudar a fonte ou a cor dos botões. Quero uma nova composição visual.**

## Conceito

A tela inicial deve apresentar o universo de 2047 antes mesmo de o jogador começar.

Crie uma apresentação cinematográfica.

### Cena principal sugerida

O Titã Rocha Clara aparece estacionado em uma estrada deserta ou próximo a um posto abandonado.

O ambiente deverá apresentar:

- Céu nublado.
- Poeira.
- Estradas deterioradas.
- Construções abandonadas.
- Iluminação cinematográfica.
- Profundidade ambiental.
- Pequenos movimentos no cenário.
- Atmosfera melancólica.

Utilize a própria cena 3D do jogo, com qualidade otimizada.

Não substitua o ambiente tridimensional por uma imagem estática gerada artificialmente.

## Composição da interface

O título **2047: REDE AURORA** deverá ter destaque.

Os botões principais serão:

- Novo jogo.
- Continuar.
- Carregar partida.
- Configurações.
- Créditos.
- Sair, somente se houver comportamento real aplicável ao ambiente.

Não implemente botões decorativos sem funcionalidade.

Utilize tipografia expressiva e uma hierarquia visual bem construída.

### Identidade

- Pós-apocalíptica.
- Cinematográfica.
- Industrial.
- Elegante.
- Minimalista, mas com personalidade.
- Sem excesso de efeitos.

Não quero aparência de dashboard, landing page corporativa ou interface genérica produzida por IA.

## Transições

Ao iniciar uma partida:

- O menu deverá desaparecer suavemente.
- A câmera deverá transicionar para a experiência do jogo.
- O cenário não deverá piscar ou recarregar desnecessariamente.
- O jogador deverá entrar no tutorial ou continuar sua partida corretamente.

Preserve o sistema atual de salvamento.

# 6. REFORMULAÇÃO DE DIÁLOGOS E TEXTOS

A apresentação atual dos textos e diálogos é pouco interessante.

Quero uma interface que pareça parte de um jogo narrativo de qualidade.

## Restrição essencial

O GitHub pode ainda não conter os textos atualizados.

Portanto:

- Não reescreva a história.
- Não substitua diálogos recentes por versões antigas.
- Não invente novas falas definitivas.
- Não apague escolhas narrativas.
- Não modifique nomes de personagens indevidamente.

Concentre-se no design e na experiência de apresentação.

## Diálogos cinematográficos

Implementar:

- Nome do NPC em destaque.
- Texto legível.
- Posicionamento coerente.
- Animações discretas.
- Avanço por teclado ou mouse.
- Opção de mostrar o texto completo imediatamente.
- Indicadores de continuação.
- Hierarquia visual de falas e respostas.

Evite caixas enormes sobre a cena.

O jogador precisa conseguir observar o personagem com quem está conversando.

## Escolhas narrativas

As respostas devem ser apresentadas como opções de diálogo, não como botões genéricos de formulário.

Exigir:

- Destaque da seleção ativa.
- Navegação por teclado.
- Navegação por mouse.
- Confirmação clara.
- Feedback discreto.
- Suporte a textos longos.
- Estado visual para opções indisponíveis.

Não altere as consequências das escolhas existentes.

## Conversas nos estabelecimentos

Quando Dante conversar com Zeca, o jogador deverá reconhecer que está interagindo com uma pessoa.

A apresentação deve identificar:

- Nome do NPC.
- Local onde trabalha.
- Diálogo.
- Serviços disponíveis.

Separar visualmente a conversa da interface de compra e abastecimento.

Não misture toda a negociação e o diálogo em uma única janela confusa.

# 7. SISTEMA VISUAL DOS NPCs

Quero melhorias também nos personagens secundários.

Atualmente, parte dos NPCs é representada por geometrias provisórias.

Substitua progressivamente por modelos 3D compatíveis com a direção realista.

Priorize:

1. Zeca.
2. Tomás.
3. Sobrevivente do primeiro abrigo.
4. Mãe Ivani.
5. Mecânicos e comerciantes.

Os personagens deverão:

- Ficar posicionados corretamente.
- Ter animação idle.
- Olhar para Dante durante a conversa.
- Possuir colisões adequadas.
- Ser identificados individualmente.
- Ter interações próprias.

Não dependa apenas da proximidade com o prédio para iniciar uma conversa com um NPC.

# 8. PRESERVAR O TUTORIAL E OS SISTEMAS EXISTENTES

Se o tutorial já tiver sido implementado na versão local, preserve-o.

Se ainda estiver em desenvolvimento, não recrie uma implementação paralela.

Integre as novas melhorias ao sistema existente.

Preserve:

- Direção.
- Física.
- Transmissão.
- Inventário.
- Manutenção.
- Comércio.
- Missões.
- Sementes.
- Núcleos.
- Rádio.
- Exploração.
- Persistência.
- Atualização dos textos.
- Controles.

Corrigir um bug não pode criar outros problemas.

# 9. TESTES E VALIDAÇÃO

Antes de implementar, reproduza os bugs relatados.

Crie testes automatizados para:

- Prioridade de interação com NPCs.
- Interação com Zeca em diferentes posições.
- Abertura do painel correto.
- Seleção do alvo contextual.
- Calibração da Semente no Núcleo 1.
- Recuperação após ativação malsucedida.
- Persistência do estado da Semente.
- Movimentação do avatar.
- Alternância de câmeras.
- Navegação nos diálogos.
- Menu inicial.
- Nova partida e carregamento de saves.

Execute:

- `npm test`
- `npm run build`
- `npm run test:e2e`

Quando o ambiente permitir, abra o jogo no navegador e teste as correções manualmente.

Capture screenshots reais antes e depois da reformulação visual.

Não declare problemas corrigidos apenas porque o código compila.

# 10. ORDEM DE IMPLEMENTAÇÃO

Priorize:

**Etapa 1 — Bugs críticos**
- Corrigir a interação com Zeca e outros NPCs.
- Corrigir a calibração e o fluxo da Semente.
- Garantir que as missões não fiquem bloqueadas.

**Etapa 2 — Personagem**
- Integrar um modelo 3D de Dante.
- Implementar animações.
- Criar câmera em terceira pessoa.

**Etapa 3 — NPCs**
- Melhorar os modelos.
- Integrar animações.
- Conectar interações aos personagens.

**Etapa 4 — Interface**
- Reformular completamente a tela inicial.
- Melhorar transições.
- Reformular diálogos e seleções.
- Melhorar apresentações de comércio e oficinas.

**Etapa 5 — Validação**
- Executar testes.
- Verificar saves.
- Verificar a física.
- Comparar visualmente.
- Atualizar a documentação.

# 11. RESULTADO ESPERADO

Quero que as mudanças sejam perceptíveis assim que eu abrir o jogo.

A tela inicial precisa ter identidade visual e transmitir a atmosfera de 2047.

Ao iniciar uma partida, quero controlar Dante e enxergar seu modelo 3D quando estiver em terceira pessoa.

Ao encontrar Zeca, quero conversar com Zeca, não com o prédio do posto.

Ao chegar ao primeiro Núcleo, quero conseguir calibrar a Semente quando as regras permitirem e compreender exatamente o que está impedindo uma ação quando ela estiver indisponível.

As falas e escolhas devem ser apresentadas de maneira envolvente.

**Não quero apenas correções internas. Quero uma melhoria real e visível na experiência do jogador.**

Implemente diretamente no projeto existente.

No final, apresente os bugs identificados, suas causas, os arquivos alterados, as melhorias visuais, os testes executados e eventuais pendências de assets externos.

Não sobrescreva alterações locais ou textos atualizados não publicados no GitHub.
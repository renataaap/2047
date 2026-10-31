# CODEX — 2047: REDE AURORA
## Tutorial jogável, integração de assets 3D e melhorias de UX/UI

**Repositório oficial:** https://github.com/Da-Hora-stack/2047

**Objetivo:** continuar o desenvolvimento do jogo existente, sem reiniciar o projeto e sem perder nenhuma atualização de código, textos ou narrativa.

# 1. INSTRUÇÃO CRÍTICA — VERSÃO DOS TEXTOS

**ATENÇÃO: O REPOSITÓRIO DO GITHUB PODE NÃO CONTER A ATUALIZAÇÃO MAIS RECENTE DOS TEXTOS, DIÁLOGOS E ELEMENTOS NARRATIVOS.**

Essa informação deve orientar toda a implementação.

Antes de começar:

1. Inspecione o estado atual do repositório e da área de trabalho.
2. Verifique a branch ativa, as alterações não commitadas e os commits disponíveis.
3. Identifique quais arquivos contêm diálogos, missões e textos narrativos.
4. Não presuma que os textos atualmente publicados no GitHub são a versão definitiva.
5. Não restaure versões antigas de diálogos sobre arquivos mais recentes.
6. Não sobrescreva alterações locais do usuário.
7. Não faça `git reset --hard`, force push ou substituições destrutivas.
8. Não invente uma atualização narrativa que não esteja disponível.

Se os textos atualizados estiverem presentes no ambiente de trabalho, preserve-os e utilize-os.

Se ainda não estiverem disponíveis, implemente os sistemas técnicos independentes deles e mantenha a integração narrativa preparada para receber a atualização posteriormente.

**Não interrompa todo o desenvolvimento apenas porque a atualização textual não foi encontrada.**

Separe claramente as alterações técnicas das alterações narrativas.

# 2. CONTEXTO DO JOGO

O projeto se chama **2047: Rede Aurora**.

É um jogo 3D de sobrevivência e simulação de caminhões ambientado em um mundo pós-apocalíptico.

O jogador controla Dante Rocha Negra, um caminhoneiro que atravessa territórios devastados para transportar Sementes de Ignição e restaurar sete Núcleos da Rede Aurora.

O caminhão Titã Rocha Clara é um elemento central da experiência.

As principais inspirações são:

- Euro Truck Simulator 2 — dirigibilidade, cabine e condução.
- SnowRunner — terrenos difíceis, peso e suspensão.
- Pacific Drive — relação com o veículo e manutenção.
- The Last of Us — apresentação narrativa.
- Metro Exodus — ambientação e interfaces imersivas.
- Red Dead Redemption 2 — interações contextuais.

Quero gráficos realistas, atmosfera melancólica e progressão narrativa envolvente.

Não quero aparência cartoon nem objetos geométricos genéricos como resultado artístico final.

# 3. TECNOLOGIAS OBRIGATÓRIAS

Preserve a arquitetura existente:

- Next.js com App Router.
- React.
- JavaScript.
- HTML5.
- CSS3.
- Three.js.
- WebGL.
- Rapier para física.
- API REST.
- Persistência e salvamento existentes.

Não migre para TypeScript.

Não substitua Three.js por Unity, Unreal, Babylon.js ou outro motor.

Não reconstrua sistemas que já funcionam.

# 4. DIAGNÓSTICO DO REPOSITÓRIO

Antes de implementar, consulte:

- `AGENTS.md`
- `README.md`
- `STATUS_DO_PROJETO.md`
- `docs/REFORMULACAO_REALISTA.md`
- `src/game/core/Game.js`
- `src/game/input/Input.js`
- `src/game/physics/VehiclePhysics.js`
- `src/game/vehicle/TruckVisual.js`
- `src/game/assets/AssetManager.js`
- `src/game/render/PBRLibrary.js`
- `src/game/player/CharacterActor.js`
- `src/components/game/GameView.js`
- `src/components/gameplay/MissionPanel.js`
- `src/components/hud/Hud.js`

A estrutura encontrada anteriormente possui:

- Física de caminhões.
- Motor diesel e transmissão.
- Câmeras de direção.
- Exploração a pé.
- Inventário.
- Manutenção.
- Missões.
- Sete Núcleos da Rede Aurora.
- Cinco biomas.
- Sistema de salvamento.
- Gerenciador de assets.
- Biblioteca de materiais PBR.

Valide essas informações contra a versão atual antes de modificar o código.

**Não utilize relatórios históricos como substitutos da inspeção do funcionamento real.**

# 5. PRIORIDADE 1 — TUTORIAL INTERATIVO

Quero implementar um tutorial que funcione como o início da campanha.

O tutorial deverá ensinar as mecânicas naturalmente, sem parecer uma apresentação ou sequência de pop-ups.

Título do capítulo:

**CAPÍTULO 01 — O ÚLTIMO MOTOR**

## Etapa 1 — O abrigo

Atualmente, a versão analisada começa com o jogador dentro do caminhão.

Quero reformular a experiência de uma nova partida para que Dante comece a pé, no barracão onde vive.

O jogador deverá aprender:

- Movimentação usando WASD.
- Controle de câmera pelo mouse.
- Interação com F.
- Inspeção de objetos.
- Exploração do barracão.
- Identificação dos objetos importantes.

Crie uma introdução ambiental.

A história deve ser apresentada principalmente pelo ambiente e pelas interações.

**Não escreva novos diálogos definitivos para essa introdução enquanto a atualização textual não estiver disponível.**

Utilize instruções funcionais curtas e prepare os eventos narrativos para receber os textos atualizados.

## Etapa 2 — Conhecendo o Titã

O jogador se aproxima do caminhão.

Ensinar:

- Entrar no veículo.
- Observar a cabine.
- Ligar o motor.
- Consultar o painel.
- Identificar combustível.
- Identificar RPM.
- Identificar temperatura.
- Alternar câmeras.

Preserve os controles existentes:

- F: interação e entrada/saída.
- E: ignição.
- C: alternância de câmera.

Evite conflitos entre comandos do tutorial e comandos do jogo.

## Etapa 3 — Aprendendo a dirigir

Criar uma pequena área de treinamento próxima ao barracão.

Ensinar:

- Aceleração.
- Frenagem.
- Direção.
- Marcha à ré.
- Freio de estacionamento.
- Curvas.
- Estacionamento.
- Desligamento do motor.

O jogador deverá realmente controlar o caminhão.

Não substitua a física por animações roteirizadas.

A conclusão das tarefas precisa depender de eventos reais da simulação.

Exemplo:

A instrução "Estacione o caminhão" só será concluída quando o caminhão estiver dentro da área determinada, com velocidade suficientemente baixa e condições de estacionamento satisfeitas.

## Etapa 4 — Manutenção

Adicionar uma atividade simples de manutenção.

O jogador deverá:

1. Estacionar.
2. Desligar o motor.
3. Sair do caminhão.
4. Inspecionar um componente.
5. Abrir a interface de manutenção.
6. Utilizar peças disponíveis.
7. Concluir o reparo.

Reutilize os sistemas de inventário, componentes e reparos já existentes.

Não crie uma economia paralela apenas para o tutorial.

A atividade precisa ser concluível com os recursos iniciais e não pode deixar o jogador preso sem alternativas.

## Etapa 5 — A missão começa

O jogador conhece a sobrevivente responsável por apresentar a Semente de Ignição.

Utilize o sistema de diálogos existente.

A missão deverá ensinar:

- Conversar com NPCs.
- Receber uma missão.
- Consultar objetivos.
- Receber a Semente.
- Consultar o inventário.
- Analisar a integridade da carga.
- Abrir o mapa.
- Planejar a primeira rota.

A Dra. Renata Final Boss deverá continuar sendo uma figura importante nas comunicações por rádio.

Preserve as falas atualizadas quando estiverem disponíveis.

## Etapa 6 — Primeira viagem

O jogador sai do abrigo e realiza uma viagem curta pelo Mar de Cinzas.

O percurso deverá ensinar:

- Condução em estrada danificada.
- Controle de velocidade.
- Preservação da carga.
- Atenção ao combustível.
- Escolha de rotas.
- Orientação pelo mapa.
- Interação com pontos de interesse.

Utilize o mundo, as estradas e as missões já existentes.

A viagem deve ser integrada ao início real da campanha.

## Etapa 7 — Conclusão

Conclua o tutorial após um marco narrativo coerente com a primeira missão.

Registrar:

- Tutorial concluído.
- Objetivos realizados.
- Progresso da campanha.
- Estado do caminhão.
- Recursos utilizados.

A conclusão deve permitir continuar normalmente a jornada.

Não altere indevidamente a sequência dos sete Núcleos.

# 6. SISTEMA DE TUTORIAL

Crie um controlador modular para o tutorial.

Sugestão:

`src/game/tutorial/TutorialController.js`

E, conforme necessário:

- Definições das etapas.
- Regras de progressão.
- Eventos observados.
- Componente visual.
- Testes.

O tutorial deverá:

- Ser ativado em novas partidas.
- Permitir pular.
- Permitir repetir.
- Salvar o progresso.
- Retomar após carregar uma partida.
- Não interferir em partidas antigas.
- Evitar repetir instruções já concluídas.

Utilize os eventos reais do jogo.

Não coloque lógica extensa do tutorial diretamente no loop principal de renderização.

A versão examinada possui saves com `schemaVersion` 3. Preserve a compatibilidade e faça uma migração segura se precisar adicionar novos campos persistentes.

# 7. PRIORIDADE 2 — INTERFACE E UX/UI

Não estou satisfeita com a apresentação das caixas de texto, opções de seleção e alguns menus.

Quero melhorar a qualidade da interface para combinar com a direção realista do jogo.

Entretanto, há uma restrição:

**A atualização mais recente dos textos e diálogos ainda pode não estar presente nesse repositório.**

Portanto:

- Não reescreva diálogos antigos.
- Não altere a identidade dos personagens.
- Não substitua falas narrativas.
- Não remova escolhas existentes.
- Não altere consequências de decisões.
- Não invente novos textos de campanha.

Trabalhe inicialmente na estrutura visual e nos componentes técnicos.

## Interface de tutorial

Quero:

- Objetivos discretos.
- Indicação de teclas.
- Feedback de progresso.
- Pequenas animações.
- Texto legível.
- Posicionamento que não atrapalhe a condução.

## Sistema de diálogos

Prepare a estrutura para:

- Legendas cinematográficas.
- Nome do personagem.
- Texto centralizado ou alinhado conforme contexto.
- Opções de resposta discretas.
- Navegação por teclado e mouse.
- Animação de entrada e saída.
- Boa leitura em diferentes resoluções.

Não exiba caixas gigantescas sobre os personagens.

## Menus de interação

Diferencie:

- Diálogo narrativo.
- Escolha de resposta.
- Comércio.
- Inventário.
- Manutenção.
- Configurações.

Cada interface deverá apresentar apenas as informações necessárias.

A reformulação deve melhorar usabilidade, não apenas modificar cores e bordas.

Se a atualização textual ainda estiver ausente, deixe a integração de conteúdo narrativo pendente e implemente somente melhorias que não dependam dela.

# 8. PRIORIDADE 3 — TEXTURAS PBR

O repositório já possui arquivos do Poly Haven.

Antes de baixar novamente, verifique:

`public/assets/polyhaven/`

`public/assets/polyhaven/manifest.json`

`src/game/render/PBRLibrary.js`

Os oito materiais principais incluem:

- `road_damaged_2`
- `gravel_road`
- `mud_cracked_dry_03`
- `dirt`
- `rocky_terrain_03`
- `rusty_metal_05`
- `rust_coarse_01`
- `corrugated_iron`

Os arquivos existentes ocupam centenas de megabytes.

**Não faça novamente o download indiscriminado de materiais que já estão presentes.**

Verifique:

- Caminhos.
- Resolução.
- Formatos.
- Normal Maps.
- Roughness.
- AO.
- Color Space.
- UV.
- Repetição.
- Aplicação visual no cenário.

Otimize o carregamento.

Avalie KTX2 e compressão de texturas quando isso for compatível com o projeto.

Não carregue todos os materiais simultaneamente sem necessidade.

Se algum material estiver ausente, utilize as fontes oficiais do Poly Haven.

Não declare um material integrado apenas porque seu nome está no manifesto.

# 9. PRIORIDADE 4 — CAMINHÕES 3D

O projeto já possui `TruckVisual.js`.

Utilize o sistema existente para integrar modelos GLB corretamente.

### Modelos selecionados

**Caminhão inicial**

https://sketchfab.com/3d-models/truck-old-one-3c15fa1056164a539dbc3332933d52c3

**Caminhão intermediário**

https://sketchfab.com/3d-models/dump-truck-781c616da8f44982a59cb3fc3fa67f98

**Caminhão avançado**

https://sketchfab.com/3d-models/semi-truck-1960-2d7445a796bc471ebccc0cbb323ecd24

**Alternativa**

https://sketchfab.com/3d-models/semi-truck-baked-3e8c5275aeab487fa37d227ce0bd1a9a

Verifique a licença de cada modelo antes do uso.

Se o download não estiver disponível ou os arquivos não tiverem sido fornecidos, registre a pendência e mantenha o modelo procedural funcional.

Não tente utilizar páginas ou códigos Embed como modelos 3D.

### Integração obrigatória

- Importar e validar o modelo.
- Corrigir escala.
- Corrigir orientação.
- Configurar pivôs das rodas.
- Vincular rodas visuais e físicas.
- Preservar colisões.
- Manter direção e suspensão.
- Configurar câmera.
- Preservar instrumentos funcionais.
- Testar aceleração, curvas, frenagem e ré.

**O caminhão precisa continuar dirigível.**

Não sacrifique a jogabilidade para substituir sua aparência.

# 10. NPCs E CONSTRUÇÕES

NPCs:

https://www.fab.com/listings/8fece26a-d452-4b1d-8042-baf95c527154

Posto abandonado:

https://sketchfab.com/3d-models/abandoned-gas-station-0720be99fcfd41d9a5772eee5edf5013

Garagem antiga:

https://sketchfab.com/3d-models/old-garage-d665126c67ff4a8badec7864e2479d9f

Barril enferrujado:

https://sketchfab.com/3d-models/rusty-barrel-4ac758b9811b4cc6954d08ec2356c181

Para cada asset:

1. Verificar direitos de utilização.
2. Confirmar que o arquivo existe.
3. Converter para GLB se necessário.
4. Preservar as texturas.
5. Ajustar escala.
6. Criar colisão adequada.
7. Integrar ao mundo.
8. Testar visualmente.

O sistema `CharacterActor.js` deverá ser reutilizado sempre que possível.

Não apresente personagens low poly como resultado realista definitivo.

# 11. PRESERVAR A CAMPANHA

Não altere desnecessariamente:

- Os sete Núcleos.
- Os cinco biomas.
- As missões existentes.
- O inventário.
- As condições mecânicas.
- Os recursos.
- A física.
- O sistema de rádio.
- A persistência.
- Os checkpoints.
- As escolhas narrativas.
- Os diálogos atualizados, quando disponíveis.

O tutorial deverá se encaixar na campanha, sem reiniciá-la ou duplicar seus sistemas.

# 12. VALIDAÇÃO

Execute os testes existentes e acrescente testes para as novas funcionalidades.

Verifique:

- Build.
- Testes unitários.
- Testes de integração.
- Testes E2E com Playwright.
- Entrada e saída do caminhão.
- Tutorial desde o início.
- Persistência do tutorial.
- Compatibilidade com partidas antigas.
- Carregamento de modelos.
- Aplicação das texturas.
- Funcionamento de diálogos.
- Navegação de menus.
- Colisões e dirigibilidade.

Capture evidências reais do jogo quando houver navegador disponível.

Não apresente renders ilustrativos como se fossem capturas do sistema funcionando.

# 13. ORDEM DE TRABALHO

Execute na seguinte ordem:

**Fase A — Diagnóstico e proteção das alterações**

- Verificar o estado local e remoto.
- Identificar modificações pendentes.
- Proteger textos e diálogos.
- Identificar assets realmente instalados.
- Registrar problemas encontrados.

**Fase B — Tutorial**

- Criar controlador.
- Implementar início a pé.
- Integrar movimentação.
- Integrar direção.
- Integrar manutenção.
- Integrar primeira missão.
- Criar interface contextual.
- Implementar persistência.

**Fase C — Correções gráficas**

- Validar texturas.
- Corrigir materiais.
- Otimizar carregamento.
- Corrigir modelos declarados e ausentes.

**Fase D — Assets externos**

- Integrar caminhões disponíveis.
- Integrar NPCs disponíveis.
- Integrar construções.
- Validar física e animações.

**Fase E — Polimento**

- Refinar as interfaces.
- Melhorar apresentação.
- Verificar desempenho.
- Executar regressões.

Faça commits separados por etapa validada, quando o ambiente e as permissões permitirem.

Não sobrescreva trabalho de outros colaboradores.

# 14. RELATÓRIO FINAL

Ao concluir, apresente:

1. Diagnóstico inicial.
2. Status da atualização dos textos.
3. Arquivos modificados.
4. Funcionalidades implementadas.
5. Etapas do tutorial concluídas.
6. Assets realmente carregados.
7. Problemas de importação corrigidos.
8. Testes executados e resultados.
9. Pendências de download ou licença.
10. Próximas etapas recomendadas.

Diferencie claramente:

- Implementado e testado.
- Implementado, mas não testado.
- Preparado para integração.
- Pendente de arquivos.
- Pendente da atualização textual.

# INSTRUÇÃO FINAL

Quero que você implemente as melhorias diretamente no projeto existente.

O objetivo é transformar 2047: Rede Aurora em um simulador de sobrevivência pós-apocalíptico com uma introdução envolvente, tutorial intuitivo, direção realista e apresentação visual profissional.

**Priorize a experiência real do jogador, preserve todo o trabalho existente e não sobrescreva os textos que ainda serão atualizados.**

Não quero apenas explicações ou sugestões. Quero alterações funcionais no código, testes e resultados verificáveis.

Comece pelo diagnóstico e pela implementação do tutorial, respeitando a versão atualmente disponível.
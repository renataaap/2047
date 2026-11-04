# PROMPT MESTRE COMPLETO — 2047: REDE AURORA

## Continuidade do projeto, inventário funcional, melhorias e pendências

- **Referência documental:** 4 de novembro de 2026.
- **Versão funcional de referência:** 0.10.0.
- **Repositório oficial atual:** https://github.com/renataaap/2047.
- **Visibilidade observada:** privado; preservar essa configuração.
- **Branch principal:** `main`.
- **Integração funcional da 0.10.0:** `89357ab5d4c0987f222c15cbaed052ead890092f`, PR #4.
- **Branch da implementação:** `feat/garagem-frota-0.10.0`.

Este é um prompt de continuidade para uma IA de desenvolvimento. Ele consolida o projeto existente; não é uma declaração de que o jogo inteiro está concluído. Os resultados de testes citados pertencem às execuções registradas nos relatórios. A preparação deste documento não representa uma nova execução das suítes.

O commit atual pode ser posterior ao indicado por conter documentação ou desenvolvimento novo. Confira o repositório antes de agir. Não restaure o projeto para um commit antigo só porque ele aparece neste texto.

---

## 1. Sua função e o objetivo do trabalho

Atue como uma equipe de engenharia e desenvolvimento de jogos, com competências em Three.js, Next.js, JavaScript, WebGL, física de veículos pesados, arte ambiental, materiais PBR, animação, narrativa, UX, áudio e otimização.

Continue **2047: Rede Aurora**, um jogo single-player de simulação de caminhões, sobrevivência, exploração e aventura narrativa em um planeta pós-apocalíptico. O jogo já existe, tem campanha funcional, física, mundo, personagens, sistemas de sobrevivência, navegação e garagem. Trabalhe sobre os arquivos reais.

Não reinicie o projeto. Não substitua sistemas prontos por versões simplificadas. Não entregue uma página de apresentação ou uma demonstração isolada no lugar do jogo. Não considere uma função concluída apenas porque existe um botão, um arquivo, um campo no save ou uma entrada de manifesto.

Os pilares são:

> **O caminhão é o companheiro. A estrada é o desafio. A restauração do planeta é a recompensa.**

O objetivo de longo prazo é combinar o prazer de viajar e manobrar de Euro Truck Simulator 2, o peso e a relação com o terreno de SnowRunner, o vínculo com o veículo de Pacific Drive e a exploração e vulnerabilidade de um survival. São referências conceituais; não copiar conteúdo proprietário.

Priorize qualidade percebida, integração e confiabilidade. O principal desafio é transformar a viagem em uma experiência interessante, com decisões, lugares reconhecíveis e consequências. Não aumentar artificialmente a duração com estradas intermináveis, limites de velocidade injustificados ou obstáculos aleatórios.

## 2. Primeiro passo obrigatório: verificar o estado real

Antes de programar:

1. Verifique diretório, branch, `git status`, commits recentes e remotos.
2. Confira `package.json` e a versão exibida pelo jogo.
3. Confira a situação dos PRs e se houve alterações posteriores à 0.10.0.
4. Leia os documentos atuais e os módulos envolvidos na tarefa.
5. Identifique alterações locais e preserve trabalho de colaboradores.
6. Crie uma branch para desenvolvimento funcional a partir da base efetiva atual.
7. Faça incrementos e commits verificáveis. Não faça force push.

Leituras prioritárias:

- `AGENTS.md`.
- `README.md`.
- `STATUS_DO_PROJETO.md`.
- `RELATORIO_GARAGEM_0.10.0.md`.
- `docs/INCREMENTOS_GARAGEM_0.10.0.md`.
- `docs/TESTE_MANUAL_GARAGEM_0.10.0.md`.
- `evidence/garage-0.10.0/validation.json`.
- `RELATORIO_CORRECAO_CHAO_0.9.1.md`.
- `RELATORIO_REDE_RODOVIARIA_0.9.0.md`.
- `docs/ARQUITETURA_RODOVIARIA_0.9.0.md`.
- `docs/ACESSIBILIDADE_NUCLEOS_0.9.0.md`.
- `RELATORIO_POLIMENTO_0.8.2.md`.
- `RELATORIO_CORRECAO_TITA_0.8.1.md`.
- `RELATORIO_EXPANSAO_0.8.0.md`.
- `RELATORIO_CORRECOES_CRITICAS.md`.
- `RELATORIO_TUTORIAL_ASSETS.md`.
- `docs/REFORMULACAO_REALISTA.md`.
- `docs/ROADMAP_APOS_0.8.0.md`.

Use `docs/PROMPT_MESTRE.md` para a especificação original e a lore, entendendo suas substituições posteriores. O direcionamento estilizado e a ordem antiga de começar pela Fase 1 foram superados. As fases antigas não devem ser repetidas.

Relatórios antigos descrevem seus próprios checkpoints. Afirmações históricas como “zero materiais instalados”, “garagem ainda não funcional”, “quatro caminhões apenas preparados” e “main permanece na 0.8.1” não representam a 0.10.0. Não apague o histórico para resolver essa diferença: consulte o código, os manifestos atuais e os registros mais recentes.

`CONFIG.phase = 4` e outros campos de fase legados não são o número da versão comercial nem prova de conclusão de todas as fases. Alguns valores de configuração também foram superados pelo fluxo real de `Game.start`; confira o uso antes de interpretar uma constante isolada.

## 3. Stack e execução

Preserve:

| Área | Implementação atual |
| --- | --- |
| Aplicação e backend | Next.js/App Router |
| Interface | React, HTML5 e CSS3 |
| Linguagem do jogo | JavaScript ES6+/módulos ES |
| Renderização | Three.js e WebGL |
| Física | `@dimforge/rapier3d-compat` |
| Veículos | `DynamicRayCastVehicleController` do Rapier |
| Persistência | libSQL/SQLite, com Turso na produção |
| API | Route Handlers REST/HTTP/JSON |
| Testes de lógica | Vitest |
| Testes de navegador | Playwright/Chromium |
| Preparação de imagens | Sharp |
| Preparação de modelos | Scripts e Blender/Python, fora do loop do jogo |

Versões instaladas verificadas nesta referência: Next 16.4.3, React/React DOM 19.3.1, Three 0.186.1, Rapier 0.21.0, libSQL client 0.18.0, Playwright 1.64.1, Vitest 5.0.5 e Sharp 0.35.5. O lockfile é a referência para instalação. O ambiente de implementação utilizou Node 24; confira compatibilidade antes de atualizar dependências.

Não introduzir TypeScript. Não substituir Three.js por Unity, Unreal, Babylon.js ou outro motor. Não migrar o jogo para outro projeto, gerador de sites ou aplicativo desktop. Consulte a documentação correspondente às versões reais, inclusive `node_modules/next/dist/docs/`, conforme `AGENTS.md`.

Comandos existentes:

```bash
npm ci
npm run dev
npm test
npm run build
npm run test:e2e
npm run db:migrate
npm run assets:polyhaven
npm run assets:import
npm run assets:inspect
```

No Windows existe `INICIAR_JOGO.bat`. Para desenvolvimento, o endereço usual é `http://localhost:3000` **no computador em que o servidor está rodando**. O localhost de um ambiente remoto não abre automaticamente no Windows de outra pessoa. Blender não é necessário para simplesmente jogar com os GLBs já preparados.

`npm start` usa o build de produção e exige configuração de produção apropriada. Não orientar alguém a usar um servidor de produção sem Turso configurado e depois atribuir os erros de save aos assets.

## 4. Lore, identidade e tom

Em 2027, fragmentos de asteroide desencadearam tempestades de plasma durante quase um ano. Cidades ruíram, o mar recuou, o solo ficou estéril e grande parte da eletrônica deixou de funcionar. Em 2047, vinte anos depois, comunidades isoladas tentam sobreviver.

A Rede Aurora contém sete Núcleos de Restauração blindados/subterrâneos. São ressonadores atmosféricos. Cada um depende do campo do anterior como âncora de fase e precisa de uma Semente de Ignição: um cilindro pesado contendo uma matriz de plasma sensível a choques e vibração.

Cada Núcleo possui um Cofre correspondente. A sobrevivente inicial já retirou a primeira Semente; obter as seguintes precede cada nova entrega. O arco jogável ocupa um continente, e a restauração deve se propagar além dele pela atmosfera ao completar a sequência.

Dante Rocha Negra é um caminhoneiro que sobreviveu ao desastre enquanto estava em um túnel. Vive em um barracão com o Titã Rocha Clara, seu caminhão diesel de 2003. Não deseja ser herói. A sobrevivente traz um mapa, uma Semente e uma razão para voltar à estrada.

Motores diesel mecânicos e rádio de ondas curtas são coerentes com a tecnologia sobrevivente. O navegador do caminhão utiliza mapas recuperados e posição estimada; não depende de um serviço externo de mapas nem pressupõe GPS global perfeito.

Preserve solidão, vulnerabilidade, melancolia, trabalho, teimosia e esperança. A principal experiência é sobreviver ao percurso e restaurar o mundo. Não transformar o projeto em um shooter ou em uma sequência de combates. O idioma atual é português do Brasil; textos estão em dados e componentes, e uma internacionalização futura precisa respeitar essa organização sem prometer que toda string já foi centralizada.

## 5. Personagens e narrativa existente

Personagens centrais que devem ser preservados:

- **Dante Rocha Negra:** protagonista.
- **Titã Rocha Clara:** companheiro e eixo emocional da jornada.
- **Dra. Renata Final Boss:** engenheira da Rede, orientando por rádio.
- **Mãe Ivani:** dona de uma parada importante, com comércio, descanso e informações.
- **Brutus, vulgo Garcia:** liderança de saqueadores prevista para um conflito moral mais completo; seu arco final não foi entregue.
- **A Voz:** presença misteriosa no rádio. Não revelar antecipadamente sua identidade ou transformar informações de bastidores em textos públicos do jogo.

Personagens e atendimentos já presentes incluem:

- Sobrevivente do Abrigo 07.
- Tomás, técnico do gerador do Núcleo 1.
- Zeca, no Posto Boa Viagem.
- Dona Marta, na Oficina do Cotovelo.
- Nilo, no posto de Cinza Nova.
- Lia, Afonso, Noêmia e Joel, nos abrigos e missões posteriores.
- Lurdes, Seu Gil, Cacá, Rute, Nando, Baiano, Tica e Valéria, nos estabelecimentos da estrada.

A presença de um personagem em diálogos, rádio ou planejamento narrativo não significa que ele já tenha um modelo físico e um arco completo. Renata e a Voz têm participação por rádio; a narrativa final de Brutus permanece pendente.

São protegidos os textos e relações estabelecidos em:

- `src/data/campaign.js`.
- `src/data/network.js`.
- `src/data/road.js`.
- `src/data/expedition.js`.

Não reescrever esses módulos para simplificar uma mudança visual, de UI ou de veículo. Rótulos funcionais novos podem ser aprimorados sem alterar falas ou consequências narrativas.

## 6. Histórico do desenvolvimento

| Marco | Entrega principal |
| --- | --- |
| 0.1 / Fase 1 original | Base jogável 3D, Titã procedural, estrada, física, controles e organização inicial |
| 0.2 / Fase 2 original | Primeira Semente, missão, entrega, integridade, ativação, restauração e persistência |
| 0.3 / Fase 3 original | Exploração a pé, inventários, sobrevivência, manutenção, comércio e pontos de apoio |
| 0.3.1 | Correção da saída do caminhão e recuperação confiável do controle |
| 0.4 | Cinco biomas, sete Núcleos/Cofres, missões secundárias e restauração por faixas |
| Estrada Viva / 0.4.1 e integração posterior | Tomás/gerador, postos, oficinas e emboscadas com perseguição e consequências |
| 0.5.0 | Reformulação da dirigibilidade: diesel, torque/RPM, transmissão, freios, direção, suspensão e câmeras |
| 0.5.1 | Pipeline de assets/PBR, importação local, carros abandonados e melhor correspondência entre terreno e estrada |
| 0.5.2 | Diálogos por falas, escolhas e navegação de painéis, legendas e apresentação narrativa |
| 0.6.0 | Tutorial opcional, modelos locais, personagens e integração de assets |
| 0.7.0 | Correções críticas de interação, personagem, calibração, progressão e regressões |
| 0.8.0 | Ambientação contextual, três POIs, estabelecimentos, ciclo solar e áudio ambiental |
| 0.8.1 | Correção dos materiais e da transparência estrutural do Titã |
| 0.8.2 | Cabine modular, acabamento do caminhão/personagens, Mar de Cinzas e diário de descobertas |
| 0.9.0 | Grafo rodoviário, Cinza Nova, rotas físicas alternativas, GPS/minimapa e revisão dos acessos |
| 0.9.1 | Correção do chão: orçamento de samplers e atualização dos uniforms na troca de qualidade |
| 0.10.0 | Garagem 3D funcional, pinturas, acessórios, melhorias mecânicas, frota persistente e segundo caminhão dirigível |

Não confundir os números dessas versões com a ordem das seis fases da reformulação realista. A expansão narrativa e os finais continuam incompletos, apesar de já ser possível percorrer os sete Núcleos.

## 7. Ciclo jogável atual

O ciclo existente é:

**Preparar → dirigir → escolher rota → parar → explorar → obter recursos → reparar/abastecer → obter Semente → transportar → estacionar → operar → restaurar → salvar/progredir.**

Novo jogo começa **a pé no barracão**, com tutorial opcional. O Titã está próximo, inicialmente com motor desligado. É possível explorar, entrar, dirigir, interagir com personagens e equipamentos, comprar, reparar, ativar Núcleos e salvar.

Os sistemas não são todos definitivos em qualidade artística ou profundidade. A campanha principal funciona como uma sequência de sete entregas/ancoragens; ainda não equivale a uma campanha narrativa finalizada com quatro desfechos.

## 8. Tutorial opcional de 21 objetivos

Existe um tutorial funcional, persistido em `campaign.tutorial`, que pode ser pulado e repetido sem recriar recompensas ou reiniciar a campanha. Preserve progressão parcial e retomada.

Os objetivos atuais são:

1. Caminhar pelo barracão.
2. Observar com o mouse.
3. Inspecionar ferramentas e caderno.
4. Entrar no Titã.
5. Observar instrumentos/câmera da cabine.
6. Ligar o motor.
7. Acelerar até 8 km/h.
8. Frear.
9. Fazer uma curva em baixa velocidade.
10. Manobrar em ré por 2 m.
11. Estacionar na área de treinamento.
12. Desligar o motor estacionado.
13. Descer e inspecionar o veículo.
14. Reparar um componente de verdade.
15. Conversar com a sobrevivente e receber a Semente.
16. Conferir inventário e integridade.
17. Planejar a rota.
18. Viajar pelo Mar de Cinzas.
19. Explorar a oficina abandonada.
20. Preparar o gerador do Núcleo 1.
21. Entregar e ativar o primeiro Núcleo.

Não bloquear seus corredores, objetos, saída do barracão, área de estacionamento ou alvos com decoração nova. A conclusão deve depender das ações reais do jogador, não de simplesmente avançar um contador.

## 9. Controles atuais

| Contexto | Comando | Função |
| --- | --- | --- |
| Caminhão | W | Acelerar/avançar; em ré, freia antes de retornar ao avanço |
| Caminhão | S | Frear; parado, manter para engatar ré com segurança |
| Caminhão | A / D | Esterçar |
| Caminhão | Espaço | Freio de estacionamento enquanto mantido pressionado |
| Caminhão | E | Ligar/desligar motor |
| Caminhão | C | Alternar câmeras |
| Caminhão | L | Faróis e projetores auxiliares equipados |
| Caminhão | F | Sair quando a velocidade permitir/interação contextual |
| Garagem | G | Abrir serviços no local e nas condições corretas |
| A pé | WASD | Movimento físico |
| A pé | Shift | Correr |
| A pé | Espaço | Pular |
| A pé | Clique/mouse | Pointer lock e olhar |
| A pé | C | Primeira/terceira pessoa |
| A pé | F | Interagir/entrar no caminhão/bancada |
| Geral | M | Mapa e planejamento de rotas |
| Geral | Tab | Inventário |
| Geral | V | Manutenção/inspeção |
| Geral | H | Expedição/sobrevivência |
| Geral | J | Caderno de missões e descobertas |
| Geral | R | Rádio |
| Geral | Esc | Pausa/voltar/liberar contexto conforme a situação |
| Câmera externa/garagem | Arrastar e roda do mouse | Órbita e zoom |
| Garagem | Setas laterais, +/− | Ajuste da câmera; Esc sai do serviço |

Para descer, pare, mantenha Espaço e use F. A política atual de saída exige velocidade de até aproximadamente 0,6 m/s e uma posição livre. Não voltar ao defeito em que F não produzia ação ou deixava o exterior oculto.

Remapeamento completo, suporte consistente a gamepad/volante, freio de estacionamento com opções de acessibilidade e controles completos por toque permanecem possibilidades de melhoria. Não declarar que já foram entregues. Celular foi usado como meio de continuar a conversa/projeto; isso não significa que o jogo esteja homologado para jogar por toque.

## 10. Física e condução implementadas

O movimento utiliza Rapier e suspensão por raycasts. Há passo fixo de 1/60 s, acumulador e interpolação visual. A API não controla o movimento por frame.

O conjunto já considera:

- Curva de torque diesel, marcha lenta, limite de RPM e resposta do acelerador.
- Potência e torque disponíveis, condição mecânica e temperatura.
- Marchas automáticas, neutro, ré, relações, diferencial e tempo de troca.
- Bloqueio de inversão brusca de sentido.
- Freio de serviço, estacionamento e freio de motor.
- Massa do chassi, Semente, suprimentos e combustível.
- Resistência ao rolamento, arrasto, aderência e inclinação física.
- Direção progressiva com limite por velocidade e geometria de esterçamento.
- Suspensão, compressão, amortecimento, rodas em contato e transferência visual do movimento.
- Desgaste, perda de desempenho e dano por impacto.

Há diferenças de piso para asfalto, asfalto danificado, cascalho, terra, areia, sal, lama, rocha, vidro e água. Não são somente diferenças de cor.

No Titã original, a curva atinge 1.600 Nm, a marcha lenta fica em 650 RPM e o limite em 2.400 RPM. A Semente adiciona 2.200 kg na simulação. Esses são parâmetros autorais do jogo, não especificação certificada de um veículo comercial.

Não substituir forças por uma velocidade fixa adicionada a cada frame. Não mascarar um problema de terreno/collider aumentando torque, freio ou massa. Preservar o comportamento do Titã sem upgrades; ajustes futuros precisam de motivo, comparação e testes.

Transmissão manual detalhada, embreagem completa, diferenciais/bloqueios, controle de tração avançado, deformação e danos destacáveis extensos são expansões possíveis, não sistemas já concluídos.

## 11. Caminhões realmente dirigíveis

| Característica-base | Titã Rocha Clara | Basculante Municipal |
| --- | --- | --- |
| ID | `titan-old` | `dump-truck` |
| Massa do chassi | 8.800 kg | 6.500 kg |
| Torque máximo-base | 1.600 Nm | 1.050 Nm |
| Marchas à frente | 8 | 6 |
| Rodas físicas/visuais configuradas | 6 | 6 |
| Raio de roda | 0,61 m | 0,547 m |
| Entre-eixos usado no modelo | 4,675 m | 3,982 m |
| Capacidade nominal da carga | 6.000 kg | 3.200 kg |
| Tanque-base | 180 L | 180 L |

São dois veículos com parâmetros e montagem próprios. A capacidade nominal da carga não deve ser confundida com o limite de 240 kg do inventário de suprimentos. Contratos de carga volumosa ainda não estão implementados. Também não há um sistema completo de carretas articuladas, acoplamento/desacoplamento e física de conjuntos rodoviários; isso exige uma expansão própria, além de trocar uma malha visual.

O Titã utiliza o modelo de Alt/whisper.alt, com adaptação, seis pivôs e materiais corrigidos. O basculante deriva do modelo local de ElectroNick. Seu arquivo original foi preservado; `drivable.glb` separa seis conjuntos originais de rodas, corrige orientação para −Z, centraliza, organiza pivôs/cabine e usa física própria.

O basculante pode ser recuperado por **8 peças + 4 materiais/sucata**. Chega com tanque e inventário vazios, sem combustível ou recursos concedidos. É necessário abastecê-lo para sair dirigindo. O Titã permanece disponível; não existe venda que permita perdê-lo.

### Três candidatos ainda não dirigíveis

- `semi-1960`: orientação e largura de aproximadamente 8,2 m no preparo atual precisam de revisão, além de rig/cabine; cerca de 134 mil triângulos.
- `semi-baked`: largura próxima de 3,89 m, adaptação de cabine, pivôs e comportamento pendentes; cerca de 40 mil triângulos.
- `tatra-815`: largura próxima de 3,59 m, subpeças/rig/cabine e otimização pendentes; cerca de 130 mil triângulos.

Os valores são da auditoria dos arquivos preparados, não dimensões finais homologadas. Não copiar os seis pontos do Titã automaticamente para qualquer modelo. Auditar número de eixos, rodas, bitola, orientação, centro de massa, colisores, cabine, animação e desempenho.

**Particularidade do manifesto:** `candidates['dump-truck']` ainda guarda a fonte original preparada, enquanto `trucks['dump-truck']` aponta para a adaptação dirigível. Não confundir a descrição histórica da fonte com o estado instalado do veículo ativo. A normalização dessa informação é uma melhoria documental possível.

## 12. Titã: exterior, cabine e correção de transparência

O caminhão não é mais apenas o conjunto procedural original. O exterior importado tem pintura, metal, borracha, vidro e lentes separados, rodas vinculadas à física e acabamento complementar.

A correção 0.8.1 separou o material BLEND único do GLB por função, mantendo dados geométricos, UVs, texturas e pivôs. Sólidos permanecem opacos e escrevem profundidade; vidros/lentes têm comportamento próprio. Não aplicar `transparent: false` indiscriminadamente a todos os materiais e não restaurar o material único defeituoso.

Na câmera interna, somente a cabine importada sobreposta é ocultada. Baú, chassi e rodas permanecem. A condição deve considerar o contexto de direção; ao sair por F, o exterior precisa reaparecer corretamente.

A cabine modular inclui bancos moldados, encostos, costuras/cintos, portas e bolsos, maçanetas, coluna e volante, pedais, alavanca, console, ventilação, rádio, compartimentos, para-brisa, borrachas, limpadores, retrovisores e objetos de viagem.

Velocidade, RPM, combustível, temperatura, marcha e indicadores de motor, estacionamento, faróis e superaquecimento refletem a simulação. Não criar mostradores fictícios.

Há detalhes externos adicionais como degraus, fixações, reservatórios, mangueiras, ferragens e escapamento. A fumaça acompanha o tubo. Faróis são funcionais.

Limitações a preservar como pendências honestas:

- Retrovisores ainda não oferecem imagem traseira dinâmica.
- O interior continua uma adaptação modular, inclusive no segundo caminhão.
- Mãos/pés não possuem contato perfeito por IK com volante, pedais e escadas.
- Não há sequência completa de subir/descer com porta articulada e contatos em todos os apoios.
- Arte específica de cada cabine, desgaste mais refinado, reflexos e animações podem evoluir.

## 13. Garagem funcional da 0.10.0

A garagem municipal existente em Cinza Nova foi ativada como estabelecimento. Não foi criada outra cidade nem um showroom desconectado do mundo.

Fluxo:

1. Abrir M e selecionar Garagem municipal.
2. Seguir a rede até Cinza Nova.
3. Entrar no pátio e manobrar até a faixa interna.
4. Parar completamente e desligar com E.
5. Abrir com G, ou atender pela bancada com F a pé.
6. Ver, personalizar, reparar ou trocar o caminhão.
7. Confirmar as alterações, sair e continuar dirigindo.

O GPS conduz ao acesso/pátio. A manobra final percorre aproximadamente 34 m sobre o piso existente do galpão. Não há teleporte para colocá-lo no serviço.

A zona de serviço fica aproximadamente em x=−320, z=−814; a bancada em x=−326, z=−806. A abertura exige caminhão dentro da faixa, motor desligado e velocidade muito baixa, em torno de 0,2 m/s. A pé também é necessária proximidade da bancada.

A apresentação utiliza o mesmo canvas, cena/renderizador e loop, com órbita, zoom e vistas de frente, lado, traseira e cabine. A câmera respeita colisões. O relógio e a simulação pausam durante o serviço; o áudio ambiental da oficina pode continuar. O HUD de direção não fica sobreposto aos controles da garagem.

### Pinturas e interior

- **Titã Original:** preserva o mapa e a identidade original por padrão.
- **Aurora Azul:** paleta azul e faixa clara; compra inicial de 2 sucatas.
- **Cinzas Vermelhas:** paleta vermelha, áreas/faixas contrastantes; compra inicial de 3 sucatas.
- Cores principal/secundária, acabamento e desgaste ajustáveis.
- Alterações são aplicadas a cópias dos materiais de pintura, sem tingir pneus, vidro ou todos os metais.
- Os padrões acompanham as coordenadas locais do caminhão em movimento.
- A prévia não cobra nem instala definitivamente; cancelar restaura o instalado.
- Skins adquiridas podem ser reinstaladas. Personalização adicional pode cobrar trabalho, conforme a cotação real.
- Interior oferece cores de bancos/painel e duas paletas, reutilizando texturas e geometria existentes.
- Preferências da câmera de serviço são persistidas.

### Acessórios atuais

| Equipamento | Custo inicial | Comportamento |
| --- | --- | --- |
| Proteção tubular frontal | 2 sucatas | Peça 3D com fixação; não aumenta o colisor |
| Faróis auxiliares | 2 sucatas + 1 peça | Dois projetores vinculados a L; sem sombras extras |
| Suporte de manutenção | 1 sucata + 1 peça | Suporte lateral com recipiente vazio; não concede recursos |

### Melhorias mecânicas atuais

| Melhoria | Custo | Efeito real e contrapartida |
| --- | --- | --- |
| Ajuste da bomba diesel | 3 peças | Curva de torque/limite do eixo +12%; consumo específico +5% |
| Pneus de terra | 2 peças + 1 sucata | Aderência em terra +18%, lama +15%; rolamento no asfalto +10% |
| Molas reforçadas | 2 peças | Rigidez +18%, compressão +10%; rodagem mais firme sem carga |

Novos pacotes de transmissão, refrigeração, tanque e capacidade ainda não foram entregues. Não apresentar a lista de possibilidades do pedido original como catálogo implementado.

## 14. Frota, transações e prevenção de duplicação

O estado opcional `campaign.fleet` versão 1 conserva o veículo ativo e registros próprios para cada caminhão. Cada registro inclui pintura, interior, propriedade/equipamento, upgrades, componentes, inventário, combustível e temperatura.

Os sistemas antigos continuam usando `campaign.components`, `campaign.inventory.truck` e o estado de combustível do jogo para o veículo ativo. `captureFleet` espelha esse estado ao salvar. Preserve essa compatibilidade; não criar duas fontes divergentes de verdade.

A troca guarda o veículo anterior e restaura o escolhido. A Semente continua sendo a carga única da campanha e seu berço visual acompanha o veículo. Não copiar Sementes, recursos, missões ou recompensas para cada registro da frota.

Compras usam os recursos já acessíveis da mochila e do caminhão ativo. Não existe moeda nova nem concessionária com dinheiro fictício. A aquisição de equipamentos não concede diesel nem suprimentos.

A confirmação é protegida contra cliques duplicados, valida custo/propriedade/capacidade, grava no slot e desfaz o estado local se falhar. Troca de modelo/corpo prepara a nova montagem antes de descartar a antiga; mantém rollback até a gravação concluir. Prévia não cria outro veículo físico ativo.

Preserve o objeto raiz de campanha durante rollback, pois controladores como o tutorial mantêm referências a ele. Não liberar geometrias/texturas compartilhadas do cache quando descartar uma instância.

Saves sem frota recebem somente o Titã com os recursos e danos reais anteriores. Não premiar uma migração com um caminhão novo, tanque cheio ou peças.

## 15. Dante, exploração e NPCs 3D

Dante possui controlador físico Rapier, duas perspectivas e modelo humano animado. Caminhada, corrida, pulo e interação seguem colisões e terreno. Animação não deve deslocar o jogador de forma independente do corpo físico.

O modelo humano local usa uma base MakeHuman CC0, com roupa/rig/clips próprios. Há Idle, Walk, Run, Interact, Repair, Enter e Exit. A arte é provisória/adaptada, não uma identidade facial fotorealista definitiva.

Personagens importantes receberam diferenças de silhueta/equipamento:

- Dante: jaqueta de trabalho, mochila, barba, boné e botas.
- Zeca: colete, boné, óculos, bolsos e rádio.
- Tomás: avental, ferramentas, proteção visual/auricular.
- Mãe Ivani: lenço, xale, avental longo e óculos.
- Sobrevivente: capuz, cachecol, casaco remendado e mochila.
- Dona Marta: macacão, cabelo preso, óculos e cinto de ferramentas.

A base anatômica continua compartilhada. Outros atendentes usam variações de trabalho/comércio/viagem. Não chamar todos os personagens de arte final individualizada.

Há gestos, olhar, postura e reação leve à conversa, não um sistema completo de rotinas com deslocamento e horários. A pose sentada do motorista deve ser restaurada antes do mixer para não deixar membros dobrados ao sair.

A exploração não é irrestrita por todo o continente: existe raio de aproximadamente 24 m junto ao veículo, zonas de estabelecimentos/Núcleos/POIs e uma área ampliada na cidade. Preservar retorno de saves antigos fora desses limites. Uma expansão da exploração precisa rever política, streaming, colisões e objetivos.

Interações usam seleção contextual, proximidade e visibilidade/linha de visão, com alvos individuais. Não permitir conversar através de paredes, selecionar todos os NPCs por um painel genérico ou interceptar F com o controlador errado.

## 16. Recursos, sobrevivência e manutenção

Recursos atuais: diesel, água, comida, peças mecânicas e materiais recuperados/sucata.

- Mochila: limite de peso de 40 kg.
- Compartimento de suprimentos do caminhão: 240 kg.
- Transferência entre os dois quando acessíveis.
- Coleta finita, comércio com estoques locais e custos reais.
- Abastecimento por recipientes e bombas, com limites de tanque e motor desligado conforme o serviço.
- Água para beber e para manutenção do radiador.
- Comida para saciedade e descanso.

Hidratação, saciedade e fadiga são persistidas. Consumo corporal é gradual durante a viagem; menus e paradas não devem drenar recursos artificialmente. Esgotamento reduz vigor gradualmente. Não há uma simulação médica completa com todos os sistemas de ferimentos/enfermidades imagináveis.

Oito componentes têm condição de 0 a 100: motor, radiador, pneus, suspensão, transmissão, tanque, filtros e estrutura. Seus estados afetam potência, aderência, temperatura, vazamento, vibração e funcionamento. Há reparo de campo, conserto completo e serviços de oficina.

Na partida de referência, o tanque começa com 4 L; a mochila possui 8 L em recipientes, água, comida, 10 peças e 8 sucatas; o compartimento traz 2 peças. O estado inicial é intencionalmente desgastado. Não confundir o valor legado `initialFuel: 140` em configuração com o fluxo efetivo de novo jogo.

Não tratar acessórios decorativos como armazenamento gratuito. Melhorias de tanque/capacidade precisam rever todos os limites, massas, transferências, validação e persistência.

## 17. Campanha: Sementes, Cofres e Núcleos

Existe uma sequência funcional de sete Núcleos, com Cofres correspondentes. A abertura de um Cofre é uma transação, depende da sequência anterior e não se repete. Cada Semente tem integridade, estado e vínculo com a carga atual.

| Ordem | Núcleo | Região | Referência no eixo legado | Obtenção da Semente |
| --- | --- | --- | --- | --- |
| 1 | A primeira faixa | Mar de Cinzas | km 2,89 | Sobrevivente do Abrigo 07 já retirou do Cofre 1 |
| 2 | Viaduto | Cidades Esqueleto | km 7,20 | Cofre 2 próximo ao km 6,15; 1 peça |
| 3 | As janelas vazias | Cidades Esqueleto | km 9,50 | Cofre 3 próximo ao km 8,05; 2 peças |
| 4 | Mar ausente | Leito Seco | km 12,00 | Cofre 4 próximo ao km 10,50; 2 águas + 1 peça |
| 5 | Passo de vidro | Cordilheira Vítrea | km 14,40 | Cofre 5 próximo ao km 13,10; 4 materiais |
| 6 | Acima das nuvens | Cordilheira Vítrea | km 16,80 | Cofre 6 próximo ao km 15,30; 3 peças |
| 7 | Horizonte | Zonas de Tempestade | km 20,10 | Cofre 7 próximo ao km 18,20; 2 peças + 2 águas e preparo mecânico |

Esses quilômetros são referências do eixo original, não a distância exata de uma rota do grafo atual. Use o GPS/rede e os dados atuais para o percurso físico.

O Cofre 7 exige radiador e filtros em pelo menos 50% e transmissão em pelo menos 40%. Não contornar a preparação com um botão que entrega a carga gratuitamente.

A Semente sofre com colisão, vibração e frenagens. Calibração utiliza 2 peças acessíveis e recupera 20 pontos percentuais de integridade, respeitando proximidade do terminal, estacionamento, motor e estado da carga. Pagamento parcial não pode ser removido quando a operação é inválida.

A chance de ativação deriva da integridade e é mostrada ao jogador. Atualmente, integridade a partir de 80 já garante a chance máxima; não inventar exigência absoluta de 100% se a regra real não exige. A falha é recuperável com calibração e nova tentativa.

### Primeira entrega e gerador

Receber a Semente → preparar o caminhão → planejar rota → dirigir → estacionar → falar com Tomás → ligar o gerador com **4 L de diesel + 1 peça** → ir ao terminal → calibrar se necessário → ativar → observar restauração → salvar.

Tomás possui pacote de recompensa único após a ativação. Gerador, terminal e NPC são alvos distintos. Não confundir os serviços com um único objeto genérico.

### Estado atual após o sétimo Núcleo

O jogo registra os sete campos ancorados e a resposta do continente. **Isso não executa os quatro finais planejados.** Flags preparatórias não equivalem a desfechos completos.

## 18. Missões secundárias, comércio e saqueadores

Três missões secundárias posteriores estão implementadas:

| Missão | Personagem | Custo | Consequência/recompensa |
| --- | --- | --- | --- |
| Água para as janelas | Lia | 2 águas + 1 comida da mochila | Peças/materiais; Lia reaparece na Última Parada |
| O que o sal guardou | Afonso | 3 peças do caminhão | Água/materiais e melhor aderência na crosta |
| Um aviso antes do vento | Noêmia | 2 peças + 2 materiais do caminhão | Diesel/comida, repetidor e fragmento do sinal |

Existem aceitação/adiamento/conclusão, custos, recompensas e persistência. Não criar uma segunda missão com a mesma recompensa para representar o mesmo evento.

Postos e oficinas têm atendentes próprios, estoque limitado e transações. Há serviços de revisão, compra de peças, combustível/água e trocas. A economia é básica, com preços/custos definidos; não existe economia dinâmica completa por demanda, região, reputação e restauração.

Também existem **sete emboscadas configuradas** da Estrada Viva. Saqueadores esperam, perseguem, tentam se aproximar/agarrar e podem roubar fração dos suprimentos. Há fuga, desistência, abalroamento e estados persistidos. Isso não equivale ao arco narrativo de Brutus, a facções completas ou a um sistema geral de eventos aleatórios.

Melhoria a auditar: a IA das emboscadas ainda contém medidas fixas do caminhão e preparação por `roadX(z)`. Rever sua adequação ao basculante, a curvas, à rede e a obstáculos. A presença desse código não prova navegação física perfeita dos inimigos em todas as ruas.

## 19. Mundo e cinco biomas

O continente original usa escala condensada de aproximadamente 21 km no eixo longitudinal. A rede atual acrescenta ramificações e ligações; 21 km não é o somatório preciso de todas as vias.

| Região | Conteúdo/mecânicas existentes | Refinamentos ainda desejáveis |
| --- | --- | --- |
| Mar de Cinzas | Barracão, abrigos, postos/oficinas, POIs, cinzas, filtros, bloqueios e rotas | Melhor acabamento autoral, identidade dos trechos, interiores e exploração |
| Cidades Esqueleto | Ruínas, viaduto interrompido, túnel alagado, dois Núcleos | Mais bairros dirigíveis, fachadas/interiores, passagens e história ambiental |
| Leito Seco | Sal, calor, crosta instável, estruturas do oceano ausente | Portos/píeres/barcos/equipamentos e navegação visual mais rica |
| Cordilheira Vítrea | Rampas, rocha lisa, aderência reduzida, desgaste, dois Núcleos | Montanhas, pontes, instalações e curvas com melhor composição |
| Zonas de Tempestade | Frente residual, interferência, vento, bloqueio e preparação | Anomalias, torres/monitoramento e variedade de situações |

O trecho de sal inicial dos saves antigos foi preservado; a progressão principal dos Núcleos segue a ordem dos dados da campanha. Não reorganizar toda a geografia de uma vez.

As cinco regiões existem e têm diferenças funcionais, mas não possuem o mesmo nível de acabamento artístico. O Mar de Cinzas recebeu mais trabalho; não afirmar que o continente inteiro foi reconstruído no padrão da cidade piloto.

## 20. Estradas, cidade piloto e acessibilidade

A 0.9.0 evoluiu a dependência exclusiva de `roadX(z)` para um grafo rodoviário, com segmentos conectados, curvas suaves, largura, superfície, risco, inclinação, bloqueios e desbloqueios.

Dados/amostras compartilhados alimentam geometria visual, terreno e colisões. Existem rodovias, vias urbanas, acessos, alças pavimentadas e alternativas de terra. Funções legadas continuam exportadas para compatibilidade.

**Cinza Nova** é a cidade piloto dirigível no Mar de Cinzas. Tem entrada/saída, ruas de aproximadamente 14 m, cruzamentos largos, moradias, comércio, área industrial, posto de Nilo, espaços de estacionamento e garagem municipal. Fachadas, calçadas/passagens, placas, postes, contêineres e mobiliário compõem uma comunidade pós-apocalíptica pequena. Não é uma cidade gigantesca nem um sistema de várias cidades completas.

Existem ao menos duas possibilidades físicas de trajeto no piloto: rodovia/alça pavimentada e caminho urbano/Vale/terra. Distância, piso, dificuldade e custo diferem. Escolher no mapa muda o caminho, não teleporta o jogador.

Os sete Núcleos e sete Cofres receberam aproximações, estacionamento e conexão. A auditoria registrada aprovou **14/14 acessos físicos locais** com direção, parada, saída a pé, interação e retorno. As fixtures representam estados válidos em cada local; não afirmar que isso foi uma única viagem humana pelo continente.

Não mover apenas a malha de um equipamento e deixar interação/collider em outro lugar. Preserve espaço de manobra, rotas a pé, saídas seguras e sequência da campanha.

Ponto técnico essencial: malhas fixas de piso em `World`/`PropBatch` devem continuar com densidade zero. Massa inferida de um trimesh aberto já provocou falha de frenagem. Não compensar esse problema alterando a física do Titã.

## 21. GPS, minimapa e planejamento

O planejador usa Dijkstra sobre a rede real. Há perfis rápido, seguro e econômico, destinos, trechos bloqueados e desvios, além de recálculo quando o jogador se afasta.

O HUD mostra caminhão/orientação, vias próximas, rota ativa, destino, distância e próxima conversão. O minimapa pode ser compacto, ampliado ou oculto. A pé, destaca objetivos e interações próximos. M seleciona destinos e mostra estimativas de distância, tempo, combustível, piso e risco.

As instruções são derivadas da geometria da rota, não apenas mensagens fixas por quilômetro. A interface representa navegação reconstruída/mapas armazenados e posição estimada, sem API externa de GPS.

**Limite atual importante:** a estimativa de combustível/tempo é uma heurística baseada em segmento, piso, inclinação e massa. Não é uma reprodução da simulação completa do motor de cada caminhão. Uma melhoria prioritária é calibrá-la com os perfis e upgrades da frota, sem prometer precisão já existente.

O GPS continuar operando após a troca foi testado; isso não elimina a necessidade de melhorar essas estimativas. Navegação de interiores, voz de navegação, tráfego e regras urbanas completas não foram entregues.

## 22. Ambientação, estabelecimentos e POIs

Há decoração contextual por região, tipo de local, terreno e restauração, com seeds determinísticas e reservas para vias, interações, NPCs e estacionamento. Composições contam pequenas histórias; nem todo objeto é coletável.

O barracão recebeu moradia, cama, mesa/caderno, utensílios, ferramentas, prateleiras, peças, materiais de trabalho e luz de tarefa. Posto Boa Viagem e Oficina do Cotovelo possuem mais equipamentos e interior/acesso físico. Abrigos apresentam descanso, trabalho e presença humana.

Três POIs da expansão são funcionais:

| Local | Referência | Ação persistente |
| --- | --- | --- |
| Motel Última Luz | km 0,38 | Explorar e recolher uma reserva limitada de água/comida |
| Pátio dos Retornantes | km 2,02 | Explorar e recolher peças/materiais uma vez |
| Balança Rodoviária 07 | km 2,46 | Registrar boletim de acesso; não gera recompensa infinita |

Existem ainda a oficina abandonada, posto de Mãe Ivani, estação meteorológica, depósitos de viagem, abrigos e estabelecimentos da campanha.

O caminhão parado no pátio é cenário. Não confundir sua presença com outro veículo disponível para dirigir.

Ferro-velho e depósito de suprimentos como novos POIs completos, muitos interiores urbanos e atividades ambientais mais profundas continuam como oportunidades. Não anunciar os cinco POIs sugeridos em pedidos antigos como entregues só porque três foram construídos.

## 23. Diário, mapa de descobertas e apresentação

O caderno J reúne missões e **Descobertas da estrada**, derivadas de estados já salvos. Registra visita a pé, reserva recolhida, boletim, parada e Núcleo restaurado, com entradas únicas e sem pagar recursos automaticamente.

Passar de caminhão pelo exterior, estar no teto ou possuir uma coordenada não deve contar como exploração interna de um POI. Não criar outro sistema de missões ou timestamps inventados para representar os mesmos registros.

O menu inicial já possui cena 3D cinematográfica. Os diálogos têm composição por falas, interlocutor, avanço/revelação de texto, escolhas e enquadramento de conversa. Há foco/navegação por teclado, pausa, retorno do controle e escala de legendas. A hierarquia do HUD e o aviso de salvamento foram refinados para não cobrir o minimapa.

Configurações existentes incluem qualidade, escala de renderização, volume, legendas e seu tamanho, sensibilidade da direção, distância da câmera, movimento da cabine, perspectiva a pé e duração do dia.

Melhorar legibilidade, responsividade, foco, contraste, organização e acessibilidade sem transformar o jogo em painel administrativo nem cobrir o para-brisa com widgets. Não reconstruir menu/diálogo para apresentar uma mudança pequena.

## 24. Materiais, texturas e iluminação

Existem **oito materiais Poly Haven realmente instalados**, com arquivos locais e manifesto:

1. `road_damaged_2` — asfalto danificado.
2. `gravel_road` — cascalho/acostamentos.
3. `mud_cracked_dry_03` — solo rachado.
4. `dirt` — terra e trilhas.
5. `rocky_terrain_03` — rocha/terreno.
6. `rusty_metal_05` — ferrugem.
7. `rust_coarse_01` — metal envelhecido.
8. `corrugated_iron` — telhados/chapas.

Os arquivos ficam em `public/assets/polyhaven/`; o jogo não baixa materiais do Poly Haven a cada partida. O manifesto indica preparação-base 2K e variantes por perfil. Não voltar ao manifesto vazio.

Há mapas de cor, normal OpenGL e ARM. ARM utiliza **R=AO, G=roughness, B=metalness**. Cor usa sRGB; mapas de dados não são tratados como cor. Preserve UVs, escala métrica, repetição, anisotropia e vínculo de materiais emprestando mapas.

A mistura de terreno considera relevo, inclinação, região e proximidade das vias. Height/displacement não deve deformar só o visual e deixar a física plana; a biblioteca atual mantém esse mapa fora dessa aplicação até haver correspondência apropriada.

Papéis de material como madeira, couro, concreto, tijolo e outros aparecem no catálogo, mas isso **não prova que os respectivos mapas externos estejam instalados**. Existem fallbacks e detalhes procedurais originais. Consulte o manifesto em vez de inferir pelo nome usado no código.

Há luz solar, sombras por perfil, exposição/tone mapping e gerenciamento de cor. Iluminação ambiental/IBL utiliza recursos procedurais onde configurados; não declarar um HDRI externo instalado se não houver arquivo e integração.

A direção artística vigente é **realismo ambiental de simulador**, substituindo o antigo objetivo estilizado. Ainda existe geometria procedural e arte provisória; a intenção realista não significa que toda a cena seja arte final fotorealista.

## 25. Duas correções gráficas que não podem regredir

### Terreno escuro por atributo ausente — 0.8.2

O material usava `vertexColors` sem o atributo `color`. `groundColors` fornece o atributo correto e recupera o albedo PBR, sem trocar a geometria física. Não resolver esse defeito alterando toda a altura do terreno ou sobrepondo uma textura para esconder o problema.

### Chão ausente por excesso de samplers — 0.9.1

Na qualidade Alta, nove samplers adicionais com os mapas/iluminação do material podiam totalizar 17, excedendo o mínimo WebGL2 de 16. O shader passou a respeitar `renderer.capabilities.maxTextures`.

Também foi corrigida a atualização dos uniforms ao alternar qualidade com programas Three reutilizados. Slots devem apontar às texturas vivas; `pruneTextures` não pode descartar variantes ainda referenciadas por uniforms antigos.

Preserve `TerrainBlend.js` e o gerenciamento correspondente em `PBRLibrary.js`. Não substituir essa correção por desativar todo o PBR. Testar Baixo → Médio → Alto → Baixo e caminhos de capacidade de textura distintos. O diagnóstico expõe `terrainTextureBudget`.

SwiftShader oferecia 32 unidades; selecionar o ramo de 16 e inspecionar pixels não emula todos os drivers Windows. A confirmação com a GPU real do usuário permanece necessária.

## 26. Dia/noite, clima e restauração

O relógio persistente oferece dias de 24, 48 ou 96 minutos de simulação ativa, com transições entre amanhecer, manhã, tarde, entardecer e noite. Modifica céu, sol, luz ambiente, sombras, visibilidade e iluminação local. Menus/serviços pausam a progressão.

Faróis e luzes de estabelecimentos têm importância à noite, com limite de luzes locais para controlar o custo. O mundo não deve ficar impraticável de enxergar.

Há poeira/cinzas, neblina, calor, vento, chuva em áreas restauradas e frente de plasma residual. A frente posterior alterna aproximadamente 65 s de atividade e 55 s de calmaria no relógio da simulação, com interferência/bloqueio e restauração influenciando o estado.

A ativação altera regiões/faixas: vegetação, chuva, atmosfera/terreno, barreiras e drenagem de túnel. As duas ancoragens urbanas e as duas da cordilheira têm estados separados; a região completa depende de ambas. Sobreviventes e rádio reagem a eventos, e o estado persiste.

Essas transformações são reais, mas ainda podem ganhar transições melhores, mais espécies, erosão, ecossistemas e consequências prolongadas. Não existe simulação biológica/econômica completa do planeta.

## 27. Áudio

O motor utiliza Web Audio procedural ligado ao funcionamento, RPM, aceleração, transmissão e freio de motor. O ambiente utiliza síntese original para vento, chuva, ruídos mecânicos/interiores, geradores, ferramentas, passos e transições locais.

O rádio de ondas curtas utiliza a identidade do canal Aurora, frequência 7.047 MHz, com boletins, interferência e transmissões narrativas. Isso não é dublagem gravada completa dos personagens.

O sistema trabalha com o AudioContext/ciclo existente e espacialização onde aplicável. A garagem foi integrada como oficina/interior, sem substituir o motor nem adicionar outro loop.

Não foram entregues gravações profissionais de diesel, dublagem completa, música final ou uma biblioteca externa de som. Audição humana, equilíbrio, repetição, timbre, mixagem de cabine/exterior e diversidade são melhorias pendentes. Qualquer arquivo sonoro externo exige licença e procedência verificadas.

## 28. Saves, migração, API e uso em outro computador

Existem três slots, schema atual de partida 3 e migrações de saves 1/2. Campos mais recentes de tutorial, relógio, navegação, revisão geográfica e frota têm validação/compatibilidade apropriada.

São persistidos, conforme o sistema:

- Posições de Dante e caminhão, contexto e orientação do veículo.
- Combustível, temperatura, motor, componentes e inventários.
- Semente atual, integridades, Cofres e Núcleos.
- Missões, decisões, flags, estoques, coletas e recompensas únicas.
- Clima/relógio/restauração e descobertas.
- Destino, preferências de rota e migração geográfica.
- Frota, propriedades, configurações e estados individuais.

O banco é acessado somente por `src/lib/repository.js`. Desenvolvimento usa `file:local.db`; produção requer Turso e `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN`. Nunca publicar credenciais. Existe identidade anônima por cookie HttpOnly/SameSite, isolamento por jogador e revisão do slot para evitar sobrescrita concorrente. `SAVE_COOKIE_SECRET` permite assinatura da identidade e precisa ser tratado como segredo quando configurado.

Endpoints existentes:

- `GET/POST /api/saves`.
- `GET/PUT/DELETE /api/saves/[slot]`.
- `/api/game/config`.
- `/api/game/items`.
- `/api/game/missions`.
- `/api/world/regions`.

Há validação de estrutura, limites, sequência e estoque, limite de corpo JSON de 128 KiB e proteção de origem nas operações pertinentes. Não remover essas regras para aceitar um save novo incoerente.

A migração geográfica da 0.9.0 recupera posições antigas para locais seguros próximos, de modo determinístico, idempotente e registrado, sem jogar silenciosamente o usuário no início ou conceder itens. Atualizar esse mecanismo se a geografia mudar.

**GitHub sincroniza o projeto, não a partida.** Sem um sistema de conta/sincronização implementado, trocar de navegador/computador não garante recuperar a mesma identidade/cookie. No ambiente local, também é preciso preservar o banco. Exportação/importação amigável e sincronização por conta são possibilidades futuras, não funcionalidades que devam ser anunciadas como prontas.

Publicação Vercel bem-sucedida não comprova configuração funcional de Turso nem um roundtrip de save em produção. O reinício validado da 0.10.0 foi libSQL/SQLite local.

## 29. Assets locais, direitos e pendências de importação

Além dos oito Poly Haven CC0, há:

| Asset | Origem/licença | Uso atual |
| --- | --- | --- |
| Titã importado | Alt/whisper.alt, CC BY 4.0 | Veículo inicial, com adaptações e créditos |
| Basculante | ElectroNick, CC BY 4.0 | Fonte preservada, derivado dirigível e uso de cenário |
| Garagem antiga | Yury Misiyuk, CC BY 4.0 | Modelo local com abertura física preparada |
| Posto abandonado | SURVIVED, CC BY 4.0 | Modelo ambiental local |
| Barril enferrujado | mxtc, CC BY 4.0 | Cenário |
| Carros abandonados | Renafox, CC BY-NC 4.0 | Três modelos, desenvolvimento não comercial |
| Base humana | MakeHuman CC0, com trabalho autoral adaptado | Dante/NPCs, rig e animações provisórias |
| semi-1960 / semi-baked / tatra-815 | Créditos CC BY registrados por modelo | Preparados, ainda não dirigíveis |

Referências: `public/assets/CREDITOS.txt`, `public/assets/models/manifest.json`, licenças junto aos modelos e arquivos de origem/preparação.

Não declarar o projeto inteiro liberado para comercialização. Os carros NC exigem substituição ou direitos compatíveis para uma distribuição comercial. “Rights cleared” para desenvolvimento não elimina restrições de uma licença NC.

O pacote City People/Fab não foi integrado/distribuído porque a licença não foi esclarecida. Não supor licença Fab Standard ou CC BY. O Saia LTL inspecionado tinha restrições ND e complexidade alta; não foi tratado como caminhão adaptável entregue. GAZ/LP/Peterbilt e outros pedidos anteriores não devem ser anunciados como instalados sem prova atual.

Vários ZIPs enviados pelo usuário não puderam ser transferidos pelo limite de 32 MiB. Os seis conjuntos extras grandes e nomes de materiais em fallback não equivalem a arquivos aplicados. Reinspecione os arquivos efetivamente disponíveis antes de retomar importações.

O Poly Haven foi bloqueado por HTTP 403 no ambiente de execução anterior; os oito materiais atuais foram integrados localmente. Utilize downloader oficial ou importer offline. Não contornar políticas de rede nem inventar URLs de download.

Fluxo de material novo: conferir origem/licença → obter arquivos reais → validar tamanho/hash/dimensões/canais → preparar resoluções → atualizar manifesto somente quando completo → aplicar → conferir em jogo → verificar cache/descarte → registrar créditos e evidências.

## 30. Arquitetura: onde continuar

| Responsabilidade | Arquivos/pastas principais |
| --- | --- |
| Orquestração e loop | `src/game/core/Game.js`, `FixedLoop.js`, `diagnosticSteps.js` |
| Input/contextos | `src/game/input/Input.js` |
| Render/câmeras | `src/game/render/SceneRenderer.js`, `Cameras.js`, `ConversationCamera.js`, `MenuScene.js`, `cameraCollision.js` |
| Tempo/luz | `render/DayNight.js`, `world/dayClock.js`, `world/worldProgress.js` |
| Materiais | `render/PBRLibrary.js`, `TerrainBlend.js`, `materials.js`, `groundColors.js`, `metricUV.js` |
| Assets/cache | `src/game/assets/AssetManager.js` |
| Física de veículo | `src/game/physics/VehiclePhysics.js` |
| Motor/transmissão | `src/game/vehicle/Engine.js`, `AutomaticTransmission.js`, `Powertrain.js`, `src/data/truck-tuning.js` |
| Caminhão/cabine | `vehicle/model.js`, `TruckVisual.js`, `truckMaterials.js`, `TruckFinish.js`, `CabinInterior.js`, `Instruments.js` |
| Garagem/frota | `src/game/garage/{catalog,fleet,GarageController,GarageCamera,VehicleAssembly,VehicleAppearance}.js` |
| Jogador/personagens | `src/game/player/{Player,PlayerVisual,CharacterActor,WorkerFinish,WorkerWardrobe,SeatedPose,exitPolicy}.js` |
| Interações | `src/game/interactions/InteractionResolver.js`, `visibility.js`, `truckEntryTarget.js` |
| Tutorial | `src/game/tutorial/` |
| Missões/Sementes | `src/game/missions/{campaign,network,road,seedService,NetworkController,RoadController}.js` |
| Carga | `src/game/cargo/integrity.js` |
| Sobrevivência | `src/game/survival/`, com dados em `src/data/expedition.js` |
| Mundo | `src/game/world/World.js`, `CampaignWorld.js`, `ExpeditionWorld.js`, `NetworkWorld.js`, `RoadWorld.js` |
| Ambientação/POIs | `world/AmbientWorld.js`, `DiscoveryWorld.js`, `contextLayout.js`, `decorCompositions.js`, `finishCompositions.js`, `discoveryJournal.js` |
| Cidade/sinais | `world/CityWorld.js`, `WayfindingWorld.js`, dados `cityLayout.js`, `roadSites.js` |
| Rede/navegação | `src/data/roadNetwork.js`, `src/game/navigation/{curves,roadIndex,routePlanner,Navigator}.js` |
| Terreno/vias | `world/terrain.js`, `roadProfile.js`, `terrainGeometry.js`, `networkRoadGeometry.js`, `roadGeometry.js`, `roadDamage.js` |
| Instâncias/lotes/modelos fixos | `world/PropBatch.js`, `EnvironmentModels.js`, `staticModelPlacement.js`, `render/mergeStatic.js` |
| Emboscadas | `world/Bandits.js`, `banditAI.js`, dados/regras de `road.js` |
| Áudio | `src/game/audio/EngineAudio.js`, `AmbientAudio.js` |
| Persistência cliente | `src/game/persistence/{client,schema,settings,roadMigration,travelState}.js` |
| Persistência servidor | `src/lib/repository.js`, `api.js`, `src/app/api/` |
| UI | `src/components/game`, `gameplay`, `hud`, `menus`, `ui` |
| Preparação de assets | `scripts/` |
| Testes/evidências | `tests/unit`, `tests/e2e`, `tests/helpers`, `evidence/` |

Não mover todo o jogo para uma página React. Preserve separação de lógica pura, renderização, input, física, API e UI. O `Game` orquestra; React não deve controlar o movimento a cada frame.

## 31. Desempenho e gerenciamento de recursos

Preserve streaming por setores/proximidade, janela de terreno, LOD, instanciamento, lotes, culling, materiais compartilhados, cache de textura/modelo e descarte. Não manter todas as regiões/cidades carregadas.

Perfis atuais:

| Perfil | Distância de referência | Sombras | Partículas de referência |
| --- | --- | --- | --- |
| Baixo | 360 m | Desligadas | 120 |
| Médio | 650 m | 1024 | 300 |
| Alto | 950 m | 2048 | 500 |

Há controle de pixel ratio e escala. Esses valores são parâmetros, não uma promessa de FPS. Não existe Ultra homologado.

Objetos pequenos não devem receber corpos físicos individuais sem necessidade. Use instâncias, composição, reutilização e LOD. Objetos grandes que bloqueiam passagem precisam de colisões coerentes.

Evite outro RAF, outro renderizador, listeners duplicados, descarte de mapas compartilhados, luzes/sombras sem limite e recompilações de shader por frame. Preview de garagem deve reutilizar o pipeline existente.

O exemplo equivalente de entrada da garagem mediu 112 → 114 draw calls e 166.814 → 166.934 triângulos, no mesmo enquadramento Baixo/75%/1280×720. É uma comparação local, não orçamento universal nem FPS em GPU real.

Possibilidades de melhoria: perfilar CPU/GPU de verdade, picos de carregamento, memória por setor, tamanhos de textura, compressão KTX2/Basis/Meshopt onde justificado, orçamento de draw calls e armazenamento futuro das evidências pesadas sem apagar a rastreabilidade existente.

## 32. Testes e evidências já registrados

**Não apresentar estes resultados como se você os tivesse acabado de executar.** São a referência da última implementação, disponível no repositório.

### 0.10.0

- Baseline desta atualização: 201 unitários, build e 1 E2E focado.
- Código da aplicação: `d2d52a1180baa8bedb787886f96f506652732e10`.
- Unitários finais: **225/225, 31 arquivos**.
- Build Next.js: aprovado.
- Integral: **39/39 E2Es, 50,8 minutos**, um worker, 208 hashes de fonte/testes congelados e iguais.
- Depois da integral: `b341a65` fortaleceu somente o harness de gravação/reinício; aplicação inalterada.
- Rechecagem correspondente: **2/2, 6,1 minutos**. Não são 41 cenários únicos nem outra integral de 39.
- Reinício real: servidor encerrado, porta confirmada fechada, novo processo iniciado, save versão 7 com dados/versão idênticos e jogo carregado na cidade.
- Pinturas, acessórios, upgrades, inventários, Semente, campanha, posição e combustível foram conferidos.
- Consolidação documental/evidências: `19ffc86`; integração pela PR #4 em `89357ab`.

Percurso novo da garagem: caminhada física desde Novo jogo, cerca de 1.105 m até o serviço, personalização, saída/retorno, aquisição/troca e cerca de 164 m com o basculante até o posto, além das manobras locais. Utilizou `Game.fixedUpdate` e Rapier a 60 Hz com tempo diagnóstico acelerado; não foi uma sessão humana em tempo real. Não houve atribuição diagnóstica de posição/velocidade nem concessão de recursos durante a viagem.

O benchmark físico em piso plano demonstrou efeito do upgrade: Titã sem carga, em 15 s simulados, 167,97 → 180,37 m com bomba; consumo 0,208 → 0,247 L. O trabalho realizado aumentou, além do consumo específico. Não converter isso em afirmação de FPS ou de desempenho certificado de caminhão comercial.

### Problema de coleta do save que foi corrigido no teste

Na integral, um aviso de sucesso anterior ainda estava visível. O teste leu o slot antes do PUT manual concluir, registrando versão 6 na garagem, embora o servidor depois tivesse salvo corretamente a versão 7 na cidade. O harness passou a aguardar a resposta real do PUT e conferir posição/combustível. A captura anterior foi preservada, não usada como prova de reinício.

Referências:

- `evidence/garage-0.10.0/validation.json`.
- `freeze.json`, `recheck-freeze.json`, `integral-result.json`.
- `protected-source.json`, `changed-files.txt`, `physics-benchmark.json`.
- `persistence-capture-race.json`.
- `logs/`.
- `final/` — execução integral.
- `final-recheck/garage/` — rechecagem e reinício válidos.

### Referências históricas úteis

- 0.8.2: 175 unitários e 28/28 E2Es em uma integral; não são números atuais.
- 0.9.0: 196 unitários, 31/31 integral e 2 rechecagens posteriores; 14/14 acessos locais e viagem piloto de cerca de 3,18 km.
- 0.9.1: 201 unitários, build e verificações focadas do chão; não foi anunciada uma integral da suíte inteira.
- Resultados de 0.7.0 e 0.8.0 combinaram rodadas/rechecagens; não reescrever como integrais totalmente verdes.

O ambiente utilizou Chromium/ANGLE/SwiftShader, com renderização por software. Windows/GPU real, escuta humana, sensação de direção e uma sessão humana completa continuam pendentes. Não afirmar 60 FPS, qualidade visual final ou persistência Turso em produção com base nesses resultados.

## 33. Como validar o próximo incremento

Execute os testes relevantes à mudança, além das verificações gerais solicitadas para uma nova versão:

```bash
npm test
npm run build
npm run test:e2e
```

Não executar suítes WebGL pesadas em paralelo nem build concorrendo com dev/WebGL na mesma árvore. Use um worker quando o ambiente exigir, aguarde a conclusão e mantenha fonte/testes congelados durante a integral. Se houver alteração posterior, documente checkpoint e rechecagens separadamente.

No ambiente que usa Chromium do sistema, é possível configurar `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium`; isso não é instrução literal para Windows. Utilize `AURORA_EVIDENCE_ROOT` com uma pasta nova para não sobrescrever imagens antigas.

Regressões essenciais:

- Novo jogo a pé e tutorial de 21 objetivos.
- Entrada/saída, seis rodas, suspensão, freio, ré e instrumentos.
- Câmeras interna/externas, saída após usar cabine e carroceria opaca.
- Chão em Baixo/Médio/Alto e mudança de qualidade/cache.
- NPCs, linha de visão, diálogos e serviços individuais.
- Semente: receber, transportar, calibrar, falhar/recuperar e ativar.
- Gerador do Núcleo 1.
- Sete Núcleos/Cofres, missões, estoques, restauração e não duplicação.
- Rede, cruzamentos, rotas alternativas, GPS, recálculo e acesso físico.
- Garagem: gate, prévia/cancelamento, custo, rollback, troca e estados individuais.
- Saves legados, três slots, migração de posição e reinício real.
- Streaming, descarregamento, memória, qualidade, console e assets.

Capturas comparativas devem vir do renderer real, com ângulo, horário e qualidade equivalentes. Posicionamento diagnóstico é aceitável para inspecionar a cena, mas não prova que uma viagem foi percorrida. Não usar teleporte para afirmar navegabilidade. Não substituir falhas por critérios mais frouxos sem investigar.

## 34. O que falta para considerar o jogo completo

Ainda faltam, em diferentes níveis de prioridade:

1. Concluir os quatro finais e os conflitos/decisões finais da narrativa.
2. Dar profundidade e consequências ao arco de Brutus e ao mistério da Voz.
3. Melhorar o ritmo das viagens além de uma sequência rápida de entregas.
4. Expandir cidades, comunidades, estradas e exploração com o sistema existente.
5. Levar outras regiões ao nível de acabamento do Mar de Cinzas/cidade piloto.
6. Refinar modelagem, materiais, transições, vegetação e interiores.
7. Produzir rostos e arte final de Dante/NPCs.
8. Implementar contatos/animações de entrada/saída mais completos, portas e, se apropriado, IK.
9. Criar interiores específicos e retrovisores dinâmicos com custo controlado.
10. Homologar separadamente os três caminhões candidatos restantes.
11. Expandir upgrades mecânicos/visuais sem criar atributos fictícios.
12. Calibrar navegação, consumo e balanceamento por veículo/carga.
13. Refinar áudio por escuta humana ou integrar arquivos licenciados.
14. Avaliar controles remapeáveis, gamepad/volante e acessibilidade.
15. Melhorar distribuição, backups/exportação e continuidade de partidas entre dispositivos, se solicitado.
16. Validar em Windows/GPUs reais, testar sessão humana e corrigir os problemas encontrados.
17. Auditar os assets para qualquer pretensão comercial.
18. Otimizar e estabilizar uma entrega final de campanha com critérios verificáveis.

Não afirmar que todos os itens acima estão ausentes em sua forma mais básica: muitos já têm fundação funcional. A tarefa é completar e aprofundar essa fundação, preservando o que funciona.

## 35. Melhorias técnicas concretas a investigar

Os pontos a seguir são oportunidades identificadas pela leitura do estado atual. Não são todos bugs reproduzidos em uma nova sessão; confirme comportamento e impacto antes de modificar:

### A. Navegação adaptada à frota

`routePlanner.estimates` utiliza uma heurística de consumo por distância, massa, piso e inclinação. Integrar curvas/eficiência/upgrades de cada veículo e comparar previsto × consumido em percursos equivalentes. ETA não deve pressupor a mesma velocidade efetiva em montanha ou carga pesada.

### B. Resgate e dependências legadas

`VehiclePhysics.recover` ainda utiliza a referência `roadX(z)`. Auditar como recuperar um veículo na rede atual/cidade para uma posição próxima segura, sem devolver tudo ao eixo antigo, sem conceder recursos e com custos/aviso coerentes.

### C. Emboscadas com diferentes caminhões

`banditAI.js` possui dimensões fixas e preparação ligada ao eixo legado. Verificar perseguição, contato/roubo, obstáculos e distâncias com o basculante e futuras carrocerias. Não generalizar por suposição.

### D. Consistência de catálogo e interface

Separar claramente fonte preparada e veículo homologado no manifesto; evitar o texto antigo de pendência do dump-truck ser interpretado como indisponibilidade do drivable. Rever rótulos funcionais que ainda dizem “Titã” quando o veículo ativo é outro, sem reescrever falas da história.

### E. Saves e experiência de confirmação

Manter espera real pela resposta da API em testes e qualquer UX de confirmação. Um aviso antigo de “salvo” não prova a conclusão de uma solicitação nova. Avaliar feedback de gravando/sucesso/erro e recuperação de conflito, sem usar uma mensagem como substituto da persistência.

### F. Articulação e arte por modelo

O interior compartilhado é funcional, mas contatos de mãos/volante/pedais, enquadramento e pontos de acesso precisam de revisão específica por caminhão. Não mexer em pivôs físicos para esconder um problema visual de pose.

### G. Geografia e colisões em expansões

Encontrar usos restantes de `roadX`, `roadHeight`, `heightAt` e `surfaceAt`. Não removê-los indiscriminadamente. Novas vias precisam de correspondência física/visual, aderência, decoração reservada, interações e migração.

### H. Constantes e capacidade

Revisar constantes históricas de combustível/capacidade e os limites de inventário antes de criar tanques ou carrocerias novas. Preservar unidades SI e estados individuais; capacidade nominal, combustível, carga principal e mochila são conceitos distintos.

## 36. Sistemas futuros já desejados, ainda não concluídos

### Economia dinâmica

Evoluir os estoques e preços reais existentes para escassez, região, demanda, reputação e restauração. Cotação e débito precisam coincidir. Evitar arbitragem infinita, arredondamentos exploráveis, estoque duplicado e itens gratuitos.

### Contratos de transporte

Pedidos opcionais de água, comida, peças e equipamentos entre comunidades. Reserva de carga, peso/capacidade, origem/destino, integridade, prazo quando apropriado e entrega física. Não criar contratos que só movem números sem transportar algo no veículo.

### Código da Última Estrada

Regras locais sobre circulação, comércio, recursos e responsabilidade. Comunicar antes de punir, com consequências legíveis e narrativamente coerentes. Ainda não existe um sistema completo de leis/infrações.

### Facções e reputação

Comunidades com interesses, relações persistentes e consequências proporcionais. Integrar missões e comércio existentes. Não inventar que os NPCs atuais já têm toda essa simulação.

### Eventos dinâmicos

Ocorrências opcionais, determinísticas quando necessário, com intervalos, possibilidade de ignorar, posições seguras e persistência. Integrar clima e emboscadas fixas já presentes, sem interromper constantemente a condução ou criar spawn na cabine/pista.

### Rotinas de NPCs

Movimentação ambiental e horários simples, rotas navegáveis, colisões, retorno ao atendimento e atualização do alvo de interação. Preserve diálogos e não deixe o comércio inacessível porque um NPC saiu andando sem destino seguro.

### Frota e personalização ampliadas

Homologar os candidatos um de cada vez, com dimensões, rodas, física, som, cockpit, instrumentos e licença próprios. Expandir peças, transmissão, refrigeração e tanques com efeitos testados. Não adicionar uma segunda garagem/frota paralela.

### Exploração e mundo

Novas cidades pequenas bem construídas, bairros industriais, porto seco, instalações na serra, abrigos e POIs com motivo para visitar. Recompensas finitas e informação ambiental importam mais que centenas de objetos repetidos.

## 37. Quatro finais planejados — não implementados

Os conceitos canônicos são:

1. **Renascimento:** sete ancoragens bem-sucedidas e Titã funcional na entrega final.
2. **Renascimento parcial:** restauração incompleta, com falha não recuperada deixando parte do mundo cinza.
3. **Último destino:** condição crítica do Titã na etapa final e escolha consciente de forçá-lo, terminando a jornada a pé.
4. **Segredo da Voz:** fragmentos e escolha final apropriada; final exclusivo com revelação do mistério.

Consulte a seção de bastidores do documento original para a identidade/revelação exata da Voz. Não exibir essa informação em HUD, nome público de interlocutor, rádio comum ou diálogo antecipado.

<details>
<summary>Bastidores do roteiro original — spoiler para desenvolvimento, nunca texto público antecipado do jogo</summary>

O apelido de referência de A Voz no projeto original é Lucas Ichiro Honda. A reviravolta planejada para **Segredo da Voz** é que o sinal vem do próprio Dante, de outra linha do tempo, tentando garantir que desta vez ele chegue. O final exige fragmentos coletados ao longo da partida e uma escolha apropriada no sétimo Núcleo, sendo exclusivo dos outros três. Essa é informação de autoria preservada para continuidade; não é uma revelação já implementada nem autorização para expor o nome/segredo na interface comum.

</details>

Há decisões de design pendentes que precisam de solução coerente:

- A progressão atual exige a ancoragem anterior. O final parcial não pode ser simplesmente ligado ao terminar os sete como se a sequência permitisse pular uma falha. É necessário definir um caminho narrativo/mecânico consistente.
- Os conceitos de Renascimento e Último destino mencionam o Titã. Com a frota substituível, é necessário definir explicitamente seu papel na entrega final e como isso funciona se outro veículo estiver ativo.
- Flags como `finalChoice`, `titanForced` e `voiceFragments` são preparação, não prova de finais jogáveis.
- Decisões precisam ser tomadas antes das consequências, registradas e recuperáveis no save. Não sortear um final desconectado do que o jogador fez.

Não encerrar a campanha com uma tela declarando quatro finais disponíveis sem implementar seus gatilhos, cenas, diálogos, consequências e testes.

## 38. Ordem técnica recomendada para continuar

Esta ordem é uma proposta de continuidade, não uma afirmação de que uma versão 0.11.0 já foi aprovada ou entregue:

1. **Diagnóstico atual:** confirmar base, alterações e pendências; não repetir o trabalho das versões anteriores.
2. **Validação humana/estabilidade:** Windows, GPU real, controles, chão, opacidade, saves, garagem e primeiros 30 minutos; corrigir falhas reproduzidas.
3. **Integração da frota:** estimativas do GPS, rótulos, resgate, emboscadas e experiência do basculante.
4. **Qualidade de viagem/exploração:** poucos percursos e locais melhores, circulação real e decisões úteis, medindo acessibilidade e desempenho.
5. **Polimento artístico:** cabines, personagens, iluminação, áudio e ambientes por composição, sem perder performance.
6. **Expansão funcional selecionada:** um candidato de caminhão ou um contrato/economia, conforme a prioridade do usuário; completar antes de multiplicar.
7. **Narrativa final:** resolver regras de sequência/frota, desenvolver Brutus, escolhas e quatro finais com consequência real.
8. **Preparação de uma campanha final:** balanceamento, regressão, hardware, licenças, acessibilidade, distribuição e documentação.

Respeite o pedido atual do usuário se ele escolher outra prioridade. Não executar automaticamente todo esse roadmap só porque ele está listado neste documento.

## 39. Regras de trabalho e preservação

- Trabalhar no repositório existente e manter a stack.
- Proteger trabalho local, diálogos e commits de colaboradores.
- Não fazer force push, reset destrutivo ou restauração ampla de arquivos antigos.
- Criar incrementos concretos e revisáveis, com testes adequados.
- Não refazer tutorial, inventário, campanha, controlador de personagem, relógio, GPS ou garagem do zero.
- Não adicionar múltiplos loops/listeners e não mover física para a API.
- Preservar opacidade do Titã, seis rodas e tuning-base.
- Preservar o orçamento de samplers e ciclo de vida dos mapas PBR.
- Preservar geometria física/visual compartilhada e densidade zero do cenário fixo.
- Não duplicar recursos, Sementes, coletas, propriedade ou recompensa na migração/troca.
- Não tratar avatar provisório como arte final nem candidato GLB como veículo dirigível.
- Não usar imagens promocionais como screenshot do jogo.
- Não alterar testes para esconder uma regressão; investigar origem e preservar tentativas.
- Registrar exatamente o que foi testado, em qual commit e com quais limitações.
- Não publicar cookies, bancos pessoais, tokens ou segredos. Estados de autenticação de QA não pertencem ao Git.
- Respeitar licenças e não declarar liberação comercial geral.
- Não tentar contornar política de rede. Se um asset faltar, registrar e manter fallback funcional.
- Não executar várias cópias do mesmo pedido colado na conversa.

O usuário já autorizou publicação de código, histórico, relatórios e assets licenciados no fluxo do projeto. O destino atual é `renataaap/2047`; o remoto antigo `Da-Hora-stack/2047` é histórico e não deve ser escolhido por engano. Verifique conta/destino antes de publicar e preserve a visibilidade/configuração existente.

## 40. Entrega exigida ao terminar um próximo incremento

Apresente:

1. Problema/objetivo tratado e comportamento resultante.
2. Base, branch, commits e situação do PR/publicação.
3. Arquivos e módulos alterados.
4. Assets realmente instalados/modificados, procedência e licença.
5. Sistemas efetivamente funcionais e preservados.
6. Testes executados nesta tarefa, com resultados reais por rodada/checkpoint.
7. Comparações visuais e evidências de gameplay, quando pertinentes.
8. Dados de desempenho com condições e limites.
9. Compatibilidade de saves e resultado do reinício quando afetados.
10. Bugs encontrados, corrigidos e pendentes.
11. Limitações de ambiente, hardware, arte, áudio e licença.
12. Próximo passo técnico concreto.

Não anunciar uma versão concluída por apenas mudar `package.json`. Não reutilizar os números históricos como validação nova. Não confundir build verde com qualidade visual e jogabilidade aprovadas.

**Instrução final:** entenda o estado real antes de editar, preserve a identidade e os sistemas de 2047: Rede Aurora, e faça a próxima melhoria de forma integrada e verificável. O objetivo é um simulador de caminhão e sobrevivência cuidadosamente desenvolvido, com viagem interessante, personagens reconhecíveis e restauração significativa — não acumular código ou telas sem elevar a experiência.

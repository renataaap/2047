# CODEX — INTEGRAÇÃO DE MODELOS 3D, TEXTURAS REALISTAS E MELHORIAS VISUAIS DO 2047: REDE AURORA

## 1. OBJETIVO

Quero que você reformule e melhore significativamente os gráficos e modelos tridimensionais do jogo **2047: Rede Aurora**, utilizando os assets reais selecionados do Sketchfab, Fab e Poly Haven.

O jogo já está sendo desenvolvido e deve continuar utilizando:

- Next.js com App Router.
- JavaScript.
- HTML5 e CSS3.
- Three.js.
- WebGL.
- API REST Web.

**Não quero objetos feitos de cubos e geometrias primitivas como representação final dos caminhões, personagens e edifícios.**

Quero que os modelos 3D existentes sejam substituídos ou aprimorados com assets reais, respeitando a estética de simuladores como Euro Truck Simulator 2, combinada com um mundo pós-apocalíptico.

Trabalhe diretamente no repositório existente.

Antes de alterar qualquer arquivo, analise a arquitetura, os modelos, as texturas, os shaders e os sistemas de física já implementados.

---

## 2. CAMINHÕES OFICIAIS DO JOGO

Selecionei três modelos como referência para a progressão de veículos.

### Caminhão inicial

**Modelo:** GAZ-52

Link:
https://sketchfab.com/3d-models/half-life-2-gaz-52-52-c557d69e270e4051b5c2505030e0f04e

Este será o primeiro caminhão disponível ao jogador.

Características desejadas:
- Aparência antiga.
- Motor diesel mecânico no universo do jogo, com adaptação narrativa e visual quando necessário.
- Desgaste.
- Ferrugem.
- Cabine simples.
- Capacidade de carga reduzida.
- Menor potência.
- Manutenção relativamente acessível.

Este veículo representa o início da jornada.

**Atenção:** o modelo está associado a Half-Life 2. Verifique a origem, autoria, licença e eventuais direitos de terceiros antes de incorporá-lo. Caso o uso não esteja autorizado, utilize o modelo apenas como referência visual e procure uma alternativa licenciada.

### Caminhão intermediário

**Modelo:** Mercedes-Benz LP 608 Dump Truck

Link:
https://sketchfab.com/3d-models/dump-truck-mercedes-benz-lp-608-63f87292f8aa488e8d5dcafd4ec7b3ec

Este será o caminhão intermediário.

Características:
- Maior capacidade de transporte.
- Melhor desempenho em viagens longas.
- Suspensão adaptada.
- Maior resistência.
- Mais opções de melhorias.
- Cabine com instrumentos funcionais.

Adapte o modelo à mecânica de transporte do jogo, respeitando seus direitos de uso.

### Caminhão final

**Modelo:** Peterbilt 359

Link:
https://sketchfab.com/3d-models/peterbilt-359-logtrailer-04eea83f4b6f4fccb1a60a383ca9fc44

Este será o caminhão de progressão avançada.

**Quero que remova as madeiras e toras transportadas pelo caminhão.**

Preserve a estrutura principal e desenvolva uma configuração apropriada para transportar suprimentos e Sementes de Ignição.

Se as toras estiverem em malhas independentes, remova-as sem danificar o restante do modelo. Se estiverem integradas à geometria, avalie a edição no Blender.

Características:
- Motor potente.
- Maior capacidade de carga.
- Cabine detalhada.
- Suspensão robusta.
- Maior resistência a viagens.
- Melhores possibilidades de personalização.

### Sistema de progressão

Os três caminhões devem representar uma evolução real de jogabilidade.

Cada um deverá ter configurações próprias de:
- Massa.
- Torque.
- Potência.
- Transmissão.
- Capacidade de combustível.
- Suspensão.
- Resistência.
- Capacidade de carga.
- Consumo de diesel.
- Custos de manutenção.

Não faça os veículos funcionarem exatamente da mesma maneira, mudando apenas sua aparência.

Preserve o nome **Titã Rocha Clara** como elemento importante da narrativa e proponha uma integração coerente entre a história original e a progressão de caminhões.

---

## 3. NPCs E PERSONAGENS

Utilize como referência o pacote de NPCs selecionado:

https://www.fab.com/listings/8fece26a-d452-4b1d-8042-baf95c527154

Verifique os formatos, o nível de detalhe, o rigging e as animações disponíveis.

Não assuma que os modelos são realistas apenas por serem tridimensionais.

### Personagens do jogo

Implementar progressivamente:

- Dante Rocha Negra — protagonista.
- Dra. Renata Final Boss.
- Mãe Ivani.
- Brutus, vulgo Garcia.
- Sobreviventes.
- Mecânicos.
- Comerciantes.
- Habitantes dos abrigos.

A Voz, Lucas Ichiro Honda, deverá continuar sendo principalmente uma presença misteriosa no rádio.

### Funcionalidades dos NPCs

Quero NPCs capazes de:

1. Permanecer em repouso com animação idle.
2. Caminhar.
3. Virar em direção ao jogador.
4. Interagir.
5. Apresentar diálogos.
6. Oferecer missões.
7. Receber itens.
8. Participar de eventos narrativos.

Utilize AnimationMixer e os recursos de animação do Three.js.

Se necessário, prepare os personagens no Blender e utilize animações compatíveis do Mixamo.

Os NPCs precisam apresentar escala, colisão e posicionamento coerentes com o mundo.

Caso o pacote escolhido seja visualmente simples demais, não o apresente como resultado final. Utilize-o provisoriamente e informe quais personagens precisarão ser substituídos.

---

## 4. ASSETS DO FAB

Analise os seguintes recursos que selecionei:

**Areia:**
https://www.fab.com/listings/642bd724-1ce0-40d1-849e-e37120be064e

**Heightmaps e materiais de terreno:**
https://www.fab.com/listings/2b1c66b2-1f60-4a14-b1da-af08daa72177

**Materiais de deserto:**
https://www.fab.com/listings/7de3019e-5acd-439e-b8dc-bff09cacb095

**Texturas de terreno:**
https://www.fab.com/listings/cc590dc6-028d-42b1-af25-3b779085cb57

**Materiais naturais:**
https://www.fab.com/listings/689523e7-17fc-446d-9bef-ddf7e4924a5a

**Recursos para modelagem de terreno:**
https://www.fab.com/listings/11388bc3-c13a-4c2f-b7d0-578022969a60

### Procedimento obrigatório

1. Abra as páginas e identifique os recursos.
2. Verifique formatos disponíveis.
3. Verifique licenças.
4. Identifique compatibilidade com Three.js.
5. Determine quais arquivos podem ser importados diretamente.
6. Converta materiais e modelos quando necessário e permitido.
7. Integre os assets compatíveis ao cenário.

Alguns desses pacotes podem ser específicos de Unity ou Unreal Engine.

Não tente carregar diretamente arquivos proprietários desses motores no Three.js.

Utilize apenas formatos acessíveis, licenciados e convertíveis.

Caso algum download exija uma conta, compra ou confirmação de licença, informe qual arquivo precisa ser fornecido. Não tente contornar as restrições da plataforma.

---

# 5. POLY HAVEN — TEXTURAS PBR

Quero que utilize as texturas do Poly Haven para aumentar o realismo do cenário.

Site oficial:
https://polyhaven.com

API:
https://api.polyhaven.com

Documentação:
https://github.com/Poly-Haven/Public-API

### Materiais já selecionados anteriormente

| ID | Uso |
|---|---|
| `road_damaged_2` | Estradas danificadas |
| `gravel_road` | Cascalho |
| `mud_cracked_dry_03` | Terra rachada |
| `dirt` | Solo |
| `rocky_terrain_03` | Terreno rochoso |
| `rusty_metal_05` | Ferrugem |
| `rust_coarse_01` | Metal corroído |
| `corrugated_iron` | Estruturas metálicas |

### 16 novos materiais

| ID | Uso |
|---|---|
| `asphalt_02` | Asfalto preservado |
| `asphalt_pit_lane` | Asfalto envelhecido |
| `cracked_concrete_02` | Concreto rachado |
| `damaged_concrete_floor_02` | Pisos destruídos |
| `broken_brick_wall` | Paredes em ruínas |
| `rebar_reinforced_concrete` | Estruturas de concreto |
| `painted_metal_shutter` | Portas metálicas |
| `container_side` | Contêineres |
| `garage_floor` | Oficinas |
| `wood_peeling_paint_weathered` | Madeira deteriorada |
| `worn_planks` | Tábuas |
| `brown_leather` | Bancos de caminhão |
| `withered_grass` | Vegetação seca |
| `sparse_grass` | Vegetação em recuperação |
| `leafy_grass` | Vegetação restaurada |
| `sand_01` | Areia |

## Download

Se estiver anexado o kit de texturas, examine os seguintes arquivos:

- `README.md`
- `materiais_2047.json`
- `scripts/baixar-polyhaven.mjs`
- `PROMPT_CODEX.md`

Execute o script de download com acesso à internet.

Se o kit não estiver disponível, crie uma integração que consulte os endpoints oficiais do Poly Haven e obtenha as URLs reais dos mapas PBR.

Não invente URLs de download.

### Configuração dos materiais

Utilize:

- Base Color.
- Normal Map.
- Roughness.
- Metalness.
- Ambient Occlusion quando disponível.
- Height Map quando adequado.

Configure corretamente o espaço de cor de cada mapa, os UVs e a escala dos materiais.

Use `MeshStandardMaterial` ou `MeshPhysicalMaterial`, conforme a necessidade.

### Resolução

Priorize:
- 1K para elementos distantes.
- 2K para superfícies comuns.
- 4K quando justificável pela proximidade e importância visual.

Não use texturas excessivamente pesadas sem necessidade.

### Integração

Organize em:

```text
public/assets/
├── models/
│   ├── trucks/
│   ├── characters/
│   └── environments/
├── polyhaven/
├── fab/
├── animations/
└── audio/
```

Preserve as texturas próprias dos caminhões e NPCs quando estiverem corretas.

Não aplique texturas de terreno diretamente aos personagens ou a superfícies inadequadas.

---

# 6. MODELAGEM E REALISMO

Quero que os modelos e cenários apresentem qualidade visual próxima à proposta de um simulador de caminhão moderno.

Melhore:

- Proporções.
- Geometria.
- Materiais.
- Iluminação.
- Sombras.
- Escala dos objetos.
- Profundidade ambiental.
- Texturas.
- Transições entre materiais.
- Detalhes das construções.
- Estradas e terrenos.

Apenas adicionar texturas realistas sobre geometrias extremamente simples não será suficiente.

Os assets devem possuir colisões, escala adequada e posicionamento coerente.

---

# 7. INTEGRAÇÃO COM A FÍSICA EXISTENTE

A substituição dos modelos 3D não pode quebrar a dirigibilidade.

Separe corretamente:

- Modelo visual.
- Corpo físico.
- Rodas físicas.
- Rodas visuais.
- Componentes mecânicos.
- Câmeras.
- Pontos de interação.

Os novos caminhões devem funcionar com o sistema de física existente, realizando as adaptações necessárias.

Verifique:

- Aceleração.
- Frenagem.
- Marcha à ré.
- Suspensão.
- Curvas.
- Colisões.
- Peso.
- Torque.
- Câmeras.

**Não deixe o caminhão apenas como um objeto estático. Quero dirigir os modelos 3D escolhidos.**

---

# 8. REGIÃO INICIAL — MAR DE CINZAS

Priorize a reformulação gráfica da primeira região.

Adicione e melhore:

- Estradas realistas.
- Asfalto quebrado.
- Solo seco.
- Areia.
- Terreno irregular.
- Pedras.
- Ruínas.
- Postos abandonados.
- Oficinas.
- Barracões.
- Sucata.
- Vegetação morta.
- Estruturas industriais.
- Poeira e neblina.

Utilize modelos reais e texturas PBR.

Evite espalhar objetos aleatoriamente.

Crie um cenário com coerência espacial e narrativa ambiental.

O jogador precisa sentir que está atravessando um território que já foi habitado.

---

# 9. QUALIDADE E PERFORMANCE

Os modelos precisam funcionar adequadamente no navegador.

Implemente quando necessário:

- Conversão de FBX/OBJ para glTF ou GLB.
- Otimização de malhas.
- Compressão de texturas.
- Draco ou Meshopt quando apropriado.
- LOD.
- InstancedMesh.
- Frustum culling.
- Cache de assets.
- Carregamento progressivo.
- Gerenciamento de memória.

Verifique se a quantidade de polígonos é adequada.

NPCs distantes poderão utilizar modelos mais leves.

Os caminhões deverão receber maior prioridade visual, pois são elementos centrais do jogo.

Evite carregar todos os assets simultaneamente.

---

# 10. IMPLEMENTAÇÃO E TESTES

Antes de começar:

1. Inspecione os arquivos atuais.
2. Identifique os assets existentes.
3. Verifique quais dos links selecionados podem ser utilizados legal e tecnicamente.
4. Organize um catálogo dos assets.
5. Identifique quais modelos precisam de conversão.
6. Prepare a integração.
7. Implemente as melhorias diretamente no código.

Após a implementação:

- Execute o build do Next.js.
- Verifique erros no console.
- Teste o carregamento de GLB/glTF.
- Verifique materiais ausentes.
- Teste animações.
- Teste colisões.
- Teste a dirigibilidade.
- Verifique o desempenho.
- Capture imagens reais do jogo, quando possível.

Crie um relatório contendo:

| Asset | Origem | Formato | Status | Uso no jogo |
|---|---|---|---|---|
| Caminhão inicial | Sketchfab | Verificar | Pendente/Integrado | Veículo inicial |
| Caminhão intermediário | Sketchfab | Verificar | Pendente/Integrado | Veículo intermediário |
| Caminhão final | Sketchfab | Verificar | Pendente/Integrado | Veículo avançado |
| NPCs | Fab | Verificar | Pendente/Integrado | Personagens |
| Texturas | Poly Haven | Verificar | Pendente/Integrado | Cenários |

Não declare que um asset foi integrado antes de efetivamente carregá-lo no jogo.

---

# 11. RESULTADO ESPERADO

Quero abrir o **2047: Rede Aurora** e encontrar:

- Caminhões detalhados.
- NPCs tridimensionais animados.
- Cenários realistas.
- Texturas verdadeiras.
- Estradas convincentes.
- Construções abandonadas bem modeladas.
- Ambientes com profundidade.
- Iluminação natural.
- Materiais fisicamente plausíveis.
- Sistema de direção funcional.
- Melhor qualidade gráfica geral.

A estética deve se aproximar de um simulador de caminhões realista, mantendo a atmosfera de um mundo pós-apocalíptico.

**Não quero somente um cenário mais bonito. Quero modelos, materiais e sistemas realmente integrados ao jogo.**

Comece pelo diagnóstico do repositório, pela preparação dos assets e pela integração do caminhão inicial e das texturas da primeira região.

Depois, desenvolva a progressão dos demais veículos e NPCs.

Preserve o universo de 2047: Rede Aurora e todas as funcionalidades existentes que estejam funcionando corretamente.

Ao concluir cada etapa, informe exatamente o que foi implementado, o que foi testado e o que ainda depende de arquivos ou trabalho adicional.
# Restauração ambiental 2.0 — 2047: Rede Aurora

**Em validação. Não é anúncio de entrega final.** Branch `feat/restauracao-ambiental-0.11.0`, derivada da main `4771193`, que já contém a 0.10.0/PR #4. A main permanece preservada durante os testes. Este relatório será fechado com a integral, matriz de acessos e comparações finais.

## Resultado implementado

A ativação dos Núcleos mantém as regras reais de Sementes, calibração, sequência e recompensas. Uma camada ambiental integrada passa a representar a recuperação: gramíneas curvadas, arbustos ramificados, árvores jovens com troncos e folhas, solo com umidade/cobertura heterogêneas, chuva e redução de poeira. O Mar de Cinzas tem cinco refúgios de composição adicionais; as outras faixas usam espécies, proporções e densidades próprias.

O primeiro campo foi inspecionado em capturas reais e teve ativação, três estágios, diário, save e recarga aprovados num teste de navegador. Testes dos demais biomas e das apresentações também passaram em rodadas focadas. A regressão integral e a auditoria física completa ainda estão em andamento neste documento.

## Base e preservação

Os onze hashes de `evidence/restoration-0.11.0/protected-base.json` continuam iguais à base: quatro módulos narrativos, tuning, VehiclePhysics, CabinInterior, SeatedPose, TerrainBlend e os dois GLBs dirigíveis. Não foram trocados pivôs, rodas, massa ou controladores. Garagem/frota, skins, GPS, grafo, tutorial, missões e três slots foram mantidos.

Os 225 unitários/build foram executados novamente antes das mudanças. Os 39 E2Es da 0.10.0 são históricos; não houve nova integral da base nesta tarefa. As capturas anteriores pertencem a `4771193`.

## Componentes e arquivos

| Área | Implementação |
|---|---|
| Progresso | `src/game/restoration/progress.js`, `definitions.js`; integração em `missions/network.js`, `core/Game.js` e `persistence/schema.js` |
| Distribuição | `placement.js`, `StaticObstacles.js`, índice completo em `navigation/roadIndex.js` |
| Superfície | `surfaceSampler.js`, consulta em `world/World.js`; os triângulos originais não foram deslocados |
| Vegetação | `vegetationGeometry.js`, `RestorationVegetation.js`; instâncias, LOD, cache, streaming e descarte |
| Solo | `RestorationTerrain.js`, extensão de `render/PBRLibrary.js`; zero samplers novos |
| Atmosfera | `RestorationAtmosphere.js`, `render/DayNight.js`; chuva unificada e mudanças locais graduais |
| Apresentação | `RestorationCinematic.js`, `RestorationEffects.js`, GameView/Input; mesma câmera e mesmo loop |
| Comunidades | Reações em bloco separado no MissionPanel; hortas em AmbientWorld |
| Áudio | AmbientAudio/EngineAudio existentes; nova ambiência original sintetizada |
| Diário/mapa/API | discoveryJournal, NetworkMap/NavigationMap e extensão de `/api/world/regions` |
| Evidências | scripts de captura, comparação e auditorias; novos testes unitários/E2E |

A lista exata pode ser obtida por `git diff --name-only 4771193...HEAD`. Documentação e evidências não são consideradas, sozinhas, comprovação de implementação visual.

## Vegetação e assets

Não foi instalado nem baixado um pacote externo de árvores. Os modelos são originais, construídos por JavaScript: lâminas de grama curvadas e dobradas; troncos cônicos curvos com UVs; ramos; folhas lanceoladas distribuídas em volume. São geometrias reais, sem usar cones verdes como representação final.

Casca e nervuras usam texturas procedurais autorais de 128 px, compartilhadas por espécie/região; a grama também possui variação de luz por vértice. Materiais são MeshStandardMaterial, sem metalness vegetal, com roughness alta e folhas de duas faces. O vento é discreto e acompanha a posição mundial. A quantidade, escala, altura e orientação variam de modo determinístico.

Os materiais Poly Haven já instalados continuam sendo arquivos locais, com convenções/canais do pipeline existente. As atribuições de GLBs CC BY e a restrição CC BY-NC dos carros Renafox permanecem em `public/assets/CREDITOS.txt`. Não se declara liberação comercial de todo o projeto. A vegetação procedural não deve ser apresentada como biblioteca profissional externa ou arte botânica final.

## Solo e segurança do shader

O shader modula os mapas existentes por máscaras analíticas de umidade e cobertura, considerando localização, estágio, relevo e refúgios. Evita uma troca global uniforme de marrom por verde. Roughness seca permanece preservada; a resposta úmida não transforma o chão em espelho.

TerrainBlend permanece byte a byte igual à correção da 0.9.1. A recuperação acrescenta **zero samplers** e reutiliza seus varyings no material principal. Outros materiais têm coordenadas próprias quando necessário. Slots vivos por material mantêm os sete vetores de progresso nos programas reutilizados, inclusive após trocar qualidade. Não houve displacement, mudança de altura, malha física ou colisores do terreno.

Os testes de GPU consultam links reais, uniforms e amostras visíveis. Selecionar o orçamento de 16 no SwiftShader não emula o driver de uma GPU Windows.

## Estágios, alcance e persistência

| Estágio | Tempo de simulação ativa | Apresentação |
|---|---|---|
| 0 | Antes de ancorar | Campo devastado, sem vegetação nova |
| 1 | Imediato até 45 s | Resposta do equipamento, chuva/umidade e primeiros tufos |
| 2 | 45–240 s | Expansão da grama, arbustos e primeiras árvores jovens |
| 3 | A partir de 240 s | Cobertura mais densa e árvores jovens mais presentes |

É uma progressão visual acelerada, adequada ao ritmo do jogo, não uma simulação biológica em escala real. Não há árvores adultas surgindo durante a apresentação. O tempo para em menus, conversas, mapa, garagem, carregamento e cutscene; não usa horas fora do jogo.

Cada Núcleo guarda idade, máscara de observações, flag de apresentação e marca de migração em `campaign.world.recovery`. O estágio é derivado da idade. Não são salvas milhares de posições. As sementes derivam de Núcleo/setor/mancha; as plantas são regeneradas com o mesmo terreno e exclusões. O alcance cresce e respeita as faixas históricas de restoredAt, além de limites laterais por bioma; não cobre indiscriminadamente todo o continente.

Campos antigos já ativos migram uma única vez para maturidade, sem reiniciar missões ou repetir cutscene/custos. Schema 1–3 e os três slots continuam aceitos. `syncRestoration`, `restoredAt` e a sequência de sete Núcleos permanecem autoridades da campanha.

## Identidade dos biomas e acessos

| Núcleo | Faixa | Vegetação e condições |
|---|---|---|
| 1 — A primeira faixa | Mar de Cinzas | Gramíneas resistentes, refúgios, arbustos e árvores jovens de solo seco; chuva desde a primeira resposta |
| 2 — Viaduto | Cidades Esqueleto | Árvores de copa mais alta e plantas em áreas abertas, fora de estruturas e vias |
| 3 — As janelas vazias | Cidades Esqueleto | Mesmo bioma, com progresso independente do campo anterior |
| 4 — Mar ausente | Leito Seco | Manchas resistentes ao sal, densidade menor, pouca arborização e umidade localizada |
| 5 — Passo de vidro | Cordilheira Vítrea | Gramíneas baixas, arbustos e árvores menores; exclusão de encostas instáveis |
| 6 — Acima das nuvens | Cordilheira Vítrea | Segunda faixa com idade própria, mantendo rampas e acesso físico |
| 7 — Horizonte | Zonas de Tempestade | Silhuetas inclinadas pelo vento, vegetação resistente e atmosfera estabilizada |

As exclusões usam o grafo completo, ruas de Cinza Nova, pátios, edifícios, reservas de terminais/NPCs e composições de cenário. Há margem para os dois caminhões. Pequenas plantas não recebem colisores; até doze árvores próximas e maiores têm cilindros fixos de densidade zero.

A auditoria física usa fixtures locais na entrada viária, controles e timestep real do Rapier, caminhada até o terminal, interação, maturidade, save/load, retorno e saída. Cofres já ancorados são testados sem retirar outra Semente. Não é uma viagem pelo continente nem uma sessão humana. A matriz final ainda será anexada.

## Apresentação, clima e áudio

A apresentação começa ao fechar o terminal após uma ancoragem bem-sucedida. Dura sete segundos de tempo visual; com redução de movimento, usa câmera fixa por 1,8 s. Esc, Espaço, Enter ou o botão permitem pular. A câmera anterior e o controle são restaurados. O resultado já foi salvo; assistir, pular ou carregar não consome outra Semente. Dante aparece nas vistas externas da apresentação e volta à visibilidade adequada à perspectiva escolhida.

O ressonador recebe iluminação e circulação de energia em sua geometria. A câmera alterna estrutura e terreno em recuperação; não é apenas um círculo verde no chão. Chuva usa gotas lineares com comprimento/velocidade variados e orçamento por perfil. Poeira/neblina diminuem conforme a influência local. O ciclo solar existente conserva noite e faróis.

Folhas, água e pequenas chamadas de fauna são síntese original no AudioContext existente. A fauna só entra após o estágio inicial, com comportamento diferente à noite. O motor diesel não foi substituído. A mixagem e a qualidade sonora ainda exigem audição humana; não foram instaladas gravações profissionais.

## Comunidades, diário e consequências

NPCs apresentam comentários contextuais separados dos diálogos principais. Hortas existentes passam a respeitar o estágio local. O diário registra a ancoragem e observações únicas por campo/estágio, sem duplicações ou recompensas. O mesmo mapa/GPS exibe campos em recuperação e mantém a rede viária real; a API fornece esse estado por Núcleo.

Continuam funcionando as consequências de campanha já existentes: barreiras liberadas, drenagem/estabilidade e riscos regionais alterados. A apresentação acrescenta visibilidade/atmosfera graduais. Não foram modificados silenciosamente torque, massa, aderência-base ou economia. Novas hortas não concedem comida infinita.

## Desempenho e ciclo de vida

Setores de vegetação de 256 m; raio/densidade por Baixo, Médio e Alto; dois LODs; instanciamento por função/material; materiais/geometrias compartilhados; frustum culling; descarte de instâncias e corpos fora da área. Matrizes só mudam quando o progresso exige, e sombras acompanham a proximidade sem reescrever todas as instâncias.

Planejamento durante a viagem é fatiado. Load/troca de qualidade preparam os setores em tarefas curtas antes de exibir a nova paisagem, evitando depender do ritmo muito lento da GPU por software. Há custo inicial de indexar triângulos/preparar geometrias, registrado nas métricas; não se promete ausência de todo hitch em hardware ainda não avaliado.

Os protótipos e seus custos foram preservados. A comparação final registrará instâncias, calls, triângulos, geometrias, texturas, tempo e heap JavaScript quando disponível. Contagens de recursos e heap do Chromium não são bytes de VRAM. Nenhum resultado representa 60 FPS numa GPU Windows.

## Testes e evidências — situação deste checkpoint

- Baseline executada: 225 unitários e build; dezesseis imagens anteriores reais.
- Incrementos: 255, 256 e depois 257 unitários aprovados, com logs separados; não somar rodadas como testes diferentes.
- Rodada focada 3: dois casos aprovados; falha de preparação de slot no terceiro; quarto não executado.
- Rodada focada 4: falha do init script em about:blank, corrigida na preparação; não apresentada como aprovada.
- Rodada focada 5: dois casos aprovados em 3,1 min, incluindo apresentações e migração dos campos posteriores.
- Acessos iniciais do Núcleo 1 passaram com os dois veículos. A primeira matriz foi interrompida após um limite de espera curto para carregar; nova rodada em andamento, sem apagar os registros anteriores.
- Integral da versão, reinício real, testes de streaming e comparações finais: **ainda pendentes neste documento**.

Capturas e logs estão em `evidence/restoration-0.11.0`. Os originais não são imagens promocionais nem renders externos. O comparador usa PNGs do jogo e mesmas poses/horário. Posicionamento/idades de diagnóstico são declarados; não comprovam viagem humana. Traces que podem conter cookies ficam exclusivamente em `/tmp`, fora do Git.

## Problemas resolvidos e limites

Foram removidas as duas implementações antigas de cones/chuva, corrigida a ordem da composição úmida no PBR e evitada mudança de posições por consultas à broad phase ainda não atualizada durante o load. O carregamento deixou de depender exclusivamente de RAF. Testes passaram a esperar a carga assíncrona e a sincronização real das matrizes.

Pendências de avaliação: Windows/GPU física, audição, sessão humana e escolha artística do usuário. A vegetação é procedural, sem botânica/árvores adultas finais, fauna 3D, simulação hídrica ampla ou novas rotinas/economia das comunidades. Esses sistemas não são marcados como entregues. Não foram concluídos os finais do jogo nesta atualização.

## Próximas melhorias possíveis

Mais espécies/arte final com licença verificada; refúgios autorais adicionais nos biomas posteriores; cinemáticas específicas por local; clima com períodos mais variados; água superficial integrada ao relevo; áudio gravado/licenciado e mixagem humana; compressão de texturas e medições em GPUs reais. Permanecem no roadmap geral a economia dinâmica, contratos, facções, veículos candidatos e finais. Nenhuma dessas expansões foi iniciada automaticamente como outra versão.

Guia de avaliação: [teste manual](docs/TESTE_MANUAL_RESTAURACAO_0.11.0.md). Histórico verificável: [incrementos](docs/INCREMENTOS_RESTAURACAO_0.11.0.md) e [diagnóstico](docs/DIAGNOSTICO_RESTAURACAO_0.11.0.md).

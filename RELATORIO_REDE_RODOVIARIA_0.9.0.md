# 2047: Rede Aurora — rede rodoviária 0.9.0

Estado: implementação e percursos aprovados; regressão E2E integral em preparação. A validação final será registrada abaixo sem substituir tentativas anteriores. Branch `feat/rede-rodoviaria-0.9.0`, base `55a5df3` (0.8.2). O PR #1 da base continua separado e a main não foi sobrescrita.

## Resultado em relação à 0.8.2

O corredor existente agora integra um grafo de 243 nós e 291 segmentos, dos quais 92 acrescentam geometria física. Há 68 destinos, incluindo referências de retorno. A cidade piloto Cinza Nova conecta a rodovia, ruas, pátios, posto com Nilo/estoque finito, área industrial e garagem física. A Oficina do Cotovelo, Posto Boa Viagem, três POIs, cinco biomas, sete Núcleos/Cofres e narrativa foram preservados.

O jogador escolhe destinos e custos no mapa M, recebe orientação contínua no minimapa, pode entrar na cidade, estacionar, abastecer/explorar e seguir pelo Vale. A alça pavimentada a leste permanece como alternativa real. Não foi apenas alongada a rodovia. Outros assentamentos continuam na geografia antiga e a migração para cidades dirigíveis é gradual.

## Sistema viário

`src/data/roadNetwork.js` define nós, controles de curva, largura, piso, tipo, conservação, risco, região, desbloqueio e restrição de acesso. `curves.js` e `roadIndex.js` compartilham amostras métricas, comprimento, inclinação, conexões e índices espaciais. `roadProfile.js` conserva as funções antigas e `terrain.js` mantém seus reexports.

`networkRoadGeometry.js` gera pavimentos, trilhas de terra, acostamentos, cruzamentos e estacionamentos em lotes por setor. Render e Rapier recebem os mesmos triângulos. Terreno, superfícies/aderência e guarda de decoração consultam a mesma rede. As emendas entre setores são auditadas com colisores dos dois lados.

Um defeito revelado no Núcleo 6 foi corrigido na origem: a massa inferida de malhas abertas do piso fixo enfraquecia o contato de frenagem do controlador. O cenário de World/PropBatch agora usa densidade zero. Motor, relações, massa do Titã, rodas, pivôs, suspensão e `VehiclePhysics.js` não foram alterados. A reprodução compara o mesmo piso/caminhão antes/depois em `static-ground-braking.json`.

Detalhes e referência ao código oficial do Rapier em [Arquitetura](docs/ARQUITETURA_RODOVIARIA_0.9.0.md).

## Cidade e rotas

Cinza Nova fica a oeste do km 0,62, com ruas de 14 m e cruzamentos amplos nas faixas x=-360/-240/-120 e z=-620/-760/-900. Nove composições de construções incluem moradias, comércio, depósito, fábrica, armazém e garagem com vão físico aberto. Fachadas, portas/janelas, marquises, calçadas com passagens, contêineres, mobiliário, postes, iluminação e placas reutilizam PBR/PropBatch da base. São 11 lotes/composições e 81 corpos físicos urbanos, carregados por proximidade e descartados ao afastar-se.

- Rota A: rodovia e alça pavimentada leste, preservando o desvio do bloqueio inicial.
- Rota B: ligação urbana, posto de Cinza Nova, saída sul e estrada de terra pelo Vale, com curvas e resistência próprias.
- As seis áreas de desafio posteriores mantêm alças leste e recebem alternativas oeste de terra no grafo/física.
- Cada Núcleo e Cofre posterior recebe aproximação, área de estacionamento e saída. O Cofre 1 continua acessível a pé pelo abrigo; a sobrevivente fornece a primeira Semente.

As estimativas são calculadas sobre o comprimento efetivo e os parâmetros do veículo. Não se afirma que a terra é sempre mais curta ou econômica. O novo posto tem pagamento e estoque finitos, sem recompensa duplicável. A garagem prepara somente o espaço físico; compra/skin/troca não foram implementadas.

## GPS e mapa M

Dijkstra considera conexões, posição projetada, bloqueios, tipo de piso, massa, velocidade de referência, risco e inclinação. Rápida/segura/econômica são custos diferentes sobre a mesma rede. O bloqueio da frente de plasma acompanha a calmaria e o estado restaurado.

O HUD mostra posição/orientação, estradas, rota, destino, distância e conversões derivadas da geometria, com modo compacto/ampliado/oculto. A pé destaca NPCs, terminais e acessos próximos. M seleciona destinos, mostra alternativas, tempo/diesel estimados e trechos bloqueados. Desviar para outra via produz recálculo, sem mover o veículo. A interface representa mapas recuperados e posição inercial estimada, sem serviço externo de GPS.

## Acessibilidade dos sete Núcleos

**14/14 auditorias locais passaram na repetição final**: sete Núcleos e sete Cofres, com entrada e saída dirigidas, parada próxima à referência, seis rodas apoiadas, desligamento, saída de Dante, caminhada, operação, retorno e saída viária. Custos e sequência das Sementes continuam ativos. As fixtures representam a campanha válida na entrada de cada local; não se afirma que o continente inteiro foi percorrido numa sessão.

A [matriz](docs/ACESSIBILIDADE_NUCLEOS_0.9.0.md) lista cada local, distâncias, painéis, provas JSON e imagens. Problemas de cerca no pátio, retorno do Cofre 1, frestas de curva, tangentes em montanha e frenagem estão registrados com tentativas anteriores preservadas.

## Viagens físicas verificadas

Novo jogo → barracão → sobrevivente/Semente → rodovia → Oficina do Cotovelo/Dona Marta → entroncamento → Cinza Nova/Nilo/compra de 20 L → Vale/terra → Núcleo 1 → Tomás/gerador → terminal → ativação → salvar/carregar: **3.181,69 m**, três trechos dirigidos, sem teleporte de diagnóstico, integridade final próxima de 100% e console sem erros. Inventários e navegação foram conservados na recarga.

A alternativa A foi dirigida separadamente desde a bifurcação até o Núcleo 1, pela alça leste: **2.506,72 m**, maior afastamento da linha planejada inferior a 1 m. Não é somada à viagem de Novo jogo como se fosse uma sessão única.

O diagnóstico acelera o tempo do `Game.fixedUpdate` original a 60 Hz e aplica entradas normais ao Rapier. Não atribui posições, velocidades, recursos ou progressão durante os trechos. Os zeros de teleporte nos JSONs referem-se a teleporte diagnóstico; carregar a partida e o posicionamento normal de entrada/saída do jogo permanecem. Esses testes não são uma viagem humana em tempo real.

## Saves e persistência

Schemas 1–3 continuam legíveis. Navegação e revisão geográfica são campos opcionais validados. A migração reconstrói o piso triangular antigo, conserva deslocamento vertical e retira posições de novas construções para vias livres próximas, até 180 m. É determinística, idempotente, registrada e sem alteração de recursos, decisões, relógio, Núcleos ou recompensas. Inclui paredes da garagem e novo posto. O estoque novo é introduzido uma única vez.

O E2E focado validou recuperação próxima de um save dentro de uma casa, rota persistente e ausência de duplicação. A viagem piloto validou salvar e recarregar o progresso real. A prova de reinício real do servidor fica em `evidence/roads-0.9.0/restart.json` quando concluída.

## Arquivos e assets

Principais módulos novos/alterados: roadNetwork/cityLayout/roadSites; navigation/{curves,roadIndex,routePlanner,Navigator}; roadProfile/networkRoadGeometry; CityWorld/WayfindingWorld; terrain/terrainGeometry/World/PropBatch; roadMigration/travelState/schema; Game; NavigationMap/RoutePlanner/NetworkMap/Hud; controladores de estabelecimentos e journal para reconhecer Nilo. Testes novos cobrem rede, curvas, geometria/colisão, declives, navegação, clima, migração e cidade. Scripts registram viagens, acessos, comparação de frenagem e capturas.

Nenhum asset externo novo foi instalado. Modelos locais do Titã, personagem CC0, estabelecimentos e oito materiais Poly Haven foram reaproveitados. GLB, cabine, pivôs e quatro módulos narrativos preservam seus hashes. Créditos e restrições existentes, inclusive carros CC BY-NC e Fab ausente por licença desconhecida, permanecem; não há liberação comercial geral.

## Validação desta atualização

| Verificação | Resultado atual | Evidência |
| --- | --- | --- |
| Unitários | 196/196, 27 arquivos | final-unit.log |
| Build Next.js | Aprovado | build.log |
| E2Es novos focados | 3/3 | focused-browser.log |
| E2E integral | Em preparação | final-e2e.log |
| Auditoria de piso | 3.558 amostras, 22 em emendas, zero falhas | road-surface-audit.json |
| Acessos físicos locais | 14/14 | final-access/matrix.json |
| Viagem piloto e alternativa A | Aprovadas | pilot/journey.json; physical-route-a/drive.json |
| Saves antigos e recarga | Unitários + E2E + piloto aprovados | focused-browser/roads-navigation/legacy-migration.json |
| Reinício real | Em preparação | restart.json |
| Proteções da base | 10/10 hashes preservados | protected-hashes.json |

Os 175 unitários e 28 E2Es da 0.8.2 são referência histórica, não estes resultados. Nesta tarefa a base também repetiu 175 unitários antes das mudanças. Falhas e rechecagens da 0.9.0 foram mantidas, sem somar execuções focadas como uma integral verde.

## Comparações e desempenho

[Onze pares reais](docs/COMPARACAO_VISUAL_0.9.0.md) e [galeria HTML](evidence/roads-0.9.0/comparison.html) com mesma pose, horário e perfil. `render-comparison.json` registra draw calls, triângulos e recursos antes/depois. Capturas de cena usam diagnóstico, não são prova de percurso. As viagens têm provas próprias.

Na verificação focada da cidade: Baixo 146 calls/197.728 triângulos; Médio 270/358.766; Alto 287/418.812. Streaming descarregou a cidade e seus corpos e voltou à mesma contagem, sem duplicação. Esses contadores são do renderizador por software, não FPS em GPU física. O minimapa não ocupa o painel de instrumentos. As capturas noturnas finais aguardam a transição de câmera/render para evitar imagens intermediárias.

## Limitações e próximos passos

Windows/GPU, áudio, conforto de manobra, aprovação artística e viagem humana completa continuam exigindo [avaliação manual](docs/TESTE_MANUAL_0.9.0.md). Não há alegação de 60 FPS. Só a cidade piloto é dirigível como cidade nesta versão; outras regiões preservam seus locais e ganham acessos/alternativas, sem afirmar que foram reconstruídas integralmente.

Quatro finais, rostos finais, contato completo de escalada e retrovisores dinâmicos continuam pendentes da base. Não foram simulados com telas ou marcados como prontos. A expansão de cidades deve seguir o mesmo contrato do grafo e pisos.

A [0.10.0](docs/ROADMAP_0.10.0.md) deverá integrar garagem, propriedade de caminhões, configuração/pintura e auditoria dos quatro candidatos locais. Nenhum deles foi declarado dirigível nesta entrega. Main e PR #1 permanecem protegidos até revisão; nenhum force push ou merge automático foi realizado.

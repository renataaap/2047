# Restauração ambiental 2.0 — diagnóstico e contrato

Base real: main 4771193, que contém a 0.10.0/PR #4. Área inicial limpa, sem descarte de alterações. Desenvolvimento em feat/restauracao-ambiental-0.11.0. Leituras: AGENTS, status/README, relatórios 0.10.0/0.9.0/0.9.1, arquitetura rodoviária e reformulação realista.

## Referência executada nesta tarefa

- 225 unitários/31 arquivos aprovados novamente; build aprovado, sequencialmente, sem navegador/dev concorrente.
- Dezesseis capturas reais: oito vistas devastadas e oito da restauração antiga, 09h/Baixo/75%/1280×720. Sem erros de console. Fonte da cena 4771193; novos módulos de progresso ainda não estavam integrados.
- evidence/restoration-0.11.0/before. Enquadramento diagnóstico, não prova de uma viagem humana ou GPU Windows.

## Problemas concretos

CampaignWorld mantém 220 cones e chuva para o primeiro campo. NetworkWorld mantém 160 cones por Núcleo posterior e outra chuva, excluindo Mar de Cinzas. Os dois caminhos têm limites geográficos e interpolação diferentes. Matrizes de plantas são reescritas em todo frame, inclusive quando a maturidade já foi alcançada. O efeito não tem idade ecológica persistente; uma recarga reinicia o crescimento visual.

syncRestoration mantém os booleanos de região e restoredAt identifica o Núcleo mais próximo dentro do bioma. Cidades e Cordilheira já possuem duas faixas. Essa autoridade não deve ser substituída por um booleano novo nem pela distância ao terminal.

O solo alterna grupos de materiais de acordo com a ancoragem. CampaignWorld também tinge o material ground globalmente. TerrainBlend/PBRLibrary têm a correção crítica de 16 samplers e slots vivos; não acrescentar samplers para umidade/vegetação.

O índice viário compila todas as vias, incluindo ruas de Cinza Nova, alças e acessos, e os pátios. roadReserved reserva a cidade inteira para decoração antiga; a vegetação precisa de exclusão mais específica, compartilhando footprints dos edifícios e preservando os serviços/áreas de manobra.

## Implementação incremental

1. Progresso puro em campaign.world.recovery, extensão opcional do schema 3. Idade por Núcleo ativo, observações únicas e flag de apresentação; sem posições de plantas. Saves já ativos migram uma única vez para recuperação avançada e não repetem cinematografia.
2. Resposta imediata, recuperação inicial aos 45 segundos e avançada aos 240 segundos de simulação ativa. Sem avanço em menus/garagem e sem usar relógio de parede.
3. Distribuição estável por Núcleo/setor/tipo, com grama, arbustos ramificados e árvores jovens autorais. Instâncias, cache, LOD, níveis de densidade e descarte por proximidade. Não baixar arquivos nem alegar instalação externa.
4. Cobertura e umidade heterogêneas por coordenada no shader, sem novos samplers, mantendo a malha/collider e os slots do PBR.
5. Uma apresentação atmosférica/chuva para todos os biomas e sequência curta, pulável e com redução de movimento, posterior à transação real da missão. Não condicionar recompensa/ancoragem a assistir à sequência.
6. Diário/mapa e reações contextuais separadas, sem reescrever quatro módulos narrativos ou pagar recompensas.
7. Protótipo completo do Núcleo 1 e validação visual antes de expandir os perfis dos demais biomas; depois regressão e acessos com os dois caminhões.

## Preservação e limites

Não mudar tuning/massa, seis rodas, GLBs dos veículos, garagem, grafo, colisores de terreno, sequência de Cofres/Sementes ou textos históricos. Densidade zero do cenário fixo continua obrigatória. Não remover mecanismos de gameplay da restauração antiga: abertura de barreiras, drenagem, condições de risco e restauração por faixa.

Contagens antigas de 160/220 cones nos testes precisam passar a verificar vegetação real e distribuição, mantendo as demais asserções. Não ocultar falhas reduzindo limites de desempenho. Windows/GPU, audição e sessão humana serão descritos separadamente dos testes com SwiftShader.

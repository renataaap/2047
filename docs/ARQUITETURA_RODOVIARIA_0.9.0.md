# Arquitetura viária 0.9.0

O corredor de 21 km continua existindo e mantém coordenadas, locais, narrativa e obstáculos. `roadProfile.js` conserva o perfil antigo, reexportado por `terrain.js`. O novo grafo em `roadNetwork.js` acrescenta ruas, alternativas e acessos; a migração é gradual.

## Contrato compartilhado

Cada segmento possui ID, nós de início/fim, controles de curva ou perfil legado, largura, piso, tipo, velocidade de referência, conservação, risco, região, desbloqueio e restrição de acesso. `roadIndex.js` compila comprimento real, declividade, amostras métricas, conexões e índices espaciais. O grafo possui vias bidirecionais e suporta mão única.

As curvas são amostradas com espaçamento limitado; as normais laterais compartilhadas unem seções sem frestas nas rodas. Os cruzamentos têm pátios físicos e o planejador arredonda conversões. Rodovias, ruas urbanas largas, terra com trilhas físicas, montanha e acessos possuem larguras, pisos e velocidades próprios.

`networkRoadGeometry.js` produz lotes por superfície/setor. Os mesmos arrays de posição e índices são enviados à renderização e ao trimesh Rapier. `terrain.js` consulta a mesma rede para altura, piso e faixa reservada; `terrainGeometry.js` acomoda o leito da estrada sob o pavimento. Ombros conectam via e solo. As posições físicas continuam sendo interpoladas dos triângulos de World, não apenas de uma fórmula analítica.

A auditoria de piso lança raios Rapier no centro e nos corredores das rodas, incluindo os dois setores simultaneamente nas emendas. As tentativas com frestas, interferência do terreno e cerca do pátio são preservadas como evidência das correções.

## Cinza Nova

Cidade compacta a oeste do km 0,62, ruas nas três faixas x=-360/-240/-120 e z=-620/-760/-900, com cruzamentos amplos. Conecta posto com Nilo/estoque finito, pátio cívico, carga industrial e garagem física. A Oficina do Cotovelo mantém posição e regras próprias. A saída sul liga ao Vale e retorna à rodovia antes do Posto Boa Viagem; a alça leste pavimentada continua disponível.

`CityWorld` reutiliza PropBatch, PBR, mobiliário e acabamento existentes. Fachadas, janelas/portas, marquises, calçadas com passagens, armazéns, pátio e galpão de garagem são composições autorais. Construção próxima, culling, agrupamento e descarregamento evitam carregar uma cidade permanente em todo o continente. A garagem não implementa compra, skins ou seleção de veículos.

## Planejamento e orientação

Dijkstra usa distância efetiva e velocidades dos segmentos, risco, piso, inclinação e massa. Os perfis rápida/segura/econômica têm custos distintos; diesel e tempo são estimativas, não cobrança antecipada nem promessa de consumo exato. Posição inicial é projetada numa via válida; bloqueios da campanha são respeitados. Alternativas antigas de leste/oeste selecionam passagens reais do grafo.

`Navigator` mantém objetivo da campanha ou destino escolhido, progresso, conversões calculadas da geometria e recálculo ao alcançar outra via. Passagem opcional pelo Vale fica persistida e concluída ao cruzar o local. Não existe consulta a mapas/satélites externos. O minimapa SVG acompanha posição/orientação e usa o mesmo grafo do mapa M; a pé destaca interlocutores, terminais e acessos próximos.

## Persistência e compatibilidade

Schemas 1–3 permanecem aceitos. `travelState.js` valida campos opcionais de navegação e revisão geográfica sem importar o renderizador no backend. `roadMigration.js` reconstrói o piso físico antigo com a topologia original, conserva deslocamento vertical e resolve construções novas por amostra viária livre próxima (até 180 m). O registro contém entidade, motivo e posições; aplicação idempotente, sem alterar inventários, missões ou recompensas. Estoque do novo posto é introduzido uma única vez.

Não alterar GLB, pivôs, rodas, massa, Rapier, regras da campanha ou falas para acomodar a rede. Dez hashes da base verificam essas proteções. O modo de passos controlados existe somente no diagnóstico de desenvolvimento; avança o Game.fixedUpdate original, sem atribuir posições, recursos ou velocidades. Fixtures locais não são apresentadas como viagens completas.

## Correção encontrada no piso estático

O acesso do Núcleo 6 expôs frenagem insuficiente sobre os trimeshes fixos. Um teste comparativo com a mesma geometria e o Titã carregado isolou a massa calculada das malhas abertas do chão: embora o corpo fosse fixo, o controlador de rodas consultava propriedades locais no cálculo do contato. `World.collider` e os sólidos do PropBatch agora usam densidade zero, apropriada para cenário fixo. O controlador, sua conversão de força em impulso, parâmetros, massa do Titã e seis rodas não foram alterados.

A API instalada documenta `setWheelBrake` como impulso máximo. O [código oficial do controlador](https://github.com/dimforge/rapier/blob/master/src/control/ray_cast_vehicle_controller.rs) mostra o uso de propriedades locais no denominador do contato. A reprodução na versão instalada está em `static-ground-braking.json`; o teste unitário usa a malha real da aproximação do Núcleo 6. Não se trata de aumentar arbitrariamente a força dos freios.

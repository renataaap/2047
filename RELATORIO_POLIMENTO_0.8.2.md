# 2047: Rede Aurora — polimento 0.8.2

Atualização sobre main `d8a3b2a` (0.8.1), isolada em `feat/polimento-0.8.2`. Código real em JavaScript/Next.js/Three.js/Rapier/libSQL, sem troca de stack, assets-fonte ou controladores. Main preservada. A implementação está em revisão; a validação Windows/GPU e as pendências artísticas abaixo não são consideradas concluídas.

## Resultado e escopo

O Titã ganhou uma cabine modular com volume e instrumentos reais, acabamento externo adicional e motorista sentado. Personagens importantes têm roupas e equipamentos próprios ligados ao rig existente. O barracão, posto, oficina, três POIs e fábricas receberam acabamento. A loja tornou-se acessível fisicamente. O terreno recuperou o albedo PBR que estava sendo multiplicado por um atributo de cor ausente. O diário usa os registros existentes da partida, sem pagar itens automaticamente.

As mudanças são verificáveis em jogo e nas capturas, não somente em CSS. Não representam arte humana fotorealista final, animação completa de escalada ou conclusão do jogo inteiro.

## Titã: exterior e preservação da 0.8.1

- GLB do Titã **inalterado**, com SHA-256 igual à main original. Mantidos os oito materiais por função e as políticas de opacidade, profundidade e vidro da 0.8.1.
- Degraus perfurados, fixações, reservatórios de ar, mangueiras, ferragens de carga, trilhos e escapamento moldado. Emissão de fumaça reposicionada no tubo; o efeito não é ocultado junto ao exterior antigo.
- Seis rodas importadas, pivôs, eixos físicos, suspensão, massa, escala, direção e colisores do caminhão preservados. Física e parâmetros de condução têm hash idêntico ao inicial.
- Na câmera interna, oculta-se a cabine importada que sobreporia o interior, preservando baú/chassi/rodas. Ao descer F, o exterior volta integralmente. O acabamento procedural de emergência permanece disponível se o import falhar.

## Cabine e instrumentos

Interior em `CabinInterior.js`: bancos moldados, encostos, apoios, costuras, trilhos, cintos, painéis de porta, maçanetas, bolsos, coluna/volante, três pedais, alavanca, console, ventilação, rádio, compartimentos, para-brisa, borrachas, limpadores, retrovisores e objetos de viagem. Materiais separados de revestimento, tecido, pintura, metal, borracha, papel, vidro e iluminação; pequenos mapas originais em sRGB/dados conforme a função. Texturas e materiais reutilizados e liberáveis.

Velocímetro, RPM, combustível, temperatura e marcha reutilizam os instrumentos existentes. Acrescentados indicadores reais de motor, estacionamento, faróis e alerta de temperatura. Nenhum mostrador recebe animação fictícia. Na primeira inspeção, o molde escondia os mostradores; a geometria foi corrigida e recebeu teste de linha de visão. O volante ainda pode atravessar parcialmente a visão de um mostrador, como numa cabine real.

Âncora dos olhos reposicionada dentro da casca importada, com visão da estrada e limites de olhar laterais/verticais. Preservados suavização, movimento da cabine e alternância C. O par antes/depois da cabine usa o mesmo modo/horário, mas a posição dos olhos mudou intencionalmente. Retrovisores são superfícies estáticas; imagens dinâmicas traseiras não foram implementadas.

## Dante, NPCs e animações

| Personagem | Identidade aplicada no rig existente |
| --- | --- |
| Dante | Jaqueta de trabalho com volume, costuras/fechos, mochila moldada com tiras e fivelas, barba, boné e botas |
| Zeca | Colete utilitário, boné, óculos, bolsos e rádio |
| Tomás | Avental curvo de couro, ferramentas, óculos de proteção e protetores auriculares |
| Mãe Ivani | Lenço, xale, avental longo e óculos |
| Sobrevivente do Abrigo 07 | Capuz aberto no rosto, cachecol, casaco remendado e mochila de lona |
| Dona Marta | Macacão, cabelo preso, óculos, mangas e cinto de ferramentas |

Pequenas diferenças de mandíbula/nariz, revestimento e altura visual. A base anatômica MakeHuman CC0 continua compartilhada e provisória; não foi importado um novo rosto final. As roupas não se resumem a uma troca de paleta, mas o refinamento anatômico e facial ainda é limitado.

Membros e acessórios acompanham os ossos. Caminhada/corrida continuam ancoradas no controlador Rapier; velocidade dos clips acompanha a locomoção real. Olhar sutil, mudança de postura e gestos ambientais leves usam o mixer existente. Reação ao iniciar conversa não muda falas ou consequências.

Motorista sentado nas câmeras externas, com joelhos e braços articulados. A pose visual é restaurada antes de cada atualização do mixer, inclusive ao descer, para não manter ossos dobrados em tracks constantes. O teste utiliza a hierarquia do GLB real e verifica translações/raiz preservadas.

Entrada/saída mantêm os controles e a posição livre sobre o terreno. Gesto existente, pose sentada e transição visual melhoram a continuidade. **Não há ainda uma subida completa com mãos nos apoios, pés nos degraus e porta articulada.** Os clips atuais não oferecem esses contatos. Não se acrescentou atraso nem outro controlador para simular a conclusão dessa arte.

## Mar de Cinzas, estabelecimentos e estrada

- Barracão: bancada de revisão, ferramentas, motor de partida, soquetes, panos, cama com coberta/costuras, prateleira, caneca, caderno, roupa guardada e iluminação de tarefa. Corredor e objetos do tutorial preservados.
- Posto Boa Viagem: abertura física na loja, balcão/prateleira internos, gavetas, utensílios, etiquetas das bombas, uniões e iluminação. Zeca, bomba, posição e serviços preservados. Abertura atravessada pelo jogador Rapier em teste.
- Oficina do Cotovelo: bancada com peças, cabeçote, soquetes, ferramentas, mangueiras, gavetas e luz de trabalho. Compra e manutenção continuam nos sistemas existentes.
- Motel Última Luz: cortinas moldadas, chaves, roupa de cama e pequenos objetos de recepção. Pátio dos Retornantes: compressor, ferramentas e mangueiras. Balança Rodoviária 07: fixações, equipamento e sinalização. Pisos, rampas e ações finitas preservados.
- Estrada: acabamento de guardrails, placas, acampamentos, árvores secas e sucata, dentro das composições determinísticas existentes. Fábricas receberam caixilhos, portas, tubulação, ventilação e guarda-corpos. Não se espalharam colisores em parafusos e pequenos objetos.
- Pedras próximas mais subdivididas; colinas de fundo mais suaves e com escala de UV corrigida. LOD e instanciamento mantidos. As colinas são cenário distante; não são uma nova superfície física dirigível.

O material de terreno usava `vertexColors`, mas faltava o atributo `color`. A correção fornece o atributo ao shader, recuperando os mapas locais. Cinco setores foram comparados binariamente com a main: posições, normais, UVs e índices idênticos. Nenhuma elevação ou collider do terreno foi trocado para produzir a diferença visual.

Mãe Ivani estava encoberta por uma malha auxiliar marcada invisível que `mergeStatic` incorporava como peça preta. Removida somente essa malha; o colisor físico permanece. As capturas no mesmo ponto mostram a personagem após a correção.

## Atmosfera, apresentação e diário

Relógio, ciclo solar, chuva, poeira, restauração, faróis e áudio existentes preservados. Bancadas têm iluminação de tarefa de dia/noite. São ativadas no máximo duas luzes locais dentro do alcance, além da luz da cabine; não se criaram dezenas de luzes por objeto. Sem bloom ou filtro novo sobre a estrada.

Pequenos ajustes de hierarquia, alinhamento numérico, texto e tamanho do HUD na cabine. A transição respeita redução de movimento. Textos narrativos dos quatro módulos protegidos são idênticos à base. Menu e sistema de diálogo existentes não foram recriados.

J abre o caderno com **Descobertas da estrada**: visita, reserva recolhida, boletim, parada e Núcleo ativo atualizam registros únicos. Entrar a pé na área acessível dos três POIs registra a descoberta; passar na estrada, dirigir ou estar no teto não basta. Não há coleta automática, missão paralela, recompensa infinita ou timestamp inventado. Os dados vêm de campos já persistidos; saves antigos continuam legíveis.

## Assets e licenças

Nenhum asset externo novo foi baixado nesta atualização. Reutilizados os oito Poly Haven instalados: road_damaged_2, gravel_road, mud_cracked_dry_03, dirt, rocky_terrain_03, rusty_metal_05, rust_coarse_01 e corrugated_iron. Mapas locais, variantes por perfil, mistura PBR e cache preservados. Tecido/madeira/concreto de fallback e detalhes adicionais são procedurais originais, não downloads alegados.

Mantidos Titã de Alt, garagem de Yury Misiyuk, posto de SURVIVED, barril de mxtc e caçamba de ElectroNick sob seus créditos CC BY 4.0; base humana MakeHuman CC0. Carros Renafox continuam CC BY-NC 4.0. Não há liberação comercial global. Pacote Fab sem licença confirmada continua fora. Quatro caminhões extras continuam preparados, sem serem novos veículos dirigíveis.

## Comparações reais

Referência anterior: `evidence/polish-0.8.2/before`. Resultado: `after`. [Comparação que abre diretamente no GitHub](docs/COMPARACAO_VISUAL_0.8.2.md), [galeria HTML para abrir localmente](evidence/polish-0.8.2/comparacao.html) e dados em [comparison.json](evidence/polish-0.8.2/comparison.json), gerados pelo script `scripts/comparar-polimento.mjs` após a captura final.

Vinte pares reais: menu, barracão, moradia, estrada, Dante de costas/frente, sobrevivente, Zeca, oficina, Marta, três POIs, Tomás, Ivani, exterior/interior do Titã, entardecer, noite com faróis e cabine noturna. Ângulos adicionais mostram loja acessível, interior do motel, bancos/portas/pedais da cabine e luzes noturnas locais. São 20 pares e sete ângulos adicionais no Baixo. Três capturas separadas no Alto (Titã externo/interno e bancada) e uma no Médio (cabine) verificam esses perfis, sem misturá-los à comparação equivalente do Baixo. PNGs são os arquivos reais do navegador, sem montagem promocional ou tratamento de imagem.

Mesmo roteiro, posições, horários, viewport 1280×720 e perfil Baixo a 75%. A nova âncora interna muda seu enquadramento; animação, partículas e pequenas variações de tempo entre frames não são idênticas. Viagens/horários de diagnóstico foram usados nas capturas, não numa suposta sessão humana completa.

## Validação nova, sem confundir com histórico

| Execução | Resultado nesta atualização | Evidência |
| --- | --- | --- |
| Antes: npm test | 167/24 arquivos aprovados | baseline-unit.log |
| Antes: npm run build | Aprovado, dev parado | baseline-build.log |
| Antes: npm run test:e2e | 25/25 numa única execução integral, 26,3 min | baseline-e2e.log |
| B: unitários e regressão relevante | 174 unitários e 3 E2Es aprovados | titan-unit.log / titan-e2e.log |
| C: personagens/pose e regressão | 175 unitários; 3 E2Es relevantes aprovados | characters-unit.log / characters-e2e.log |
| D: cenário e loja | 175 unitários; 1 E2E novo aprovado | environment-unit.log / environment-e2e.log |
| E: cabine, loja e diário | 175 unitários; 3 E2Es novos aprovados numa rodada | experience-unit.log / experience-e2e.log |
| Final 0.8.2: npm test | 175/25 arquivos aprovados | final-unit.log |
| Final: npm run build | Aprovado, dev parado | final-build.log |
| Primeira integral 0.8.2 | 26/28, duas falhas de sincronização após teleporte | regression-first.log |
| Rechecagem das duas falhas | 2/2: primeira entrega e Núcleos 2–7, com física/saída confirmadas | settled-exit-e2e.log |
| Segunda integral 0.8.2 | 27/28, limite de 40 s de parede no trajeto de treino | regression-second.log |
| Rechecagem do tutorial | 1/1 aprovado em 2,4 min, com os 21 objetivos e recarga | tutorial-recheck.log |

Logs próprios em `evidence/polish-0.8.2/`. Outputs das regressões antigas são copiados para subpastas desta atualização e seus caminhos históricos restaurados, sem apresentar dados antigos como novas execuções. Três cenários foram acrescentados; não se somam rodadas repetidas como cenários únicos extras.

Oito testes unitários novos verificam cabine/vidro/visada, mostradores reais, atributo do terreno, roupas/rig, diário antigo/único/sem recompensa, área de descoberta, porta física e pose sentada no rig real. A auditoria em [source-audit.json](evidence/polish-0.8.2/source-audit.json) registra os sete hashes protegidos e cinco setores.

## Desempenho e limites da medição

Streaming 3×3, cache, descarte de leases, PBR por perfil, instâncias, culling, LOD e limite de partículas preservados. Peças pequenas de cenário são agrupadas por material; roupa é agrupada por osso/material. Tecidos dos atores compartilham cache com contagem de referências. Texturas pequenas do interior reaproveitam mapas; geometria/material/texture têm descarte previsto. Não foram adicionados loops RAF ou listeners por objeto.

Métricas das mesmas cenas em comparison.json:

| Cena | Draw calls antes → depois | Triângulos antes → depois |
| --- | --- | --- |
| Menu | 40 → 44 | 83.381 → 118.949 |
| Barracão | 104 → 136 | 107.576 → 155.794 |
| Estrada inicial | 99 → 125 | 133.916 → 186.930 |
| Oficina | 51 → 64 | 84.326 → 127.108 |
| Titã externo | 51 → 85 | 105.274 → 187.190 |
| Cabine | 107 → 138 | 121.825 → 197.723 |

Na condução de aceite no Médio, o mesmo roteiro de oito segundos simulados passou de 142 chamadas / 218.894 triângulos para 226 / 397.762, dentro do orçamento original de 300 / 500.000. A média em software caiu de aproximadamente 0,64 para 0,36 FPS. Ver driving-budget.json. O custo é significativo e precisa de avaliação em GPU antes de promover esta versão a arte/desempenho finais.

Os perfis conferidos registraram aproximadamente 32 MiB no loader do Baixo, 128 MiB no Médio e 256 MiB no Alto, com seis rodas e sem erros de assets. Esses valores não incluem toda a VRAM.

Nove setores em ambos; loader mantém 24 texturas e aproximadamente 32 MiB estimados no perfil Baixo. Mais geometria e chamadas são o custo mensurado das novas peças/roupas e da subdivisão. O custo aumentou: não se afirma melhoria de FPS. Na amostra de software, barracão passou de aproximadamente 1,37 para 1,16 FPS; cabine de 1,57 para 0,92 FPS, com enquadramento intencionalmente diferente. Essas amostras dependem de compilação/cache, histórico da sessão e carga do ambiente; não medem GPU física nem isolam cada módulo.

Contagens após a instrumentação incluem geometrias e texturas do renderer. A estimativa do AssetManager cobre texturas geridas pelo loader, não todos os mapas procedurais; renderer.info acrescenta contagens depois da instrumentação. Não há medição equivalente de VRAM antes da nova instrumentação.

O navegador disponível usa **ANGLE SwiftShader por software**, com FPS baixo. Não foi medida GPU física, nem comprovados 60 FPS ou experiência Windows. Aumentar subdivisão e detalhes tem custo; os números finais devem ser lidos por cena, sem transformar uma média de software em benchmark de hardware.

## Problemas encontrados e corrigidos

1. Moldura inicial ocultava mostradores: geometria ajustada após captura real e teste de visada adicionado.
2. Olhos acima do teto importado: âncora interna corrigida, com fallback para fixtures/modelos antigos.
3. Solo preto: atributo de cor exigido pelo material fornecido, preservando a malha física.
4. Ivani coberta por proxy fundido: malha auxiliar removida sem alterar seu colisor.
5. Pose sentada poderia permanecer em tracks estáticas: restauração explícita antes de atualizar o mixer.
6. Fumaça na altura do escapamento antigo: ponto visual reposicionado no tubo, com visibilidade preservada.
7. Evidência do diário capturada durante fade e fora da rolagem: teste final aguarda a animação do painel e verifica o registro no viewport antes da captura. Diário movido para o início do caderno para facilitar o acesso.
8. Vista lateral revelou abertura abaixo do painel: parede inferior fechada, teste de visada acrescentado e quatro ângulos internos recapturados.
9. Vidro antigo avançava sobre a parte superior da porta do posto: recortado junto à janela, verificação visual por raio na altura dos olhos e recaptura do local. Uma rodada integral foi interrompida manualmente após 8 aprovações para fazer a correção; não é contada como integral aprovada. Pequeno ajuste também apoia a ventilação industrial sobre o telhado.

Os dois testes antigos tentavam F após 800/1000 ms de parede, enquanto o teleporte ainda precisava de passos físicos. A espera foi substituída por freio, 120 passos reais, velocidade segura, motor desligado e modo a pé confirmado. O retorno da pausa e a entrada no Titã também recebem confirmação. As regras da aplicação não foram relaxadas. Os dois fluxos passaram na rechecagem antes da nova integral. Arquivos: tests/helpers/parked-exit.js e os cenários phase2/phase4. O contador singular do diário foi corrigido. Capturas e contextos da falha ficaram separados dos resultados finais; traces com possíveis cabeçalhos de teste não são publicados.

Na segunda integral, 27 cenários passaram e o trajeto do tutorial terminou seu limite de 40 segundos de parede a 0,51 m da chegada, ainda a 8,57 km/h. O contexto/estado está em tutorial-timing. O teste mantém trajeto, controles e chegada; agora permite 90 segundos de parede com limite de 60 segundos simulados. A rechecagem do tutorial inteiro passou em 2,4 minutos, com os 21 objetivos, ativação e recarga. Nenhuma regra de movimento da aplicação foi alterada.

## Primeiros 30 minutos e pendências

Não foi simulada uma sessão humana honesta de 30 minutos. Os testes automatizados cobrem partes separadas do fluxo, incluindo tutorial, direção, interações, Sementes e persistência; seus deslocamentos diagnósticos são declarados. O roteiro [TESTE_MANUAL_0.8.2.md](docs/TESTE_MANUAL_0.8.2.md) descreve a viagem real sem teleportes, com reserva de 4 L de diesel e uma peça para o gerador. Windows/GPU, sensação de condução, audição e viagem humana completa permanecem pendentes.

Para a 0.9.0: arte facial/roupas/animações finais, contato completo na cabine e portas articuladas, retrovisores dinâmicos conforme orçamento e polimento artístico adicional. Economia dinâmica, contratos, Código da Última Estrada, facções, rotinas completas, quatro caminhões extras e quatro finais continuam no [roadmap](docs/ROADMAP_APOS_0.8.0.md). A Voz permanece sem revelação antecipada.

Reinício adicional: scripts/verificar-reinicio-polimento.mjs prepara uma partida própria por API, mantém sua identidade somente em arquivo temporário fora do Git e verifica os dados após parar/reiniciar o servidor. Resultado aprovado em restart.json: dados idênticos após reinício real, incluindo visita, horário, inventário e posições. Não é sessão humana nem substitui a carga pela interface.

## Arquivos e retomada

Veículo/render: CabinInterior.js, TruckFinish.js, model.js, TruckVisual.js, Instruments.js, Cameras.js e diagnóstico em Game.js. Personagens: CharacterActor.js, PlayerVisual.js, SeatedPose.js, WorkerFinish.js, WorkerWardrobe.js, workerDefinition.js e correção em ExpeditionWorld.js. Mundo: AmbientWorld.js, DiscoveryWorld.js, RoadWorld.js, World.js, terrainGeometry.js, finishCompositions.js, landscapeGeometry.js, shopShell.js e groundColors.js. Diário/UI: discoveryJournal.js, DiscoveryJournal.js, NetworkPanelContent.js, GameView.js, polish.css e layout.js. Versão técnica: package.json/lock, pt-BR.js e ui.js. Créditos, scripts, documentação e testes complementam a entrega. A lista exata será registrada em docs/ARQUIVOS_0.8.2.txt.

Checkpoints A–E em [INCREMENTOS_0.8.2.md](docs/INCREMENTOS_0.8.2.md). Rodar `npm ci`, `npm run dev`, abrir localhost:3000 no computador que executa o servidor. Para atualizar, preservar local.db e o cookie do navegador. GitHub guarda o projeto, não sincroniza partidas. Desenvolvimento continua em feat/polimento-0.8.2; a main só deve receber a alteração após revisão do resultado e das pendências.

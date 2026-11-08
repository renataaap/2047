# Incrementos da restauração 2.0

Base: main 4771193/0.10.0, branch feat/restauracao-ambiental-0.11.0. A versão da aplicação permanece 0.10.0 até a validação dos requisitos essenciais.

## Checkpoint A — diagnóstico

Commit b79f732. Leituras obrigatórias, área limpa, main integrada, 225 unitários executados novamente e build aprovado. Dezesseis capturas da implementação anterior, inclusive a restauração antiga. Onze arquivos protegidos registrados em evidence/restoration-0.11.0/protected-base.json. Não houve execução integral E2E da base nesta tarefa; seus 39 resultados históricos não são novos resultados.

## Checkpoint B–E — implementação para validar

- Progressão por Núcleo em extensão opcional de schema 3; resposta imediata, estágio 2 aos 45 s e estágio 3 aos 240 s de simulação ativa. Menus não avançam o relógio ecológico. Migração determinística dos campos já ativos para maturidade, sem nova ativação/recompensa.
- Modelos originais: grama curvada, arbustos ramificados e árvores jovens com tronco, ramos, UVs e folhas dobradas em volume. Casca e nervuras de folhas são texturas procedurais locais autorais. Nenhum modelo externo foi baixado.
- Distribuição por faixas ecológicas/setores de 256 m, sementes estáveis, manchas irregulares. Exclusão de todo o grafo, pátios, edifícios, reservas de interação e composições de cenário. Altura consultada nos triângulos visuais/físicos. Instâncias e dois LODs, perfis de densidade, matrizes atualizadas por mudança de idade, descarte e até doze colisores simplificados de árvores próximas; cenário fixo com densidade zero.
- O primeiro protótipo era muito esparso. O segundo aumentou agrupamentos e copas; capturas preservadas em prototype e prototype-2. Baixo chegou a 621.552 triângulos numa vista ampla e o primeiro preparo de geometrias chegou a 208 ms. Esses resultados motivaram geração de raízes em fatias curtas; métricas finais ainda serão comparadas. Não alegar 60 FPS/GPU real.
- Solo com manchas de cobertura e umidade por coordenadas, sem texturas novas, sem deslocamento da malha/collider e reutilizando os varyings do TerrainBlend. Uniforms vivos por material. Correção da ordem de composição para que o blend PBR não cubra a recuperação.
- Chuva unificada por faixa, inclusive Núcleo 1, redução de poeira/neblina, céu coerente com o ciclo solar existente. Apresentação Three.js de sete segundos, pulável, ou 1,8 s/câmera fixa com redução de movimento. A missão é confirmada e salva antes da apresentação. Sem replay obrigatório ao carregar.
- Diário derivado de observações únicas persistidas, informações no mapa/GPS existente, reações de NPCs em bloco contextual separado e hortas vinculadas ao estágio. Nenhuma fala principal reescrita. Áudio original sintetizado no contexto existente, com água/folhas e fauna somente após recuperação inicial.
- **255 unitários/34 arquivos aprovados** na rodada deste checkpoint. Testes novos verificam progresso/pausa, saves antigos, exclusões, geometria, samplers/uniforms, ciclo de vida, cutscene/pular/redução de movimento, diário e áudio. Isso não substitui inspeção visual ou regressão E2E.

## Validações ainda em andamento

Navegador do primeiro Núcleo; qualidades com orçamento de 16 samplers; cinco biomas; continuidade da campanha/garagem/frota; acessos físicos com os dois veículos; reinício/persistência real; capturas equivalentes e métricas. Depois, build e suíte completa sequenciais, congelando os hashes. Não declarar esta lista concluída antes de obter os respectivos registros.

## Limites conhecidos

Vegetação é arte procedural autoral, sem alegar bibliotecas profissionais instaladas. Fauna é som sintetizado, sem animais 3D. Validação em Windows/GPU física, audição e uma sessão humana continuam necessárias. Restrições CC BY-NC dos assets históricos permanecem nos créditos.

## Correção intermediária de carregamento

A primeira rodada de navegador falhou na espera de setores após recarga (cinco ainda pendentes em 120 s); o segundo cenário foi interrompido para investigação e dois não rodaram. A rodada seguinte foi interrompida durante o primeiro cenário após descobrir uma inconsistência adicional nas consultas físicas. Logs e imagens parciais estão preservados em focused-1/focused-2; traces completos ficam somente em /tmp, pois podem conter cookies de QA. Não somar essas tentativas como cenários aprovados.

A distribuição estava fatiada por RAF e acabava limitada ao ritmo de aproximadamente um frame por segundo da renderização por software. Load e troca de qualidade agora preparam os setores em pequenas tarefas de carregamento, mantendo a simulação pausada e a última imagem durante a preparação. O streaming em viagem continua gradual e ignora células fora da influência atual.

Foi reproduzida uma segunda diferença: Rapier ainda não inclui colisores recém-criados na broad phase antes do primeiro passo. Consultas da distribuição passaram a usar um índice local de obstáculos fixos e interseções diretas de shapes, sem avançar física ou campanha para preparar a vegetação. Um teste novo verifica posições idênticas antes/depois do passo físico. **256 unitários/34 arquivos passaram** após essas correções; navegador novamente em validação. A duração da apresentação usa tempo visual limitado a um segundo por atualização, separado do timestep fixo e do relógio ecológico.

## Polimento e rodadas focadas

- Terceira rodada: ativação/estágios/recarga e ciclo Baixo–Médio–Alto–Baixo com 16 samplers passaram; o terceiro caso parou por 409 ao tentar criar outra fixture no mesmo slot. Não era falha da API: ela corretamente protege partidas existentes.
- Quarta rodada: ambas as apresentações terminaram e devolveram o controle, mas o cenário falhou pela tentativa do init script de acessar localStorage em about:blank. Preparação corrigida para limpar somente o slot da sessão isolada de QA e acessar storage apenas na origem do jogo.
- Quinta rodada: **2/2 cenários focados aprovados em 3,1 min**, cobrindo apresentação/redução de movimento e seis campos posteriores migrados, nos cinco biomas. Não é uma integral de toda a suíte nem dos quatro casos novos. Logs e capturas permanecem separados.
- Cinco refúgios de recuperação dirigem a composição do primeiro campo, com solo e cobertura heterogêneos. Exclusões de pista/pátios mantêm autoridade. Folhas de grama dobradas, nervuras e gradiente de luz melhoram o detalhe sem acrescentar mapas ao shader do terreno. As bases acompanham o plano triangular inclinado; árvores permanecem verticais.
- Sombras próximas acompanham o jogador mesmo depois da maturidade, sem reescrever todas as matrizes. Snapshot informa sincronização entre progresso e instâncias, para não comparar um estágio novo com a malha do frame anterior. API de regiões expõe o estágio por Núcleo como extensão dos dados existentes.
- **257 unitários/34 arquivos aprovados** após esse polimento. Acessos físicos, garagem restaurada, integral e capturas finais seguem pendentes neste checkpoint.

## Candidata e auditoria de acessos

- **28/28 casos locais aprovados** em `access-main-2`: sete Núcleos e sete Cofres com Titã e Basculante, física original a 60 Hz, interação, maturidade, save/load e saída. A primeira tentativa interrompida permanece preservada. [Matriz e método](ACESSIBILIDADE_RESTAURACAO_0.11.0.md).
- **2/2 acessos à garagem restaurada aprovados**, com aproximação, estacionamento, abertura real e saída em ré.
- **1/1 novo E2E de streaming aprovado em 1,1 min**: duas passagens de diagnóstico pelos cinco biomas no mesmo renderer, posições/contagens idênticas, recursos limitados, matrizes maduras estáveis. Não é uma viagem humana.
- Normais mundiais dos materiais não blendados usam a transformação normal oficial do Three, preservando instanciamento e escala. Não desloca a vegetação nem modifica os colisores auditados.
- Rótulos passam a **0.11.0 candidata em validação**, com pendências explicitamente registradas. A versão não está sendo anunciada como entrega final; a rodada completa seguirá sobre arquivos congelados.

## Interrupção do ambiente e preparação do teste de posto

A primeira tentativa da integral parou quando o ambiente foi reiniciado durante a pausa: oito aprovações, uma falha e 35 casos sem resultado registrado. Build, unitários, freeze, log e capturas parciais foram preservados em `integral-1-interrupted`, sem declarar integral aprovada. Os traces privados de /tmp não sobreviveram ao reinício. A fonte foi verificada idêntica antes da investigação.

A falha ocorreu ao esperar a compra de tanque habilitada após relocar o caminhão em diagnóstico. A regra exige parada, motor desligado e proximidade; o teste não assentava a suspensão antes de abrir um painel que pausa a física. Uma reprodução instrumentada passou (1/1, 1,2 min), com velocidade de 0,0012 m/s e distância de 21,9 m. A velocidade da tentativa interrompida não foi registrada; não se afirma uma alteração na regra do jogo. A preparação agora executa três segundos da física original com freio e verifica velocidade, contatos das rodas e distância antes dos mesmos diálogos/compra/abastecimento. Nenhum arquivo da aplicação foi modificado para esse ajuste. Duas repetições e nova integral seguem em validação.

A preparação intermediária do harness também teve duas tentativas inválidas, preservadas: a primeira não ativava o modo de passos controlados (2 falhas); a segunda mantinha Dante longe, fazendo o streaming remover a superfície do caminhão (1 falha, 1 não executado; interrompida para corrigir). A preparação final reloca ambos na mesma operação antes de assentar, mantém a superfície carregada e não modifica a aplicação. Não contar essas tentativas como regressões do jogo nem como casos aprovados.

A preparação final passou em **2/2 repetições, 2,3 min**, com seis rodas em contato, velocidade abaixo de 0,1 m/s, motor desligado, distância menor que 26 m e as mesmas verificações de diálogo/compra/abastecimento. Resultados em focused-zeca-settled-3. A aplicação continua idêntica a 8479b9a; somente um teste mudou, como registra harness-parking-change.json. Nova integral completa será executada sobre novo freeze, sem somar essas rechecagens como cenários inéditos.

Precisão do registro de interrupção: os 35 casos restantes ficaram sem resultado no log, incluindo um possível caso em andamento. O arquivo original interruption.json usa notExecuted para esse total; ele permanece preservado, sem inferir quais chegaram a começar.

## Fechamento automatizado

Checkpoint **7668207**, aplicação igual a 8479b9a. **257 unitários/34 arquivos e build aprovados novamente**, seguidos de **44/44 E2Es numa única integral de 61,9 min**, um worker, zero falhas/skips/retries. Os 277 arquivos congelados permaneceram iguais; onze hashes protegidos iguais. Resultado em final/browser-results.json, final/e2e.log e validation.json. Nenhum build ou outro browser WebGL pesado foi executado simultaneamente.

Reinício real: porta do processo 2262 encerrada, novo processo 5769 observado; **2/2 saves ambientais recuperados com dados/versões iguais**, além do save da garagem/frota. Backend local libSQL/SQLite, sem alegar Turso de produção. As 48 capturas comparativas e custos reais permanecem ligados à fonte 8479b9a. Capturas E2E de biomas que pegaram o fade são preservadas e terão complemento visível, sem reescrever os resultados da integral. Windows/GPU física, audição, arte botânica mais detalhada e frestas/muros urbanos continuam pendentes.

A coleta visual complementar terminou em seis campos, após fade inativo/opacidade zero, mesma condição 09h/Baixo/75%/1280×720. Originais escuros preservados. Índice e fonte da captura em final/restoration/biomes-visible. Verificação de integridade final mantém os 277 arquivos/11 protegidos iguais; nenhum código do jogo/testes/scripts foi alterado para corrigir as imagens.

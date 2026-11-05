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

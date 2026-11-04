# 0.9.1 — correção do chão

Prioridade solicitada antes da garagem 0.10.0. Base: main `c223f9e`, que integrou o PR #2/0.9.0. Branch: `fix/chao-inicial-0.9.1`. Código final: `dee7c2d`, após o checkpoint `2d1c41c`. A área de trabalho estava limpa; nenhuma alteração de colaborador foi descartada. Validação automática do cliente concluída; confirmação em Windows/GPU real pendente.

## Diagnóstico

O terreno do Mar de Cinzas acrescentava nove samplers ao MeshStandardMaterial, sem consultar a capacidade gráfica. Na qualidade Alta, albedo, normal, AO, roughness, metalness, DFG do Three r186, sombra solar e ambiente somam mais oito: **17**, acima das **16** unidades de fragmento garantidas pelo WebGL2. Um programa que ultrapassa a capacidade do driver não pode ser vinculado e a malha deixa de ser desenhada, mesmo que o colisor continue presente.

A análise do shader original foi registrada em [baseline-sampler-budget.json](evidence/floor-0.9.1/baseline-sampler-budget.json). O shader completo foi observado com 17 samplers ativos, incluindo `sampler2DShadow`, no teste de capacidade nativa. Os primeiros diagnósticos anteriores listavam somente samplers 2D/cubo; a sonda definitiva inclui o sampler de sombra na contagem.

O ambiente disponível usa SwiftShader com 32 unidades, onde o chão anterior já aparecia. Não foi possível reproduzir o desaparecimento no computador do jogador; ele confirmou que ocorre no barracão, mas não soube informar a qualidade. Foi corrigido um defeito concreto de compatibilidade capaz de produzir esse sintoma. Não se afirma que o driver Windows foi testado ou que todas as possíveis causas de chão ausente foram descartadas.

Os índices/grupos da geometria inicial cobrem toda a malha e suas normais apontam para cima. Não houve correção de posição, escala, winding, transparência ou altura do mundo; tampouco foi aplicada uma cor plana para esconder o problema.

## Correção

- `TerrainBlend.js` reserva o orçamento do material PBR, iluminação e sombras antes de selecionar os mapas adicionais.
- Com 16 unidades, preserva as três cores e os três normal maps das camadas; o solo rachado herda a rugosidade do mapa PBR de base, em vez de exigir o 17º sampler. GPUs com capacidade suficiente mantêm todos os mapas.
- `PBRLibrary.js` fornece `renderer.capabilities.maxTextures`. Capacidade desconhecida utiliza 16 como referência conservadora.
- A chave de cache distingue os layouts de shader. O fallback preserva o material PBR básico quando não cabe a mistura.
- Pacote, lock e indicação de versão identificam a correção como **0.9.1**, sem anunciar a garagem 0.10.0.

Uma segunda revisão identificou que os uniforms customizados precisavam manter referências atualizadas quando o Three reutiliza um programa após mudar a qualidade. A reprodução está em [uniform-cache-before.json](evidence/floor-0.9.1/uniform-cache-before.json). `dee7c2d` mantém slots compartilhados por material em WeakMap, atualizados antes de descartar as variantes antigas. A [rechecagem](evidence/floor-0.9.1/uniform-cache-after.json) confirma que um shader em cache recebe os mapas novos sem precisar de nova compilação. O snapshot PBR expõe o orçamento escolhido para diagnóstico.

## Preservação

Nenhum asset novo. Texturas locais, licenças, GLB do Titã, cabine, seis rodas, pivôs, controlador Rapier, parâmetros de condução, diálogos e regras de campanha foram preservados. Dez arquivos protegidos conferidos por SHA-256 em [preserved-files.json](evidence/floor-0.9.1/preserved-files.json). Terreno visual/físico, acessos, streaming, inventários e formato dos saves não foram alterados.

## Evidências e testes

- `npm test` antes da alteração: **196/196** nesta tarefa. Primeiro checkpoint: **200/200**, com quatro novos testes de orçamento e integração. Código final: **201/201 em 28 arquivos**, incluindo a atualização dos uniforms em cache.
- Primeiro teste focado de terreno: aprovado em Baixo → Médio → Alto → Baixo, com seleção de capacidade limitada a 16.
- Regressão selecionada: **9/9 em 13,4 minutos** sobre `2d1c41c`: texturas/fixtures/modelos, visibilidade do terreno, capacidade nativa, Titã e tutorial/saves. O tutorial inclui condução, frenagem, ré, estacionamento, reparo, Semente, gerador, conclusão e recarga; encurta deslocamentos longos com diagnóstico e não é uma viagem humana integral.
- Após o ajuste de cache, **2/2 focados em 4,4 minutos** sobre `dee7c2d`: Baixo → Médio → Alto → Baixo com orçamento de 16 e Alta nativa com 32. Não houve uma execução integral de toda a suíte E2E nesta correção, nem nove casos repetidos sobre o último commit.
- `npm run build`: **aprovado** sobre o código final; build e WebGL foram executados sequencialmente. Os [logs](evidence/floor-0.9.1/logs) preservam as rodadas separadas.
- Execução real `next start`: a primeira checagem de console falhou por HTTP 500 em `/api/saves`, pois a produção exige Turso configurado. O cliente chegou a renderizar o chão. Registro preservado em [no-turso/failure.log](evidence/floor-0.9.1/production/no-turso/failure.log); não foi removida a exigência do banco no servidor.
- Rechecagem **gráfica de produção aprovada** com `AURORA_GRAPHICS_ONLY=1 node scripts/verificar-chao-producao.mjs`: 16 samplers, 12 draws do terreno com amostras visíveis e nenhum erro. Somente o GET da lista de saves foi substituído por fixture vazia, declarada no [resultado](evidence/floor-0.9.1/production/validation.json). O cliente é o build real, sem API de debug. Isso **não valida a persistência Turso de produção**.

A sonda consulta os programas reais e executa occlusion queries sobre os draws do terreno. Assim, verifica que fragmentos da malha passam pelo teste de profundidade, além de conferir vínculo, número de samplers e erros. A seleção de capacidade limitada a 16 exercita a ramificação compatível em hardware de software que continua oferecendo 32; **não emula um driver de 16 unidades**.

| Cena | Antes | Depois |
| --- | --- | --- |
| Barracão, 09h, Baixa | [captura](evidence/floor-0.9.1/before/barracao.png) | [captura](evidence/floor-0.9.1/final/terrain-visibility/barracao-inicial.png) |
| Exterior, Alta | [captura nativa](evidence/floor-0.9.1/before-alto/exterior.png) | [terreno com orçamento de 16](evidence/floor-0.9.1/final/terrain-visibility/2-alto.png) |

Todas são capturas do jogo. A vista externa usa posicionamento diagnóstico; não prova uma viagem. O segundo par tem diferença de enquadramento, além da seleção de capacidade. Como o ambiente anterior já renderizava o chão, as imagens não são apresentadas como uma reprodução visual de chão ausente versus corrigido no Windows.

O [barracão em produção/Alta com orçamento de 16](evidence/floor-0.9.1/production/barracao-alto-16.png) foi capturado pelo build real. `scripts/capturar-chao.mjs` permite repetir a inspeção em desenvolvimento; `scripts/verificar-chao-producao.mjs` repete o smoke gráfico de produção, com o backend/fixture explicitados.

## Arquivos

Código: `src/game/render/TerrainBlend.js`, `src/game/render/PBRLibrary.js`. Identificação da versão: `package.json`, `package-lock.json`, `src/data/ui.js`, `src/data/pt-BR.js`. Testes: `tests/unit/terrain-material.test.js`, `tests/e2e/terrain-visibility.spec.js`, `tests/helpers/terrain-probe.js`. Scripts de captura/verificação e documentos de retomada completam a entrega; nenhuma geometria, textura ou biblioteca externa foi substituída.

## Conferência no computador do jogador

Atualizar o código, reiniciar o servidor, confirmar **0.9.1** no menu e recarregar com Ctrl + F5. O save pode continuar sendo usado. Roteiro: [teste manual do chão](docs/TESTE_MANUAL_CHAO_0.9.1.md).

A confirmação em Windows/GPU real permanece pendente. A próxima tarefa solicitada é a garagem 0.10.0, que não foi implementada neste hotfix.

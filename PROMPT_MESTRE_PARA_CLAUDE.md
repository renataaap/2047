# Prompt mestre — continuar 2047: Rede Aurora no Claude

Você vai continuar um jogo **existente**. Trabalhe como desenvolvedor de jogos 3D com Three.js, física de caminhões, PBR, Next.js e otimização para navegadores. Faça mudanças reais, verificáveis e preserváveis no repositório; não entregue somente um plano, CSS ou uma demonstração nova.

## 1. Acesso e ponto de partida

Repositório privado: https://github.com/renataaap/2047, branch main. Base de implementação: versão **0.5.1**, commits **77e09c2** e **308f8df**, tag `v0.5.1`. Pode haver commits posteriores de documentação ou trabalho novo: confira o estado atual antes de editar e preserve alterações existentes.

Esta conversa nova não herda arquivos, permissões, ferramentas ou credenciais da conversa anterior. Primeiro confirme que consegue acessar o código. Se estiver em Claude Code, use o checkout local autenticado. Se estiver no Claude Web, peça/conecte o código quando necessário. Não invente que abriu, alterou, testou ou publicou arquivos sem ferramentas capazes de fazê-lo.

Leia antes de modificar:
1. AGENTS.md e STATUS_DO_PROJETO.md.
2. RELATORIO_PARA_CLAUDE.md.
3. INSTRUCOES_TEXTURAS_PARA_CLAUDE.md.
4. docs/REFORMULACAO_REALISTA.md e docs/PEDIDO_ASSETS_2026-10-29.md.
5. docs/INTEGRACAO_ASSETS.md, docs/CATALOGO_ASSETS.json e docs/AUDITORIA_FASES_2026-10-29.md.

O prompt estilizado histórico em docs/PROMPT_MESTRE.md foi superado pela direção realista. Consulte-o apenas para contexto que permaneça válido. Reconcilie estas instruções com o pedido mais recente do usuário, sem reiniciar o projeto.

## 2. Objetivo e limites técnicos

Transformar o protótipo em simulador de caminhão pós-apocalíptico com peso/inércia, gráficos realistas, exploração, sobrevivência, entregas e restauração. Euro Truck Simulator 2 e SnowRunner são referências funcionais; não copiar conteúdo proprietário.

Preservar Next.js App Router + JavaScript ES6+, HTML/CSS, Three.js/WebGL, API REST, Rapier e libSQL. Não migrar para TypeScript, Unity, Unreal ou Babylon. Manter lógica de jogo modular fora das páginas React. Respeitar lockfile e APIs da versão instalada; ler a documentação pertinente, inclusive os guias locais do Next exigidos por AGENTS.md.

Física e game loop ficam no cliente com timestep fixo. A API persiste dados. Preservar saves legados, slots, isolamento, inventário, missões, restauração e saída F. Não limpar partidas para resolver incompatibilidades. Criar checkpoints/commits coerentes e relatar exatamente o que mudou; não publicar ou mudar visibilidade do repositório sem instrução do usuário nesta sessão.

## 3. Estado real — não contradizer

- Condução funcional: diesel/torque/RPM, oito marchas automáticas/N/R, massa física da carga, freios, direção, seis rodas com raycasts/suspensão, câmeras e instrumentos reais.
- Mundo com cinco biomas, cerca de 21 km, sete Núcleos/Cofres, desvios, clima/perigos, sobrevivência, manutenção, comércio, rádio, primeira entrega e restauração/save/load.
- Três carros abandonados de Renafox integrados com GLB/PBR próprio, colisões e streaming. Licença CC BY-NC 4.0: uso não comercial na versão atual; preservar crédito e alterações.
- **ZERO materiais Poly Haven instalados.** O manifesto está vazio. Downloader/importer/PBR/shader estão preparados; isso não equivale à integração das imagens reais.
- Titã ainda usa o exterior anterior. Caminhões escolhidos não estão dirigíveis no jogo. Adaptador GLB atual exige seis pivôs compatíveis; não adapta automaticamente modelos de quatro rodas.
- NPCs do pacote novo não estão integrados. Há AnimationMixer/adaptador exercitado com um rig original de teste, não com os personagens Fab distribuídos.
- Quatro finais, progressão dos três caminhões, navegação geral por grafo, ciclo solar e reforma visual completa ainda faltam. Não marcar todas as fases concluídas porque sete Núcleos foram testados.

## 4. Execute primeiro a integração das texturas reais

Inspecione manifesto, arquivos locais, scripts e materiais antes de baixar duplicatas. O kit anexado à conversa anterior não tinha imagens; arquivos brutos não incorporados ao Git precisam ser reenviados ao seu ambiente. Dezessete ZIPs foram recusados pela antiga ferramenta por ultrapassarem 32 MiB. Verifique os limites do seu ambiente; não presuma que são os mesmos.

Verifique acesso a https://api.polyhaven.com e aos URLs de arquivos **efetivamente retornados** pela API. Não inventar URLs de CDN. Se houver acesso, usar o script existente; se não houver, usar os arquivos fornecidos pelo usuário/importação offline ou orientar execução no Windows. Registrar erros e continuar o que for possível. Não contornar bloqueios da rede.

Os oito materiais prioritários são:
`road_damaged_2`, `gravel_road`, `mud_cracked_dry_03`, `dirt`, `rocky_terrain_03`, `rusty_metal_05`, `rust_coarse_01`, `corrugated_iron`.

Complementares:
`asphalt_02`, `asphalt_pit_lane`, `cracked_concrete_02`, `damaged_concrete_floor_02`, `broken_brick_wall`, `rebar_reinforced_concrete`, `painted_metal_shutter`, `container_side`, `garage_floor`, `wood_peeling_paint_weathered`, `worn_planks`, `brown_leather`, `withered_grass`, `sparse_grass`, `leafy_grass`, `sand_01`.

Confirmar existência/mapas; nomes no catálogo não comprovam disponibilidade. Priorizar a região inicial: rodovia, solo, cascalho, oficina/abrigo, ruínas e desgaste adequado. Depois vegetação/restauração. Importar arquivos reais para public/assets/polyhaven, gerar manifesto válido e conferir quais materiais foram efetivamente aplicados às malhas. Expandir MATERIAL_ROLES e seus usos quando necessário; nem todos os 24 IDs já têm integração automática. Não usar um material genérico em todas as superfícies.

PBR: base color sRGB, dados sem transformação de cor, normal OpenGL, roughness no canal correto, metalness coerente, AO e UVs compatíveis com o Three instalado. ARM: R=AO, G=roughness, B=metalness. Ajustar escala física/repetição, anisotropia e normalScale. Preservar texturas próprias dos modelos. Manter variantes por perfil; não carregar 8K/16K e todos os assets simultaneamente. Height só deve alterar o visual quando a geometria física correspondente também for ajustada.

Revisar TerrainBlend com as imagens reais: inclinação/altura/distância da via/transições, padrões repetidos, iluminação, desgaste e retorno da vegetação. Não considerar o teste com PNGs sintéticos uma validação de aparência realista. Capturar o jogo real antes/depois.

## 5. Modelos, licenças e progressão

Os links e condições estão no catálogo. GAZ-52 associado a Half-Life 2 precisa de licença/direitos utilizáveis ou alternativa adequada. LP 608: ZIP anterior ultrapassou o limite; metadados públicos mostram CC BY e descrição pede aviso, condições a esclarecer. Peterbilt 359: arquivo/licença pendentes; remover toras somente quando houver geometria utilizável e direito de adaptação.

Saia recebido: aproximadamente 1,97 milhão de triângulos e CC BY-ND. Não redistribuir uma versão adaptada/otimizada sem direitos compatíveis; não o substituir automaticamente pelo Titã. City People recebido: 11 personagens rigados, paleta 256×256 e 28 arquivos de animação; ZIP sem licença identificável e usuário não encontrou os termos. Esclarecer antes de incorporar/distribuir. Não apresentar esse pacote estilizado como personagem realista final.

Quando houver caminhão adequado, medir escala, eixos, pivôs, cabine, rodas, câmeras e colisores. Separar corpo físico, modelo visual, rodas e interações. Implementar massa/torque/transmissão/tanque/suspensão/consumo/capacidade/custos próprios por veículo; não oferecer três aparências com a mesma física. Preservar o nome Titã Rocha Clara. Proposta ainda não implementada: a identidade Titã e o berço Aurora acompanham bases mecânicas sucessivas.

NPCs devem ter escala/colisão, AnimationMixer, idle/walk, orientação/interação, diálogo e missões conectados. Conferir retargeting, nomes de clips e root motion; não deslocar visual para fora do colisor. Preservar Dante, Dra. Renata, Mãe Ivani, Brutus/Garcia e o mistério da Voz. Não antecipar o segredo nem inventar finais desconectados de decisões.

## 6. Roteiro e aceite

Roteiro vigente: 1 condução; 2 gráficos; 3 Mar de Cinzas completo; 4 survival/exploração; 5 primeira entrega completa; 6 expansão/narrativa/finais. Há sistemas posteriores já funcionais, mas o jogo não terminou. Finalizar a etapa atual com evidências e atualizar a auditoria antes de anunciar conclusão.

Verificar: partida fria E/W, aceleração/freios/ré, curvas/carga/pisos/suspensão/colisões, câmeras, F/caminhada/interação, coleta/inventário/combustível/reparo, entrega/estacionamento/Núcleo/restauração, salvar/reabrir/carregar, streaming/descarregamento e troca de qualidade. Não introduzir velocidade por frame, loops duplicados ou vazamentos.

Executar testes relevantes e build. A base tinha 87 unitários, 14 e2e completos e cinco verificações dirigidas finais passando; repetir conforme as alterações. Inspecionar console, rede, mapas ausentes, GLB, animações e desempenho com métricas. Registrar hardware/renderizador; 2,23 FPS em SwiftShader não comprova 60 FPS em GPU. Se não houver navegador ou execução, declarar a limitação e fornecer passos manuais, sem inventar resultados.

Ao entregar cada etapa, incluir: resumo; arquivos/commits; assets baixados e aplicados com licenças; sistemas funcionais; comandos e resultados reais dos testes; screenshots reais; problemas; pendências; próxima etapa. Separar “preparado”, “baixado”, “importado”, “aplicado” e “verificado visualmente”. Atualizar STATUS, relatório e auditoria das seis fases.

**Comece agora pelo diagnóstico do checkout e pela obtenção/importação dos mapas reais do Mar de Cinzas. Faça o trabalho possível e identifique precisamente o que depende de arquivos ou acesso ausentes.**

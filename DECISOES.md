# Decisões — Fase 1

## Arquitetura e tarefas (antes da implementação)
1. Preparar Next.js App Router, JavaScript, Vitest e Playwright. Validar o esqueleto e fazer commit.
2. Implementar regras puras: consumo, terreno determinístico e passo fixo. Integrar Rapier DynamicRayCastVehicleController, modelo procedural, mundo em janela 3×3, câmeras e áudio. Verificar e fazer commit.
3. Integrar menu/HUD/configurações/pausa e diagnóstico. Verificar os aceites em navegador e build. Corrigir falhas e fazer commit.
4. Registrar evidências, limitações e checklist; entregar somente a Fase 1.

- Next.js estável obtido do registro npm, sem TypeScript; React só monta o canvas e a UI.
- Unidades SI (1 unidade = 1 metro), eixo vertical Y; caminhão aponta para -Z; física a 1/60 s com interpolação visual.
- Mundo em grade móvel de nove setores de 1.024 m. Estrada com ~3 km, com faixa inicial retilínea para aprender os controles. Seed fixa 2047, props intencionais e compartilhados por instância.
- Semente, inventário, NPCs, restauração e saves jogáveis pertencem à Fase 2+. Nenhum botão finge executá-los. API de configuração e repositório libSQL/migração preparados nesta fase; sem emissão de saves antecipada.
- Deploy na Vercel fica na Fase 6 conforme o roteiro. Sem adaptação para outro runtime de hospedagem.
- Áudio integralmente procedural, iniciado pelo clique em Novo jogo. Qualidade gráfica persistida apenas no navegador; não são dados de progresso.
- Geometrias e texturas procedurais são arte funcional autoral de primeira passagem. Revisão de arte e sensação humana permanecem no checklist.

## Parâmetros consolidados e verificações
- Novo jogo começa na cabine com o motor já ligado, para cumprir o aceite W por oito segundos. E continua sendo exclusivamente a ignição. Entrada/saída a pé (F) está reservada à Fase 2.
- Rapier é inicializado por uma Promise compartilhada para evitar reinicializar a memória WASM durante a montagem duplicada do React StrictMode.
- O acumulador aceita até 30 passos por frame (0,5 s), mantendo o passo de 1/60 s. Isso evita desacelerar artificialmente a simulação em renderizadores lentos. Suspensão de aba pausa o jogo, e o limite ainda impede recuperação ilimitada.
- A força de tração é negativa no controlador porque o modelo aponta para -Z; não há aplicação paralela de movimento por teleporte durante a condução.
- Superfície da estrada e terreno têm colisores reais. A aderência do controlador depende da posição e da velocidade.
- Geometrias estáticas são unidas por material. Rochas têm LOD próximo/distante, props usam instâncias e seus buffers são descartados quando o setor sai da janela.
- O Three.js atual removeu PCFSoftShadowMap; usamos PCFShadowMap com filtragem, sem bloom.
- Medições em SwiftShader são evidência de execução por software, sem inferir desempenho de GPU integrada. A meta de ~60 FPS a 1080p continua não verificada.
- Semente/integridade são null no diagnóstico da Fase 1; nenhum valor inventado simula uma carga ainda não recebida.

# Fase 2 — arquitetura antes da implementação
1. Campanha pura e testável: recepção da Semente no abrigo, preparo, planejamento, transporte, calibração/ativação, flags e restauração. Integridade mede aceleração filtrada, impactos e frenagem com zona morta e teto por segundo.
2. Mecânica dos oito componentes e inventário com custos reais. Controlador Rapier a pé, com colisão, corrida, salto e F contextual. Atividades a pé limitadas ao abrigo e ao Núcleo nesta fase.
3. Mundo: barreira de areia na rodovia, desvio pavimentado longo à direita e atalho irregular à esquerda; tempestade, desgaste de filtros, Núcleo e restauração física com chuva/vegetação e liberação da estrada.
4. Persistência: repository libSQL, identidade anônima via cookie HttpOnly/SameSite e Secure em HTTPS/produção, validação estrita, tamanho máximo 128 KiB e revisão otimista. Saves somente por requisições explícitas e checkpoints.
5. Interface de jogo: diálogo, rádio, mapa, inventário/transferência, manutenção, mecanismo, saves/carregamento e alertas. Textos em src/data. Preservar as três câmeras e a condução existentes.
6. Verificar regras/API/fluxo e2e com Rapier/WebGL, screenshots e build; commit por etapa verificada. Entregar ZIP com iniciador Windows e parar antes da Fase 3.

- Novo jogo continua ao volante com motor ligado. F permite descer com o caminhão parado; o contato narrativo acontece no abrigo ao lado. A rodovia pode ser explorada antes de receber a carga.
- Desenvolvimento local usa libSQL em file:local.db e cria o schema idempotentemente na primeira operação. Produção exige Turso. Nenhum progresso importante depende da memória do processo.
- Para conciliar o cookie Secure com localhost HTTP no Windows, Secure será obrigatório em produção/HTTPS e desativado somente no desenvolvimento HTTP. Cookie de identidade é assinado pelo HMAC do servidor quando SAVE_COOKIE_SECRET é configurado; sem segredo, usa UUID de alta entropia, sem expor conteúdo de outros jogadores.

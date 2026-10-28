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

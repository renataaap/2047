# 0.8.0 — diagnóstico e incrementos

Base limpa: 32d55b7 em feat/tutorial-assets, igual ao remoto pessoal renataaap/2047. Leituras obrigatórias realizadas. Os 136 unitários e 20 cenários da 0.7.0 são evidência histórica; novas execuções serão registradas separadamente. Sem recomeçar os sistemas existentes.

## A — pontos de maior impacto

- Barracão: garagem GLB já aberta e funcional, mas sem área de dormir, armazenamento doméstico ou sinais suficientes de permanência. Preservar bancada/caderno, percurso x=-13/z=22 → x=-12/z=18,95 → porta lateral x=-8,2 e treino em x=0/z=-54.
- Acostamentos: longos intervalos sem composições; postes antigos e carros isolados não dão continuidade ao ambiente. Usar módulos determinísticos contextualizados, guardrails/valetas/cabos e conjuntos com finalidade reconhecível.
- Posto Boa Viagem e Oficina do Cotovelo: geometria funcional e atendimento correto, mas acessórios e sinais de uso ainda escassos. Detalhar sem alterar âncoras dos atendentes, bombas ou entrada da oficina.
- Restante do continente: ampliar o mesmo vocabulário com estruturas portuárias no sal, fachadas urbanas, contenção na serra e instrumentos meteorológicos nas tempestades. Investimento maior no Mar de Cinzas.
- Modelos: garagem, posto, barris e carros instalados têm créditos; carros CC BY-NC não permitem afirmar liberação comercial. Caminhões candidates só podem virar decoração parada nesta etapa; não há novos veículos dirigíveis.
- Materiais: oito Poly Haven instalados na base. Avaliar arquivos locais enviados para concreto/madeira/interiores, sem depender da API bloqueada. Importações só contam após validação/aplicação.

## B–E — implementação e limites

1. Composições por local e células próximas, agrupadas por material, com colisão seletiva. Reserva explícita de ruas, desvios, estacionamento, terminais e NPCs. Alturas da superfície real, seed estável, descarte de geometria/corpos ao sair de alcance.
2. Três POIs acessíveis no Mar de Cinzas: motel, pátio de caminhões e pesagem. Recursos/informações finitos e estado persistente; sem teleporte de gameplay ou coleta infinita.
3. Relógio solar persistente, avanço pelo mesmo passo fixo/pausa do jogo. Iluminação gradual, noite legível, luzes locais limitadas e clima preservado.
4. Áudio ambiental original sintetizado no contexto já iniciado por gesto; fontes espaciais limitadas, passos por superfície e pausa respeitada. Não declarar gravações instaladas.
5. Refinar silhuetas/equipamentos dos personagens existentes; arte humana final e animação completa de escalada continuam dependências honestas. Não alterar diálogos.

## Verificação

Capturas antes/depois no mesmo percurso por scripts/capturar-ambientes.mjs. Testar reservas e determinismo, colisões, POIs e repetição/save/load, relógio e migração. Rodar npm test, build e suíte e2e atualizados. Investigar regressões antes de marcar incrementos estáveis. Software SwiftShader não substitui Windows/GPU real.

Economia dinâmica, contratos, Código da Última Estrada, facções, reputação, caminhões dirigíveis extras, eventos, rotinas e finais ficam no roadmap posterior; não contam como entrega 0.8.0.

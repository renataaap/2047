# Diagnóstico da 0.8.2

Base remota confirmada: main `d8a3b2a`, versão 0.8.1, árvore limpa. Trabalho isolado em `feat/polimento-0.8.2`; main não será atualizada durante a implementação.

Leituras: AGENTS, STATUS, README, relatórios 0.8.1/0.8.0, roadmap e guia Next.js de componentes cliente/servidor da versão instalada. Stack e dependências mantidas.

## Referência e validação inicial

Executados novamente `npm test` (167 aprovados) e `npm run build` (aprovado, sem dev ativo). A execução integral inicial de `npm run test:e2e` tem seu próprio log, `evidence/polish-0.8.2/baseline-e2e.log`; resultados anteriores não contam como esta execução.

Dezessete capturas WebGL novas em `evidence/polish-0.8.2/before`, incluindo os dez enquadramentos pedidos, moradia, Marta, Tomás, Ivani e três POIs. Mesmo script/posições/horários/perfil serão usados depois. Capturas usam diagnóstico de deslocamento e horário; não constituem uma sessão humana de 30 minutos. Chromium usa SwiftShader, sem GPU física.

Hashes de diálogos, GLB do Titã, física e parâmetros preservados em baseline.json. Nenhum modelo novo ou textura externa será declarado instalado sem transferência/licença verificadas.

## Pontos de maior impacto

1. Cabine: paredes/painel/banco procedurais antigos, olho acima da cabine importada, pouco acabamento. Criar interior modular com volume, portas, bancos costurados, coluna/pedais, ventilação e acessórios. Reutilizar instrumentos reais e adotar âncora própria da câmera, mantendo fallback dos modelos existentes. Não mexer em rodas, collider ou GLB reparado.
2. Exterior: adicionar fixações, degraus e pequenos sistemas mecânicos coerentes ao modelo atual, sem outra física e sem duplicar rodas.
3. Humanos: base MakeHuman CC0 e rig in-place funcionais; roupas ainda aderem ao corpo e acessórios são básicos. Melhorar volume/texturas e identidade de Dante, Zeca, Tomás, Ivani, sobrevivente e Marta. Não chamar essa base de rosto fotorealista final.
4. Mar de Cinzas: detalhar composições já transmitidas por AmbientWorld/DiscoveryWorld. Não criar streaming paralelo. Manter reservas de passagem, terminais, NPCs, treino e estacionamento; não dar colisão a miudezas.
5. Diário: derivar registros dos estados persistentes existentes (visitas, ações finitas, Núcleos), sem duplicar recompensas, missões ou narrativa.
6. Entrada/saída: preservar validação física e posicionamento seguro; os clips atuais não oferecem uma subida completa com contato das mãos. Qualquer melhoria visual deve reconhecer esse limite e não reescrever o controlador.

## Sequência dos checkpoints

A: diagnóstico/capturas/testes iniciais. B: Titã e regressão. C: personagens e transições. D: estabelecimentos/POIs/estrada. E: iluminação/diário/apresentação. F: regressão, capturas comparáveis, custos e relatório final.

Arte final de personagens, animação de contato completa e avaliação Windows/GPU real não são presumidas. O roadmap 0.9.0 (economia dinâmica, contratos, facções, caminhões adicionais e finais) não faz parte desta implementação.

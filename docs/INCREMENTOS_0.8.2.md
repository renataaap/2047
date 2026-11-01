# Checkpoints da 0.8.2

Base: main d8a3b2a, versão 0.8.1. Implementação isolada em feat/polimento-0.8.2.

## A — Referência

Commits 668b6b4 e 5212b92. Diagnóstico, 20 capturas reais anteriores, hashes dos arquivos protegidos, teste manual para Windows e novas execuções de 167 unitários, build e 25 E2Es integrais. Ver DIAGNOSTICO_0.8.2.md e evidence/polish-0.8.2/baseline-results.json.

## B — Titã

Commit 4d20dee. Interior modular com bancos moldados, costuras, portas, maçanetas, pedais, coluna, volante, instrumentos existentes, ventilação, rádio, limpadores, compartimentos e objetos de viagem. Texturas originais pequenas e materiais separados; vidro controlado. Nova âncora dos olhos dentro da cabine importada. Indicadores usam motor, freio, faróis e temperatura da simulação.

Exterior: degraus, fixações, reservatórios, mangueiras e reforços, sem alterar o GLB reparado, seis rodas, pivôs, massa ou física. Cabine importada é ocultada somente na câmera interna durante direção. O primeiro painel ocultava os mostradores: a captura identificou o problema, e o molde foi corrigido antes do checkpoint.

Validação nova: 174 unitários; 3 E2Es relevantes (direção/câmera e opacidade). Capturas de conferência em titan-check e primeira tentativa documentada em titan-first. Não equivalem à regressão final da atualização. Módulos auxiliares de cenário/diário preparados nesse commit só contarão como entregues depois de integrados e validados.

## C — Personagens e acesso

Roupas com volume e equipamentos presos aos ossos do rig existente. Dante usa jaqueta de trabalho, mochila costurada, barba e botas; Zeca colete, boné, óculos e rádio; Tomás avental de couro e proteção; Ivani xale, avental e lenço; sobrevivente capuz, cachecol e mochila; Marta macacão, cabelo preso e ferramentas. Pequenas diferenças de rosto, silhueta e altura visual. Tecidos compartilhados com contagem de referências e descarte; cada instância preserva o modelo-fonte.

Olhar sutil e gestos ocasionais usam o AnimationMixer existente. Caminhada/corrida continuam ancoradas na posição Rapier. Pose sentada do motorista aparece nas câmeras externas; a transição de acesso não interfere no controle nem na escolha da câmera.

Validação unitária desta etapa: 175 aprovados, incluindo pose no rig real sem mudar posições dos ossos. Capturas reais em characters-check. Regressão de interação/entrada/saída registrada em characters-e2e.log ao término da rodada.

Limites: base anatômica MakeHuman CC0 ainda é compartilhada, sem rosto/textura fotorealista final. Os clips atuais não oferecem subida com contato preciso nas mãos e degraus: gesto, pose sentada e transição visual são melhorias parciais; a animação completa continua pendente. A inspeção identificou um proxy invisível de Ivani que mergeStatic incorporava como superfície preta opaca. Foi removida só a malha auxiliar: o colisor permanece. A recaptura no mesmo lugar confirma Ivani visível; o lenço também foi ajustado para deixar os olhos livres.

## D — Mar de Cinzas

Acabamentos integrados aos lotes e setores já existentes: ferramentas moldadas, motor de partida em manutenção, jogo de soquetes, panos, costuras da cama, caneca e objetos de viagem; balcão/prateleira na loja; bancada, ferramental e cabeçote na oficina; cortinas/chaves/roupa de cama no motel; compressor e mangueiras no pátio; fixações/equipamentos na pesagem e na estrada. Pequenas peças sem colisores. Uma bancada nova sólida no barracão fica fora do corredor do tutorial.

A loja que era um bloco sólido agora tem paredes e porta lateral aberta, preservando localização, bombas e Zeca. Teste E2E novo atravessou a abertura com o controlador Rapier e conversou com Zeca: 1/1 aprovado. Unitários: 175/25 aprovados. Capturas reais em environment-check, inclusive interior acessível da loja. O teste usa viagem diagnóstica até o posto; a passagem pela porta usa movimentação física.

Materiais do terreno já habilitavam vertexColors, mas a geometria não fornecia o atributo. Atributo de cor adicionado, sem alterar posições, normais, UVs, índices ou superfície física, para recuperar o albedo PBR visível. Pedras próximas receberam mais subdivisão; colinas de fundo usam geometria e UVs mais suaves. Colinas continuam elementos de fundo, não terrenos físicos novos. LOD, instanciamento, setores e descarte preservados.

## E — Atmosfera e experiência

Diário integrado ao caderno J. Registros derivam de visitas/ações finitas, paradas e Núcleos já persistidos. Entrar fisicamente no piso acessível dos três locais novos registra a visita uma vez; não coleta nem paga reserva. Leitura/coleta/restauração atualiza o mesmo registro, sem outra missão ou novo esquema de save. Saves antigos sem descobertas mostram caderno vazio.

Bancadas têm iluminação de tarefa diurna/noturna; só as duas luzes locais mais próximas dentro do alcance são ativadas. Cabine conserva luz própria e indicadores reais. Ciclo solar, relógio, clima e áudio preexistentes preservados. Emissão visual do escapamento agora acompanha o tubo do modelo e permanece visível com o exterior importado. As fábricas existentes ganharam caixilhos, portas, tubulações, ventilação e guarda-corpos, dentro dos volumes físicos originais.

Refinamentos discretos do HUD e tipografia; transição de acesso respeita redução de movimento. Sem reescrita narrativa. Validação nova: 175 unitários/25 arquivos e 3/3 E2Es em experience-e2e.log: instrumentos/olhar/saída, porta física/Zeca e diário por caminhada com inventário invariável e recarga. Evidências próprias em functional.

## Próximo checkpoint

F: versão, comparações finais, regressão completa, build e documentação de custos/limitações. Nenhum resultado final é presumido a partir das rodadas focadas.

Nenhum resultado em SwiftShader comprova desempenho ou sessão humana de 30 minutos em Windows/GPU real.

## F — Verificação e polimento

Vinte pares reais e sete ângulos adicionais no Baixo; três amostras no Alto e uma no Médio. Cabine fechada sob o painel após inspeção lateral; vidro da loja recortado fora da porta, com verificação física e visual por raio. Contador singular do diário corrigido. Fonte física, GLB e narrativa protegidos.

175 unitários e build novamente aprovados. Recuperação por API depois de parar/reiniciar o servidor: dados idênticos, com estado da exploração, inventário, posições e horário. Capturas/recursos/limites no relatório.

Primeira integral da aplicação foi 26/28 em 29 minutos: dois testes antigos usavam 800/1000 ms de parede após teleporte e pressionavam F antes de acomodar a física. Foram preservadas as regras da aplicação e corrigida a sincronização dos testes: freio, 120 passos, motor desligado e modo a pé confirmado. Pausa/retorno ao volante também recebem confirmação. Ambas as rechecagens passaram (2/2, 3,5 minutos), incluindo a primeira entrega e toda a sequência dos Núcleos. Não equivalem a uma integral verde. Nova integral de 28 cenários será executada com esses testes.

# Verificação manual — 0.7.0

Usar uma cópia completa desta branch no Windows com GPU/WebGL. Nesta entrega a publicação pública ainda aguarda autorização; não baixar main presumindo que seja a 0.7.0. Após npm ci e npm run dev, abrir http://localhost:3000 nesse computador.

## Aparência e início

1. Confirmar 0.7.0 no rodapé. Observar Titã, posto/cenário 3D, poeira e deslocamento discreto da câmera; comparar as capturas do relatório.
2. Abrir Configurações/Créditos, navegar por teclado e fechar com Esc. Testar Baixo/Médio/Alto, escala de legendas e perspectiva inicial a pé.
3. Novo jogo deve fazer fade, iniciar Dante dentro da garagem e mostrar o mesmo tutorial de 21 objetivos. Continuar deve retomar o save, sem recriar tutorial nem duplicar recursos.

## Avatar e controles

1. C a pé alterna primeira/terceira pessoa; modelo oculto na primeira. Mouse controla olhar/órbita; WASD move e Shift corre. Conferir idle/caminhada/corrida e pés em relação ao terreno.
2. Aproximar a câmera de uma parede e do Titã. A posição deve recuar antes do obstáculo. Testar portas e inclinações.
3. F entra na cabine; E liga/desliga; W acelera, S freia/ré segura, Espaço segura o Titã. F só permite sair devagar/parado. Testar F novamente junto à porta para voltar.
4. Testar C no caminhão: acompanhamento/cabine/órbita. Não pode disparar a perspectiva a pé nem mexer em recursos.
5. Entrada/saída e reparo possuem gestos básicos; não considerar escalada ou animação de banco finalizadas. Arte humana atual é provisória, com base compartilhada.

## NPC e estabelecimento

1. Ir ao Posto Boa Viagem, km 2,25. Aproximar Zeca frontalmente, pelos lados e por trás; em distância maior, apontar o olhar para ele. A indicação deve ser Falar com Zeca, com cabeçalho Zeca e subtítulo Posto Boa Viagem.
2. Abrir conversa, revelar texto completo e conferir a fala existente. Usar Compras e serviços; verificar preço, estoque, combustível e materiais antes/depois.
3. Junto à bomba, selecionar Abastecer caminhão. Para o tanque: Titã até 26 m, parado e motor desligado. Galão/água seguem estoque/capacidade da mochila. Motor ligado deve impedir abastecer o tanque.
4. Testar Tomás/gerador separadamente. Repetir em Dona Marta, Lurdes, Seu Gil, Cacá, Rute, Nando, Baiano, Tica e Valéria e nos abrigos da Rede.
5. Uma parede entre Dante e o alvo deve bloquear a indicação. Ao sair de alcance após ver um alvo, F deve cancelar e jamais despachar outro objeto sem mostrar a nova indicação.

## Semente e persistência

1. Receber a Semente normalmente. Transportar, observar integridade e preparar o gerador. Sem editar o estado, testar uma entrega danificada, se houver danos na viagem.
2. Estacionar na área, desligar, sair e aproximar do terminal. Conferir integridade/chance e a mensagem específica junto à calibração.
3. Verificar peças só na mochila, só no Titã acessível e misturadas; cada calibração válida usa exatamente duas e recupera até 20 pontos. Sem peças, motor ligado, fora da vaga ou fora do terminal não podem debitar.
4. Se ocorrer falha de ativação, a Semente deve continuar carregada/disponível, permitindo calibração e nova tentativa. O sorteio não garante falha em toda integridade abaixo de 80; de 80 em diante a chance é 100%.
5. Após ativar, o terminal deve impedir calibração/reuso, exibir carga indisponível ali e orientar a próxima Semente/Cofre. Chuva/plantas/rota mudam como antes.
6. Salvar antes da ativação, após falha e após sucesso, reiniciar a aplicação e carregar. Conferir inventários, integridade, carga/consumo, Núcleo, tutorial e restauração. Usar slots livres, sem apagar partidas existentes.

## Desempenho e estabilidade

Anotar GPU, navegador, resolução/perfil, FPS durante estrada/cabine/POIs, travamentos, uso de memória e eventuais erros do console. Fazer uma viagem contínua sem os teleportes de diagnóstico usados nos testes automatizados. A medição SwiftShader do ambiente remoto não substitui esta avaliação em hardware.

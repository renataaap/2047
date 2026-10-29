// Functional instructions only. Campaign dialogue remains in src/data/campaign.js.
export const TRAINING = { parking: { x:0,z:-54,halfWidth:4.5,halfLength:8 }, home:{x:-13,z:22}, objects:[
 {id:'tools',x:-15,z:20,title:'Bancada de ferramentas',detail:'Peças mecânicas ficam na mochila ou no compartimento do Titã. Tab abre o inventário.'},
 {id:'logbook',x:-11,z:20,title:'Caderno de viagem',detail:'J consulta os objetivos. M abre o mapa recuperado e permite planejar a rota.'},
] };
export const STEPS = [
 ['walk','O abrigo','Caminhe pelo barracão','W A S D','Percorra 3 m. Clique no cenário para olhar com o mouse. Saída pelas portas laterais abertas.'],
 ['look','O abrigo','Observe o ambiente','MOUSE','Clique no cenário e mova o mouse. Esc libera o cursor.'],
 ['inspect','O abrigo','Inspecione os objetos da bancada','F','Aproxime-se da bancada e do caderno. Use F em cada objeto.'],
 ['enter','Conhecendo o Titã','Entre no Titã Rocha Clara','F','Saia do barracão e aproxime-se da cabine na estrada.'],
 ['cab','Conhecendo o Titã','Observe os instrumentos na cabine','C','C alterna as câmeras. Diesel, RPM e temperatura refletem o estado real.'],
 ['engine','Conhecendo o Titã','Ligue o motor','E','O motor começa em N. Confira a reserva de diesel antes de partir.'],
 ['accelerate','Aprendendo a dirigir','Acelere até 8 km/h','W','Ganhe velocidade na estrada junto ao abrigo.'],
 ['brake','Aprendendo a dirigir','Reduza até parar','S','Freie de forma progressiva até ficar abaixo de 2 km/h.'],
 ['turn','Aprendendo a dirigir','Faça uma curva em baixa velocidade','A / D','Mova o caminhão e altere sua direção. Evite os limites do acostamento.'],
 ['reverse','Aprendendo a dirigir','Manobre 2 m em marcha à ré','S','Pare e mantenha S para engatar R. W freia antes de voltar ao avanço.'],
 ['park','Aprendendo a dirigir','Estacione na área de treinamento','ESPAÇO','Retângulo junto à estrada, a 59 m do ponto inicial. Alinhe o Titã e mantenha Espaço até parar.'],
 ['engineOff','Manutenção','Desligue o motor estacionado','E','O caminhão precisa estar parado dentro da área marcada.'],
 ['exit','Manutenção','Desça e inspecione o Titã','F','Mantenha Espaço até usar F. Aproxime-se da lateral e abra V.'],
 ['maintenance','Manutenção','Repare um componente','V','O compartimento começa com 2 peças. Faça um reparo real. Se precisar, transfira peças da mochila com Tab.'],
 ['mission','A missão começa','Converse com a sobrevivente','F','Volte ao abrigo, perto do ponto inicial. Use F e aceite a Semente no diálogo existente.'],
 ['inventory','A missão começa','Confira recursos e integridade da carga','TAB','Confira o inventário e a integridade da Semente no indicador de carga. Abasteça e prepare o veículo.'],
 ['map','A missão começa','Planeje a primeira rota','M','Escolha o desvio seguro ou o atalho no mapa recuperado. A escolha não move o caminhão.'],
 ['travel','Primeira viagem','Viaje pelo Mar de Cinzas','W / S','Siga até a bifurcação. Controle a velocidade, o diesel e a integridade da Semente.'],
 ['poi','Primeira viagem','Explore a oficina abandonada','F','Pare junto à oficina no km 1,65, desça e interaja no interior. Recupere suprimentos.'],
 ['generator','Primeira viagem','Prepare o gerador do Núcleo 1','F','Estacione nos balizadores e fale com Tomás, junto ao Núcleo. Reserve 4 L de diesel e 1 peça para o gerador.'],
 ['delivery','Primeira viagem','Entregue e ative o primeiro Núcleo','F','Com o gerador ligado, estacione nos balizadores, desligue o motor e opere o terminal a pé.'],
].map(([id,section,title,key,detail])=>({id,section,title,key,detail}));
export const FACTS=['look','tools','logbook','enter','cab','engine','accelerate','brake','turn','reverse','park','engineOff','exit','maintenancePanel','repair','inventory','route','poi'];

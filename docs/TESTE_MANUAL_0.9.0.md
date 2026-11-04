# Avaliação manual 0.9.0 no Windows

A validação automatizada usa Linux/Chromium/SwiftShader. Não substitui dirigir em Windows com GPU, avaliar som, conforto, legibilidade e sensação de peso. Os percursos acelerados usam o mesmo timestep de 60 Hz e o Rapier; não são sessões humanas em tempo real.

## Atualizar preservando sua partida

Feche o jogo e o terminal. Guarde uma cópia de `local.db` e dos arquivos WAL/SHM que existirem; não os envie ao Git. Atualize a branch `feat/rede-rodoviaria-0.9.0` com `git pull --ff-only`, execute `npm ci` e `npm run dev`, ou abra INICIAR_JOGO.bat. Acesse http://localhost:3000 no mesmo computador e navegador. A main e o PR #1 não são substituídos durante este trabalho.

Ao carregar um save legado, a revisão geográfica pode corrigir a altura ou retirar Dante/Titã de uma construção nova. A recuperação é próxima e determinística, aparece em aviso e fica registrada no próximo salvamento; não reinicia missões nem concede itens. Se o local continuar obstruído, preserve o save e registre a posição antes de usar recuperação manual.

## Viagem piloto

1. Novo jogo começa a pé no barracão. Complete ou pule o tutorial opcional. Fale com a sobrevivente e aceite a Semente. Prepare diesel, peças e água.
2. Entre no Titã com F; E liga. W acelera, S freia e engata ré após parada sustentada; A/D esterçam. Espaço segura o veículo. C alterna câmeras; L acende faróis.
3. M abre o planejador. Selecione Oficina do Cotovelo para a primeira parada e confira a distância, tempo e diesel estimados. Siga as instruções e a sinalização física; o mapa mostra posição estimada com dados locais, sem satélite.
4. Estacione, desligue o motor e desça. Contorne o caminhão e converse com Dona Marta. Retorne à porta, entre e ligue.
5. Selecione Posto de Cinza Nova. Entre na cidade pela ligação do km 0,62, converta nas ruas e entre no acesso do posto. Desligue, desça e fale com Nilo. O diesel tem estoque finito e exige pagamento.
6. Explore a pé as calçadas, a praça/pátio, o setor industrial e a entrada da garagem. A garagem nesta versão tem apenas espaço físico; compra, pintura e troca de caminhões ficam para 0.10.0.
7. Em M, selecione `Rota B · Cinza Nova e estrada do Vale`. Confira que o trajeto real usa a saída sul urbana e terra. Acompanhe o minimapa e note a diferença na resistência/aderência. As alternativas não são necessariamente mais curtas ou baratas: compare os dados calculados.
8. Para escolher asfalto antes de viajar, use `Rota A · rodovia e alça leste`. Não é necessário repetir a viagem para progredir. Uma conversão errada deve produzir recálculo a partir da via alcançada; não há teleporte do caminhão.
9. Siga até o Núcleo 1 pela alça sinalizada. Pare nos balizadores, desligue e desça. Caminhe por trás do Titã antes de atravessar para o terminal. Converse com Tomás, ligue o gerador (4 L + 1 peça), confira a chance, calibre se necessário e ative.
10. Salve, feche o aplicativo por completo, reabra e carregue. Confira Núcleo, recursos, horário, descobertas e destino. A saída pela alça deve retornar à rodovia sem atravessar a estrutura.

## Sete Núcleos e Cofres

Use o destino de cada Cofre/Núcleo em M. Confirme sinalização, entrada, piso, manobra, desligamento, saída de Dante, caminhada ao painel, regra da Semente, retorno à porta e saída viária. Os Cofres 2–7 exigem ativação anterior e recursos do compartimento. O primeiro Cofre é visitável a pé pelo Abrigo 07; a primeira Semente vem da sobrevivente. A matriz de auditoria distingue esses casos.

## Apresentação e desempenho

- Teste o minimapa compacto, ampliado, oculto e restaurado, inclusive na cabine e a pé. Confira velocidade, instrumentos e objetivo sem sobreposição.
- Teste Baixo/Médio/Alto, amanhecer, entardecer, noite e faróis. Fotografe o mesmo ponto e registre GPU, resolução, perfil, draw calls e triângulos quando possível.
- Dirija lentamente pelos cruzamentos, pelo posto e pela garagem. Verifique passagem do Titã completo, freio, ré e colisões, sem usar o veículo como um carro pequeno.
- Afastando-se de Cinza Nova, confirme descarregamento e retorno sem crescimento contínuo de memória ou objetos duplicados.
- Abra o console do navegador e registre erros de WebGL, carregamento, materiais e API. Compare os saves antes/depois de reiniciar.
- Não interpretar FPS de SwiftShader como medição de hardware real. Sensação dos controles, duração da campanha, áudio e aprovação artística continuam exigindo avaliação humana.

Depois da primeira ativação, M → **Seguir o objetivo da campanha** passa a indicar o Cofre 2. A escolha manual de um destino permanece no GPS até escolher outro ou voltar ao objetivo. O Cofre 2 exige o Núcleo 1 ativo e uma peça no compartimento do Titã; após retirar a Semente, siga para o Núcleo 2 e use a alça do viaduto indicada no mapa.

As execuções E2E sem variável gravam agora em evidence/current-e2e. Para arquivar uma versão, defina AURORA_EVIDENCE_ROOT para uma pasta própria antes de npm run test:e2e, preservando resultados históricos.

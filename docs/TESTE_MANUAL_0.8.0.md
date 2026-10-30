# Verificação humana da 0.8.0

Linux/Chromium com SwiftShader foi usado nos testes automatizados. É necessário conferir Windows, GPU real, legibilidade, áudio e conforto de condução. Usar branch feat/tutorial-assets e conferir 0.8.0 no menu.

1. Novo jogo: identificar sinais de moradia no barracão, olhar para área de dormir/armazenamento e ferramentas. Inspecionar as duas bancadas, percorrer a porta lateral e completar o tutorial sem teleporte. Conferir áreas de estacionamento livres.
2. Comparar as capturas before/after em evidence/world-0.8.0: barracão, arredores, estrada, Oficina do Cotovelo e Posto Boa Viagem. Conferir mangueiras, ferramentas, superfícies e composições no próprio jogo.
3. Dirigir pelo km 0,32 e passar lentamente pela depressão na pista. Conferir rodas/suspensão, comportamento da carga e contato visual com o piso. O treino junto ao abrigo permanece intacto.
4. Motel Última Luz, km 0,38: entrar pela rampa/porta, alcançar a recepção e recolher a reserva. Pátio dos Retornantes, km 2,02: observar o caminhão imobilizado e a oficina interrompida; recolher as peças separadas. Balança Rodoviária 07, km 2,46: acessar a plataforma lateral, registrar o boletim e consultá-lo no mapa. São os três novos POIs; ferro-velho/depósito novos não foram declarados prontos.
5. Testar mochila cheia: ação deve explicar falta de capacidade, manter a reserva e não alterar os recursos. Liberar peso no Titã, voltar, recolher uma vez e confirmar ausência de reposição após sair da região, salvar, reiniciar e carregar.
6. Conversar com Zeca, Tomás e Mãe Ivani; visitar oficina e testar compras/reparos. Conferir que F executa a entidade indicada e que móveis não bloqueiam o atendimento. Fazer a primeira entrega, recalibrar quando necessário e continuar a Rede.
7. Observar os cinco períodos do dia, faróis e luzes dos locais habitados. Noite deve manter caminhos reconhecíveis. Menus pausam o relógio. Configurações oferecem dia de 24/48/96 minutos de simulação ativa. Em desenvolvimento, setTime no diagnóstico permite amostrar horários; não é um comando do jogo publicado em produção.
8. Conferir passos em asfalto/terra/interior, som localizado de gerador/ferramentas/água e efeitos de entrada/saída/reparo. Testar volume zero e pausa imediata. São sons sintetizados originais; gravações profissionais e avaliação auditiva ainda faltam.
9. Ver Dante em terceira pessoa e conversar com atendentes. Equipamentos seguem os ossos sem deslocar o colisor. Conferir encaixe de bonés, mochila, aventais e óculos. Rostos/arte final e animação completa de escalada continuam pendentes.
10. Ativar o primeiro Núcleo e voltar ao abrigo: verificar chuva/vegetação e canteiros. Visitar os outros biomas e observar vocabulário próprio de decoração. A expansão não finaliza todo o continente.
11. Repetir visitas em Baixo/Médio/Alto e observar memória, draw calls, estabilidade e carregamento. Testar sessão longa e mudanças de qualidade. Métricas em software não validam 60 FPS em hardware.

Para repetir o teste técnico de reinício, parar dev/e2e e executar node scripts/verificar-reinicio.mjs. Ele usa banco temporário isolado e não transfere/apaga saves do usuário. Para o build, também encerrar o servidor de desenvolvimento antes de npm run build.


Capturas técnicas, com um único dev ativo na porta 3000 e nenhuma suíte WebGL em paralelo:

```sh
node scripts/capturar-ambientes.mjs after
node scripts/capturar-ambientes.mjs moradia moradia
node scripts/capturar-ambientes.mjs night estrada
```

Os diagnósticos encurtam as viagens para posicionar as câmeras; não substituem a avaliação humana de navegação sem teleporte. As cinco poses de after correspondem a before; moradia e night são vistas adicionais, sem par histórico.

# Avaliação manual — primeiros 30 minutos da 0.8.2

Este é um roteiro para Windows/GPU real, não o relato de uma sessão humana realizada no ambiente remoto. As automações separadas podem usar diagnóstico de viagem e não substituem este percurso.

## Preparação

Atualizar a branch de trabalho publicada, instalar dependências com `npm ci`, iniciar com `npm run dev` ou INICIAR_JOGO.bat e confirmar 0.8.2 no menu quando a versão estiver preparada. Preservar local.db e os cookies de partidas antigas. Registrar GPU, navegador, resolução e perfil gráfico. Começar no Médio; comparar Baixo/Alto depois, nas mesmas posições e horas.

## Percurso de referência

1. Menu: conferir Titã, transparência, sombras, legibilidade e carregamento sem erros.
2. Novo jogo: explorar barracão sem pular o tutorial. Caminhar, olhar, inspecionar caderno e bancada; atravessar a porta lateral. Observar cama, objetos, ferramentas e luzes sem atravessar móveis.
3. A pé: C alterna perspectiva; conferir rosto/equipamentos de Dante, caminhada, corrida, rotação e câmera perto de paredes.
4. Titã: aproximar da cabine e usar F. Conferir apresentação da entrada, vidro, painel, bancos e visão da estrada. C alterna as três câmeras. Não confundir uma transição visual com uma animação completa de escalada/contato.
5. Direção: E liga; W acelera; A/D vira; S freia e, parado, engata ré; Espaço para estacionar. Observar seis rodas, suspensão, peso, marcha/RPM e correspondência dos instrumentos ao HUD.
6. Manutenção: cumprir a manobra de treino, desligar E, descer F e abrir V. Reparar de verdade. Tab permite transferir peças/água/diesel da mochila ao compartimento. Deixar reserva para o gerador: 4 L de diesel e uma peça.
7. Primeira Semente: conversar com a sobrevivente no Abrigo 07 e aceitar a viagem. M planeja o desvio; dirigir é necessário para percorrê-lo. Abastecer usando os recursos do inventário antes de partir.
8. Paradas: visitar motel (km 0,38), Oficina do Cotovelo/Marta (km 0,55), oficina abandonada (km 1,65), pátio (km 2,02), Posto Boa Viagem/Zeca (km 2,25) e pesagem (km 2,46), conforme o tempo disponível. Testar acessos, F, serviços e diário J. Reservas não podem reaparecer ao repetir a ação.
9. Rota: contornar a barreira do km 1,1; reduzir em terreno ruim. Anotar qualquer trecho que esconda a via, prenda o caminhão ou torne o objetivo confuso.
10. Núcleo 1 (km 2,89): estacionar nos balizadores, desligar o motor e falar com Tomás para ligar o gerador. Conferir recursos. Operar o terminal e calibrar com peças se necessário; tentar a ativação.
11. Persistência: salvar num slot, fechar e reabrir a aplicação, continuar. Conferir local/modo, combustível, inventário, carga, componentes, tutorial, descobertas, horário e estado do Núcleo. Falha de ativação deve permitir recuperação, sem perder a Semente.

Não há obrigação de alcançar o Núcleo em exatamente 30 minutos: registrar o ponto efetivamente alcançado e continuar o teste depois. Não usar teleportes neste percurso manual.

## O que registrar

- Instrução ou interação que não ficou clara; objetivo exibido e posição aproximada/km.
- Câmera: painel legível, estrada livre à frente, ausência de clipping; retorno ao exterior ao descer.
- Personagens: identidade de Zeca/Marta/Tomás, enquadramento e ausência de roupas flutuando ou atravessando o corpo.
- Ambientes: solo texturizado, objetos apoiados, portas acessíveis, noite jogável e faróis úteis.
- FPS/engasgos, tempo de carregamento, perfil/resolução e console WebGL. Comparar sempre a mesma cena, sem transformar SwiftShader em benchmark de GPU.
- Reprodução do problema: ação, resultado esperado, observado, captura real e se persistiu após recarregar.

Economia dinâmica, novos caminhões dirigíveis, facções, rotinas completas e finais continuam no roadmap posterior. Arte humana compartilhada e animações de contato precisam ser avaliadas pelo resultado real, não pela existência de arquivos.

# Preparação para 0.10.0 — garagem e caminhões

A 0.9.0 prepara o lugar físico da garagem municipal em Cinza Nova: acesso viário, espaço aberto de manobra, cobertura e bancada. Não há compra, skin, melhoria mecânica ou seleção de caminhões implementada por essa preparação.

## Próxima base de trabalho

Primeiro estabilizar a rede piloto, aprovar os acessos e revisar a experiência no Windows/GPU. Usar a branch efetivamente revisada, preservar PRs, saves e commits e repetir o diagnóstico antes de editar. Ler a matriz de acessibilidade, o relatório 0.9.0 e AGENTS.

## Garagem funcional

- Reaproveitar destino/acesso `garagem-cinza-nova` e interação contextual, sem sistema paralelo de missões.
- Definir serviço com veículo parado, motor desligado, espaço livre e transações atômicas de recursos; não permitir compra duplicada nem aplicar upgrade sem custo.
- Persistir propriedade, configuração e veículo ativo com migração versionada; conservar o Titã e sua carga em saves existentes.
- Fazer a troca somente em posição física segura, verificando dimensões do caminhão e colisores. Não usar troca de modelo visual sobre a física de outro veículo.

## Quatro candidatos já locais

Auditar cada GLB, licença e direito de distribuição. Identificar escala, orientação, massas, eixos, número de rodas, pivôs, direção/suspensão, cockpit, instrumentos e portas. Os quatro modelos preparados continuam sendo candidatos, não veículos dirigíveis. A caçamba parada no pátio continua sendo cenário.

## Personalização

Preparar catálogo de pinturas e peças compatíveis por veículo e separar visual de atributos físicos. Pintura não muda torque ou colisão. Modificações mecânicas exigem limites, custo e testes reais de transmissão, temperatura, consumo, frenagem e massa da carga. Preservar as políticas de opacidade/vidros do Titã; não recolocar material BLEND único.

## Validação futura

Cobrir compra/transação/recarregamento sem duplicação, troca/carga, limites da garagem, seis rodas do Titã, novos veículos em escala real e saves legados. Confirmar licenças CC BY-NC antes de qualquer proposta comercial. Economia dinâmica, facções, rotinas e quatro finais continuam em roadmap, sem marcar como prontos.

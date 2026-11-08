# Game Brief: 2047 — Rede Aurora

> Resumo de uma página da visão em [`docs/VISAO_CRIATIVA.md`](../docs/VISAO_CRIATIVA.md), que é a referência completa. O estado técnico está em `STATUS_DO_PROJETO.md` e nos relatórios de versão.

**One-sentence pitch:** Um caminhoneiro comum e seu caminhão de 2003 atravessam um continente devastado levando Sementes frágeis a sete Núcleos, e cada viagem bem-feita faz o mundo voltar a chover.

## Core loop
- Preparar o Titã (diesel, peças, rota, carga) → dirigir com peso e física reais por estradas que cobram atenção → chegar, estacionar, descer e agir a pé.
- Ativar um Núcleo, fazer um frete ou ajudar uma comunidade → receber recursos, relações e restauração visível na paisagem.
- Voltar à estrada mais preparado, com o mundo mudado e a história avançando pelo rádio e pelas pessoas.

## Player goal & fail state — what "working" looks like
- Objetivo: reativar os sete Núcleos em sequência e chegar a um dos quatro finais; depois continuar livre no mundo resultante.
- Falha é recuperável: Semente avariada recalibra, caminhão quebrado repara, falta de recurso se resolve. Uma sessão está completa quando uma viagem terminou com o mundo ou a relação com alguém diferente do início.

## MVP — what must exist to be the game
- Direção pesada, satisfatória e legível (dois caminhões homologados).
- Sete Núcleos com restauração ambiental visível por bioma.
- Cinco biomas com identidade visual própria e estradas conectadas com escolhas de rota.
- Comunidades com pessoas, rádio narrativo e escolhas com consequência.
- Garagem física, contratos e progressão sem grind.
- Campanha com capítulos, Brutus, Voz e quatro finais.

## Out of scope — not building this
- Multiplayer, combate como loop principal, mundo gigante vazio, multidões ou trânsito moderno, cópia de assets/mapas/interfaces de jogos comerciais, troca de stack (Three.js/Rapier/Next.js).

## Build order
1. Direção e Núcleo 1 com restauração marcante (feito, falta validação humana).
2. Identidade visual dos biomas e cidades (atual: o mundo ainda parece protótipo).
3. Narrativa jogável (capítulos, cenas, escolhas) sobre o rádio já existente.
4. Mundo vivo (tráfego leve, rotinas, segunda cidade).
5. Finais e pós-campanha.

---
**Who it's for / what they feel:** jogadores de simulação e de jornada que querem viagens longas e contemplativas, com a sensação de solidão na estrada virando esperança.

**Art & audio direction:** realismo ambiental pós-apocalíptico (PBR, ferrugem, concreto gasto, poeira, luz natural), contraste forte entre devastado e restaurado; áudio sintetizado com motor diesel, rádio de ondas curtas e chiado.

**Reference game:** Pacific Drive — o vínculo com o veículo num mundo hostil; sem anomalias sobrenaturais nem loop de expedições curtas.

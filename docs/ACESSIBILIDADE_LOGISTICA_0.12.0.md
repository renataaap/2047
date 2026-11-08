# Acessibilidade logística 0.12.0

Auditoria local: 14/14 aproximações físicas, estacionamento, saída e caminhada aos sete terminais passaram com os dois caminhões. Rodada access-focused-2, 2 E2Es / 6,5 min. Não representa sete viagens interregionais nem uma sessão humana. Cada fixture começa 24 m antes do depósito, com os Núcleos 1–6 já ativos e a Semente 7 preservada. A posição inicial usa a altura real do terreno, inclusive os 93 m da Oficina do Passo.

| Depósito | Titã: metros integrados | Basculante: metros integrados | Faixa / terminal |
| --- | ---: | ---: | --- |
| cinza | 20.86 | 20.84 | ambos acessíveis |
| cotovelo | 20.86 | 20.85 | ambos acessíveis |
| abrigo | 20.84 | 20.84 | ambos acessíveis |
| ivani | 20.87 | 20.85 | ambos acessíveis |
| janelas | 20.85 | 20.84 | ambos acessíveis |
| passo | 20.85 | 20.83 | ambos acessíveis |
| horizonte | 20.85 | 20.84 | ambos acessíveis |

Provas com limites de passo, velocidade final, desvio, posição, orientação e acesso ao quadro em `evidence/contracts-0.12.0/access-focused-2/logistics-access/`. A rodada access-focused-1 foi interrompida porque o harness usava Y=3 fixo; não foi contada como aprovação. Não houve alteração da física do jogo para corrigir esse fixture.

As faixas e terminais entram nas exclusões da vegetação. Não foram criadas novas cidades, entradas por teleporte ou estradas desconectadas. A campanha e os seus sete Núcleos/Cofres usam os acessos anteriores; a regressão completa da candidata permanece registrada separadamente.


## Rechecagem e manobra de saída

Os mesmos 14 acessos passaram novamente na integral 593e83b de 51 cenários. A continuidade do Titã após sua primeira entrega confirmou também saída da Oficina do Cotovelo e retorno a Cinza Nova. Como o caminhão estava apontando no sentido contrário ao GPS, o primeiro condutor de automação bateu na oficina tentando virar sem manobrar. A tentativa foi mantida no log; a correção executou ré até liberar a faixa e retorno lento no espaço livre a leste, com motor/esterçamento/Rapier originais. Foram integrados 3,02 rad de retorno sem atribuir posição/velocidade, depois a rota e o estacionamento de destino passaram. Ver post-integral/native-manoeuvre.json e two-real-jobs-career.json. Esse resultado não substitui avaliação humana das manobras com os dois caminhões nos demais depósitos.

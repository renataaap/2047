# Comparação visual e custos — restauração 0.11.0

**48 capturas reais:** 16 referências da 0.10.0 e 32 novas, em oito enquadramentos e quatro estágios. Fonte nova `8479b9a`; referência `4771193`. Não foram usados renders externos nem imagens retocadas.

Abra [o comparador interativo](../evidence/restoration-0.11.0/comparacao.html) numa cópia local do repositório. Ele usa as pastas before/after ao lado do HTML. No GitHub, os links de PNG abaixo permitem ver os originais. [Métricas completas](../evidence/restoration-0.11.0/visual-metrics.json).

## Mesmas condições

09h de simulação, perfil Baixo, escala de 75%, 1280 × 720; mesmas posições, perspectiva e ângulos de câmera. Poses e idades ecológicas são fixtures de diagnóstico declaradas, não provas de viagem humana. Vento e gotas de chuva são animados e não têm congelamento de fase. Os arquivos frames.json guardam os estados completos, commit e erros. Todas as quatro coletas novas terminaram sem erros de página/console.

| Vista | Devastação anterior | Restauração antiga | Primeira resposta · 12 s | Recuperação inicial · 110 s | Avançada · 240 s |
|---|---|---|---|---|---|
| Estrada de acesso | [Antes](../evidence/restoration-0.11.0/before/devastated/acesso.png) | [Antiga](../evidence/restoration-0.11.0/before/legacy-restored/acesso.png) | [12 s](../evidence/restoration-0.11.0/after/response/acesso.png) | [110 s](../evidence/restoration-0.11.0/after/recovering/acesso.png) | [240 s](../evidence/restoration-0.11.0/after/advanced/acesso.png) |
| Estacionamento | [Antes](../evidence/restoration-0.11.0/before/devastated/estacionamento.png) | [Antiga](../evidence/restoration-0.11.0/before/legacy-restored/estacionamento.png) | [12 s](../evidence/restoration-0.11.0/after/response/estacionamento.png) | [110 s](../evidence/restoration-0.11.0/after/recovering/estacionamento.png) | [240 s](../evidence/restoration-0.11.0/after/advanced/estacionamento.png) |
| Núcleo 1 | [Antes](../evidence/restoration-0.11.0/before/devastated/nucleo.png) | [Antiga](../evidence/restoration-0.11.0/before/legacy-restored/nucleo.png) | [12 s](../evidence/restoration-0.11.0/after/response/nucleo.png) | [110 s](../evidence/restoration-0.11.0/after/recovering/nucleo.png) | [240 s](../evidence/restoration-0.11.0/after/advanced/nucleo.png) |
| Encosta | [Antes](../evidence/restoration-0.11.0/before/devastated/encosta.png) | [Antiga](../evidence/restoration-0.11.0/before/legacy-restored/encosta.png) | [12 s](../evidence/restoration-0.11.0/after/response/encosta.png) | [110 s](../evidence/restoration-0.11.0/after/recovering/encosta.png) | [240 s](../evidence/restoration-0.11.0/after/advanced/encosta.png) |
| Área aberta | [Antes](../evidence/restoration-0.11.0/before/devastated/area-aberta.png) | [Antiga](../evidence/restoration-0.11.0/before/legacy-restored/area-aberta.png) | [12 s](../evidence/restoration-0.11.0/after/response/area-aberta.png) | [110 s](../evidence/restoration-0.11.0/after/recovering/area-aberta.png) | [240 s](../evidence/restoration-0.11.0/after/advanced/area-aberta.png) |
| Da cabine | [Antes](../evidence/restoration-0.11.0/before/devastated/cabine.png) | [Antiga](../evidence/restoration-0.11.0/before/legacy-restored/cabine.png) | [12 s](../evidence/restoration-0.11.0/after/response/cabine.png) | [110 s](../evidence/restoration-0.11.0/after/recovering/cabine.png) | [240 s](../evidence/restoration-0.11.0/after/advanced/cabine.png) |
| A pé | [Antes](../evidence/restoration-0.11.0/before/devastated/a-pe.png) | [Antiga](../evidence/restoration-0.11.0/before/legacy-restored/a-pe.png) | [12 s](../evidence/restoration-0.11.0/after/response/a-pe.png) | [110 s](../evidence/restoration-0.11.0/after/recovering/a-pe.png) | [240 s](../evidence/restoration-0.11.0/after/advanced/a-pe.png) |
| Solo e grama | [Antes](../evidence/restoration-0.11.0/before/devastated/solo.png) | [Antiga](../evidence/restoration-0.11.0/before/legacy-restored/solo.png) | [12 s](../evidence/restoration-0.11.0/after/response/solo.png) | [110 s](../evidence/restoration-0.11.0/after/recovering/solo.png) | [240 s](../evidence/restoration-0.11.0/after/advanced/solo.png) |

## O que as vistas demonstram

A encosta e a área aberta mostram agrupamentos de gramíneas, arbustos e árvores jovens com troncos e folhas, além de manchas orgânicas e úmidas no terreno. A primeira resposta já apresenta chuva; a maturidade amplia a cobertura, preservando pista e área de estacionamento. As vistas de cabine/a pé usam as câmeras reais existentes. A comparação da restauração antiga também está disponível para que o ganho não dependa apenas de comparar uma região ativa com outra inativa.

A arte é procedural original, com modelos de baixo custo e LOD. Não é apresentada como arte botânica final, floresta adulta ou vegetação completa em todas as rachaduras/muros urbanos.

## Custos nas mesmas vistas

Valores da cena inteira no frame capturado, no mesmo ambiente Chromium/ANGLE SwiftShader. Instâncias são as carregadas nos setores, incluindo aquelas fora do enquadramento; draw calls/triângulos são os reportados pelo renderer. Contagens de geometrias/texturas não medem bytes de VRAM.

| Vista | Calls antigo → novo | Triângulos antigo → novo | Geometrias antigo → novo | Texturas antigo → novo | Tufos / arbustos / árvores novos |
|---|---|---|---|---|---|
| Núcleo 1 | 153 → 182 | 207.636 → 640.172 | 151 → 194 | 94 → 98 | 17.460 / 475 / 197 |
| Encosta | 116 → 143 | 172.412 → 558.172 | 160 → 203 | 94 → 98 | 13.132 / 346 / 145 |
| Solo e grama | 75 → 102 | 128.428 → 431.212 | 189 → 232 | 106 → 110 | 16.125 / 441 / 183 |
| Da cabine | 142 → 172 | 171.823 → 624.743 | 180 → 223 | 106 → 110 | 16.679 / 452 / 184 |

No enquadramento do Núcleo, os 18.132 elementos carregados são agrupados em instâncias compartilhadas: o custo sobe 29 draw calls e cerca de 433 mil triângulos. Isso é um custo real de qualidade visual, não uma melhora gratuita de desempenho. O comparador permite examinar os demais estágios e vistas.

## Preparação e memória

Carregamento medido na nova coleta: devastated: 17.5 s, response: 14.6 s, recovering: 17.6 s, advanced: 17.1 s. Esse intervalo inclui navegação, menu e carregar a fixture; não inclui as oito screenshots. O preparo inicial da vegetação avançada levou aproximadamente 2,0 s. Na encosta, a maior fatia de planejamento foi de 54,9 ms e a maior construção de célula, 42,0 ms; custos de primeira preparação ainda justificam avaliação de hitch em hardware real.

O campo antigo “loadMs” da baseline incluía também as capturas: permanece preservado, mas **não é usado como benchmark de carregamento anterior**. O heap JavaScript observado nas quatro vistas principais avançadas ficou aproximadamente entre 135 e 144 MiB; isso não inclui VRAM nem constitui comparação de memória com a baseline.

O teste de streaming visita os cinco biomas duas vezes no mesmo renderer. As posições/contagens retornam iguais e os recursos próprios da restauração ficam limitados a dez texturas e trinta conjuntos de geometria; caches de outros sistemas podem aumentar durante o primeiro circuito. Não se afirma que todos os contadores globais são constantes nem que isso substitui um teste prolongado de memória. Os resultados da integral serão registrados no relatório da versão.

## Limites da validação visual

Não houve medição de FPS em GPU Windows. SwiftShader serve para erros de shader, links, screenshots e regressões automatizadas; não substitui driver/hardware real, qualidade percebida pelo jogador, audição ou uma sessão humana. Perfis Médio/Alto, ramo de 16 samplers, persistência e acesso físico têm provas separadas no relatório e na matriz de acessos.

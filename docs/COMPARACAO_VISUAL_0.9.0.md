# Comparação visual — rede 0.9.0

Onze pares de capturas reais do jogo, nas mesmas posições, orientação, horário (09:00), perfil Baixo, escala 75% e resolução 1280×720. As capturas da cena usam posicionamento de diagnóstico e não comprovam uma viagem. A prova física está separada em `pilot`, `physical-route-a` e `final-access`. Algumas telas técnicas ainda mostram a identificação 0.8.2 porque foram capturadas durante a implementação; os testes finais usam o pacote 0.9.0. Nenhuma imagem foi gerada por IA ou substituída por render externo.

## Comparações

| Situação | Base 0.8.2 | Nova rede |
| --- | --- | --- |
| Entroncamento | ![Antes](../evidence/roads-0.9.0/before/entroncamento.png) | ![Depois](../evidence/roads-0.9.0/after/entroncamento.png) |
| Cidade | ![Antes](../evidence/roads-0.9.0/before/cidade.png) | ![Depois](../evidence/roads-0.9.0/after/cidade.png) |
| Alternativa | ![Antes](../evidence/roads-0.9.0/before/alternativa.png) | ![Depois](../evidence/roads-0.9.0/after/alternativa.png) |
| Acesso core 1 | ![Antes](../evidence/roads-0.9.0/before/acesso-core-1.png) | ![Depois](../evidence/roads-0.9.0/after/acesso-core-1.png) |
| Acesso core 2 | ![Antes](../evidence/roads-0.9.0/before/acesso-core-2.png) | ![Depois](../evidence/roads-0.9.0/after/acesso-core-2.png) |
| Acesso core 3 | ![Antes](../evidence/roads-0.9.0/before/acesso-core-3.png) | ![Depois](../evidence/roads-0.9.0/after/acesso-core-3.png) |
| Acesso core 4 | ![Antes](../evidence/roads-0.9.0/before/acesso-core-4.png) | ![Depois](../evidence/roads-0.9.0/after/acesso-core-4.png) |
| Acesso core 5 | ![Antes](../evidence/roads-0.9.0/before/acesso-core-5.png) | ![Depois](../evidence/roads-0.9.0/after/acesso-core-5.png) |
| Acesso core 6 | ![Antes](../evidence/roads-0.9.0/before/acesso-core-6.png) | ![Depois](../evidence/roads-0.9.0/after/acesso-core-6.png) |
| Acesso core 7 | ![Antes](../evidence/roads-0.9.0/before/acesso-core-7.png) | ![Depois](../evidence/roads-0.9.0/after/acesso-core-7.png) |
| Mapa | ![Antes](../evidence/roads-0.9.0/before/mapa.png) | ![Depois](../evidence/roads-0.9.0/after/mapa.png) |

## Custos nas mesmas cenas

Draw calls e triângulos são contadores do renderizador, não FPS em GPU física. O custo aumentou onde foram acrescentadas ruas, acessos, fachadas e placas. Sombras/configuração diferentes não foram misturadas nesta tabela. Texturas locais e cache foram reaproveitados.

| Cena / pose | Draw calls antes → depois | Triângulos antes → depois |
| --- | --- | --- |
| entroncamento | 64 → 184 | 127,108 → 185,484 |
| cidade | 22 → 61 | 63,806 → 78,546 |
| alternativa | 81 → 87 | 138,846 → 142,942 |
| acesso-core-1 | 97 → 94 | 116,650 → 116,624 |
| acesso-core-2 | 66 → 66 | 67,074 → 68,980 |
| acesso-core-3 | 107 → 110 | 115,804 → 119,414 |
| acesso-core-4 | 63 → 66 | 80,458 → 82,528 |
| acesso-core-5 | 58 → 58 | 69,200 → 72,374 |
| acesso-core-6 | 70 → 70 | 98,512 → 99,778 |
| acesso-core-7 | 71 → 68 | 104,070 → 92,226 |

## Percursos e interfaces

- [Planejador M](../evidence/roads-0.9.0/focused-browser/roads-navigation/route-planner.png): seleção, grafo real e custos calculados.
- [Cabine durante a viagem](../evidence/roads-0.9.0/pilot/02-city-cab.png): minimapa integrado, instrumentos preservados.
- [Cidade e posto](../evidence/roads-0.9.0/pilot/03-city-fuel.png): serviço com estoque e pagamento reais.
- [Núcleo 1 após acesso físico](../evidence/roads-0.9.0/final-access/core-1/interaction.png): ativação e restauração.
- [Matriz dos 14 acessos](ACESSIBILIDADE_NUCLEOS_0.9.0.md): entradas e saídas dirigidas, com painéis e screenshots próprios.

As capturas de perfil/noturna mais recentes ficam na execução E2E final. A inspeção visual automática e SwiftShader não substituem avaliação artística, audição, Windows ou GPU real.

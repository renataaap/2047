# Incrementos — contratos 0.12.0

Base 69afd07/0.11.0; PR #5 aberto. Branch feat/contratos-economia-0.12.0. Main 4771193/0.10.0 preservada.

## A — diagnóstico

Commit f46ce5f. Baseline executada nesta tarefa: 257 unitários/34 arquivos, build e 1 E2E de comércio/atores (1,3 min), todos aprovados. Não são os 44 E2Es históricos, que não foram repetidos integralmente antes de programar. Logs separados em evidence/contracts-0.12.0.

## B — núcleo puro

Catálogo com seis pontos de contratação em locais existentes, um recebimento/devolução no Abrigo 07 e doze modelos estruturados de encomenda, filtrados por progressão, rede, carreira e capacidade. No máximo duas ofertas por quadro, renovação em 900 s de simulação ativa e identificação por modelo/época. Manifesto separado de estoques e Semente; regras de acomodação por veículo, estados/estacionamento/percurso, histórico e encerramento por época impedem pagamento repetido. Carreira concede XP só ao concluir, sem bônus físicos mágicos. Cotação regional central em inteiros, com estoque, demanda, restauração e recompra limitada.

**32 testes novos em dois arquivos passaram** numa execução focada de 0,6 s. Isso valida lógica, não quadro no mundo, carga visual, trajeto, persistência real ou diversão. A integração cliente/3D ainda será implementada e validada. Rótulo da aplicação permanece 0.11.0 durante o desenvolvimento.

## C–F — integração em validação

Terminais físicos transmitidos por proximidade nos locais existentes; manifesto e quatro peças de porta traseira do Titã derivadas das faces originais, sem alterar GLB, atlas ou política de opacidade. Carga procedural por tipo e berço, descarregada sem deixar itens grátis. Massa/centro de massa adicionais no Rapier; tuning, seis rodas e carroceria física preservados. Painel de encomendas, manifesto, carreira e histórico; GPS alterna campanha/frete sem substituir o destino narrativo. Economia central aplicada às transações e aos preços da interface, com gravação otimista e rollback. Schema 3 recebe extensões opcionais, sem reiniciar frota ou campanha.

Rodadas novas, separadas: 289/289 unitários após primeira integração e novamente após comércio; 13/13 testes focados adicionais para gravação, transferência, GPS, faces reais e Rapier. A rodada agregada seguinte está no log integrated-unit-3. Um frete comum de 630 kg com Titã e outro com Basculante passaram em duas rodadas de navegador de 1,8 min cada. O Titã percorreu 776,81 m pela física original (0,097 m no maior passo; desvio máximo de 1,47 m); pagamento de 7 materiais e 108 XP persistiu após recarga. São fixtures locais em Cinza Nova, não sessões humanas desde o barracão.

Falhas preservadas: physical-1 revelou um ponto de retorno à cabine incorreto no harness (sinal do eixo longitudinal); physical-2 revelou que o loader dá nomes de malha diferentes do nome do nó GLB. O seletor de portas agora usa função do material e triângulos realmente traseiros. A rodada physical-3 passou. Algumas primeiras capturas do Titã ainda mostram a transição de entrada: não usar como aprovação artística. O harness aguarda agora tanto o fade de viagem quanto a opacidade zero da transição da cabine. A captura do Basculante em focused-4 é visível e mostra Semente e tambores separados. O HUD do frete foi deslocado para não sobrepor a Semente.

O Basculante será revalidado com instrumentos frágeis em sentido inverso para aumentar a variedade comprovada. Ainda faltam regressão integral, auditoria dos terminais regionais, build final, reinício real e playtest humano/balanceamento. O número da aplicação permanece 0.11.0 neste checkpoint.

## G — candidata e regressões

PR #6 aberto em rascunho, empilhado sobre a branch do PR #5. Main continua 4771193/0.10.0. O GitHub foi novamente consultado pelo conector com a vinculação renataaap; o cliente CLI não tinha acesso à API e não foi usado para contornar essa restrição. O push Git da branch funciona.

0.12.0 é agora o rótulo da candidata, com validação final ainda pendente explicitamente no README/status. Cinco especializações habilitam encomendas posteriores de maneira moderada; não alteram física. Estimativas usam massa efetiva, inclusive enquanto a coleta está pausada, e o mapa M acompanha o foco do frete. O painel reaproveita foco/teclado/ESC existente. Carga e palete respeitam volume e os materiais compartilhados não são descartados na descarga.

Novos resultados: 314/314 unitários/37 arquivos (57 acima da base), dois builds de candidata aprovados sequencialmente com dev parado e 5/5 E2Es em 5 min (três slots/validação, duas viagens por física, 409/rollback e gerador pesado/coleta/devolução). A coleta pesada tem uma carreira sintética prévia, claramente identificada; não conta como viagem comercial completa. A fonte recebeu ajustes finais depois dessas rodadas: apoio sobre paletes, validação de canhotos e recálculo ao abrir o caderno. A integral e o build final precisam usar essa fonte, sem atribuir as rodadas anteriores a ela.

Acessos regionais: access-focused-2 passou 2/2 testes/14 aproximações locais em 6,5 min. A primeira rodada foi interrompida por Y fixo no fixture, preservada com explicação. Não houve alteração da física para compensar a altitude da serra. Matriz em docs/ACESSIBILIDADE_LOGISTICA_0.12.0.md. Os 51 E2Es agora listados serão executados numa integral separada, um worker, depois da checagem focada do comércio anterior.


## H — validação e fechamento (07–08/11/2026)

Fonte 593e83b congelada durante a integral: **51/51 em 74,1 minutos**, um worker, sem falhas/skips/retries; 292 hashes de fonte e doze protegidos iguais. Inclui regressões de tutorial, campanha, restauração, samplers/chão, garagem, veículos, comércio, GPS, contratos e acessos locais. Referência anterior de 314 unitários/build está preservada.

Polimento 513b9a4: arredondamento da recompensa na unidade inteira mais próxima, valor conferido antes da descarga e rodapé 0.12.0. Quatro novos unitários, total **318/37 arquivos**, build e **6/6 E2Es em 6,1 min**. Não se apresenta integral de 52 casos. Fonte 81b8142: nomes de biomas e concordância no aviso de pagamento; os mesmos 318 unitários, build e **1/1 E2E de interface em 51,8 s** passaram. São seis caminhos alterados no total desde 593 (quatro de aplicação/dois de teste), sem mudar física, terreno, modelos, restauração, schema ou navegação. source-release.json registra a fonte final; os congelamentos anteriores continuam intactos.

Reinício real recuperou exatamente cinco saves (três slots/estados e as duas entregas reais). Primeira rodada preservada em restart-initial e rodada final em persistence-before/after-restart. Abrir o slot com mercadoria ativa confirmou a representação renderizada. Backend local libSQL/SQLite, não Turso de produção.

Uma sonda adicional continuou o save efetivamente criado pelo primeiro frete do Titã: instrumentos da oficina de volta a Cinza Nova, estacionamento, entrega, recarga e **264 XP/nível 2/duas entregas/1,57 km/15 materiais + uma peça**. A primeira saída automatizada ficou presa porque tentou inverter direção sem manobrar; log preservado. A segunda fez ré e retorno por Rapier, depois percorreu 761,18 m (794,36 m no canhoto incluindo manobra). Não houve teleporte/alteração da física. Captura de carreira antes dos últimos rótulos continua como prova de progresso; release-ui contém a apresentação traduzida final.

Doze ofertas do catálogo têm rotas válidas e acomodação compatível em auditoria sintética de planejamento. Isso não é prova de doze viagens dirigidas. O ensaio pesado prova coleta/devolução, não percurso completo. Duas viagens dos testes usam fixtures locais; não foram apresentadas como jornada humana desde o Novo jogo. As pendências de avaliação Windows/GPU, audição e equilíbrio humano permanecem no roteiro manual. PR #6 preparado para revisão; main e PR #5 preservados.

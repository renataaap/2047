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

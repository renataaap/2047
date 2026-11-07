# Incrementos — contratos 0.12.0

Base 69afd07/0.11.0; PR #5 aberto. Branch feat/contratos-economia-0.12.0. Main 4771193/0.10.0 preservada.

## A — diagnóstico

Commit f46ce5f. Baseline executada nesta tarefa: 257 unitários/34 arquivos, build e 1 E2E de comércio/atores (1,3 min), todos aprovados. Não são os 44 E2Es históricos, que não foram repetidos integralmente antes de programar. Logs separados em evidence/contracts-0.12.0.

## B — núcleo puro

Catálogo com seis pontos de contratação em locais existentes, um recebimento/devolução no Abrigo 07 e doze modelos estruturados de encomenda, filtrados por progressão, rede, carreira e capacidade. No máximo duas ofertas por quadro, renovação em 900 s de simulação ativa e identificação por modelo/época. Manifesto separado de estoques e Semente; regras de acomodação por veículo, estados/estacionamento/percurso, histórico e encerramento por época impedem pagamento repetido. Carreira concede XP só ao concluir, sem bônus físicos mágicos. Cotação regional central em inteiros, com estoque, demanda, restauração e recompra limitada.

**32 testes novos em dois arquivos passaram** numa execução focada de 0,6 s. Isso valida lógica, não quadro no mundo, carga visual, trajeto, persistência real ou diversão. A integração cliente/3D ainda será implementada e validada. Rótulo da aplicação permanece 0.11.0 durante o desenvolvimento.

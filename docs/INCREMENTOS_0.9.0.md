# Incrementos 0.9.0 — em desenvolvimento

Base: 55a5df3, 0.8.2, PR #1 ainda em revisão. Branch própria `feat/rede-rodoviaria-0.9.0`. O número do pacote continua 0.8.2 enquanto a aceitação não estiver concluída.

## A — diagnóstico registrado

Mapeamento de dependências, 175 testes da base executados nesta tarefa e 11 capturas anteriores. Ver DIAGNOSTICO_0.9.0.md. Os resultados históricos da 0.8.2 estão separados em baseline.json.

## B/C/D — implementação, validação parcial

Grafo conectado ao corredor legado, curvas e pisos distintos, vias urbanas de Cinza Nova, posto com estoque finito, oficina existente preservada, área industrial e garagem física sem compra de veículos. Geometria e colisão compartilham triângulos; streaming e liberação continuam ativos. Dijkstra com custos de distância, piso, risco e massa, minimapa no HUD e seleção no mapa M. Os campos opcionais de navegação e revisão geográfica preservam saves 1–3; migração próxima e determinística registra recuperações.

Checkpoint: 191 testes unitários em 27 arquivos aprovados (`checkpoint-unit.log`). Auditoria com Rapier: 3.536 amostras de piso novas, zero falhas (`resume-surface-audit.log`). Dez hashes de narrativa, cabine, GLB, física e parâmetros preservados.

Prova física parcial: 920,55 m do barracão ao posto urbano usando controles e simulação originais a 60 Hz, com tempo de diagnóstico acelerado, sem teleporte durante o trajeto. Não equivale a sessão humana em tempo real. Primeira tentativa de viagem completa encontrou a cerca do Pátio dos Retornantes no retorno de terra; curva corrigida e teste de afastamento acrescentado. Tentativa e capturas mantidas em pilot-attempt-1. Nova execução em andamento.

## E/F — pendentes

Validar fisicamente os sete Núcleos e Cofres, entrada/saída e caminhada até os terminais. Completar viagem piloto, persistência e recálculo no navegador. Executar build e suíte E2E integral, gerar comparações equivalentes, métricas e matriz de acessibilidade. Não há aprovação final da 0.9.0 neste checkpoint. Windows/GPU e avaliação humana continuam necessários.

Nenhum asset externo novo: reutilização dos modelos e materiais locais com créditos existentes. Sem alterações nos quatro módulos de narrativa protegidos.

## Validação posterior dos incrementos B–E

196 unitários/27 arquivos aprovados; três E2Es novos focados aprovados. Viagem piloto de 3.181,69 m desde Novo jogo concluída com oficina, cidade/posto, diesel, Vale, gerador, ativação e salvamento/recarregamento. Alternativa pavimentada de 2.506,72 m desde a bifurcação. Repetição final 14/14 acessos locais aprovada, incluindo seis contatos no estacionamento e saída segura. Ver matriz de acessibilidade e comparação visual (11 pares). A massa inferida dos pisos fixos causava a frenagem insuficiente encontrada no Núcleo 6; cenário agora tem densidade zero, controlador e parâmetros do Titã preservados. Pacote preparado como 0.9.0, com regressão integral/build ainda registrados separadamente na fase final.

# Acessibilidade após a restauração — 0.11.0

**28/28 percursos locais aprovados**, sete Núcleos e sete Cofres com cada um dos dois caminhões. A garagem de Cinza Nova também passou com ambos. Dados completos em [matriz](../evidence/restoration-0.11.0/access-main-2/matrix.json) e [garagem](../evidence/restoration-0.11.0/garage-access/matrix.json).

## Método e alcance da prova

Cada caso parte de uma fixture canônica na entrada viária local, com veículo saudável. O percurso usa os comandos originais e a física Rapier a 60 Hz, acelerando somente o tempo de diagnóstico. Inclui dirigir pela entrada, estacionar, sair a pé, alcançar e interagir com o terminal, carregar vegetação madura, salvar/carregar, retornar ao caminhão e sair pela via. Nenhuma posição é atribuída durante os deslocamentos. Não representa uma viagem humana pelo continente nem uma compra real dos veículos. Nos Cofres, a Semente já está ancorada: o teste não concede outra.

As composições e posições das plantas são determinísticas. O layout validado corresponde ao código `c9b3fcb`; a correção posterior de transformação de normais é exclusivamente visual, sem deslocar plantas, estradas, volumes de exclusão ou colisores. A regressão final e os hashes protegidos complementam esta auditoria.

## Matriz

Distâncias são as percorridas pela física na entrada + saída, arredondadas a décimos de metro. Os arquivos de prova preservam os estados completos e screenshots reais.

| Local | Titã — entrada + saída | Basculante — entrada + saída | Resultado |
|---|---|---|---|
| Núcleo 1 — A primeira faixa | [126.9 + 150.5 m](../evidence/restoration-0.11.0/access-main-2/titan-old/core-1/proof.json) | [126.9 + 150.5 m](../evidence/restoration-0.11.0/access-main-2/dump-truck/core-1/proof.json) | Aprovado nos dois |
| Cofre 1 | [16.8 + 180.0 m](../evidence/restoration-0.11.0/access-main-2/titan-old/vault-1/proof.json) | [16.8 + 180.0 m](../evidence/restoration-0.11.0/access-main-2/dump-truck/vault-1/proof.json) | Aprovado nos dois |
| Núcleo 2 — Viaduto | [133.0 + 153.1 m](../evidence/restoration-0.11.0/access-main-2/titan-old/core-2/proof.json) | [133.1 + 153.2 m](../evidence/restoration-0.11.0/access-main-2/dump-truck/core-2/proof.json) | Aprovado nos dois |
| Cofre 2 | [103.4 + 122.4 m](../evidence/restoration-0.11.0/access-main-2/titan-old/vault-2/proof.json) | [103.5 + 122.5 m](../evidence/restoration-0.11.0/access-main-2/dump-truck/vault-2/proof.json) | Aprovado nos dois |
| Núcleo 3 — As janelas vazias | [128.7 + 152.1 m](../evidence/restoration-0.11.0/access-main-2/titan-old/core-3/proof.json) | [128.7 + 152.1 m](../evidence/restoration-0.11.0/access-main-2/dump-truck/core-3/proof.json) | Aprovado nos dois |
| Cofre 3 | [84.9 + 112.3 m](../evidence/restoration-0.11.0/access-main-2/titan-old/vault-3/proof.json) | [84.9 + 112.3 m](../evidence/restoration-0.11.0/access-main-2/dump-truck/vault-3/proof.json) | Aprovado nos dois |
| Núcleo 4 — Mar ausente | [133.2 + 154.2 m](../evidence/restoration-0.11.0/access-main-2/titan-old/core-4/proof.json) | [133.2 + 154.2 m](../evidence/restoration-0.11.0/access-main-2/dump-truck/core-4/proof.json) | Aprovado nos dois |
| Cofre 4 | [107.4 + 133.3 m](../evidence/restoration-0.11.0/access-main-2/titan-old/vault-4/proof.json) | [107.5 + 133.5 m](../evidence/restoration-0.11.0/access-main-2/dump-truck/vault-4/proof.json) | Aprovado nos dois |
| Núcleo 5 — Passo de vidro | [134.7 + 155.7 m](../evidence/restoration-0.11.0/access-main-2/titan-old/core-5/proof.json) | [134.6 + 155.8 m](../evidence/restoration-0.11.0/access-main-2/dump-truck/core-5/proof.json) | Aprovado nos dois |
| Cofre 5 | [108.7 + 131.9 m](../evidence/restoration-0.11.0/access-main-2/titan-old/vault-5/proof.json) | [108.9 + 132.1 m](../evidence/restoration-0.11.0/access-main-2/dump-truck/vault-5/proof.json) | Aprovado nos dois |
| Núcleo 6 — Acima das nuvens | [128.7 + 151.9 m](../evidence/restoration-0.11.0/access-main-2/titan-old/core-6/proof.json) | [128.9 + 151.9 m](../evidence/restoration-0.11.0/access-main-2/dump-truck/core-6/proof.json) | Aprovado nos dois |
| Cofre 6 | [84.8 + 112.4 m](../evidence/restoration-0.11.0/access-main-2/titan-old/vault-6/proof.json) | [84.8 + 112.4 m](../evidence/restoration-0.11.0/access-main-2/dump-truck/vault-6/proof.json) | Aprovado nos dois |
| Núcleo 7 — Horizonte | [127.2 + 150.1 m](../evidence/restoration-0.11.0/access-main-2/titan-old/core-7/proof.json) | [127.2 + 150.1 m](../evidence/restoration-0.11.0/access-main-2/dump-truck/core-7/proof.json) | Aprovado nos dois |
| Cofre 7 | [108.7 + 128.8 m](../evidence/restoration-0.11.0/access-main-2/titan-old/vault-7/proof.json) | [108.9 + 129.0 m](../evidence/restoration-0.11.0/access-main-2/dump-truck/vault-7/proof.json) | Aprovado nos dois |

## Garagem em ambiente restaurado

O acesso parte da avenida de Cinza Nova e termina dentro da faixa física da garagem. O caminhão estaciona, desliga o motor e abre a interface real; depois sai em marcha à ré. Não usa atribuição de posição durante a aproximação.

| Veículo | Entrada | Saída | Resultado |
|---|---|---|---|
| Titã | 181.8 m | 28.9 m | Aprovado |
| Basculante Municipal | 181.1 m | 28.9 m | Aprovado |

## Tentativas preservadas e limites

A primeira auditoria foi interrompida por uma espera de carregamento curta no harness; seus logs e imagens permanecem em `access-main`. A nova execução completa fica em `access-main-2`, sem sobrescrever a anterior. A rodada de dois casos iniciais está em `access-trial`. Não somamos essas rodadas aos 28 casos da matriz final.

Verificação manual em Windows/GPU física, percepção de espaço e condução humana continuam necessárias. A auditoria comprova os percursos locais descritos, sem afirmar que todas as estradas do continente foram percorridas.

# Política de evidências (desde 09/11/2026)

**Por quê:** em 08/11/2026 o repositório tinha 1,81 GiB empacotado e `evidence/` cerca de 1 GB (PNGs de cada rodada e JSONs de até 90 mil linhas). Clones e sessões de IA ficam lentos, e um push único acima de 2 GB é recusado pelo GitHub. Decisão do criador: "coloque onde achar melhor".

**Regra:**
1. A saída bruta dos testes vai para `evidence/current-e2e/` (padrão de `AURORA_EVIDENCE_ROOT`) ou para qualquer `evidence/**/raw/`, e **não é versionada** (`.gitignore`).
2. No Git ficam só `validation.json` (comandos, commits, contagens, resultados), um `README` curto da rodada e **no máximo ~12 capturas comparativas** escolhidas (antes/depois), redimensionadas para ≤1600 px de largura.
3. Para guardar um conjunto completo, compacte e anexe a um *Release* do GitHub ou a um armazenamento externo, e cite o link no `validation.json`.
4. O histórico existente **não foi reescrito**: as evidências antigas continuam nos commits anteriores. Remover do histórico exigiria force push, o que o projeto proíbe.

**Ao rodar testes:**
```bash
AURORA_EVIDENCE_ROOT=evidence/current-e2e npx playwright test ...   # bruto, ignorado
```

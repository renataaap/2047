# Claude Code Game Studios (CCGS) instalado

Origem: https://github.com/Donchitos/Claude-Code-Game-Studios — release 1.2.0, commit `05ad7c8`, licença MIT (cópia em `.claude/CCGS-LICENSE`).

## O que foi instalado

- `.claude/agents/` — 49 agentes (diretores, líderes e especialistas).
- `.claude/skills/` — 74 skills (`/start`, `/adopt`, `/project-stage-detect`, `/brainstorm`, `/design-system`, `/create-stories`, `/dev-story`, `/story-done`, etc.).
- `.claude/rules/`, `.claude/docs/`, `.claude/hooks/`, `.claude/scripts/`, `.claude/statusline.sh` — regras por caminho, referências, templates e scripts usados pelas skills.
- `project.yaml` — configuração do CCGS (rigor padrão `minimal`).
- `.gitignore` — estado local do CCGS (`project.local.yaml`, `production/session-*`, `.claude/agent-memory/`, `.claude/worktrees/`).

## O que NÃO foi ativado, de propósito

- **`settings.json` do template (hooks + lista de bloqueios)**: não foi criado. Os hooks validam commits/pushes/escritas segundo o layout de Godot/Unity/Unreal e a lista `deny` bloquearia comandos já usados aqui (por exemplo `rm -rf .next`). Os scripts estão em `.claude/hooks/`; para ativá-los, copie o bloco `hooks`/`statusLine` de `settings.json` do repositório original para `.claude/settings.json`.
- **`CLAUDE.md` do template**: não foi copiado para não conflitar com `AGENTS.md`, `STATUS_DO_PROJETO.md` e os relatórios de fase, que continuam sendo as instruções do projeto.
- Pastas de exemplo do template (`design/`, `production/`, `src/`, `docs/engine-reference/`, `studio-tests/`) não foram copiadas; as skills criam o que precisarem.

## Observações

- O jogo usa Next.js + Three.js + Rapier, não Godot/Unity/Unreal. Rode `/setup-engine` ou deixe o motor sem configurar; os agentes de motor específico não se aplicam.
- Para projeto existente, comece por `/project-stage-detect` ou `/adopt` (somente auditoria/plano; não recria a fase atual).
- A skill `/code-review` do CCGS tem o mesmo nome da skill embutida do Claude Code; `/help` do CCGS concorre com o comando nativo `/help`.
- Hooks e skills usam Bash e Python 3; no Windows é preciso Git Bash.

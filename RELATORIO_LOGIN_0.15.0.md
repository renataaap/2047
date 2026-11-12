# 0.15.0 — Login e cadastro

**Branch:** `feat/login-0.15.0`, criada sobre a 0.14 (`537b010`, branch `feat/narrativa-0.14.0`, ainda não integrada à main).
**Pedido do criador (12/11/2026):** "uma forma de fazer login e cadastro pro jogo pra ficar mais fácil de salvar o jogo". Decisões tomadas na mesma data: **usuário + senha**; jogar sem conta continua possível; as partidas salvas no navegador passam para a conta.

## Como funciona para o jogador

- No menu principal, **Entrar / Criar conta** (ou **Conta · nome** quando conectado).
- **Criar conta:** as partidas deste navegador passam a ser da conta.
- **Entrar em outro computador ou navegador:** as partidas da conta aparecem. Se aquele navegador tinha partidas próprias, elas vão para os slots livres da conta; nada é sobrescrito. As que não couberem ficam no navegador e voltam a aparecer ao sair da conta.
- **Sair:** a sessão é encerrada. Se a conta foi criada neste navegador, ele passa a jogar sem conta e não mostra mais as partidas da conta.
- **Sem conta:** tudo continua como antes (identidade por cookie, partidas só neste navegador).

## Implementação

| Parte | Onde | Notas |
|---|---|---|
| Banco | `migrations/002_accounts.sql`, `src/lib/repository.js` | Tabelas `accounts` e `sessions`. Os saves continuam indexados por `player_id`; a conta guarda o seu. `moveSavesToFreeSlots` nunca sobrescreve. |
| Regras | `src/lib/auth.js` | Usuário de 3 a 20 caracteres (letras, números, `.`, `-`, `_`; sem diferença de maiúsculas); senha de 8 a 128. Hash `scrypt` (N=16384, r=8, p=1) com sal aleatório; comparação em tempo constante. Token de sessão de 256 bits; **só o SHA-256 do token vai ao banco**. |
| Rotas | `src/lib/accountRoutes.js`, `src/app/api/auth/{register,login,logout,me}` | Mensagem igual para usuário inexistente e senha errada, com custo de hash equivalente. Bloqueio de 1 min depois de 5 erros seguidos. |
| Identidade | `src/lib/api.js` (`withIdentity`) | Com sessão válida, a identidade dos saves é a da conta; sessão inválida ou expirada é ignorada e o cookie é limpo. Verificação de origem existente preservada. |
| Cookies | — | `aurora_session`: HttpOnly, SameSite=Lax, 30 dias, `Secure` em produção/HTTPS. O cookie anônimo `playerId` continua como antes. |
| Interface | `src/components/menus/AccountPanel.js`, `src/data/account.js`, `src/app/account.css`, `MainMenu.js`, `GameView.js` | Abas Entrar/Criar conta, mensagens em pt-BR, lista de partidas recarregada depois de entrar ou sair. |

## Validação

- **Unitários:** 433/433 em 55 arquivos (`tests/unit/accounts.test.js`: regras, hash, token, cadastro levando o save, sair escondendo, login em outro navegador com slot ocupado preservado, saída devolvendo o save que ficou no navegador, nome repetido, dados inválidos, erro genérico, bloqueio, sessão adulterada, limites iguais entre interface e servidor).
- **Build:** aprovado.
- **E2E `account.spec.js`:** criar conta levando a partida → sair → outro navegador (cookies novos) → senha errada → senha certa → Continuar carrega a partida. Rodada focada com `interface` e `prologue`: **6/6**. Capturas em `evidence/current-e2e/account-0.15.0/`.
- **Primeira integral (73 testes, 12/11/2026, até ~11:19):** não ficou verde. Falharam 2:
  - `cutscene.spec.js` › *a pé com Dante*: a fixture de 1,5 s por plano terminava antes do clique em **Pular cena** (o botão sumia; timeout de 240 s). Correção só no teste: fixture `brutus-meeting` com planos de 4 s, como nos outros casos do mesmo arquivo. Código do jogo não mudou.
  - `game.spec.js` › *aceite: mundo real, W por 8 s…*: a pasta de resultado ficou vazia, sem contexto de erro; a causa não foi identificada.
- **Rechecagem focada desses 2 (com a correção):** 2/2 (Chrome do sistema, porta 3100). Não é uma integral.
- **Segunda integral (73 testes, código `a4d0d77`, 12/11/2026, 46,8 min, porta 3100, Chrome do sistema):** **71 passaram, 2 falharam.** Os dois que falharam na primeira integral passaram nesta. As duas falhas novas eram do harness, não do jogo:
  - `phase2.spec.js` › *API: cookies…*: segundo contexto com `http://127.0.0.1:3000` fixo; a suíte rodava na 3100 (`ECONNREFUSED`).
  - `truck-opacity.spec.js`: `scripts/capturar-tita.mjs` tinha a mesma porta fixa e, por trás dela, não pulava o prólogo que a 0.14 colocou no Novo jogo.
  - Correção só em teste/script: endereço vindo de `baseURL` (script: parâmetro ou `AURORA_BASE_URL`) e `skipPrologue` antes de esperar o modo a pé.
- **Rechecagem focada desses 2 (com a correção):** 2/2. Não é uma integral. O código do jogo não mudou entre a integral e a rechecagem.

## Pendências e limites

- **Produção:** aplicar a migração com `npm run db:migrate` no Turso antes de publicar. A persistência foi validada só em SQLite local.
- **Sem recuperação de senha:** exigiria e-mail ou outro canal (decisão do criador: usuário + senha). Quem esquecer a senha perde o acesso pela conta; as partidas continuam no banco.
- **Sem troca de senha nem exclusão de conta pela interface** (podem entrar numa versão seguinte).
- O bloqueio por tentativas é por conta, não por endereço IP.
- Sign-off do criador e teste no Windows pendentes.

## Correção: objetos flutuando perto da garagem do Dante (pedido do criador, 12/11/2026)

**Causa.** `EnvironmentModels` assentava cada modelo na altura da fórmula do terreno (`heightAt`), medida só no centro. A superfície desenhada e pisável é a malha (`World.groundHeight`); as duas não coincidem, e em ladeira um lado do objeto fica no ar. Os GLBs começam em y=0, então os arquivos não tinham problema.

**Medição antes** (`scripts/medir-assentamento-0.15.mjs`, `evidence/grounding-0.15/antes/`): sedã abandonado com **44 cm** de folga num canto; garagem **33 cm**; barris 8–9 cm; hatch 1 cm.

**Correção.**
- `staticModelPlacement.js`: `footprintPoints`, `footprintHeight` e `restingPose` (plano ajustado aos quatro cantos; abaixa até nenhum ponto da pegada ficar acima do chão; inclinação limitada a 0,35 rad).
- Carros e barris acompanham a inclinação; construções (colisão trimesh: garagem e posto) ficam retas, no ponto mais baixo.
- A pose usa a superfície real e é recalculada quando muda o conjunto de setores de terreno carregados (modelo que carrega antes do terreno se corrige); a colisão acompanha o visual. Não roda a cada quadro, porque a busca na malha é linear.
- Snapshot `environmentModels.grounding` expõe a folga por canto (diagnóstico).

**Medição depois** (`evidence/grounding-0.15/depois/`): folga máxima **0 cm** em todos. Sedã e hatch assentados com até 3 mm de contato; a garagem entra até 87 cm no chão do lado alto do terreno (portas continuam visíveis na captura).

**Validação:** unitários 443/443 (novo `static-model-grounding.test.js`, 10 casos); build sem dev ativo; E2Es focados 14/14 (`account`, `assets`, `tutorial-assets`, `game`, `prologue`). Rodada focada, não integral; a integral de 73 é anterior a esta correção.

**Observado e não alterado:** a placa da garagem ("ABRIGO 07 / ÚLTIMO MOTOR") aparece espelhada. `DiscoveryWorld.floor` usa o ponto mais alto + 12 cm e pode deixar vão em terreno inclinado; não recebeu relato e ficou como está.

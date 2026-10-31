# Retomar — expansão 0.8.0

O trabalho ativo e os resultados atuais estão em [RETOMAR_0.8.0.md](RETOMAR_0.8.0.md), [STATUS_DO_PROJETO.md](../STATUS_DO_PROJETO.md) e [RELATORIO_EXPANSAO_0.8.0.md](../RELATORIO_EXPANSAO_0.8.0.md). Não reaplicar os prompts antigos. Repositório oficial privado renataaap/2047, origin, branch feat/tutorial-assets; publicação já autorizada, sem force push. Ler AGENTS antes de editar e preservar os quatro módulos narrativos.

A entrega técnica 0.8.0 foi validada: 161 unitários, build, reinício e 24 cenários únicos entre rodadas; capturas comparadas. Branch feat/tutorial-assets e tag v0.8.0 no repositório oficial privado. O registro abaixo é histórico da 0.7.0, não o estado da expansão nem uma nova execução dos seus testes.

---

# Registro histórico — publicação 0.7.0

As correções e a validação terminaram. Após nova recusa do destino público e o pedido para enviar ao próprio Git, a versão foi publicada em https://github.com/renataaap/2047/tree/feat/tutorial-assets, privado. Entrar como renataaap para acessar.

- Branch `feat/tutorial-assets`, descendente do snapshot oficial Da-Hora-stack/2047 `a8a8802`. Tutorial/assets `v0.6.0` (`77c96ec`) preservados; nova entrega local `v0.7.0`.
- O usuário autorizou explicitamente publicar código, histórico Git, relatórios e assets no repositório público **Da-Hora-stack/2047**. Não pedir a mesma autorização novamente.
- Publicado no repositório pessoal renataaap/2047, escolhido anteriormente pelo usuário e acessível com administrador. Branch feat/tutorial-assets e tags v0.6.0/v0.7.0 foram verificadas no remoto; v0.7.0 aponta para 07ae390. O outro destino Da-Hora-stack/2047 continua retornando 403. Não fazer force push em main.
- Remoto origin: repositório privado publicado; official: base pública. Clonar diretamente a branch privada para continuar. Comandos e recuperação alternativa pelo bundle em docs/CONTINUAR_CORRECOES_0.7.0.md e docs/RECUPERAR_CHECKPOINT_0.7.0.md.
- Commits principais: `1a8279c` (worker CC0), `a36fdbb` (alvos/calibração/avatar/câmeras/UI), `e13d059` (checkpoint intermediário solicitado), `a96e0b8` (spawn na superfície física).
- **136 testes unitários/15 arquivos passaram; build passou.** A execução integral e2e teve 14 aprovados/6 falhas; as falhas foram corrigidas e rechecadas. Os 20 cenários passaram entre as rodadas, sem uma única execução integral verde. Últimos dois: sobrevivência e sete Núcleos; últimos três: NPC/avatar/câmeras, entrada/saída/retorno ao Titã e tutorial completo com save/load. A API também recuperou exatamente um save schema 3 após reinício real de dois processos Next.js com banco temporário isolado. Turso em produção não foi testado. Logs em evidence/critical-gameplay.
- Spawn da Cordilheira corrigido: a função analítica podia ficar três metros abaixo da malha física. `World.groundHeight` usa `meshHeightAt` no triângulo real; `Player` recebe esse amostrador. Preservar Y explícito de saves/findExit. Teste físico de 240 passos e travessia dos sete Núcleos passaram. Não substituir por alturas arbitrárias nem calcular isso a cada frame.
- A porta da cabine mais próxima é o alvo do Titã; F após sair passou. Visibilidade ignora somente o colisor do alvo e bloqueia paredes. `InteractionResolver` mantém a mesma entidade entre indicação e comando. Não voltar a priorizar Network sobre ROAD_POINTS.
- `seedService` verifica mochila e Titã acessível, valida antes de debitar, preserva Semente após falha e bloqueia reparo após consumo. Teste usa dano/RNG como condição inicial de um save válido, sem alterar integridade durante a execução.
- Não editar falas de `src/data/{campaign,road,network,expedition}.js`; hashes comprovam igualdade com 0.6.0. Worker anatômico CC0 é provisório, com sete clips in-place; Fab continua fora por licença desconhecida. Entrada/saída são gestos básicos, não animações finais de cabine.
- Oito materiais PBR reais estão no disco/jogo. API/CDN Poly Haven continuam bloqueadas, e o usuário não pode liberar a rede. Continuar pelas texturas locais; não reiniciar pelo manifesto vazio histórico.
- Servidor de desenvolvimento encerrado para o build. Próximo agente pode iniciar `npm run dev`. Não rodar duas suítes WebGL em paralelo nem build junto do dev. O ambiente usa SwiftShader; não afirmar 60 FPS/GPU/Windows testados.
- O jogo inteiro não está terminado: arte final, acabamento da primeira região, ciclo solar, áudio gravado, roteamento geral, caminhões extras dirigíveis, narrativa e quatro finais pendentes. Consultar docs/AUDITORIA_FASES_2026-10-29.md. Não reiniciar fases nem reaplicar prompts duplicados.

Prompt de continuidade: leia AGENTS, STATUS e RELATORIO_CORRECOES_CRITICAS; confirme a tag local e os resultados antes de editar. Preserve saves 1–3, os oito PBR, tutorial opcional e diálogos. A publicação no repositório pessoal está concluída; não repetir a mesma tarefa. Para novo desenvolvimento, use a auditoria de fases e o próximo pedido do usuário; não alegue arte final nem finais concluídos.

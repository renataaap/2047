# 0.14.0 — Auditoria narrativa e estrutura de campanha

> **Documento de desenvolvimento, com spoilers.** As seções marcadas como **restritas** não podem aparecer em HUD, diário, títulos de capítulo, nomes de arquivo exibidos, telas de carregamento ou mensagens de erro.

## 1. Base real

- **A 0.13.0 não existe.** Em 08/11/2026 não há branch, relatório ou versão 0.13 no `origin`. A 0.14.0 começa da **0.12.1** (`b97bcb8`, branch `claude/code-game-studios-skill-e1w3ae`), na branch `feat/narrativa-0.14.0`.
- **Dependência registrada:** tráfego, segunda cidade, rotinas de NPC e a reforma visual planejados para a 0.13 **não estão disponíveis**. As cenas da 0.14 usam o mundo atual (Cinza Nova, abrigos, POIs, Núcleos) e não declaram esses recursos como presentes.

## 2. O que existe hoje (auditado no código)

| Elemento | Onde | Estado |
|---|---|---|
| Flags `metSurvivor`, `renataContact`, `plannedRoute`, `chosenRoute`, `stormEncountered` | `missions/campaign.js` | Em uso |
| Flags `finalChoice` (`rebirth`/`partial`/`last`/`voice`) e `titanForced` | `missions/campaign.js`, validadas em `persistence/schema.js` | **Declaradas e nunca usadas** |
| `voiceFragments` | flags | **Uma só fonte**: o repetidor de Noêmia (`glass-relay`) |
| `decisions` | lista de strings, máx. 200 | Registra eventos (`core-N-activated`, `quest-X-accepted`); não é um sistema de escolhas |
| Rádio | `radioMessages` em `missions/network.js` + `W.radio` em `data/network.js` | Uma fala por região, uma da Voz, uma de Noêmia, uma final; **sem registro, sem condição de capítulo, sem fila** |
| Falas de campanha | `data/campaign.js` (`radioFirst`, `radioStorm`, `radioRestored`, `radioFailed`) | Protegidas, não alterar |
| NPCs de abrigo | `SHELTERS` (Lia, Afonso, Noêmia, Joel): uma fala antes e outra depois | Lia "reaparece" só como uma linha de rádio |
| Missões secundárias | `SIDE_MISSIONS`: supply, pump, relay | Funcionais, com custo e recompensa |
| Cutscene | `restoration/RestorationCinematic.js` (0.11) | Só a ativação ambiental; pulável, com redução de movimento |
| Diálogo | `components/gameplay/NarrativeDialogue.js` + `DialogueText.js` | Nome, texto progressivo, avançar/voltar, escolhas |
| **Brutus/Garcia** | — | **Ausente do código.** `Bandits.js` não está ligado ao loop |
| Prólogo de 2027 | — | Ausente |
| Capítulos | — | Ausentes |
| Texto de fim | `WORLD_COPY.allDetail` | "Os desfechos e as últimas decisões chegam na Fase 5." |

**Inconsistências encontradas:**
1. `finalChoice` aceita `partial`, mas não há como um Núcleo ficar "falho e não reativado": uma falha de ancoragem só permite tentar de novo, e a sequência é obrigatória.
2. Vários textos dizem "no Titã" mesmo com o Basculante ativo (`WORLD_COPY.inTruck`, `parkVault`, `SIDE_MISSIONS.detail`). São textos de sistema; ficam para uma revisão separada, porque as falas de dados estão protegidas.
3. `decisions` acumula eventos sem deduplicar (ex.: aceitar a mesma missão depois de load). O sistema novo de escolhas não usa essa lista.

## 3. Capítulos (derivados do progresso, nunca gravados)

O capítulo é **calculado** a partir dos Núcleos, para que saves antigos caiam no capítulo certo sem migração e sem reiniciar nada.

| Capítulo | Condição | Título exibido |
|---|---|---|
| `prologue` | Novo Jogo, antes do controle (cena) | Prólogo — O Último Ano |
| `ch1` | Núcleo 1 inativo | A Última Estrada Conhecida |
| `ch2` | próximo Núcleo é 2 ou 3 | As Cidades que Ficaram |
| `ch3` | próximo é 4 | O Mar que Desapareceu |
| `ch4` | próximo é 5 ou 6 | Além das Montanhas |
| `ch5` | próximo é 7 | Horizonte |
| `final` | sete ativos | A Última Estrada *(conteúdo na 1.0)* |

## 4. Personagens (diretrizes de escrita)

- **Dante** — reservado, prático, observador. Fala pouco e por fatos ("O Titã aguenta. Eu que não sei."). A evolução aparece nas escolhas e nas respostas curtas, nunca em monólogo. Início: "Eu dirijo. O resto não é comigo." Meio: lembra nomes e promessas. Fim: decide pelos outros.
- **Dra. Renata** — técnica, determinada e humana. Admite o que não sabe. Tem culpa pela Rede ter ficado parada vinte anos (ela era júnior da equipe; os chefes morreram). Revela isso aos poucos: cap. 2 (equipe), cap. 3 (por que esperou), cap. 5 (o que tem medo de que aconteça).
- **Mãe Ivani** — pragmática, desconfia de promessas grandes, mede pessoas pelo que entregam.
- **Brutus (Garcia)** — *proposta, o cânone só exige "motivo humano e conflito moral"*: ex-chefe de uma cooperativa de transporte que manteve vivo um povoado de mineiros no Leito Seco racionando água à força. Quer as Sementes porque acredita que a Rede vai restaurar primeiro quem a controla, e não confia em engenheiros que "sumiram vinte anos". Não é sádico: protege os dele e cobra pedágio dos outros. Aparece por sinais (cap. 2), relatos e rádio (cap. 3), primeiro encontro com negociação (cap. 3–4), consequência (cap. 5).
- **A Voz** — frases curtas, chiadas, sempre um passo à frente. Nunca explica. Ver seção 6.

## 5. Escolhas e relações

**Relações** são estados simples (`unknown`, `known`, `trusted`, `wary`, `ally`), **derivados** de missões e escolhas, sem gravar números:
- Lia: `known` ao conversar; `trusted` com a missão supply concluída; `ally` se, além disso, Dante dividir água na escolha do cap. 2.
- Afonso: `trusted` com a bomba; `wary` se Dante tiver aceitado o pedágio de Brutus (Afonso é do povoado vizinho).
- Noêmia: `trusted` com o repetidor (libera transmissões extras).
- Brutus: `unknown` → `known` (primeiro encontro) → `wary` ou `ally`, conforme a negociação.

**Escolhas** gravadas uma única vez em `campaign.story.choices` (ID estável → opção). Primeira leva:
1. `ch2-water-share` — dividir água da mochila com o abrigo do viaduto ou guardar para a viagem.
2. `ch3-brutus-toll` — no primeiro encontro com Brutus: pagar o pedágio, recusar e buscar o desvio, ou propor levar água ao povoado dele (custa recursos, muda a relação).
3. `ch4-titan-part` — ceder uma peça do Titã a Noêmia para o repetidor de reserva (afeta componentes reais e a disponibilidade de transmissões).

Nenhuma escolha bloqueia a campanha. Todas mudam pelo menos uma fala, uma relação e uma transmissão posterior.

## 6. A Voz — progressão de pistas **(restrita)**

Segredo canônico: está em `docs/PROMPT_MESTRE.md`, seção dos finais. **Nada no jogo pode nomear ou afirmar a identidade.** As pistas só podem ser coerentes com ela depois de revelada.

| Fase | Pista ao jogador | Fonte |
|---|---|---|
| cap. 1 | Chiado com uma palavra solta na primeira viagem. | Rádio, uma vez |
| cap. 2 | A Voz avisa sobre o viaduto antes de Renata. | Rádio |
| cap. 2–3 | Fragmento `glass-relay` (já existente) | Repetidor de Noêmia |
| cap. 3 | Fragmento em POI (Balança 07): registro de rádio com data impossível | Exploração opcional |
| cap. 4 | A Voz usa uma expressão que só Dante diria sobre o Titã | Rádio |
| cap. 4 | Fragmento no Motel Última Luz | Exploração opcional |
| cap. 5 | A Voz menciona o túnel de 2027 | Rádio |

Os fragmentos ficam na lista existente `flags.voiceFragments`; nenhum inventário paralelo. O final secreto vai exigir um número mínimo (proposta: 4 de 5), não todos, e o diário mostra quantos há sem dizer para que servem.

## 7. Finais — análise da contradição e recomendação

**Problema:** "Renascimento parcial = pelo menos um Núcleo falhou e não foi reativado", mas cada Núcleo depende do anterior. Um Núcleo falho bloqueia os seguintes, logo a campanha não chegaria ao fim.

| Alternativa | Lore | Sistema | Saves antigos | Risco |
|---|---|---|---|---|
| A. *Bypass* narrativo (Renata força pular um Núcleo) | Fraca: contradiz "cada Núcleo depende do campo anterior" | Exige novo caminho de sequência | Ok | Abre exceção que o jogador pode explorar |
| **B. Ancoragem instável** (o Núcleo ativa, mas a qualidade do campo fica baixa se a Semente chegar muito avariada) | **Boa:** a lore já diz que a Semente perde alinhamento com vibração | Pequena: gravar a integridade no momento da ancoragem; o campo seguinte funciona | Saves antigos = campos estáveis | Precisa de feedback claro (restauração mais fraca naquele campo) |
| C. Restauração global incompleta mesmo com sete estáveis | Média: precisaria de outra regra (ex.: comunidades) | Pequena | Ok | Parece arbitrário se não houver regra visível |

**Recomendação: B.** "Renascimento parcial" passa a ser: os sete Núcleos ativados, mas **pelo menos um campo instável** (Semente ancorada abaixo de um limite de integridade, proposta 60%) que **não foi re-estabilizado**. A re-estabilização seria uma missão opcional futura. A restauração ambiental daquele campo para no estágio 2 ("parte do mundo fica cinza"). **Esta é uma mudança na condição oficial do final e precisa da sua aprovação antes de ser implementada.** Na 0.14 só gravamos a qualidade da ancoragem, que serve a qualquer alternativa.

**Último destino:** a condição "Titã em estado crítico" usa os componentes **do Titã** (estado individual da frota), não do veículo ativo. Proposta de justificativa para exigir o Titã na viagem final: o trecho da Estação Central só é atravessável por um motor sem eletrônica (o Titã de 2003); o Basculante municipal tem injeção eletrônica de 2019 e morre na interferência. Precisa de aprovação.

**Renascimento:** sete campos estáveis + Titã funcional (todos os componentes acima de um limite) na entrega final.

**Segredo da Voz:** fragmentos mínimos + escolha no sétimo Núcleo; exclusivo dos outros três (cânone).

## 8. O que a 0.14.0 entrega e o que fica para depois

Implementado nesta etapa (ver `RELATORIO_NARRATIVA_0.14.0.md` quando existir): capítulos derivados, estado narrativo central, gravação da qualidade de ancoragem, rádio narrativo com registro, escolhas e relações com persistência. Prólogo em tempo real, cenas de Brutus/Voz e consequências visuais são incrementos seguintes. **Os quatro finais não estão implementados.**

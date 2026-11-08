# 0.14.0 — Narrativa, cinematografia e consequências (EM ANDAMENTO, NÃO CONCLUÍDA)

**Branch:** `feat/narrativa-0.14.0`
**Base:** 0.12.1, `b97bcb8` (branch `claude/code-game-studios-skill-e1w3ae`).
**A 0.13.0 não existe** no repositório em 08/11/2026. Tráfego, segunda cidade, rotinas de NPC e a reforma visual não estão disponíveis, e esta versão não depende deles. A auditoria e as decisões de design estão em [`docs/NARRATIVA_0.14.0.md`](docs/NARRATIVA_0.14.0.md), um documento com spoilers e seção restrita.

## Incrementos

| Incremento | Estado | O que existe de fato |
|---|---|---|
| A — Auditoria narrativa | **Feito** | Mapa do que existe (Brutus ausente do código, `finalChoice`/`titanForced` sem uso, uma única fala da Voz), capítulos, diretrizes de personagem, análise dos finais com recomendação |
| B — Estado narrativo | **Feito** | `src/game/narrative/story.js`: capítulo derivado dos Núcleos; cenas assistidas/puladas; escolhas aplicadas uma vez com custo atômico; relações derivadas; registro de rádio; qualidade de ancoragem gravada a cada ativação. Bloco opcional `campaign.story`, validado. Saves antigos continuam válidos. |
| E — Rádio e Voz | **Feito (primeira leva)** | 22 transmissões por capítulo, região, missão e escolha. Tocam só em cruzeiro (velocidade > 18 km/h, volante quase reto, sem painel nem cena), com intervalo de 75 s, uma vez cada. Legenda no topo central e registro consultável no painel R. 6 fontes de fragmento da Voz: 1 já existente, 3 no rádio e 2 na exploração a pé (Balança 07 e Motel), com entrada no diário. |
| C — Prólogo 2027 / introdução de Dante | Pendente | — |
| D — Personagens (cenas de conversa) | Parcial | Falas novas de Renata, Lia, Afonso, Noêmia, Joel e Garcia **só no rádio**. Ainda não há interface para as três escolhas definidas (`ch2-water-share`, `ch3-brutus-toll`, `ch4-titan-part`); a lógica e os testes existem. |
| F — Cutscenes da campanha | Pendente | Só a cena ambiental da 0.11 |
| G — Consequências visíveis | Pendente | Por enquanto as consequências são falas e relações |
| H — Finais | Só documentação | Recomendação da "ancoragem instável" **aguardando aprovação**. Nenhum final implementado. |
| I — Polimento | Pendente | — |

## Validação

- `npm test`: **345/345 em 42 arquivos** (18 testes novos: `narrative-story`, `narrative-radio`). Incluem um teste que procura termos do segredo da Voz em todo texto exibido.
- `npm run build`: aprovado.
- **E2E novo `narrative.spec.js`:** Novo Jogo → tutorial → motor → acelerar na estrada real até a primeira transmissão. Confere a legenda visível no topo, o texto e o registro no save. Passou. Captura: `evidence/narrative-0.14.0/radio-line.png` (não versionada nesta etapa; gerada em `AURORA_EVIDENCE_ROOT`).
- **Regressão E2E: 9/9 em 10,1 min** (`driving`, `phase4`, `world-expansion` e `narrative`), sobre o código do commit do rádio narrativo. Cobre condução, os sete Núcleos/fase 4, POIs/diário e o rádio novo. Não é a integral.
- **Sem** integral de E2E, playtest humano, Windows/GPU ou revisão de texto por outra pessoa.

## Limitações conhecidas

- A legenda do rádio entra com uma animação de 250 ms. No SwiftShader dos testes ela fica mais lenta; a primeira captura saiu vazia por isso.
- `biomeAt` ainda usa só o eixo z (legado). As falas presas a uma região podem tocar em trecho próximo ao limite de bioma.
- Sem voz gravada: o rádio é só texto e o chiado existente.
- O registro guarda as transmissões como tocadas no momento em que aparecem. Se o jogo fechar antes do próximo save, a fala pode tocar outra vez.

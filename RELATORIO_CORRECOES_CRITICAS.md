# 2047: Rede Aurora — entrega local 0.7.0

**Implementação e validação concluídas; publicada no repositório pessoal.** Corrigidas as regressões de sobrevivência e posicionamento de Dante na Cordilheira; build final aprovado. Código, histórico, relatórios, assets e tags estão em [renataaap/2047 · feat/tutorial-assets](https://github.com/renataaap/2047/tree/feat/tutorial-assets), privado. O outro destino, Da-Hora-stack/2047, continua recusando acesso (403). A arte final e as demais fases do jogo continuam com as pendências descritas abaixo.

Entrega local na branch `feat/tutorial-assets`, preservando o tutorial/assets 0.6.0 (`77c96ec`) e as falas mais recentes presentes no workspace. Pedido executado na sequência solicitada; prompts duplicados não foram reaplicados.

**Resultado:** correções de seleção de NPC/objeto e calibração, Dante visível em terceira pessoa, personagens secundários animados com origem licenciada, novo enquadramento 3D do menu e conversas, serviços separados do diálogo. **A arte dos personagens continua provisória, e o jogo inteiro ainda não terminou todas as fases.**

## 1. Bugs identificados e corrigidos

| Problema | Causa | Comportamento atual |
| --- | --- | --- |
| Posto interceptava Zeca/Tomás | NetworkController aceitava ROAD_POINTS no snapshot publicado; a 0.6.0 removeu essa interceptação, mas ainda faltava seleção comum por entidade | NetworkController só trata Rede; RoadController fornece NPC, bomba e gerador distintos. O nome do interlocutor é o cabeçalho, o estabelecimento é secundário |
| Bomba não tinha interação própria | Só havia alvo junto ao NPC | Bomba oferece “Abastecer caminhão”, valida parada/motor/distância e abre serviços da bomba; gerador tem alvo de equipamento |
| Indicação e F podiam divergir | Game procurava o alvo de novo durante o comando | InteractionResolver mantém a entidade publicada; F/click revalidam a mesma chave, alcance e visibilidade, sem despachar outro objeto |
| Peças na mochila não calibravam | Lógica e botão só examinavam inventário do caminhão | seedService verifica as duas bolsas acessíveis, planeja pagamento e só debita após todos os requisitos. Mochila funciona; Titã só ajuda até 40 m |
| Mensagens genéricas confundiam recuperação/consumo | Falta de distinção visual entre danificada, falha, 100%, sem recursos e consumida | Status específico para cada impedimento; falha mantém carga recuperável; sucesso bloqueia nova calibração e orienta o próximo Cofre |
| Nova visibilidade bloqueou entrada no Titã na regressão | Raycast detectava o próprio objeto selecionado como obstáculo | Colisores têm chave de interação; visibilidade ignora o próprio alvo e continua bloqueando paredes/outros objetos, inclusive perto dele. Novo teste físico cobre esse caso |
| Câmera de conversa podia ficar dentro do NPC | Varredura começava dentro do colisor do interlocutor | Enquadramento ignora corpos de NPC para a câmera, mas conserva colisão com cenário |
| Dante caía sob o terreno na Cordilheira | Spawn usava altura analítica, diferente da interpolação dos triângulos visuais/físicos; diferença superior a três metros no ponto reproduzido | World.groundHeight amostra o triângulo real para posicionar Player. Y explícito de saves/saída permanece preservado; teste físico de 240 passos e travessia dos sete Núcleos passaram |

A reprodução anterior à correção está em [reproduction-unit.log](evidence/critical-gameplay/reproduction-unit.log), com os dois testes vermelhos. O [diagnóstico](docs/DIAGNOSTICO_CORRECOES_CRITICAS.md) detalha as regras.

## 2. Sistemas efetivamente funcionais

- Seleção por posição/distância, direção da câmera a pé, raycast de visibilidade, tipo, prioridade, disponibilidade e histerese. NPCs da Estrada Viva e da Rede usam o mesmo resolvedor. Aproximações frontal, lateral e por trás de Zeca foram exercitadas no navegador.
- Painéis de Zeca, Tomás, outros atendentes, bomba e gerador abrem pelas entidades corretas. Conversa e compras/serviços têm apresentações separadas, preservando regras de preço/estoque/capacidade/manutenção.
- Calibração comum aos sete Núcleos: terminal, estacionamento, motor desligado, Semente carregada/danificada e duas peças acessíveis. Combina mochila/Titã, não cobra quando bloqueada e espelha integridade na Rede.
- Ativação falha preserva a Semente; calibração permite nova tentativa. Ativação concluída consome a carga e não permite repará-la/duplicá-la. O gerador do primeiro Núcleo continua obrigatório para ativação.
- Dante segue o controlador Rapier e aparece na terceira pessoa. Idle/caminhada/corrida são clips in-place, com rotação pelo deslocamento; interação/reparo e entrada/saída usam gestos básicos. **Ainda falta animação de escalada/assento produzida para a cabine.**
- C alterna primeira/terceira pessoa a pé; no caminhão mantém as três câmeras antigas. Mouse controla o olhar, câmera a pé suaviza e varre esfera contra paredes e Titã. Primeira pessoa oculta o avatar. Perspectiva inicial configurável/persistida.
- Zeca, Tomás, sobrevivente, Ivani e atendentes usam corpos anatômicos com idle/olhar, colisores e paletas por identidade. Os atendentes da Estrada/Rede são carregados/liberados junto aos setores. **Compartilham a base, sem esculturas finais individuais.**
- Menu renderizado pelo próprio jogo com Titã/posto GLB, iluminação/poeira, câmera baixa em movimento e nova composição tipográfica/navegação. Nova partida/continuar têm fade, com um único canvas/renderizador/loop.
- Diálogos enquadram o interlocutor, preservam revelação gradual/texto completo, avanço/volta, escolhas, teclado/mouse, foco, Esc, escala de legendas e textos longos. As consequências não mudaram.
- Tutorial opcional de 21 objetivos, condução/física/transmissão, recursos, sobrevivência, comércio, missões, rádio, sete Núcleos e saves 1–3 permanecem integrados.

## 3. Assets instalados e origem

| Asset | Instalação real | Licença/limite |
| --- | --- | --- |
| Aurora Worker | `public/assets/models/aurora-workers/worker.glb`: 1.247.220 bytes, 28.960 triângulos, um mesh/11 primitivas, um skin e sete clips | Base anatômica MakeHuman explicitamente CC0 desde setembro/2020; roupas/detalhes, tecido, rig e animações são adaptações originais CC0. Arte provisória, não um personagem escaneado/realista final |
| Fontes do personagem | OBJ original e documentos em `assets-source/characters`; script Blender `scripts/preparar-personagens.py` | A licença AGPL do aplicativo MakeHuman não foi confundida com a licença CC0 dos assets. Código do aplicativo não foi incorporado |
| Posto do menu | Reutiliza o GLB CC BY 4.0 de SURVIVED já instalado na 0.6.0 | Crédito preservado; decoração de apresentação oculta durante o gameplay |
| Oito PBR/Titã/garagem/barris/carros | Arquivos reais da 0.6.0 preservados e exercitados novamente | Poly Haven CC0; modelos com seus créditos. Carros Renafox são CC BY-NC 4.0, para desenvolvimento não comercial |
| Fab City People / Soldier Mixamo | **Não incorporados** | Licença do Fab continua não identificada; não presumir MIT para o Soldier por estar num exemplo do Three.js |

O Blender informou ausência da biblioteca Draco e exportou um GLB sem essa compressão; o arquivo resultante foi validado e carregado no jogo. Não foi declarada compressão que não ocorreu.

Não houve novo download da API Poly Haven, que continua bloqueada neste ambiente. Os oito materiais reais vieram do snapshot oficial e são usados localmente. [Créditos](public/assets/CREDITOS.txt), [preparação do worker](evidence/critical-gameplay/worker-asset.json) e [como continuar as texturas](docs/CONTINUAR_CORRECOES_0.7.0.md).

## 4. Arquivos alterados

- **Interações/regras:** `src/game/interactions/{InteractionResolver,visibility}.js`, `src/game/missions/{seedService,campaign,network,RoadController,NetworkController}.js`, `src/game/core/Game.js`.
- **Personagem/câmeras:** `src/game/player/{Player,PlayerVisual,CharacterActor,workerDefinition}.js`, `src/game/render/{cameraCollision,Cameras,ConversationCamera,MenuScene}.js`, `src/game/input/Input.js`, `src/game/persistence/settings.js`.
- **Mundo/recursos:** `src/game/world/{World,surfaceHeight,CampaignWorld,RoadWorld,NetworkWorld,ExpeditionWorld}.js`, `src/game/tutorial/TutorialWorld.js`, `src/game/assets/AssetManager.js`.
- **Apresentação:** `src/components/menus/{MainMenu,Panel}.js`, `src/components/game/GameView.js`, `src/components/gameplay/{MissionPanel,RoadPanelContent,NetworkPanelContent,DialogueText}.js`, `src/components/hud/Hud.js`, `src/app/{critical.css,layout.js}`.
- **Assets:** `assets-source/characters`, `public/assets/models/aurora-workers`, manifesto de modelos/créditos, script Blender.
- **Verificação:** `tests/unit/{critical-gameplay,cameras,installed-assets,world,road-geometry}.test.js`; novo e2e `critical-gameplay.spec.js`; regressões de assets/cabeçalho de interlocutor e esperas por condições reais atualizadas.
- **Entrega:** package/lock e rótulo de versão/créditos técnicos, README, STATUS, AGENTS, diagnóstico, instruções de continuidade e auditoria das fases; evidências reais.

Os quatro arquivos de narrativa `src/data/campaign.js`, `road.js`, `network.js` e `expedition.js` estão **idênticos byte a byte** ao checkpoint 0.6.0. [Prova de hashes](evidence/critical-gameplay/narrative-protection.json). Nenhum texto local foi substituído por uma versão antiga do GitHub.

## 5. Testes e resultados

- `npm test`: **136 testes / 15 arquivos passaram**, incluindo motor/física em diferentes taxas de FPS, transações, saves, interação/visibilidade física, matriz de calibração, câmera, spawn em relevo e arquivos reais. [Log](evidence/critical-gameplay/unit.log).
- Duas novas integrações Chromium passaram juntas: NPC/bomba/Tomás, avatar/perspectivas e recuperação da Semente com recarga. A regressão integral posterior inclui também a movimentação real do avatar. [Execução focada](evidence/critical-gameplay/critical-e2e.log).
- **Execução integral: 14 passaram e 6 falharam (17,4 min)**. Após as correções, a rechecagem de sete cenários teve cinco aprovados e dois ainda falhando; a rechecagem final de sobrevivência e sete Núcleos aprovou ambos. Assim, **os 20 cenários passaram entre a execução integral e as repetições focadas**, sem afirmar uma única execução integral verde. [Log integral](evidence/critical-gameplay/e2e.log), [rechecagem de sete](evidence/critical-gameplay/recheck.log) e [rechecagem final de dois](evidence/critical-gameplay/surface-recheck.log).
- **Última regressão: três cenários passaram juntos (3,5 min)** — seleção de NPC/avatar/câmeras, entrada/saída/retorno ao Titã e tutorial completo com condução, recursos, ativação e save/load. [Log](evidence/critical-gameplay/spawn-regression.log).
- `npm run build`: **passou**, Next.js 16.4.3, dez páginas/rotas geradas; APIs dinâmicas preservadas. O servidor de desenvolvimento foi encerrado antes do build. [Log da versão atual](evidence/critical-gameplay/build.log).
- **Persistência após reinício real do servidor: passou.** Um save schema 3 foi criado pela API em libSQL local isolado; o processo Next.js foi encerrado e iniciado novamente, mantendo somente o cookie de teste. O conteúdo inteiro e a versão voltaram idênticos; o registro e o banco temporários foram removidos. Não usa nem modifica partidas do usuário e não valida Turso em produção. [Resultado](evidence/critical-gameplay/restart-persistence.json) e [log dos dois processos](evidence/critical-gameplay/restart-server.log).

O cenário danificado parte de um save válido com integridade 70 e RNG 1510. A falha ocorre naturalmente pelo sorteio, deixa 62; a UI calibra para 82 pagando duas peças e a ativação seguinte tem chance de 100%. **A integridade não é editada durante o teste para produzir sucesso.** Há testes de 100%, falta de peças, estoque apenas na mochila/Titã/misto, distância, terminal, motor, estacionamento, consumo e Núcleos seguintes.

A primeira rodada das duas novas integrações encontrou seletores de teste desatualizados (nome real do terminal e clone de saída oculto). Foram corrigidos sem alterar a narrativa. A regressão também identificou o retorno rápido ao Titã prejudicado pelo alvo no centro do chassi; agora o alvo é a porta mais próxima. Os teleportes de diagnóstico sincronizam imediatamente velocidade zero com a física já zerada, evitando indicadores antigos entre frames. Esperas curtas de movimento dos testes antigos foram trocadas por condições de distância/velocidade; os critérios físicos não foram reduzidos.

A primeira execução integral foi interrompida após detectar a obstrução indevida da entrada no Titã; a causa física foi corrigida e coberta por teste, antes da repetição integral. Logs iniciais foram preservados.

A regressão de sobrevivência usava esperas de parede que podiam terminar sem um frame físico no SwiftShader; agora aguarda consumo e visibilidade reais. Na Cordilheira, o teste expôs uma falha efetiva de spawn: no ponto x=-47/z=-12783, a função analítica dava -30,599 m e o triângulo físico -27,552 m. O novo amostrador usa a mesma geometria renderizada/colidida, só no posicionamento, sem uma busca por triângulos a cada frame. O snapshot da falha foi preservado em evidence/phase4/failure-0.7.0.json.

## 6. Capturas reais

- [Menu antes](evidence/critical-gameplay/menu-before.png) → [menu depois](evidence/critical-gameplay/menu-after.png).
- [Diálogo antes](evidence/critical-gameplay/dialogue-before.png) → [diálogo depois](evidence/critical-gameplay/dialogue-after.png).
- [Dante em terceira pessoa](evidence/critical-gameplay/dante-third-person.png).
- [Serviços de Zeca](evidence/critical-gameplay/zeca-services.png).
- [Ativação malsucedida](evidence/critical-gameplay/seed-failed.png) → [Núcleo ativado](evidence/critical-gameplay/seed-activated.png).

São screenshots do WebGL deste projeto, não imagens externas/promocionais. Usam perfil Baixo/escala 75% no Chromium com renderização por software.

## 7. Desempenho e limitações

Na última rechecagem, em Baixo/75%: 87 draw calls, 191.350 triângulos e média de 1,07 FPS em software no início. No entorno de Tomás: 50 chamadas, 82.512 triângulos e média de 1,21 FPS; PBR estimado em 32 MiB, sem contabilizar texturas internas de GLBs. São amostras de diagnóstico, não um benchmark comparável em hardware. Dados em evidence/critical-gameplay/targets-avatar.json.

A rechecagem de aceleração atingiu 48,70 km/h na leitura de 8,4 segundos simulados (mínimo exigido: oito), em 60,688 segundos de parede, com diesel de 4 para 3,9185 L, 89 draw calls e 254.212 triângulos, sem erros de console. O teste mantém a exigência física de velocidade; o tempo de espera maior acomoda o renderizador por software. Ver evidence/acceptance.json para a relação entre tempo físico e tempo de parede.

O ambiente usa SwiftShader, sem GPU física; os FPS permanecem baixos e não validam a meta de 60 FPS nem conforto de condução. As provas JSON registram draw calls, triângulos, FPS e cache de modelos/texturas. O cache agora inclui o worker compartilhado e o cenário do menu; o teste de descarregamento verifica especificamente a saída dos carros distantes, em vez de exigir que sobrem apenas os recursos do Titã. A estimativa de bytes PBR não inclui toda a memória de texturas internas dos GLBs.

Nenhum vazamento de console/asset deve ser aceito como sucesso nos cenários exercitados. Não houve teste no Windows real, avaliação humana com GPU, medição de estabilidade de longa duração ou deploy Vercel/Turso.

## 8. Pendências e próxima etapa técnica

Arte final realista e individualizada de Dante/NPCs, animações de cabine, interior final do Titã e outros caminhões dirigíveis; acabamento ambiental do Mar de Cinzas; ciclo solar; áudio gravado; roteamento geral; narrativa, decisões e quatro finais. Os modelos provisórios e sete ancoragens não encerram essas tarefas. [Auditoria das seis fases](docs/AUDITORIA_FASES_2026-10-29.md).

A próxima etapa recomendada é uma travessia humana completa no Windows/GPU real, seguida de arte/iluminação da primeira região e validação de economia/conforto. A infraestrutura de personagens está pronta para receber um GLB final licenciado com clips in-place e escala adequada.

## 9. Checkpoints e publicação

- 0.6.0: `77c96ec`, tag `v0.6.0` publicada no repositório pessoal — tutorial/assets e provas.
- Personagens CC0: `1a8279c` — fontes, preparação, licença e adaptadores.
- Código e interface: `a36fdbb` — alvos/calibração, avatar/câmeras, apresentação e regressões.
- Checkpoint solicitado antes do término: `e13d059` — estado de trabalho e documentação das falhas então abertas.
- Correção do relevo: `a96e0b8` — superfície física para spawn e teste de sobrevivência sincronizado por estado.
- Entrega final: `07ae390`, tag `v0.7.0` publicada no repositório pessoal, incluindo as evidências finais. A branch recebe também a atualização destas instruções de acesso.

**Publicado em renataaap/2047:** após nova recusa de Da-Hora-stack/2047, o usuário pediu enviar para “meu git”. O repositório pessoal renataaap/2047 já havia sido escolhido anteriormente, é privado e a conta tem acesso de administrador. O push normal enviou `feat/tutorial-assets`, `v0.6.0` e `v0.7.0`; os SHAs remotos foram conferidos. [Registro da publicação](evidence/critical-gameplay/publication-private.json).

**Histórico do destino público:** a autorização explícita para Da-Hora-stack/2047 permanece registrada, mas Git retornou 403, Permission denied to renataaap, e a escrita pelo aplicativo retornou Resource not accessible by integration. Nenhuma branch/tag desta entrega foi enviada àquele repositório. [Registro da recusa](evidence/critical-gameplay/publication.json). A publicação no repositório pessoal foi feita com o acesso legítimo da própria conta.

O pacote incremental anterior à publicação preserva a entrega `07ae390` e exige a base oficial; agora também é possível clonar diretamente a branch privada publicada. [Como acessar e recuperar](docs/RECUPERAR_CHECKPOINT_0.7.0.md) · [Windows, celular e texturas](docs/CONTINUAR_CORRECOES_0.7.0.md).

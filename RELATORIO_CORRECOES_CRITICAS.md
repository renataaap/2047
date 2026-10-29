# 2047: Rede Aurora — checkpoint 0.7.0 em validação

**Checkpoint solicitado pelo usuário antes do término.** Há duas regressões ainda abertas: espera por frame no cenário de sobrevivência e posicionamento de Dante em terreno irregular da Cordilheira. O build final ainda está pendente. Não considerar esta revisão uma versão final aprovada.

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
- **Mundo/recursos:** `src/game/world/{CampaignWorld,RoadWorld,NetworkWorld,ExpeditionWorld}.js`, `src/game/tutorial/TutorialWorld.js`, `src/game/assets/AssetManager.js`.
- **Apresentação:** `src/components/menus/{MainMenu,Panel}.js`, `src/components/game/GameView.js`, `src/components/gameplay/{MissionPanel,RoadPanelContent,NetworkPanelContent,DialogueText}.js`, `src/components/hud/Hud.js`, `src/app/{critical.css,layout.js}`.
- **Assets:** `assets-source/characters`, `public/assets/models/aurora-workers`, manifesto de modelos/créditos, script Blender.
- **Verificação:** `tests/unit/{critical-gameplay,cameras,installed-assets,world}.test.js`; novo e2e `critical-gameplay.spec.js`; regressões de assets/cabeçalho de interlocutor atualizadas.
- **Entrega:** package/lock e rótulo de versão/créditos técnicos, README, STATUS, AGENTS, diagnóstico, instruções de continuidade e auditoria das fases; evidências reais.

Os quatro arquivos de narrativa `src/data/campaign.js`, `road.js`, `network.js` e `expedition.js` estão **idênticos byte a byte** ao checkpoint 0.6.0. [Prova de hashes](evidence/critical-gameplay/narrative-protection.json). Nenhum texto local foi substituído por uma versão antiga do GitHub.

## 5. Testes e resultados

- `npm test`: **135 testes / 15 arquivos passaram**, incluindo motor/física em diferentes taxas de FPS, transações, saves, interação/visibilidade física, matriz de calibração, câmera e arquivos reais. [Log](evidence/critical-gameplay/unit.log).
- Duas novas integrações Chromium passaram juntas: NPC/bomba/Tomás, avatar/perspectivas e recuperação da Semente com recarga. A regressão integral posterior inclui também a movimentação real do avatar. [Execução focada](evidence/critical-gameplay/critical-e2e.log).
- **Execução integral: 14 passaram e 6 falharam (17,4 min)**. Os casos afetados foram corrigidos/ajustados e estão sendo repetidos, sem ocultar o resultado inicial. Atualizar com a rechecagem final antes de fechar a entrega. [Log integral](evidence/critical-gameplay/e2e.log).
- **Build final pendente nesta revisão.** Não confundir com o build aprovado da entrega 0.6.0.

O cenário danificado parte de um save válido com integridade 70 e RNG 1510. A falha ocorre naturalmente pelo sorteio, deixa 62; a UI calibra para 82 pagando duas peças e a ativação seguinte tem chance de 100%. **A integridade não é editada durante o teste para produzir sucesso.** Há testes de 100%, falta de peças, estoque apenas na mochila/Titã/misto, distância, terminal, motor, estacionamento, consumo e Núcleos seguintes.

A primeira rodada das duas novas integrações encontrou seletores de teste desatualizados (nome real do terminal e clone de saída oculto). Foram corrigidos sem alterar a narrativa. A regressão também identificou o retorno rápido ao Titã prejudicado pelo alvo no centro do chassi; agora o alvo é a porta mais próxima. Os teleportes de diagnóstico sincronizam imediatamente velocidade zero com a física já zerada, evitando indicadores antigos entre frames. Esperas curtas de movimento dos testes antigos foram trocadas por condições de distância/velocidade; os critérios físicos não foram reduzidos.

A primeira execução integral foi interrompida após detectar a obstrução indevida da entrada no Titã; a causa física foi corrigida e coberta por teste, antes da repetição integral. Logs iniciais foram preservados.

## 6. Capturas reais

- [Menu antes](evidence/critical-gameplay/menu-before.png) → [menu depois](evidence/critical-gameplay/menu-after.png).
- [Diálogo antes](evidence/critical-gameplay/dialogue-before.png) → [diálogo depois](evidence/critical-gameplay/dialogue-after.png).
- [Dante em terceira pessoa](evidence/critical-gameplay/dante-third-person.png).
- [Serviços de Zeca](evidence/critical-gameplay/zeca-services.png).
- [Ativação malsucedida](evidence/critical-gameplay/seed-failed.png) → [Núcleo ativado](evidence/critical-gameplay/seed-activated.png).

São screenshots do WebGL deste projeto, não imagens externas/promocionais. Usam perfil Baixo/escala 75% no Chromium com renderização por software.

## 7. Desempenho e limitações

Na captura inicial em Baixo/75%: 87 draw calls, 191.350 triângulos e média de 0,79 FPS em software. No entorno de Tomás: 50 chamadas, 82.512 triângulos e média de 1,40 FPS; PBR estimado em 32 MiB, sem contabilizar texturas internas de GLBs. São amostras de diagnóstico, não um benchmark comparável em hardware.

A rechecagem de aceleração atingiu 48,70 km/h na leitura de 8,4 segundos simulados (mínimo exigido: oito), em 60,688 segundos de parede, com diesel de 4 para 3,9185 L, 89 draw calls e 254.212 triângulos, sem erros de console. O teste mantém a exigência física de velocidade; o tempo de espera maior acomoda o renderizador por software. Ver evidence/acceptance.json para a relação entre tempo físico e tempo de parede.

O ambiente usa SwiftShader, sem GPU física; os FPS permanecem baixos e não validam a meta de 60 FPS nem conforto de condução. As provas JSON registram draw calls, triângulos, FPS e cache de modelos/texturas. O cache agora inclui o worker compartilhado e o cenário do menu; o teste de descarregamento verifica especificamente a saída dos carros distantes, em vez de exigir que sobrem apenas os recursos do Titã. A estimativa de bytes PBR não inclui toda a memória de texturas internas dos GLBs.

Nenhum vazamento de console/asset deve ser aceito como sucesso nos cenários exercitados. Não houve teste no Windows real, avaliação humana com GPU, medição de estabilidade de longa duração ou deploy Vercel/Turso.

## 8. Pendências e próxima etapa técnica

Arte final realista e individualizada de Dante/NPCs, animações de cabine, interior final do Titã e outros caminhões dirigíveis; acabamento ambiental do Mar de Cinzas; ciclo solar; áudio gravado; roteamento geral; narrativa, decisões e quatro finais. Os modelos provisórios e sete ancoragens não encerram essas tarefas. [Auditoria das seis fases](docs/AUDITORIA_FASES_2026-10-29.md).

A próxima etapa recomendada é uma travessia humana completa no Windows/GPU real, seguida de arte/iluminação da primeira região e validação de economia/conforto. A infraestrutura de personagens está pronta para receber um GLB final licenciado com clips in-place e escala adequada.

## 9. Checkpoints e publicação

- 0.6.0: `77c96ec`, tag local `v0.6.0` — tutorial/assets e provas.
- Personagens CC0: `1a8279c` — fontes, preparação, licença e adaptadores.
- Código e interface: `a36fdbb` — alvos/calibração, avatar/câmeras, apresentação e regressões.
- Checkpoint final 0.7.0: registrar após as verificações finais.

**Histórico da publicação:** a revisão automática de aprovação rejeitou o push para o novo repositório público `Da-Hora-stack/2047`, pois a autorização anterior cobria outro repositório e não autorizava explicitamente expor esse código/histórico/assets nesse destino. Nenhum arquivo foi enviado nessa tentativa. O usuário agora pediu explicitamente enviar as alterações ao GitHub e terminar depois. Este checkpoint está sendo publicado por Git normal na branch de trabalho, sem alterar main à força.

# 2047: Rede Aurora

**0.10.0 — garagem e frota, em validação:** serviços na garagem de Cinza Nova, três skins, prévias, acessórios, interior, upgrades e dois caminhões dirigíveis. Base main affb786/0.9.1, desenvolvimento em `feat/garagem-frota-0.10.0`. [Relatório](RELATORIO_GARAGEM_0.10.0.md) · [incrementos](docs/INCREMENTOS_GARAGEM_0.10.0.md) · [teste Windows](docs/TESTE_MANUAL_GARAGEM_0.10.0.md). 225 unitários e build aprovados; resultado da integral ainda será registrado. A main mantém a correção do chão durante esta validação.


**Hotfix 0.9.1 — chão:** o shader do terreno respeita o limite de texturas da GPU e atualiza os mapas ao trocar a qualidade. [Relatório](RELATORIO_CORRECAO_CHAO_0.9.1.md) · [conferir no Windows](docs/TESTE_MANUAL_CHAO_0.9.1.md). A garagem 0.10.0 permanece como próxima tarefa.

**Histórico 0.9.0:** [PR #2](https://github.com/renataaap/2047/pull/2) integrado à main em `c223f9e`. Os números da seção seguinte pertencem à validação da 0.9.0, não à correção 0.9.1.

**0.9.0 — rede rodoviária validada automaticamente, em revisão Windows**, branch `feat/rede-rodoviaria-0.9.0`, derivada da 0.8.2 `55a5df3`. O PR #1 da base foi integrado à main durante esta validação (`5cb4323`); seus arquivos são idênticos à base utilizada. A 0.9.0 continua na branch própria para revisão. Grafo conectado, cidade piloto Cinza Nova, posto finito, ruas/pátios/garagem física, alternativas de piso, GPS no HUD e planejador M. [Arquitetura](docs/ARQUITETURA_RODOVIARIA_0.9.0.md) · [acessibilidade](docs/ACESSIBILIDADE_NUCLEOS_0.9.0.md) · [teste Windows](docs/TESTE_MANUAL_0.9.0.md).

Nesta atualização: 196 unitários/27 arquivos, build, reinício real e **31/31 E2Es numa integral de 37,6 min** aprovados. Depois, um ajuste apenas de CSS do HUD e de caminhos das evidências passou em **2/2 verificações focadas**, incluindo o novo teste de não sobreposição; não é apresentado como uma integral de 32 testes. Viagem desde Novo jogo de 3,18 km com oficina, cidade, combustível, terra, gerador, ativação e recarga; alternativa pavimentada de 2,51 km desde a bifurcação; 14/14 acessos físicos locais aprovados. Simulação original com tempo de diagnóstico acelerado, sem teleporte de diagnóstico nos percursos. Código da integral: 2dd3c0d; polimento posterior: 14bd88a. [Relatório 0.9.0](RELATORIO_REDE_RODOVIARIA_0.9.0.md) e [validação](evidence/roads-0.9.0/validation.json). Os resultados abaixo da 0.8.2 são históricos. Garagem sem compra/customização; Windows/GPU, sessão humana e finais continuam pendentes.

Os registros seguintes preservam o histórico da base.

**0.8.2 — Polimento e exploração, em revisão.** Cabine detalhada, instrumentos reais, acabamento do Titã, roupas/equipamentos individuais, barracão/oficina/POIs refinados, loja fisicamente acessível, terreno PBR corrigido e diário no caderno J. [Relatório](RELATORIO_POLIMENTO_0.8.2.md) · [comparação real](docs/COMPARACAO_VISUAL_0.8.2.md) · [avaliação Windows](docs/TESTE_MANUAL_0.8.2.md).

**Validação nova (01/11/2026):** 175 unitários/25 arquivos, build de produção e **28/28 E2Es numa única execução integral (30,8 min)** aprovados; recuperação exata após reinício real também aprovada. Logs e tentativas anteriores estão no relatório e em [validation.json](evidence/polish-0.8.2/validation.json). Referência 0.8.1 executada novamente: 167 unitários, build e 25/25 E2Es integrais. SwiftShader por software; Windows/GPU física e sessão humana de 30 minutos pendentes. Base humana/rostos finais, escalada com contato e retrovisores dinâmicos continuam pendentes.

**Base preservada:** main d8a3b2a (0.8.1), incluindo correção de opacidade, seis rodas, física, tutorial, campanha, narrativa e saves. Desenvolvimento isolado em [feat/polimento-0.8.2](https://github.com/renataaap/2047/tree/feat/polimento-0.8.2); main permanece 0.8.1 durante a revisão no [PR #1](https://github.com/renataaap/2047/pull/1). [Correção histórica do Titã](RELATORIO_CORRECAO_TITA_0.8.1.md).

**0.8.0 — Mundo vivo.** Ambientação contextual, moradia no barracão, estabelecimentos detalhados, três novos locais exploráveis, relógio solar persistente, luzes noturnas e áudio espacial original. Equipamentos individuais acompanham o rig existente. Tutorial de 21 objetivos, Titã com seis rodas, física Rapier, inventários, comércio, Sementes e sete Núcleos preservados. [Relatório 0.8.0](RELATORIO_EXPANSAO_0.8.0.md) · [diagnóstico](docs/DIAGNOSTICO_0.8.0.md) · [comparação visual](docs/COMPARACAO_VISUAL_0.8.0.md) · [teste humano](docs/TESTE_MANUAL_0.8.0.md).

**Histórico da expansão 0.8.0:** 161 unitários, build e reinício real aprovados; 24 cenários únicos de navegador aprovados entre rodadas, sem uma única integral verde. Cinco pares de capturas reais foram conferidos. Windows/GPU real e avaliação auditiva continuam pendentes. Os resultados da correção 0.8.1 ficam no seu relatório e em `evidence/truck-opacity/`.

**Repositório oficial privado:** [renataaap/2047 · feat/polimento-0.8.2](https://github.com/renataaap/2047/tree/feat/polimento-0.8.2). Entre como renataaap e selecione essa branch para revisar a 0.8.2. As versões/tags anteriores foram preservadas. Código, testes, assets licenciados, relatórios e histórico ficam no Git. Não há sincronização de partidas locais pelo GitHub.

No Windows, com a cópia completa desta branch: `npm ci`, `npm run dev`, abrir http://localhost:3000 nesse computador, ou usar INICIAR_JOGO.bat. Novo jogo inicia a pé no barracão; tutorial opcional pode ser pulado/repetido. A pé: WASD, Shift, mouse, C para perspectiva e F para interagir/entrar. No Titã: E motor, W/S acelerar/frear/ré, A/D direção, Espaço freio, C câmeras, L faróis, F sair parado. Saves 1–3 continuam compatíveis; não apague seu banco nem os cookies ao atualizar.

O motel (km 0,38), o pátio de caminhões (km 2,02) e a pesagem (km 2,46) têm acessos a pé e ações finitas. Relógio no HUD, dia configurável em 24/48/96 minutos de simulação ativa; menus pausam o tempo. [Continuar em outro aparelho](CONTINUAR_NO_CELULAR.md) · [próximos sistemas, ainda não implementados](docs/ROADMAP_APOS_0.8.0.md).

Oito Poly Haven da base permanecem locais. Não houve instalação dos seis ZIPs extras acima de 32 MiB; madeira, tecido e concreto receberam detalhes procedurais originais. Personagens/rostos ainda são provisórios; Fab continua fora por licença desconhecida. Carros Renafox têm restrição CC BY-NC. A caçamba parada no pátio é cenário; quatro caminhões adicionais continuam sem uso dirigível. O jogo inteiro e seus finais não estão concluídos. As seções seguintes registram checkpoints históricos.

Jogo 3D de navegador em JavaScript, Next.js, Three.js e Rapier. Checkpoint histórico: **0.5.0 — Fase 1 da reformulação realista: condução**. O mundo, a sobrevivência e a Rede com sete Núcleos da versão 0.4 foram preservados.

## Condução 0.5.0

Novo jogo começa ao volante com **motor desligado e caixa em N**. Pressione **E** para ligar; **W** engata avanço e acelera. **S** freia em movimento; parado, segure S por um breve intervalo para engatar ré. Em ré, W freia antes de permitir o retorno ao avanço. **Espaço**, mantido pressionado, é o freio de estacionamento; mantenha-o até pressionar **F** para descer. F também permite entrar e interagir.

O motor agora tem curva de torque, RPM, oito marchas automáticas, ré e freio de motor. A carga acrescenta massa/inércia reais ao Rapier. Cascalho/areia/sal/rocha têm resistências distintas; o esterçamento é limitado com a velocidade. Desgaste de suspensão, pneus, motor, transmissão e temperatura afetam o comportamento.

A cabine tem instrumentos 3D ligados ao veículo: velocidade, RPM, diesel, temperatura e marcha, com volante animado. C alterna acompanhamento, cabine e órbita livre; arraste o mouse para olhar/orbitar e use a roda para zoom nas câmeras externas. As câmeras externas respeitam colisores do cenário. Nas configurações é possível ajustar resposta da direção, distância externa e movimento da cabine. A câmera interna permanece no banco durante o deslocamento.

Parâmetros de simulação: `src/data/truck-tuning.js`. Benchmark reproduzível: `node scripts/benchmark-drive.js --output evidence/reformulation-1/driving-0.5.0.json`. Relatório: [RELATORIO_REFORMULACAO_FASE_1.md](RELATORIO_REFORMULACAO_FASE_1.md). Roteiro vigente: [docs/REFORMULACAO_REALISTA.md](docs/REFORMULACAO_REALISTA.md).

**Direção artística atual: realismo ambiental**, substituindo a especificação estilizada antiga. A reforma gráfica com arquivos reais do Poly Haven, remodelagem externa completa, estradas/terreno e iluminação é a Fase 2 deste novo roteiro. Nesta entrega foram corrigidos condução/câmeras e instrumentos; nenhum asset externo foi instalado. As seções e relatórios abaixo registram as fases históricas e as funcionalidades preservadas.


## Fase 4 — Um continente em resposta (0.4.0)

A rota tem 21 km em escala condensada: Mar de Cinzas → Cidades Esqueleto (dois Núcleos) → Leito Seco → Cordilheira Vítrea (dois Núcleos) → Zonas de Tempestade. A enseada de sal dos km 3,2–5,8 permanece para preservar o trecho explorável das versões anteriores.

Depois do Núcleo 1, siga o objetivo do HUD. Localize o Cofre, estacione a até 35 m, desligue o motor, desça mantendo Espaço pressionado até usar F e procure o mecanismo. Os custos vêm do compartimento do Titã. Transporte a Semente até a área de balizadores do Núcleo seguinte, desligue o motor e use o terminal. O mapa mostra a sequência e os desvios; J abre o caderno de missões, R abre o boletim e as transmissões.

Cada Semente exige a ancoragem anterior. Os seis Cofres seguintes têm custos/mecanismos próprios; o sétimo exige radiador e filtros a pelo menos 50% e transmissão a 40%. Falhas preservam a carga para calibração e nova tentativa. A chance é visível e fica garantida a partir de 80% de integridade.

Lia (km 6), Afonso (km 10,2) e Noêmia (km 12,8) oferecem missões secundárias com custos e recompensas; Joel recebe viajantes no km 17,8. Os quatro abrigos têm comércio e estoque próprio. Depósitos próximos aos Cofres têm suprimentos finitos. Recompensas respeitam o limite da mochila/compartimento. Lia reaparece na Última Parada após receber ajuda; a bomba e o repetidor mudam a travessia e o rádio.

Os desafios alteram a condução: viaduto bloqueado, túnel com água/arrasto e risco ao motor, sal instável/calor, rampas e menor aderência na cordilheira, frentes com rajadas/interferência e fragmentos que fecham a passagem central. Os arcos a leste são vias físicas; selecioná-los no mapa não teleporta o caminhão. A restauração remove os bloqueios, drena o túnel, melhora a atmosfera e faz crescer vegetação por faixa. O relógio climático avança só durante o jogo e é salvo; menus o pausam.

Saves 1 e 2 são carregados e atualizados para schemaVersion 3, preservando a primeira entrega, inventários, coletas e decisões. O novo formato registra os sete Núcleos, Cofres/Sementes, comércio, missões e clima. A sétima ancoragem não escolhe um dos quatro finais: narrativa e finais são a Fase 5.

O projeto está no repositório privado https://github.com/renataaap/2047. Consulte [CONTINUAR_NO_CELULAR.md](CONTINUAR_NO_CELULAR.md) para retomar esta conversa em outro aparelho e [STATUS_DO_PROJETO.md](STATUS_DO_PROJETO.md) para o estado do desenvolvimento.

## Correção 0.3.1 — descer do Titã

Com o caminhão parado, pressione **F** ou clique no botão **F · Descer do caminhão** na tela. Em movimento, segure **Espaço** para frear antes de descer. Agora é possível circular até 24 m ao redor do Titã em qualquer trecho; abrigos, Núcleo e estruturas mantêm suas áreas maiores de exploração. Para entrar, aproxime-se do caminhão e use F ou o botão correspondente.

Para atualizar no Windows: feche o terminal da versão antiga antes de iniciar a nova. Extraia o ZIP corrigido numa pasta nova e confira **0.5.0** no menu. Se já tem saves, copie os arquivos **local.db** e, se existirem, **local.db-wal** e **local.db-shm** da pasta antiga para a nova, sem apagar os originais, e use o mesmo navegador e endereço http://localhost:3000.

## Windows
1. Instale Node.js LTS em https://nodejs.org.
2. Extraia o ZIP inteiro e abra a pasta que contém package.json.
3. Dê dois cliques em **INICIAR_JOGO.bat**. Na primeira execução, a instalação usa Internet e pode levar alguns minutos.
4. O iniciador abre http://localhost:3000 depois de o servidor responder. Mantenha a janela aberta enquanto joga. Se o navegador não abrir automaticamente, acesse esse endereço manualmente.

A execução do arquivo .bat em Windows ainda requer verificação humana; os comandos internos foram usados no ambiente Linux de desenvolvimento.

## Instalação manual / Linux / macOS

```sh
npm ci
npm run db:migrate
npm run dev
```

Requer Node.js 20.9+ (verificado com 24.19.0) e navegador desktop com WebGL2. Abra http://localhost:3000.

## Primeira viagem

Novo jogo começa ao volante com o motor desligado, caixa em N e diesel na reserva. E liga o motor; W engata avanço. Pare, pressione F e caminhe até a sobrevivente no abrigo. F abre o diálogo; aceite a Semente. Transfira diesel e peças ao compartimento do Titã pelo inventário, abasteça e repare radiador/suspensão. M abre as rotas: desvio pavimentado a leste, atalho irregular a oeste. No Núcleo, estacione no retângulo de balizadores, desligue o motor, desça e use o terminal. Confira a chance e calibre se precisar. A primeira ativação não permite avançar fora da sequência dos sete Núcleos.

| Tecla | Ação |
| --- | --- |
| W / S, A / D | Acelerar/frear/ré e direção; a pé, caminhar |
| Espaço | Freio de mão; a pé, pular |
| Shift | Correr a pé |
| F | Descer parado, entrar ou interagir com alvo próximo |
| E | Motor (somente dirigindo) |
| C | Externa → cabine → livre |
| Arrastar / roda do mouse | Orbitar / zoom na câmera livre |
| Clique no mundo / mouse | Olhar a pé, com pointer lock |
| L | Faróis |
| M / R / Tab / V / H | Mapa / rádio / inventário / inspeção / sobrevivência |
| Esc | Pausa / voltar |

A pausa contém salvar/carregar, ajustes, resgate e retorno ao menu. Resgate cobra diesel e integridade para não devolver recursos consumidos. Ajustes gráficos/volume/legendas são locais; progresso usa API e libSQL.

## Fase 3 — reconhecimento e sobrevivência

Após a primeira ancoragem, siga ao sul. A estrada/rota tem 6 km: o Leito Seco começa perto do km 3,2. Essa extensão é reconhecimento opcional; as entregas seguintes da Rede continuam na sequência, a implementar na Fase 4.

- H abre hidratação, saciedade e fadiga. Água/comida caem devagar apenas em viagem; beber/comer gasta itens reais. A falta de suprimento reduz o vigor gradualmente, sem morte instantânea. Menus e caminhão parado não esgotam os medidores.
- Oficina abandonada no km 1,65 (oeste), posto de Mãe Ivani no km 3,48 (oeste) e estação meteorológica no km 5,1 (leste). Pare perto, desça com F, entre pela porta e use F no alvo no interior.
- Mãe Ivani troca materiais por diesel, água, comida e peças; também compra peças e oferece descanso com custo. Os estoques são finitos e salvos.
- Suprimentos coletados vão para a mochila (40 kg). Se encher, volte ao lado do Titã, use Tab e transfira itens ao compartimento (240 kg). Coletas não reaparecem ao recarregar.
- No Leito Seco, sal reduz aderência, crosta instável é ainda mais escorregadia e calor sobrecarrega o radiador. Reduza a velocidade, repare e use água no radiador; pare com o motor desligado para esfriar.
- Saves schemaVersion 1 (Fase 2) são migrados para schemaVersion 2 ao carregar, com sobrevivência e estoque inicializados. Flags e decisões anteriores são preservadas.

## Testes e produção

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
# Alternativa com Chromium de sistema:
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e
```

Em produção, configure TURSO_DATABASE_URL (libsql:// ou https://) e TURSO_AUTH_TOKEN antes de `npm start`. Disco local é recusado em produção. SAVE_COOKIE_SECRET pode assinar o cookie anônimo (use segredo aleatório forte e estável). HttpOnly e SameSite=Strict sempre; Secure em HTTPS/produção. No localhost HTTP de desenvolvimento, Secure fica desativado para funcionar no Windows.

O banco file:local.db é criado no projeto, atrás de src/lib/repository.js, e deve ser preservado para continuar partidas locais. Não vem no ZIP; não substitua seu banco ao instalar uma atualização. O GitHub guarda o projeto e o histórico, mas não transfere partidas locais entre computadores. O cookie identifica o dono: apagar cookies ou trocar localhost por 127.0.0.1 muda a identidade e pode ocultar seus slots. Use sempre o mesmo navegador e endereço.

GET /api/game/config, /api/game/items, /api/game/missions, /api/world/regions?slot=1; GET/POST /api/saves; GET/PUT/DELETE /api/saves/[slot]. Limite 128 KiB; erros padronizados; revisão otimista. Não há HTTP por frame: API apenas para catálogo/listagem, carregar e salvar manual/checkpoint.

O jogo roda fora do React. Passo fixo 1/60 s, interpolação, HUD 10 Hz, janela móvel 3×3, instâncias e LOD. window.__GAME_DEBUG__ existe somente em desenvolvimento. Cada fase tem relatório com provas e limitações. Consulte CHECKLIST_MANUAL.md, DECISOES.md e ASSETS_PENDENTES.md. Sessões humanas longas, sensação dos controles e ~60 FPS em GPU integrada a 1080p permanecem não verificados.

# Interface narrativa — 0.5.2 — 29/10/2026

Pedido: reconstruir diálogos, escolhas e painéis do jogo existente. Não foram alterados física, assets, regras de missões ou saves.

## Diagnóstico

MissionPanel concentrava diálogo e telas práticas em uma janela central; a fala animada não tinha controle de revelação. Havia apenas foco inicial/Tab/Escape, sem navegação sequencial por escolhas. Não existia ajuste de tamanho das legendas. Menus usavam caixas/cartões e botões sem distinção clara entre narrativa e instrumentos.

## Alterações reais

- NarrativeDialogue separa as falas da sobrevivente e Dante, com interlocutor, contador, avanço/retorno e escolhas textuais numeradas. Aceitar a Semente continua executando a transação real; recusar fecha a conversa. A troca de fala não depende de snapshots do game loop.
- DialogueText permite revelar imediatamente por clique ou ativação de botão com teclado; textos curtos/longos e redução de movimento são respeitados. Não reinicia quando o estado do jogo é publicado sem mudar a fala.
- usePanelNavigation reutiliza navegação, foco e som discreto ligado ao volume. Setas/W/S/Home/End percorrem controles habilitados; Enter/clique confirma pelo comportamento nativo; Tab fica no painel, Escape fecha e o foco anterior é recuperado. Inputs/selects preservam seus controles nativos. As escolhas mantêm a pausa/contexto menu, impedindo movimento do veículo/personagem.
- Saída fecha o controle imediatamente e usa uma cópia visual inerte/oculta para acessibilidade por 140 ms para animar o desaparecimento. A cópia não recebe ações e é removida; redução de movimento evita a animação.
- Conversas/radio/interações usam composição inferior, com cenário visível acima. Telas técnicas usam painel lateral, tipografia e comandos consistentes. Inventário, manutenção, mapa, missões, comércio, save/load, pausa e configurações mantêm seus sistemas reais; manutenção e missões usam linhas em vez de cartões.
- Indicador contextual existente ganhou tratamento discreto; seleção por proximidade continua no jogo, sem espalhar novas mensagens sobre o mundo.
- Configurações permitem legenda padrão/grande/muito grande (1/1,2/1,4), persistida no navegador com validação e fallback para saves de configurações antigos.

## Arquivos

src/components/gameplay/{NarrativeDialogue,DialogueText,MissionPanel}.js; src/components/ui/usePanelNavigation.js; src/components/menus/Panel.js; src/game/persistence/settings.js; src/app/{layout.js,narrative.css}; tests/unit/world.test.js; tests/e2e/interface.spec.js.

## Verificação

Resultados finais e capturas em evidence/interface. O antes é uma captura real da versão anterior, extraída do Git. O teste novo cobre falas, revelação, seleção por teclado, aceitação real, bloqueio de movimento, retorno à exploração, persistência da escala e painel estreito. Os testes existentes exercitam manutenção, trocas, missões, mapa, rádio e saves. A primeira tentativa concorrente de duas suítes provocou disputa de artefatos e queda de FPS em SwiftShader; a verificação foi repetida isoladamente. Os logs finais são a referência.

## Limites

Não existe seleção funcional dos três caminhões; não foi criado um menu fictício para esse sistema pendente. Personagens e diálogos de missões existentes foram preservados; ramificações narrativas adicionais e narração gravada não foram criadas. Os NPCs/Poly Haven e os quatro finais continuam no estado documentado na auditoria anterior. O fluxo cinematográfico por falas foi aplicado ao diálogo inicial; outros NPCs usam o painel contextual compartilhado e mantêm seu conteúdo e opções atuais. Inspeção humana de conforto e de áudio em Windows/GPU real continua necessária.

## Resultados finais

- 88 testes unitários passaram (11 arquivos).
- Build Next.js passou, com dez rotas preservadas.
- Suíte focada: oito testes funcionais passaram; o teste de velocidade falhou nessa execução por timing/renderização em software (38 km/h). Foi repetido isoladamente e passou com 44,2 km/h, 152 draw calls, 101.784 triângulos, ~2,39 FPS SwiftShader e console sem erros. Não houve redução do critério de aceite nem alteração da física.
- Repetição final de velocidade e interface: dois testes passaram. Após o último refinamento visual, o teste de diálogo/teclado/legendas/resolução estreita passou novamente. Os logs e capturas estão em evidence/interface; não se declara uma execução integral de 15 testes passando nesta etapa.
- [Antes](evidence/interface/before-dialogue.png), [diálogo novo](evidence/interface/dialogue.png), [configurações](evidence/interface/settings.png), [resolução estreita](evidence/interface/narrow.png).

O HUD fica oculto enquanto o painel está ativo e retorna ao fechá-lo. Avisos antigos de exploração deixam de ocupar a conversa; erros de uma ação continuam visíveis. Não foi criado menu de caminhões sem sistema correspondente.

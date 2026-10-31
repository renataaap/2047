# Titã Rocha Clara — correção de transparência 0.8.1

Correção sobre a expansão **0.8.0**, base `034506a`, branch `feat/tutorial-assets`, em 31/10/2026. O pedido mencionava 0.7.0; a cópia vigente já era 0.8.0 e foi preservada. Escopo: materiais, integração visual e regressão do caminhão existente. Nenhum novo caminhão ou asset externo instalado.

## Causa identificada

O GLB tinha **um único `DefaultMaterial`, `alphaMode: BLEND`, `doubleSided: true`**, aplicado à cabine, ao baú, ao chassi e às seis rodas. O carregador oficial da versão instalada do Three.js interpreta BLEND com `transparent = true` e **`depthWrite = false`**. Uma malha com peças sobrepostas não consegue ordenar todos os seus próprios triângulos por profundidade: rodas e cabine eram desenhadas sobre o baú, mesmo em regiões de alpha 255.

O PNG base contém alpha intencional para vidros/lentes: 38.035 de 1.048.576 pixels têm alpha menor que 255. Portanto, tornar todo o asset opaco perderia os vidros. Alterar a cor da pintura também não corrigiria a ordenação/profundidade.

Havia ainda um segundo defeito: `Game.tick` considerava a câmera de índice 1 como interior mesmo **após descer do caminhão**. O visual anterior escondia o GLB inteiro nessa condição. A decisão agora exige o contexto real `driving`; a exploração a pé restaura o exterior.

## Correção aplicada

O GLB foi modificado offline e continua sendo o mesmo Titã de Alt (whisper.alt), CC BY 4.0. O reparo separa índices/primitivas em oito materiais com funções explícitas:

| Materiais | Função | Alpha / profundidade |
| --- | --- | --- |
| `Titan_Paint`, `Titan_CabPaint` | Pintura desgastada | OPAQUE, opacity 1, depthWrite ativo |
| `Titan_Metal`, `Titan_CabMetal` | Chassi, aros e peças metálicas | OPAQUE, opacity 1, depthWrite ativo |
| `Titan_Rubber`, `Titan_CabTrim` | Pneus e acabamentos | OPAQUE, opacity 1, depthWrite ativo |
| `Titan_Glass` | Janelas e para-brisa | BLEND, opacity 0,55, depthWrite desativado |
| `Titan_Lens` | Lentes dos faróis/indicadores | BLEND, opacity 0,85, depthWrite desativado |

Todos mantêm depthTest ativo. Não há alphaMap extra, alphaTest de recorte, transmissão acidental ou mistura aditiva. A transparência final de vidro/lentes também respeita o alpha do atlas. As superfícies continuam double-sided como na fonte; isso não é a causa da transparência nem uma tentativa de esconder normais invertidas.

Os mapas base color, normal e AO/roughness/metalness foram preservados. O GLTFLoader mantém base color em sRGB, dados sem conversão de cor e canais do mapa combinado conforme glTF (R: AO, G: roughness, B: metalness). Não se introduziu um mapa no canal errado nem texturas externas. O desgaste/ferrugem original permanece localizado no atlas, sem recolorir a cabine inteira. Roughness, metalness e intensidade do normal foram diferenciados por função. Vidros não projetam sombras sólidas; carroceria e rodas continuam projetando/recebendo sombras conforme o perfil gráfico.

`prepareTruckMaterials` usa cópias locais dos materiais, compartilhando os mesmos mapas do cache. Não altera materiais de outros assets; libera apenas as cópias quando o veículo é descartado. O manifesto registra as funções e as peças que conflitam com o cockpit provisório.

Em terceira pessoa, órbita, menu e exploração a pé, todo o exterior importado permanece visível e a cabine procedural fica oculta. No interior, somente a casca da cabine importada e seus vidros são ocultados para acomodar o cockpit existente; **baú, chassi e rodas continuam presentes**. A cabine provisória continua sendo uma limitação artística conhecida.

## Geometria e fidelidade ao asset

- **47.500 triângulos** preservados, incluindo a orientação de cada face; seis nós/pivôs físicos mantidos.
- Posições de vértices, normais, UVs, transformações dos nós e três PNGs embutidos idênticos à fonte, verificados por fingerprints e testes.
- Reordenação dos índices e novas declarações de materiais/primitivas; sem remover painéis, reescalar o caminhão ou deslocar rodas.
- Raycasts reais no baú confirmam faces nas duas laterais, no teto e na traseira.
- Auditoria encontrou zero faces exatamente duplicadas. A fonte contém um triângulo quase degenerado e quatro faces com produto negativo em relação à normal suave média; isso não demonstrou inversão global nem a causa do defeito. Não se afirma que esses elementos foram corrigidos ou que toda a malha é estanque.
- **Blender não foi necessário**: o problema reproduzido era material/profundidade e visibilidade. O reparo direto do glTF preserva os dados geométricos com comparação verificável.
- GLB: 5.884.428 → 5.890.652 bytes. SHA da fonte `1076b3ec66b3e8aca32870d018304c00bebeac93cb6910d935d1a58e923dc013`; SHA corrigido `729ad051a5e4207380c4ec9d4b6cbf657cc9ffe58a711490265171ea7b732717`.

O script `scripts/corrigir-materiais-tita.mjs` é idempotente e recusa hashes de fontes diferentes, pois a classificação foi auditada especificamente para este modelo. Não é um conversor genérico de caminhões. Exemplo de reprodução a partir da fonte histórica:

```bash
git show 034506a:public/assets/models/trucks/titan-old/model.glb > titan-source.glb
node scripts/corrigir-materiais-tita.mjs --source=titan-source.glb --output=titan-fixed.glb
```

## Capturas reais e inspeção

As imagens são screenshots do jogo executado em Chromium/ANGLE SwiftShader, perfil Baixo/75%, 1280×720. Foram usadas câmeras e comandos reais. Diagnósticos encurtam apenas o deslocamento até a estrada e selecionam os horários. Não há renders promocionais, substituição de imagem ou retoque.

| Vista | Antes (0.8.0 original) | Depois (0.8.1) |
| --- | --- | --- |
| Traseira | [antes](evidence/truck-opacity/before/traseira.png) | [depois](evidence/truck-opacity/after/traseira.png) |
| Lateral esquerda | [antes](evidence/truck-opacity/before/lateral-esquerda.png) | [depois](evidence/truck-opacity/after/lateral-esquerda.png) |
| Frontal | [antes](evidence/truck-opacity/before/frente.png) | [depois](evidence/truck-opacity/after/frente.png) |
| Lateral direita | [antes](evidence/truck-opacity/before/lateral-direita.png) | [depois](evidence/truck-opacity/after/lateral-direita.png) |
| Cabine | [antes](evidence/truck-opacity/before/cabine.png) | [depois](evidence/truck-opacity/after/cabine.png) |
| Menu | [antes](evidence/truck-opacity/before/menu.png) | [depois](evidence/truck-opacity/after/menu.png) |
| Movimento | [antes](evidence/truck-opacity/before/movimento.png) | [depois](evidence/truck-opacity/after/movimento.png) |
| Entardecer | [antes](evidence/truck-opacity/before/entardecer.png) | [depois](evidence/truck-opacity/after/entardecer.png) |
| Noite/faróis | [antes](evidence/truck-opacity/before/noite.png) | [depois](evidence/truck-opacity/after/noite.png) |
| Cabine à noite | [antes](evidence/truck-opacity/before/cabine-noite.png) | [depois](evidence/truck-opacity/after/cabine-noite.png) |
| Retorno à externa | [antes](evidence/truck-opacity/before/retorno-externa.png) | [depois](evidence/truck-opacity/after/retorno-externa.png) |

Há também o registro noturno de saída em `after/a-pe-apos-cabine.png` e uma [vista diurna a pé após sair diretamente da cabine](evidence/truck-opacity/details/a-pe-apos-cabine-dia.png), olhando de volta para o caminhão completo. A [vista no perfil Alto](evidence/truck-opacity/details/alto-sombras.png) mostra sombras no solo e iluminação ambiental; o [retorno ao Baixo](evidence/truck-opacity/details/retorno-baixo.png) preserva a opacidade. As poses paradas são comparáveis; os instantes de movimento e os relógios não são pixel a pixel idênticos. Estados e erros do navegador estão nos `capture.json` de cada pasta. As três vistas adicionais são reproduzíveis com `node scripts/capturar-tita.mjs --details`.

## Validação

Execuções novas desta correção, sobre o código 0.8.1:

| Verificação | Resultado | Evidência |
| --- | --- | --- |
| `npm test` | **167 testes / 24 arquivos aprovados**, incluindo seis testes novos | [unit.log](evidence/truck-opacity/unit.log) |
| `npm run build` | **Aprovado**, Next.js 16.4.3; dev encerrado antes do build | [build.log](evidence/truck-opacity/build.log) |
| Playwright: cinco arquivos selecionados | **10/10 aprovados em uma rodada**, 10,1 minutos | [regression-e2e.log](evidence/truck-opacity/regression-e2e.log) |
| Captura adicional Baixo → Alto → Baixo | **Aprovada**, três imagens reais, exterior restaurado, seis rodas, zero erros de assets/console | [details/capture.json](evidence/truck-opacity/details/capture.json) |
| Reaplicar reparo ao GLB corrigido | **Idempotente**, nenhuma alteração | [idempotency.log](evidence/truck-opacity/idempotency.log) |
| Comparação com GLB fonte | **Geometria, UVs, normais, imagens e nós preservados** | [geometry-invariants.json](evidence/truck-opacity/geometry-invariants.json), teste unitário |
| Quatro módulos narrativos protegidos | **Hashes preservados** | [validation.json](evidence/truck-opacity/validation.json) |

Comando de navegador executado:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e -- \
  tests/e2e/truck-opacity.spec.js tests/e2e/assets.spec.js \
  tests/e2e/driving.spec.js tests/e2e/exit.spec.js tests/e2e/tutorial-assets.spec.js
```

Os cenários cobriram materiais do Titã, câmeras externas/interna, faróis noturnos, rodas/esterçamento/suspensão durante condução, partida fria, instrumentos, marchas automáticas, consumo, frenagem, ré segura, colisão de câmera, configurações persistentes, entrada/saída por F e botão, assets locais e cache, colisão/streaming de carros, tutorial completo, manutenção, missão, gerador, primeiro Núcleo, salvamento e recarga. No teste específico, o estado após a captura em movimento registrou 14,48 km/h e esterçamento nas duas rodas dianteiras; as seis mantiveram vínculos físicos. Nenhum erro de console foi registrado nas capturas do Titã.

Uma primeira tentativa do novo cenário falhou na velocidade após soltar W/A **antes** de capturar: o freio de motor e o retorno da direção continuavam atuando enquanto SwiftShader gastava segundos no screenshot. O harness passou a manter as teclas durante a captura, sem alterar a física nem reduzir o limite do teste. A tentativa está preservada em [visual-e2e-first-attempt.log](evidence/truck-opacity/visual-e2e-first-attempt.log); a rodada de dez posterior passou integralmente.

Os outputs dos testes antigos foram copiados para `evidence/truck-opacity/regression-artifacts/`, com índice em `archived-regressions.json`, e seus caminhos históricos foram restaurados. Assim, evidências antigas não foram sobrescritas pela execução atual.

**Não foi executada a suíte E2E inteira de todas as fases.** Foram executados os dez cenários relevantes acima. Os 161 unitários/24 cenários da expansão 0.8.0 são históricos, não uma execução desta correção. As medidas de SwiftShader não comprovam desempenho em GPU real.

## Arquivos alterados

- `public/assets/models/trucks/titan-old/model.glb`, seu `LICENSE.txt`, `public/assets/models/manifest.json` e `public/assets/CREDITOS.txt`: separação do material e créditos da adaptação.
- `src/game/vehicle/truckMaterials.js`: política específica de materiais do Titã, cópias locais e diagnóstico.
- `src/game/vehicle/TruckVisual.js`: aplicação da política, visibilidade por câmera e descarte das cópias.
- `src/game/core/Game.js`: condição de interior vinculada ao contexto de condução.
- `scripts/corrigir-materiais-tita.mjs`, `scripts/lib/truck-gltf.mjs`: reparo reproduzível e análise de geometria.
- `scripts/capturar-tita.mjs`, `tests/unit/truck-opacity.test.js`, `tests/e2e/truck-opacity.spec.js`: capturas reais, proteção da geometria e regressões.
- `package.json`, `package-lock.json`, `src/data/pt-BR.js`: identificação 0.8.1, sem mudar dependências ou diálogos.
- Este relatório, `STATUS_DO_PROJETO.md`, `README.md`, `AGENTS.md`, `CONTINUAR_NO_CELULAR.md` e `evidence/truck-opacity/`: continuidade e evidências.

`model.js`, `AssetManager.js`, `materials.js` e `SceneRenderer.js` foram inspecionados; não exigiram alterações. Física Rapier, motor, transmissão, colisores, controles, sistemas de sobrevivência e persistência não foram modificados. Os quatro módulos narrativos protegidos permanecem intactos.

## Limitações e teste no computador do usuário

Esta é uma correção material/visual comprovada no renderizador disponível, não arte final do veículo. Atlas 1K, geometria original e cockpit procedural provisório continuam. A noite é escura conforme o ciclo existente. Não houve validação em Windows com GPU real nem medição de desempenho representativa dessa plataforma; software SwiftShader não a substitui.

Após atualizar esta branch, confirmar **0.8.1** no menu, executar `npm ci` e `npm run dev` e abrir o localhost **no computador que executa o servidor**. Em Configurações, repetir a inspeção em Baixo e Alto. No jogo: F para entrar, E para ligar, W/A/D para dirigir, Espaço para parar, C para alternar as três câmeras, L para faróis e F para sair pela câmera interna. Observar se baú/rodas permanecem sólidos e o exterior completo retorna ao descer. Não apagar o banco de saves ao atualizar.

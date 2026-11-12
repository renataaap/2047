# Art Bible: 2047 — Rede Aurora

> **Status**: Draft (modo autônomo, aprovação registrada por seção)
> **Owned By**: art-director
> **Last Updated**: 2026-11-08
> **Art Director Sign-Off (AD-ART-BIBLE)**: SKIPPED 2026-11-08 — solo mode

Escrita via `/art-bible` em modo autônomo (decisões registradas em cada seção). Fonte de verdade da visão: [`docs/VISAO_CRIATIVA.md`](../../docs/VISAO_CRIATIVA.md).

## 1. Visual Identity Statement

**Regra:** Tudo que se vê mostra o que o gastou e o que a Aurora pode devolver, no mesmo lugar.

1. **Desgaste com causa** (Pilar 2: mundo e exploração). Ferrugem, poeira e rachadura têm origem legível (calha, sotavento, armadura exposta); o cenário conta o que aconteceu. *Teste:* entre "liso e limpo" e "detalhado", escolher silhueta quebrada e desgaste localizado com causa, nunca ruído uniforme.
2. **A estrada e o Titã primeiro** (Pilar 1: simulação). A leitura da pista, do caminhão e dos instrumentos vence ornamento e interface. *Teste:* quando decoração ou UI disputar com pista, curva ou instrumento, vence o que ajuda a dirigir; informação diegética ou contextual vence botão permanente.
3. **Mesmas estradas, dois estados** (Pilar 4: restauração). Traçado e geometria fixos; mudam material, cor e vida. *Teste:* entre detalhe fixo e detalhe que a restauração transforma, escolher o transformável; o "antes" fica seco, dessaturado e silencioso para o "depois" aparecer.

**Proíbe:** prédios como caixas cinzas lisas e esparsas, paredes retas cinza na Cordilheira; Leito Seco como planície branca vazia (sem crosta salina, marcas de maré e cascos encalhados); HUD de depuração (8 botões permanentes, minimapa sobre a coluna da cabine).
**Viabilidade:** a variação vem de cor de vértice, composição, decalques e luz sobre os 8 PBR locais, sem pacote externo.

## 2. Mood & Atmosphere

Convenção: dois estados diferem em ≥2 de {temperatura, contraste, fonte dominante}. Orçamento para GPU integrada: 1 sombra direcional; luz de comunidade e de Núcleo é emissivo + halo, não PointLight. (a) e (b) usam o Mar de Cinzas como referência; os outros biomas aplicam a §4.3.

| Estado | Emoção | Luz | Descritores | Energia | Elemento que carrega o clima |
|---|---|---|---|---|---|
| (a) Viagem no devastado | solidão contemplativa, tensão baixa | 6000K neutro-frio, sol alto difuso sob haze, 10h–16h, contraste ~3:1 | poeira, silêncio, estéril, vasto, ferrugem | baixa, linear | haze lavando o horizonte; rastro de poeira do Titã, a única coisa que se move |
| (b) Viagem no restaurado | alívio cauteloso | 5000K, sol baixo dourado lateral (8–10h / 15–17h), ~5:1, céu azul com nuvens | úmido, orvalho, brotando, cor, vento | média, ondulante | asfalto molhado refletindo o céu; musgo na borda da MESMA pista |
| (c) Comunidade/cidade | calor humano com cautela | 5500K ~17h + pontos de 2700K nas aberturas, contraste médio-alto lateral | improvisado, habitado, fumaça, remendos, vozes | média-alta | janelas âmbar pequenas e alinhadas; lonas e roupas coloridas |
| (d) Exploração a pé | curiosidade vulnerável | feixes duros de 6500K por fissuras sobre penumbra de 4500K, ~10:1, lanterna 3200K | poeira suspensa, eco, confinado, vestígios | baixa-média, pulsante | feixe diagonal com partículas sobre um objeto narrativo |
| (e) Ativação de Núcleo | catarse com peso | alvorada forçada, dourado 3500K de cima e do Núcleo, contraste alto, saturação crescente | ignição, primeira chuva, ozônio, ressonância | alta, cresce e libera | anel dourado #F0CF8A e anel de solo escurecendo com a chuva; Semente verde-água vira dourado |
| (f) Tempestade | pavor que vira determinação | 8000K verde-cinza, sem sol, ~4:1 com flashes violeta | plasma, estática, visibilidade 60–80 m, pressão | alta, errática | arcos violeta no horizonte e neblina densa; interferência no rádio e na luz, nunca filtro sobre a geometria |
| (g) Noite na estrada | intimidade solitária | luar ~9500K ≤8% do dia; faróis 3800K como fonte principal; painel âmbar 2200K; ~20:1 | cone de luz, poeira iluminada, estrelas, silêncio | baixa, hipnótica | cone dos faróis com poeira e brilho do painel |
| (h) Garagem/oficina | segurança pragmática, orgulho de ofício | lâmpadas 3000K + bancada 4000K de cima, ~4:1, fresta fria ao fundo | óleo, ferramenta, remendo, calor | baixa, firme | poça de luz da bancada sobre o Titã |
| (i) Menus/rádio | memória, calma que promete | vinheta escura, acento âmbar 2700K, ~3:1 | serifada, papel velho, brasa, voz | mínima | tipografia serifada em #C9A35A sobre fundo quente escuro |

## 3. Shape Language

**Gramática-base.** Diagonal quebrada = perda e perigo · curva orgânica = vida e restauração · retângulo pequeno e alinhado = mão humana (remendo, janela acesa, lona) · círculo ou anel = Núcleo, Aurora, Semente. Toda forma tem causa: gravidade, corrosão, vento ou improviso.

**Personagens** (teste: silhueta preta a 48 px distingue os 4; proporção 7–7,5 cabeças; diferença pela massa do vestuário, sem caricatura; ruído crescente na ordem Dante < sobrevivente < comerciante < saqueador):
- Dante: retângulo robusto, ombros largos, postura cansada e ereta, boné, ferramenta no cinto; a silhueta mais simples.
- Sobrevivente: massa arredondada em camadas (manta, capuz, mochila alta).
- Comerciante: base em sino, carga pendurada, chapéu de aba larga.
- Saqueador de Garcia: angular, ombreira de chapa ou pneu, capuz pontudo, antena ou ferramenta acima da cabeça, assimetria. A hostilidade vem das pontas, nunca do vermelho.

**Geometria por bioma.**
- Mar de Cinzas: horizontal e baixa; indústria colapsada sobre dunas suaves.
- Cidades Esqueleto: vertical, grade quebrada; lajes inclinadas, pilares expostos, fachadas faltando, viadutos interrompidos; comunidades são volumes pequenos encaixados.
- Leito Seco: quase plano, orgânico de baixa amplitude (ondulações de maré, polígonos de sal, linhas de maré); verticais raras e inclinadas (cascos, guindastes).
- Cordilheira Vítrea: diagonais facetadas de 30–60°, prismas colunares, estratos; serpentina com muros; nenhuma face lisa.
- Zonas de Tempestade: formas sob tensão, todas inclinadas para o mesmo lado, vitrificadas e fragmentadas, linhas fractais de plasma.

**UI: híbrida sóbria (decidido).** Cantos retos com chanfro de 45° (3–4 px) em dois cantos opostos, linha de 1 px, sem pílulas, glow ou skeuomorfismo. Diegético primeiro: o HUD cobre só o que a cabine não dá. Atalhos: de 8 botões permanentes para ≤3 contextuais. O minimapa tem âncora própria, fora da coluna do HUD.

**Herói vs. apoio.** Ordem de atração: Titã e pista > marcos verticais únicos (Núcleo, chaminé, guindaste) > interagíveis e Semente > ambiente. O herói tem silhueta simples e ≥30% de L* de contraste local. O apoio é de baixa frequência, com detalhe só a <120 m. Corredor da pista: ±8 m sem ruído de alto contraste; nenhuma vertical ≥2 m a <3 m do meio-fio, exceto marcos. Um marco a cada ~400–600 m de pista.

**Regras procedurais (Three.js):**
1. Nenhum topo plano intacto: toda cobertura tem ≥1 ruptura, e há quebra de skyline a cada ≤12 m de fachada.
2. Chanfro de 0,05–0,12 m nas quinas de concreto e metal.
3. Nenhuma face vertical contínua >8 m (recuo ou pilastra ≥0,4 m); rochas com inclinação variável.
4. Sem simetria exata (desvio ≥10%); ≥4 variantes por módulo, sem repetir a <30 m.
5. Três escalas: >2 m e 0,3–2 m são geometria (o secundário só a <120 m); <0,3 m é textura ou decalque.
6. Estruturas caídas inclinam 2–8° na mesma direção dentro do setor.
7. Vegetação nasce de fissuras, pés de parede e vãos, com formas curvas, nunca em grade.
8. Geometria e colliders idênticos antes e depois; a restauração muda só material, cor, flora e água.
9. Silhueta antes de detalhe; os LODs preservam a silhueta primária; usar instancing.

## 4. Color System

| Cor | Hex | Papel |
|---|---|---|
| Cinza-poeira | #8A8176 | solo estéril, concreto, haze |
| Ferrugem | #9C4A2A | metal, indústria; saturação máxima do devastado |
| Sal-osso | #CFC6B0 | Leito Seco, sinalização desbotada |
| Azul-vidro | #5D6F7A | Cordilheira, vidro, sombras frias |
| Terra-úmida | #3F3027 | lama, asfalto molhado, solo restaurado |
| Verde-musgo | #6B8A47 | vida restaurada, nunca emissivo |
| Âmbar-Aurora | #C9A35A | Aurora, luz humana, UI |

Proporção: ~60% neutros, ~30% secundárias do bioma, ~10% acentos; cor semântica saturada abaixo de 2% do quadro. Albedo máximo de 0,72 no mundo. O Titã mantém a cor do GLB; o devastado fica com saturação ≤20%, para o Titã ser o objeto mais saturado do quadro.

**Semântica** (com forma de ícone redundante):
| Significado | Cor | Lore | Ícone |
|---|---|---|---|
| Perigo | #B8392B no mundo; #E2604F na UI | tinta de aviso da Rede pré-2027 | triângulo |
| Perigo ambiental | #8D5BD9 emissivo | assinatura do plasma | triângulo com raio |
| Segurança | #E0A24F emissivo, 2700K | lâmpada improvisada = gente viva | casinha |
| Aurora/recompensa | #C9A35A na UI; #F0CF8A na luz | nome da rede, alvorada | semicírculo nascente |
| Interação | #F2EFE6 | giz e etiquetas dos sobreviventes | quadrado chanfrado com tecla |
| Semente | #5FD4B0 emissivo (decidido) | única luz verde, "primeira cor viva"; vira dourado ao ativar | gota |
| Restauração | #6B8A47 + terra-úmida | vegetação e solo úmido; o que brilha não é restauração | folha |

Emissivo é reservado a Semente, Aurora, plasma, lamparina e painel. Segurança e Aurora compartilham a família âmbar (decidido) e se separam pela forma.

**Por bioma.** Regra de teste: o restaurado fica ≥500K mais quente, com ≥+15 pontos de saturação e solo 20–30% mais escuro, comparando capturas da mesma câmera.
| Bioma | Antes | Depois |
|---|---|---|
| Mar de Cinzas | 6000K, poeira + ferrugem, céu #A39B8E, sat 10–20% | 5000K, solo −25% de albedo, musgo na borda, céu #7F9AAE, sat 30–45% |
| Cidades Esqueleto | 5500K, concreto + ferrugem, sombras azul-vidro | 5000K, janelas #E0A24F, trepadeiras, vidro refletindo o céu, sat 35–50% |
| Leito Seco | 6500K duro, sal-osso + sombras azul-vidro, sat 5–15% | 5500K, lâminas d'água #6F8FA6, crosta #A89F8A, juncos #7A8450 |
| Cordilheira Vítrea | 7000K, azul-vidro + ardósia #4A5058, contraste alto | 6000K, líquen, neblina baixa nos vales |
| Zonas de Tempestade | 8000K verde-cinza #3E4A46 + violeta #8D5BD9 em picos | horizonte #F0CF8A, violeta só em resíduos, ~5500K |

**UI.** Painel #14110E (alfa ≥80%) com borda #3A322A; texto #E9E2D0, secundário #A89F8A; acento único #C9A35A (≈7,9:1), reservado a rádio, seleção e recompensa. Variantes para texto: perigo #E2604F, Semente #5FD4B0, restauração #8FB066 (todas ≥4,5:1). A UI é mais limpa que o mundo. Serifada para títulos e voz; sem serifa para dados.

**Daltonismo.** Pares que falham:
- Protan/deutan: perigo × restauração (crítico), ferrugem × musgo, âmbar × oliva.
- Tritan: Semente × azul-vidro, âmbar × violeta.

Redundância:
- Ícone único de cada significado, testado em preto a 24 px.
- Luminância distinta: Semente > Aurora > perigo.
- Ritmo: perigo pulsa a 2 Hz, Semente a 0,5 Hz; a redução de movimento é respeitada.
- O antes/depois também muda luminância e forma, não só matiz.
- Combustível e dano sempre com número e ícone.

## 5. Character Design Direction

- **Dante, "o trabalhador que persiste":** jaqueta de lona, brim, calça de trabalho, botas, tudo gasto e remendado com cuidado. Sem tática, armadura ou arma: a armadura dele é o Titã. Boné ou lenço na cor dessaturada da pintura do Titã; graxa nas mãos e mangas. É visto de costas ~80% do tempo, então o traço distintivo fica nas costas (remendo retangular, alça da lanterna, silhueta do boné). Saturação ≤25%.
- **Distância de leitura:** longe (30–80 m) só silhueta, postura e grupo; média (10–30 m) soma bloco de cor e acessório; perto (<10 m) soma rosto, gesto e tecido. Cada tipo é reconhecível de longe, sem cor.

| Tipo | Postura | Marca |
|---|---|---|
| Aliado nomeado | aberta, olha para o jogador, ponto fixo | 1 peça-assinatura alta, sempre igual |
| Comerciante | atrás de balcão ou lona, mãos ocupadas | lamparina âmbar ao lado |
| Sobrevivente | curvado ou sentado, grupos de 2–4 perto do fogo | rosto coberto no devastado |
| Homens de Garcia | inclinados à frente, formação em V | marca de fuligem nas costas; nunca vermelho |
| Garcia/Brutus | imóvel no centro do grupo | único de casaco longo e ombreira grande; contraste por quietude |

- **Expressão sem animação facial (base MakeHuman CC0, provisória):** cabeça (inclinação, look-at ±60°, amortecimento de 0,4 s), ombros, mãos, orientação e distância. Diálogo em plano médio 3/4 com luz lateral; nunca close de rosto. 6–8 gestos reutilizáveis, no máximo 1 por fala. Idle com respiração e troca de apoio a cada 6–10 s, em fases diferentes. **Rostos cobertos no devastado e descobertos no restaurado (decidido).** Proibido: T-pose visível, simetria perfeita, interpenetração, pés flutuando.
- **LOD:** LOD0 a <10 m e Dante sempre; LOD1 de 10–30 m (~50%); LOD2 de 30–80 m (~20%, animação em taxa reduzida); oculto além de 80 m, com a presença passada por luz, fumaça e lona. Chapéu, mochila e ombreira ficam até o último LOD.

## 6. Environment Design Language

**Arquitetura e história.**
- Mar de Cinzas: polo industrial e logístico parado em 2027 (galpões, silos, pátios); Cinza Nova é uma comunidade instalada em galpões.
- Cidades Esqueleto: concreto armado sem revestimento; a vida migrou para térreos, subsolos e túneis.
- Leito Seco: porto, píeres e salinas virados para uma água que não existe; é isso que o faz ler como mar.
- Cordilheira Vítrea: engenharia de montanha (contenção, galerias, defensas, radar) sobre rocha vitrificada.
- Zonas de Tempestade: infraestrutura energética fundida, tudo inclinado para o epicentro.

**Textura.** Os 8 PBR locais são o vocabulário (tiling de 2–4 m). A cor de vértice faz a macrovariação (sujeira, poeira, umidade, altura), a custo zero de sampler, e é o canal do antes/depois. O decalque fica num único atlas futuro. Molhado = albedo −20 a −30% e roughness −0,2 a −0,4, por parâmetro. **Concreto = rocha com tint e cor de vértice, sem material novo (decidido, restrição técnica).**

**Densidade.**
| Área | Densidade |
|---|---|
| Estrada aberta | 1 aglomerado a cada 150–250 m, 1 marco a cada 400–600 m; nada a <3 m do meio-fio; o vazio é intencional |
| Cidade | 3–6 props por 100 m de rua; vão >15 m só com causa; entulho na base do que caiu |
| Comunidade | a mais alta, em volta de 1 centro (fogo, poço, rádio), caminhos livres de 1,5 m |
| Núcleo | anel de 30–50 m livre, props técnicos radiais; vegetação depois da ativação |
| Interior | média-alta, 1 vinheta por cômodo, passagem ≥1,2 m |

**Narrativa ambiental.** Uma vinheta = uma história legível em ≤3 s, por causa e consequência, nunca por texto; 1 vinheta forte por km; a restauração muda a vinheta; preferir ausência a corpo. Exemplos:
- Mar de Cinzas: fila de carros com portas abertas virados para a saída; guarita com marcas de contagem.
- Cidades: lonas e varais só nos andares baixos; escada de chapa ligando lajes vizinhas.
- Leito Seco: navio com a corrente da âncora sumindo na crosta; píer que termina no nada com régua de maré.
- Cordilheira: defensa rompida com caminhão no barranco; mirante voltado ao vale vitrificado.
- Tempestade: torres inclinadas para o epicentro; marcas de Garcia rareando até sumir.

**Kits procedurais** (em ordem de impacto por custo; B = baixo, M = médio). Os implementados em `src/game/world/biomeKits.js` estão marcados com ✔.
- Transversais: borda viva de estrada (B); postes com fiação caída (B); ocupação com lona, varal e horta (M); carro abandonado em 3 tipos (M).
- Mar de Cinzas: galpão com treliça exposta ✔ (B); tanques e silos ✔ (B); pórtico de tubulação (B); duna de cinza a sotavento (B); alambrado caído (B); chaminé ✔ (M).
- Cidades: torre em ruína ✔ (M); quarteirão contínuo (M); laje em panqueca (B); ocupação vertical (B); viaduto interrompido ✔ (M); boca de túnel (M).
- Leito Seco: crosta poligonal ✔ (B); linhas de maré e terraços (B); estacas de píer ✔ (B); casco encalhado com faixa de sal ✔ (M); boias, redes e contêiner (B); guindaste portuário (M).
- Cordilheira: face rochosa facetada e estratificada ✔ (M); muro de contenção (B); defensas amassadas (B); veios vitrificados ✔ (B); galeria contra queda de rocha (M); radar derretido (M).
- Tempestade: torres retorcidas ao vento ✔ (B); fulguritos ✔ (B); cicatrizes de plasma que somem com a restauração ✔ (B); veículos vitrificados (B); estruturas fundidas (M); subestação colapsada (M).

## 7. UI/HUD Visual Direction

**Camadas.** (1) Diegético: instrumentos, luzes do painel, rádio, faróis. (2) Espacial: marcador de interação em branco-giz. (3) Meta: minimapa como tela de GPS. (4) Tela: legenda, prompt, notificação, aviso crítico, menus. Na cabine, a tela não repete os instrumentos; a ponto de leitura não é garantida em 720p, por isso diesel, temperatura e sobrevivência **em alerta** sempre aparecem com número e ícone (UX).

**Layout (decidido; o UX prevalece sobre a arte no minimapa):**
- Topo esquerdo: objetivo compacto; o detalhe some em 8 s e volta ao mudar o objetivo ou com J.
- Topo centro: bússola; a legenda do rádio logo abaixo, no máximo 2 linhas.
- Topo direito: hora e botão **"Menu (Esc)"**, um hub com os 8 painéis e suas teclas. Os 8 botões permanentes saem. Até 3 atalhos contextuais ao lado: terminal → Fretes; parado ou oficina → Inspeção/Garagem; mensagem nova → Rádio; a pé → Inventário.
- Inferior direito: minimapa com âncora própria, **inclusive na cabine** (sobre o lado do passageiro). Se tocar a pista, primeiro reduzir para 160 px.
- Inferior esquerdo: na cabine, faixa curta (marcha e km/h; massa só com carga; motor só se desligado ou em falha). Fora da cabine: velocidade, marcha, RPM, diesel e temperatura.
- Por contexto: barras de sobrevivência só com hidratação/saciedade <60% ou fadiga >40%, por 6 s após comer, beber ou dormir, e na pausa; fixas abaixo de 25%. Diesel e temperatura na tela da cabine só em alerta. "F Descer" só abaixo de 3 km/h. Rótulo de câmera por 2 s após C.
- Status sem tecla nova (decidido): só gatilhos e o hub.

**Tipografia.** Serifada = voz e memória; sem serifa tabular = instrumento.
| Uso | Peso | 1080p | 720p |
|---|---|---|---|
| Título de menu | Serif 600 | 56 | 40 |
| Título de painel | Serif 600 | 30 | 22 |
| Legenda | Serif 500 | 24 | 18 |
| Nome de quem fala (#C9A35A, caixa-alta) | Sans 600 | 14 | 12 |
| Corpo | Sans 400 | 18 | 16 |
| Rótulo do HUD | Sans 500 | 14 | 12 |
| Número crítico | Sans tabular 600 | 32 | 24 |
| Prompt | Sans 500 | 18 | 16 |
Piso: 14 px a 720p para texto do HUD (UX; hoje há 10 px na cabine). Legendas com ≤60 caracteres por linha, placa de fundo, tempo mínimo de 1,5 s + ~1 s a cada 15 caracteres.

**Contraste (UX).** Texto ≥4,5:1 e ícones ≥3:1 contra o pior fundo (céu do Leito Seco). Painéis de alerta com opacidade ≥92%. Foco com anel de 2 px #E9E2D0 e 2 px de afastamento; Esc fecha e devolve o foco.

**Iconografia.** Status: linha de 2 px na grade de 24 px, monocromático #E9E2D0, cor só para estado, formas da §4. Itens: estêncil sólido (decidido). Tecla: quadrado chanfrado.

**Animação.** Hover 120 ms; abrir 200 ms; fechar 140 ms; prompt 150 ms (+100 ms de atraso); notificação 250/3–4 s/300 ms. Easing de entrada `cubic-bezier(0.2,0,0,1)`, de saída `cubic-bezier(0.4,0,1,1)`, sem bounce. Só opacidade + translação ≤8 px. Nunca animar valores críticos nem a posição de elementos fixos. A redução de movimento troca translação por opacidade e desliga pulsos e jitter; deve ligar sozinha com `prefers-reduced-motion`.

## 8. Asset Standards

**Formatos e nomes (arte).** glTF 2.0 binário (Y-up, metros, pivô na base, frente +Z, sem câmeras e luzes, materiais por função, OPAQUE por padrão, MASK para recorte, BLEND só para vidro real — lição da 0.8.1). Texturas em potência de 2 (albedo/emissivo sRGB, normal OpenGL, ORM R=AO G=rough B=metal). UI em SVG e WOFF2. Nomes `[categoria]_[nome]_[variante]_[tamanho]`, com códigos de bioma mc/ce/ls/cv/zt/tr; kit em código `kit_ce_torre-ruina`. Assets existentes não são renomeados. Todo asset externo registra fonte, autor, licença e alterações; CC BY e CC BY-NC preservados.

**Emenda de 09/11/2026 (decisão delegada pelo criador):** no perfil **Alto**, os 8 PBR tileáveis locais continuam em 2048 px. O Alto é opcional e voltado a GPUs dedicadas; Baixo e Médio seguem em 512 e 1024. Os demais tetos de textura de §8 valem para assets novos.

**Orçamento técnico (prevalece; números são tetos propostos, sem medição em GPU real):**
| Acréscimo da vestimenta | Baixo | Médio | Alto |
|---|---|---|---|
| Draw calls por setor visível | ≤4 | ≤6 | ≤8 |
| Draw calls por quadro, cor | ≤10 | ≤18 | ≤26 |
| Draw calls por quadro, sombra | 0 | ≤4 | ≤6 |
| Triângulos por setor (LOD0) | 12 mil | 25 mil | 40 mil |
| Triângulos por quadro | 40 mil | 90 mil | 150 mil |
| Geometria por setor | ≤0,6 MB | ≤1,2 MB | ≤2 MB |

- Geometria mesclada com ≤65.535 vértices (índice Uint16).
- No máximo 3–4 materiais de kit por setor; nenhuma textura nova; nenhum sampler novo no terreno; ≤24 colliders por setor.
- Instancing para kits repetidos ≥6 vezes por setor; peças únicas mescladas por setor e material.
- LOD0 até 120 m; LOD1 (silhueta, ≤25% dos triângulos) até `preset.distance`; corte em 1,25× essa distância.
- Sombras: desligadas no Baixo; só verticais altas a <60 m da pista projetam.
- CPU: ≤2 ms por quadro na montagem, com protótipos em cache e semente fixa.
- Colliders: cuboide ou cilindro fixo, densidade 0, nunca trimesh aberto, nunca dentro de `roadReserved` ou das reservas de terminais e vegetação.
- Materiais de kit registrados no mapa de materiais com `dataMapsFrom` (rocha ou ferrugem), para acompanhar Baixo/Alto/Baixo sem upload novo.

**Conflitos resolvidos (padrão restrito):**
- Ruptura de silhueta a cada 12 m: só no LOD0; no LOD1, só no topo.
- 4 variantes sem repetir a 30 m: 4 protótipos + rotação, espelhamento e cor; só vale a pé.
- Chanfro: só no LOD0 e nas quinas de silhueta.
- Sem concreto PBR novo e sem transparência.

## 9. Reference Direction

Nenhuma referência entra literal; cada uma resolve um único problema.

| Referência | Tomar | Evitar |
|---|---|---|
| Pacific Drive (jogo) | desgaste acumulado na máquina; painel como única luz quente à noite | anomalias sci-fi, neon, rótulos flutuando |
| The Last of Us (jogo) | vegetação nascendo de fissuras, pés de parede e vãos; feixes em interiores | verde saturado uniforme, fungo e horror, marcos reais reconhecíveis |
| Marchand & Meffre, *The Ruins of Detroit* (fotografia) | luz difusa e cor natural sem gradação dramática; umidade, gesso caindo e ferrugem com causa (cor de vértice e decalque, sem material novo) | ornamento art déco, simetria frontal perfeita |
| Fotografia documental do Mar de Aral, Moynaq | cascos enferrujados sobre chão salino; a costa antiga como linha no horizonte; ferrugem contra sal-osso | barcos enfileirados como cenário turístico; areia de deserto comum sem crosta |
| *Stalker*, Tarkovsky, 1979 (filme) | água parada, musgo sobre ferrugem e concreto, quadros longos e pacientes (estado restaurado) | viragem sépia como filtro, tom místico |

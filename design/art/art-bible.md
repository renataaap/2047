# Art Bible: 2047 — Rede Aurora

> **Status**: Draft (modo autônomo, aprovação registrada por seção)
> **Owned By**: art-director
> **Last Updated**: 2026-11-08
> **Art Director Sign-Off (AD-ART-BIBLE)**: [Not yet reviewed]

`/art-bible` writes these nine sections in this order and replaces each
section's `[To be designed]` line as that section is approved. A section still
holding its placeholder is incomplete; a later run fills only those.

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

[To be designed] — the player character's visual archetype, how players tell
enemies, NPCs and allies apart at a glance, expression and pose style, and how
much detail survives at game camera distance (LOD philosophy).

## 6. Environment Design Language

[To be designed] — architectural style and its tie to the world's culture,
texture philosophy (painted, PBR or stylised, and why), prop density rules per
area type, and environmental storytelling guidelines.

## 7. UI/HUD Visual Direction

[To be designed] — diegetic versus screen-space HUD, typography (personality,
weight, size hierarchy, minimum readable size), iconography style, UI animation
feel, and any art-direction versus readability conflict and how it was decided.

## 8. Asset Standards

[To be designed] — file formats, naming convention, texture resolution tiers,
LOD levels, export settings, and the engine's hard limits (poly budgets per
asset category, texture memory, material slots). Where an art preference and a
technical limit disagree, record both and the trade-off chosen.

## 9. Reference Direction

[To be designed] — 3–5 references (games, films, art styles or artists). For
each: the specific element to take from it, and what to avoid so the result
does not read as a copy.

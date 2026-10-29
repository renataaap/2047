# Como continuar as texturas — Windows e Claude

## O que falta

O projeto 0.5.1 tem o carregador e os scripts, mas **zero materiais Poly Haven instalados**. Os três carros usam texturas próprias e não contam como Poly Haven. O ZIP do kit inicial contém somente texto/catálogo/script.

Os pacotes 4K enviados anteriormente não puderam ser transferidos: ultrapassavam 32 MiB, limite da ferramenta do ambiente anterior. A API também foi bloqueada por HTTP 403. O usuário não consegue alterar essa configuração. Claude deve testar seu próprio ambiente; estes impedimentos não são necessariamente iguais lá.

Os anexos brutos desta conversa não estarão automaticamente disponíveis no Claude ou no GitHub. É preciso fornecer os arquivos ao ambiente novo ou baixá-los novamente. Não basta passar os nomes dos ZIPs.

## Caminho A — baixar diretamente no Windows

1. Obter o projeto em https://github.com/renataaap/2047, autenticado na conta que tem acesso. Usar o checkout atual ou extrair uma cópia do código. Para clone novo:

```powershell
git clone https://github.com/renataaap/2047.git
cd 2047
npm ci
```

2. Instalar Node.js LTS 24, se necessário. Na pasta do projeto, abrir **BAIXAR_TEXTURAS.bat**. Ele executa o downloader existente para os 24 materiais em 2K e prepara versões menores para o navegador.

Alternativa no terminal, começando pelos oito prioritários:

```powershell
npm run assets:polyhaven -- --resolution=2k --ids=road_damaged_2,gravel_road,mud_cracked_dry_03,dirt,rocky_terrain_03,rusty_metal_05,rust_coarse_01,corrugated_iron
```

Depois, se desejado, completar os 24:

```powershell
npm run assets:polyhaven -- --resolution=2k --all
```

3. Ler a saída e `public/assets/polyhaven/instalacao.json`. O script deve consultar `/info/{id}` e `/files/{id}` e baixar somente URLs retornadas pela API. IDs inválidos, indisponibilidade e falhas precisam ser registrados. `--refresh` revisita a API; normalmente o cache válido é preservado.
4. Conferir `public/assets/polyhaven/manifest.json`: deve conter entradas instaladas com caminhos locais para os mapas. Se continuar vazio, o download não concluiu; não afirmar que está instalado.
5. Reabrir o jogo e verificar aplicação visual. Se este for o primeiro uso do projeto:

```powershell
npm run db:migrate
npm run dev
```

Abrir `http://localhost:3000` no Windows que está executando o servidor. Se o jogo já estava aberto, fechar o servidor antigo antes de iniciar outro. Preservar banco e navegador para não perder o acesso às partidas existentes.

## Caminho B — usar os ZIPs que você já baixou

Extrair os arquivos numa pasta **fora** de `public/assets/polyhaven`, por exemplo `C:\Texturas Aurora`. Preservar o ID do material na pasta ou no nome das imagens. Um conjunto mínimo:

```text
C:/Texturas Aurora/
  asphalt_02/
    asphalt_02_diff_2k.jpg
    asphalt_02_nor_gl_2k.jpg
    asphalt_02_rough_2k.jpg
```

Se houver ARM, usar o mapa ARM no lugar dos mapas separados de roughness/AO/metalness. Não renomear Normal DirectX para nor_gl. O importer exige nomes inequívocos de normal OpenGL.

```powershell
npm run assets:import -- --from="C:/Texturas Aurora" --resolution=2k
```

O importer aceita PNG/JPEG, valida os dados, reconhece IDs do catálogo, reduz imagens 4K ao orçamento solicitado e preserva a entrada original. Gera mapas/variantes/manifests no diretório público; resultados em `importacao.json`. O `.blend` sozinho não é imagem que o Three.js consiga carregar. Se as imagens estiverem empacotadas somente dentro dele, Claude deverá extraí-las no Blender com execução automática desabilitada e depois conferir os mapas; essa extração não foi feita nos ZIPs que não puderam ser abertos aqui.

Não são necessários para a primeira passagem: Blender, normal DirectX, height 16K ou todos os formatos duplicados. Priorizar cor + normal GL + roughness ou ARM. AO e metalness separados são usados quando disponíveis e apropriados.

## Caminho C — enviar arquivos ao Claude

Verificar primeiro os limites reais da interface escolhida. Se não aceitar os ZIPs grandes:

- Enviar somente imagens 1K/2K, em pacotes pequenos identificados por material; ou
- Usar 7-Zip no Windows: botão direito no ZIP existente → 7-Zip → Adicionar ao arquivo → formato 7z → “Dividir em volumes, bytes”: `25M`. Enviar **todas** as partes `.7z.001`, `.7z.002` etc. Manter nomes/ordem. A extração começa pela parte `.001`, com todas as partes na mesma pasta. Não extrair uma parte isolada; ou
- Dar ao ambiente de desenvolvimento acesso a uma pasta local contendo os arquivos extraídos.

Dividir arquivos é uma alternativa ao limite da transferência anterior; não exige baixar novamente os originais 4K. Para modelos grandes, modelo/BIN e texturas podem ser enviados separadamente, preservando as referências relativas.

## Prioridade dos materiais

Oito primeiros: road_damaged_2 (rodovia), gravel_road (acostamentos), mud_cracked_dry_03 e dirt (solo), rocky_terrain_03 (rocha), rusty_metal_05 e rust_coarse_01 (corrosão adequada), corrugated_iron (telhados).

Os 16 complementares estão em `materiais_2047.json`: asphalt_02, asphalt_pit_lane, cracked_concrete_02, damaged_concrete_floor_02, broken_brick_wall, rebar_reinforced_concrete, painted_metal_shutter, container_side, garage_floor, wood_peeling_paint_weathered, worn_planks, brown_leather, withered_grass, sparse_grass, leafy_grass, sand_01.

## Trabalho que o Claude ainda precisa fazer após importar

1. Conferir as imagens e o manifesto, sem tratar nomes como prova de download oficial. Conferir erros de importação e materiais incompletos.
2. Revisar `src/game/render/PBRLibrary.js`: MATERIAL_ROLES escolhe materiais por função/prioridade. Nem todos os IDs já têm atribuição própria; uma alternativa de asfalto instalada pode não ser usada se outra vier antes. Mapear cada uso necessário e verificar as malhas em World/CampaignWorld/ExpeditionWorld e modelo da cabine.
3. Configurar base color sRGB; normal/roughness/AO/metalness em NoColorSpace. ARM: R=AO, G=roughness, B=metalness. A versão atual usa `texture.channel=0` para os UVs primários; verificar a API instalada antes de inventar necessidade de uv2.
4. Conferir a escala em metros. API fornece dimensions em milímetros; import offline adota 2×2 m provisórios. Ajustar conforme o material real. Não cobrir toda a cabine com ferrugem genérica nem substituir mapas próprios de NPCs/carros.
5. Verificar TerrainBlend com dirt/rocha/gravel/solo rachado completos. Foi testado com fixtures, não com as imagens Poly Haven reais. Reavaliar transições, repetição e desempenho. Integrar areia/vegetação/restauração onde ainda não houver uso. Vegetação verde fica reservada à restauração.
6. Manter visual e física correspondentes: height/displacement não pode criar relevos sem colisão equivalente. Preservar as correções do terreno/rodovia e a saída F.
7. Rodar testes/build, inspecionar console/rede e tirar screenshots do jogo real antes/depois. Conferir perfis Baixo/Médio/Alto e liberação de memória. Não afirmar qualidade final apenas porque o shader compilou.
8. Atualizar catálogo/status/auditoria com quais materiais estão baixados, importados, aplicados e visualmente verificados. Jogo deve usar arquivos locais durante a sessão, sem depender da API externa.

Ferramentas existentes: scripts/baixar-polyhaven.mjs, scripts/importar-polyhaven.mjs, scripts/lib/polyhaven.mjs, scripts/lib/prepare-textures.mjs, AssetManager.js, PBRLibrary.js, TerrainBlend.js. A preparação usa Sharp 0.35.5; perfis até 512 px/1K/2K conforme o tipo do mapa. Não presumir Draco/KTX2/HDRI instalados.

Origem/créditos: https://polyhaven.com; API/documentação/termos em https://github.com/Poly-Haven/Public-API. Preservar a identificação do aplicativo nas requisições e o crédito “Powered by Poly Haven”, conforme o uso da API. Conferir termos atuais se houver mudança no modo de uso.

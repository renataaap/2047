# Integração de assets — 0.5.1

O objetivo continua sendo a reformulação realista. Esta é uma etapa **parcial**, com integração de três carros abandonados e preparação dos materiais/modelos; não encerra a Fase 2. O catálogo completo, com estados e fontes, está em [CATALOGO_ASSETS.json](CATALOGO_ASSETS.json).

## Recebimento e limites

Dos 20 ZIPs enviados em 29/10/2026, três puderam ser transferidos: personagens, caminhão Saia e carros Renafox. Os outros 17 excederam **32 MiB por arquivo**, limite da ferramenta de transferência. Não foi possível abrir seus binários. Não confundir recebimento da mensagem com instalação do asset. `evidence/assets-integration/upload-transfer.json` registra cada resultado.

O kit inicial só contém catálogo/script/instruções, preservados sem execução cega em `docs/asset-kit`. O script revisado consultou a API oficial; o proxy bloqueou o domínio. Há logs reais em `polyhaven-download.log` e `network-policy.log`. O manifesto Poly Haven continua vazio: **zero materiais desse catálogo instalados**.

Para reenviar, prefira mapas 1K/2K de cor, normal **OpenGL** e ARM ou roughness, em ZIPs abaixo de 32 MiB, organizados por ID. Height/Normal DirectX/Blend não são necessários para essa primeira passagem. Outra opção é dividir um ZIP já baixado em volumes de **25 MB** com 7-Zip e enviar todas as partes; assim os originais 4K podem ser preparados aqui. Para um modelo grande, modelo/BIN e imagens também podem vir separados, preservando nomes e caminhos.

## Texturas baixadas no Windows

Após atualizar o projeto e instalar Node.js (LTS 24 recomendado), abra `BAIXAR_TEXTURAS.bat`. Ele instala dependências se necessário e executa o downloader dos 24 materiais. Não baixe arquivos a partir de URLs deduzidas: o script utiliza somente as URLs retornadas em `/files/{id}`.

```bash
npm ci
npm run assets:polyhaven -- --all --resolution=2k
# Ou primeiro os oito materiais originais:
npm run assets:polyhaven -- --ids=road_damaged_2,gravel_road,mud_cracked_dry_03,dirt,rocky_terrain_03,rusty_metal_05,rust_coarse_01,corrugated_iron
# Imagens já baixadas, extraídas em uma pasta fora do destino:
npm run assets:import -- --from="C:/Texturas Aurora" --resolution=2k
```

Em um executor Node 24 com proxy herdado, execute `node --use-env-proxy scripts/baixar-polyhaven.mjs ...`. Não altere o proxy para contornar um bloqueio de destino. Não foi necessário adicionar credenciais.

Downloader: verifica `/info` e `/files`; escolhe normal GL; respeita resolução; verifica assinatura/dimensões, tamanho e MD5 quando fornecidos; usa SHA-256 no cache; escreve atomicamente e só publica materiais completos. Falhas não apagam uma instalação anterior válida. `--refresh` revisita a API; `--height` preserva height na preparação, sem aplicar deslocamento visual incompatível com o chão físico. Manifesto e relatório ficam em `public/assets/polyhaven`.

Importer: aceita PNG/JPEG em pastas identificadas pelos IDs do catálogo. Lê dados, sem executar código do pacote. Reduz fontes 4K ao orçamento solicitado e registra hashes/dimensões de origem; os originais de entrada são preservados. Não supõe normal GL apenas pelo nome genérico `normal`: use `nor_gl`/`normal_gl` no nome ou preserve os nomes originais Poly Haven.

Sharp é uma dependência **de preparação**, agora declarada explicitamente, na mesma versão 0.35.5 já trazida pelo Next. Gera PNGs sem perda nos perfis: Baixo até 512 px; Médio até 1K; Alto com cor até 2K e mapas numéricos até 1K. ARM mantém R=AO, G=roughness, B=metalness. Não aplica correção de gamma aos mapas numéricos.

## Carregamento no jogo

`AssetManager` restringe URLs ao diretório local `/assets`, compartilha recursos, clona esqueletos, controla referências e libera geometrias/texturas/esqueletos. Meshopt é suportado pelo addon oficial. Draco/KTX2 ainda exigem preparação/decodificadores locais específicos; não foram anunciados como instalados.

`PBRLibrary` configura `MeshStandardMaterial`: cor sRGB; dados em NoColorSpace; normal GL; canal G de roughness, B de metalness e R de AO; `texture.channel=0` usa os UVs primários nesta versão do Three, sem depender de um `uv2` ausente. Escala vem de `dimensions` em milímetros da API, ou usa 2 m provisórios no import offline, a conferir visualmente. Usa anisotropia limitada, cache e troca/liberação de resoluções entre perfis. Materiais próprios de modelos glTF são preservados.

Solo/estradas usam UVs em metros. A mistura de terra, rocha, cascalho e solo rachado varia por inclinação, altura, proximidade da estrada e ruído amplo; mistura cor, normal e roughness. Só é habilitada com os mapas necessários completos. **Compilada e verificada com fixtures originais; a aparência com Poly Haven real ainda não foi verificada.** AO dos detalhes e splats de restauração continuam a refinar. O terreno físico e visual usa a mesma geometria; não há displacement cosmético aplicado sobre colisão plana.

A malha central ganhou faixas de aproximadamente 2 m junto às rotas e amostras longitudinais de 8 m, evitando a interpolação do chão grosseiro sobre o asfalto. As bordas conectam com setores externos. Acostamentos têm geometria/colisões e aderência de cascalho. Os setores continuam 3×3. Reflexos de ambiente do céu procedural usam PMREM no **Alto**; Baixo/Médio evitam seu custo, após medição em SwiftShader. Não é um HDRI baixado.

## Modelos reais e licenças

| Asset | Formato verificado | Estado | Uso |
| --- | --- | --- | --- |
| GAZ-52 Half-Life 2 / Renafox | Arquivo não disponível | Loja/termos e direitos pendentes | Referência, não integrado |
| LP 608 / Max | ZIP acima do limite | Binário não aberto; índice público mostra CC BY e descrição pede aviso | Caminhão intermediário pendente |
| Peterbilt 359 | Arquivo não disponível | Licença/autor/estrutura não confirmados | Remoção de toras pendente |
| Saia / Ehsan Abbasi | glTF, BIN, imagens; 1.970.772 triângulos | CC BY-ND; não adaptado nem distribuído | Fora da substituição do Titã |
| City People Free Samples / Denys Almaral | 11 glTF rigados, BIN, PNG e 28 arquivos de animação | Inspecionado; ZIP não inclui licença e usuário não encontrou os termos | Nenhum personagem distribuído/integrado |
| Post-Apoc Civilian Cars / Renafox | glTF convertido em três GLB | Integrado; CC BY-NC 4.0 | Carros abandonados com colisões |
| Poly Haven | ZIPs 4K acima do limite; API bloqueada | Nenhum material instalado | Integração de imagens aguarda arquivos |

Os carros têm 1.516/1.382/1.466 triângulos, texturas próprias de até 1K, dimensões em metros e caixas físicas orientadas. Quatro locais escolhidos deixam a via e pontos de missão livres. Recursos carregam por proximidade e são liberados ao sair da região. A licença está em `public/assets/models/environments/renafox-cars/LICENSE.txt`, com origem/alterações no manifesto. Uso **não comercial** nesta versão de desenvolvimento; essa restrição não muda a licença do código próprio. Uma distribuição comercial precisa substituir esses assets ou obter autorização compatível.

`prepare-cars.py` reproduz a preparação com Blender 4.3.2 e `--disable-autoexec`; não executa scripts recebidos. Remove o plano de sombra da apresentação, separa os três modelos, normaliza posição/escala e limita imagens. Binaries dos personagens/Saia não foram adicionados ao Git.

`TruckVisual` valida crédito/origem/licença registrada, orçamento, escala e seis pivôs compatíveis com o chassi atual antes de trocar o exterior. As rodas são dirigidas pelos raycasts, sem alterar o corpo físico. Pode remover nós explicitamente identificados de uma carga, respeitados os direitos. A cabine atual permanece provisória. **Não adapta automaticamente GAZ/LP de quatro rodas**: layout, massa, torque e colisores precisam ser medidos/refatorados quando o arquivo utilizável chegar. Não há seleção fictícia de três veículos idênticos.

`CharacterActor` carrega esqueleto e clips identificados, usa AnimationMixer, transições idle/walk, orientação ao jogador e limitação de atualização à distância, ancorado no colisor existente. O movimento de NPCs/rotas de caminhada reais, retargeting do pacote recebido e distribuição dos personagens dependem das etapas seguintes. A integração foi exercitada com um rig original de diagnóstico; isso não equivale a ter integrado o pacote Fab. O pacote é estilizado, com paleta 256×256, e não será apresentado como personagem realista final.

Para inspecionar um arquivo próprio: `npm run assets:inspect -- caminho/modelo.glb`. O relatório lista nós, malhas, triângulos, skins, clips e dependências, sem carregar URLs externas.

## Continuidade de Titã e progressão

Proposta narrativa: **Titã Rocha Clara** é a identidade do conjunto de transporte Aurora e do berço da Semente, preservados ao adaptar bases mecânicas sucessivas. GAZ inicia a jornada; LP amplia a capacidade; Peterbilt representa a etapa avançada. Esta proposta não foi inserida antecipadamente em missões/finais.

A progressão mecânica e seus valores ainda não foram implementados; exigem os modelos autorizados e medidas reais. O motor/câmbio/massa/saves da 0.5.0 continuam operantes. Os quatro finais e a identidade da Voz não foram expostos no jogo.

## Fontes consultadas

- [Poly Haven API e documentação](https://github.com/Poly-Haven/Public-API), [termos da API](https://github.com/Poly-Haven/Public-API/blob/master/ToS.md).
- [Pacote City People](https://www.fab.com/listings/8fece26a-d452-4b1d-8042-baf95c527154), [site do autor](https://denysalmaral.com/), [licença Standard Fab](https://www.fab.com/eula). A licença geral não comprova qual licença foi adquirida para um arquivo particular.
- Os seis recursos de terreno Fab do pedido foram abertos: Rippled Sand (texture set/glTF), 20 Heightmaps (Unreal/PNG descritos), Desert Valley (Unreal/Unity), Terrain Textures (Unity), Bald Cypress (Unreal) e StampIT (Unreal/PNG 16-bit). Não foram carregados formatos proprietários no Three. A biblioteca/adquisição e os arquivos de textura/heightmap são necessários para converter quando permitido.
- [GAZ alternativo pesquisado](https://sketchfab.com/3d-models/gaz-52-truck-old-version-1321d97f84024db4b9cac9e6ff9b6381), por trivial.cat: candidato, não incorporado; o índice mostra Free Standard/NoAI e cerca de 112,2 mil triângulos. Termos completos e arquivo ainda pendentes.
- [Three MeshStandardMaterial](https://threejs.org/docs/pages/MeshStandardMaterial.html), [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html), [AnimationMixer](https://threejs.org/docs/pages/AnimationMixer.html), [Sharp resize](https://sharp.pixelplumbing.com/api-resize/). Shaders e APIs foram conferidos na versão instalada.

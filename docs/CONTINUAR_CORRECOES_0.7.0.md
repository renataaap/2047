> Registro histórico da 0.7.0. A expansão atual é descrita em [RELATORIO_EXPANSAO_0.8.0.md](../RELATORIO_EXPANSAO_0.8.0.md) e [RETOMAR_0.8.0.md](RETOMAR_0.8.0.md). Não reaplicar estas tarefas como uma nova implementação.

# Continuar o projeto — versão 0.7.0 publicada

Repositório de trabalho: /workspace/work/2047-rede-aurora. Branch: feat/tutorial-assets. Ler AGENTS.md, STATUS_DO_PROJETO.md e RELATORIO_CORRECOES_CRITICAS.md antes de editar. Preservar o checkpoint v0.6.0 e o tutorial existente.

## Publicação e acesso

Publicado no repositório pessoal privado **renataaap/2047**, branch **feat/tutorial-assets**:
https://github.com/renataaap/2047/tree/feat/tutorial-assets

Código, histórico, relatórios, assets e tags v0.6.0/v0.7.0 foram enviados por Git normal e os refs remotos conferidos. A conta renataaap foi escolhida anteriormente pelo usuário; o novo pedido para enviar ao próprio Git foi atendido nesse destino, com acesso de administrador. A tag v0.7.0 aponta para 07ae390; a branch inclui também as instruções atualizadas de publicação.

Entrar como renataaap para acessar. Um 404 sem essa conta pode ser apenas a privacidade do repositório. Para clonar com histórico, usar Git autenticado:

```sh
git clone --branch feat/tutorial-assets https://github.com/renataaap/2047.git
cd 2047
```

Para baixar ZIP, abrir o link da branch acima e selecionar Code → Download ZIP. Conferir 0.7.0 no menu. Não usar o conteúdo de uma branch antiga por engano.

O outro destino, Da-Hora-stack/2047 (público), continua recusando a conexão com 403. A autorização de conteúdo já foi dada e não precisa ser repetida; aquele envio depende de acesso de escrita da conexão/instalação ao repositório. O push para o próprio repositório privado foi aceito com o acesso legítimo da conta. Não fazer force push em main.

O bundle incremental exportado anteriormente continua recuperando o checkpoint 07ae390 sobre a base oficial a8a8802, mas a branch privada agora pode ser clonada diretamente. GitHub e bundle não sincronizam partidas do banco local.

## Desenvolvimento local / Windows

Depois de obter uma cópia completa desta branch, instalar Node.js LTS compatível (22.13 ou superior), entrar na pasta que contém package.json e executar:

```sh
npm ci
npm run dev
```

Abrir http://localhost:3000 **no mesmo computador em que esse comando está rodando**. Localhost do ambiente remoto não é o localhost do Windows. No celular é possível continuar esta conversa/projeto pela conta; o jogo continua com controles desktop, sem controles de toque.

## Materiais: continuar sem baixar tudo de novo

Os oito materiais Poly Haven já existem em public/assets/polyhaven e estão aplicados: road_damaged_2, gravel_road, mud_cracked_dry_03, dirt, rocky_terrain_03, rusty_metal_05, rust_coarse_01, corrugated_iron. Não substituir o manifesto atual pelo manifesto vazio histórico de 0.5.1. Não confundir nomes no código com presença física: conferir os arquivos, hashes e o painel de diagnóstico.

Regerar/validar perfis com:

```sh
node scripts/preparar-texturas-locais.mjs
npm test
```

O script é idempotente; preserva originais e corrige os ARM de gravel_road/corrugated_iron. Dados não usam sRGB; diffuse usa. Baixo usa 512, Médio 1024 e Alto cor até 2048/dados até 1024. Manter escala métrica de UVs e mapas normais OpenGL. Não ligar um ARM incompatível diretamente nos três canais.

A rede daqui continua bloqueando a API/CDN Poly Haven e o usuário já informou que não pode alterar essa configuração. Para novos materiais, usar os ZIPs locais enviados/importador existente ou executar o downloader em uma máquina com acesso normal. Não inventar URLs nem declarar downloads que não ocorreram. Oito materiais atuais vieram do snapshot oficial, não de um download novo nesta etapa.

## Personagens

public/assets/models/aurora-workers/worker.glb é um asset provisório CC0 derivado da base anatômica MakeHuman. Fontes/licenças em assets-source/characters; script Blender em scripts/preparar-personagens.py; manifesto registra idle/walk/run/interact/repair/enter/exit, escala e inPlace. Reproduzir com Blender 4.3.2:

```sh
blender -b --python scripts/preparar-personagens.py
```

Para substituir por arte final, fornecer um GLB licenciado/distribuível, Y para cima, frente +Z, altura 1,3–2,2 m, skeleton, clips in-place com nomes mapeados no manifesto e direitos/origem/créditos explícitos. Não incorporar automaticamente City People/Fab: a licença desse pacote permanece desconhecida. Não usar o Soldier/Mixamo como se tivesse a licença MIT do código do Three.js.

Dante segue o Player/Rapier; NPCs seguem os anchors existentes, com cache por asset e descarregamento de instâncias. Modelos compartilham geometria/texturas; paletas usam materiais próprios. Não transformar root motion em segunda movimentação física. Entrada/saída ainda precisam de uma animação de escalada/assento bem produzida; os clips atuais são gestos básicos.

## Próximos trabalhos

Finalizar arte de Dante e identidades individuais; acabamento do Mar de Cinzas, ciclo solar e áudio; navegação geral por rede; progressão de caminhões; narrativa/decisões e quatro finais. A auditoria de seis fases lista o que realmente funciona. Não marcar o jogo inteiro terminado por haver sete Núcleos testados.

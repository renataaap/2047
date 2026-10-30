# Continuar o projeto — entrega local 0.7.0

Repositório de trabalho: /workspace/work/2047-rede-aurora. Branch: feat/tutorial-assets. Ler AGENTS.md, STATUS_DO_PROJETO.md e RELATORIO_CORRECOES_CRITICAS.md antes de editar. Preservar o checkpoint v0.6.0 e o tutorial existente.

## Publicação

O destino é https://github.com/Da-Hora-stack/2047, público. O usuário autorizou explicitamente publicar código, histórico Git, relatórios e assets nesse repositório. **Não falta autorização do usuário e não é preciso pedi-la novamente.** O bloqueio antigo de revisão foi seguido de uma nova tentativa autorizada: Git retornou 403, Permission denied to renataaap; a gravação normal pelo aplicativo retornou 403, Resource not accessible by integration. Nenhuma branch/tag foi enviada.

A conexão reconhece o usuário como colaborador com push, mas a integração não recebeu acesso suficiente ao repositório do proprietário Da-Hora-stack. As instalações visíveis são de renataaap e isaquefm; Da-Hora-stack não aparece. O proprietário deve configurar a instalação/conexão GitHub para incluir 2047 e permitir escrita de conteúdo, ou fornecer uma conexão Git normal com acesso de escrita. Não tentar contornar o 403 com outra conta sem permissão.

Depois de corrigir o acesso, no repositório local completo:

```sh
git push --atomic official HEAD:refs/heads/feat/tutorial-assets refs/tags/v0.6.0 refs/tags/v0.7.0
```

Usar autenticação normal configurada para a conta com acesso; não inserir tokens em comandos/relatórios. Confirmar branch e tags remotas antes de afirmar que a versão foi publicada. Não fazer force push em main.

Enquanto isso, os commits e assets estão preservados neste workspace. Não apresentar um comando clone da branch como se ela já existisse no GitHub. O pacote de continuidade exportado contém um Git bundle incremental e instruções para recuperar esta branch sobre o snapshot oficial a8a8802. O bundle preserva os SHAs e o histórico da branch, mas precisa dessa base pública. GitHub e o bundle não sincronizam as partidas salvas no banco local.

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

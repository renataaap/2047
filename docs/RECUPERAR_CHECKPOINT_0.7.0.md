# Acessar a versão 0.7.0 em outro computador

A versão foi publicada no repositório pessoal privado:
https://github.com/renataaap/2047/tree/feat/tutorial-assets

Entrar como **renataaap** e selecionar **feat/tutorial-assets**. Código, histórico, relatórios, assets e tags v0.6.0/v0.7.0 estão no GitHub; a tag v0.7.0 corresponde ao commit 07ae390. A branch inclui também as instruções atualizadas de acesso. Sem a conta correta, um repositório privado pode aparecer como 404.

## Windows com Git

Instalar Git para Windows e Node.js LTS compatível (22.13 ou superior). Com o Git autenticado na conta renataaap:

```sh
git clone --branch feat/tutorial-assets https://github.com/renataaap/2047.git
cd 2047
npm ci
npm run dev
```

Abrir http://localhost:3000 nesse computador e manter o terminal aberto. Conferir 0.7.0 no menu. Também é possível baixar Code → Download ZIP no link da branch, extrair tudo e usar INICIAR_JOGO.bat. O clone/instalação precisa de Internet; o jogo utiliza as texturas/modelos locais.

Para continuar pelo celular, abrir esta mesma conversa/conta e compartilhar com o próximo agente docs/RETOMAR_AGORA.md, STATUS_DO_PROJETO.md e RELATORIO_CORRECOES_CRITICAS.md da branch publicada. O jogo mantém controles de desktop.

GitHub não sincroniza partidas: preservar separadamente local.db e seus arquivos auxiliares, com o servidor parado e cópia de segurança. A identidade do navegador também é necessária para acessar os slots antigos; a versão não tem login/sincronização de jogador entre computadores.

## Backup incremental anterior à publicação

O pacote exportado com 2047-rede-aurora-0.7.0.bundle preserva o checkpoint 07ae390 com os SHAs originais. Ele é incremental e requer a base pública a8a8802f88c1eb373c7133e799d16cde0a8c450f de Da-Hora-stack/2047. Não é um ZIP autossuficiente nem contém banco local, credenciais ou node_modules.

Se precisar recuperar esse snapshot pelo bundle, extrair o pacote e executar na pasta dele:

```sh
git clone https://github.com/Da-Hora-stack/2047.git projeto
cd projeto
git bundle verify ../2047-rede-aurora-0.7.0.bundle
git fetch ../2047-rede-aurora-0.7.0.bundle refs/heads/feat/tutorial-assets:refs/heads/feat/tutorial-assets refs/tags/v0.6.0:refs/tags/v0.6.0 refs/tags/v0.7.0:refs/tags/v0.7.0
git switch feat/tutorial-assets
npm ci
npm run dev
```

O backup foi restaurado em repositório separado contendo apenas a base oficial e o bundle. Commits, árvore e tags coincidiram, e git fsck passou. A aplicação foi testada em Linux/Chromium; os passos no Windows e os controles em GPU real ainda exigem verificação humana.

Nessa recuperação alternativa, origin aponta para a base pública; no clone direto recomendado, origin aponta para renataaap/2047. Não confundir os destinos nem usar force push. O envio a Da-Hora-stack/2047 continua bloqueado por 403; sua autorização de conteúdo está concedida, mas a conexão precisa de acesso de escrita naquele repositório.

Texturas/personagens: docs/CONTINUAR_CORRECOES_0.7.0.md. Os personagens são provisórios, os oito PBR são reais e as seis fases ainda têm pendências na auditoria.

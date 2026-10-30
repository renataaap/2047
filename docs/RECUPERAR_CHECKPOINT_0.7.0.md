# Recuperar o checkpoint 0.7.0 em outro computador

A publicação foi autorizada, mas Git e aplicativo GitHub retornaram 403. A branch `feat/tutorial-assets` e as tags desta entrega continuam locais. O pacote de continuidade contém `2047-rede-aurora-0.7.0.bundle`, com os commits e arquivos adicionais, sem alterar os SHAs originais.

O bundle é **incremental**: precisa do snapshot público `a8a8802f88c1eb373c7133e799d16cde0a8c450f` de Da-Hora-stack/2047. Não é um ZIP autossuficiente do jogo. Os materiais originais já pertencem a essa base; os novos modelos, perfis de textura, código, relatórios e evidências estão no bundle. Não inclui banco local, credenciais ou node_modules.

## Windows

Instalar Git para Windows e Node.js LTS compatível (22.13 ou superior). Extrair o pacote, abrir o terminal nessa pasta e executar:

```sh
git clone https://github.com/Da-Hora-stack/2047.git projeto
cd projeto
git bundle verify ../2047-rede-aurora-0.7.0.bundle
git fetch ../2047-rede-aurora-0.7.0.bundle refs/heads/feat/tutorial-assets:refs/heads/feat/tutorial-assets refs/tags/v0.6.0:refs/tags/v0.6.0 refs/tags/v0.7.0:refs/tags/v0.7.0
git switch feat/tutorial-assets
npm ci
npm run dev
```

Abrir http://localhost:3000 **nesse mesmo computador** e manter o terminal aberto. Conferir 0.7.0 no menu. Não usar `git clone` só da branch remota enquanto ela não tiver sido publicada. O clone da base e a instalação de dependências precisam de Internet; o jogo utiliza as texturas/modelos locais.

O bundle foi verificado com `git bundle verify`. A aplicação foi testada em Linux/Chromium; os passos no Windows e a sensação dos controles em GPU real ainda exigem verificação humana.

Para continuar pelo celular, abrir esta mesma conversa/conta e compartilhar com o próximo agente docs/RETOMAR_AGORA.md, STATUS_DO_PROJETO.md e RELATORIO_CORRECOES_CRITICAS.md. O jogo mantém controles de desktop. Código no GitHub ou bundle não sincroniza partidas: preservar separadamente local.db e, se existirem, seus arquivos auxiliares, com o servidor parado e cópia de segurança.

## Publicar depois de corrigir a conexão

O proprietário Da-Hora-stack precisa incluir o repositório 2047 no acesso da conexão/instalação GitHub e permitir escrita de conteúdo, ou disponibilizar uma conexão Git com escrita. O usuário já autorizou a publicação do conteúdo; não pedir novamente essa autorização. Não colocar tokens nos comandos/relatórios.

Na cópia recuperada acima, origin aponta para o destino autorizado:

```sh
git push --atomic origin feat/tutorial-assets v0.6.0 v0.7.0
git ls-remote origin refs/heads/feat/tutorial-assets refs/tags/v0.6.0 refs/tags/v0.7.0
```

No workspace original, usar o remoto official, que aponta para o mesmo destino. Confirmar os SHAs publicados antes de anunciar sucesso. Não usar force push em main nem outro repositório/conta para contornar o 403.

Para continuar materiais, personagens e validação, ler docs/CONTINUAR_CORRECOES_0.7.0.md. Os personagens são provisórios, os oito PBR são reais e as seis fases ainda têm pendências na auditoria.

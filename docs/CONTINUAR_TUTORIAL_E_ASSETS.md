# Continuar a versão 0.6.0

Repositório oficial deste pedido: https://github.com/Da-Hora-stack/2047. O trabalho está na branch `feat/tutorial-assets`; não confundir a main anterior com a entrega desta branch. A base é `a8a8802`, com Estrada Viva, mais os componentes 0.5.2 recuperados e as etapas descritas em `RELATORIO_TUTORIAL_ASSETS.md`.

## Windows

```powershell
git clone --branch feat/tutorial-assets https://github.com/Da-Hora-stack/2047.git
cd 2047
npm ci
npm run dev
```

Abra http://localhost:3000 nesse computador e mantenha o terminal aberto. Também existe `INICIAR_JOGO.bat`. O GitHub contém os materiais e modelos desta entrega; não é necessário baixar novamente os oito materiais Poly Haven. O clone inicial é grande porque preserva os originais e o histórico do snapshot oficial.

Para atualizar uma cópia que já contém outras alterações locais, confira `git status`, preserve essas alterações e integre a branch; não substitua a pasta inteira nem use reset --hard. `local.db` e o cookie do navegador guardam as partidas locais e não são transferidos pelo Git. Preserve o banco e use o mesmo endereço/navegador ao atualizar uma instalação.

## Verificação humana

1. Confira 0.6.0 no menu. Novo jogo deve começar a pé no barracão.
2. Caminhe 3 m, clique no mundo e mova o mouse. Inspecione caderno e bancada com F. As portas laterais estão abertas; a porta do lado da estrada fica à direita da visão inicial, perto do caderno.
3. Aproxime-se do Titã na estrada e use F. C mostra a cabine, E liga, W acelera, S freia e engata ré depois de parar. Faça uma curva lenta e percorra 2 m em ré.
4. O retângulo de treinamento fica na estrada, aproximadamente 59 m à frente da posição inicial. Mantenha velocidade baixa. Estacione alinhado, segure Espaço, desligue com E e use F para descer.
5. Perto do caminhão, V abre manutenção. Faça um reparo com as duas peças iniciais do compartimento; Tab permite transferir mais da mochila. Os itens gastos são reais.
6. Volte à sobrevivente no abrigo e aceite a Semente. Confira o inventário e o mapa. Prepare diesel, suspensão e radiador; reserve 4 L e uma peça para o gerador do Núcleo. Escolha uma das rotas reais.
7. Explore a oficina abandonada no km 1,65. Ao chegar ao Núcleo 1, estacione e desligue o motor. Fale com Tomás, ligue o gerador e use o terminal para ativar.
8. Salve, feche/reinicie o servidor e carregue. Confira tutorial, recursos, integridade, gerador e restauração. Confira também uma partida anterior: o guia não deve aparecer automaticamente.
9. Na pausa, pular/repetir muda apenas o guia. Os recursos e a campanha não são reiniciados. Avalie teclado, leitura, volume e câmeras em 1280×720 e 1920×1080 com GPU real.

## Texturas

`node scripts/preparar-texturas-locais.mjs` valida e prepara os arquivos existentes, preservando os originais. O manifesto identifica cores/dados, hashes e perfis. Não substituir os ARM corrigidos por mapas de canais desconhecidos. Para novos arquivos, reutilize o importer/downloader existentes e confira licença, mapa normal OpenGL, escala/UV e aplicação real antes de declarar instalado. Height fica fora do shader até existir física equivalente.

## Modelos

`blender -b --python scripts/preparar-modelos.py -- PLANO.json` executa uma preparação offline. O plano contém `jobs`, com `id`, `source`, `dest` e escala física `length`; o caminhão inicial usa `rig: "old-truck"`. `report` indica onde gravar as dimensões/triângulos. Use os arquivos originais recebidos como entrada, em uma pasta de trabalho; nunca utilize o GLB já preparado como fonte do mesmo rig.

O manifesto distingue o Titã e construções instalados dos quatro caminhões em `candidates`. Estes exigem separação de rodas, pivôs, cockpit, orientação e testes antes de serem dirigíveis. City People continua fora do projeto enquanto a licença não for identificada. As licenças CC BY e a restrição não comercial dos carros Renafox devem ser preservadas.

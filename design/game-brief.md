# Game Brief: 2047 — Rede Aurora

> Resumo de uma página da visão em [`docs/VISAO_CRIATIVA.md`](../docs/VISAO_CRIATIVA.md), que é a referência completa. O estado técnico está em `STATUS_DO_PROJETO.md` e nos relatórios de versão; a narrativa da 0.14.0 em [`RELATORIO_NARRATIVA_0.14.0.md`](../RELATORIO_NARRATIVA_0.14.0.md) e [`docs/NARRATIVA_0.14.0.md`](../docs/NARRATIVA_0.14.0.md).
>
> Atualizado em 2026-11-11 (branch `feat/narrativa-0.14.0`, commit `9c2a71a`) com as definições do autor abaixo. Campos marcados *(inferred (strong))* vêm do código e dos relatórios, não de uma afirmação do autor.

## In your words

**1. Features — O que marcar como próximo?**

Marque os quatro itens como **[ ] Pendentes**, pois ainda não estão completos:

- [ ] **Quatro finais e a Voz:** o mistério da Voz, os fragmentos e as escolhas narrativas já possuem implementações parciais, mas os quatro finais ainda precisam ser desenvolvidos e integrados à campanha.
- [ ] **Regiões 2 a 5 completas:** os cinco biomas e os sete Núcleos já existem funcionalmente, mas as regiões ainda precisam de maior variedade de cenários, cidades, exploração, ambientação e acabamento artístico.
- [ ] **Arte final e personagens:** melhorar modelos 3D, rostos, roupas, animações, construções, iluminação, materiais e identidade visual. A arte atual ainda não representa o acabamento final desejado.
- [ ] **Mais caminhões dirigíveis:** o Titã Rocha Clara e o Basculante Municipal já são funcionais. Quero ampliar a frota com veículos diferentes, física própria, interiores, personalizações e capacidades de transporte.

**Ordem de prioridade:** concluir a 0.14.0 narrativa → melhorar regiões e arte → ampliar a frota → implementar e validar os quatro finais na 1.0.0.

Não marque uma funcionalidade como concluída apenas porque sua estrutura inicial existe no código.

**2. Kill condition — Condição de abandono**

**Escolha: Nenhuma por enquanto.**

Não quero estabelecer uma condição automática para abandonar o projeto.

Meu objetivo é continuar desenvolvendo o jogo até alcançar a experiência desejada.

Problemas de desempenho, qualidade gráfica ou complexidade técnica devem ser tratados como desafios de desenvolvimento.

Se o jogo apresentar desempenho inadequado em GPUs integradas, quero primeiro investigar otimizações, perfis gráficos, LOD, streaming e possíveis reduções de escopo.

O desempenho é um critério importante de qualidade, mas não uma razão automática para abandonar o projeto.

**3. Who it's for — Público-alvo e sensação desejada**

**Manter a visão do prompt mestre, com a seguinte definição:**

O jogo é destinado principalmente a jogadores de PC que gostam de simuladores de caminhões, exploração, sobrevivência e histórias pós-apocalípticas.

As principais referências de experiência são Euro Truck Simulator 2, SnowRunner e Pacific Drive, mas o 2047 deve possuir identidade própria.

Quero alcançar jogadores que gostam de:

- Dirigir e personalizar caminhões.
- Explorar mapas e descobrir lugares.
- Realizar transportes e desenvolver uma carreira.
- Administrar recursos e equipamentos.
- Conhecer personagens e acompanhar uma história.
- Tomar decisões com consequências.
- Observar o mundo mudar conforme progridem.

**Sensação-alvo:** solidão, liberdade, imersão, descoberta, responsabilidade e esperança.

Quero que o jogador sinta o peso de atravessar um mundo devastado em um caminhão antigo, mas também encontre satisfação em ajudar comunidades e ver a natureza retornar.

A direção deve ser prazerosa mesmo fora das missões.

A sobrevivência deve gerar decisões interessantes, sem ser excessivamente punitiva.

A campanha deve ser emocionante, mas permitir liberdade para explorar e trabalhar como caminhoneiro.

**A experiência central é:** viajar por um mundo que parece perdido e perceber, pouco a pouco, que suas ações estão devolvendo vida a ele.

O caminhão é o companheiro. A estrada é o desafio. A restauração é a recompensa.

Quero que 2047: Rede Aurora seja um jogo contemplativo em alguns momentos, desafiador em outros e sempre recompensador, com uma identidade própria que combine simulação, sobrevivência e narrativa.

After play: Quero completar o brief do **2047: Rede Aurora** com as seguintes definições. Utilize essas informações para corrigir os campos pendentes antes de executar `/create-stories`.

**1. Versão 0.14.0 — Narrativa e cinematografia**

**A 0.14.0 existe e já possui implementações. Não marque como "intenção desconhecida".**

Repositório: https://github.com/renataaap/2047

Branch: `feat/narrativa-0.14.0`

Documentos:
- `RELATORIO_NARRATIVA_0.14.0.md`
- `docs/NARRATIVA_0.14.0.md`

Se não encontrar esses arquivos, atualize as referências remotas e verifique a branch correta antes de concluir que não existem.

**Já implementado na 0.14.0**

- Estrutura narrativa dividida em capítulos.
- Estado narrativo persistente.
- Sistema de escolhas.
- Relações com personagens.
- Transmissões narrativas pelo rádio.
- Registro das transmissões.
- Seis fontes de fragmentos da Voz.
- Escolha de dividir água com Lia.
- Escolha de negociar com os homens de Garcia no Leito Seco.
- Escolha de ceder uma peça do Titã para Noêmia.
- Consequências dessas decisões nos relacionamentos e diálogos.
- Sistema de ancoragem instável: uma Semente com integridade inferior a 60% produz um campo que permanece no estágio 2 de recuperação.
- Avisos da Renata e marcação do campo instável no diário.
- Compatibilidade com saves anteriores.

A documentação registra 358 testes unitários e build aprovados, além de testes E2E focados. A regressão integral da versão ainda não foi confirmada.

**O que falta implementar na 0.14.0**

- [ ] Prólogo cinematográfico de 2027, mostrando o começo do desastre.
- [ ] Transição de 2027 para 2047.
- [ ] Nova introdução de Dante no barracão.
- [ ] Apresentação cinematográfica do Titã Rocha Clara.
- [ ] Cena de chegada da sobrevivente com a primeira Semente.
- [ ] Sistema reutilizável de cutscenes narrativas.
- [ ] Primeiro encontro físico e cinematográfico com Brutus.
- [ ] Cutscenes de acontecimentos importantes da campanha.
- [ ] Consequências visíveis das escolhas nos cenários.
- [ ] Refinamento de diálogos, câmeras, iluminação e animações.
- [ ] Testes de regressão completos e playtest humano.

Os quatro finais pertencem ao objetivo final da campanha, previsto para a 1.0.0.

A 0.14.0 deve preparar a narrativa e as decisões que levam a eles, mas não precisa implementar todos os epílogos agora.

**Observação:** a 0.13.0 foi planejada, mas não está implementada no repositório. Não considere tráfego avançado, segunda cidade e rotinas completas de NPCs como sistemas já entregues.

---

**2. First minute — Primeiro minuto de jogo**

**Experiência desejada**

Quero que o jogador compreenda imediatamente que está entrando em um mundo pós-apocalíptico, onde dirigir e transportar cargas pode ajudar a restaurar o planeta.

O primeiro minuto ideal deve funcionar assim:

**0–15 segundos:**

Uma cena cinematográfica apresenta o mundo de 2027. Uma estrada, sinais de civilização e os primeiros acontecimentos anormais na atmosfera.

**15–30 segundos:**

O céu muda, as comunicações falham e as tempestades de plasma começam. Dante busca abrigo em um túnel.

**30–40 segundos:**

Transição para 2047, vinte anos depois. O mundo está devastado.

**40–60 segundos:**

A câmera apresenta o barracão e o Titã Rocha Clara. O jogador conhece Dante e recebe o controle para começar a explorar.

Esses tempos são metas de direção e ritmo, não durações rígidas.

A apresentação deve ser cinematográfica, mas curta, interessante e com possibilidade de pular.

**O primeiro objetivo jogável**

Depois da abertura, o jogador deve:

1. Explorar o barracão.
2. Conhecer o Titã.
3. Aprender as interações básicas.
4. Encontrar a sobrevivente.
5. Receber a primeira Semente.
6. Preparar o caminhão.
7. Iniciar a jornada.

O tutorial de 21 objetivos já existe e deve ser preservado.

**Importante:** atualmente, o prólogo de 2027 ainda é uma funcionalidade planejada. O First minute acima representa a experiência desejada após a conclusão da 0.14.0, não o estado já implementado.

---

**3. Challenge — Desafio principal**

O desafio central é **atravessar um continente devastado transportando sete Sementes de Ignição e ativar os sete Núcleos de Restauração**.

O jogador precisa administrar:

- Combustível.
- Integridade do caminhão.
- Peso e fragilidade da carga.
- Condições das estradas.
- Rotas alternativas.
- Recursos de sobrevivência.
- Manutenção.
- Clima.
- Exploração.
- Decisões narrativas.

A dificuldade deve surgir das situações encontradas durante as viagens, não de controles ruins ou tarefas repetitivas.

Quero que o jogador precise pensar:

"Será que meu caminhão aguenta essa subida? Tenho diesel suficiente? Vale a pena atravessar essa estrada danificada? Devo ajudar esta comunidade ou guardar meus recursos?"

Cada bioma deverá apresentar desafios próprios.

A campanha deverá crescer em complexidade, variedade e significado conforme o jogador avança.

O objetivo não é dificultar artificialmente o jogo, mas criar viagens interessantes, com decisões e consequências.

---

**4. Keep — O que mantém o jogador interessado**

Quero que o jogador tenha vontade de continuar porque existe sempre algo interessante para descobrir, melhorar ou realizar.

**Ciclo principal**

**Preparar caminhão → escolher objetivo → planejar rota → viajar → explorar e enfrentar desafios → concluir objetivo → receber recompensa ou consequência → melhorar o caminhão e observar o mundo mudar → continuar.**

**Motivações de curto prazo**

- Concluir uma entrega.
- Ganhar recursos.
- Reparar o caminhão.
- Conhecer um personagem.
- Explorar um lugar.
- Descobrir um atalho.
- Encontrar suprimentos.

**Motivações de médio prazo**

- Personalizar caminhões.
- Desbloquear novos veículos.
- Desenvolver a carreira.
- Explorar regiões.
- Ajudar comunidades.
- Descobrir a história do mundo.
- Investigar os sinais da Voz.

**Motivações de longo prazo**

- Ativar os sete Núcleos.
- Restaurar o planeta.
- Descobrir os segredos da Rede.
- Desenvolver as relações com personagens.
- Conhecer os quatro finais.
- Continuar explorando e realizando transportes depois da campanha.

**A principal recompensa emocional é observar o mundo se recuperar por causa das ações do jogador.**

Não quero depender de tarefas repetitivas, recompensas artificiais ou progressão excessivamente lenta para manter o interesse.

---

**5. Your systems — Classificação correta**

Quero que você utilize três categorias: **construído, parcialmente implementado e pendente**.

**[x] Construído — Base funcional**

- Mundo 3D em Three.js.
- Física Rapier.
- Condução de caminhões.
- Motor, transmissão, suspensão e frenagem.
- Dois caminhões dirigíveis: Titã e Basculante Municipal.
- Garagem com personalização e melhorias.
- Inventário.
- Sobrevivência.
- Manutenção.
- Combustível.
- Rede rodoviária.
- GPS e minimapa.
- Cinco biomas como regiões funcionais.
- Sete Núcleos e seus Cofres.
- Sistema de Sementes.
- Restauração ambiental progressiva.
- Contratos comerciais.
- Cargas físicas.
- Economia regional.
- Progressão profissional.
- Três slots de salvamento.
- Tutorial.
- Diálogos e interações básicas.

Esses sistemas estão implementados, mas ainda podem precisar de polimento, balanceamento, testes em hardware real e correções.

**[~] Parcialmente implementado**

- Narrativa completa.
- Desenvolvimento dos personagens.
- Escolhas narrativas e consequências.
- Mistério da Voz.
- Cutscenes.
- Arte dos personagens.
- Qualidade visual das cidades.
- Exploração aprofundada de cada bioma.
- Reações das comunidades.
- Animações de entrada e saída dos caminhões.
- Tráfego ambiental existente, ainda sem sistema completo de trânsito.
- Diversidade de atividades do mundo aberto.

A existência de sistemas iniciais não significa que sua visão final esteja concluída.

**[ ] Pendente**

- Prólogo completo de 2027.
- Introdução cinematográfica de Dante.
- Segunda cidade completa.
- Tráfego inteligente e recorrente.
- NPCs com rotinas completas.
- Regiões 2 a 5 com acabamento artístico final.
- Modelos e animações finais dos personagens.
- Novos caminhões homologados para condução.
- Expansão das atividades e eventos do mundo.
- Campanha narrativa completa.
- Quatro finais implementados.
- Epílogos.
- Modo livre pós-campanha integrado aos finais.
- Otimização e validação final para lançamento.

**Não coloque esses itens em Out of scope**, porque fazem parte da visão final do projeto.

Out of scope inclui recursos que não são necessários para a experiência original, como multiplayer online, microtransações, sistemas de combate extensos ou reconstrução do jogo em outro motor.

---

**6. Who it's for — Público-alvo**

Jogadores de PC que gostam de simulação de caminhões, exploração, sobrevivência, mundo aberto e histórias pós-apocalípticas.

As principais referências conceituais são Euro Truck Simulator 2, SnowRunner e Pacific Drive.

A sensação desejada combina:

- Solidão.
- Liberdade.
- Imersão.
- Descoberta.
- Responsabilidade.
- Desafio.
- Esperança.

Quero que dirigir seja prazeroso, explorar desperte curiosidade e restaurar o mundo seja uma recompensa emocional marcante.

**O caminhão é o companheiro. A estrada é o desafio. A restauração é a recompensa.**

---

**7. Kill condition**

**Nenhuma por enquanto.**

Não estabeleça uma condição automática de abandono.

Problemas de desempenho, gráficos, desenvolvimento ou escopo devem primeiro levar a investigação, otimização e revisão das prioridades.

Meu objetivo é continuar desenvolvendo o jogo até alcançar a experiência desejada.

---

**8. Próximo passo**

Atualize o brief com essas informações.

Não apague funcionalidades construídas e não classifique a 0.14.0 como inexistente.

Consulte a branch `feat/narrativa-0.14.0` e diferencie as partes concluídas das pendentes.

Depois, organize os itens ainda não concluídos em histórias de desenvolvimento, com prioridades e critérios de aceitação.

**A prioridade imediata é concluir a 0.14.0 narrativa, começando pelo prólogo de 2027 e pela introdução de Dante, antes de iniciar grandes expansões de escopo.**

---

**Pitch:** Um caminhoneiro comum e seu caminhão de 2003 atravessam um continente devastado levando Sementes frágeis a sete Núcleos, e cada viagem bem-feita faz o mundo voltar a chover.

**Genre:** simulação de caminhão, sobrevivência e jornada narrativa em mundo aberto, single-player, PC.

**Controls:** WASD dirigir/andar, Espaço freio de mão/pular, E ignição, F interagir/descer, C câmera, L faróis, G garagem, M mapa, R rádio, Tab inventário, V manutenção, H sobrevivência, J diário. *(inferred (strong): STATUS_DO_PROJETO.md)*

**Question:** a 0.14.0 faz o jogador sentir, desde o primeiro minuto, que está num mundo perdido que suas viagens podem devolver à vida? *(guessed)*

**Hooks:** a restauração muda o mundo de verdade (céu, chuva, vegetação, rotas); escolhas com custo real mudam relações, rádio e, em seguida, os cenários. *(inferred (strong): VISAO_CRIATIVA e relatório 0.14.0)*

**Intent:** soft or no failure: "sem ser excessivamente punitiva" (you said) · payoff builds: o mundo se recupera pouco a pouco (you said)

## Look and references
- Look: realismo ambiental pós-apocalíptico (PBR, ferrugem, concreto gasto, poeira, luz natural), contraste forte entre devastado e restaurado; cutscenes curtas e puláveis; áudio sintetizado com diesel, rádio de ondas curtas e chiado.
- References: Euro Truck Simulator 2 (o prazer de dirigir e a carreira), SnowRunner (peso e terreno), Pacific Drive (o vínculo com o veículo num mundo hostil, sem anomalias sobrenaturais nem loop de expedições curtas). Identidade própria, sem copiar assets.
- View: 3D · Camera: terceira pessoa seguindo o caminhão, cabine interna, a pé em 1ª/3ª pessoa; câmeras cinematográficas nas cenas.

## First minute
Meta após a 0.14.0 (hoje o prólogo ainda não existe): 2027 numa estrada com sinais de civilização e a atmosfera ficando anormal; o céu muda, as comunicações caem, começam as tempestades de plasma e Dante se abriga num túnel; corte para 2047, vinte anos depois, o mundo devastado; a câmera apresenta o barracão e o Titã, o jogador conhece Dante e recebe o controle. Tempos são metas de ritmo; a abertura é curta e pode ser pulada. Depois: explorar o barracão, conhecer o Titã, aprender as interações, encontrar a sobrevivente, receber a primeira Semente, preparar o caminhão e partir, preservando o tutorial de 21 objetivos.

## Challenge
Atravessar o continente levando sete Sementes e ativar os sete Núcleos, administrando diesel, integridade do caminhão, peso e fragilidade da carga, estradas, rotas, recursos, manutenção, clima e decisões narrativas. A dificuldade vem das situações da viagem ("o caminhão aguenta essa subida? tenho diesel? ajudo esta comunidade ou guardo recursos?"), nunca de controles ruins ou repetição. Cada bioma traz desafios próprios e a campanha cresce em complexidade e significado.

## Core loop
- Preparar o caminhão → escolher objetivo → planejar rota → viajar com peso e física reais.
- Explorar e enfrentar desafios → concluir o objetivo (Núcleo, frete ou ajuda a uma comunidade) → recompensa ou consequência.
- Melhorar o caminhão, ver o mundo mudar e a história avançar pelo rádio e pelas pessoas → continuar.

## Goal & fail state
- Objetivo: reativar os sete Núcleos em sequência e chegar a um dos quatro finais (1.0.0); depois continuar livre no mundo resultante.
- Falha é recuperável: Semente avariada recalibra, caminhão quebrado repara, falta de recurso se resolve. Ancorar com Semente abaixo de 60% deixa o campo instável no estágio 2. Uma sessão está completa quando uma viagem terminou com o mundo ou uma relação diferente do início.

## Features
<!-- Escopo atual: concluir a 0.14.0. As visões maiores estão em Your systems e no Build order. -->
- [x] Base jogável: condução, dois caminhões, garagem, sobrevivência, rede rodoviária, cinco biomas, sete Núcleos com restauração, contratos, economia e carreira, saves 1–3, tutorial
- [x] Narrativa 0.14.0 (fundação): capítulos, estado persistente, rádio com registro, seis fontes da Voz, três escolhas jogáveis com relações, ancoragem instável
- [ ] Sistema reutilizável de cutscenes narrativas
- [ ] Prólogo cinematográfico de 2027 e transição para 2047
- [ ] Nova introdução de Dante no barracão e apresentação do Titã Rocha Clara
- [ ] Cena de chegada da sobrevivente com a primeira Semente
- [ ] Primeiro encontro físico e cinematográfico com Brutus
- [ ] Cutscenes dos acontecimentos importantes da campanha
- [ ] Consequências visíveis das escolhas nos cenários
- [ ] Refinamento de diálogos, câmeras, iluminação e animações
- [ ] Regressão E2E integral e playtest humano da 0.14.0

## Your systems
- mundo 3D, física, condução, motor, transmissão, suspensão e frenagem · in the slice
- dois caminhões dirigíveis (Titã e Basculante Municipal) · in the slice
- garagem com personalização e melhorias · in the slice
- inventário, sobrevivência, manutenção e combustível · in the slice
- rede rodoviária, GPS e minimapa · in the slice
- cinco biomas como regiões funcionais · in the slice
- sete Núcleos, Cofres, Sementes e restauração ambiental progressiva · in the slice
- contratos comerciais, cargas físicas, economia regional e progressão profissional · in the slice
- três slots de salvamento e tutorial · in the slice
- diálogos e interações básicas · in the slice
- narrativa, personagens, escolhas e consequências · thin stand-in
- mistério da Voz · thin stand-in
- cutscenes · thin stand-in
- arte dos personagens e qualidade visual das cidades · thin stand-in
- exploração aprofundada de cada bioma e reações das comunidades · thin stand-in
- animações de entrada e saída dos caminhões · thin stand-in
- tráfego ambiental (sem sistema completo de trânsito) · thin stand-in
- diversidade de atividades do mundo aberto · thin stand-in
- segunda cidade completa · later
- tráfego inteligente e recorrente · later
- NPCs com rotinas completas · later
- regiões 2 a 5 com acabamento artístico final · later
- modelos e animações finais dos personagens · later
- novos caminhões homologados para condução · later
- expansão das atividades e eventos do mundo · later
- campanha narrativa completa, quatro finais e epílogos · later
- modo livre pós-campanha integrado aos finais · later
- otimização e validação final para lançamento · later

## Keep
- O mundo se recuperando por causa das ações do jogador é a principal recompensa emocional *(you said)*
- Sempre algo para descobrir, melhorar ou realizar: entregas, reparos, personagens, atalhos, personalização, carreira, a Voz, os sete Núcleos *(you said)*
- A direção é prazerosa mesmo fora das missões *(you said)*
- O tutorial de 21 objetivos *(you said)*

## Avoid
- tarefas repetitivas, recompensas artificiais, progressão lenta demais ou grind
- sobrevivência excessivamente punitiva; dificuldade vinda de controles ruins
- marcar como concluído o que só tem estrutura inicial no código
- mundo gigante vazio; cópia de assets, mapas ou interfaces de jogos comerciais
- revelar o segredo da Voz na interface antes do momento narrativo

## Out of scope
<!-- Os itens "later" de Your systems ficam no Build order, não aqui, por pedido do autor. -->
- multiplayer online; microtransações
- combate como loop principal ou sistemas de combate extensos
- multidões ou trânsito moderno denso (o tráfego leve e recorrente continua previsto)
- reconstrução do jogo em outro motor ou troca de stack (Three.js/Rapier/Next.js)

## Build order
1. Concluir a 0.14.0 narrativa: sistema de cutscenes → prólogo 2027 e transição → introdução de Dante e do Titã → chegada da sobrevivente → Brutus → cutscenes da campanha → consequências visíveis → refinamento → regressão integral e playtest.
2. Melhorar regiões e arte (regiões 2 a 5, cidades, personagens).
3. Mundo vivo: segunda cidade, tráfego leve recorrente, rotinas de NPCs (a 0.13.0 planejada, ainda não implementada). *(guessed: posição na ordem; vem do brief anterior)*
4. Ampliar a frota com novos caminhões homologados.
5. 1.0.0: campanha completa, quatro finais, epílogos, modo livre pós-campanha, otimização e validação final.

---
**Kill condition:** nenhuma por enquanto; desempenho, gráficos ou escopo levam primeiro a investigação, otimização e revisão de prioridades.

**Who it's for / what they feel:** jogadores de PC de simulação de caminhões, exploração, sobrevivência, mundo aberto e histórias pós-apocalípticas; solidão, liberdade, imersão, descoberta, responsabilidade, desafio e esperança.

**Games you love / don't:** love Euro Truck Simulator 2, SnowRunner, Pacific Drive.

# CODEX — REFORMULAÇÃO DE DIÁLOGOS, ESCOLHAS E INTERFACES DO 2047: REDE AURORA

Quero que você reformule completamente o design e a experiência de uso das caixas de texto, diálogos, seleções, opções de interação e menus do jogo **2047: Rede Aurora**.

Atualmente, esses elementos estão visualmente simples, genéricos e não combinam com os gráficos realistas que estamos implementando.

**Não quero apenas trocar cores, fontes ou arredondamentos. Quero reconstruir visualmente esses componentes, melhorando a experiência de interação.**

## 1. Identidade visual

A interface deverá combinar a atmosfera pós-apocalíptica do jogo com a sofisticação visual de simuladores e aventuras narrativas.

Utilize como referências conceituais:
- The Last of Us — simplicidade cinematográfica.
- Red Dead Redemption 2 — interações contextuais.
- Metro Exodus — integração da interface ao universo do jogo.
- Detroit: Become Human — apresentação clara de escolhas narrativas.
- Euro Truck Simulator 2 — clareza de instrumentos e controles.

Não copie diretamente as interfaces dessas obras.

### Evitar

- Caixas retangulares grandes e genéricas.
- Botões enormes.
- Bordas excessivamente arredondadas.
- Cards com aparência de dashboard.
- Gradientes artificiais.
- Destaques neon.
- Ícones em excesso.
- Janelas centrais que escondem o cenário desnecessariamente.
- Menus com aparência de formulários HTML comuns.

## 2. Sistema de diálogos

Crie um sistema de diálogos mais cinematográfico.

### Apresentação

- Nome do personagem em destaque discreto.
- Texto com tipografia legível.
- Posicionamento preferencialmente na parte inferior da tela.
- Fundo escurecido sutilmente, quando necessário para contraste.
- Transições suaves.
- Animação de entrada e saída.
- Quebra de texto adequada.
- Suporte a diálogos longos e curtos.
- Legendas compatíveis com narração futura.

A caixa não precisa aparecer permanentemente.

Ela deverá surgir apenas quando houver diálogo e desaparecer quando terminar.

### Comportamento

- Permitir avançar com teclado ou mouse.
- Não reiniciar diálogos indevidamente.
- Evitar animações excessivamente lentas.
- Permitir exibir o texto imediatamente.
- Controlar corretamente a passagem entre falas.
- Exibir indicadores discretos de continuação.

## 3. Seleções e escolhas narrativas

Reformule as opções de resposta.

Em vez de botões genéricos, implemente opções textuais com hierarquia visual.

Características:

- Seleção destacada por contraste, marcador ou linha lateral.
- Animação discreta ao mudar a opção.
- Suporte a mouse e teclado.
- Navegação com setas ou W/S quando apropriado.
- Confirmação com Enter ou clique.
- Indicação clara da opção ativa.
- Feedback sonoro sutil.
- Transições suaves.

As opções precisam ser fáceis de compreender e selecionar, sem cobrir desnecessariamente os personagens e o cenário.

Escolhas importantes poderão apresentar uma confirmação contextual, quando isso melhorar a experiência.

Não revele consequências narrativas ocultas antes de o jogador escolher.

## 4. Interação com NPCs e objetos

Quando o jogador se aproximar de algo interativo, exiba um indicador contextual discreto.

Exemplos:

- `F  Conversar`
- `F  Examinar`
- `F  Coletar`
- `F  Entrar no caminhão`
- `F  Abrir oficina`

Não exibir mensagens flutuantes grandes sobre todos os objetos ao mesmo tempo.

Utilize apenas as interações disponíveis dentro do alcance adequado.

O indicador deve desaparecer ao se afastar.

## 5. Seleções de serviços

Reformule as interfaces dos abrigos, oficinas e comerciantes.

Quando Dante conversar com um mecânico, por exemplo, as opções poderão ser:

- Reparar veículo.
- Comprar peças.
- Abastecer.
- Consultar informações.
- Sair.

Essas seleções devem seguir o mesmo design visual do sistema de diálogos, mas permitir a exibição de informações práticas, como preço, disponibilidade e condição dos componentes.

O jogador precisa entender facilmente o que está selecionando.

Não coloque todas as informações em uma única caixa sobrecarregada.

## 6. Menus e telas

Aplique a nova linguagem visual também aos elementos relacionados:

- Inventário.
- Mapa.
- Rádio.
- Manutenção.
- Missões.
- Seleção de caminhão.
- Configurações.
- Menu de pausa.

Essas telas podem utilizar painéis maiores quando necessário, mas não devem parecer páginas administrativas.

Diferencie interfaces narrativas de interfaces técnicas, mantendo consistência de tipografia, espaçamento, cores e navegação.

## 7. Direção de arte

Utilize uma paleta inspirada no universo de 2047:

- Preto e grafite.
- Cinza metálico.
- Bege envelhecido.
- Branco suave.
- Laranja ou âmbar em pequenos destaques funcionais.

Empregue texturas de desgaste somente quando agregarem valor.

A leitura dos textos e a acessibilidade têm prioridade sobre efeitos decorativos.

## 8. Funcionalidade real

Todas as interfaces devem ser conectadas aos sistemas existentes.

- As escolhas precisam executar ações reais.
- Diálogos devem avançar corretamente.
- Interações devem depender da distância.
- Menus devem responder aos controles.
- A opção selecionada precisa ser visualmente identificável.
- Ao fechar um diálogo, o jogador deve recuperar o controle adequado.
- Durante uma escolha, comandos de direção ou movimento não podem ser acionados acidentalmente.
- Escolhas relevantes precisam ser persistidas quando necessário.

Implementar suporte a diferentes resoluções, ajuste de tamanho das legendas e navegação por teclado.

## 9. Integração com o projeto

Preserve obrigatoriamente:

- Next.js.
- JavaScript.
- HTML.
- CSS.
- Three.js.
- API REST Web.

Não substitua componentes funcionais sem verificar suas dependências.

Crie componentes reutilizáveis e organize estilos de maneira consistente.

Não misture toda a lógica de diálogos diretamente com o loop de renderização 3D.

## 10. Implementação

Primeiro, identifique os componentes atuais responsáveis pelas caixas de texto e seleções.

Depois:

1. Faça um diagnóstico dos problemas visuais e funcionais.
2. Defina um sistema visual consistente.
3. Reformule o componente de diálogos.
4. Reformule as seleções narrativas.
5. Melhore os indicadores de interação.
6. Adapte os menus relacionados.
7. Integre tudo às funcionalidades existentes.
8. Teste com NPCs, oficinas e objetos interativos.
9. Verifique responsividade e legibilidade.
10. Compare o resultado visual antes e depois.

**Quero que as alterações sejam perceptíveis dentro do jogo, não apenas no código.**

O resultado deverá parecer parte de um jogo 3D profissional, realista e narrativo, preservando a imersão no universo pós-apocalíptico de 2047: Rede Aurora.
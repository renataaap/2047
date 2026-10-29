# Auditoria das fases — 29/10/2026

**Não, todas as fases ainda não terminaram.** Conferência do roteiro vigente de seis fases da reformulação realista, sobre a versão 0.5.1. Foram usados código, assets efetivamente presentes, relatórios, testes e capturas reais. Uma tela, um campo no save ou um loader preparado não contam como sistema/conteúdo completo.

Os relatórios 0.4.0 registram quatro fases de um roteiro anterior. Isso não encerra as seis fases do novo pedido. Também há sistemas funcionais de fases posteriores que já existiam antes da reforma gráfica; não foram refeitos nem apagados.

| Fase atual | Situação verificada | Funciona | Falta para encerrar conforme o pedido |
| --- | --- | --- | --- |
| 1 — Diagnóstico/condução | **Implementada e testada na 0.5.0; preservada** | Passo fixo; massa/carga física; diesel/torque/RPM; 8 marchas automáticas/N/R; freios; direção por velocidade; raycasts/suspensão; câmeras e instrumentos reais | Avaliação humana de peso/conforto, áudio e ajuste fino no Windows/GPU real. É uma simulação acessível, não uma réplica validada do ETS2 |
| 2 — Reformulação gráfica | **Parcial, não concluída** | Pipeline PBR/download/import offline; shaders/GLB/mixer testados com fixtures; terreno/estradas corrigidos; acostamentos físicos; 3 carros reais com PBR próprio, colisão/streaming; IBL procedural no Alto | Mapas Poly Haven reais (**0 instalados**); caminhão final detalhado; NPCs licenciados; materiais/escala conferidos com imagens reais; edifícios e ambientação; iluminação/clima final/ciclo solar. ZIPs menores/licenças necessários |
| 3 — Mar de Cinzas completo | **Base jogável, acabamento incompleto** | Abrigo inicial, oficina, desvio/atalho, bloqueio, recursos, pontos de interação, clima e primeira região percorrível; carros novos em locais escolhidos | Densidade e coerência ambiental no nível visual solicitado, modelos de construções, estradas/obstáculos/detalhes finais, inspeção humana da região. Não é apenas uma estrada vazia, mas ainda conserva arte procedural provisória |
| 4 — Survival/exploração | **Ciclo básico funcional e testado; refinamento pendente** | F para sair/entrar; andar/correr/olhar/colidir; inventário limitado e transferência; água/comida/fadiga; diesel; desgaste/danos/reparos; comércio, descanso, NPCs/interações básicas | NPCs novos animados/locomoção no mundo, expansão dos diálogos, ajustes de economia e travessia humana. Exploração livre fora de POIs fica limitada ao entorno de 24 m do Titã, como na base |
| 5 — Primeira entrega completa | **Vertical slice funcional e testada** | Receber Semente; preparar caminhão; escolher rota; transportar com dano de integridade; parar/desligar; interagir a pé; ativar Núcleo com consequência; chuva/plantas/abertura do bloqueio e save/load | Arte/encenação final, navegação mais completa e validação humana contínua sem teleportes. Entrega não é teleporte; o teste automatizado encurta trajetos com ferramenta de diagnóstico |
| 6 — Expansão/narrativa/finais | **Parcial; não concluída** | Cinco biomas e sete Núcleos/Cofres sequenciais; perigos/rotas próprias; três secundárias, trocas e rádio; restauração por região persistida; sete ancoragens verificadas | Narrativa completa, Brutus/Garcia e demais personagens desenvolvidos, decisões/finais conectados, quatro finais jogáveis, polimento das outras regiões. O sétimo Núcleo não é o final da história |

## Conferência transversal

- **Assets reais:** três GLBs de carros Renafox e seus mapas locais. CC BY-NC 4.0 limita seu uso à versão não comercial; licença/créditos/alterações preservados. Caminhões escolhidos e personagens Fab não estão incorporados. Não há nenhuma imagem Poly Haven local instalada.
- **Materiais preparados ≠ materiais aplicados:** shader PBR/normal GL/ARM e importação foram exercitados com fixtures originais. Isso prova o caminho técnico e não a aparência final com Poly Haven real.
- **Três caminhões/progressão:** não existe progressão GAZ → LP → Peterbilt funcional. O adaptador preserva a física atual e exige pivôs/escala compatíveis; quatro rodas e parâmetros próprios exigem trabalho medido a partir de um asset utilizável.
- **NPCs:** os visuais originais simples continuam. O pacote recebido contém 11 rigs e 28 arquivos de animação, mas não inclui licença identificável. O usuário não encontrou os termos. Não confundir o AnimationMixer de diagnóstico com personagens do pacote já inseridos no jogo.
- **Mapa:** há traçado real das vias, desvios, Núcleos/abrigos e escolha de leste/oeste. Falta um planejador geral de caminhos pela rede com comparação automática de distâncias, risco e custo. O mapa atual é uma representação recuperada de navegação, não um sistema completo de GPS.
- **Clima/restauração:** poeira, chuva e frentes/perigos/aderência/interferência locais funcionam. Restauração muda chuva, plantas, barreiras e condições de rota e persiste no save. Ciclo manhã/meio-dia/entardecer/noite e substituição visual completa de materiais por biome/restauração ainda faltam; não basta contar uma mudança de cor como toda a transformação pedida.
- **Áudio:** síntese Web Audio ligada a RPM/carga/trocas, impactos/ambiente/radio existentes. Gravações profissionais licenciadas de diesel e avaliação auditiva humana não estão concluídas.
- **Controles/câmeras:** teclado/mouse e três câmeras funcionam. Retrovisores refletivos, remapeamento completo, gamepad e câmbio manual não estão implementados; alguns são opcionais/condicionados à viabilidade no pedido.
- **Saves/API:** três slots, validação, cookies/isolamento, migração de saves 1/2/3, posição/carga/inventários/missões/restauração persistem na base local libSQL. O loop físico permanece no cliente. GitHub não sincroniza partidas; deploy/Turso remoto não foi feito.
- **Finais:** `finalChoice` é apenas um campo inicial/validável no save. Não há fluxo que implemente os quatro finais. Não foi revelado o segredo da Voz na UI. Texto antigo que dizia “chegam na Fase 5” foi corrigido para informar que ainda serão desenvolvidos.
- **Desempenho:** baixo/médio/alto, setores, instâncias/LOD/culling já existem; PBR tem resoluções por perfil e modelos novos são liberados por proximidade. Medição atual em software: 152 draw calls, 101.784 triângulos e 2,23 FPS em 1280×720/Médio. Não é validação de 60 FPS numa GPU. Windows/GPU real, memória medida em hardware e estabilidade longa permanecem pendentes.

## Evidências e limites da verificação

- **87 testes unitários / 11 arquivos passaram**: regras de sobrevivência, missões, save, veículos, motor/câmbio/freios/carga/pisos, tempo, câmera, PBR/checksums/importação e geometria/colisão.
- **14 testes completos do navegador passaram (5,2 min)**: partida/condução/saída, GLB/PBR de diagnóstico, modelos reais/colisão/streaming, câmeras/configurações, API/CRUD/isolamento, migração, primeira entrega/restauração, sobrevivência e jornada automatizada pelos sete Núcleos.
- **Repetição dirigida final: 5 testes passaram**, cobrindo os últimos ajustes dos acostamentos, assets, API e primeira entrega.
- **Build Next.js passou**, dez rotas. Logs em `evidence/assets-integration`.
- [Captura real dos carros no jogo](../evidence/assets-integration/real-imported-wreck-close.png); [relatório da etapa](../RELATORIO_INTEGRACAO_ASSETS.md); [catálogo/origens/impedimentos](INTEGRACAO_ASSETS.md).

Passar nesses testes comprova os fluxos exercitados. Não comprova sozinho fotorealismo, dirigibilidade agradável, equilíbrio de uma viagem humana, conteúdo narrativo ausente ou autorização de uma licença que não veio no pacote.

## Ordem recomendada para fechar o projeto

1. Desbloquear os arquivos: mapas 1K/2K ou ZIPs em volumes de 25 MB, modelo de caminhão adaptável/licenciado e termos do pacote de NPCs. Integrar/medir os arquivos reais e finalizar a Fase 2.
2. Completar/polir o Mar de Cinzas, refinar exploração/economia e repetir uma entrega de ponta a ponta no Windows/GPU real.
3. Implementar a progressão dos três caminhões com configurações físicas próprias, animações/interações de NPCs e navegação pela rede.
4. Completar narrativa e decisões/finais, então polir as outras regiões e verificar persistência/progressão integral.
5. Só considerar o jogo terminado após cumprir os critérios visuais, funcionais, narrativos e de desempenho do pedido e avaliar a versão comercial/licenças, se esse for o destino escolhido pelo usuário.

Esta auditoria atende ao pedido de conferir as fases; não altera o estado das missões de uma partida e não marca funcionalidades pendentes como entregues.

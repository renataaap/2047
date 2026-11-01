# Rede rodoviária 0.9.0 — diagnóstico e arquitetura

Base verificada: `55a5df3`, versão 0.8.2, branch publicada `feat/polimento-0.8.2`. O PR #1 está aberto em rascunho e não foi integrado. A main continua em `d8a3b2a`/0.8.1. Trabalho isolado em `feat/rede-rodoviaria-0.9.0`, sem merge, force push ou substituição do PR #1. A área de trabalho estava limpa.

Lidos AGENTS, README, STATUS, relatório e incrementos 0.8.2, roteiro manual e reformulação realista. Consultado o guia instalado de Client Components do Next. A stack, o modelo e o controlador do Titã continuam os mesmos.

## Referência e provas anteriores

Nesta tarefa a base repetiu 175 unitários em 25 arquivos. Onze capturas reais registram entroncamento, futura cidade, alternativa, acessos dos sete Núcleos e mapa. Elas usam posicionamento de diagnóstico, não demonstram uma viagem física. Diretório `evidence/roads-0.9.0/before`.

Os 175 testes, build, reinício e 28 E2Es integrais relatados pela 0.8.2 são referência histórica, não a validação da 0.9.0. Dez hashes protegem narrativa, GLB, física, parâmetros, cabine, visibilidade do Titã e pose do motorista em `baseline.json`.

## Dependências encontradas

`roadX(z)` e `roadHeight(z)` definem o corredor, malha e colisão, faixas, acidentes, barreiras, recuperação, ambiência e mapa. `heightAt(x,z)` posiciona estruturas, NPCs, cápsula, câmera, efeitos e terreno. `surfaceAt(x,z)` alimenta aderência, resistência, desgaste e áudio. Busca completa da base em `legacy-dependencies.txt`.

O terreno atual é uma malha triangular com maior densidade em cx=0. A física recebe os mesmos triângulos. Player usa a altura interpolada dessa malha. Substituir só uma função ou desenhar um caminho no mapa produziria desacordo entre terreno, estrada e colisão.

## Transição adotada

- Preservar o perfil longitudinal como corredor legado e suas coordenadas.
- Acrescentar grafo de nós/segmentos com curvas, dados de piso, largura, risco, conservação, acesso, região e conexões.
- Compartilhar amostras métricas entre planejamento, consulta de piso, geometria e collider da via nova.
- Aplainar corredores de aproximação e cidade sem apagar o relevo dos demais locais.
- Gerar superfícies agrupadas por material/setor e manter streaming 3×3, LOD, instâncias e descarte.
- Proteger as faixas novas contra colocação de rochas, cenário e decoração.
- Planejar com Dijkstra, posição projetada na via, bloqueios reais, alternativas e custos de massa/piso/inclinação.
- Integrar o planejador ao mapa M e ao HUD. As notas antigas da campanha continuam disponíveis.

## Piloto

Cinza Nova fica a oeste da estrada, aproximadamente x=-240, z=-760. Uma ligação sai da rodovia junto ao km 0,62; ruas internas conectam posto, pátio, garagem física e setor industrial. A Oficina do Cotovelo permanece na sua posição, junto à entrada da região urbana. A saída de terra retorna à rodovia antes do Posto Boa Viagem. O corredor e o desvio pavimentado a leste permanecem como outra opção física.

Não alongar artificialmente o continente. Comparar distâncias reais e custos, sem pressupor que toda alternativa é mais curta ou econômica. A garagem recebe espaço físico e acesso, sem compra ou troca de caminhão nesta versão.

## Acessibilidade inicial

Os Núcleos mantêm seus sete locais. O estacionamento reconhecido pelo jogo fica em (7,-2880) no primeiro; nos demais, x do Núcleo menos 14 e z mais 10. Faltam alças, sinalização e superfícies regulares em vários acessos. Os Cofres possuem caixas/estrutura e reservas ao lado: pátios novos precisam evitar essas reservas e os caminhos até os painéis.

As correções serão medidas por local, incluindo entrada, manobra, desligamento, saída, caminhada/interação, retorno e saída viária. Até que essa circulação seja testada com Rapier, a existência de geometria não constitui aprovação. A matriz final distinguirá teste físico de posicionamento de diagnóstico.

## Saves

Manter schema 1–3 legível, inventários, Sementes, decisões, descobertas, horário e restauração. Navegação e revisão geográfica usam campos opcionais validados. Saves antigos dentro de construção nova precisam de posição livre próxima, escolha determinística e registro de migração. Mudanças de altura preservam o deslocamento vertical relativo ao piso. Nenhum reinício de campanha ou recompensa nova faz parte da recuperação.

## Validação seguinte

Testes de continuidade, rotas e custos, curvas/altura/colisão, ruas, navegação/recálculo e migração. Regressão dos 21 objetivos, primeira entrega e campanha. Capturas equivalentes e percurso automatizado com controles e física reais; posicionamento de diagnóstico nunca será contado como trajeto dirigido. Build e suítes WebGL sequenciais. SwiftShader não comprova desempenho em GPU ou sessão humana Windows.

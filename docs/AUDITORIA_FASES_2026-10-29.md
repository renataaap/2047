# Auditoria das fases — atualização 0.7.0, 29/10/2026

**O jogo inteiro ainda não está concluído.** Esta revisão considera os seis estágios da reformulação realista, a entrega 0.6.0 de tutorial/assets e as correções 0.7.0. Não confundir as quatro fases históricas da 0.4.0 com o novo roteiro.

| Fase | Situação atual | Implementado e verificável | Pendências relevantes |
| --- | --- | --- | --- |
| 1 — Diagnóstico e condução | Implementada na 0.5.0, preservada | Passo fixo, massa/carga, curva diesel/torque/RPM, transmissão automática, ré, frenagem, direção por velocidade, suspensão/raycast, pisos, câmeras e instrumentos | Avaliação humana de peso/conforto e áudio no Windows/GPU real; ajuste fino |
| 2 — Reformulação gráfica | Avanço concreto, ainda parcial | **Oito materiais Poly Haven reais**, PBR local, ARM corrigido, perfis 512/1024/2048; relevo e estradas; Titã GLB com seis rodas físicas; garagem, posto, barris e carros reais; personagens anatômicos provisórios animados | Arte final do Titã/interior e de Dante/NPCs, desgaste por máscaras mais elaborado, iluminação/clima final e ciclo solar; outros materiais enviados ainda sem integração completa |
| 3 — Mar de Cinzas | Região jogável com conteúdo; acabamento parcial | Abrigo explorável, 21 objetivos opcionais do tutorial, posto/oficina, gerador/Tomás, desvio/atalho, bloqueio, recursos e clima, construções reais e streaming | Mais densidade/coerência ambiental, ruínas e detalhes de estrada, acabamento e travessia humana completa |
| 4 — Survival e exploração | Ciclo básico funcional, refinamento pendente | Sair/entrar com F, andar/correr/colidir, duas perspectivas a pé, inventários/capacidade, diesel, água/comida/fadiga, desgaste/reparos, comércio/descanso, NPCs individuais por alvo e diálogo | Arte individual, locomoção autônoma de NPCs, animações de escalada/cabine finalizadas, expansão de diálogos/economia e avaliação humana |
| 5 — Primeira entrega | Vertical slice funcional | Receber Semente, preparar/planejar rota, dirigir com danos, estacionar/desligar, explorar, ligar gerador, calibrar com peças acessíveis, falhar/recuperar/ativar, restaurar chuva/plantas/rota e persistir | Encenação e arte final, navegação geral pela rede, validação humana integral sem diagnóstico/teleportes |
| 6 — Expansão e finais | Parcial | Cinco biomas, sete Núcleos/Cofres sequenciais, perigos/rotas, três secundárias, rádio e restauração local persistida | Narrativa completa, personagens recorrentes desenvolvidos, decisões e quatro finais jogáveis, acabamento das demais regiões. Sete ancoragens não são o final da história |

## Conferência transversal

- **Materiais:** a afirmação de “zero materiais” da auditoria 0.5.1 ficou obsoleta após a adoção do snapshot oficial. Os oito arquivos reais estão no disco e no jogo. Vieram desse repositório, não de um novo download da API bloqueada. O downloader/importador continua disponível. Não são fixtures de diagnóstico.
- **Modelos:** Titã inicial e estruturas estão incorporados. Quatro outros caminhões têm GLB preparado, mas não são selecionáveis/dirigíveis. Não existe progressão funcional GAZ → LP → Peterbilt nem física própria para todos os caminhões enviados.
- **Personagens:** a base MakeHuman CC0 foi adaptada com roupas, detalhes, rig e sete clips originais, usada em Dante, Zeca, Tomás, sobrevivente, Ivani e outros atendentes. São corpos provisórios compartilhados com paletas diferentes, não personagens finais realistas individualizados. O pacote Fab permanece fora por licença não identificada; não é necessário reenviar a mesma pergunta ao usuário.
- **Interações:** seleção central por entidade, posição, distância, direção, raycast e prioridade, com execução do alvo publicado. O próprio colisor do alvo não obstrui sua interação; paredes e outros objetos continuam relevantes. NPC, bomba, gerador e terminal têm identidades diferentes.
- **Semente:** não há depósito paralelo. Falha mantém a carga; sucesso consome e orienta o próximo Cofre. Calibração valida terminal/estacionamento/motor/recursos antes de pagar, usando mochila e Titã acessível. Salvar/carregar preserva esse estado.
- **Mapa:** mostra vias, desvios, objetivos e escolhas registradas. Falta planejador geral que compare automaticamente distância, risco e custo pela rede navegável.
- **Clima/restauração:** poeira, chuva, frentes/perigos, aderência e interferência locais; restauração altera chuva, plantas, barreiras e condições de rota com persistência. Ciclo solar completo e transições profundas dos materiais por restauração ainda faltam.
- **Áudio:** síntese dinâmica ligada a RPM/carga/trocas e efeitos existentes; faltam gravações profissionais licenciadas e avaliação auditiva humana.
- **Câmeras/controles:** três câmeras do caminhão, primeira/terceira pessoa a pé, mouse e colisão; remapeamento completo, gamepad e retrovisores refletivos continuam ausentes. No celular é possível continuar o projeto/conversa, mas os controles de jogo seguem desktop.
- **Saves/API:** três slots, validação e migração 1/2/3, posição, carga, inventários, missões e restauração no libSQL local. GitHub não sincroniza partidas. Não houve deploy Vercel/Turso.
- **Saqueadores:** módulos de regras e visuais existem no snapshot, mas não estão instanciados no coordenador Game; não contar perseguições como sistema atualmente ativo.
- **Finais:** não implementados; finalChoice é um campo inicial/validável. O segredo da Voz não foi revelado antecipadamente.
- **Desempenho:** perfis baixo/médio/alto, streaming, LOD/instâncias/culling, cache e liberação existem. Chromium aqui usa SwiftShader/software: os FPS medidos não validam uma GPU real nem a meta de 60 FPS. Ver relatório atual para medições e limites.

## Evidência

A entrega 0.6.0 registra 113 unitários, build e 18 cenários do navegador bem-sucedidos entre execução integral e repetições focadas, sem afirmar uma única execução integral verde. A 0.7.0 registra os novos resultados, bugs encontrados na regressão e capturas reais em RELATORIO_CORRECOES_CRITICAS.md e evidence/critical-gameplay. Relatórios 0.5.x permanecem históricos.

## Próxima sequência técnica

1. Finalizar arte do veículo/personagens e testar a condução/exploração no Windows com GPU real.
2. Completar acabamento do Mar de Cinzas, iluminação/ciclo solar e economia; fazer uma entrega humana de ponta a ponta.
3. Expandir navegação pela rede, progressão de caminhões e narrativa com decisões.
4. Implementar os quatro finais e verificar a progressão/persistência completa.

Uma função no código, um slot no manifesto ou um campo no save não contam como conteúdo final entregue.

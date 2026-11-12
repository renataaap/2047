# Diagnóstico — contratos, economia e carreira 0.12.0

Base efetiva: branch feat/restauracao-ambiental-0.11.0, commit 69afd07. PR #5 aberto/não integrado; main ainda 4771193/0.10.0. Área limpa antes de criar feat/contratos-economia-0.12.0, sem descarte, merge ou force push. Leituras de AGENTS, README, STATUS, relatórios 0.9/0.10/0.11, roadmap e módulos atuais realizadas.

Baseline executada nesta tarefa: npm test (257/257, 34 arquivos) e npm run build aprovados; logs em evidence/contracts-0.12.0/logs. Os 44 E2Es da 0.11.0 são históricos, não uma nova integral desta atualização. Um cenário focado do comércio será executado antes de modificar a aplicação.

## Pontos confirmados

- Titã: 8.800 kg, seis rodas, berço 6.000 kg. Basculante: 6.500 kg, seis rodas, berço 3.200 kg. Catálogo/tuning preservados.
- Mochila 40 kg e compartimento 240 kg são estoques de suprimentos. Semente 2.200 kg usa massa própria. O contrato terá manifesto separado; capacidade compara Semente + suprimentos do caminhão + mercadoria. Diesel no tanque entra na massa física, sem ocupar o volume do berço.
- VehiclePhysics.setPayload já atualiza massa/inércia Rapier, porém só soma Semente/suprimentos/diesel. Estender de modo aditivo, preservando o comportamento sem mercadoria.
- Frota mantém combustível/componentes/inventários individuais, GarageController confirma com save/rollback. Aproveitar a mesma fila e revisão otimista, incluindo transferência de manifesto.
- Comercio atual tem preços duplicados entre UI/regras de postos e ofertas fixas nos abrigos. Centralizar a cotação e usar o mesmo resultado ao cobrar. Estoques existentes não serão recriados.
- GPS/planRoute usam grafo real. Reutilizar destinos/caminhos; foco do contrato separado da preferência de destino da campanha.
- Cinza Nova já possui pátio industrial em (-390,-820), rede, chão e equipamentos. Oficina do Cotovelo em (10.1,-550) tem pátio viário de 26×40 m. Começar com esse ciclo; ampliar a pontos existentes com bays auditáveis.
- Titã tem baú fechado com atlas opaco e pivôs corretos. Carga precisa caber no interior; preparar abertura traseira por geometria local de instância, preservando GLB/material/cabine. Basculante possui caçamba aberta com acomodação própria. Não usar transparência estrutural para mostrar mercadoria.

## Arquitetura e políticas

Dados estruturados em módulos puros de contratos/economia/carreira; controlador coordena interações, gravação e rollback. Sem outro loop/API de movimento. Estado opcional/versionado em schema 3; três slots e legado preservados.

Ofertas determinísticas, poucas por quadro e renovação por tempo de simulação ativa. Não renovar por aceitar/cancelar nem pagar antes da entrega. Carregamento/descarregamento exige posição, alinhamento, parada e motor desligado. Contratos normais sem prazo; urgentes com prazo generoso e consequência explícita. Cargo lacrado não vira itens gratuitos ao cancelar. Cargas/XP não serão duplicadas após save/load.

Recompensas em sucata/peças existentes, com orçamento para diesel/desgaste e espaço real nos estoques; progresso profissional desbloqueia trabalhos/informações, sem bônus mágicos à aderência. Economia usa região, estoque, demanda e restauração em valores inteiros/limites; não há reposição infinita por Núcleo.

## Validação planejada

Testes puros de estados, preço/estoque, massa/capacidade, migração, XP e duplicação. Rapier real com os dois caminhões, carga visível, percurso Cinza Nova→Oficina e retorno. E2Es focados antes da integral, npm test/build/test:e2e sequenciais, hashes congelados na integral, recuperação após reinício. Screenshots do jogo; frames de diagnóstico não são viagens humanas. Windows/GPU física, audição e balanceamento humano precisam de roteiro próprio.

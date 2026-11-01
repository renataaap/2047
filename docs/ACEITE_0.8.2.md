# Aceite e limites da 0.8.2

Código em feat/polimento-0.8.2, sobre main d8a3b2a/0.8.1. A versão está preparada para revisão. Arte final e validação Windows não são presumidas. O resultado final de testes fica no relatório e em evidence/polish-0.8.2/validation.json.

| Critério | Entrega verificável | Limite ou confirmação necessária |
| --- | --- | --- |
| Cabine mais detalhada | Geometria modular, bancos/portas/pedais, ventilação, rádio, materiais, luz local; capturas internas e laterais | Acabamento procedural original; retrovisores sem câmera traseira dinâmica |
| Exterior correto e opaco | GLB/material por função preservado; detalhes do chassi e degraus; seis rodas | Conferência Windows/GPU e condução humana |
| Instrumentos funcionais | Velocidade, RPM, combustível, temperatura, marcha e indicadores reais; teste de visada e condução | Volante pode cobrir parcialmente o mostrador durante manobras |
| Dante melhorado | Roupas com volume, mochila, costuras, botas, barba; comparação frente/costas | Base anatômica/rosto ainda provisórios |
| NPCs distinguíveis | Zeca, Tomás, Ivani, sobrevivente e Marta com peças, silhuetas e equipamentos próprios | Arte facial final e expressões continuam futuras |
| Mar de Cinzas | Bancadas, utensílios, mobiliário, ferramentas, peças, vegetação seca/sucata e fábricas refinadas | Outras regiões não receberam o mesmo acabamento nesta versão |
| Posto/oficina | Loja com abertura física e visual livre; balcão/prateleira; oficina equipada e luz de trabalho | Não é uma reconstituição de todos os interiores do continente |
| Acessos dos locais | Testes por caminhada/Rapier e ações finitas existentes preservados | Travessia humana longa no Windows ainda necessária |
| Iluminação | Relógio solar preservado, interior da cabine e luzes de tarefa de dia/noite | Ajuste fino de conforto/contraste em monitores reais |
| Entrada/saída e animação | Busca segura de posição, gesto, pose sentada, restauração dos ossos e transição | Contatos completos de mãos/pés nos degraus e porta articulada não implementados |
| Saves legados | Schema existente e migração preservados; diário derivado de campos já salvos | Sincronização de saves entre aparelhos não faz parte desta atualização |
| Diário | Entrada a pé registra descoberta; inspeção/recolha atualiza registro; sem recurso automático | Registros ambientais, sem outro sistema de missão |
| Campanha | Sete Núcleos/Sementes, tutorial e diálogos mantidos; hashes narrativos idênticos | Quatro finais ainda não implementados |
| Otimização | Setores, lotes por material, instâncias, LOD, cache e descarte preservados; métricas reais no relatório | Mais detalhes custam chamadas/triângulos; FPS de GPU não medido |
| Comparação visual | 20 pares reais no Baixo e sete ângulos extras; três amostras no Alto e uma no Médio | Mudança intencional da altura dos olhos altera enquadramento interno |
| Testes | Base repetida 167 unitários/build/25 E2Es; final 175 unitários/25 arquivos, build e 28/28 numa única integral de 30,8 min; reinício real aprovado | Chromium/SwiftShader; a integral não substitui Windows/GPU ou sessão humana. Tentativas e rechecagens documentadas separadamente |
| Primeiros 30 minutos | Checklist manual detalhado, automações separadas dos sistemas | Sessão humana sem teleportes não executada |

Os assets externos mantêm suas licenças. Renafox permanece CC BY-NC; personagens Fab sem licença confirmada continuam fora. Não há liberação comercial global.

Consulte RELATORIO_POLIMENTO_0.8.2.md, INCREMENTOS_0.8.2.md, TESTE_MANUAL_0.8.2.md e ROADMAP_APOS_0.8.0.md. Os limites acima não devem ser convertidos em itens concluídos em relatórios posteriores.

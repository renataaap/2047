# Incrementos da garagem 0.10.0

Base efetiva: main affb786/0.9.1, preservando o hotfix do chão. Branch feat/garagem-frota-0.10.0.

- A / 5821af0: diagnóstico, auditoria dos quatro candidatos, captura anterior e derivação do rig do basculante. Baseline desta tarefa: 201 unitários, build e 1 E2E visual do Titã aprovados.
- Fundação de E / edb6e05: frota opcional no schema 3, estados individuais, custos, troca sem duplicar Semente/recursos e parâmetros por instância. Parâmetros do Titã sem upgrade permanecem iguais à base.
- C e arte de E / a0d5fda: paletas e faixas aplicadas apenas aos materiais de pintura; câmera orbital e rig do segundo veículo, mantendo o modelo original.
- B–E / cd9ffa7: serviços na garagem existente, G ao volante/F na bancada, prévias, compra, acessórios, interior, upgrades, salvamento e troca segura. O veículo ativo conserva a API e os sistemas da campanha.
- Polimento / d2d52a1: preferências de câmera, desgaste também na pintura original, percurso desde Novo jogo, manutenção da indicação antiga do Titã e teste de acesso a pé. Código da aplicação congelado para validação final.

Verificações já realizadas antes da integral: 225 unitários; quatro E2Es de garagem aprovados numa rodada de 8,4 minutos sobre cd9ffa7. Incluem 1.105,5 m do barracão à oficina e 163,6 m com o basculante na cidade, mais manobras locais. Passos originais Rapier a 60 Hz com tempo diagnóstico acelerado; não são sessões humanas. No percurso não houve teleporte diagnóstico ou concessão de recursos. Fixtures locais com Semente são casos separados, declarados no teste.

Primeiras tentativas preservadas: comparação exata de float 1792 versus 1792.0000000000002 corrigida para tolerância; leitura da rotação visual antes do RAF corrigida aguardando render. Logs nos diretórios increment/increment-2. O fluxo posterior increment-3 passou. Não apagar essas tentativas nem apresentá-las como rodadas verdes.

F: semi-1960, semi-baked e tatra-815 seguem preparados, sem compra/ativação. A auditoria encontrou orientação/largura incompatíveis, cabines ainda não adaptadas e necessidade de otimizar o Tatra. Não são anunciados como dirigíveis.

G: 225 unitários, build, 39/39 E2Es integrais e reinício real aprovados; comparação de custos gráficos e relatório final registrados. Windows/GPU real e audição humana permanecem pendentes.

## Escopo mantido

Os quatro módulos narrativos, o GLB original do Titã, TRUCK_TUNING, CabinInterior, SeatedPose, TerrainBlend e PBRLibrary têm hashes idênticos à base affb786; registro em `evidence/garage-0.10.0/protected-source.json`. A parametrização de física e montagem é intencional para o segundo veículo. A integração das três opções restantes não faz parte da lista de veículos homologados.

A integral terminou com 39/39 E2Es em 50,8 minutos sobre d2d52a1; os 208 hashes ficaram iguais durante a execução. b341a65 é um ajuste posterior apenas do harness: esperar o PUT, pois o aviso de sucesso anterior não garantia que a nova leitura já receberia a versão atual. A aplicação não mudou. Dois casos passaram separadamente em 6,1 minutos; o reinício real passou com dados e versão idênticos. A aplicação permaneceu igual; a rodada integral não será renomeada como uma execução desse harness posterior.

Fechamento: logs em evidence/garage-0.10.0/logs, resultados em validation.json, capturas da integral em final e rechecagem/reinício em final-recheck. Nenhuma evidência histórica foi sobrescrita para esconder uma falha. O teste de reinício confirmou a gravação na cidade, combustível, inventários, pinturas, equipamentos e campanha; Windows/GPU física e Turso de produção não foram afirmados como validados.

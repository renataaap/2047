# Garagem 0.10.0 — incremento A

Base real: main affb786/0.9.1, com PRs #2 e #3 integrados. Branch própria feat/garagem-frota-0.10.0, criada com área limpa. A correção de terreno e uniforms permanece obrigatória.

Baseline executada nesta tarefa: 201 unitários, build e E2E de opacidade/Titã (1/1, 2,4 min). Capturas anteriores em evidence/garage-0.10.0/before; a imagem initial-transition registra a tentativa ainda sob a transição e não será usada como comparação artística. Não são os números históricos da 0.9.0.

Garagem existente: CityWorld, prédio x=-320/z=-822, vão voltado para +Z, rua/pátio conectados ao destino garagem-cinza-nova em roadNetwork. A oficina terá faixa de serviço no interior, sem mover cidade ou criar outra garagem.

Auditoria Blender dos quatro arquivos locais em model-audit.json. O dump-truck possui seis rodas originais (três eixos), frente voltada a +Z e assimetria de centragem. Derivação drivable.glb separa os conjuntos originais, corrige -Z e pivôs próprios. Não usa os pivôs do Titã. Rig/materials e contagem de faces em dump-rig.json; original permanece intacto. Fonte ElectroNick/CC BY 4.0, mantida no manifesto/créditos.

semi-1960 tem largura preparada de 8,2 m (orientação inadequada); semi-baked tem rodado largo de 3,89 m e exige revisão de bitola; tatra-815 tem 130 mil triângulos e diversas subpeças de rodas. Continuam candidatos, sem compra/estado dirigível nesta entrega até validação própria.

Arquitetura: catálogo e frota puros compartilhados com validação de saves; garagem controla acesso, transações e prévias; veículo usa tuning por instância com padrão do Titã preservado. campaign.components/inventory.truck e fuel continuam autoritativos para o veículo ativo; captureFleet espelha no save, e veículos estacionados mantêm seus estados isolados. Semente é carga única da campanha, transferida pelo berço existente, sem duplicação de itens. Custos usam peças/sucata/diesel existentes.

Incrementos seguintes: serviços/câmera e personalização; acessórios/upgrades reais; segundo veículo e migração; testes e capturas. Nenhum deles é declarado concluído por esta auditoria.

# 2047: Rede Aurora — garagem e frota 0.10.0

Estado: implementação e validação automatizada concluídas; avaliação Windows/GPU física e audição humana pendentes. Base efetiva **main affb786 / 0.9.1**, preservando o hotfix do chão. Branch **feat/garagem-frota-0.10.0**. Código congelado **d2d52a1**. Nenhuma alteração local anterior foi descartada; não houve force push.

## Garagem no mundo

A garagem municipal existente de Cinza Nova passou a oferecer serviços. Mantém endereço, acesso pelo grafo e piso físico. Recebeu faixa de manutenção, bancada e luminárias. O GPS leva ao pátio; a manobra final ocorre sobre o piso já existente do galpão. Não foi criada uma cidade/garagem paralela.

G abre os serviços com o caminhão parado, dentro da faixa e com motor desligado; F preserva a saída do veículo. A bancada oferece entrada a pé por F nas mesmas condições. A oficina utiliza o mesmo canvas, renderizador, loop e modelos reais do gameplay, com câmera orbital/zoom, vistas frontal/lateral/traseira e cabine. Sweep de câmera respeita os sólidos. A simulação e o relógio pausam durante o serviço. O áudio ambiental reaproveita a síntese original, identificando a oficina como interior; não foram instaladas gravações externas.

## Pinturas, acessórios e interior

Três skins: **Titã Original**, **Aurora Azul** e **Cinzas Vermelhas**. As duas novas têm paletas/faixas diferentes em coordenadas locais do veículo; permanecem presas ao caminhão em movimento. Cor principal/secundária, acabamento e desgaste são ajustáveis na prévia. O mapa original continua sendo usado para textura, luminosidade, desgaste localizado e UVs. Os materiais de pintura são cópias por veículo; borracha, metal, vidros e lentes permanecem separados, mantendo as regras de opacidade da 0.8.1.

A prévia não altera o registro instalado nem cobra recursos. Cancelar restaura o estado atual. Confirmar valida o custo, instala e salva. Skins já adquiridas podem ser reinstaladas; uma cor personalizada pode ter custo de trabalho de 1 sucata.

Equipamentos iniciais: proteção tubular, dois projetores auxiliares vinculados a L e suporte lateral com recipiente vazio. São componentes 3D autorais, com prévia e fixações, sem conceder suprimentos. Os projetores não criam sombras adicionais. Interior: revestimento dos bancos e cor do painel com duas paletas e seleção de cores, reutilizando as texturas e geometria da cabine modular. Não se afirma que houve substituição completa da arte interna ou uso de couro novo.

## Mecânica e veículos

`vehicleTuning` produz parâmetros por instância, sem modificar os globais. Sem upgrades, o Titã mantém exatamente os valores anteriores; testes existentes permanecem na suíte. Foram implementadas três melhorias:

| Melhoria | Efeito real | Contrapartida |
| --- | --- | --- |
| Bomba diesel | Curva de torque e limite de torque do eixo +12% | Consumo específico +5%, além da potência efetivamente solicitada |
| Pneus de terra | Aderência em terra +18% e lama +15% no controlador | Resistência ao rolamento no asfalto +10% |
| Molas reforçadas | Rigidez +18%, compressão +10% na suspensão Rapier | Comportamento mais firme sem carga |

Dois caminhões dirigíveis:

| Modelo | Massa do chassi | Torque-base máximo | Marchas | Rodas | Berço nominal |
| --- | --- | --- | --- | --- | --- |
| Titã Rocha Clara | 8.800 kg | 1.600 Nm | 8 | 6 | 6.000 kg |
| Basculante Municipal | 6.500 kg | 1.050 Nm | 6 | 6 | 3.200 kg |

O basculante deriva do asset local de ElectroNick/CC BY 4.0. A malha original permanece intacta. A cópia `drivable.glb` corrige orientação/centragem, separa seis conjuntos originais e seus pivôs, divide a cabine para visibilidade interna e classifica materiais. Seus pontos de roda, raio, bitola, entre-eixos, colisores, motor e transmissão são próprios. Não recebeu automaticamente os pivôs do Titã. O interior modular foi ajustado ao modelo, com instrumentos reais e câmeras/entrada/saída existentes. O Titã continua disponível na campanha.

Os candidatos **semi-1960**, **semi-baked** e **tatra-815** foram auditados, mas continuam sem compra/ativação: orientação/largura, cabine/rig e otimização pendentes. Arquivos GLB preparados não equivalem a caminhões dirigíveis. Não foram baixados assets novos; há um derivado local licenciado e componentes autorais. Créditos/restrições existentes, incluindo carros CC BY-NC, foram mantidos.

## Economia, troca e persistência

Os serviços consomem peças, sucata ou diesel existentes, da mochila e do compartimento ativo. A recuperação do basculante custa 8 peças/4 sucata; chega com tanque e inventário vazios. Não há moeda nova, recursos gratuitos ou venda/recompensa repetível.

A frota mantém por veículo pintura, interior, peças adquiridas/equipadas, upgrades, combustível, inventário, componentes e temperatura. O estado ativo continua exposto aos sistemas antigos por `campaign.components`, `inventory.truck` e combustível da simulação. `captureFleet` espelha esse estado ao salvar. A troca guarda o veículo anterior e restaura o escolhido; a Semente continua sendo a carga única da campanha. O berço visual acompanha o novo caminhão, sem copiar itens ou missões.

Confirmações são protegidas contra reentrada; o slot existente usa a versão da API. Falha de gravação desfaz a compra/configuração local. A troca prepara o modelo antes de remover a instância anterior e conserva uma instância para rollback até o save concluir. Estados anteriores sem frota recebem somente o Titã, conservando seus dados. O schema 3 e os slots 1–3 foram preservados; a validação adicional rejeita configurações inválidas, propriedade inconsistente e divergência entre inventário/combustível ativo e registro. Preferências da câmera da garagem são salvas.

## Física e gameplay comprovados

O benchmark usa Rapier real, 60 Hz, piso plano, veículo saudável e 30 kg de suprimentos. Em 15 segundos simulados, o Titã sem carga percorreu 167,97 m; com bomba, 180,37 m. Consumo: 0,208 → 0,247 L, incluindo o maior trabalho realizado. Com Semente: 145,77 → 157,14 m. O basculante tem comportamento distinto e sua massa difere em 2.300 kg com a mesma carga. Testes também verificam apoio das seis rodas e deslocamento consistente a 30/60/120 FPS de apresentação. [Dados](evidence/garage-0.10.0/physics-benchmark.json).

O percurso automatizado desde Novo jogo caminhou fisicamente pelo barracão até o Titã, escolheu a garagem em M e percorreu **cerca de 1.105 m**. Instalou pintura, proteção e bomba, saiu e retornou à oficina, recuperou/ativou o basculante, abasteceu e dirigiu mais **cerca de 164 m** até o posto de Cinza Nova. Inclui manobras locais adicionais. Não houve teleporte diagnóstico nem concessão de recursos nesse percurso; simulação original a 60 Hz com tempo diagnóstico acelerado. Não é uma sessão humana em tempo real. Fixtures de garagem com Semente são casos separados.

## Comparação gráfica

Referência equivalente na entrada da garagem: mesma posição física e Baixo/75%/1280×720. Draw calls **112 → 114**, triângulos **166.814 → 166.934**, geometrias residentes **209 → 211**, texturas **112 → 112**, programas **35 → 37**. Não são números de FPS em GPU real.

- [Antes: entrada](evidence/garage-0.10.0/before/garagem.png) · [depois](evidence/garage-0.10.0/after/garagem.png).
- [Original](evidence/garage-0.10.0/final/garage/original.png), [Aurora Azul](evidence/garage-0.10.0/final/garage/aurora-preview.png), [Cinzas Vermelhas](evidence/garage-0.10.0/final/garage/cinzas-vermelhas.png).
- [Interior](evidence/garage-0.10.0/final/garage/interior-personalizado.png), [equipamentos](evidence/garage-0.10.0/final/garage/acessorios-lateral.png), [Titã dirigindo](evidence/garage-0.10.0/final/garage/tita-personalizado-dirigindo.png).
- [Basculante na oficina](evidence/garage-0.10.0/final/garage/basculante-active.png), [cabine](evidence/garage-0.10.0/final/garage/basculante-cabine.png), [na cidade](evidence/garage-0.10.0/final/garage/basculante-cidade.png).

São renderizações reais do jogo. A comparação da entrada usa posicionamento diagnóstico; não prova viagem. A viagem tem evidência separada em journey.json. A primeira captura sob a transição está preservada como tentativa, sem ser usada para fabricar contraste antes/depois.

## Validação e limitações

Baseline executada nesta tarefa: **201 unitários**, build e **1 E2E visual** aprovados. Implementação: **225 unitários/31 arquivos**, build e **4/4 E2Es de garagem** numa rodada de 8,4 minutos sobre cd9ffa7 aprovados antes do último polimento. A suíte integral sobre d2d52a1 terminou com **39/39 E2Es em 50,8 minutos**, sem alteração dos 208 arquivos congelados. [Registro da integral](evidence/garage-0.10.0/integral-result.json) e [log completo](evidence/garage-0.10.0/logs/full-e2e-d2d52a1.log). Depois da integral, **2/2 rechecagens em 6,1 minutos** passaram com o harness b341a65, sem alteração da aplicação. O reinício real também passou: servidor anterior encerrado, porta verificada fechada, processo novo iniciado e save versão 7 recuperado com dados e versão idênticos. A posição carregada permaneceu na cidade; combustível, dois veículos, pinturas, peças instaladas, inventários, Semente e progresso foram conferidos. Validação em SQLite/libSQL local. [Registro final](evidence/garage-0.10.0/validation.json), [reinício](evidence/garage-0.10.0/final-recheck/garage/restart.json), [processos](evidence/garage-0.10.0/final-recheck/garage/server-restart-process.json) e [captura após reinício](evidence/garage-0.10.0/final-recheck/garage/after-server-restart.png). Não são os 196 testes históricos da 0.9.0.

Tentativas anteriores preservadas: comparação exata de float corrigida para tolerância, e rotação visual lida antes do RAF corrigida aguardando render. Não eram falhas de compras ou da física. As rodadas/arquivos são separados e não são somados como uma integral verde. Na auditoria posterior da integral, o arquivo before-restart havia lido a versão 6, ainda na garagem, antes do PUT que concluiu a versão 7 na cidade. O servidor gravou corretamente; [registro do problema de coleta](evidence/garage-0.10.0/persistence-capture-race.json). O commit b341a65 altera somente o harness: aguarda a resposta do PUT e confere posição/combustível, sem mudar a aplicação. As duas verificações afetadas passaram separadamente em final-recheck; a captura anterior fica preservada e não serve de prova de reinício.

Windows/GPU real, audição e sensação humana de direção continuam necessários. Persistência Turso de produção exige ambiente configurado e não será alegada como validada a partir do SQLite local. Cabines específicas, contatos de mãos/escadas e três candidatos adicionais permanecem pendentes, assim como novos pacotes de transmissão e upgrades de tanque/refrigeração/capacidade, fora do primeiro conjunto funcional. [Roteiro Windows](docs/TESTE_MANUAL_GARAGEM_0.10.0.md).

Arquivos principais: `src/game/garage/*`, `VehiclePhysics`, `Engine`, `AutomaticTransmission`, `Powertrain`, integração em `Game`/`Input`/`GameView`, `GaragePanel`, `CityWorld`, schema de save e testes de frota/garagem. O manifesto, o derivado e os créditos identificam a adaptação; nenhum diálogo dos quatro módulos narrativos foi reescrito.

[Lista de arquivos de código, assets, scripts e documentação alterados](evidence/garage-0.10.0/changed-files.txt). Capturas e logs ficam separados nessa mesma raiz de evidências. [Hashes protegidos](evidence/garage-0.10.0/protected-source.json) confirmam a preservação dos quatro módulos narrativos, modelo original do Titã, parâmetros originais, cabine modular, pose sentada e correção do terreno.

## Continuidade e próximos incrementos

As entregas atuais aceitam os dois veículos homologados, mantendo uma única Semente e a sequência da campanha. Não foi criada uma exigência narrativa nova por ID de veículo. O Titã permanece próprio e disponível; não existe venda que permita perdê-lo. Contratos exclusivos futuros precisarão declarar e testar suas restrições, sem reescrever as falas atuais.

Próximos trabalhos: homologar separadamente os três candidatos restantes; produzir cabines específicas e melhorar contatos das mãos/escadas; expandir refrigeração, tanque e capacidade com custos e efeitos reais; avaliar pintura, áudio, faróis e dirigibilidade em Windows/GPU física. Economia dinâmica, contratos, facções, rotinas e finais continuam como roadmap, sem serem anunciados como sistemas desta garagem.

## Rodadas e commits verificáveis

| Verificação | Checkpoint | Resultado |
| --- | --- | --- |
| Baseline desta tarefa | affb786 / 0.9.1 | 201 unitários, build, 1 E2E focado |
| Fluxos incrementais | cd9ffa7 | 4/4 E2Es de garagem, 8,4 min |
| Unitários e build finais | d2d52a1 | 225/225 em 31 arquivos; build aprovado |
| Suíte integral | d2d52a1 | 39/39, 50,8 min, fonte/testes congelados |
| Harness de gravação fortalecido | b341a65 | 2/2 focados, 6,1 min; aplicação idêntica |
| Reinício do servidor | b341a65 | dados/versão idênticos e modelo real carregado |

As quatro rodadas anteriores não são somadas como novos cenários da integral. Os logs completos ficam em [evidence/garage-0.10.0/logs](evidence/garage-0.10.0/logs). Incrementos de implementação e seus commits estão no documento de incrementos. Não houve force push, descarte de alterações locais ou reescrita de diálogos.

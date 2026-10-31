# Depois da 0.8.0 — sistemas planejados, não entregues

Não ativar sistemas por um campo de save ou botão decorativo. Cada expansão precisa de regras, interface, persistência e teste de travessia. Preservar economia/estoques, bagWeight, capacidade, transações atômicas, física, interações e diálogos atuais.

| Sistema futuro | Base existente e integração prevista | Condição para considerar funcional |
| --- | --- | --- |
| Economia dinâmica | Estoques locais e transact; política pura de preços por região, escassez, restauração e reputação | Mesma cotação na indicação e cobrança, sem arredondamento explorável, estoque/preço persistentes e testes de compra/venda |
| Contratos de transporte | Inventários e massa real de carga | Aceitar → reservar carga → transportar sem teleporte → entregar com peso/capacidade/estado validados; impedir recompensa duplicada |
| Código da Última Estrada | Diálogos e decisões preservados | Regras locais comunicadas antes da consequência; custos e responsabilidades explícitos; jamais punir por regra invisível |
| Facções e reputação | Abrigos e missões existentes | Identidades/objetivos definidos, alterações por decisões reais, persistência e efeitos proporcionais no comércio/contratos |
| Caminhões adicionais | Quatro GLBs candidates com licença registrada; decoração parada não equivale a veículo dirigível | Auditar rodas/pivôs por modelo, suspensão, dimensões/centro de massa, cockpit, instrumentos, física, áudio e migração da seleção no save |
| Eventos da estrada | Setores, reservas e relógio persistente | Agendador determinístico com intervalos, possibilidade de ignorar e retorno seguro, sem spawn na cabine/pista e sem interromper diálogos |
| NPCs com rotinas | Âncoras individuais, CharacterActor e animação in-place | Rotas livres, controlador físico/nav adequado, horários, retorno ao atendimento e seleção de alvos acompanhando a posição real |
| Narrativa e quatro finais | Missões, decisões e sete ancoragens | Escrita aprovada e integrada às decisões; Renascimento, Renascimento parcial, Último destino e Segredo da Voz precisam de condições testáveis. Não revelar o mistério antecipadamente |

Primeiro estabilizar ambientação, locais exploráveis e atmosfera da 0.8.0; depois priorizar uma dessas expansões com escopo próprio. O roteiro realista maior continua parcialmente concluído.

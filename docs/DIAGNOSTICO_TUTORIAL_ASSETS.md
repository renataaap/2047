# Diagnóstico protegido — 29/10/2026

- Área local inicial limpa: `renataaap/2047`, main `18079f8`, entrega 0.5.2.
- O novo pedido declara `Da-Hora-stack/2047` como repositório oficial. Seu main `a8a8802` tem histórico independente e acrescenta Estrada Viva, gerador/Tomás, postos/oficinas/saqueadores e oito materiais locais. O STATUS antigo não descreve todo esse conteúdo.
- A implementação continua a partir de `a8a8802` na branch `feat/tutorial-assets`. A main local antiga foi preservada em `checkpoint/interface-0.5.2`; nenhum reset, force push ou substituição da main foi feito.
- Os módulos de diálogos/foco/legendas e ferramentas de assets da entrega 0.5.2 ausentes no snapshot oficial foram recuperados. O painel da estrada e o bloqueio do gerador foram reconectados à interface, preservando as transações oficiais.
- `src/data/campaign.js` contém exatamente as mesmas falas nas duas versões. `src/data/road.js` e demais conteúdos da cópia oficial foram preservados; não há outra revisão textual disponível no workspace. Instruções técnicas do tutorial ficam em módulo separado, sem criar falas definitivas.
- Os oito diretórios Poly Haven contêm arquivos PNG reais de 2048×2048, 16 bits. O manifesto oficial não traz checksums ou perfis otimizados; a etapa C deve validar/preparar os arquivos existentes, sem outro download. A origem é a registrada no snapshot recebido; a rede local continua bloqueando a conferência direta no Poly Haven.
- Dez anexos novos foram transferidos integralmente. As duas cópias GLB do posto têm SHA-256 idêntico. Garagem ZIP/GLB são formatos da mesma obra. Licenças CC BY 4.0 foram encontradas nos ZIPs ou em `asset.extras` dos GLBs; créditos devem acompanhar os derivados.
- Os personagens Fab continuam sem licença identificada; não são incorporados. Os três carros Renafox previamente licenciados para desenvolvimento não comercial foram preservados.

Os relatórios históricos restaurados mantêm sua data/versão; as afirmações antigas de “zero materiais” descrevem a cópia anterior, não o snapshot oficial atual. O relatório desta implementação é a referência de entrega.

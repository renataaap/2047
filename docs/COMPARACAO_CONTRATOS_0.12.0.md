# Carga e entrega — comparação real 0.12.0

Fonte congelada 593e83b. Capturas reais da aplicação nos testes da integral, depois de aguardar opacidade zero tanto da transição de viagem quanto da cabine. Não são mockups, arte externa ou uma avaliação de GPU Windows. As primeiras imagens em focused-3 que ainda mostram o fade foram preservadas e não são usadas abaixo.

| Veículo | Antes da coleta | Carga acomodada |
| --- | --- | --- |
| titan-old | [Vazio](../evidence/contracts-0.12.0/integral-1/contracts/titan-old-empty.png) | [Carregado](../evidence/contracts-0.12.0/integral-1/contracts/titan-old-loaded.png) |
| dump-truck | [Vazio](../evidence/contracts-0.12.0/integral-1/contracts/dump-truck-empty.png) | [Carregado](../evidence/contracts-0.12.0/integral-1/contracts/dump-truck-loaded.png) |

[Gerador no Titã](../evidence/contracts-0.12.0/integral-1/contracts/titan-heavy-generator.png) · [Conferência de entrega](../evidence/contracts-0.12.0/integral-1/contracts/titan-old-delivery-review.png) · [Histórico e pagamento](../evidence/contracts-0.12.0/integral-1/contracts/titan-old-paid.png).

A comparação mostra o custo incremental da mercadoria dentro desta versão. Não é uma comparação visual perfeitamente pareada entre 0.11.0 e 0.12.0; a referência anterior de Zeca/menu está em baseline-focused, em outro local.

| Veículo | km reais | Diesel da viagem | Materiais / XP | Draw calls vazio → carga | Triângulos vazio → carga | Texturas |
| --- | ---: | ---: | --- | --- | --- | --- |
| titan-old | 0.777 | 0.435 L | 7 / 108 | 105 → 110 | 165152 → 167348 | 70 → 70 |
| dump-truck | 0.754 | 0.438 L | 8 / 156 | 193 → 197 | 217977 → 218341 | 92 → 92 |

Condições: perfil Baixo/escala 0,75, mesma parada/câmera do veículo, sem movimentação física do caminhão entre as imagens pareadas. A iluminação progride um pouco durante a caminhada/coleta. Não medir FPS humano com esses valores. JSON completo em [transport-metrics.json](../evidence/contracts-0.12.0/transport-metrics.json).

O Titã transporta água (630 kg) até Cotovelo; o Basculante leva instrumentos (180 kg) de volta à cidade. As imagens de gerador usam uma carreira sintética prévia, então comprovam modelo, coleta, massa, seis rodas e devolução, não uma carreira humana ou uma entrega pesada completa. As duas viagens comerciais usam a física real e não atribuem posições/velocidades durante o trajeto.

Ainda necessários: avaliação humana de arte, leitura, manobra, diversão, som e desempenho no Windows/GPU real. Fonte não foi alterada durante a integral; o resultado geral da suíte está no relatório da versão.


## Pagamento, recarga e carreira

[Conferência de 99,9% e pagamento de uma peça](../evidence/contracts-0.12.0/polish-final/contracts/near-perfect-quote.png) · [rótulos finais traduzidos](../evidence/contracts-0.12.0/release-ui/contracts/localized-career.png) · [rodapé 0.12.0](../evidence/contracts-0.12.0/release-ui/contracts/version-footer.png).

[Sonda de carga ativa após reinício real do backend](../evidence/contracts-0.12.0/post-integral/active-cargo-loaded-from-slot-2.png) usa o save de API do slot 2; comprova reconstrução visual, não uma viagem até essa pose. [Manobra física de saída](../evidence/contracts-0.12.0/post-integral/native-exit-manoeuvre.png) · [chegada do segundo trabalho real](../evidence/contracts-0.12.0/post-integral/second-physical-job-arrival.png) · [duas entregas, 264 XP e nível 2](../evidence/contracts-0.12.0/post-integral/career-level-2-two-real-jobs.png). A sequência usa o save efetivo da primeira entrega do Titã, controles e física, sem XP sintético. O canhoto registra 1,57 km acumulados e os dados permanecem após recarga. Essa captura ainda exibe os rótulos antigos; a imagem localizada acima registra a correção final, sem reescrever a evidência original.

As capturas complementares de polimento são de 513b9a4; a rechecagem localizada é de 81b8142. A aplicação não mudou durante nenhuma dessas rodadas. Não se mistura a contagem da integral de 51 casos com as rechecagens de seis e um casos.

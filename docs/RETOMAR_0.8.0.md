# Retomar — 2047: Rede Aurora 0.8.0

A expansão A–E foi implementada e validada. Não reaplicar os prompts anteriores nem reiniciar o projeto. Repositório oficial privado renataaap/2047, branch feat/tutorial-assets, release v0.8.0. Código final antes dos documentos: 7115e0f; base 32d55b7. Ler AGENTS, STATUS e RELATORIO_EXPANSAO_0.8.0.md.

## Estado funcional

- AmbientWorld: composições por seed/bioma/setor, moradia, estabelecimentos, áreas reservadas, geometrias agrupadas, instâncias e descarregamento. Três POIs com rampas/colliders reais e reservas/informações finitas em campaign.world.
- DayNight: relógio persistente e pausado no fixedUpdate, duração 24/48/96, céu no plano distante, PMREM diurna neutra, luzes locais limitadas. Faróis adequados à noite.
- AmbientAudio: síntese espacial original no AudioContext do motor, passos e sinais, pausa imediata. Não são gravações profissionais.
- Acessórios nos ossos existentes; arte anatômica/rostos ainda provisórios. Nenhum controlador refeito. Caçamba parada usa Box3/base real e lease; não é veículo dirigível novo.
- PBRLibrary sincroniza dados emprestados antes de liberar variantes. Concreto/madeira com mapas próprios têm prioridade. Oito Poly Haven locais preservados; seis ZIPs extras não foram transferidos por limite de 32 MiB.
- Tutorial, Titã/seis rodas, Rapier, câmbio, sobrevivência, comércio, sete Núcleos, interações e saves 1–3 preservados. Quatro módulos narrativos têm hashes idênticos à base.

## Verificação nova, sem confundir com a 0.7.0

161 unitários/23 arquivos e build aprovados. Reinício real de dois processos Next recuperou payload exato em banco temporário isolado, sem tocar banco/cookie do usuário. Capturas WebGL inspecionadas: cinco pares com mesmas poses, moradia, estabelecimentos, três POIs, regiões e noite com/sem faróis.

24 cenários únicos de navegador aprovados ENTRE RODADAS. A integral inicial teve 16/23. Outra execução foi interrompida pelo ambiente após 14 aprovações/1 falha. Saída/sobrevivência rechecadas passaram; sequência restante 12/12; polimento 2/2 e contato final 1/1. Não alegar uma integral de 24 verde. Logs/detalhes em evidence/world-0.8.0/validation.json. Erros originais preservados.

SwiftShader foi o renderizador, com FPS muito baixo. Não equivale a Windows/GPU real, sessão longa nem avaliação auditiva humana. Arte final, fachadas/interiores, animações completas de cabine e materiais adicionais continuam pendentes. O continente e os quatro finais não estão concluídos.

## Continuidade

Usar docs/TESTE_MANUAL_0.8.0.md no Windows/GPU e priorizar acabamento pelos resultados. Economia dinâmica, contratos, leis, facções, caminhões extras, eventos, rotinas e finais são apenas docs/ROADMAP_APOS_0.8.0.md. Não avançar automaticamente para esses sistemas.

Publicação de código, histórico, relatórios e assets já autorizada; não perguntar novamente. Usar origin/renataaap, preservar colaboradores e refs, sem force push. O antigo remote official não é o destino atual. GitHub não sincroniza saves locais. Para outro aparelho, CONTINUAR_NO_CELULAR.md.

Não executar duas suítes/capturas WebGL em paralelo. Parar dev antes de build ou scripts/verificar-reinicio.mjs. O servidor foi encerrado para o build final; iniciar npm run dev para jogar localmente. Nenhum deploy ou Turso de produção foi feito.

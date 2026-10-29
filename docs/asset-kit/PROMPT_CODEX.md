# INSTRUÇÃO PARA CODEX — COMPLEMENTAR TEXTURAS DO 2047

Este kit complementa a seleção anterior com materiais adicionais do Poly Haven. Leia `materiais_2047.json` e `README.md`.

1. Inspecione quais texturas, modelos e materiais já existem no repositório. Não baixe duplicatas.
2. Execute `scripts/baixar-polyhaven.mjs` em um ambiente com internet. Verifique o relatório `instalacao.json` e não declare sucesso se houver falha.
3. Instale os mapas em `public/assets/polyhaven/<id>`, usando o argumento `--dest` se necessário.
4. Materialize PBR com MeshStandardMaterial/MeshPhysicalMaterial: cor sRGB; normal OpenGL; mapas numéricos no espaço correto. Ajuste repeat, UV, escala e filtragem.
5. Diferencie materiais por função: asfalto preservado/danificado, ruínas/concreto, oficinas, elementos naturais, materiais internos do caminhão.
6. Para o terreno misture materiais por máscaras e inclinação. Planeje texturas de detalhes e decals, não um único tiling em todo o mapa.
7. **Não substitua** texturas próprias dos NPCs e dos modelos de caminhão por texturas genéricas; só aplique materiais complementares nas malhas/partes corretas e após inspeção de UVs e licença.
8. Dos assets Fab compartilhados: o conjunto "City People Free Samples" é low poly com texturas 256x256, então não deve ser apresentado como NPC fotorealista. Alturas/terrenos exclusivos Unreal/Unity exigem conversão, se os arquivos originais forem acessíveis e a licença permitir.
9. Verifique originalidade/licença dos caminhões Sketchfab, especialmente o asset explicitamente intitulado "Half-Life 2". Não incorpore modelos protegidos ou derivados sem direitos adequados.
10. Gere screenshots reais do jogo antes/depois; execute build e testes de carregamento. Relate o que foi baixado e aplicado, sem ocultar problemas.

Prioridade: Mar de Cinzas, estradas, oficina/abrigo inicial, cabine e ruínas. Vegetação verde fica reservada às regiões restauradas.

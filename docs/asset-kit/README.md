# Kit complementar — 2047: Rede Aurora

**Este pacote inclui o catálogo de 16 materiais PBR complementares, um script Node.js de download e instruções para o Codex.**

**Não contém os mapas de textura binários.** O ambiente de elaboração deste pacote não conseguiu acessar o CDN/API de downloads; o script deve ser executado no ambiente do projeto com acesso à internet.

## Uso

1. Extraia o kit para uma pasta do projeto.
2. Execute `node scripts/baixar-polyhaven.mjs --resolution=1k` para baixar os materiais faltantes.
3. Ou `node scripts/baixar-polyhaven.mjs --resolution=2k --all` para baixar também os 8 materiais Poly Haven selecionados anteriormente.
4. Use `--group=estradas`, `--group=ruinas`, `--group=oficinas`, `--group=caminhoes` ou `--group=natureza` para baixar um grupo.
5. Use `--dest=public/assets/polyhaven` para escolher a pasta de destino no Next.js.

Exemplo dentro da pasta extraída:

`node scripts/baixar-polyhaven.mjs --resolution=2k --all --dest=../public/assets/polyhaven`

## Importante

- O script consulta https://api.polyhaven.com/files/<id> para obter URLs reais, sem inventar URLs de CDN.
- Confirme os mapas disponíveis para cada asset. Nem todo material disponibiliza metalness ou AO separados.
- No Three.js: `map` (cor) deve usar sRGB; normal/roughness/AO/metalness usam dados lineares.
- As texturas **não substituem** UVs/modelos 3D, nem corrigem uma física ruim.
- Para NPCs, preserve as texturas originais incluídas nos modelos e anime as malhas correspondentes; não aplique texturas de solo nos personagens.
- Os produtos Fab podem exigir login/licença e alguns formatos são apenas Unity/Unreal; não foram incluídos nem baixados.
- Assets Poly Haven são CC0; uso da API possui condições próprias, inclusive crédito exigido quando o produto depende da API.

## Links e contexto

Veja `materiais_2047.json` para os links e aplicações de cada textura. Leia `PROMPT_CODEX.md` para orientação de integração.

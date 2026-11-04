# Conferir o chão no Windows — 0.9.1

Esta correção precede a garagem 0.10.0. O limite de texturas é detectado pelo jogo; não é necessário escolher uma qualidade específica para ativar a compatibilidade.

1. Atualize a cópia do projeto para a branch `fix/chao-inicial-0.9.1` e reinicie o servidor do jogo. Preserve o banco de saves e alterações locais. Confira **0.9.1** no menu para evitar testar o servidor antigo.
2. No navegador, use **Ctrl + F5** e inicie uma partida. O piso deve aparecer já no barracão. Saia pela abertura lateral e confira terra, acostamento e estrada.
3. Abra **Esc → Configurações**. Confira **Baixo → Médio → Alto → Baixo**, voltando à viagem a cada mudança. O chão precisa permanecer opaco, texturizado e apoiado no mesmo relevo físico.
4. Entre no Titã com **F**, ligue com **E** e dirija pela estrada. Confira piso nas câmeras externa e interna. Freie mantendo Espaço, desligue e desça com F.
5. Confira a aproximação do Posto Boa Viagem e de Cinza Nova, além de um trecho fora do asfalto. Salve e carregue um slot existente para conferir a continuidade da partida.
6. Abra o console do navegador e procure erros de shader, `MAX_TEXTURE_IMAGE_UNITS`, WebGL ou carregamento de arquivos. Não deve haver erros relacionados ao terreno.

Se o piso ainda estiver ausente, registre a versão exibida no menu, qualidade gráfica, modelo da placa de vídeo, navegador e mensagem do console. A contagem de unidades pode ser consultada no console com:

```js
const gl = document.querySelector('canvas').getContext('webgl2');
gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
```

Os testes automatizados usam Chromium/SwiftShader. A seleção de capacidade pode ser limitada a 16 para exercitar o shader compatível, mas isso não reproduz um driver Windows nem mede desempenho de GPU real. As capturas locais anteriores já tinham chão porque SwiftShader disponibiliza 32 unidades. Elas não são prova de reprodução do problema no computador do jogador.

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: critical-gameplay.spec.js >> alvos reais, Zeca/bomba/Tomás, Dante e duas perspectivas
- Location: tests/e2e/critical-gameplay.spec.js:17:1

# Error details

```
Error: page.evaluate: Error: Controlled physics stepping requires an active development game.
    at debug.step (http://127.0.0.1:3000/_next/static/chunks/src_game_1h03lfluf98st._.js:2250:63)
    at eval (eval at evaluate (:370:30), <anonymous>:7:7)
    at UtilityScript.evaluate (<anonymous>:372:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44)
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - main [ref=e3]:
    - generic "Mundo 3D da Rede Aurora e Titã Rocha Clara" [ref=e4]
    - generic:
      - generic:
        - region "Tutorial" [ref=e5]:
          - generic [ref=e6]: CAPÍTULO 01 — O ÚLTIMO MOTOR
          - generic [ref=e7]:
            - generic [ref=e8]: O abrigo
            - generic [ref=e9]: 1 / 21
          - heading "W A S D Caminhe pelo barracão" [level=2] [ref=e10]:
            - generic [ref=e11]: W A S D
            - text: Caminhe pelo barracão
          - paragraph [ref=e12]: Percorra 3 m. Clique no cenário para olhar com o mouse. Saída pelas portas laterais abertas.
          - progressbar "Progresso do tutorial" [ref=e13]
          - button "Pular tutorial" [ref=e14] [cursor=pointer]
        - generic [aria-hidden]:
          - generic: "NO"
          - generic: "N"
          - generic: NE
          - generic: ▾
        - button "Uma pausa na estrada" [ref=e15] [cursor=pointer]:
          - generic [ref=e18]: ESC
      - navigation [ref=e19]:
        - button "J · Missões" [ref=e20] [cursor=pointer]
        - button "M · Mapa" [ref=e21] [cursor=pointer]
        - button "Tab · Inventário" [ref=e22] [cursor=pointer]
        - button "V · Inspeção" [ref=e23] [cursor=pointer]
        - button "R · Rádio" [ref=e24] [cursor=pointer]
        - button "H · Expedição" [ref=e25] [cursor=pointer]
      - generic:
        - text: EXPLORAÇÃO A PÉ · primeira pessoa · C alternar
        - time: · 09:02 · Manhã
      - generic:
        - generic:
          - text: Hidratação
          - strong: 100%
          - meter "Hidratação 100%"
        - generic:
          - text: Saciedade
          - strong: 100%
          - meter "Saciedade 100%"
        - generic:
          - text: Fadiga
          - strong: 0%
          - meter "Fadiga 0%"
      - complementary "Navegação inercial" [ref=e26]:
        - generic [ref=e27]:
          - generic [ref=e28]: MAPA INERCIAL
          - generic [ref=e29]:
            - button "Ampliar minimapa" [ref=e30] [cursor=pointer]: +
            - button "Ocultar minimapa" [ref=e31] [cursor=pointer]: ×
        - img "Caminhos e interações próximas" [ref=e32]:
          - generic "Rodovia · asfalto"
          - generic "Rodovia · asfalto"
          - generic "Rodovia · asfalto"
          - generic "Sobrevivente" [ref=e36]
          - generic "Cofre 1" [ref=e38]
          - generic [ref=e44]: N ↑
        - generic [ref=e45]: Observe os acessos e interlocutores
        - button "Abrigo 07 2,5 km · posição estimada" [ref=e47] [cursor=pointer]:
          - strong [ref=e48]: Abrigo 07
          - generic [ref=e49]: 2,5 km · posição estimada
      - button "F Conversar com a sobrevivente" [ref=e50] [cursor=pointer]:
        - generic [ref=e51]: F
        - text: Conversar com a sobrevivente
      - generic: WASD mover · Shift correr · Espaço pular · clique para olhar · F interagir
```
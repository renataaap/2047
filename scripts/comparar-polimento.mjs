import {readFile,readdir,writeFile} from 'node:fs/promises';

// Shows the untouched WebGL PNGs side by side. No image edits or external renders.
const root='evidence/polish-0.8.2';
async function captures(stage){
 const map=new Map();
 for(const name of (await readdir(`${root}/${stage}`)).filter(n=>/^capture.*\.json$/.test(n)).sort((a,b)=>Number(a!=='capture.json')-Number(b!=='capture.json')||a.localeCompare(b))){
  const data=JSON.parse(await readFile(`${root}/${stage}/${name}`,'utf8'));
  for(const shot of data.shots)map.set(shot.id,shot.state);
 }
 return map;
}
const before=await captures('before'),after=await captures('after');
const names={menu:'Menu inicial',barracao:'Barracão / bancada',moradia:'Barracão / moradia',estrada:'Estrada inicial',dante:'Dante / costas','dante-rosto':'Dante / frente',sobrevivente:'Sobrevivente do Abrigo 07',zeca:'Zeca / Boa Viagem',oficina:'Oficina do Cotovelo','oficina-bancada':'Oficina / bancada',marta:'Dona Marta',motel:'Motel Última Luz',patio:'Pátio dos Retornantes',balanca:'Balança Rodoviária 07',tomas:'Tomás',ivani:'Mãe Ivani','tita-exterior':'Titã / exterior','tita-interior':'Titã / cabine',entardecer:'Entardecer','noite-farois':'Noite / faróis','cabine-noite':'Cabine / noite','loja-interior':'Interior acessível da loja','cabine-lateral':'Cabine / banco e porta','cabine-pedais':'Cabine / pedais','barracao-noite':'Barracão / noite','loja-noite':'Loja / noite','motel-interior':'Motel / interior'};
const sample=s=>({drawCalls:s.drawCalls,triangles:s.triangles,geometryCount:s.renderResources?.geometries??null,textureCount:s.renderResources?.textures??null,estimatedAssetTextureMiB:s.assets.estimatedTextureBytes/2**20,assetTextures:s.assets.textures,modelSources:s.assets.modelSources,sectors:s.sectors,hour:s.worldTime?.hour,softwareFps:s.averageFps});
const comparisons=[...after].map(([id,s])=>({id,label:names[id]||id,paired:before.has(id),before:before.has(id)?sample(before.get(id)):null,after:sample(s)}));
const profileSamples=[];
for(const stage of ['after-high','after-medium'])for(const [id,s]of await captures(stage))profileSamples.push({stage,id,label:names[id]||id,quality:s.pbr.quality,metrics:sample(s),wheelBindings:s.importedTruck.wheelBindings,assetErrors:s.assets.errors});
await writeFile(`${root}/comparison.json`,JSON.stringify({renderer:'Chromium ANGLE SwiftShader, 1280×720, Baixo, escala 75%',note:'Same diagnostic script, positions, time and quality. The cab eye changed intentionally to fit the real shell; its framing differs. Software timings are not GPU benchmarks. Asset estimate excludes procedural textures; renderer memory is available only after the diagnostic was added. Medium/High samples are separate, unpaired profile checks.',comparisons,profileSamples},null,2)+'\n');
const figures=comparisons.map(p=>`<article id="${p.id}"><h2>${p.label}</h2><div class="pair">${p.paired?`<figure><figcaption>Antes · 0.8.1</figcaption><a href="before/${p.id}.png"><img loading="lazy" src="before/${p.id}.png" alt="${p.label}, antes"></a></figure>`:'<p class="unpaired">Ângulo adicional, sem par anterior. Não representa comparação equivalente.</p>'}<figure><figcaption>Depois · 0.8.2</figcaption><a href="after/${p.id}.png"><img loading="lazy" src="after/${p.id}.png" alt="${p.label}, depois"></a></figure></div><p class="metrics">Draw calls: ${p.before?.drawCalls??'—'} → ${p.after.drawCalls} · Triângulos: ${p.before?.triangles??'—'} → ${p.after.triangles} · Setores: ${p.before?.sectors??'—'} → ${p.after.sectors}</p></article>`).join('\n');
const html=`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>2047 — comparação real 0.8.2</title><style>body{background:#171c1a;color:#ddd8c7;font:16px/1.6 system-ui;margin:0}main{max-width:1440px;margin:auto;padding:30px}h1,h2{font-weight:500}h2{font-size:22px}header{max-width:950px}a{color:#d6bc82}nav{display:flex;flex-wrap:wrap;gap:8px 18px;margin:25px 0}article{border-top:1px solid #536052;padding:18px 0 32px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:14px}figure{margin:0}figcaption{color:#b6b6a4;margin-bottom:8px}img{display:block;width:100%;height:auto}.metrics,.unpaired{font-size:13px;color:#aeb5a6}@media(max-width:800px){.pair{grid-template-columns:1fr}main{padding:16px}}</style><main><header><h1>2047: Rede Aurora — comparação 0.8.1 / 0.8.2</h1><p>Capturas reais do jogo, sem edição dos PNGs. Mesmo roteiro de diagnóstico, posições, horários e perfil Baixo a 75%, em 1280 × 720. Os deslocamentos e horários são de diagnóstico; não houve sessão humana de 30 minutos.</p><p>O olho da cabine foi reposicionado para dentro do modelo, portanto seu enquadramento muda. Materialização do terreno e correção da malha que cobria Ivani são diferenças da implementação, não tratamento das imagens.</p><p>Chromium/SwiftShader: os números descrevem esta renderização por software. Não comprovam FPS em GPU física. <a href="comparison.json">Métricas e limites da comparação</a>.</p></header><nav>${comparisons.map(p=>`<a href="#${p.id}">${p.label}</a>`).join('')}</nav>${figures}</main></html>`;
const profiles=`<section id="profiles"><h2>Conferência adicional de perfis</h2><p>Capturas separadas no Médio/Alto. Não são pares equivalentes à referência no Baixo e não medem GPU física.</p><div class="pair">${profileSamples.map(p=>`<figure><figcaption>${p.label} · ${p.quality}</figcaption><a href="${p.stage}/${p.id}.png"><img loading="lazy" src="${p.stage}/${p.id}.png" alt="${p.label}, perfil ${p.quality}"></a></figure>`).join('')}</div></section>`;
await writeFile(`${root}/comparacao.html`,html.replace('</main>',profiles+'</main>'));
const evidence=`../${root}`;
const markdown=[
 '# Comparação visual real — 0.8.1 / 0.8.2',
 '',
 'Capturas geradas pelo próprio jogo, sem editar os PNGs. Mesmos roteiro de diagnóstico, posições, horários, viewport 1280 × 720 e perfil Baixo a 75%. Os deslocamentos diagnósticos não representam uma sessão humana completa.',
 '',
 'O olho da cabine foi reposicionado para dentro da casca real; seu enquadramento muda intencionalmente. Chromium/ANGLE SwiftShader por software: estes registros não comprovam desempenho em Windows/GPU física.',
 '',
 `São 20 pares e sete ângulos adicionais. [Galeria HTML para abrir localmente](${evidence}/comparacao.html) · [Métricas por cena](${evidence}/comparison.json) · [Relatório completo](../RELATORIO_POLIMENTO_0.8.2.md).`,
 '',
 ...comparisons.filter(p=>p.paired).flatMap(p=>[
  `## ${p.label}`, '', '| Antes · 0.8.1 | Depois · 0.8.2 |', '| --- | --- |',
  `| ![${p.label}, antes](${evidence}/before/${p.id}.png) | ![${p.label}, depois](${evidence}/after/${p.id}.png) |`, '',
  `Draw calls: ${p.before.drawCalls} → ${p.after.drawCalls}. Triângulos: ${p.before.triangles.toLocaleString('pt-BR')} → ${p.after.triangles.toLocaleString('pt-BR')}.`, ''
 ]),
 '## Ângulos adicionais da 0.8.2', '',
 'Sem captura anterior equivalente. Não são pares de comparação.', '',
 ...comparisons.filter(p=>!p.paired).flatMap(p=>[`### ${p.label}`, '', `![${p.label}](${evidence}/after/${p.id}.png)`, '']),
 '## Amostras separadas nos perfis Médio e Alto', '',
 'Estas imagens verificam os perfis e não se misturam aos pares no Baixo. Nenhuma medição de GPU física foi realizada.', '',
 ...profileSamples.flatMap(p=>[`### ${p.label} · ${p.quality}`, '', `![${p.label}, ${p.quality}](${evidence}/${p.stage}/${p.id}.png)`, ''])
].join('\n');
await writeFile('docs/COMPARACAO_VISUAL_0.8.2.md',markdown);
console.log(`${comparisons.filter(p=>p.paired).length} pares reais e ${comparisons.filter(p=>!p.paired).length} ângulos adicionais; PNGs originais preservados.`);

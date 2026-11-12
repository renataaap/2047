import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {evidencePath} from '../helpers/evidence-path.js';
import {createCampaign,receiveSeed,activateCore} from '../../src/game/missions/campaign.js';
import {migrateCampaign} from '../../src/game/survival/expedition.js';
import {upgradeCampaign} from '../../src/game/missions/network.js';
import {ensureStory} from '../../src/game/narrative/story.js';
import {heightAt,roadX,roadHeight} from '../../src/game/world/terrain.js';
import {SHELTERS} from '../../src/data/network.js';
import {CONSEQUENCES} from '../../src/game/world/ChoiceConsequences.js';

// Story 007: capturas comparativas de cada ramo das três escolhas, carregadas de saves reais e
// recarregadas. Câmera posicionada por diagnóstico (photoCamera): prova o cenário, não um percurso.
const dir=evidencePath('choice-consequences-0.14.0');
const state=page=>page.evaluate(()=>window.__GAME_DEBUG__.getState());
const VIEW={// relativo ao abrigo: [câmera dx,dy,dz] e [alvo dx,dy,dz]
 'ch2-water-share':{cam:[-2,3.2,13],look:[-9,.8,1]},
 'ch3-brutus-toll':{cam:[3,3,22],look:[12,1,9]},
 'ch4-titan-part':{cam:[1,3.5,19],look:[11,3,5]},
};
function save(choices){
 const c=createCampaign();receiveSeed(c);activateCore(c);const campaign=upgradeCampaign(migrateCampaign(c));Object.assign(ensureStory(campaign).choices,choices);
 if(choices['ch3-brutus-toll'])campaign.story.scenes['brutus-meeting']='skipped';// Garcia já encontrado: a cena não interfere na captura
 return campaign;
}
async function boot(page,choices,shelter){
 const s=SHELTERS.find(x=>x.id===shelter),pz=s.z+14,px=s.x+(s.x<0?-2:2),tz=s.z+40,campaign=save(choices);
 const data={schemaVersion:3,truck:{position:[roadX(tz),roadHeight(tz)+1.7,tz],rotation:[0,0,0,1]},player:{position:[px,heightAt(px,pz)+1,pz]},context:'walking',fuel:120,temperature:30,engineOn:false,campaign};
 await page.request.get('/api/saves');await page.request.delete('/api/saves/1');expect((await page.request.post('/api/saves',{data:{slot:'1',data}})).status()).toBe(201);
 await page.goto('/');await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled({timeout:90000});await page.getByRole('button',{name:'Continuar',exact:true}).click();
 await expect.poll(async()=>(await state(page)).mode,{timeout:60000}).toBe('walking');return s;
}
async function photo(page,id,s,name){
 const v=VIEW[id],y=heightAt(s.x,s.z);
 await page.evaluate(p=>window.__GAME_DEBUG__.photoCamera(p),{pos:[s.x+v.cam[0],y+v.cam[1],s.z+v.cam[2]],look:[s.x+v.look[0],y+v.look[1],s.z+v.look[2]],fov:50});
 await page.waitForTimeout(2500);await page.screenshot({path:`${dir}/${name}.png`});await page.evaluate(()=>window.__GAME_DEBUG__.photoCamera(null));
}

for(const [id,d] of Object.entries(CONSEQUENCES)){
 test(`consequência visível: ${id}, cada ramo e a linha de base sem escolha`,async({page})=>{
  test.setTimeout(300000);await mkdir(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1280,height:720});await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
  const report=[];
  let s=await boot(page,{},d.site);await expect.poll(async()=>(await state(page)).consequences?.built?.includes(id)).toBe(true);
  expect((await state(page)).consequences.visible[id]).toBeNull();await photo(page,id,s,`${id}-sem-escolha`);
  for(const option of d.options){
   s=await boot(page,{[id]:option},d.site);
   await expect.poll(async()=>(await state(page)).consequences?.visible?.[id]).toBe(option);
   const st=await state(page);expect(st.cutscene??null).toBeNull();expect(st.campaign.story.choices[id]).toBe(option);
   await photo(page,id,s,`${id}-${option}`);report.push({id,option,drawCalls:(await state(page)).drawCalls,fps:(await state(page)).fps});
  }
  await writeFile(`${dir}/${id}.json`,JSON.stringify(report,null,1));expect(errors).toEqual([]);
 });
}

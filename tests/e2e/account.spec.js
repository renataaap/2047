import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {evidencePath} from '../helpers/evidence-path.js';
import {createCampaign,receiveSeed} from '../../src/game/missions/campaign.js';
import {upgradeCampaign} from '../../src/game/missions/network.js';
import {migrateCampaign} from '../../src/game/survival/expedition.js';

// 0.15: criar conta leva as partidas deste navegador; sair esconde; entrar em outro navegador
// (cookies novos) traz de volta e Continuar carrega a partida.
const dir=evidencePath('account-0.15.0');
const save=()=>{const raw=createCampaign();receiveSeed(raw);const c=upgradeCampaign(migrateCampaign(raw));return {schemaVersion:3,truck:{position:[0,2,5],rotation:[0,0,0,1]},player:{position:[-3,1,5]},context:'walking',fuel:120,temperature:30,engineOn:false,campaign:c};};
async function menu(page){
 await page.setViewportSize({width:1280,height:720});await page.addInitScript(()=>localStorage.setItem('aurora-settings',JSON.stringify({quality:'baixo',scale:.75,volume:0})));
 await page.goto('/');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:90000});
}
async function openAccount(page){await page.getByTestId('menu-account').click();await expect(page.getByRole('heading',{name:'Conta',exact:true})).toBeVisible();}

test('conta: criar levando a partida, sair, entrar em outro navegador e continuar',async({browser})=>{
 test.setTimeout(300000);await mkdir(dir,{recursive:true});const errors=[];
 const username=`dante${randomUUID().slice(0,6)}`,password='titan rocha clara';
 // Navegador A: uma partida sem conta.
 const a=await browser.newContext(),pa=await a.newPage();pa.on('pageerror',e=>errors.push(e.message));
 await pa.request.get('/api/saves');expect((await pa.request.post('/api/saves',{data:{slot:'1',data:save()}})).status()).toBe(201);
 await menu(pa);await expect(pa.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled();
 await expect(pa.getByTestId('menu-account')).toHaveText('Entrar / Criar conta');
 await openAccount(pa);await pa.waitForTimeout(800);await pa.screenshot({path:`${dir}/1-sem-conta.png`});
 await pa.getByRole('tab',{name:'Criar conta'}).click();
 await pa.getByLabel('Nome de usuário').fill('ab');await pa.getByLabel('Senha').fill('curta');// o navegador barra antes do servidor
 await pa.getByRole('button',{name:'Criar conta',exact:true}).last().click();await expect(pa.getByRole('status')).toHaveCount(0);
 await pa.getByLabel('Nome de usuário').fill(username.toUpperCase());await pa.getByLabel('Senha').fill(password);
 await pa.getByRole('button',{name:'Criar conta',exact:true}).last().click();
 await expect(pa.getByRole('status')).toHaveText('Conta criada. A partida deste navegador agora está na conta.');
 await expect(pa.getByTestId('account-name')).toHaveText(username);await pa.screenshot({path:`${dir}/2-conta-criada.png`});
 // Sair: este navegador volta a jogar sem conta e não mostra mais a partida.
 await pa.getByRole('button',{name:'Sair da conta'}).click();await expect(pa.getByRole('status')).toHaveText('Você saiu da conta.');
 await pa.getByRole('button',{name:'Voltar'}).click();await expect(pa.getByRole('button',{name:'Continuar',exact:true})).toBeDisabled();
 await expect(pa.getByTestId('menu-account')).toHaveText('Entrar / Criar conta');await pa.screenshot({path:`${dir}/3-depois-de-sair.png`});
 // Navegador B (sem cookies): senha errada, depois certa; a partida volta e carrega.
 const b=await browser.newContext(),pb=await b.newPage();pb.on('pageerror',e=>errors.push(e.message));
 await menu(pb);await expect(pb.getByRole('button',{name:'Continuar',exact:true})).toBeDisabled();
 await openAccount(pb);await pb.getByLabel('Nome de usuário').fill(username);await pb.getByLabel('Senha').fill('senha errada!');
 await pb.getByRole('button',{name:'Entrar',exact:true}).last().click();await expect(pb.getByRole('status')).toHaveText('Usuário ou senha incorretos.');
 await pb.getByLabel('Senha').fill(password);await pb.getByRole('button',{name:'Entrar',exact:true}).last().click();
 await expect(pb.getByRole('status')).toHaveText('Bem-vindo de volta.');await pb.screenshot({path:`${dir}/4-entrou-outro-navegador.png`});
 await pb.getByRole('button',{name:'Voltar'}).click();await expect(pb.getByTestId('menu-account')).toHaveText(`Conta · ${username}`);
 await expect(pb.getByRole('button',{name:'Continuar',exact:true})).toBeEnabled();await pb.getByRole('button',{name:'Continuar',exact:true}).click();
 await expect.poll(()=>pb.evaluate(()=>window.__GAME_DEBUG__?.getState().mode),{timeout:60000}).toBe('walking');
 const st=await pb.evaluate(()=>window.__GAME_DEBUG__.getState());expect(st.campaign.seed.received).toBe(true);
 await pb.screenshot({path:`${dir}/5-partida-carregada.png`});
 await writeFile(`${dir}/result.json`,JSON.stringify({username,errors},null,1));expect(errors).toEqual([]);
 await a.close();await b.close();
});

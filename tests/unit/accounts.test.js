import {test,expect,afterEach,afterAll} from 'vitest';
import {randomUUID} from 'node:crypto';
import {ACCOUNT_RULES,normalizeUsername,validUsername,validPassword,hashPassword,verifyPassword,newSessionToken,validTokenShape,tokenHash,lockAfterFailure,readSessionToken} from '../../src/lib/auth.js';
import {withIdentity} from '../../src/lib/api.js';
import {register,login,logout,me,MESSAGES} from '../../src/lib/accountRoutes.js';
import {createSave,listSaves,deleteSave,findAccountByUsername,deleteAccount,closeRepository} from '../../src/lib/repository.js';
import {createCampaign} from '../../src/game/missions/campaign.js';
import {upgradeCampaign} from '../../src/game/missions/network.js';

// 0.15 — contas: regras puras e o fluxo das rotas sobre o banco local (ids aleatórios, limpeza no fim).
const created=[],players=new Set();
afterEach(()=>{});
afterAll(async()=>{for(const u of created){const a=await findAccountByUsername(u);if(a){for(const s of ['1','2','3'])await deleteSave(a.playerId,s);await deleteAccount(a.id);}}for(const p of players)for(const s of ['1','2','3'])await deleteSave(p,s);closeRepository();});

test('regras de usuário e senha',()=>{
 expect(normalizeUsername('  Dante.Rocha ')).toBe('dante.rocha');
 for(const ok of ['dan','dante_rocha','titã'.replace('ã','a'),'a'.repeat(20),'x-1.2'])expect(validUsername(ok),ok).toBe(true);
 for(const bad of ['da','a'.repeat(21),'_dante','dante rocha','dantê','',null,'<script>'])expect(validUsername(bad),String(bad)).toBe(false);
 expect(validPassword('1234567')).toBe(false);expect(validPassword('12345678')).toBe(true);expect(validPassword('x'.repeat(129))).toBe(false);expect(validPassword(12345678)).toBe(false);
});

test('senha com scrypt e sal: confere, rejeita e nunca guarda o texto',async()=>{
 const h=await hashPassword('caminhao velho'),h2=await hashPassword('caminhao velho');
 expect(h).toMatch(/^scrypt\$16384\$8\$1\$[A-Za-z0-9_-]+\$[A-Za-z0-9_-]+$/);expect(h).not.toBe(h2);expect(h).not.toContain('caminhao');
 expect(await verifyPassword('caminhao velho',h)).toBe(true);expect(await verifyPassword('caminhao velhO',h)).toBe(false);
 expect(await verifyPassword('x',undefined)).toBe(false);expect(await verifyPassword('x','scrypt$1$1$1$a$b')).toBe(false);
});

test('token de sessão: 256 bits, só o hash é guardado; bloqueio depois de 5 erros',()=>{
 const t=newSessionToken();expect(validTokenShape(t)).toBe(true);expect(tokenHash(t)).toMatch(/^[a-f0-9]{64}$/);expect(tokenHash(t)).not.toContain(t);
 expect(readSessionToken(new Request('http://x/',{headers:{cookie:`a=1; aurora_session=${t}`}}))).toBe(t);
 expect(readSessionToken(new Request('http://x/',{headers:{cookie:'aurora_session=../../etc'}}))).toBeNull();
 expect(lockAfterFailure(ACCOUNT_RULES.maxFailures-1)).toBeNull();expect(lockAfterFailure(ACCOUNT_RULES.maxFailures,0)).toBe(new Date(ACCOUNT_RULES.lockSeconds*1000).toISOString());
});

// Navegador simulado: guarda os cookies que o servidor manda, como um navegador real.
function browser(){
 const jar=new Map();
 const call=async(route,method='POST',body)=>{
  const cookie=[...jar].map(([k,v])=>`${k}=${v}`).join('; ');
  const res=await withIdentity(route)(new Request('http://127.0.0.1:3000/api/auth',{method,headers:{cookie,...(body?{'content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined}),{});
  for(const c of res.headers.getSetCookie()){const [pair,...attrs]=c.split(';');const [k,v]=pair.split('=');if(attrs.some(a=>a.trim()==='Max-Age=0'))jar.delete(k);else jar.set(k,v);}
  return {status:res.status,json:await res.json(),cookies:res.headers.getSetCookie()};
 };
 return {jar,call,playerId:()=>jar.get('playerId')?.split('.')[0]};
}
const save=()=>({schemaVersion:3,truck:{position:[0,2,5],rotation:[0,0,0,1]},player:{position:[-3,1,5]},context:'walking',fuel:120,temperature:30,engineOn:false,campaign:upgradeCampaign(createCampaign(15))});

test('cadastro leva os saves deste navegador; sair esconde; entrar em outro navegador traz de volta',async()=>{
 const username=`t${randomUUID().slice(0,8)}`;created.push(username);
 const a=browser();await a.call(me,'GET');const anon=a.playerId();players.add(anon);await createSave(anon,'1',save());
 const reg=await a.call(register,'POST',{username:username.toUpperCase(),password:'senha-longa-1'});
 expect(reg.status).toBe(201);expect(reg.json).toEqual({account:{username},saves:1});
 expect(reg.cookies.find(c=>c.startsWith('aurora_session='))).toMatch(/HttpOnly; SameSite=Lax; Max-Age=2592000/);
 expect((await a.call(me,'GET')).json).toEqual({account:{username}});
 expect((await a.call(register,'POST',{username:'outra',password:'senha-longa-1'})).json.error.code).toBe('SIGNED_IN');
 // Sair: sessão encerrada e identidade anônima nova, sem acesso aos saves da conta.
 await a.call(logout);expect((await a.call(me,'GET')).json).toEqual({account:null});expect(a.playerId()).not.toBe(anon);players.add(a.playerId());
 expect((await listSaves(a.playerId())).length).toBe(0);
 // Outro navegador com um save próprio no slot 2: entra e os dois saves ficam na conta.
 const b=browser();await b.call(me,'GET');players.add(b.playerId());await createSave(b.playerId(),'2',save());await createSave(b.playerId(),'1',save());
 const ok=await b.call(login,'POST',{username,password:'senha-longa-1'});
 expect(ok.status).toBe(200);expect(ok.json.moved).toEqual(['2']);expect(ok.json.kept).toEqual(['1']);// slot 1 já ocupado na conta: nunca sobrescreve
 const account=await findAccountByUsername(username);expect((await listSaves(account.playerId)).map(s=>s.slot)).toEqual(['1','2']);
 // Sair neste navegador: o save que ficou (slot 1) volta a aparecer; os da conta não.
 const before=b.playerId();await b.call(logout);expect(b.playerId()).toBe(before);expect((await listSaves(b.playerId())).map(s=>s.slot)).toEqual(['1']);
});

test('nome repetido, dados inválidos, senha errada genérica e bloqueio após 5 tentativas',async()=>{
 const username=`t${randomUUID().slice(0,8)}`;created.push(username);
 const a=browser();await a.call(register,'POST',{username,password:'senha-longa-1'});players.add(a.playerId());
 const b=browser();
 expect((await b.call(register,'POST',{username,password:'outra-senha-1'})).json.error).toEqual({code:'TAKEN',message:MESSAGES.TAKEN});
 expect((await b.call(register,'POST',{username:'x',password:'1'})).json.error.code).toBe('VALIDATION');
 const unknown=await b.call(login,'POST',{username:'naoexiste'+randomUUID().slice(0,6),password:'qualquer-senha'});
 const wrong=await b.call(login,'POST',{username,password:'senha-errada-1'});
 expect(unknown.status).toBe(401);expect(wrong.status).toBe(401);expect(unknown.json).toEqual(wrong.json);// não revela se o usuário existe
 for(let i=0;i<ACCOUNT_RULES.maxFailures-1;i++)await b.call(login,'POST',{username,password:'senha-errada-1'});
 const locked=await b.call(login,'POST',{username,password:'senha-longa-1'});expect(locked.status).toBe(429);expect(locked.json.error.code).toBe('LOCKED');
 players.add(b.playerId());
});

test('sessão adulterada é ignorada e removida; saves seguem a identidade anônima',async()=>{
 const a=browser();await a.call(me,'GET');players.add(a.playerId());a.jar.set('aurora_session','A'.repeat(43));
 const r=await a.call(me,'GET');expect(r.json).toEqual({account:null});expect(r.cookies.some(c=>c.startsWith('aurora_session=;')&&c.includes('Max-Age=0'))).toBe(true);
});

test('limites mostrados na interface são os mesmos do servidor',async()=>{
 const {ACCOUNT_COPY}=await import('../../src/data/account.js');
 expect(ACCOUNT_COPY.rules).toEqual({usernameMin:ACCOUNT_RULES.usernameMin,usernameMax:ACCOUNT_RULES.usernameMax,passwordMin:ACCOUNT_RULES.passwordMin,passwordMax:ACCOUNT_RULES.passwordMax});
});

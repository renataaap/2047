import {randomUUID} from 'node:crypto';
import {identity,readBody,InvalidInput} from './api.js';
import {ACCOUNT_RULES,normalizeUsername,validUsername,validPassword,hashPassword,verifyPassword,dummyVerify,newSessionToken,tokenHash,sessionCookie,clearSessionCookie,lockAfterFailure} from './auth.js';
import {createAccount,findAccountByUsername,accountOwnsPlayer,recordLoginFailure,resetLoginFailures,createSession,deleteSession,moveSavesToFreeSlots,listSaves} from './repository.js';

// 0.15 — regras das rotas de conta, separadas dos arquivos route.js para serem testáveis.
// Mensagens ao jogador em pt-BR; nunca dizem se foi o usuário ou a senha que errou.
export const MESSAGES={
 VALIDATION:`Use um nome de ${ACCOUNT_RULES.usernameMin} a ${ACCOUNT_RULES.usernameMax} caracteres (letras, números, ponto, hífen ou sublinhado) e uma senha de ${ACCOUNT_RULES.passwordMin} a ${ACCOUNT_RULES.passwordMax} caracteres.`,
 TAKEN:'Esse nome de usuário já está em uso.',
 INVALID:'Usuário ou senha incorretos.',
 LOCKED:'Muitas tentativas seguidas. Aguarde um minuto e tente de novo.',
 SIGNED_IN:'Você já está conectado. Saia antes de entrar em outra conta.',
};
const reply=(status,code,extra={})=>Response.json(status<400?extra:{error:{code,message:MESSAGES[code]},...extra},{status});

async function credentials(request){const body=await readBody(request);const username=normalizeUsername(body.username),password=body.password;if(!validUsername(username)||!validPassword(password))throw new InvalidInput();return {username,password};}
async function openSession(request,extra,account){const token=newSessionToken(),expires=new Date(Date.now()+ACCOUNT_RULES.sessionDays*86400000).toISOString();await createSession(tokenHash(token),account.id,expires);extra.cookies.push(sessionCookie(request,token));}

/** POST /api/auth/register — the account takes this browser's current saves with it. */
export async function register(request,context,player,extra){
 if(extra.session)return reply(409,'SIGNED_IN');
 let input;try{input=await credentials(request);}catch{return reply(400,'VALIDATION');}
 const playerId=await accountOwnsPlayer(extra.anonymousId)?randomUUID():extra.anonymousId,account={id:randomUUID(),username:input.username,playerId};
 if(!await createAccount({...account,passwordHash:await hashPassword(input.password)}))return reply(409,'TAKEN');
 await openSession(request,extra,account);
 return reply(201,null,{account:{username:account.username},saves:(await listSaves(playerId)).length});
}

/** POST /api/auth/login — this browser's saves go to the account's free slots, never overwriting. */
export async function login(request,context,player,extra){
 if(extra.session)return reply(409,'SIGNED_IN');
 let input;try{input=await credentials(request);}catch{await dummyVerify('');return reply(401,'INVALID');}
 const account=await findAccountByUsername(input.username);
 if(!account){await dummyVerify(input.password);return reply(401,'INVALID');}
 if(account.lockedUntil&&account.lockedUntil>new Date().toISOString())return reply(429,'LOCKED');
 if(!await verifyPassword(input.password,account.passwordHash)){const failures=account.failedAttempts+1;await recordLoginFailure(account.id,failures,lockAfterFailure(failures));return reply(401,'INVALID');}
 await resetLoginFailures(account.id);
 const moved=await accountOwnsPlayer(extra.anonymousId)?{moved:[],kept:[]}:await moveSavesToFreeSlots(extra.anonymousId,account.playerId);
 await openSession(request,extra,account);
 return reply(200,null,{account:{username:account.username},moved:moved.moved,kept:moved.kept});
}

/** POST /api/auth/logout — ends the session. When this browser's anonymous identity IS the account's
 * (the account was created here), it gets a fresh one so the account's saves are not left visible.
 * Otherwise it is kept, so saves left in this browser at login (slot already taken) come back. */
export async function logout(request,context,player,extra){
 if(extra.token)await deleteSession(tokenHash(extra.token));
 extra.cookies.push(clearSessionCookie(request));
 if(!extra.session||extra.anonymousId===extra.session.playerId)extra.anonymousCookie=identity(new Request(request.url)).cookie;
 return reply(200,null,{account:null});
}

/** GET /api/auth/me */
export async function me(request,context,player,extra){return reply(200,null,{account:extra.session?{username:extra.session.username}:null});}

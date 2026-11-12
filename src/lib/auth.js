import {randomBytes,scrypt as scryptCb,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';

// 0.15 — contas de jogador (usuário + senha). Jogar sem conta continua possível: a conta só
// troca a identidade dos saves (player_id) enquanto houver sessão. Nada aqui grava em disco.
const scrypt=promisify(scryptCb);

/** Rules shown to the player; kept as data so UI and server agree. */
export const ACCOUNT_RULES={usernameMin:3,usernameMax:20,passwordMin:8,passwordMax:128,maxFailures:5,lockSeconds:60,sessionDays:30};
const USERNAME=new RegExp(`^[a-z0-9][a-z0-9_.-]{${ACCOUNT_RULES.usernameMin-1},${ACCOUNT_RULES.usernameMax-1}}$`);

/** Usernames are case-insensitive; stored and compared in lowercase. */
export const normalizeUsername=u=>typeof u==='string'?u.trim().toLowerCase():'';
export const validUsername=u=>USERNAME.test(normalizeUsername(u));
/** Length only (no composition rules): long passphrases are encouraged. */
export const validPassword=p=>typeof p==='string'&&p.length>=ACCOUNT_RULES.passwordMin&&p.length<=ACCOUNT_RULES.passwordMax;

const KEY_LENGTH=64,COST={N:16384,r:8,p:1,maxmem:64*1024*1024};
/** scrypt with a random 16-byte salt. Format: scrypt$N$r$p$salt$hash (base64url). */
export async function hashPassword(password){
 const salt=randomBytes(16),key=await scrypt(password.normalize('NFKC'),salt,KEY_LENGTH,COST);
 return ['scrypt',COST.N,COST.r,COST.p,salt.toString('base64url'),key.toString('base64url')].join('$');
}
/** Constant-time check; false for any malformed stored hash. */
export async function verifyPassword(password,stored){
 const parts=typeof stored==='string'?stored.split('$'):[];
 if(parts.length!==6||parts[0]!=='scrypt'||typeof password!=='string')return false;
 const [,N,r,p,salt,hash]=parts,expected=Buffer.from(hash,'base64url');
 if(expected.length!==KEY_LENGTH)return false;
 const key=await scrypt(password.normalize('NFKC'),Buffer.from(salt,'base64url'),KEY_LENGTH,{N:Number(N),r:Number(r),p:Number(p),maxmem:COST.maxmem});
 return timingSafeEqual(key,expected);
}
/** A hash of a random password, used to spend the same time when the username does not exist. */
let dummy;export async function dummyVerify(password){dummy||=await hashPassword(randomBytes(12).toString('hex'));await verifyPassword(String(password||''),dummy);return false;}

/** Session token (sent to the browser) and its SHA-256 (the only thing stored). */
export const newSessionToken=()=>randomBytes(32).toString('base64url');
export const tokenHash=t=>createHash('sha256').update(String(t)).digest('hex');
export const validTokenShape=t=>typeof t==='string'&&/^[A-Za-z0-9_-]{43}$/.test(t);

const secureFlag=request=>process.env.NODE_ENV==='production'||new URL(request.url).protocol==='https:';
/** Cookie that carries the session; HttpOnly, SameSite=Lax, 30 days. */
export function sessionCookie(request,token){return `aurora_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ACCOUNT_RULES.sessionDays*86400}${secureFlag(request)?'; Secure':''}`;}
export function clearSessionCookie(request){return `aurora_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureFlag(request)?'; Secure':''}`;}
export function readSessionToken(request){const raw=request.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith('aurora_session='))?.slice(15)||'';return validTokenShape(raw)?raw:null;}
/** Lockout after repeated failures: returns the ISO time until which logins are refused, or null. */
export function lockAfterFailure(failures,now=Date.now()){return failures>=ACCOUNT_RULES.maxFailures?new Date(now+ACCOUNT_RULES.lockSeconds*1000).toISOString():null;}

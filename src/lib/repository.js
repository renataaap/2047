// Único módulo que importa o driver libSQL.
import { createClient } from '@libsql/client';
let client,ready;
const schema=`CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY,applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS saves(player_id TEXT NOT NULL,slot TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,schema_version INTEGER NOT NULL DEFAULT 1,payload TEXT NOT NULL CHECK(json_valid(payload)),updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(player_id,slot));
INSERT OR IGNORE INTO schema_migrations(version) VALUES(1);
CREATE TABLE IF NOT EXISTS accounts(id TEXT PRIMARY KEY,username TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,player_id TEXT NOT NULL UNIQUE,failed_attempts INTEGER NOT NULL DEFAULT 0,locked_until TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,expires_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_account ON sessions(account_id);
INSERT OR IGNORE INTO schema_migrations(version) VALUES(2);`;
function getClient(){if(!client){const url=process.env.TURSO_DATABASE_URL||'file:local.db';if(process.env.NODE_ENV==='production'&&!/^(libsql|https):\/\//.test(url))throw new Error('Turso não configurado');client=createClient({url,authToken:process.env.TURSO_AUTH_TOKEN});}return client;}
async function database(){const db=getClient();if(!ready)ready=db.executeMultiple(schema).catch(e=>{ready=undefined;throw e;});await ready;return db;}
export async function migrate(sql){await getClient().executeMultiple(sql);}
export async function checkDatabase(){const db=await database();const r=await db.execute('SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1');return Number(r.rows[0]?.version||0);}
const decode=row=>row?{slot:row.slot,version:Number(row.version),updatedAt:row.updated_at,data:JSON.parse(row.payload)}:null;
export async function listSaves(player){const db=await database();const r=await db.execute({sql:'SELECT slot,version,updated_at,payload FROM saves WHERE player_id=? ORDER BY slot',args:[player]});return r.rows.map(decode);}
export async function getSave(player,slot){const db=await database();return decode((await db.execute({sql:'SELECT slot,version,updated_at,payload FROM saves WHERE player_id=? AND slot=?',args:[player,slot]})).rows[0]);}
export async function createSave(player,slot,data){const db=await database();const r=await db.execute({sql:'INSERT OR IGNORE INTO saves(player_id,slot,payload,schema_version) VALUES(?,?,?,?)',args:[player,slot,JSON.stringify(data),data.schemaVersion]});return r.rowsAffected?getSave(player,slot):null;}
export async function updateSave(player,slot,version,data){const db=await database();const r=await db.execute({sql:'UPDATE saves SET payload=?,schema_version=?,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE player_id=? AND slot=? AND version=?',args:[JSON.stringify(data),data.schemaVersion,player,slot,version]});return r.rowsAffected?getSave(player,slot):null;}
export async function deleteSave(player,slot){const db=await database();return (await db.execute({sql:'DELETE FROM saves WHERE player_id=? AND slot=?',args:[player,slot]})).rowsAffected>0;}
// 0.15 — contas e sessões. Os saves continuam indexados por player_id; a conta guarda o seu.
/** Creates an account; false when the username or player id is already taken. */
export async function createAccount({id,username,passwordHash,playerId}){const db=await database();const r=await db.execute({sql:'INSERT OR IGNORE INTO accounts(id,username,password_hash,player_id) VALUES(?,?,?,?)',args:[id,username,passwordHash,playerId]});return r.rowsAffected>0;}
export async function findAccountByUsername(username){const db=await database();const row=(await db.execute({sql:'SELECT id,username,password_hash,player_id,failed_attempts,locked_until FROM accounts WHERE username=?',args:[username]})).rows[0];return row?{id:row.id,username:row.username,passwordHash:row.password_hash,playerId:row.player_id,failedAttempts:Number(row.failed_attempts),lockedUntil:row.locked_until}:null;}
export async function accountOwnsPlayer(playerId){const db=await database();return !!(await db.execute({sql:'SELECT 1 FROM accounts WHERE player_id=?',args:[playerId]})).rows[0];}
export async function recordLoginFailure(id,failures,lockedUntil){const db=await database();await db.execute({sql:'UPDATE accounts SET failed_attempts=?,locked_until=? WHERE id=?',args:[failures,lockedUntil,id]});}
export async function resetLoginFailures(id){const db=await database();await db.execute({sql:'UPDATE accounts SET failed_attempts=0,locked_until=NULL WHERE id=?',args:[id]});}
export async function createSession(tokenHash,accountId,expiresAt){const db=await database();await db.execute({sql:'INSERT INTO sessions(token_hash,account_id,expires_at) VALUES(?,?,?)',args:[tokenHash,accountId,expiresAt]});}
/** Session joined with its account; null when unknown or expired (expired rows are removed). */
export async function findSession(tokenHash,now=new Date().toISOString()){const db=await database();const row=(await db.execute({sql:'SELECT s.expires_at,a.id,a.username,a.player_id FROM sessions s JOIN accounts a ON a.id=s.account_id WHERE s.token_hash=?',args:[tokenHash]})).rows[0];if(!row)return null;if(row.expires_at<=now){await deleteSession(tokenHash);return null;}return {accountId:row.id,username:row.username,playerId:row.player_id};}
export async function deleteSession(tokenHash){const db=await database();await db.execute({sql:'DELETE FROM sessions WHERE token_hash=?',args:[tokenHash]});}
/** Moves saves from one player to another only into slots that are free there. Never overwrites. */
export async function moveSavesToFreeSlots(from,to){if(from===to)return {moved:[],kept:[]};const db=await database();const mine=(await db.execute({sql:'SELECT slot FROM saves WHERE player_id=?',args:[from]})).rows.map(r=>r.slot),moved=[],kept=[];
 for(const slot of mine){const r=await db.execute({sql:'UPDATE saves SET player_id=? WHERE player_id=? AND slot=? AND NOT EXISTS(SELECT 1 FROM saves WHERE player_id=? AND slot=?)',args:[to,from,slot,to,slot]});(r.rowsAffected?moved:kept).push(slot);}
 return {moved,kept};}
/** Test cleanup helper. */
export async function deleteAccount(id){const db=await database();await db.execute({sql:'DELETE FROM sessions WHERE account_id=?',args:[id]});await db.execute({sql:'DELETE FROM accounts WHERE id=?',args:[id]});}
export function closeRepository(){client?.close();client=undefined;ready=undefined;}

// Único módulo que importa o driver; nenhuma rota ou regra de jogo o acessa diretamente.
import { createClient } from '@libsql/client';
let client;
function getClient(){if(!client){if(process.env.NODE_ENV==='production'&&!process.env.TURSO_DATABASE_URL)throw new Error('Banco de produção não configurado');client=createClient({url:process.env.TURSO_DATABASE_URL||'file:local.db',authToken:process.env.TURSO_AUTH_TOKEN});}return client;}
export async function migrate(sql){return getClient().executeMultiple(sql);}
export async function checkDatabase(){const r=await getClient().execute('SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1');return Number(r.rows[0]?.version||0);}
export function closeRepository(){client?.close();client=undefined;}

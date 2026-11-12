import { readFile } from 'node:fs/promises';
import { migrate, checkDatabase, closeRepository } from '../src/lib/repository.js';
try { for(const f of ['001_initial.sql','002_accounts.sql'])await migrate(await readFile(new URL(`../migrations/${f}`,import.meta.url),'utf8')); console.log(`Migração verificada: schema ${await checkDatabase()}`); } finally { closeRepository(); }

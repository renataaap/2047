// Cada arquivo de teste usa o próprio banco SQLite temporário. Os arquivos rodam em paralelo,
// e dois deles escrevendo no mesmo local.db davam SQLITE_BUSY de forma intermitente (0.15).
import {afterAll} from 'vitest';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {rm} from 'node:fs/promises';
if(!process.env.TURSO_DATABASE_URL){
 const file=join(tmpdir(),`aurora-unit-${randomUUID()}.db`);
 process.env.TURSO_DATABASE_URL=`file:${file.split('\\').join('/')}`;
 afterAll(async()=>{try{(await import('../../src/lib/repository.js')).closeRepository?.();}catch{}await rm(file,{force:true}).catch(()=>{});});
}

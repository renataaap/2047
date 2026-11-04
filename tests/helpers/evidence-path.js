import {resolve} from 'node:path';

// Each release can redirect new evidence without replacing historical captures.
export function evidencePath(relative=''){
 return resolve(process.env.AURORA_EVIDENCE_ROOT||'evidence/current-e2e',relative);
}

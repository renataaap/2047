// Rollback of a failed transaction: Object.assign alone would keep top-level
// fields created during the attempt (for example a first logistics/career
// block), so remove those before copying the backup back.
export function restoreState(target,backup){for(const k of Object.keys(target))if(!Object.hasOwn(backup,k))delete target[k];return Object.assign(target,backup);}

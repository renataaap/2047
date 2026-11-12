import { withIdentity } from '../../../../lib/api.js';
import { register } from '../../../../lib/accountRoutes.js';
export const runtime='nodejs';
export const POST=withIdentity(register);

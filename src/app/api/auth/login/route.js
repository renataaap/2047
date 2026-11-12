import { withIdentity } from '../../../../lib/api.js';
import { login } from '../../../../lib/accountRoutes.js';
export const runtime='nodejs';
export const POST=withIdentity(login);

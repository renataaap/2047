import { withIdentity } from '../../../../lib/api.js';
import { logout } from '../../../../lib/accountRoutes.js';
export const runtime='nodejs';
export const POST=withIdentity(logout);

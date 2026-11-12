import { withIdentity } from '../../../../lib/api.js';
import { me } from '../../../../lib/accountRoutes.js';
export const runtime='nodejs';
export const GET=withIdentity(me);

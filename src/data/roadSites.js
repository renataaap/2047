// Add service sites without rewriting the established road dialogue/data file.
import {ROAD_POINTS as EXISTING} from './road.js';
import {CITY_GAS} from './roadNetwork.js';
export const ROAD_POINTS=[...EXISTING,CITY_GAS];

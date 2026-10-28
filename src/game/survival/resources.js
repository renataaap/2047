import { CONFIG } from '../../data/config.js';
export const FRICTION = Object.freeze({ asfalto: 1, terra: .8, areia: .55, sal: .7, lama: .45, rocha: .6, vidro:.52, agua:.38 });
export function terrainFriction(type, speed = 0) {
  const base = FRICTION[type] ?? FRICTION.terra;
  return base * (1 - Math.min(Math.abs(speed) / 100, .12));
}
export function fuelConsumed({ engineOn, throttle = 0, speed = 0 }, dt) {
  if (!engineOn || dt <= 0) return 0;
  return (CONFIG.vehicle.idleLitersPerSecond + CONFIG.vehicle.drivingLitersPerSecond * Math.max(0, Math.min(1, Math.abs(throttle))) * (.4 + Math.min(Math.abs(speed) / 25, 1))) * dt;
}
export function updateResources(state, input, dt) {
  state.fuel = Math.max(0, state.fuel - fuelConsumed({ ...state, throttle: input.throttle }, dt));
  if (state.fuel === 0) state.engineOn = false;
  const target = state.engineOn ? 72 + Math.abs(input.throttle) * 19 : 23;
  state.temperature += (target - state.temperature) * dt * .015;
}

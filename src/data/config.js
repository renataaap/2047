export const CONFIG = Object.freeze({
  phase: 2, seed: 2047, fixedStep: 1 / 60, maxSubSteps: 30,
  world: { sectorSize: 1024, terrainSegments: 48, roadLength: 3000, roadWidth: 10 },
  vehicle: { mass: 6800, engineForce: 12600, maxSpeed: 25, reverseSpeed: 4.5, maxSteer: .45, brakeForce: 110, wheelRadius: .61, suspensionLength: .52, idleLitersPerSecond: .0007, drivingLitersPerSecond: .018, initialFuel: 140, fuelCapacity: 180 },
  presets: {
    baixo: { label: 'Baixo', pixelRatio: .75, shadows: false, shadowSize: 512, distance: 360, particles: 120 },
    medio: { label: 'Médio', pixelRatio: 1, shadows: true, shadowSize: 1024, distance: 650, particles: 300 },
    alto: { label: 'Alto', pixelRatio: 1.5, shadows: true, shadowSize: 2048, distance: 950, particles: 500 },
  },
});

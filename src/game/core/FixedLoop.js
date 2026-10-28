export class FixedLoop {
  constructor(step = 1 / 60, maxSteps = 6) { this.step = step; this.maxSteps = maxSteps; this.accumulator = 0; }
  advance(delta, update) {
    this.accumulator += Math.min(Math.max(delta, 0), this.step * this.maxSteps);
    let steps = 0;
    while (this.accumulator + 1e-10 >= this.step && steps < this.maxSteps) {
      update(this.step); this.accumulator -= this.step; steps++;
    }
    return Math.max(0, this.accumulator / this.step);
  }
  reset() { this.accumulator = 0; }
}

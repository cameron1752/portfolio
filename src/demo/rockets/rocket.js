import { decide } from './brain';

const MAX_THRUST = 0.1;
const MAX_SPEED = 3;
const MAX_DISTANCE = 500;
export const HIT_RADIUS = 8;

export class Rocket {
  constructor(x, y, weights) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.weights = weights;
    this.hit = false;
    this.fitness = 0;
  }

  update(target) {
    if (this.hit) return; // rockets stop once they reach the target, like your Java version

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.hypot(dx, dy);

    if (distance <= HIT_RADIUS) {
      this.hit = true;
      return;
    }

    const inputs = [
      dx / distance,
      dy / distance,
      this.vx / MAX_SPEED,
      this.vy / MAX_SPEED,
      Math.min(distance / MAX_DISTANCE, 1),
    ];
    const [thrustX, thrustY] = decide(this.weights, inputs);

    this.vx += thrustX * MAX_THRUST;
    this.vy += thrustY * MAX_THRUST;

    const speed = Math.hypot(this.vx, this.vy);
    if (speed > MAX_SPEED) {
      this.vx = (this.vx / speed) * MAX_SPEED;
      this.vy = (this.vy / speed) * MAX_SPEED;
    }

    this.x += this.vx;
    this.y += this.vy;
  }

  calculateFitness(target) {
    const distance = Math.max(Math.hypot(target.x - this.x, target.y - this.y), 1);
    this.fitness = 1 / (distance * distance);
    if (this.hit) this.fitness *= 3; // same 3x reward for hits as your mating pool
  }
}
import { Rocket } from './rocket';
import { randomWeights } from './brain';
import { crossover, mutate } from './dna';

const ELITE_FRACTION = 0.01; // top 1% carried over unchanged, like your 100 of 10,000

export class Population {
  constructor(size, start) {
    this.size = size;
    this.start = start;
    this.generation = 1;
    this.frame = 0;
    this.hits = 0;
    this.bestHits = 0;
    this.history = []; // hits per completed generation
    this.rockets = Array.from({ length: size }, () => new Rocket(start.x, start.y, randomWeights()));
  }

  step(target) {
    this.frame++;
    let hits = 0;
    for (const rocket of this.rockets) {
      rocket.update(target);
      if (rocket.hit) hits++;
    }
    this.hits = hits;
    this.bestHits = Math.max(this.bestHits, hits);
  }

  evolve(target) {
    let total = 0;
    for (const rocket of this.rockets) {
      rocket.calculateFitness(target);
      total += rocket.fitness;
    }

    const ranked = [...this.rockets].sort((a, b) => b.fitness - a.fitness);
    const eliteCount = Math.max(1, Math.floor(this.size * ELITE_FRACTION));

    const next = ranked
      .slice(0, eliteCount)
      .map((r) => new Rocket(this.start.x, this.start.y, r.weights));

    while (next.length < this.size) {
      const parentA = pick(this.rockets, total);
      const parentB = pick(this.rockets, total);
      const weights = mutate(crossover(parentA.weights, parentB.weights));
      next.push(new Rocket(this.start.x, this.start.y, weights));
    }

    this.history.push(this.hits);
    this.rockets = next;
    this.generation++;
    this.frame = 0;
    this.hits = 0;
  }
}

// weighted random pick: higher fitness means more likely to be chosen
function pick(rockets, total) {
  let r = Math.random() * total;
  for (const rocket of rockets) {
    r -= rocket.fitness;
    if (r <= 0) return rocket;
  }
  return rockets[rockets.length - 1];
}
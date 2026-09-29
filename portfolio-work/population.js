import { DNA } from './dna.js';

export class Population {
  constructor(target, size) {
    this.target = target;
    this.members = Array.from({ length: size }, () => new DNA(target.length));
    this.generation = 0;
    this.found = false;
    this.best = '';
    this.bestFitness = 0;
    this.averageFitness = 0;
  }

  nextGeneration() {
    this.generation++;

    // score everyone and gather stats
    let totalFitness = 0;
    let bestDna = this.members[0];

    for (const dna of this.members) {
      dna.calculateFitness(this.target);
      totalFitness += dna.getFitness();
      if (dna.getFitness() > bestDna.getFitness()) bestDna = dna;
    }

    this.best = bestDna.getGenesAsString();
    this.bestFitness = bestDna.getFitness();
    this.averageFitness = totalFitness / this.members.length;

    if (this.best === this.target) {
      this.found = true;
      return;
    }

    // build the mating pool
    const matingPool = [];
    for (const dna of this.members) {
      let n = Math.floor(dna.getFitness() * 100);
      if (dna.getFitness() > 0.75) n *= 2;
      for (let m = 0; m <= n; m++) matingPool.push(dna);
    }

    // breed the next generation
    this.members = this.members.map(() => {
      const parentA = randomParent(matingPool);
      const parentB = randomParent(matingPool);
      const child = parentA.crossOver(parentB);
      child.mutate();
      return child;
    });
  }
}

function randomParent(matingPool) {
  return matingPool[Math.floor(Math.random() * matingPool.length)];
}
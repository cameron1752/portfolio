export const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,'!?";
const MUTATION_RATE = 0.01;

const randomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];

export class DNA {
  constructor(length) {
    this.genes = Array.from({ length }, randomChar);
    this.fitness = 0;
  }

  calculateFitness(target) {
    let score = 0;
    for (let i = 0; i < this.genes.length; i++) {
      if (this.genes[i] === target[i]) score++;
    }
    this.fitness = (score * score) / (target.length * target.length);
  }

  crossOver(parentB) {
    const child = new DNA(this.genes.length);
    const midpoint = Math.floor(Math.random() * this.genes.length);
    for (let i = 0; i < this.genes.length; i++) {
      child.genes[i] = i < midpoint ? this.genes[i] : parentB.genes[i];
    }
    return child;
  }

  mutate() {
    for (let i = 0; i < this.genes.length; i++) {
      if (Math.random() < MUTATION_RATE) this.genes[i] = randomChar();
    }
  }

  getFitness() { return this.fitness; }
  getGenesAsString() { return this.genes.join(''); }
}
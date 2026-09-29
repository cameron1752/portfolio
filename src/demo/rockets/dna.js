import { LAYER_BOUNDARIES } from './brain';

const MUTATION_RATE = 0.02;
const MUTATION_STRENGTH = 0.5;
const LIMIT = 2;

export function crossover(a, b) {
  // split at a layer boundary so each layer comes intact from one parent
  const pick = 1 + Math.floor(Math.random() * (LAYER_BOUNDARIES.length - 1));
  const split = LAYER_BOUNDARIES[pick];
  return a.map((w, i) => (i < split ? w : b[i]));
}

export function mutate(weights) {
  return weights.map((w) => {
    if (Math.random() >= MUTATION_RATE) return w;
    const nudged = w + (Math.random() * 2 - 1) * MUTATION_STRENGTH;
    return Math.max(-LIMIT, Math.min(LIMIT, nudged));
  });
}
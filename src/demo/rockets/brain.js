export const INPUTS = 5;
export const HIDDEN = 6;
export const OUTPUTS = 2;

// where each section starts in the flat weight array
const INPUT_HIDDEN = 0;
const BIAS_HIDDEN = INPUTS * HIDDEN;                   // 30
const HIDDEN_OUTPUT = BIAS_HIDDEN + HIDDEN;            // 36
const BIAS_OUTPUT = HIDDEN_OUTPUT + HIDDEN * OUTPUTS;  // 48
export const TOTAL_WEIGHTS = BIAS_OUTPUT + OUTPUTS;    // 50

export const LAYER_BOUNDARIES = [0, BIAS_HIDDEN, HIDDEN_OUTPUT, BIAS_OUTPUT, TOTAL_WEIGHTS];

export const randomWeights = () =>
  Array.from({ length: TOTAL_WEIGHTS }, () => Math.random() * 2 - 1);

export function decide(w, inputs) {
  const hidden = new Array(HIDDEN);
  for (let h = 0; h < HIDDEN; h++) {
    let sum = w[BIAS_HIDDEN + h];
    for (let i = 0; i < INPUTS; i++) sum += inputs[i] * w[INPUT_HIDDEN + h * INPUTS + i];
    hidden[h] = Math.tanh(sum);
  }

  const output = new Array(OUTPUTS);
  for (let o = 0; o < OUTPUTS; o++) {
    let sum = w[BIAS_OUTPUT + o];
    for (let h = 0; h < HIDDEN; h++) sum += hidden[h] * w[HIDDEN_OUTPUT + o * HIDDEN + h];
    output[o] = Math.tanh(sum);
  }
  return output; // [thrustX, thrustY], each from -1 to 1
}
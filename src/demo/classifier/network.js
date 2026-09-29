const sigmoid = (z) => 1 / (1 + Math.exp(-z));

export function feedForward(model, input) {
  let activation = input;
  for (let layer = 0; layer < model.weights.length; layer++) {
    const W = model.weights[layer];
    const b = model.biases[layer];
    activation = W.map((row, n) => {
      let z = b[n];
      for (let j = 0; j < row.length; j++) z += row[j] * activation[j];
      return sigmoid(z);
    });
  }
  return activation;
}

export function predict(model, input) {
  const output = feedForward(model, input);
  const total = output.reduce((a, b) => a + b, 0);
  const scores = output.map((v) => v / total); // sums to 1, for display
  const digit = scores.indexOf(Math.max(...scores));
  return { digit, scores };
}

export async function loadModel(url = '/models/digits.json') {
  const response = await fetch(url);
  return response.json();
}
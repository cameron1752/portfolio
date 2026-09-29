// convert.js
import { readFileSync, writeFileSync } from 'fs';

const parseRow = (line) =>
  line.split(',').filter((s) => s.trim() !== '').map((s) => Number(Number(s).toFixed(5)));

const lines = readFileSync('training_save.txt', 'utf8').split(/\r?\n/);

const biases = [];
const weights = [];
let i = 0;

// biases until the '---' separator
for (; lines[i] !== '---'; i++) biases.push(parseRow(lines[i]));
i++;

// weight rows, grouped into layers by '--'
let layer = [];
for (; i < lines.length; i++) {
  if (lines[i] === '--') {
    weights.push(layer);
    layer = [];
  } else if (lines[i].trim() !== '') {
    layer.push(parseRow(lines[i]));
  }
}

const sizes = [weights[0][0].length, ...weights.map((l) => l.length)];
console.log('Layer sizes:', sizes); // should print [ 784, 30, 10 ]

writeFileSync('digits.json', JSON.stringify({ sizes, biases, weights }));
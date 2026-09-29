import { doAi } from './think.js';
import { bubbleSort, selectionSort, quickSort, mergeSort, checkSort } from './sort.js';

const sorts = { bubbleSort, selectionSort, quickSort, mergeSort };

for (const [name, sort] of Object.entries(sorts)) {
  for (let trial = 0; trial < 100; trial++) {
    const arr = Array.from({ length: 50 }, () => Math.floor(Math.random() * 200));
    const expected = [...arr].sort((a, b) => a - b);

    let steps = 0;
    for (const _ of sort(arr)) steps++;

    if (!checkSort(arr) || arr.join() !== expected.join()) {
      console.log(`${name} FAILED on trial ${trial}`);
      break;
    }
    if (trial === 0) console.log(`${name}: ok, ${steps} steps for 50 elements`);
  }
}

// doAi();
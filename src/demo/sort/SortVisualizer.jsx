import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { bubbleSort, selectionSort, quickSort, mergeSort } from './sort';

const ALGORITHMS = {
  bubble: { label: 'Bubble Sort', fn: bubbleSort },
  selection: { label: 'Selection Sort', fn: selectionSort },
  quick: { label: 'Quick Sort', fn: quickSort },
  merge: { label: 'Merge Sort', fn: mergeSort },
};

// delay between ticks (ms) and how many sort steps to run per tick
const SPEEDS = {
  slow: { label: 'Slow', delay: 120, steps: 1 },
  medium: { label: 'Medium', delay: 30, steps: 1 },
  fast: { label: 'Fast', delay: 10, steps: 3 },
  instant: { label: 'Very fast', delay: 10, steps: 20 },
};

const SIZES = [25, 50, 100];

const randomArray = (size) =>
  Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5);

export default function SortVisualizer() {
  const [algorithm, setAlgorithm] = useState('quick');
  const [speed, setSpeed] = useState('medium');
  const [size, setSize] = useState(50);
  const [array, setArray] = useState(() => randomArray(50));
  const [step, setStep] = useState(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [counts, setCounts] = useState({ comparisons: 0, writes: 0 });

  const workingRef = useRef(array);   // the array the generator sorts in place
  const generatorRef = useRef(null);  // the paused sort
  const countsRef = useRef({ comparisons: 0, writes: 0 });

  const generate = (newSize = size) => {
    setRunning(false);
    const fresh = randomArray(newSize);
    workingRef.current = fresh;
    generatorRef.current = null;
    countsRef.current = { comparisons: 0, writes: 0 };
    setArray([...fresh]);
    setStep(null);
    setDone(false);
    setCounts({ comparisons: 0, writes: 0 });
  };

  const start = () => {
    if (done) {
      generate(); // like the Python version: sorting a sorted array starts fresh
      return;
    }
    if (!generatorRef.current) {
      generatorRef.current = ALGORITHMS[algorithm].fn(workingRef.current);
    }
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    const { delay, steps } = SPEEDS[speed];

    const id = setInterval(() => {
      let last = null;
      for (let i = 0; i < steps; i++) {
        const result = generatorRef.current.next();
        if (result.done) {
          setRunning(false);
          setDone(true);
          last = null;
          break;
        }
        last = result.value;
        if (last.compare) countsRef.current.comparisons++;
        else countsRef.current.writes++;
      }
      setArray([...workingRef.current]);
      setStep(last);
      setCounts({ ...countsRef.current });
    }, delay);

    return () => clearInterval(id);
  }, [running, speed]);

  // which bars to highlight, and in what color
  const compareSet = new Set(step?.compare ?? []);
  const changeSet = new Set(step?.swap ?? (step?.overwrite ? [step.overwrite[0]] : []));
  const max = Math.max(...array);

  const barColor = (i) => {
    if (done) return 'success.main';
    if (changeSet.has(i)) return 'error.main';
    if (compareSet.has(i)) return 'warning.main';
    return 'primary.main';
  };

  const started = generatorRef.current !== null;

  return (
    <Paper variant="outlined" sx={{ p: 3, textAlign: 'left' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          select size="small" label="Algorithm" value={algorithm}
          disabled={started && !done}
          onChange={(e) => { setAlgorithm(e.target.value); generate(); }}
          sx={{ minWidth: 160 }}
        >
          {Object.entries(ALGORITHMS).map(([key, { label }]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </TextField>

        <TextField
          select size="small" label="Speed" value={speed}
          onChange={(e) => setSpeed(e.target.value)}
          sx={{ minWidth: 130 }}
        >
          {Object.entries(SPEEDS).map(([key, { label }]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </TextField>

        <TextField
          select size="small" label="Bars" value={size}
          disabled={started && !done}
          onChange={(e) => { setSize(e.target.value); generate(e.target.value); }}
          sx={{ minWidth: 100 }}
        >
          {SIZES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>

        <Stack direction="row" spacing={1}>
          {running ? (
            <Button variant="contained" onClick={() => setRunning(false)}>Pause</Button>
          ) : (
            <Button variant="contained" onClick={start}>
              {done ? 'New array' : started ? 'Resume' : 'Sort'}
            </Button>
          )}
          <Button onClick={() => generate()} disabled={running}>Shuffle</Button>
        </Stack>
      </Stack>

      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: 280 }}>
        {array.map((value, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              height: `${(value / max) * 100}%`,
              bgcolor: barColor(i),
              borderRadius: '2px 2px 0 0',
            }}
          />
        ))}
      </Box>

      <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
        <Typography variant="body2">Comparisons: {counts.comparisons}</Typography>
        <Typography variant="body2">Swaps / writes: {counts.writes}</Typography>
      </Stack>
    </Paper>
  );
}
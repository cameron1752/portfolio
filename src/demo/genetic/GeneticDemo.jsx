import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Population } from './population';
import { CHARS } from './dna';

const POPULATION_SIZE = 200;
const MAX_LENGTH = 60;

export default function GeneticDemo() {
  const [target, setTarget] = useState('Meats and cheeses, always pleases');
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1); // generations per frame
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const populationRef = useRef(null);

  const invalidChars = [...new Set([...target].filter((c) => !CHARS.includes(c)))];
  const canStart = target.length > 0 && invalidChars.length === 0;

  // the animation loop: runs only while `running` is true
  useEffect(() => {
    if (!running) return;
    let frameId;

    const step = () => {
      const population = populationRef.current;
      for (let i = 0; i < speed && !population.found; i++) {
        population.nextGeneration();
      }

      setStats({
        generation: population.generation,
        best: population.best,
        bestFitness: population.bestFitness,
        averageFitness: population.averageFitness,
      });
      setHistory((h) =>
        h[0] === population.best ? h : [population.best, ...h].slice(0, 10)
      );

      if (population.found) {
        setRunning(false);
      } else {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId); // stop cleanly on pause or unmount
  }, [running, speed]);

  const start = () => {
    // start fresh unless we're resuming a paused, unfinished run
    if (!populationRef.current || populationRef.current.found) {
      populationRef.current = new Population(target, POPULATION_SIZE);
      setHistory([]);
    }
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    populationRef.current = null;
    setStats(null);
    setHistory([]);
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, textAlign: 'left' }}>
      <Stack spacing={2}>
        <TextField
          label="Target phrase"
          value={target}
          onChange={(e) => {
            setTarget(e.target.value.slice(0, MAX_LENGTH));
            reset(); // a new target means a new population
          }}
          disabled={running}
          error={invalidChars.length > 0}
          helperText={
            invalidChars.length > 0
              ? `Unsupported characters: ${invalidChars.join(' ')}`
              : `${target.length}/${MAX_LENGTH} characters`
          }
          fullWidth
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
          <Stack direction="row" spacing={1}>
            {running ? (
              <Button variant="contained" onClick={() => setRunning(false)}>Pause</Button>
            ) : (
              <Button variant="contained" onClick={start} disabled={!canStart}>
                {populationRef.current && !populationRef.current.found ? 'Resume' : 'Start'}
              </Button>
            )}
            <Button onClick={reset}>Reset</Button>
          </Stack>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={speed}
            onChange={(_, value) => value && setSpeed(value)}
          >
            <ToggleButton value={1}>1x</ToggleButton>
            <ToggleButton value={5}>5x</ToggleButton>
            <ToggleButton value={20}>20x</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {stats && (
          <>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Generation {stats.generation}
                {populationRef.current?.found && ' · Found it!'}
              </Typography>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '1.25rem', wordBreak: 'break-all' }}>
                {[...stats.best].map((c, i) => (
                  <Box
                    component="span"
                    key={i}
                    sx={{ color: c === target[i] ? 'success.main' : 'text.disabled' }}
                  >
                    {c}
                  </Box>
                ))}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2">
                Best fitness: {(stats.bestFitness * 100).toFixed(1)}%
              </Typography>
              <LinearProgress variant="determinate" value={stats.bestFitness * 100} sx={{ mb: 1 }} />
              <Typography variant="body2">
                Average fitness: {(stats.averageFitness * 100).toFixed(1)}%
              </Typography>
              <LinearProgress variant="determinate" color="secondary" value={stats.averageFitness * 100} />
            </Box>

            <Box>
              <Typography variant="overline" color="text.secondary">Recent best strings</Typography>
              {history.map((s, i) => (
                <Typography
                  key={i}
                  sx={{ fontFamily: 'monospace', opacity: 1 - i * 0.08, wordBreak: 'break-all' }}
                >
                  {s}
                </Typography>
              ))}
            </Box>
          </>
        )}
      </Stack>
    </Paper>
  );
}
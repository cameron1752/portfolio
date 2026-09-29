import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Population } from './population';
import { HIT_RADIUS } from './rocket';

const WIDTH = 600;
const HEIGHT = 400;
const POPULATION_SIZE = 1000;
const LIFESPAN = 200;
const START = { x: WIDTH / 2, y: HEIGHT - 30 };
const DEFAULT_TARGET = { x: WIDTH / 2, y: 60 };

const randomTarget = () => ({
  x: 60 + Math.random() * (WIDTH - 120),
  y: 40 + Math.random() * (HEIGHT / 2),
});

export default function RocketDemo() {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const populationRef = useRef(new Population(POPULATION_SIZE, START));
  const targetRef = useRef({ ...DEFAULT_TARGET });

  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [moveTarget, setMoveTarget] = useState(false);
  const [stats, setStats] = useState({ generation: 1, frame: 0, hits: 0, bestHits: 0, history: [] });

  const draw = () => {
    const ctx = canvasRef.current.getContext('2d');
    const { palette } = theme;
    const target = targetRef.current;

    ctx.fillStyle = palette.mode === 'dark' ? '#0d1117' : '#f4f6f8';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // target
    ctx.fillStyle = palette.secondary.main;
    ctx.beginPath();
    ctx.arc(target.x, target.y, HIT_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // launch pad
    ctx.fillStyle = palette.text.disabled;
    ctx.fillRect(START.x - 15, START.y + 6, 30, 4);

    // rockets, batched into two paths so 1,000 of them draw quickly
    const rockets = populationRef.current.rockets;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = palette.primary.main;
    ctx.beginPath();
    for (const r of rockets) if (!r.hit) ctx.rect(r.x - 1.5, r.y - 1.5, 3, 3);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = palette.success.main;
    ctx.beginPath();
    for (const r of rockets) if (r.hit) ctx.rect(r.x - 1.5, r.y - 1.5, 3, 3);
    ctx.fill();
  };

  const publishStats = () => {
    const p = populationRef.current;
    setStats({
      generation: p.generation,
      frame: p.frame,
      hits: p.hits,
      bestHits: p.bestHits,
      history: p.history.slice(-40),
    });
  };

  useEffect(() => {
    draw();
  }, [theme]);

  useEffect(() => {
    if (!running) return;
    let frameId;

    const tick = () => {
      const population = populationRef.current;
      for (let i = 0; i < speed; i++) {
        population.step(targetRef.current);
        if (population.frame >= LIFESPAN) {
          population.evolve(targetRef.current);
          if (moveTarget) targetRef.current = randomTarget();
        }
      }
      draw();
      publishStats();
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [running, speed, moveTarget]);

  // click to move the target: the trained population keeps flying, so you can
  // see whether the rockets learned to steer or just memorized a path
  const onCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    targetRef.current = {
      x: ((e.clientX - rect.left) * WIDTH) / rect.width,
      y: ((e.clientY - rect.top) * HEIGHT) / rect.height,
    };
    draw();
  };

  const reset = () => {
    setRunning(false);
    populationRef.current = new Population(POPULATION_SIZE, START);
    targetRef.current = { ...DEFAULT_TARGET };
    draw();
    publishStats();
  };

  const maxHistory = Math.max(1, ...stats.history);

  return (
    <Paper variant="outlined" sx={{ p: 3, textAlign: 'left' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2, alignItems: { sm: 'center' } }}>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => setRunning((r) => !r)}>
            {running ? 'Pause' : stats.generation > 1 || stats.frame > 0 ? 'Resume' : 'Launch'}
          </Button>
          <Button onClick={reset}>Reset</Button>
        </Stack>
        <ToggleButtonGroup size="small" exclusive value={speed} onChange={(_, v) => v && setSpeed(v)}>
          <ToggleButton value={1}>1x</ToggleButton>
          <ToggleButton value={4}>4x</ToggleButton>
          <ToggleButton value={16}>16x</ToggleButton>
        </ToggleButtonGroup>
        <FormControlLabel
          control={<Switch checked={moveTarget} onChange={(e) => setMoveTarget(e.target.checked)} />}
          label="New target each generation"
        />
      </Stack>

      <Box
        component="canvas"
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        onClick={onCanvasClick}
        sx={{ width: '100%', aspectRatio: `${WIDTH} / ${HEIGHT}`, borderRadius: 2, cursor: 'crosshair', display: 'block' }}
      />
      <Typography variant="caption" color="text.secondary">
        Click anywhere to move the target.
      </Typography>

      <Stack direction="row" spacing={3} sx={{ mt: 2, flexWrap: 'wrap' }}>
        <Typography variant="body2">Generation {stats.generation}</Typography>
        <Typography variant="body2">Frame {stats.frame} / {LIFESPAN}</Typography>
        <Typography variant="body2">Hits {stats.hits} / {POPULATION_SIZE}</Typography>
        <Typography variant="body2">Best {stats.bestHits}</Typography>
      </Stack>

      {stats.history.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="overline" color="text.secondary">Hits per generation</Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: 60 }}>
            {stats.history.map((h, i) => (
              <Box key={i} sx={{ flex: 1, height: `${(h / maxHistory) * 100}%`, minHeight: 2, bgcolor: 'primary.main', borderRadius: '2px 2px 0 0' }} />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
}
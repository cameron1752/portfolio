import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Building, ALGORITHMS, FLOORS, CARS, TICKS_PER_SECOND } from './building';

const WIDTH = 640;
const HEIGHT = 520;
const PAD = 10;
const LEFT = 90; // space for floor labels and waiting riders
const FLOOR_H = (HEIGHT - PAD * 2) / FLOORS;
const SHAFT_W = (WIDTH - LEFT - PAD) / CARS;
const CAR_COLORS = ['#e76f51', '#2a9d8f', '#e9c46a', '#8e7dbe', '#f4a261', '#4c8bf5'];

const TRAFFIC = {
  light: { label: 'Light', rate: 0.01 },
  normal: { label: 'Normal', rate: 0.02 },
  heavy: { label: 'Rush hour', rate: 0.05 },
};

const floorBottom = (pos) => HEIGHT - PAD - pos * FLOOR_H;
const seconds = (ticks) => (ticks / TICKS_PER_SECOND).toFixed(1) + 's';

export default function ElevatorDemo() {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const [algorithm, setAlgorithm] = useState('cost');
  const [traffic, setTraffic] = useState('normal');
  const [seed, setSeed] = useState(1);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const buildingRef = useRef(new Building({ algorithm: 'cost', seed: 1 }));
  const [stats, setStats] = useState(null);

  const draw = () => {
    const ctx = canvasRef.current.getContext('2d');
    const { palette } = theme;
    const building = buildingRef.current;

    ctx.fillStyle = palette.mode === 'dark' ? '#0d1117' : '#f4f6f8';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // floors and labels
    ctx.strokeStyle = palette.divider;
    ctx.fillStyle = palette.text.secondary;
    ctx.font = '11px sans-serif';
    ctx.textBaseline = 'middle';
    for (let f = 0; f <= FLOORS; f++) {
      const y = floorBottom(f);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
      if (f < FLOORS) ctx.fillText(f === 0 ? 'L' : String(f), 8, y - FLOOR_H / 2);
    }

    // shafts
    for (let c = 0; c < CARS; c++) {
      ctx.fillStyle = palette.action.hover;
      ctx.fillRect(LEFT + c * SHAFT_W + 6, PAD, SHAFT_W - 12, HEIGHT - PAD * 2);
    }

    // waiting riders, colored by the car assigned to pick them up
    const perFloor = new Map();
    for (const r of building.waiting) {
      const n = perFloor.get(r.origin) ?? 0;
      perFloor.set(r.origin, n + 1);
      if (n < 8) {
        ctx.fillStyle = CAR_COLORS[r.car.id];
        ctx.beginPath();
        ctx.arc(30 + n * 7, floorBottom(r.origin) - FLOOR_H / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // cars, with small markers for their planned stops
    ctx.textAlign = 'center';
    for (const car of building.cars) {
      const x = LEFT + car.id * SHAFT_W + 10;
      const w = SHAFT_W - 20;

      ctx.fillStyle = CAR_COLORS[car.id];
      ctx.globalAlpha = 0.35;
      for (const stop of car.stops) {
        ctx.fillRect(x + w - 4, floorBottom(stop) - FLOOR_H / 2 - 2, 4, 4);
      }

      ctx.globalAlpha = car.doorsOpen ? 0.55 : 1;
      const y = floorBottom(car.position) - FLOOR_H + 2;
      ctx.fillRect(x, y, w, FLOOR_H - 4);
      ctx.globalAlpha = 1;

      if (car.riders.length > 0) {
        ctx.fillStyle = '#fff';
        ctx.fillText(String(car.riders.length), x + w / 2, y + (FLOOR_H - 4) / 2);
      }
    }
    ctx.textAlign = 'left';
  };

  const publishStats = () => {
    const b = buildingRef.current;
    const s = b.stats;
    setStats({
      time: seconds(b.tick),
      completed: s.completed,
      waiting: b.waiting.length,
      avgWait: s.completed ? seconds(s.totalWait / s.completed) : '–',
      longestWait: s.completed ? seconds(s.longestWait) : '–',
      avgTrip: s.completed ? seconds(s.totalTrip / s.completed) : '–',
    });
  };

  // rebuild the building; the same seed replays the same riders
  const rebuild = (nextAlgorithm = algorithm, nextSeed = seed) => {
    buildingRef.current = new Building({ algorithm: nextAlgorithm, seed: nextSeed });
    draw();
    publishStats();
  };

  useEffect(() => {
    draw();
    publishStats();
  }, [theme]);

  useEffect(() => {
    if (!running) return;
    const rate = TRAFFIC[traffic].rate;
    let frameId;
    const tick = () => {
      for (let i = 0; i < speed; i++) buildingRef.current.step(rate);
      draw();
      publishStats();
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [running, speed, traffic]);

  return (
    <Paper variant="outlined" sx={{ p: 3, textAlign: 'left' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2, alignItems: { md: 'center' }, flexWrap: 'wrap' }}>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => setRunning((r) => !r)}>
            {running ? 'Pause' : 'Run'}
          </Button>
          <Button onClick={() => rebuild()}>Replay</Button>
          <Button
            onClick={() => {
              const next = Math.floor(Math.random() * 1e9);
              setSeed(next);
              rebuild(algorithm, next);
            }}
          >
            New traffic
          </Button>
        </Stack>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={algorithm}
          onChange={(_, value) => {
            if (!value) return;
            setAlgorithm(value);
            rebuild(value, seed);
          }}
        >
          {Object.entries(ALGORITHMS).map(([key, label]) => (
            <ToggleButton key={key} value={key}>{label}</ToggleButton>
          ))}
        </ToggleButtonGroup>

        <TextField
          select size="small" label="Traffic" value={traffic}
          onChange={(e) => {
            setTraffic(e.target.value);
            rebuild();
          }}
          sx={{ minWidth: 130 }}
        >
          {Object.entries(TRAFFIC).map(([key, { label }]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </TextField>

        <ToggleButtonGroup size="small" exclusive value={speed} onChange={(_, v) => v && setSpeed(v)}>
          <ToggleButton value={1}>1x</ToggleButton>
          <ToggleButton value={4}>4x</ToggleButton>
          <ToggleButton value={16}>16x</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Box
        component="canvas"
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        sx={{ width: '100%', aspectRatio: `${WIDTH} / ${HEIGHT}`, borderRadius: 2, display: 'block' }}
      />
      <Typography variant="caption" color="text.secondary">
        Waiting riders are colored by the car assigned to them. Switching algorithms replays the same riders, so the stats are a fair comparison.
      </Typography>

      {stats && (
        <Stack direction="row" spacing={3} sx={{ mt: 2, flexWrap: 'wrap', rowGap: 1 }}>
          <Typography variant="body2">Time {stats.time}</Typography>
          <Typography variant="body2">Trips {stats.completed}</Typography>
          <Typography variant="body2">Waiting {stats.waiting}</Typography>
          <Typography variant="body2">Avg wait {stats.avgWait}</Typography>
          <Typography variant="body2">Longest wait {stats.longestWait}</Typography>
          <Typography variant="body2">Avg trip {stats.avgTrip}</Typography>
        </Stack>
      )}
    </Paper>
  );
}
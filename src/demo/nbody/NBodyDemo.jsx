import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Simulation, SCENARIOS } from './nbody';

const WIDTH = 700;
const HEIGHT = 500;
const LAUNCH_SCALE = 0.03; // drag length to launch speed

export default function NBodyDemo() {
  const canvasRef = useRef(null);
  const [scenario, setScenario] = useState('solar');
  const simRef = useRef(new Simulation('solar'));
  const zoomRef = useRef(0.75);
  const dragRef = useRef(null);      // { start, current } in canvas pixels while dragging
  const selectedRef = useRef(null);  // id of the inspected body
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [stats, setStats] = useState(null);

  // the view follows the heaviest body, like the camera following the star in your Java version
  const camera = () => simRef.current.heaviest();

  const toScreen = (x, y) => {
    const cam = camera();
    return [WIDTH / 2 + (x - cam.x) * zoomRef.current, HEIGHT / 2 + (y - cam.y) * zoomRef.current];
  };
  const toWorld = (sx, sy) => {
    const cam = camera();
    return [cam.x + (sx - WIDTH / 2) / zoomRef.current, cam.y + (sy - HEIGHT / 2) / zoomRef.current];
  };

  const draw = () => {
    const ctx = canvasRef.current.getContext('2d');
    const bodies = simRef.current.bodies;

    ctx.fillStyle = '#05070d';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // trails
    ctx.lineWidth = 1;
    for (const b of bodies) {
      if (b.trail.length < 4) continue;
      ctx.strokeStyle = b.color;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      for (let i = 0; i < b.trail.length; i += 2) {
        const [sx, sy] = toScreen(b.trail[i], b.trail[i + 1]);
        i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // bodies, with a glow on stars
    for (const b of bodies) {
      const [sx, sy] = toScreen(b.x, b.y);
      ctx.shadowBlur = b.star ? 25 : 0;
      ctx.shadowColor = b.color;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(1.5, b.radius * zoomRef.current), 0, Math.PI * 2);
      ctx.fill();

      if (b.id === selectedRef.current) {
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(1.5, b.radius * zoomRef.current) + 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.shadowBlur = 0;

    // launch preview while dragging
    const drag = dragRef.current;
    if (drag) {
      ctx.strokeStyle = '#ffffff';
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(drag.start.x, drag.start.y);
      ctx.lineTo(drag.current.x, drag.current.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(drag.start.x, drag.start.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const publishStats = () => {
    const sim = simRef.current;
    const selected = sim.bodies.find((b) => b.id === selectedRef.current);
    if (!selected) selectedRef.current = null; // it may have merged into something
    const cam = camera();
    setStats({
      time: sim.time.toFixed(0),
      bodies: sim.bodies.length,
      drift: (sim.energyDrift() * 100).toFixed(3),
      selected: selected && {
        name: selected.name,
        mass: selected.mass.toFixed(2),
        speed: Math.hypot(selected.vx - cam.vx, selected.vy - cam.vy).toFixed(2),
        distance: Math.hypot(selected.x - cam.x, selected.y - cam.y).toFixed(0),
      },
    });
  };

  const rebuild = (key = scenario) => {
    simRef.current = new Simulation(key);
    selectedRef.current = null;
    draw();
    publishStats();
  };

  useEffect(() => {
    draw();
    publishStats();
  }, []);

  useEffect(() => {
    if (!running) return;
    let frameId;
    const tick = () => {
      const sim = simRef.current;
      for (let i = 0; i < speed; i++) sim.step();
      sim.recordTrails();
      draw();
      publishStats();
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [running, speed]);

  const canvasPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * WIDTH) / rect.width,
      y: ((e.clientY - rect.top) * HEIGHT) / rect.height,
    };
  };

  const onPointerDown = (e) => {
    canvasRef.current.setPointerCapture(e.pointerId);
    const p = canvasPoint(e);
    dragRef.current = { start: p, current: p };
  };

  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    dragRef.current.current = canvasPoint(e);
    if (!running) draw();
  };

  const onPointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    const sim = simRef.current;
    const dx = drag.current.x - drag.start.x;
    const dy = drag.current.y - drag.start.y;
    const [wx, wy] = toWorld(drag.start.x, drag.start.y);

    if (Math.hypot(dx, dy) < 6) {
      // a click, not a drag: select the body under the pointer
      const hit = sim.bodies.find((b) => Math.hypot(b.x - wx, b.y - wy) <= b.radius + 6 / zoomRef.current);
      selectedRef.current = hit ? hit.id : null;
    } else {
      // launch relative to the camera body, so dragging "along" an orbit feels natural
      const cam = camera();
      sim.launch(wx, wy, cam.vx + (dx / zoomRef.current) * LAUNCH_SCALE, cam.vy + (dy / zoomRef.current) * LAUNCH_SCALE);
    }
    draw();
    publishStats();
  };

  const zoom = (factor) => {
    zoomRef.current = Math.min(3, Math.max(0.25, zoomRef.current * factor));
    draw();
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, textAlign: 'left' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2, alignItems: { md: 'center' }, flexWrap: 'wrap' }}>
        <TextField
          select size="small" label="Scenario" value={scenario}
          onChange={(e) => { setScenario(e.target.value); rebuild(e.target.value); }}
          sx={{ minWidth: 220 }}
        >
          {Object.entries(SCENARIOS).map(([key, { label }]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </TextField>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Run'}</Button>
          <Button onClick={() => rebuild()}>Reset</Button>
        </Stack>

        <ToggleButtonGroup size="small" exclusive value={speed} onChange={(_, v) => v && setSpeed(v)}>
          <ToggleButton value={2}>1x</ToggleButton>
          <ToggleButton value={8}>4x</ToggleButton>
          <ToggleButton value={32}>16x</ToggleButton>
        </ToggleButtonGroup>

        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => zoom(1 / 1.25)}>−</Button>
          <Button size="small" variant="outlined" onClick={() => zoom(1.25)}>+</Button>
        </Stack>
      </Stack>

      <Box
        component="canvas"
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { dragRef.current = null; draw(); }}
        sx={{ width: '100%', aspectRatio: `${WIDTH} / ${HEIGHT}`, borderRadius: 2, display: 'block', cursor: 'crosshair', touchAction: 'none' }}
      />
      <Typography variant="caption" color="text.secondary">
        Drag to launch a planet (the drag sets its direction and speed). Click a body to inspect it.
      </Typography>

      {stats && (
        <Stack direction="row" spacing={3} sx={{ mt: 2, flexWrap: 'wrap', rowGap: 1 }}>
          <Typography variant="body2">Time {stats.time}</Typography>
          <Typography variant="body2">Bodies {stats.bodies}</Typography>
          <Typography variant="body2">Energy drift {stats.drift}%</Typography>
          {stats.selected && (
            <Typography variant="body2">
              <strong>{stats.selected.name}</strong>: mass {stats.selected.mass}, speed {stats.selected.speed}, distance {stats.selected.distance}
            </Typography>
          )}
        </Stack>
      )}
    </Paper>
  );
}
import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { loadModel, predict } from './network';
import { preprocess } from './preprocess';

const CANVAS_SIZE = 280;
const BRUSH = 20;

export default function DigitDemo() {
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef(null);
  const [model, setModel] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadModel().then(setModel);
    clearCanvas();
  }, []);

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    previewRef.current?.getContext('2d').clearRect(0, 0, 28, 28);
    setResult(null);
  };

  // pointer position in canvas pixels, even if CSS scales the canvas (e.g. on phones)
  const getPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * CANVAS_SIZE) / rect.width,
      y: ((e.clientY - rect.top) * CANVAS_SIZE) / rect.height,
    };
  };

  const drawLine = (from, to) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = 'white';
    ctx.lineWidth = BRUSH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const onPointerDown = (e) => {
    canvasRef.current.setPointerCapture(e.pointerId);
    drawing.current = true;
    lastPoint.current = getPoint(e);
    drawLine(lastPoint.current, lastPoint.current); // a dot, for single taps
  };

  const onPointerMove = (e) => {
    if (!drawing.current) return;
    const point = getPoint(e);
    drawLine(lastPoint.current, point);
    lastPoint.current = point;
  };

  const onPointerUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    classify();
  };

  const classify = () => {
    if (!model) return;
    const pixels = preprocess(canvasRef.current);
    if (!pixels) return;
    setResult(predict(model, pixels));

    // draw what the network sees into the preview
    const ctx = previewRef.current.getContext('2d');
    const image = ctx.createImageData(28, 28);
    pixels.forEach((v, i) => {
      const c = Math.round(v * 255);
      image.data.set([c, c, c, 255], i * 4);
    });
    ctx.putImageData(image, 0, 0);
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, textAlign: 'left' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ alignItems: { xs: 'center', md: 'flex-start' } }}>
        <Box>
          <Box
            component="canvas"
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            sx={{
              width: CANVAS_SIZE,
              maxWidth: '100%',
              aspectRatio: '1',
              borderRadius: 2,
              touchAction: 'none',
              cursor: 'crosshair',
              display: 'block',
            }}
          />
          <Button onClick={clearCanvas} sx={{ mt: 1 }}>Clear</Button>
        </Box>

        <Box sx={{ flex: 1, width: '100%' }}>
          {!model ? (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <CircularProgress size={20} />
              <Typography>Loading the network…</Typography>
            </Stack>
          ) : !result ? (
            <Typography color="text.secondary">Draw a digit from 0 to 9.</Typography>
          ) : (
            <>
              <Stack direction="row" spacing={3} sx={{ alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">Prediction</Typography>
                  <Typography variant="h2" sx={{ lineHeight: 1 }}>{result.digit}</Typography>
                </Box>
                <Box>
                  <Typography variant="overline" color="text.secondary">What it sees</Typography>
                  <Box
                    component="canvas"
                    ref={previewRef}
                    width={28}
                    height={28}
                    sx={{ width: 84, height: 84, imageRendering: 'pixelated', display: 'block', borderRadius: 1 }}
                  />
                </Box>
              </Stack>

              {result.scores.map((score, digit) => (
                <Stack key={digit} direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                  <Typography sx={{ width: 16, fontFamily: 'monospace' }}>{digit}</Typography>
                  <Box sx={{ flex: 1, bgcolor: 'action.hover', borderRadius: 1, height: 14 }}>
                    <Box
                      sx={{
                        width: `${score * 100}%`,
                        height: '100%',
                        borderRadius: 1,
                        bgcolor: digit === result.digit ? 'primary.main' : 'text.disabled',
                        transition: 'width 0.2s',
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ width: 40, textAlign: 'right' }}>
                    {(score * 100).toFixed(0)}%
                  </Typography>
                </Stack>
              ))}
            </>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
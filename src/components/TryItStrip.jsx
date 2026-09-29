import { Link } from 'react-router';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import projects from '../data/projects.json';

// most impressive first; demos not listed here go at the end
const ORDER = ['digits', 'rockets', 'nbody', 'elevator', 'genetic', 'sorting'];

const isVideo = (src) => /\.(mp4|webm)$/i.test(src);

const rank = (p) => {
  const i = ORDER.indexOf(p.demo);
  return i === -1 ? ORDER.length : i;
};

export default function TryItStrip() {
  const demos = projects.filter((p) => p.demo).sort((a, b) => rank(a) - rank(b));
  if (demos.length === 0) return null;

  return (
    <Box component="section" id="try-it" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>Try it in your browser</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {demos.length} of my projects run live, right on this site, no install needed.
      </Typography>

      <Box
        sx={{
          display: { xs: 'flex', sm: 'grid' },
          gridTemplateColumns: { sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2,
          // on phones, a swipeable row instead of a tall stack
          overflowX: { xs: 'auto', sm: 'visible' },
          scrollSnapType: { xs: 'x mandatory', sm: 'none' },
          pb: { xs: 1, sm: 0 },
          mx: { xs: -2, sm: 0 },
          px: { xs: 2, sm: 0 },
        }}
      >
        {demos.map((p) => (
          <Card
            key={p.slug}
            variant="outlined"
            sx={{
              flex: { xs: '0 0 78%', sm: 'initial' },
              scrollSnapAlign: 'start',
              textAlign: 'left',
              transition: 'transform 0.15s, box-shadow 0.15s',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 },
            }}
          >
            <CardActionArea component={Link} to={`/projects/${p.slug}#demo`} sx={{ height: '100%' }}>
              <CardMedia
                component={isVideo(p.image) ? 'video' : 'img'}
                src={p.image}
                {...(isVideo(p.image)
                  ? { autoPlay: true, loop: true, muted: true, playsInline: true }
                  : { alt: p.title, loading: 'lazy' })}
                sx={{ height: 140, objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {p.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {p.demoTagline ?? p.description}
                </Typography>
                <Typography variant="button" color="primary">
                  Try it →
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
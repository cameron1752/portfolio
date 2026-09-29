// src/pages/ProjectDetail.jsx
import { useEffect } from 'react';
import { useParams, Link } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import projects from '../data/projects.json';
import GeneticDemo from '../demo/genetic/GeneticDemo';
import SortVisualizer from '../demo/sort/SortVisualizer';
import DigitDemo from '../demo/classifier/DigitDemo';
import RocketDemo from '../demo/rockets/RocketDemo';
import ElevatorDemo from '../demo/elevator/ElevatorDemo';
import NBodyDemo from '../demo/nbody/NBodyDemo';

import { useLocation } from 'react-router';
const DEMOS = {
  genetic: GeneticDemo,
  sorting: SortVisualizer,
  digits: DigitDemo,
  rockets: RocketDemo,
  elevator: ElevatorDemo,
  nbody: NBodyDemo
};

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = projects.find(p => p.slug === slug);


// inside the component:
const location = useLocation();

useEffect(() => {
  if (!location.hash) {
    window.scrollTo(0, 0);
    return;
  }
  // wait a moment so the page has rendered before scrolling
  const timer = setTimeout(() => {
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
  return () => clearTimeout(timer);
}, [slug, location.hash]);

  if (!project || !project.details) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Project not found</Typography>
        <Button component={Link} to="/">Back to home</Button>
      </Box>
    );
  }

  const { title, tech = [], link, image, details } = project;

  const Demo = DEMOS[project.demo];

  return (
    <Box component="article" sx={{ py: 4, maxWidth: 800, mx: 'auto' }}>
      <Button component={Link} to="/#projects" sx={{ mb: 2 }}>← All projects</Button>

      <Typography variant="h3" sx={{ mb: 1 }}>{title}</Typography>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 3 }}>
        {tech.map(t => <Chip key={t} label={t} />)}
      </Stack>

      {image && (
        <Box component="img" src={image} alt={title}
          sx={{ width: '100%', borderRadius: 2, mb: 3 }} />
      )}

      <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem' }}>
        {details.overview}
      </Typography>

      {details.sections?.map(s => (
        <Box key={s.heading} sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>{s.heading}</Typography>
          <Typography variant="body1">{s.body}</Typography>
        </Box>
      ))}

      {details.screenshots?.map(src => (
        <Box key={src} component="img" src={src} alt={`${title} screenshot`}
          sx={{ width: '100%', borderRadius: 2, mb: 2 }} />
      ))}

      {Demo && (
        <Box id="demo" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Try it yourself</Typography>
          <Demo />
        </Box>
      )}

      <Button variant="contained" href={link} target="_blank" rel="noopener noreferrer">
        View on GitHub
      </Button>
    </Box>
  );
}
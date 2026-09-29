
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import ProjectCard from './ProjectCard';
import Grid from '@mui/material/Grid';
import projects from '../data/projects.json';
import Resume from './Resume';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Home() {
  return (
    <>
      <Container>
            <Box component="section" sx={{ p: 2, border: '1px dashed grey', textAlign: 'center' }}>
              <Typography variant="h3">Cam Knickerbocker</Typography>
              <Typography variant="h4">Software Engineer</Typography>
              <Typography variant="h5">camks12@gmail.com | camknickerbocker.com</Typography>
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', alignItems: 'center' }}>
                <a href="https://github.com/cameron1752" target="_blank" rel="noopener noreferrer">
                  <img src="/GitHub-Mark-32px.png" alt="GitHub" width={32} height={32} />
                </a>
                <a href="https://www.linkedin.com/in/camknickerbocker/" target="_blank" rel="noopener noreferrer">
                  <img src="/LI-Bug.svg.original.svg" alt="LinkedIn" width={32} height={32} />
                </a>
              </Stack>

            </Box>
            <Box component="section" sx={{ p: 2, border: '1px dashed grey', textAlign: 'center' }}>
              <Typography variant="h4" sx={{ mb: 4 }}>Projects</Typography>
              <Grid container spacing={3} sx={{
                justifyContent: "center",
                alignItems: "center",
              }}>

                {projects.map(project => (
                  <Grid key={project.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <ProjectCard {...project} />
                  </Grid>
                ))}

              </Grid>
            </Box>
            <Box component="section" sx={{ p: 2, border: '1px dashed grey' }}>
              <Typography variant="h4" sx={{ textAlign: 'center' }}>Resume</Typography>
              <Resume />
            </Box>
          </Container>
    </>
  );
}
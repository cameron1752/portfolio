import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import resume from '../data/resume.json';

function ExperienceItem({ company, location, positions = [] }) {
  return (
    <Box
      sx={{
        position: 'relative',
        pl: 4,
        pb: 4,
        borderLeft: 2,
        borderColor: 'divider',
        '&:last-of-type': { pb: 0 },
      }}
    >
      {/* timeline dot */}
      <Box
        sx={{
          position: 'absolute',
          left: -7,
          top: 6,
          width: 12,
          height: 12,
          borderRadius: '50%',
          bgcolor: 'primary.main',
        }}
      />
      <Typography variant="h6">{company}</Typography>
      <Typography variant="body2" color="text.secondary">{location}</Typography>

      {positions.map(p => (
        <Box key={p.role} sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{p.role}</Typography>
          <Typography variant="caption" color="text.secondary">
            {p.start} – {p.end}
          </Typography>
          {p.highlights?.length > 0 && (
            <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2.5 }}>
              {p.highlights.map(h => (
                <Typography component="li" variant="body2" key={h} sx={{ mb: 0.5 }}>
                  {h}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}

export default function Resume() {
  return (
    <Box component="section" id="resume" sx={{ py: 6, px: 2, maxWidth: 900, mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 4 }}
      >
        <Typography variant="h4">Experience</Typography>
        <Button variant="contained" href="/Cameron-Knickerbocker-Resume.pdf" download>
          Download Resume
        </Button>
      </Stack>

      <Box sx={{ ml: 1 }}>
        {resume.experience.map(job => (
          <ExperienceItem key={job.id} {...job} />
        ))}
      </Box>

      <Grid container spacing={3} sx={{ mt: 6 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Education</Typography>
            {resume.education.map(e => (
              <Box key={e.id}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{e.school}</Typography>
                <Typography variant="body2">{e.degree}</Typography>
                <Typography variant="caption" color="text.secondary">{e.start} – {e.end}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Skills</Typography>
            {resume.skills.map(group => (
              <Box key={group.category} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  {group.category}
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  {group.items.map(s => <Chip key={s} label={s} size="small" />)}
                </Stack>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
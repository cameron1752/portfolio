import { Link } from 'react-router';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

const GITHUB_PROFILE = 'https://github.com/cameron1752';

export default function ProjectCard({ slug, title, description, tech = [], link, image, details }) {
  const hasDetails = Boolean(slug && details?.overview);

  const linkProps = hasDetails
    ? { component: Link, to: `/projects/${slug}` }
    : { href: link || GITHUB_PROFILE, target: '_blank', rel: 'noopener noreferrer' };

  return (
    <Card sx={{ height: 500, maxWidth: 345 }}>
      <CardActionArea
        {...linkProps}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
        }}
      >
        <CardMedia
          component="img"
          image={image}
          alt={title}
          sx={{ height: 194, objectFit: 'cover', flexShrink: 0 }}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mt: 'auto', mb: 2 }}>
            <Typography gutterBottom variant="h5" component="div">
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              {description}
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {tech.map(t => (
                <Chip key={t} label={t} />
              ))}
            </Stack>
          </Box>
          <Button variant="contained" component="span">
            {hasDetails ? 'Learn More' : 'View on GitHub'}
          </Button>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
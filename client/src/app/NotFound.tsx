import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

export default function NotFound() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography
        component="h1"
        variant="h4"
        gutterBottom
      >
        Page not found
      </Typography>
      <Typography paragraph>The address does not match a page in this application.</Typography>
      <Link
        component={RouterLink}
        to="/"
      >
        Return to Home
      </Link>
    </Box>
  );
}

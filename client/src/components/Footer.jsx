import React from 'react';
import { Box, Container, Grid, Typography, Link, Stack, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../utils/translations';

const Footer = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: (theme) => theme.palette.primary.main,
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              {t('footerTitle')}
            </Typography>
            <Typography variant="body2" sx={{ maxWidth: '90%' }}>
              {t('footerDescription')}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <IconButton color="inherit" aria-label="Facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter">
                <TwitterIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram">
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn">
                <LinkedInIcon />
              </IconButton>
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              {t('quickLinks')}
            </Typography>
            <Stack spacing={1}>
              <Link component={RouterLink} to="/" color="inherit" underline="hover">
                {t('home')}
              </Link>
              <Link component={RouterLink} to="/cards" color="inherit" underline="hover">
                {t('cards')}
              </Link>
              <Link component={RouterLink} to="/about" color="inherit" underline="hover">
                {t('aboutUs')}
              </Link>
              <Link component={RouterLink} to="/privacy" color="inherit" underline="hover">
                {t('privacyPolicy')}
              </Link>
              <Link component={RouterLink} to="/terms" color="inherit" underline="hover">
                {t('termsOfService')}
              </Link>
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              {t('contactUs')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('address')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('phone')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('email')}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body2" align="center" sx={{ pt: 4, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              &copy; {new Date().getFullYear()} SoldierSupport. {t('rights')}
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
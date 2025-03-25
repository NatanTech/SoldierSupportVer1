import React from 'react';
import { Container, Box, Typography, Button, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../utils/translations';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  borderRadius: '15px',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.9)',
}));

const NotFound = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);

  return (
    <Container maxWidth="md" sx={{ mt: 10, mb: 4 }}>
      <StyledPaper>
        <Typography variant="h1" color="primary" sx={{ fontWeight: 'bold', fontSize: '8rem', mb: 2 }}>
          404
        </Typography>
        
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'medium' }}>
          {t('pageNotFound')}
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4, maxWidth: '600px' }}>
          {t('pageNotFoundDescription')}
        </Typography>
        
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
        >
          {t('backToHomepage')}
        </Button>
      </StyledPaper>
    </Container>
  );
};

export default NotFound;
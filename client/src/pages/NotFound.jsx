import React from 'react';
import { Container, Box, Typography, Button, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

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
  return (
    <Container maxWidth="md" sx={{ mt: 10, mb: 4 }}>
      <StyledPaper>
        <Typography 
          variant="h1" 
          component="h1" 
          sx={{ 
            fontWeight: 900, 
            fontSize: { xs: '6rem', md: '10rem' },
            color: 'primary.main',
            lineHeight: 1
          }}
        >
          404
        </Typography>
        
        <Typography variant="h4" component="h2" gutterBottom>
          העמוד לא נמצא
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4, maxWidth: '600px' }}>
          אנחנו מצטערים, אבל העמוד שחיפשת לא קיים. ייתכן שהקישור שגוי או שהדף הוסר.
        </Typography>
        
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
        >
          חזרה לדף הבית
        </Button>
      </StyledPaper>
    </Container>
  );
};

export default NotFound;
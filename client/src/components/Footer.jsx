import React from 'react';
import { Box, Container, Typography, Link, Grid, Divider, IconButton } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 6,
        px: 2, 
        mt: 'auto', 
        backgroundColor: 'primary.main',
        color: 'white'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              SoldierSupport
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
              החיבור בין חיילים לבין אזרחים - מחברים ביניכם עם מה שבאמת חשוב.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton color="inherit" aria-label="Facebook">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn">
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              קישורים מהירים
            </Typography>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/" color="inherit" underline="hover">
                  דף הבית
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/cards" color="inherit" underline="hover">
                  כל הכרטיסים
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/create-card" color="inherit" underline="hover">
                  יצירת כרטיס
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover">
                  מדיניות פרטיות
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover">
                  תנאי שימוש
                </Link>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              צור קשר
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
              אימייל: info@soldiersupport.co.il
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
              טלפון: 03-1234567
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              כתובת: רחוב האלוף 123, תל אביב
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', my: 3 }} />
        
        <Typography variant="body2" align="center" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} SoldierSupport. כל הזכויות שמורות.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  Divider, 
  IconButton, 
  Chip, 
  Avatar,
  Grid,
  CardMedia
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Phone as PhoneIcon, 
  Chat as ChatIcon, 
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  ImageNotSupported as ImageNotSupportedIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../utils/translations';

const CardPreview = ({ card, open, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPhone, setShowPhone] = useState(false);
  const { language } = useLanguage();
  const t = useTranslation(language);
  
  if (!card) return null;
  
  const isRequest = card.cardType === 'request';
  const cardDate = new Date(card.createdAt).toLocaleDateString('he-IL');
  
  const startChat = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      // Check if chat already exists for this card and user
      const res = await axios.post(`/api/chat/start/${card._id}`);
      navigate(`/chat/${res.data._id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ 
        sx: { 
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
        } 
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip 
            label={isRequest ? 'מבקש' : 'תורם'} 
            color={isRequest ? 'secondary' : 'primary'} 
            size="small"
            sx={{ mr: 1.5 }}
          />
          <Typography variant="h5" component="div">
            {card.itemName}
          </Typography>
        </Box>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label={t('close')}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {card.image ? (
              <CardMedia
                component="img"
                alt={card.itemName}
                image={`${process.env.REACT_APP_API_URL || ''}${card.image}`}
                sx={{ 
                  width: '100%', 
                  height: 200, 
                  borderRadius: '8px', 
                  overflow: 'hidden',
                  mb: 2 
                }}
              />
            ) : (
              <Box sx={{ 
                width: '100%', 
                height: 200, 
                borderRadius: '8px', 
                overflow: 'hidden',
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <ImageNotSupportedIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                <Typography variant="body2" align="center">
                  {t('noImageAvailable')}
                </Typography>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                {card.cardType === 'request' ? t('requestCard') : t('donationCard')}
              </Typography>
              
              <Typography variant="body1" paragraph>
                {card.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                  {card.user?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('postedBy')}: {card.user?.username || t('anonymous')}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('postedOn')}: {new Date(card.createdAt).toLocaleDateString()}
              </Typography>
              
              {card.location && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('location')}: {card.location.address || t('locationNotSpecified')}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
        {card.phoneNumber ? (
          <Button 
            startIcon={<PhoneIcon />} 
            color="primary" 
            variant={showPhone ? "contained" : "outlined"}
            onClick={() => setShowPhone(!showPhone)}
          >
            {showPhone ? card.phoneNumber : 'הצג מספר טלפון'}
          </Button>
        ) : (
          <Button 
            startIcon={<ChatIcon />} 
            color="primary" 
            variant="outlined"
            onClick={startChat}
          >
            {t('contact')}
          </Button>
        )}
        
        <Button onClick={onClose} color="inherit">
          {t('close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CardPreview; 
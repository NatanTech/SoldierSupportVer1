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
  Avatar
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Phone as PhoneIcon, 
  Chat as ChatIcon, 
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CardPreview = ({ card, open, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPhone, setShowPhone] = useState(false);
  
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
      maxWidth="sm"
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
          <Typography variant="h6" component="div">
            {card.itemName}
          </Typography>
        </Box>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 0, pb: 2 }}>
        {card.imageUrl && (
          <Box sx={{ 
            width: '100%', 
            height: 200, 
            borderRadius: '8px', 
            overflow: 'hidden',
            mb: 2 
          }}>
            <img 
              src={card.imageUrl.startsWith('http') ? card.imageUrl : `/${card.imageUrl}`} 
              alt={card.itemName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        )}
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          {card.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationIcon fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {card.location?.address || 'מיקום לא צוין'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalendarIcon fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {cardDate}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
            {card.user?.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Typography variant="subtitle2">
            {card.user?.username || 'משתמש'}
          </Typography>
        </Box>
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
            צור קשר
          </Button>
        )}
        
        <Button onClick={onClose} color="inherit">
          סגור
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CardPreview; 
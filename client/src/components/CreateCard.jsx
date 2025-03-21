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
      // Check if chat already exists or create new one
      const res = await axios.post('/api/chat', {
        cardId: card._id,
        recipientId: card.user._id
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Navigate to chat
      navigate(`/chat/${res.data._id}`);
      onClose();
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: isRequest ? 'rgba(255, 152, 0, 0.1)' : 'rgba(25, 118, 210, 0.1)',
        borderBottom: `3px solid ${isRequest ? '#ff9800' : '#1976d2'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          {card.itemName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            label={isRequest ? 'בקשה מחייל' : 'תרומה לחייל'} 
            color={isRequest ? 'warning' : 'primary'}
            size="small"
          />
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {card.imageUrl && (
          <Box sx={{ mb: 3, borderRadius: '8px', overflow: 'hidden' }}>
            <img 
              src={card.imageUrl.startsWith('http') ? card.imageUrl : `http://localhost:5000${card.imageUrl}`} 
              alt={card.itemName} 
              style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} 
            />
          </Box>
        )}
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          {card.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {card.location.address}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CalendarIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            פורסם בתאריך {cardDate}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 28, height: 28, fontSize: '0.8rem' }}>
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
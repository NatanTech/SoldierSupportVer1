import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  RadioGroup, 
  Radio, 
  FormControlLabel, 
  FormControl, 
  FormLabel,
  Alert,
  CircularProgress,
  Divider,
  Snackbar,
  InputLabel,
  Select,
  MenuItem,
  ButtonGroup,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { 
  CloudUpload as UploadIcon, 
  LocationOn as LocationIcon, 
  Check as CheckIcon 
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import LocationPicker from '../components/LocationPicker';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import EditLocationAltIcon from '@mui/icons-material/EditLocationAlt';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../utils/translations';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '15px',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.98)',
}));

const ImageUploadBox = styled(Box)(({ theme }) => ({
  border: '2px dashed #ccc',
  borderRadius: '10px',
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  }
}));

const HiddenInput = styled('input')({
  display: 'none',
});

const MapBox = styled(Box)(({ theme }) => ({
  height: '400px',
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const CreateCard = () => {
  const { user, authAxios } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = useTranslation(language);
  
  const [cardData, setCardData] = useState({
    itemName: '',
    description: '',
    phoneNumber: '',
    cardType: 'donation',
    location: {
      latitude: 31.7683,
      longitude: 35.2137,
      address: ''
    },
    image: null
  });
  
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    console.log('CreateCard useEffect running, authenticated:', user);
    document.title = 'יצירת כרטיס חדש | SoldierSupport';
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCardData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCardData(prevData => ({
        ...prevData,
        image: file
      }));
      
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Reverse geocoding to get address from coordinates
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&accept-language=he`
            );
            const data = await response.json();
            
            setCardData(prevData => ({
              ...prevData,
              location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                address: data.display_name || 'מיקום נוכחי'
              }
            }));
          } catch (error) {
            console.error('Error getting address from coordinates:', error);
            setCardData(prevData => ({
              ...prevData,
              location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                address: 'מיקום נוכחי'
              }
            }));
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('לא הצלחנו לאתר את המיקום הנוכחי, אנא הזן כתובת ידנית');
          setLocationLoading(false);
        }
      );
    } else {
      setError('דפדפן זה אינו תומך באיתור מיקום');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cardData.itemName || !cardData.description) {
      setError('אנא מלא את כל השדות הנדרשים');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      console.log('Submitting card data:', cardData);
      
      const formData = new FormData();
      formData.append('itemName', cardData.itemName);
      formData.append('description', cardData.description);
      formData.append('phoneNumber', cardData.phoneNumber);
      formData.append('cardType', cardData.cardType);
      formData.append('latitude', cardData.location.latitude);
      formData.append('longitude', cardData.location.longitude);
      formData.append('address', cardData.location.address || 'ישראל');
      
      if (cardData.image) {
        formData.append('image', cardData.image);
      }
      
      const response = await authAxios().post('/api/cards', formData);
      console.log('Card created successfully:', response.data);
      navigate('/cards');
      
    } catch (error) {
      console.error('Error creating card:', error);
      setError(error.response?.data?.message || 'שגיאה ביצירת הכרטיס');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          יש להתחבר כדי ליצור כרטיס חדש
        </Alert>
        <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
          לדף ההתחברות
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Box 
        sx={{ 
          position: 'relative',
          background: 'linear-gradient(135deg, #1976d2, #64b5f6)',
          p: '4px',
          borderRadius: '16px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '10px',
            left: '10px',
            right: '10px',
            bottom: '10px',
            border: '2px dashed rgba(255,255,255,0.3)',
            borderRadius: '10px',
            pointerEvents: 'none'
          }
        }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, sm: 4 }, 
            borderRadius: '12px',
            boxShadow: 'none',
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '100px',
              height: '100px',
              background: 'radial-gradient(circle, rgba(100,181,246,0.2) 0%, rgba(255,255,255,0) 70%)',
              borderRadius: '50%',
              zIndex: 0
            }
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ 
              fontWeight: 'bold',
              color: '#1976d2',
              mb: 3,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80px',
                height: '4px',
                borderRadius: '2px',
                background: 'linear-gradient(90deg, #1976d2, #64b5f6)'
              }
            }}
          >
            יצירת כרטיס חדש
          </Typography>
          
          <Divider sx={{ mb: 4 }} />
          
          {error && (
            <Alert severity="error" sx={{ mb: 3, fontWeight: 'medium' }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  name="itemName"
                  label="שם הפריט"
                  variant="outlined"
                  fullWidth
                  required
                  value={cardData.itemName}
                  onChange={handleChange}
                  dir="rtl"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="תיאור"
                  variant="outlined"
                  fullWidth
                  required
                  multiline
                  rows={4}
                  value={cardData.description}
                  onChange={handleChange}
                  dir="rtl"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="phoneNumber"
                  label="מספר טלפון (אופציונלי)"
                  variant="outlined"
                  fullWidth
                  value={cardData.phoneNumber}
                  onChange={handleChange}
                  dir="rtl"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="card-type-label">סוג כרטיס</InputLabel>
                  <Select
                    labelId="card-type-label"
                    name="cardType"
                    value={cardData.cardType}
                    onChange={handleChange}
                    label="סוג כרטיס"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="donation">תרומה</MenuItem>
                    <MenuItem value="request">בקשה</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    p: 3, 
                    border: '1px dashed #ccc', 
                    borderRadius: 2, 
                    mb: 2,
                    background: 'rgba(25, 118, 210, 0.03)'
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
                    מיקום
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <ButtonGroup fullWidth variant="outlined" sx={{ mb: 2 }}>
                      <Tooltip title="השתמש במיקום הנוכחי שלך">
                        <Button 
                          onClick={getCurrentLocation} 
                          disabled={locationLoading}
                          startIcon={locationLoading ? <CircularProgress size={20} /> : <MyLocationIcon />}
                          sx={{ borderRadius: '8px 0 0 8px', py: 1.5 }}
                        >
                          מיקום נוכחי
                        </Button>
                      </Tooltip>
                      <Tooltip title="הזן כתובת ידנית">
                        <Button 
                          onClick={() => setCardData(prev => ({ 
                            ...prev, 
                            location: { ...prev.location, address: '' } 
                          }))}
                          startIcon={<EditLocationAltIcon />}
                          sx={{ borderRadius: '0 8px 8px 0', py: 1.5 }}
                        >
                          הזנה ידנית
                        </Button>
                      </Tooltip>
                    </ButtonGroup>
                    
                    <TextField
                      name="address"
                      label="כתובת"
                      variant="outlined"
                      fullWidth
                      required
                      value={cardData.location.address}
                      onChange={(e) => setCardData({
                        ...cardData,
                        location: {
                          ...cardData.location,
                          address: e.target.value
                        }
                      })}
                      dir="rtl"
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                      helperText="הזן כתובת מלאה או תיאור מיקום"
                    />
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    p: 3, 
                    border: '1px dashed #ccc', 
                    borderRadius: 2,
                    background: 'rgba(25, 118, 210, 0.03)'
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
                    תמונה (אופציונלי)
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<CloudUploadIcon />}
                    sx={{ 
                      borderRadius: 2,
                      py: 1.5,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2
                      }
                    }}
                  >
                    העלה תמונה
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                  
                  {previewUrl && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }} 
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={loading}
                  startIcon={<AddCircleIcon />}
                  sx={{ 
                    mt: 2, 
                    py: 1.5, 
                    borderRadius: 2,
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                      boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : t('createCard')}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateCard;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Card as MuiCard,
  CardMedia,
  CardContent,
  Divider,
  Chip,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Message as MessageIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Place as PlaceIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../utils/translations';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '16px',
  marginBottom: theme.spacing(3),
  border: '1px solid #e0e0e0',
}));

const CardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = useTranslation(language);
  
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPhone, setShowPhone] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const response = await axios.get(`/api/cards/${id}`);
        setCard(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching card:', error);
        setError(error.response?.data?.message || 'שגיאה בטעינת הכרטיס');
        setLoading(false);
      }
    };

    fetchCard();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק כרטיס זה?')) {
      try {
        await axios.delete(`/api/cards/${id}`);
        setAlertMessage('הכרטיס נמחק בהצלחה');
        setAlertSeverity('success');
        setAlertOpen(true);
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } catch (error) {
        setAlertMessage(error.response?.data?.message || 'שגיאה במחיקת הכרטיס');
        setAlertSeverity('error');
        setAlertOpen(true);
      }
    }
  };

  const handleStartChat = async () => {
    try {
      const response = await axios.post('/api/chat', {
        cardOwner: card.user,
        card: card._id
      });
      
      navigate(`/chat/${response.data._id}`);
    } catch (error) {
      setAlertMessage(error.response?.data?.message || 'שגיאה ביצירת צ\'אט');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlertOpen(false);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" mt={2}>
          טוען פרטי כרטיס...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
        >
          חזור לדף הבית
        </Button>
      </Container>
    );
  }

  if (!card) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          הכרטיס לא נמצא
        </Alert>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
        >
          חזור לדף הבית
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        חזרה
      </Button>
      
      <StyledPaper elevation={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              {card.itemName}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip
                icon={<CategoryIcon />}
                label={card.category}
                color="primary"
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<PlaceIcon />}
                label={card.location.city}
                color="secondary"
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<PersonIcon />}
                label={card.userName}
                variant="outlined"
                size="small"
              />
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" fontWeight="bold">
                תיאור
              </Typography>
            </Box>
            
            <Typography paragraph sx={{ whiteSpace: 'pre-line' }}>
              {card.description}
            </Typography>
            
            {card.phoneNumber && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 1 }}>
                  <PhoneIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h3" fontWeight="bold">
                    יצירת קשר
                  </Typography>
                </Box>
                
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={showPhone ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  onClick={() => setShowPhone(!showPhone)}
                  sx={{ mb: 1 }}
                >
                  {showPhone ? 'הסתר מספר טלפון' : 'הצג מספר טלפון'}
                </Button>
                
                {showPhone && (
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <a href={`tel:${card.phoneNumber}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                        {card.phoneNumber}
                      </Box>
                    </a>
                  </Typography>
                )}
              </>
            )}
            
            {card.location.coordinates[0] !== 0 && card.location.coordinates[1] !== 0 && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 2 }}>
                  <PlaceIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h3" fontWeight="bold">
                    מיקום
                  </Typography>
                </Box>
                
                <Box sx={{ height: '300px', mb: 3, borderRadius: '8px', overflow: 'hidden' }}>
                  <MapContainer
                    center={[card.location.coordinates[1], card.location.coordinates[0]]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[card.location.coordinates[1], card.location.coordinates[0]]} />
                  </MapContainer>
                </Box>
              </>
            )}
            
            {card.imageUrl ? (
              <MuiCard sx={{ mb: 3, borderRadius: '12px', overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  image={card.imageUrl}
                  alt={card.itemName}
                  sx={{ 
                    height: { xs: '250px', md: '400px' },
                    objectFit: 'cover'
                  }}
                />
                <CardContent sx={{ py: 1, backgroundColor: 'rgba(0,0,0,0.03)' }}>
                  <Typography variant="body2" color="text.secondary">
                    תמונה של {card.itemName}
                  </Typography>
                </CardContent>
              </MuiCard>
            ) : null}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              {user && (
                <Box>
                  {user._id === card.user ? (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => navigate(`/edit-card/${card._id}`)}
                        sx={{ mr: 2 }}
                      >
                        עריכה
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleDelete}
                      >
                        מחיקה
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<MessageIcon />}
                      onClick={handleStartChat}
                    >
                      צ'אט עם התורם
                    </Button>
                  )}
                </Box>
              )}
              
              <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                {t('published')}: {new Date(card.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : language === 'ar' ? 'ar-EG' : 'he-IL')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </StyledPaper>
      
      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CardDetails;
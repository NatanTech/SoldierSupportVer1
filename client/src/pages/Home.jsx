import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Button, Paper, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
import SpeedIcon from '@mui/icons-material/Speed';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import axios from 'axios';
import L from 'leaflet';
import CardPreview from '../components/CardPreview';
import DotSimulation from '../components/DotSimulation';

// Delete Icon.Default.prototype._getIconUrl reference
delete L.Icon.Default.prototype._getIconUrl;

// Update the icons for the map
const requestIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const donationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom location icon using emoji-like appearance
const locationIcon = new L.DivIcon({
  html: '📍',
  className: 'location-emoji-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

// Styled components
const SectionTitle = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  fontWeight: 'bold',
  variant: 'h4',
  component: 'h2'
}));

// Hero section styling with more attractive background
const HeroSection = styled(Box)(({ theme }) => ({
  backgroundImage: 'url(/images/hero-background.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: 'white',
  padding: theme.spacing(8, 2),
  textAlign: 'center',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Modern gradient overlay instead of flat gray
    background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.85) 0%, rgba(17, 82, 147, 0.9) 100%)',
    zIndex: 1,
  },
}));

const HeroContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
}));

// Style for the info cards
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: theme.shadows[10],
  },
}));

// InfoCard component definition
const InfoCard = ({ icon, title, description }) => (
  <StyledCard elevation={2}>
    <CardContent sx={{ p: 4, textAlign: 'center' }}>
      <Box sx={{ mb: 2, color: 'primary.main' }}>
        {icon}
      </Box>
      <Typography variant="h6" component="h3" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </StyledCard>
);

// Add this CSS for the emoji icon
const emojiIconStyle = `
  .location-emoji-icon {
    font-size: 30px;
    text-align: center;
    line-height: 0;
  }
`;

// Add a styled component for the map container
const StyledMapContainer = styled(Paper)(({ theme }) => ({
  borderRadius: '15px',
  overflow: 'hidden',
  marginBottom: theme.spacing(6),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(25, 118, 210, 0.2)',
}));

// קומפוננטת הבקרה למיקום - מרכז עליון
function LocateControl() {
  const map = useMap();
  
  const handleLocate = () => {
    map.locate({
      setView: true,
      maxZoom: 16
    });
  };
  
  return (
    <Box 
      sx={{ 
        position: 'absolute', 
        top: '10px',  // חלק עליון
        left: '50%',  // מרכז אופקי
        transform: 'translateX(-50%)', // מרכוז אופקי
        zIndex: 1000,
        direction: 'ltr'
      }}
    >
      <Button
        onClick={handleLocate}
        variant="contained"
        size="small"
        sx={{
          width: '40px',
          height: '40px',
          minWidth: '40px',
          borderRadius: '50%',
          padding: 0,
          boxShadow: 2
        }}
      >
        <MyLocationIcon />
      </Button>
    </Box>
  );
}

const Home = () => {
  const [latestCards, setLatestCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [userLocation, setUserLocation] = useState([31.7683, 35.2137]); // ברירת מחדל: ירושלים
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // השג את מיקום המשתמש
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          console.log('לא ניתן לקבל את מיקום המשתמש');
        }
      );
    }

    // השג את הכרטיסים האחרונים
    const fetchLatestCards = async () => {
      try {
        const response = await axios.get('/api/cards?limit=6');
        setLatestCards(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching latest cards:', error);
        setLoading(false);
      }
    };

    fetchLatestCards();
  }, []);

  const openCardPreview = (card) => {
    setSelectedCard(card);
  };

  return (
    <Box>
      <style>{emojiIconStyle}</style>
      
      {/* Smaller hero section */}
      <HeroSection>
        <HeroContent>
          <Container maxWidth="md">
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              תמיכה בחיילים
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              חיבור בין חיילים ואזרחים לתמיכה הדדית
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                component={RouterLink} 
                to="/create-card" 
                variant="contained" 
                size="large"
                sx={{ 
                  px: 3, 
                  py: 1, 
                  borderRadius: '50px', 
                  fontSize: '1rem', 
                  fontWeight: 'bold',
                  bgcolor: '#ff6b6b',
                  '&:hover': {
                    bgcolor: '#ff5252',
                  },
                  boxShadow: '0 8px 16px rgba(255, 107, 107, 0.4)'
                }}
              >
                צור כרטיס
              </Button>
              <Button 
                component={RouterLink} 
                to="/cards" 
                variant="outlined" 
                color="inherit" 
                size="large"
                sx={{ 
                  px: 3, 
                  py: 1, 
                  borderRadius: '50px', 
                  fontSize: '1rem',
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                צפה בכל הכרטיסים
              </Button>
            </Box>
          </Container>
        </HeroContent>
      </HeroSection>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Map section with enhanced styling */}
        <SectionTitle>מפה</SectionTitle>
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          align="center" 
          sx={{ mb: 4 }}
        >
          <Box component="span" sx={{ color: '#ff6b6b', fontWeight: 'bold' }}>כתום</Box> - בקשות מחיילים | 
          <Box component="span" sx={{ color: '#1976d2', fontWeight: 'bold', ml: 1 }}>כחול</Box> - תרומות מאזרחים
        </Typography>
        <StyledMapContainer elevation={3}>
          <MapContainer
            center={userLocation}
            zoom={10}
            style={{ height: '400px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User's current location with the location emoji */}
            <Marker position={userLocation} icon={locationIcon}>
              <Popup>
                <Typography variant="body1" fontWeight="bold">המיקום שלך</Typography>
              </Popup>
            </Marker>
            
            {/* Card markers */}
            {!loading && latestCards.map(card => (
              card.location && card.location.coordinates && card.location.coordinates.length === 2 && 
              card.location.coordinates[0] !== 0 && card.location.coordinates[1] !== 0 && (
                <Marker
                  key={card._id}
                  position={[card.location.coordinates[1], card.location.coordinates[0]]}
                  icon={card.cardType === 'request' ? requestIcon : donationIcon}
                  eventHandlers={{
                    click: () => {
                      openCardPreview(card);
                    },
                  }}
                >
                  <Popup>
                    <Box sx={{ minWidth: 200, maxWidth: 250 }}>
                      <Typography variant="subtitle1" fontWeight="bold">{card.itemName}</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {card.description.length > 100 
                          ? card.description.substring(0, 100) + '...' 
                          : card.description}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        fullWidth
                        onClick={() => openCardPreview(card)}
                        sx={{ 
                          borderColor: card.cardType === 'request' ? '#ff6b6b' : '#1976d2',
                          color: card.cardType === 'request' ? '#ff6b6b' : '#1976d2',
                          '&:hover': {
                            borderColor: card.cardType === 'request' ? '#ff5252' : '#1565c0',
                            bgcolor: card.cardType === 'request' ? 'rgba(255, 107, 107, 0.1)' : 'rgba(25, 118, 210, 0.1)'
                          }
                        }}
                      >
                        הצג פרטים נוספים
                      </Button>
                    </Box>
                  </Popup>
                </Marker>
              )
            ))}
            <LocateControl />
          </MapContainer>
        </StyledMapContainer>
        
        {/* About section with enhanced cards */}
        <SectionTitle sx={{ mt: 6 }}>אודות</SectionTitle>
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <InfoCard 
              icon={<SecurityIcon fontSize="large" sx={{ color: '#4caf50' }} />}
              title="אבטחה ופרטיות"
              description="אנו שומרים על הפרטיות שלך בצורה הטובה ביותר, עם אבטחה מתקדמת להגנה על המידע האישי שלך."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard 
              icon={<PeopleIcon fontSize="large" sx={{ color: '#ff9800' }} />}
              title="קהילה תומכת"
              description="הצטרף לקהילה גדולה של אנשים שאכפת להם ורוצים לעזור לחיילים שלנו בכל דרך אפשרית."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard 
              icon={<SpeedIcon fontSize="large" sx={{ color: '#2196f3' }} />}
              title="מהירות ויעילות"
              description="מערכת פשוטה ומהירה שמחברת בין חיילים ותורמים במהירות וביעילות."
            />
          </Grid>
        </Grid>
      </Container>
      
      {/* Card preview modal */}
      {selectedCard && (
        <CardPreview 
          card={selectedCard} 
          open={Boolean(selectedCard)} 
          onClose={() => setSelectedCard(null)} 
        />
      )}

      <DotSimulation />
    </Box>
  );
};

export default Home;
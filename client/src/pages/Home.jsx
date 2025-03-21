import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  Card, 
  CardContent,
  useMediaQuery 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import CardPreview from '../components/CardPreview';
import { 
  Security as SecurityIcon, 
  PeopleAlt as PeopleIcon, 
  Speed as SpeedIcon 
} from '@mui/icons-material';

// Create custom marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const requestIcon = new L.Icon({
  iconUrl: '/markers/orange-marker.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const donationIcon = new L.Icon({
  iconUrl: '/markers/blue-marker.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '60vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  textAlign: 'center',
  position: 'relative',
  padding: theme.spacing(8, 2),
  backgroundColor: theme.palette.primary.main,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(6),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(6),
  textAlign: 'center',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: '80px',
    height: '4px',
    background: theme.palette.primary.main,
    bottom: '-15px',
    left: '50%',
    transform: 'translateX(-50%)',
    borderRadius: '2px',
  }
}));

const InfoCard = ({ icon, title, description }) => (
  <StyledCard elevation={2}>
    <CardContent sx={{ p: 4, textAlign: 'center' }}>
      <Box sx={{ mb: 2, color: 'primary.main' }}>
        {icon}
      </Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </StyledCard>
);

const Home = () => {
  const [userLocation, setUserLocation] = useState([31.77, 35.21]); // Default to Israel center
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        error => {
          console.error("Error getting location:", error);
        }
      );
    }
    
    // Fetch cards
    const fetchCards = async () => {
      try {
        const res = await axios.get('/api/cards');
        setCards(res.data);
      } catch (error) {
        console.error('Error fetching cards:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCards();
  }, []);
  
  return (
    <Box>
      <HeroSection>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
            תמיכה בחיילים
          </Typography>
          <Typography variant="h5" sx={{ mb: 5, fontWeight: 'normal' }}>
            פלטפורמה המחברת בין חיילים שצריכים ציוד לבין אזרחים שרוצים לתרום
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              component={RouterLink} 
              to="/create-card" 
              variant="contained" 
              color="primary" 
              size="large"
              sx={{ 
                px: 4, 
                py: 1.5, 
                borderRadius: '50px', 
                fontSize: '1.1rem', 
                fontWeight: 'bold',
                boxShadow: '0 8px 16px rgba(25, 118, 210, 0.3)'
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
                px: 4, 
                py: 1.5, 
                borderRadius: '50px', 
                fontSize: '1.1rem',
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              צפה בכל הכרטיסים
            </Button>
          </Box>
        </Container>
      </HeroSection>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <SectionTitle variant="h4" component="h2">
          למה SoldierSupport?
        </SectionTitle>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <InfoCard 
              icon={<SecurityIcon sx={{ fontSize: 60 }} />}
              title="מאובטח"
              description="המערכת מאובטחת ושומרת על פרטיות המשתמשים. מידע אישי נחשף רק כאשר אתם בוחרים לשתף אותו."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard 
              icon={<PeopleIcon sx={{ fontSize: 60 }} />}
              title="חיבור ישיר"
              description="אנחנו מאפשרים חיבור ישיר בין חיילים לאזרחים, ללא מתווכים ובצורה מהירה ויעילה."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard 
              icon={<SpeedIcon sx={{ fontSize: 60 }} />}
              title="מהיר ויעיל"
              description="המערכת מציגה בקשות ותרומות על גבי מפה, כך שקל למצוא התאמות במיקומים הקרובים אליכם."
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 10, mb: 6 }}>
          <SectionTitle variant="h4" component="h2">
            מפת בקשות ותרומות
          </SectionTitle>
          <Typography variant="subtitle1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            סקור את המפה כדי לראות בקשות מחיילים (כתום) ותרומות מאזרחים (כחול)
          </Typography>
        </Box>
        
        <Paper elevation={3} sx={{ borderRadius: '15px', overflow: 'hidden', mb: 6 }}>
          <MapContainer
            center={userLocation}
            zoom={10}
            style={{ height: '600px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User location */}
            <Marker position={userLocation}>
              <Popup>המיקום שלך</Popup>
            </Marker>
            
            {/* Card markers */}
            {!loading && cards.map(card => (
              <Marker
                key={card._id}
                position={[card.location.coordinates[1], card.location.coordinates[0]]}
                icon={card.cardType === 'request' ? requestIcon : donationIcon}
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
                      onClick={() => setSelectedCard(card)}
                    >
                      הצג פרטים נוספים
                    </Button>
                  </Box>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Paper>
        
        <Box sx={{ textAlign: 'center' }}>
          <Button 
            component={RouterLink} 
            to="/create-card" 
            variant="contained" 
            color="primary" 
            size="large"
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: '50px', 
              fontSize: '1.1rem', 
              fontWeight: 'bold'
            }}
          >
            צור כרטיס חדש
          </Button>
        </Box>
      </Container>
      
      {/* Card preview modal */}
      {selectedCard && (
        <CardPreview 
          card={selectedCard} 
          open={Boolean(selectedCard)} 
          onClose={() => setSelectedCard(null)} 
        />
      )}
    </Box>
  );
};

export default Home;
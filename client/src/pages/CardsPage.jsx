import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  InputAdornment, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Divider,
  IconButton
} from '@mui/material';
import { 
  Search as SearchIcon, 
  FilterList as FilterIcon,
  Clear as ClearIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CardPreview from '../components/CardPreview';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  borderRadius: '12px',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  }
}));

const CardsPage = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedCard, setSelectedCard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/cards');
        setCards(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching cards:', err);
        setError('אירעה שגיאה בטעינת הכרטיסים. אנא נסה שוב מאוחר יותר.');
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  // Filter cards based on search term and selected type
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         card.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || card.cardType === selectedType;
    return matchesSearch && matchesType;
  });

  // Sort filtered cards
  const sortedCards = [...filteredCards].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortOrder === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortOrder === 'alphabetical') {
      return a.itemName.localeCompare(b.itemName, 'he');
    }
    return 0;
  });

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSortOrder('newest');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ mb: 5 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ fontWeight: 'bold', textAlign: 'center' }}
        >
          בנק הפריטים
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          gutterBottom
          sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto', mb: 4 }}
        >
          כאן תוכלו למצוא את כל הפריטים שאנשים מציעים או מבקשים. חפשו, סננו או צרו קשר ישירות עם המפרסמים.
        </Typography>
      </Box>

      {/* Search and Filter Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: '12px' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="חיפוש פריטים"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>סוג כרטיס</InputLabel>
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                label="סוג כרטיס"
              >
                <MenuItem value="all">הכל</MenuItem>
                <MenuItem value="donation">תרומה</MenuItem>
                <MenuItem value="request">בקשה</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>מיון לפי</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                label="מיון לפי"
              >
                <MenuItem value="newest">החדש ביותר</MenuItem>
                <MenuItem value="oldest">הישן ביותר</MenuItem>
                <MenuItem value="alphabetical">לפי שם (א-ת)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleClearFilters}
              startIcon={<ClearIcon />}
              disabled={!searchTerm && selectedType === 'all' && sortOrder === 'newest'}
            >
              נקה סינון
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results section */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {sortedCards.length} פריטים נמצאו
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper elevation={3} sx={{ p: 4, borderRadius: '12px', textAlign: 'center' }}>
          <Typography color="error" variant="h6">{error}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
          >
            נסה שוב
          </Button>
        </Paper>
      ) : sortedCards.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, borderRadius: '12px', textAlign: 'center' }}>
          <Typography variant="h6">לא נמצאו פריטים התואמים את החיפוש</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            נסה לשנות את מונחי החיפוש או להסיר את הסינון
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {sortedCards.map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card._id}>
              <StyledCard onClick={() => handleCardClick(card)}>
                <CardMedia
                  component="img"
                  height="200"
                  image={card.imageUrl || '/placeholder-image.jpg'}
                  alt={card.itemName}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom noWrap>
                      {card.itemName}
                    </Typography>
                    <Chip 
                      label={card.cardType === 'donation' ? 'תרומה' : 'בקשה'}
                      color={card.cardType === 'donation' ? 'success' : 'info'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    mb: 2
                  }}>
                    {card.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {card.location.address}
                    </Typography>
                  </Box>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(card.createdAt).toLocaleDateString('he-IL')}
                  </Typography>
                  <Button size="small" color="primary">
                    פרטים מלאים
                  </Button>
                </CardActions>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Card preview modal */}
      {selectedCard && (
        <CardPreview 
          card={selectedCard} 
          open={Boolean(selectedCard)} 
          onClose={() => setSelectedCard(null)} 
        />
      )}
    </Container>
  );
};

export default CardsPage; 
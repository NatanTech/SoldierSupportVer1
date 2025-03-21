import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CardPreview from '../components/CardPreview';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [cards, setCards] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    type: '',
    id: null
  });

  useEffect(() => {
    // Check if user is admin, if not navigate away
    if (user && user.role !== 'admin') {
      navigate('/');
    }
    
    // Load initial data
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Load cards
      const cardsRes = await axios.get('/api/cards', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setCards(cardsRes.data);
      
      // Load users
      const usersRes = await axios.get('/api/auth/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setError('אירעה שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchQuery('');
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleViewCard = (card) => {
    setSelectedCard(card);
  };

  const handleDeleteClick = (type, id) => {
    setDeleteDialog({
      open: true,
      type,
      id
    });
  };

  const handleDeleteConfirm = async () => {
    const { type, id } = deleteDialog;
    
    try {
      if (type === 'card') {
        await axios.delete(`/api/cards/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setCards(cards.filter(card => card._id !== id));
      } else if (type === 'user') {
        await axios.delete(`/api/auth/users/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUsers(users.filter(user => user._id !== id));
      }
      
      setDeleteDialog({ open: false, type: '', id: null });
    } catch (error) {
      console.error('Error deleting item:', error);
      setError(`אירעה שגיאה במחיקת ה${type === 'card' ? 'כרטיס' : 'משתמש'}`);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, type: '', id: null });
  };

  // Filter items based on search query
  const filteredCards = cards.filter(card => 
    card.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          טוען נתונים...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        לוח בקרה - ניהול
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="כרטיסים" />
            <Tab label="משתמשים" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', mb: 3, gap: 2 }}>
            <TextField
              placeholder="חיפוש..."
              variant="outlined"
              size="small"
              fullWidth
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={loadData}
            >
              רענן
            </Button>
          </Box>

          {/* Cards tab */}
          {tabValue === 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>שם הפריט</TableCell>
                    <TableCell>סוג</TableCell>
                    <TableCell>משתמש</TableCell>
                    <TableCell>תאריך יצירה</TableCell>
                    <TableCell align="center">פעולות</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCards.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        לא נמצאו כרטיסים
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCards.map((card) => (
                      <TableRow key={card._id}>
                        <TableCell>{card.itemName}</TableCell>
                        <TableCell>
                          {card.cardType === 'request' ? 'בקשה' : 'תרומה'}
                        </TableCell>
                        <TableCell>{card.user?.username || 'לא ידוע'}</TableCell>
                        <TableCell>
                          {new Date(card.createdAt).toLocaleDateString('he-IL')}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleViewCard(card)}
                            size="small"
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            onClick={() => handleDeleteClick('card', card._id)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Users tab */}
          {tabValue === 1 && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>שם משתמש</TableCell>
                    <TableCell>אימייל</TableCell>
                    <TableCell>תפקיד</TableCell>
                    <TableCell>תאריך הצטרפות</TableCell>
                    <TableCell align="center">פעולות</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        לא נמצאו משתמשים
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.role === 'admin' ? 'מנהל' : 'משתמש רגיל'}
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString('he-IL')}
                        </TableCell>
                        <TableCell align="center">
                          {user.role !== 'admin' && (
                            <IconButton 
                              color="error" 
                              onClick={() => handleDeleteClick('user', user._id)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>
          {`האם למחוק את ה${deleteDialog.type === 'card' ? 'כרטיס' : 'משתמש'}?`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteDialog.type === 'card'
              ? 'פעולה זו תמחק את הכרטיס לצמיתות. לא ניתן לשחזר את המידע לאחר המחיקה.'
              : 'פעולה זו תמחק את המשתמש לצמיתות. לא ניתן לשחזר את המידע לאחר המחיקה.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            ביטול
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            מחק
          </Button>
        </DialogActions>
      </Dialog>

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

export default AdminDashboard;
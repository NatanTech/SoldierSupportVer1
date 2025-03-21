import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Box, 
  Paper, 
  Alert, 
  Link,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { PersonAdd as RegisterIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: '15px',
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
}));

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, user } = useAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const { username, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Registering with:', { 
        username: formData.username, 
        email: formData.email
      });
      
      // Remove confirmPassword as it's not needed in the API call
      const { confirmPassword, ...userData } = formData;
      
      const result = await register(userData);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
        console.log('Registration failed:', result.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('שגיאה ברישום, אנא נסה שנית');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8, mb: 4 }}>
      <StyledPaper>
        <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 'bold', mb: 3 }}>
          הרשמה
        </Typography>
        
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="שם משתמש"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={handleChange}
            variant="outlined"
            dir="rtl"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="אימייל"
            name="email"
            autoComplete="email"
            value={email}
            onChange={handleChange}
            variant="outlined"
            dir="rtl"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="סיסמה"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={handleChange}
            variant="outlined"
            dir="rtl"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="אימות סיסמה"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={handleChange}
            variant="outlined"
            dir="rtl"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: '8px', fontWeight: 'bold' }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RegisterIcon />}
          >
            {loading ? 'נרשם...' : 'הרשמה'}
          </Button>
          <Box textAlign="center" mt={2}>
            <Typography variant="body2">
              כבר יש לך חשבון?{' '}
              <Link component={RouterLink} to="/login" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}>
                התחבר כאן
              </Link>
            </Typography>
          </Box>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default Register;
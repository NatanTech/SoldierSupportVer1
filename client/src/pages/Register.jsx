import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { PersonAdd as RegisterIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // If you want to show a message instead of redirecting
  useEffect(() => {
    if (user) {
      console.log("User is already registered and logged in");
      // Option 1: You can comment this out to allow visiting the register page while logged in
      // navigate('/');
    }
  }, [user, navigate]);

  const { username, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Validate fields as user types
    let newErrors = { ...formErrors };
    
    switch (name) {
      case 'username':
        newErrors.username = value.length < 3 ? 'שם המשתמש חייב להכיל לפחות 3 תווים' : '';
        break;
      case 'email':
        newErrors.email = !validateEmail(value) ? 'אנא הכנס כתובת אימייל תקינה' : '';
        break;
      case 'password':
        newErrors.password = !validatePasswordStrength(value) 
          ? 'הסיסמה חייבת להכיל לפחות 8 תווים, מספר אחד ואות אחת' 
          : '';
        // Also check confirm password match if it exists
        if (formData.confirmPassword) {
          newErrors.confirmPassword = value !== formData.confirmPassword 
            ? 'הסיסמאות אינן תואמות' 
            : '';
        }
        break;
      case 'confirmPassword':
        newErrors.confirmPassword = value !== formData.password 
          ? 'הסיסמאות אינן תואמות' 
          : '';
        break;
      default:
        break;
    }
    
    setFormErrors(newErrors);
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const validatePasswordStrength = (password) => {
    // Password must be at least 8 characters and contain at least one number and one letter
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return re.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Comprehensive form validation
    let hasError = false;
    let newErrors = { ...formErrors };
    
    if (!formData.username) {
      newErrors.username = 'שם משתמש הוא שדה חובה';
      hasError = true;
    } else if (formData.username.length < 3) {
      newErrors.username = 'שם המשתמש חייב להכיל לפחות 3 תווים';
      hasError = true;
    }
    
    if (!formData.email) {
      newErrors.email = 'אימייל הוא שדה חובה';
      hasError = true;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'אנא הכנס כתובת אימייל תקינה';
      hasError = true;
    }
    
    if (!formData.password) {
      newErrors.password = 'סיסמה היא שדה חובה';
      hasError = true;
    } else if (!validatePasswordStrength(formData.password)) {
      newErrors.password = 'הסיסמה חייבת להכיל לפחות 8 תווים, מספר אחד ואות אחת';
      hasError = true;
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'אימות סיסמה הוא שדה חובה';
      hasError = true;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'הסיסמאות אינן תואמות';
      hasError = true;
    }
    
    setFormErrors(newErrors);
    
    if (hasError) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('/api/auth/register', formData);
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.status === 400) {
        setError('שם משתמש או אימייל כבר קיימים במערכת');
      } else {
        setError('שגיאה בהרשמה. אנא נסה שוב מאוחר יותר');
      }
      console.error(err);
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
            error={!!formErrors.username}
            helperText={formErrors.username}
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
            error={!!formErrors.email}
            helperText={formErrors.email}
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
            error={!!formErrors.password}
            helperText={formErrors.password}
            required
            fullWidth
            name="password"
            label="סיסמה"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={handleChange}
            variant="outlined"
            dir="rtl"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
            required
            fullWidth
            name="confirmPassword"
            label="אימות סיסמה"
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={handleChange}
            variant="outlined"
            dir="rtl"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
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
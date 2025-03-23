import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  IconButton, 
  Typography, 
  Container, 
  Avatar, 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Badge,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EditIcon from '@mui/icons-material/Edit';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';

// Logo styling for modern appearance
const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.5rem',
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '1px',
}));

// Avatar styling with hover effect
const StyledAvatar = styled(Avatar)(({ theme }) => ({
  cursor: 'pointer',
  border: '2px solid white',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
}));

const StyledProfileDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 15,
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    overflow: 'hidden'
  },
  '& .MuiDialogTitle-root': {
    background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
    color: 'white',
    padding: theme.spacing(2, 3),
  }
}));

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, checkAuth, authAxios } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // States for profile dialog
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: ''
  });
  const [editableProfile, setEditableProfile] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || ''
      });
      setEditableProfile({
        username: user.username || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/');
  };

  const openProfileDialog = (editMode = false) => {
    setIsEditMode(editMode);
    setProfileDialogOpen(true);
    handleMenuClose();
    // Reset error state
    setProfileError('');
    setProfileSuccess('');
  };

  const closeProfileDialog = () => {
    setProfileDialogOpen(false);
    setIsEditMode(false);
  };

  const switchToEditMode = () => {
    setIsEditMode(true);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditableProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async () => {
    try {
      // Validate form
      if (editableProfile.newPassword && editableProfile.newPassword !== editableProfile.confirmPassword) {
        setProfileError('הסיסמאות אינן תואמות');
        return;
      }

      // Create payload
      const payload = {
        username: editableProfile.username,
        email: editableProfile.email
      };

      // Add password update if provided
      if (editableProfile.currentPassword && editableProfile.newPassword) {
        payload.currentPassword = editableProfile.currentPassword;
        payload.newPassword = editableProfile.newPassword;
      }

      // Make API call to update profile
      const response = await authAxios().put('/api/users/profile', payload);
      
      // Update local state
      setProfileData({
        username: response.data.username,
        email: response.data.email
      });
      
      // Show success message
      setProfileSuccess('פרטי המשתמש עודכנו בהצלחה');
      setSnackbarOpen(true);
      
      // Reset password fields
      setEditableProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      // Exit edit mode after successful update
      setIsEditMode(false);
      
      // Update auth context
      checkAuth();
    } catch (error) {
      console.error('Update profile error:', error);
      setProfileError(
        error.response?.data?.message || 
        'אירעה שגיאה בעדכון הפרופיל. אנא נסה שנית.'
      );
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  const mainNavLinks = [
    { title: 'דף הבית', path: '/' },
    { title: 'כרטיסים', path: '/cards' },
  ];
  
  if (isAuthenticated) {
    mainNavLinks.push({ title: 'צור כרטיס', path: '/create-card' });
  }

  // Mobile drawer content
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', py: 2 }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        SoldierSupport
      </Typography>
      <Divider />
      <List>
        {mainNavLinks.map((link) => (
          <ListItem key={link.path} disablePadding>
            <Button
              fullWidth
              component={RouterLink}
              to={link.path}
              sx={{ justifyContent: 'start', px: 3, py: 1.5 }}
            >
              <ListItemText primary={link.title} />
            </Button>
          </ListItem>
        ))}
        
        {isAuthenticated ? (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <Button
                fullWidth
                onClick={() => openProfileDialog(false)}
                sx={{ justifyContent: 'start', px: 3, py: 1.5 }}
              >
                <ListItemText primary="הפרופיל שלי" />
              </Button>
            </ListItem>
            {user && user.role === 'admin' && (
              <ListItem disablePadding>
                <Button
                  fullWidth
                  component={RouterLink}
                  to="/admin"
                  sx={{ justifyContent: 'start', px: 3, py: 1.5 }}
                >
                  <ListItemText primary="מנהל מערכת" />
                </Button>
              </ListItem>
            )}
            <ListItem disablePadding>
              <Button
                fullWidth
                onClick={handleLogout}
                sx={{ justifyContent: 'start', px: 3, py: 1.5 }}
              >
                <ListItemText primary="התנתק" />
              </Button>
            </ListItem>
          </>
        ) : (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <Button
                fullWidth
                component={RouterLink}
                to="/login"
                sx={{ justifyContent: 'start', px: 3, py: 1.5 }}
              >
                <ListItemText primary="התחברות" />
              </Button>
            </ListItem>
            <ListItem disablePadding>
              <Button
                fullWidth
                component={RouterLink}
                to="/register"
                sx={{ justifyContent: 'start', px: 3, py: 1.5 }}
              >
                <ListItemText primary="הרשמה" />
              </Button>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  // Profile menu
  const profileMenu = (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      onClick={handleMenuClose}
      transformOrigin={{ horizontal: 'left', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      PaperProps={{
        sx: {
          mt: 1.5,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderRadius: 2,
          minWidth: 180,
        },
      }}
    >
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {user?.username}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.email}
        </Typography>
      </Box>
      
      <Divider />
      
      <MenuItem onClick={() => openProfileDialog(false)} dense>
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        הפרופיל שלי
      </MenuItem>
      
      <MenuItem onClick={() => openProfileDialog(true)} dense>
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        ערוך פרופיל
      </MenuItem>
      
      {user && user.role === 'admin' && (
        <MenuItem onClick={() => navigate('/admin')} dense>
          <ListItemIcon>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          ניהול מערכת
        </MenuItem>
      )}
      
      <Divider />
      
      <MenuItem onClick={handleLogout} dense>
        <ListItemIcon>
          <ExitToAppIcon fontSize="small" />
        </ListItemIcon>
        התנתק
      </MenuItem>
    </Menu>
  );

  // Profile Dialog Content
  const profileDialogContent = (
    <StyledProfileDialog
      open={profileDialogOpen}
      onClose={closeProfileDialog}
      aria-labelledby="profile-dialog-title"
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle id="profile-dialog-title">
        {isEditMode ? 'עריכת פרופיל' : 'הפרופיל שלי'}
        <IconButton
          aria-label="close"
          onClick={closeProfileDialog}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, pb: 1 }}>
        {profileError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {profileError}
          </Alert>
        )}
        
        {profileSuccess && !isEditMode && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {profileSuccess}
          </Alert>
        )}
        
        {isEditMode ? (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="שם משתמש"
                name="username"
                value={editableProfile.username}
                onChange={handleProfileChange}
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="דואר אלקטרוני"
                name="email"
                type="email"
                value={editableProfile.email}
                onChange={handleProfileChange}
                variant="outlined"
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'medium' }}>
                שינוי סיסמה (השאר ריק אם אין צורך בשינוי)
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="סיסמה נוכחית"
                name="currentPassword"
                type="password"
                value={editableProfile.currentPassword}
                onChange={handleProfileChange}
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="סיסמה חדשה"
                name="newPassword"
                type="password"
                value={editableProfile.newPassword}
                onChange={handleProfileChange}
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="אימות סיסמה חדשה"
                name="confirmPassword"
                type="password"
                value={editableProfile.confirmPassword}
                onChange={handleProfileChange}
                variant="outlined"
                margin="normal"
              />
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{ 
                  width: 80, 
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
                }}
              >
                {profileData.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography variant="h6">{profileData.username}</Typography>
                <Typography variant="body1" color="text.secondary">
                  {user?.role === 'admin' ? 'מנהל מערכת' : 'משתמש רשום'}
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  דואר אלקטרוני
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {profileData.email}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  הצטרף בתאריך
                </Typography>
                <Typography variant="body1">
                  {user?.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString('he-IL') 
                    : 'לא זמין'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        {isEditMode ? (
          <>
            <Button onClick={closeProfileDialog} color="inherit">
              ביטול
            </Button>
            <Button 
              onClick={handleProfileUpdate} 
              variant="contained" 
              startIcon={<SaveIcon />}
            >
              שמור שינויים
            </Button>
          </>
        ) : (
          <Button 
            onClick={switchToEditMode} 
            variant="contained" 
            startIcon={<EditIcon />}
          >
            ערוך פרופיל
          </Button>
        )}
      </DialogActions>
    </StyledProfileDialog>
  );

  return (
    <>
      <AppBar position="fixed" color="default" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {/* Logo Container */}
            <Box sx={{ display: 'flex', flexGrow: { xs: 1, md: 0 } }}>
              <LogoContainer component={RouterLink} to="/" sx={{ textDecoration: 'none' }}>
                <Logo variant="h6">
                  SoldierSupport
                </Logo>
              </LogoContainer>
            </Box>
            
            {/* Navigation Links - Right Side */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end' }}>
              {mainNavLinks.map((link) => (
                <Button
                  key={link.path}
                  component={RouterLink}
                  to={link.path}
                  sx={{ 
                    color: 'primary.main',
                    mx: 1,
                    fontWeight: 'medium',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    }
                  }}
                >
                  {link.title}
                </Button>
              ))}
            </Box>
            
            {/* Profile Container - Center */}
            <Box 
              sx={{ 
                position: 'absolute', 
                left: '50%', 
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isAuthenticated ? (
                <StyledAvatar
                  onClick={handleMenuOpen}
                  sx={{ 
                    bgcolor: 'primary.main',
                    fontSize: isMobile ? '1rem' : '1.2rem'
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </StyledAvatar>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    component={RouterLink} 
                    to="/login" 
                    variant="outlined" 
                    color="primary" 
                    size="small"
                  >
                    התחברות
                  </Button>
                  <Button 
                    component={RouterLink} 
                    to="/register" 
                    variant="contained" 
                    color="primary" 
                    size="small"
                  >
                    הרשמה
                  </Button>
                </Box>
              )}
            </Box>
            
            {/* Mobile menu button */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: '70%', maxWidth: '280px', boxSizing: 'border-box' },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Profile menu */}
      {profileMenu}
      
      {/* Profile dialog */}
      {profileDialogContent}
      
      {/* Success snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {profileSuccess}
        </Alert>
      </Snackbar>
      
      {/* Toolbar spacer to prevent content from going under the appbar */}
      <Toolbar />
    </>
  );
};

export default Navbar;
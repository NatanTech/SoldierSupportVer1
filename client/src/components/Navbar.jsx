import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem, 
  Box, 
  Container, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText,
  ListItemIcon,
  Divider,
  useMediaQuery
} from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import { 
  Menu as MenuIcon, 
  Home as HomeIcon, 
  AddCircle as AddIcon, 
  ViewList as ListIcon, 
  Dashboard as DashboardIcon, 
  Login as LoginIcon, 
  Logout as LogoutIcon, 
  PersonAdd as RegisterIcon 
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Logo = styled(Typography)(({ theme }) => ({
  fontFamily: 'Rubik, sans-serif',
  fontWeight: 700,
  letterSpacing: '.2rem',
  color: 'inherit',
  textDecoration: 'none',
}));

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
};

const handleProfileMenuOpen = (event) => {
  setAnchorEl(event.currentTarget);
};

const handleProfileMenuClose = () => {
  setAnchorEl(null);
};

const handleLogout = () => {
  logout();
  handleProfileMenuClose();
  navigate('/');
};

const navItems = [
  { label: 'דף הבית', path: '/', icon: <HomeIcon /> },
  { label: 'כל הכרטיסים', path: '/cards', icon: <ListIcon /> },
  { label: 'יצירת כרטיס', path: '/create-card', icon: <AddIcon />, authRequired: true }
];

// Add admin dashboard link for admin users
if (user && user.role === 'admin') {
  navItems.push({ label: 'ניהול', path: '/admin', icon: <DashboardIcon /> });
}

const renderProfileMenu = (
  <Menu
    anchorEl={anchorEl}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    keepMounted
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    open={Boolean(anchorEl)}
    onClose={handleProfileMenuClose}
    sx={{ mt: 1 }}
  >
    <MenuItem sx={{ minWidth: 150 }}>
      <Typography variant="subtitle2">שלום, {user?.username}</Typography>
    </MenuItem>
    <Divider />
    <MenuItem onClick={handleLogout}>
      <ListItemIcon>
        <LogoutIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary="התנתקות" />
    </MenuItem>
  </Menu>
);

const drawer = (
  <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: 240 }}>
    <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
      <Logo variant="h6" component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
        SoldierSupport
      </Logo>
    </Box>
    <Divider />
    <List>
      {navItems.map((item) => (
        (!item.authRequired || user) && (
          <ListItem 
            button 
            component={RouterLink} 
            to={item.path} 
            key={item.path}
            sx={{ textAlign: 'right', py: 1.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        )
      ))}
      
      {!user ? (
        <>
          <ListItem 
            button 
            component={RouterLink} 
            to="/login" 
            sx={{ textAlign: 'right', py: 1.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LoginIcon />
            </ListItemIcon>
            <ListItemText primary="התחברות" />
          </ListItem>
          <ListItem 
            button 
            component={RouterLink} 
            to="/register" 
            sx={{ textAlign: 'right', py: 1.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <RegisterIcon />
            </ListItemIcon>
            <ListItemText primary="הרשמה" />
          </ListItem>
        </>
      ) : (
        <ListItem 
          button 
          onClick={handleLogout}
          sx={{ textAlign: 'right', py: 1.5 }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="התנתקות" />
        </ListItem>
      )}
    </List>
  </Box>
);

return (
  <Box sx={{ flexGrow: 1 }}>
    <AppBar position="static" sx={{ bgcolor: 'white', color: 'text.primary', boxShadow: 1 }}>
      <Container maxWidth="lg">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Logo variant="h6" component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
              SoldierSupport
            </Logo>
          </Box>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {navItems.map((item) => (
                (!item.authRequired || user) && (
                  <Button
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    sx={{ 
                      color: 'text.primary', 
                      mx: 1,
                      '&:hover': {
                        color: 'primary.main',
                        bgcolor: 'rgba(25, 118, 210, 0.04)'
                      }
                    }}
                    startIcon={item.icon}
                  >
                    {item.label}
                  </Button>
                )
              ))}
            </Box>
          )}
          
          <Box sx={{ display: 'flex' }}>
            {user ? (
              <IconButton
                edge="end"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar 
                  sx={{ 
                    width: 35, 
                    height: 35, 
                    bgcolor: 'primary.main',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            ) : (
              !isMobile && (
                <Box>
                  <Button
                    component={RouterLink}
                    to="/login"
                    color="primary"
                    variant="outlined"
                    sx={{ ml: 1 }}
                    startIcon={<LoginIcon />}
                  >
                    התחברות
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    color="primary"
                    variant="contained"
                    sx={{ ml: 1 }}
                    startIcon={<RegisterIcon />}
                  >
                    הרשמה
                  </Button>
                </Box>
              )
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
    
    <Drawer
      variant="temporary"
      anchor="right"
      open={drawerOpen}
      onClose={handleDrawerToggle}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
      }}
    >
      {drawer}
    </Drawer>
    
    {renderProfileMenu}
  </Box>
);
};

export default Navbar;
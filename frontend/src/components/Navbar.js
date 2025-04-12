import React from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Menu,
  MenuItem,
  IconButton
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';
import PersonIcon from '@mui/icons-material/Person';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const isLoginPage = location.pathname === '/login';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const navItemStyle = {
    fontFamily: 'Lexend Mega, sans-serif',
    fontWeight: 'bold',
    color: 'black',
    backgroundColor: '#FEE440',
    border: '2px solid black',
    px: 2,
    py: 1,
    mx: 0.75,
    boxShadow: '4px 6px 0 black',
    borderRadius: '0.75rem',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    minWidth: '100px',
    fontSize: '0.875rem',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '42px',
    '&:hover': {
      backgroundColor: '#FFD60A',
      boxShadow: '6px 8px 0 black',
      transform: 'translateY(-2px)'
    }
  };

  const activeNavItemStyle = {
    ...navItemStyle,
    backgroundColor: '#FFD60A',
    boxShadow: '6px 8px 0 black',
    borderWidth: '3px',
    transform: 'translateY(-2px)',
    '&:hover': {
      backgroundColor: '#FFD60A',
      boxShadow: '8px 10px 0 black',
      transform: 'translateY(-3px)'
    }
  };

  const menuPaperStyle = {
    mt: 1.5,
    backgroundColor: '#FAFAFA',
    border: '2px solid black',
    boxShadow: '4px 6px 0 black'
  };

  // Re-ordered authenticated nav items:
  const authNavItems = [
    { path: '/carbon', label: 'Carbon' },
    { path: '/recommendations', label: 'Recommendations' },
    { path: '/destinations', label: 'Destinations' },
    { path: '/eco-stays', label: 'Eco-Stays' },
    { path: '/sustainable-routes', label: 'Routes' },
    { path: '/trips', label: 'Trips' },
    { path: '/responsible-travel', label: 'Guide' },
    { path: '/reviews', label: 'Reviews' }
  ];

  const guestNavItems = [
    { path: '/login', label: 'Login' },
    { path: '/register', label: 'Register' },
    { path: '/responsible-travel', label: 'Travel' }
  ];

  return (
    <AppBar position="static" sx={{ backgroundColor: '#BAFCA2', borderBottom: '4px solid black' }}>
      <Container maxWidth={false} sx={{ overflow: 'visible' }}>
        <Toolbar 
          sx={{ 
            display: 'flex', 
            gap: 1.5,
            overflowX: 'auto',
            overflowY: 'visible',
            pb: 2,
            pt: 2,
            px: 2,
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.4)',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.5)',
              },
            },
          }}
        >
          <Typography
            component={RouterLink}
            to="/"
            sx={{
              fontSize: '2.5rem',
              fontFamily: 'Lexend Mega, sans-serif',
              fontWeight: '900',
              color: 'black',
              textDecoration: 'none',
              backgroundColor: '#FFDB58',
              px: 3,
              py: 1.2,
              border: '3px solid black',
              boxShadow: '6px 8px 0 black',
              borderRadius: '0.75rem',
              flexShrink: 0,
              mb: 1,
              letterSpacing: '0.5px',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '8px 10px 0 black',
              },
              transition: 'all 0.2s ease'
            }}
          >
            Convidat
          </Typography>

          <Box 
            sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              alignItems: 'center',
              gap: 1,
              overflowX: 'auto',
              overflowY: 'visible',
              flexGrow: 1,
              pb: 1,
              ...(!user && { justifyContent: 'flex-end' }),
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.5)',
                },
              },
            }}
          >
            {(user ? authNavItems : guestNavItems).map((item) => (
              <Button
                key={item.path}
                component={RouterLink}
                to={item.path}
                sx={isActivePath(item.path) ? activeNavItemStyle : navItemStyle}
              >
                {item.label}
              </Button>
            ))}

            {user && (
              <Button
                color="inherit"
                component={RouterLink}
                to="/profile"
                startIcon={<PersonIcon />}
                sx={isActivePath('/profile') ? activeNavItemStyle : navItemStyle}
              >
                Profile
              </Button>
            )}
          </Box>

          {/* Mobile menu button */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto', mb: 1 }}>
            <IconButton 
              onClick={handleMenuOpen} 
              sx={{ 
                color: 'black',
                border: '2px solid black',
                borderRadius: '0.75rem',
                p: 1,
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.1)'
                }
              }}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{ sx: menuPaperStyle }}
            >
              {(user ? authNavItems : guestNavItems).map((item) => (
                <MenuItem
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  onClick={handleMenuClose}
                  sx={isActivePath(item.path) ? 
                    { ...activeNavItemStyle, my: 1, boxShadow: 'none' } : 
                    { ...navItemStyle, my: 1, boxShadow: 'none' }
                  }
                >
                  {item.label}
                </MenuItem>
              ))}

              {user && (
                <>
                  <MenuItem
                    onClick={handleMenuClose}
                    sx={isActivePath('/profile') ?
                      { ...activeNavItemStyle, my: 1, boxShadow: 'none' } :
                      { ...navItemStyle, my: 1, boxShadow: 'none' }
                    }
                  >
                    <Button
                      color="inherit"
                      component={RouterLink}
                      to="/profile"
                      startIcon={<PersonIcon />}
                      sx={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      Profile
                    </Button>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      handleLogout();
                    }}
                    sx={{
                      ...navItemStyle,
                      my: 1,
                      backgroundColor: '#FF69B4',
                      '&:hover': {
                        backgroundColor: '#FF1493',
                      }
                    }}
                  >
                    Logout
                  </MenuItem>
                </>
              )}
            </Menu>
          </Box>

          {/* Logout button for desktop */}
          {user && (
            <Box sx={{ display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
              <Button 
                onClick={handleLogout} 
                startIcon={<LogoutIcon />}
                sx={{ 
                  ...navItemStyle, 
                  backgroundColor: '#FF69B4',
                  mx: 0.5,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: '#FF1493',
                    boxShadow: '6px 8px 0 black',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;

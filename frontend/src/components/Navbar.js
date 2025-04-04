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
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);

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

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const buttonStyles = {
    position: 'relative',
    textTransform: 'none',
    fontSize: '1rem',
    px: 2,
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.1),
      '&::after': {
        width: '100%'
      }
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: (props) => props.active ? '100%' : '0%',
      height: '2px',
      bgcolor: 'common.white',
      transition: 'width 0.3s ease-in-out'
    }
  };

  const menuItemStyles = {
    minWidth: 180,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1)
    }
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{
        backgroundColor: alpha(theme.palette.primary.main, 0.95),
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        height: { xs: '64px', sm: '72px' }
      }}
    >
      <Container maxWidth="lg">
        <Toolbar 
          disableGutters 
          sx={{ 
            minHeight: { xs: '64px', sm: '72px' },
            justifyContent: 'space-between'
          }}
        >
          <Typography
            variant="h5"
            component={RouterLink}
            to={user ? '/dashboard' : '/'}
            sx={{
              fontWeight: 700,
              letterSpacing: 1,
              background: `linear-gradient(45deg, ${theme.palette.common.white}, ${alpha(theme.palette.common.white, 0.8)})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textDecoration: 'none',
              '&:hover': {
                transform: 'scale(1.02)',
                transition: 'transform 0.2s ease-in-out'
              }
            }}
          >
            Convidat
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {user ? (
              <>
                {[
                  { path: '/carbon', label: 'Carbon Footprint' },
                  { path: '/recommendations', label: 'Travel Recommendations' },
                  { path: '/eco-stays', label: 'Eco Stays' },
                  { path: '/sustainable-routes', label: 'Sustainable Routes' },
                  { path: '/responsible-travel', label: 'Responsible Travel' }
                ].map((item) => (
                  <Button
                    key={item.path}
                    color="inherit"
                    component={RouterLink}
                    to={item.path}
                    sx={buttonStyles}
                    active={isActiveRoute(item.path)}
                  >
                    {item.label}
                  </Button>
                ))}
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  sx={{
                    ml: 2,
                    border: '1px solid',
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      borderColor: 'common.white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                {[
                  { path: '/login', label: 'Login' },
                  { path: '/register', label: 'Register' },
                  { path: '/responsible-travel', label: 'Responsible Travel' }
                ].map((item) => (
                  <Button
                    key={item.path}
                    color="inherit"
                    component={RouterLink}
                    to={item.path}
                    sx={buttonStyles}
                    active={isActiveRoute(item.path)}
                  >
                    {item.label}
                  </Button>
                ))}
              </>
            )}
          </Box>
          
          {/* Mobile menu */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  backgroundImage: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.main, 0.95)}, ${alpha(theme.palette.primary.dark, 0.95)})`,
                  backdropFilter: 'blur(8px)',
                  border: '1px solid',
                  borderColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              {user ? (
                [
                  { path: '/carbon', label: 'Carbon Footprint' },
                  { path: '/recommendations', label: 'Travel Recommendations' },
                  { path: '/eco-stays', label: 'Eco Stays' },
                  { path: '/sustainable-routes', label: 'Sustainable Routes' },
                  { path: '/responsible-travel', label: 'Responsible Travel' }
                ].map((item) => (
                  <MenuItem
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    onClick={handleMenuClose}
                    sx={menuItemStyles}
                    selected={isActiveRoute(item.path)}
                  >
                    {item.label}
                  </MenuItem>
                ))
              ) : (
                [
                  { path: '/login', label: 'Login' },
                  { path: '/register', label: 'Register' },
                  { path: '/responsible-travel', label: 'Responsible Travel' }
                ].map((item) => (
                  <MenuItem
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    onClick={handleMenuClose}
                    sx={menuItemStyles}
                    selected={isActiveRoute(item.path)}
                  >
                    {item.label}
                  </MenuItem>
                ))
              )}
              {user && (
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    handleLogout();
                  }}
                  sx={{
                    ...menuItemStyles,
                    borderTop: '1px solid',
                    borderColor: 'rgba(255,255,255,0.1)',
                    mt: 1
                  }}
                >
                  Logout
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 
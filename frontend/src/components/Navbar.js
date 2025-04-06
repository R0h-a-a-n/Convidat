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
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  const isActiveRoute = (path) => location.pathname === path;

  const navItemStyle = {
    fontFamily: 'Lexend Mega, sans-serif',
    fontWeight: 'bold',
    color: 'black',
    backgroundColor: '#FEE440',
    border: '2px solid black',
    px: 2,
    py: 1,
    mx: 1,
    boxShadow: '4px 6px 0 black',
    textTransform: 'uppercase',
    '&:hover': {
      backgroundColor: '#FFD60A',
      boxShadow: '6px 8px 0 black'
    }
  };

  const menuPaperStyle = {
    mt: 1.5,
    backgroundColor: '#FAFAFA',
    border: '2px solid black',
    boxShadow: '4px 6px 0 black'
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#00F5D4', borderBottom: '4px solid black' }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            component={RouterLink}
            to={user ? '/dashboard' : '/'}
            sx={{
              fontSize: '2rem',
              fontFamily: 'Lexend Mega, sans-serif',
              fontWeight: 'bold',
              color: 'black',
              textDecoration: 'none',
              backgroundColor: '#9B5DE5',
              px: 2,
              py: 1,
              border: '2px solid black',
              boxShadow: '4px 6px 0 black'
            }}
          >
            Convidat
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {(user ? [
              { path: '/carbon', label: 'Carbon' },
              { path: '/recommendations', label: 'Recommendations' },
              { path: '/eco-stays', label: 'Eco Stays' },
              { path: '/sustainable-routes', label: 'Routes' },
              { path: '/responsible-travel', label: 'Travel' }
            ] : [
              { path: '/login', label: 'Login' },
              { path: '/register', label: 'Register' },
              { path: '/responsible-travel', label: 'Travel' }
            ]).map((item) => (
              <Button
                key={item.path}
                component={RouterLink}
                to={item.path}
                sx={navItemStyle}
              >
                {item.label}
              </Button>
            ))}

            {user && (
              <Button onClick={handleLogout} sx={{ ...navItemStyle, backgroundColor: '#FF595E' }}>
                Logout
              </Button>
            )}
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton onClick={handleMenuOpen} sx={{ color: 'black' }}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{ sx: menuPaperStyle }}
            >
              {(user ? [
                { path: '/carbon', label: 'Carbon' },
                { path: '/recommendations', label: 'Recommendations' },
                { path: '/eco-stays', label: 'Eco Stays' },
                { path: '/sustainable-routes', label: 'Routes' },
                { path: '/responsible-travel', label: 'Travel' }
              ] : [
                { path: '/login', label: 'Login' },
                { path: '/register', label: 'Register' },
                { path: '/responsible-travel', label: 'Travel' }
              ]).map((item) => (
                <MenuItem
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  onClick={handleMenuClose}
                  sx={{ ...navItemStyle, my: 1, boxShadow: 'none' }}
                >
                  {item.label}
                </MenuItem>
              ))}

              {user && (
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    handleLogout();
                  }}
                  sx={{ ...navItemStyle, my: 1, backgroundColor: '#FF595E' }}
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
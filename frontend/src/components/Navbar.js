import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            Convidat
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            {user ? (
              <>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/dashboard"
                >
                  Dashboard
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/carbon"
                >
                  Carbon Footprint
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/recommendations"
                >
                  Travel Recommendations
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/eco-stays"
                >
                  Eco Stays
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/sustainable-routes"
                >
                  Sustainable Routes
                </Button>
                <Button
                  color="inherit"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/login"
                >
                  Login
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/register"
                >
                  Register
                </Button>
              </>
            )}
          </Box>
          
          {/* Mobile menu */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            {user && (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleMenuOpen}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem component={RouterLink} to="/dashboard" onClick={handleMenuClose}>
                    Dashboard
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/carbon" onClick={handleMenuClose}>
                    Carbon Footprint
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/recommendations" onClick={handleMenuClose}>
                    Travel Recommendations
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/eco-stays" onClick={handleMenuClose}>
                    Eco Stays
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/sustainable-routes" onClick={handleMenuClose}>
                    Sustainable Routes
                  </MenuItem>
                  <MenuItem onClick={() => { handleMenuClose(); handleLogout(); }}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 
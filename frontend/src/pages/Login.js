import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#B4F8C8',
        backgroundImage: 'radial-gradient(#aaa 1px, transparent 1px)',
        backgroundSize: '25px 25px',
        backgroundRepeat: 'repeat',
        backgroundAttachment: 'fixed',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Lexend Mega, sans-serif'
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            p: 4,
            borderRadius: '1rem',
            backgroundColor: '#F15BB5',
            border: '2px solid black',
            boxShadow: '6px 6px 0 black'
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            align="center"
            sx={{
              fontWeight: 800,
              mb: 3,
              color: 'black',
              fontFamily: 'Lexend Mega'
            }}
          >
            Login
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2, border: '2px solid black', borderRadius: '0.75rem' }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              sx={{
                backgroundColor: '#fff',
                borderRadius: '0.75rem',
                boxShadow: '4px 4px 0 black',
                fontFamily: 'Lexend Mega'
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              sx={{
                backgroundColor: '#fff',
                borderRadius: '0.75rem',
                boxShadow: '4px 4px 0 black',
                fontFamily: 'Lexend Mega'
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                p: 1.5,
                backgroundColor: '#FEE440',
                color: 'black',
                fontWeight: 'bold',
                border: '2px solid black',
                boxShadow: '4px 4px 0 black',
                borderRadius: '0.75rem',
                fontFamily: 'Lexend Mega',
                '&:hover': {
                  backgroundColor: '#ffe658'
                }
              }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
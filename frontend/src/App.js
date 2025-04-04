import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CarbonFootprint from './pages/CarbonFootprint';
import TravelRecommendations from './pages/TravelRecommendations';
import EcoAccommodations from './components/EcoAccommodations';
import SustainableRoutes from './components/SustainableRoutes';
import ResponsibleTravel from './components/ResponsibleTravel';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
    },
    secondary: {
      main: '#1976d2',
    },
  },
});

// Root route component that redirects based on auth status
const RootRoute = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <Home />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Layout>
            <Routes>
              <Route path="/" element={<RootRoute />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/carbon" element={<PrivateRoute><CarbonFootprint /></PrivateRoute>} />
              <Route path="/recommendations" element={<PrivateRoute><TravelRecommendations /></PrivateRoute>} />
              <Route path="/eco-stays" element={<PrivateRoute><EcoAccommodations /></PrivateRoute>} />
              <Route path="/sustainable-routes" element={<PrivateRoute><SustainableRoutes /></PrivateRoute>} />
              <Route path="/responsible-travel" element={<ResponsibleTravel />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 
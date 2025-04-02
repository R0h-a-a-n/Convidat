import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import CarbonFootprintCalculator from '../components/CarbonFootprintCalculator';

const CarbonFootprint = () => {
  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Carbon Footprint Tracker
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Track and manage your travel-related carbon emissions
        </Typography>
        <CarbonFootprintCalculator />
      </Box>
    </Container>
  );
};

export default CarbonFootprint; 
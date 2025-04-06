import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import CarbonFootprintCalculator from '../components/CarbonFootprintCalculator';

const CarbonFootprint = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#B9FBC0',
        backgroundImage: 'radial-gradient(#aaa 1px, transparent 1px)',
        backgroundSize: '25px 25px',
        px: 2,
        py: 8
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            backgroundColor: '#FEE440',
            border: '2px solid black',
            boxShadow: '4px 6px 0 black',
            textAlign: 'center'
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontFamily: 'Lexend Mega, sans-serif',
              fontWeight: 'bold',
              color: 'black',
              mb: 2
            }}
          >
            Carbon Footprint Tracker
          </Typography>

          <Typography
            variant="h6"
            color="black"
            sx={{ mb: 4, fontWeight: 500 }}
          >
            Track and manage your travel-related carbon emissions
          </Typography>

          <Box sx={{ borderTop: '2px solid black', pt: 4 }}>
            <CarbonFootprintCalculator />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CarbonFootprint;
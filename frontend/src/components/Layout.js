import React from 'react';
import { Box } from '@mui/material';

const Layout = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: { xs: '72px', sm: '80px' }, // Padding top to account for navbar height
        pb: 4,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {children}
    </Box>
  );
};

export default Layout; 
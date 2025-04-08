import { Button } from '@mui/material';

const BrutalButton = ({ children, startIcon, ...props }) => (
  <Button
    {...props}
    startIcon={startIcon}
    disableElevation
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#00F5D4',
      color: 'black',
      border: '2px solid black',
      boxShadow: '4px 6px 0 black',
      borderRadius: '0.75rem',
      fontWeight: 700,
      fontFamily: 'Lexend Mega, sans-serif',
      textTransform: 'uppercase',
      fontSize: '0.875rem',
      px: 3,
      py: 1.5,
      '&:hover': {
        backgroundColor: '#00D5B4'
      },
      '& .MuiButton-startIcon': {
        marginRight: '0.5rem',
        color: 'black', // force icon to be black
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      '& .MuiSvgIcon-root': {
        fontSize: '1.2rem'
      }
    }}
  >
    {children}
  </Button>
);

export default BrutalButton;

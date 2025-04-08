import { Card } from '@mui/material';

const BrutalCard = ({ children, ...props }) => (
  <Card
    {...props}
    sx={{
      backgroundColor: '#9B5DE5',
      color: 'white',
      border: '2px solid black',
      boxShadow: '4px 6px 0 black',
      borderRadius: '1rem',
      ...props.sx
    }}
  >
    {children}
  </Card>
);

export default BrutalCard;

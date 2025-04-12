import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import {
  EmojiPeople,
  Public,
  Nature,
  Language,
  AttachMoney,
  RecyclingRounded,
  LocalFlorist,
  Favorite,
  People,
  PhotoCamera,
  VolunteerActivism,
  Hiking,
  CheckCircleOutline
} from '@mui/icons-material';

const ResponsibleTravel = () => {
  const sections = [
    {
      title: 'Cultural Sensitivity',
      icon: <EmojiPeople />, 
      points: [
        'Research local customs and traditions before visiting',
        'Dress appropriately for local cultural norms',
        'Learn basic phrases in the local language',
        'Ask permission before taking photos of people',
        'Respect religious and sacred sites'
      ]
    },
    {
      title: 'Ethical Tourism Practices',
      icon: <Public />, 
      points: [
        'Choose locally-owned accommodations and restaurants',
        'Support fair trade and authentic local crafts',
        'Avoid activities that exploit local communities',
        'Use licensed and reputable tour operators',
        'Pay fair prices and avoid aggressive bargaining'
      ]
    },
    {
      title: 'Conservation Efforts',
      icon: <Nature />, 
      points: [
        'Minimize plastic waste and carry reusable items',
        'Stay on marked trails when hiking',
        'Support conservation projects and protected areas',
        'Choose eco-friendly transportation options',
        'Practice "Leave No Trace" principles'
      ]
    }
  ];

  const guidelines = [
    {
      icon: <Language />,
      title: 'Cultural Respect',
      content: 'Learn about and respect local customs, traditions, and etiquette.'
    },
    {
      icon: <AttachMoney />,
      title: 'Economic Impact',
      content: 'Support local businesses and ensure your tourism dollars benefit the community.'
    },
    {
      icon: <RecyclingRounded />,
      title: 'Environmental Impact',
      content: 'Minimize your carbon footprint and support sustainable practices.'
    },
    {
      icon: <LocalFlorist />,
      title: 'Wildlife Protection',
      content: 'Observe wildlife from a safe distance and never feed or touch wild animals.'
    },
    {
      icon: <Favorite />,
      title: 'Community Support',
      content: 'Engage with local communities respectfully and support local initiatives.'
    },
    {
      icon: <People />,
      title: 'Fair Treatment',
      content: 'Ensure fair wages and working conditions for local service providers.'
    },
    {
      icon: <PhotoCamera />,
      title: 'Responsible Photography',
      content: 'Always ask permission before taking photos of people and respect privacy.'
    },
    {
      icon: <VolunteerActivism />,
      title: 'Volunteering',
      content: 'Participate in reputable volunteer programs that benefit the local community.'
    },
    {
      icon: <Hiking />,
      title: 'Eco Exploration',
      content: 'Choose low-impact activities like hiking and eco tours to explore nature responsibly.'
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: 10,
        pb: 6,
        backgroundColor: '#c0f4e4',
        backgroundImage: 'radial-gradient(#aaa 1px, transparent 1px)',
        backgroundSize: '25px 25px',
        px: 2
      }}
    >
      <Container maxWidth="lg">
        <Box textAlign="center" mb={8}>
          <Typography
            variant="h2"
            sx={{
              fontFamily: 'Lexend Mega, sans-serif',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: 'black',
              backgroundColor: '#F15BB5',
              p: 2,
              border: '2px solid black',
              boxShadow: '4px 6px 0 black',
              borderRadius: '0.75rem',
              display: 'inline-block',
              mb: 2
            }}
          >
            Responsible Travel Guide
          </Typography>

          <Typography variant="h5" sx={{ maxWidth: 800, mx: 'auto', color: 'black', fontFamily: 'Poppins, sans-serif' }}>
            Make a positive impact on the places you visit while creating meaningful travel experiences
          </Typography>
        </Box>

        <Grid container spacing={4} mb={8}>
          {sections.map((section, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ backgroundColor: '#9B5DE5', color: 'white', border: '2px solid black', boxShadow: '4px 6px 0 black', borderRadius: '1rem' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    {React.cloneElement(section.icon, { sx: { fontSize: 40, mr: 2 } })}
                    <Typography variant="h5" sx={{ fontFamily: 'Archivo Black' }}>{section.title}</Typography>
                  </Box>
                  <List>
                    {section.points.map((point, idx) => (
                      <ListItem key={idx}>
                        <ListItemIcon sx={{ color: 'white' }}>
                          <CheckCircleOutline />
                        </ListItemIcon>
                        <ListItemText primary={point} primaryTypographyProps={{ fontWeight: 500 }} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography
          variant="h3"
          sx={{
            fontFamily: 'Lexend Mega',
            textAlign: 'center',
            mb: 6,
            backgroundColor: '#FEE440',
            display: 'inline-block',
            px: 3,
            py: 1,
            border: '2px solid black',
            boxShadow: '4px 6px 0 black',
            borderRadius: '0.75rem'
          }}
        >
          Key Guidelines for Responsible Tourism
        </Typography>

        <Grid container spacing={3}>
          {guidelines.map((guideline, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper sx={{ p: 3, backgroundColor: '#00BBF9', color: 'black', border: '2px solid black', boxShadow: '4px 6px 0 black', borderRadius: '1rem', height: '100%' }}>
                <Box display="flex" alignItems="center" mb={2}>
                  {React.cloneElement(guideline.icon, { sx: { fontSize: 32, mr: 2 } })}
                  <Typography variant="h6" sx={{ fontFamily: 'Bebas Kai', fontWeight: 'bold' }}>{guideline.title}</Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {guideline.content}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            mt: 8,
            p: 4,
            backgroundColor: '#C1FBA4',
            border: '2px solid black',
            boxShadow: '4px 6px 0 black',
            borderRadius: '1rem',
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, fontFamily: 'Lexend Mega' }}>
            Your Role as a Responsible Traveler
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 800, mx: 'auto', fontSize: '1.1rem', lineHeight: 1.8 }}>
            As travelers, we have the power to make a positive impact on the places we visit.
            By following these guidelines and being mindful of our actions, we can help preserve
            local cultures, protect the environment, and ensure that tourism benefits local communities.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ResponsibleTravel;
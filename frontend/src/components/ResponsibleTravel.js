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
  Paper,
  useTheme,
  alpha,
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
  CheckCircleOutline
} from '@mui/icons-material';

const ResponsibleTravel = () => {
  const theme = useTheme();

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
    }
  ];

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        pt: 10,
        pb: 6,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
      }}
    >
      <Container maxWidth="lg">
        <Box 
          sx={{
            textAlign: 'center',
            mb: 8,
            animation: 'fadeIn 1s ease-out',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(20px)' },
              to: { opacity: 1, transform: 'translateY(0)' }
            }
          }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 2
            }}
          >
            Responsible Travel Guide
          </Typography>
          
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'text.secondary',
              maxWidth: 800,
              mx: 'auto',
              mb: 4
            }}
          >
            Make a positive impact on the places you visit while creating meaningful travel experiences
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 8 }}>
          {sections.map((section, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.2)}`
                  }
                }}
              >
                <CardContent sx={{ height: '100%' }}>
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    mb={3}
                    sx={{
                      pb: 2,
                      borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
                    }}
                  >
                    {React.cloneElement(section.icon, { 
                      sx: { 
                        fontSize: 40,
                        color: theme.palette.primary.main,
                        mr: 2
                      }
                    })}
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {section.title}
                    </Typography>
                  </Box>
                  <List>
                    {section.points.map((point, idx) => (
                      <ListItem 
                        key={idx} 
                        sx={{ 
                          py: 1,
                          px: 0
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleOutline sx={{ color: theme.palette.primary.main }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={point}
                          primaryTypographyProps={{
                            sx: { 
                              fontSize: '1rem',
                              fontWeight: 500
                            }
                          }}
                        />
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
            textAlign: 'center',
            mb: 6,
            fontWeight: 700,
            color: theme.palette.primary.main
          }}
        >
          Key Guidelines for Responsible Tourism
        </Typography>

        <Grid container spacing={3}>
          {guidelines.map((guideline, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3,
                  height: '100%',
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderRadius: 2,
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.1)}`
                  }
                }}
              >
                <Box 
                  display="flex" 
                  alignItems="center" 
                  mb={2}
                >
                  {React.cloneElement(guideline.icon, { 
                    sx: { 
                      fontSize: 32,
                      color: theme.palette.primary.main,
                      mr: 2
                    }
                  })}
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {guideline.title}
                  </Typography>
                </Box>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'text.secondary',
                    lineHeight: 1.6
                  }}
                >
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
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.light, 0.1)})`,
            backdropFilter: 'blur(8px)',
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              color: theme.palette.primary.main
            }}
          >
            Your Role as a Responsible Traveler
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              maxWidth: 800,
              mx: 'auto',
              fontSize: '1.1rem',
              lineHeight: 1.8,
              color: 'text.secondary'
            }}
          >
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
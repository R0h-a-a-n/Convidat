import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext'; // Assuming this context exists
import NaturePeopleIcon from '@mui/icons-material/NaturePeople';
import EcoIcon from '@mui/icons-material/EnergySavingsLeafRounded';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';

// Icons for Services
import LocationCityIcon from '@mui/icons-material/LocationCity';
import RouteIcon from '@mui/icons-material/Route';
import ParkIcon from '@mui/icons-material/Park';
import CalculateIcon from '@mui/icons-material/Calculate';
import RateReviewIcon from '@mui/icons-material/RateReview';
import EventIcon from '@mui/icons-material/Event';

// --- Neo-Brutalist Style Constants ---
const neoBrutalistStyles = {
  border: '2px solid black',
  boxShadow: '4px 6px 0 black',
  borderRadius: '0.75rem',
};

// --- Highlight Colors ---
const highlightColors = {
  pink: '#F15BB5',
  purple: '#9B5DE5',
  mint: '#00F5D4',
  yellow: '#FEE440',
};

// --- Reusable Highlight Component ---
const Highlight = ({ children, color = highlightColors.pink }) => (
  <Box component="span" sx={{ color: color, fontWeight: 'bold' }}>
    {children}
  </Box>
);

const Home = () => {
  // const { user } = useAuth();

  const features = [
    {
      title: 'Carbon Footprint Tracking',
      description: 'Monitor and reduce your travel-related carbon emissions with our advanced tracking system.',
      icon: <EcoIcon fontSize="large" />,
    },
    {
      title: 'Sustainable Travel Options',
      description: 'Discover eco-friendly travel options and make informed decisions about your journeys.',
      icon: <NaturePeopleIcon fontSize="large" />,
    },
    {
      title: 'Best Tourist Cities',
      description: 'Discover popular tourist cities aligned with your interests.',
      icon: <TravelExploreIcon fontSize="large" />,
    },
  ];

  const services = [
    {
      title: 'Smart City Recommendations',
      description:
        'Using ML and user preferences (season, budget, climate, activities), we recommend eco-friendly cities based on eco-scores, popularity, and seasonal highlights.',
      icon: <LocationCityIcon fontSize="large" />,
    },
    {
      title: 'Sustainable Travel Route Planner',
      description:
        'Our route search suggests itineraries prioritizing low-emission transport (trains, buses, ferries) using Google Maps data and carbon-conscious routing.',
      icon: <RouteIcon fontSize="large" />,
    },
    {
      title: 'Nearby Eco-Friendly Attractions',
      description:
        'Discover nearby national parks, trails, ethical wildlife sanctuaries, and local farms using the Google Places API, updated for relevance.',
      icon: <ParkIcon fontSize="large" />,
    },
    {
      title: 'Carbon Footprint Tracker',
      description:
        'Estimate the emissions of your journey legs and find suggestions to offset them through verified sustainability programs.',
      icon: <CalculateIcon fontSize="large" />,
    },
    {
      title: 'Community Insights & Reviews',
      description:
        'Learn from fellow travelers with honest reviews, tips, and sustainability ratings to make informed eco-destination choices.',
      icon: <RateReviewIcon fontSize="large" />,
    },
    {
      title: 'Complete Personalized Trip Planner',
      description:
        'Complete personalized trip planner with all the information you need to plan your trip.',
      icon: <EventIcon fontSize="large" />,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#C0F4E4',
        backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.2) 1px, transparent 1px)',
        backgroundSize: '25px 25px',
        px: { xs: 2, md: 4 },
        py: 6,
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      <Container maxWidth="lg">
        {/* --- Header Section --- */}
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              mb: 4,
              fontFamily: 'Lexend Mega, sans-serif',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: 'black',
              backgroundColor: highlightColors.pink,
              p: 2,
              display: 'inline-block',
              ...neoBrutalistStyles,
            }}
          >
            Welcome to Convidat
          </Typography>

          <Box sx={{ mt: 2, display: 'inline-block' }}>
            <Typography
              variant="h5"
              color="text.primary"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                backgroundColor: highlightColors.yellow,
                p: 1.5,
                display: 'inline-block',
                color: 'black',
                ...neoBrutalistStyles,
                boxShadow: '3px 4px 0 black',
              }}
            >
              Your Sustainable Travel Companion
            </Typography>
          </Box>
        </Box>

        {/* --- Initial Features Section --- */}
        <Grid container spacing={4} mb={10}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={`feature-${index}`}>
              <Card
                sx={{
                  height: '100%',
                  backgroundColor: highlightColors.purple, // Purple background
                  color: 'white',
                  ...neoBrutalistStyles,
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)', // Slight lift
                    boxShadow: `6px 8px 0 ${highlightColors.pink}`, // Change shadow color on hover
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    {React.cloneElement(feature.icon, { sx: { color: 'white', mr: 1.5 } })}
                    <Typography variant="h5" sx={{ fontFamily: 'Archivo Black, sans-serif' }}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography color="inherit" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* --- Why Sustainable Travel Matters Section (Original text) --- */}
        <Box sx={{ py: 6, mb: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontFamily: 'Lexend Mega, sans-serif',
                fontWeight: 'bold',
                backgroundColor: highlightColors.yellow, // Yellow background
                color: 'black',
                px: 3,
                py: 1.5,
                display: 'inline-block',
                ...neoBrutalistStyles,
              }}
            >
              Why Sustainable Travel Matters
            </Typography>
          </Box>

          <Grid container spacing={4} alignItems="center">
            {/* Center-align the paragraph */}
            <Grid item xs={12} md={12}>
              <Typography
                variant="body1"
                sx={{
                  textAlign: 'center', // Center the paragraph
                  fontFamily: 'Poppins, sans-serif',
                  lineHeight: 1.8,
                  fontSize: '1.3rem',
                  color: 'black',
                  mb: 2,
                }}
              >
                Tourism accounts for 8% of global carbon emissions. Sustainable travel practices can
                dramatically reduce this number by supporting green transport, minimizing waste, and
                respecting local ecosystems. Choosing sustainable options empowers communities,
                preserves natural heritage, and promotes mindful exploration.
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* --- Why Eco-Tourism is Important Section (Full Text + Highlights) --- */}
        <Box sx={{ py: 6, mb: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontFamily: 'Lexend Mega, sans-serif',
                fontWeight: 'bold',
                backgroundColor: '#00BBF9', // Cyan background
                color: 'black',
                px: 3,
                py: 1.5,
                display: 'inline-block',
                ...neoBrutalistStyles,
              }}
            >
              Why Eco-Tourism is Important
            </Typography>
          </Box>

          <Box sx={{ maxWidth: 900, mx: 'auto', px: 2 }}>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Chamberi Super Display, sans-serif',
                lineHeight: 1.7,
                fontSize: '1.3rem',
                color: 'black',
                mb: 2,
              }}
            >
              Eco-tourism plays a vital role in promoting responsible travel to natural areas that
              conserve the environment, sustain the well-being of local people, and involve education
              and interpretation. As climate change, deforestation, pollution, and mass tourism
              continue to damage ecosystems worldwide, eco-tourism provides a sustainable alternative
              that helps protect biodiversity and empowers communities.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                lineHeight: 1.7,
                fontSize: '1.3rem',
                color: 'black',
                mb: 2,
              }}
            >
              By focusing on conservation and, eco-tourism encourages travelers to appreciate nature
              without exploiting it. Unlike conventional tourism, which often leads to
              overconsumption of resources and environmental degradation, eco-tourism promotes
              minimal impact. It educates travelers on the importance of preserving habitats,
              respecting local cultures, and making choices that contribute to a healthier planet.
              The economic benefits from eco-tourism also directly support conservation efforts and
              improve livelihoods in rural or indigenous communities. This fosters a cycle of
              environmental stewardship and cultural preservation.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                lineHeight: 1.7,
                fontSize: '1.3rem',
                color: 'black',
                mb: 2,
              }}
            >
              Furthermore, eco-tourism brings a more meaningful travel experience. It attracts
              conscious travelers who value authenticity and connection—whether that's spotting
              wildlife in a national park, volunteering for reforestation, or staying at an eco-lodge
              run by locals. Such experiences inspire people to continue making sustainable choices
              in their daily lives and advocate for greener practices globally.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                lineHeight: 1.7,
                fontSize: '1.3rem',
                color: 'black',
              }}
            >
              As the demand for eco-friendly travel grows, digital platforms must support and guide
              users toward sustainable options. That's where your eco-tourism website plays a
              game-changing role.
            </Typography>
          </Box>
        </Box>

        {/* --- Services Offered Section --- */}
        <Box sx={{ py: 6 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontFamily: 'Lexend Mega, sans-serif',
                fontWeight: 'bold',
                backgroundColor: highlightColors.mint, // Mint Green background
                color: 'black',
                px: 3,
                py: 1.5,
                display: 'inline-block',
                ...neoBrutalistStyles,
              }}
            >
              Services We Offer
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {services.map((service, index) => (
              <Grid item xs={12} md={6} lg={4} key={`service-${index}`}>
                <Card
                  sx={{
                    height: '100%',
                    backgroundColor: '#ffffff', // White background for service cards
                    color: 'black',
                    ...neoBrutalistStyles,
                    border: '2px solid black',
                    borderRadius: '1rem',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)', // Slight lift
                      boxShadow: `6px 8px 0 ${highlightColors.purple}`, // Change shadow color on hover
                    },
                  }}
                >
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      {React.cloneElement(service.icon, { sx: { color: highlightColors.pink, mr: 1.5 } })}
                      <Typography variant="h6" sx={{ fontFamily: 'Archivo Black, sans-serif' }}>
                        {service.title}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontFamily: 'Poppins, sans-serif', flexGrow: 1 }}>
                      {service.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;

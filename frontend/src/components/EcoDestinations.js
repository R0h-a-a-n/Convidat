import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Park as ParkIcon,
  DirectionsBike as BikeIcon,
  LocalFlorist as FloristIcon,
  LocalFlorist as LeafIcon,
  Hiking as HikingIcon,
  Water as WaterIcon
} from '@mui/icons-material';

const ECO_DESTINATIONS = {
  'Mumbai': [
    {
      name: 'Sanjay Gandhi National Park',
      type: 'Nature Reserve',
      description: 'A protected area with rich biodiversity and nature trails',
      ecoFeatures: ['Wildlife Conservation', 'Nature Trails', 'Educational Programs'],
      icon: <ParkIcon />
    },
    {
      name: 'Bandra-Worli Sea Link',
      type: 'Scenic Route',
      description: 'A beautiful coastal route perfect for cycling and walking',
      ecoFeatures: ['Cycling Path', 'Pedestrian Walkway', 'Scenic Views'],
      icon: <BikeIcon />
    },
    {
      name: 'Hanging Gardens',
      type: 'Botanical Garden',
      description: 'A well-maintained garden with native plant species',
      ecoFeatures: ['Native Plants', 'Green Space', 'Educational Tours'],
      icon: <FloristIcon />
    }
  ],
  'Pune': [
    {
      name: 'Pashan Lake',
      type: 'Natural Reserve',
      description: 'A serene lake with walking trails and bird watching spots',
      ecoFeatures: ['Bird Watching', 'Nature Trails', 'Conservation Area'],
      icon: <WaterIcon />
    },
    {
      name: 'Sinhagad Fort',
      type: 'Historic Site',
      description: 'A historic fort with eco-friendly hiking trails',
      ecoFeatures: ['Hiking Trails', 'Historic Preservation', 'Scenic Views'],
      icon: <HikingIcon />
    },
    {
      name: 'Katraj Snake Park',
      type: 'Wildlife Park',
      description: 'A conservation center for reptiles and amphibians',
      ecoFeatures: ['Wildlife Conservation', 'Educational Programs', 'Research Center'],
      icon: <LeafIcon />
    }
  ],
  'Chennai': [
    {
      name: 'Guindy National Park',
      type: 'National Park',
      description: 'One of the smallest national parks with rich biodiversity',
      ecoFeatures: ['Wildlife Conservation', 'Nature Trails', 'Educational Center'],
      icon: <ParkIcon />
    },
    {
      name: 'Theosophical Society',
      type: 'Botanical Garden',
      description: 'A peaceful garden with ancient trees and meditation spots',
      ecoFeatures: ['Meditation Space', 'Ancient Trees', 'Peaceful Environment'],
      icon: <FloristIcon />
    },
    {
      name: 'Marina Beach',
      type: 'Coastal Area',
      description: 'A long beach with eco-friendly activities and clean-up initiatives',
      ecoFeatures: ['Beach Cleanup', 'Coastal Conservation', 'Public Awareness'],
      icon: <WaterIcon />
    }
  ]
};

const EcoDestinations = ({ city }) => {
  const destinations = ECO_DESTINATIONS[city] || [];

  if (destinations.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No eco-friendly destinations found for {city}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Eco-Friendly Destinations in {city}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        {destinations.map((destination, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: 4
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {destination.icon}
                  </ListItemIcon>
                  <Typography variant="h6" component="div">
                    {destination.name}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {destination.type}
                </Typography>
                <Typography variant="body2" paragraph>
                  {destination.description}
                </Typography>
                <List dense>
                  {destination.ecoFeatures.map((feature, idx) => (
                    <ListItem key={idx} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <LeafIcon fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EcoDestinations; 
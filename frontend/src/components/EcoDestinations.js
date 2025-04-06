import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Box,
  Link
} from '@mui/material';
import {
  Park,
  DirectionsBike,
  Train,
  LocalFlorist,
  Nature,
  EmojiNature
} from '@mui/icons-material';

// Eco-friendly destinations data
const cityDestinations = {
  'Mumbai': [
    {
      name: 'Sanjay Gandhi National Park',
      description: 'One of the largest urban parks in the world, home to diverse flora and fauna',
      type: 'park',
      link: 'https://www.google.com/maps/place/Sanjay+Gandhi+National+Park'
    },
    {
      name: 'Maharashtra Nature Park',
      description: 'A reclaimed land turned into an urban forest with butterfly gardens',
      type: 'nature',
      link: 'https://www.google.com/maps/place/Maharashtra+Nature+Park'
    },
    {
      name: 'Coastal and Marine Biodiversity Centre',
      description: 'Educational center promoting marine conservation',
      type: 'nature',
      link: 'https://www.google.com/maps/place/Coastal+and+Marine+Biodiversity+Centre'
    }
  ],
  'Pune': [
    {
      name: 'Empress Botanical Garden',
      description: 'Historic garden with rare plant species and butterfly conservatory',
      type: 'garden',
      link: 'https://www.google.com/maps/place/Empress+Botanical+Garden'
    },
    {
      name: 'Pune-Lonavala Cycling Trail',
      description: 'Scenic cycling route through the Western Ghats',
      type: 'cycling',
      link: 'https://www.google.com/maps/place/Lonavala'
    },
    {
      name: 'Pashan Lake',
      description: 'Restored lake and bird sanctuary',
      type: 'nature',
      link: 'https://www.google.com/maps/place/Pashan+Lake'
    }
  ],
  'Chennai': [
    {
      name: 'Adyar Eco Park',
      description: 'Restored wetland ecosystem and bird sanctuary',
      type: 'park',
      link: 'https://www.google.com/maps/place/Adyar+Eco+Park'
    },
    {
      name: 'Pallikaranai Marshland',
      description: 'Protected wetland supporting diverse bird species',
      type: 'nature',
      link: 'https://www.google.com/maps/place/Pallikaranai+Marshland'
    },
    {
      name: 'Guindy National Park',
      description: 'Urban national park with native flora and fauna',
      type: 'park',
      link: 'https://www.google.com/maps/place/Guindy+National+Park'
    }
  ]
};

// Icon mapping for different destination types
const typeIcons = {
  park: <Park color="primary" />,
  nature: <Nature color="primary" />,
  garden: <LocalFlorist color="primary" />,
  cycling: <DirectionsBike color="primary" />,
  default: <EmojiNature color="primary" />
};

const EcoDestinations = ({ city }) => {
  const destinations = cityDestinations[city] || [];

  if (destinations.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
        No eco-friendly destinations found for {city}.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="body1" color="text.secondary" paragraph>
        Discover these sustainable and eco-friendly destinations in {city}:
      </Typography>
      <List>
        {destinations.map((destination, index) => (
          <React.Fragment key={destination.name}>
            <ListItem>
              <ListItemIcon>
                {typeIcons[destination.type] || typeIcons.default}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Link
                    href={destination.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                    underline="hover"
                  >
                    {destination.name}
                  </Link>
                }
                secondary={destination.description}
              />
            </ListItem>
            {index < destinations.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default EcoDestinations; 
const accommodations = [
  {
    _id: '1',
    name: 'Eco Green Hotel',
    location: {
      city: 'Chennai',
      country: 'India',
      coordinates: { lat: 13.0827, lng: 80.2707 }
    },
    type: 'hotel',
    priceRange: {
      min: 50,
      max: 150
    },
    sustainability: {
      ecoRating: 4.5,
      certifications: ['Green Building', 'Solar Powered', 'Water Conservation'],
      features: ['Solar panels', 'Rainwater harvesting', 'Organic garden']
    },
    amenities: ['WiFi', 'Restaurant', 'Spa', 'Gym'],
    images: ['https://example.com/eco-hotel.jpg']
  },
  {
    _id: '2',
    name: 'Sustainable Hostel',
    location: {
      city: 'Chennai',
      country: 'India',
      coordinates: { lat: 13.0627, lng: 80.2807 }
    },
    type: 'hostel',
    priceRange: {
      min: 20,
      max: 40
    },
    sustainability: {
      ecoRating: 4.0,
      certifications: ['Eco Friendly', 'Recycling Program'],
      features: ['Recycling center', 'Composting', 'LED lighting']
    },
    amenities: ['WiFi', 'Common kitchen', 'Laundry'],
    images: ['https://example.com/eco-hostel.jpg']
  },
  {
    _id: '3',
    name: 'Green Lodge Chennai',
    location: {
      city: 'Chennai',
      country: 'India',
      coordinates: { lat: 13.1027, lng: 80.2907 }
    },
    type: 'eco-lodge',
    priceRange: {
      min: 80,
      max: 200
    },
    sustainability: {
      ecoRating: 5.0,
      certifications: ['LEED Certified', 'Carbon Neutral', 'Zero Waste'],
      features: ['Solar power', 'Greywater system', 'Farm-to-table']
    },
    amenities: ['WiFi', 'Organic restaurant', 'Yoga studio', 'Nature trails'],
    images: ['https://example.com/eco-lodge.jpg']
  },
  {
    _id: '4',
    name: 'Eco Apartments Marina',
    location: {
      city: 'Chennai',
      country: 'India',
      coordinates: { lat: 13.0527, lng: 80.2607 }
    },
    type: 'apartment',
    priceRange: {
      min: 60,
      max: 180
    },
    sustainability: {
      ecoRating: 4.2,
      certifications: ['Energy Star', 'Green Living'],
      features: ['Energy efficient', 'Recycling program', 'Smart thermostats']
    },
    amenities: ['WiFi', 'Kitchen', 'Laundry', 'Parking'],
    images: ['https://example.com/eco-apartment.jpg']
  }
];

const routes = [
  {
    _id: '1',
    origin: {
      city: 'Chennai',
      country: 'India',
      coordinates: { lat: 13.0827, lng: 80.2707 }
    },
    destination: {
      city: 'Bangalore',
      country: 'India',
      coordinates: { lat: 12.9716, lng: 77.5946 }
    },
    segments: [
      {
        type: 'train',
        provider: 'Indian Railways',
        duration: 360, // 6 hours in minutes
        distance: 350,
        cost: { amount: 25, currency: 'USD' },
        carbonEmissions: 15
      }
    ],
    totalDuration: 360,
    totalDistance: 350,
    totalCost: { amount: 25, currency: 'USD' },
    totalCarbonEmissions: 15,
    ecoSavings: {
      percentage: 75,
      amount: 45
    },
    sustainabilityScore: 85
  },
  {
    _id: '2',
    origin: {
      city: 'Chennai',
      country: 'India',
      coordinates: { lat: 13.0827, lng: 80.2707 }
    },
    destination: {
      city: 'Hyderabad',
      country: 'India',
      coordinates: { lat: 17.3850, lng: 78.4867 }
    },
    segments: [
      {
        type: 'bus',
        provider: 'Green Bus',
        duration: 480, // 8 hours in minutes
        distance: 625,
        cost: { amount: 20, currency: 'USD' },
        carbonEmissions: 25
      }
    ],
    totalDuration: 480,
    totalDistance: 625,
    totalCost: { amount: 20, currency: 'USD' },
    totalCarbonEmissions: 25,
    ecoSavings: {
      percentage: 60,
      amount: 40
    },
    sustainabilityScore: 75
  }
];

module.exports = {
  accommodations,
  routes
}; 
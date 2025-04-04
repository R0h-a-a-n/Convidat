const axios = require('axios');
require('dotenv').config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

class PlacesService {
  async searchAccommodations(params) {
    try {
      // First, search for the location coordinates
      const geocodeUrl = `${BASE_URL}/geocode/json`;
      const locationQuery = `${params.city}${params.country ? `, ${params.country}` : ''}`;
      
      const geocodeResponse = await axios.get(geocodeUrl, {
        params: {
          address: locationQuery,
          key: GOOGLE_MAPS_API_KEY
        }
      });

      if (!geocodeResponse.data.results.length) {
        throw new Error('Location not found');
      }

      const { lat, lng } = geocodeResponse.data.results[0].geometry.location;

      // Then search for accommodations near that location
      const placesUrl = `${BASE_URL}/textsearch/json`;
      const searchQuery = `eco friendly ${params.type || 'hotel'} in ${locationQuery}`;

      const placesResponse = await axios.get(placesUrl, {
        params: {
          query: searchQuery,
          location: `${lat},${lng}`,
          radius: 5000, // 5km radius
          type: 'lodging',
          key: GOOGLE_MAPS_API_KEY
        }
      });

      // Transform the response to match our application's format
      const accommodations = placesResponse.data.results.map(place => ({
        _id: place.place_id,
        name: place.name,
        location: {
          city: params.city,
          country: params.country,
          coordinates: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          address: place.formatted_address
        },
        type: params.type || 'hotel',
        priceRange: {
          min: place.price_level ? place.price_level * 25 : 50,
          max: place.price_level ? place.price_level * 100 : 200
        },
        sustainability: {
          ecoRating: place.rating ? (place.rating / 5) * 5 : 4,
          certifications: ['Eco-Friendly'],
          features: ['Energy Efficient']
        },
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        photos: place.photos ? place.photos.map(photo => ({
          reference: photo.photo_reference
        })) : []
      }));

      // Filter by price if maxPrice is specified
      if (params.maxPrice) {
        return accommodations.filter(acc => acc.priceRange.max <= parseInt(params.maxPrice));
      }

      return accommodations;
    } catch (error) {
      console.error('Error fetching places:', error);
      throw error;
    }
  }

  async getPlaceDetails(placeId) {
    try {
      const detailsUrl = `${BASE_URL}/details/json`;
      const response = await axios.get(detailsUrl, {
        params: {
          place_id: placeId,
          fields: 'name,rating,formatted_address,formatted_phone_number,website,photos,reviews,price_level,geometry',
          key: GOOGLE_MAPS_API_KEY
        }
      });

      const place = response.data.result;
      
      return {
        _id: placeId,
        name: place.name,
        location: {
          coordinates: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          address: place.formatted_address
        },
        contact: {
          phone: place.formatted_phone_number,
          website: place.website
        },
        rating: place.rating,
        reviews: place.reviews,
        photos: place.photos,
        priceLevel: place.price_level
      };
    } catch (error) {
      console.error('Error fetching place details:', error);
      throw error;
    }
  }
}

module.exports = new PlacesService(); 
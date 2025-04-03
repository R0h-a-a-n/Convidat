import React, { useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';

const TravelMap = ({ routes, accommodations, center }) => {
  const mapRef = useRef(null);

  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  const defaultCenter = center || {
    lat: 13.0827,
    lng: 80.2707
  };

  const getMarkerIcon = (type) => {
    switch (type) {
      case 'hotel':
        return '🏨';
      case 'hostel':
        return '🏠';
      case 'train':
        return '🚂';
      case 'bus':
        return '🚌';
      case 'ferry':
        return '🚢';
      case 'flight':
        return '✈️';
      default:
        return '📍';
    }
  };

  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key is missing. Please add it to your .env file.');
    return <div>Map loading failed. Please check your API key configuration.</div>;
  }

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={8}
        ref={mapRef}
      >
        {/* Display accommodations */}
        {accommodations?.map((accommodation) => (
          <Marker
            key={accommodation._id}
            position={accommodation.location.coordinates}
            icon={{
              text: getMarkerIcon(accommodation.type),
              fontSize: 24,
              fontWeight: 'bold'
            }}
          />
        ))}

        {/* Display routes */}
        {routes?.map((route) => (
          <React.Fragment key={route._id}>
            {/* Origin marker */}
            <Marker
              position={route.origin.coordinates}
              icon={{
                text: '📍',
                fontSize: 24,
                fontWeight: 'bold'
              }}
            />
            
            {/* Destination marker */}
            <Marker
              position={route.destination.coordinates}
              icon={{
                text: '📍',
                fontSize: 24,
                fontWeight: 'bold'
              }}
            />

            {/* Route line */}
            <Polyline
              path={[
                route.origin.coordinates,
                route.destination.coordinates
              ]}
              options={{
                strokeColor: '#2e7d32',
                strokeOpacity: 0.8,
                strokeWeight: 3
              }}
            />
          </React.Fragment>
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default TravelMap; 
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, Polyline } from '@react-google-maps/api';
import './TravelMap.css';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  position: 'relative'
};

const defaultCenter = {
  lat: 13.0827,
  lng: 80.2707
};

const mapOptions = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  zoomControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

const LoadingContainer = () => (
  <div className="map-container" style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd'
  }}>
    Loading maps...
  </div>
);

const ErrorContainer = ({ error }) => (
  <div className="map-container" style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    padding: '20px',
    textAlign: 'center',
    color: '#d32f2f'
  }}>
    {error || 'Error loading Google Maps. Please check your API key and try again.'}
  </div>
);

const TravelMap = ({ routes, accommodations, center }) => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    if (!process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
      setMapError('Google Maps API key is missing');
      console.error('Google Maps API key is missing in environment variables');
    }
  }, []);

  const onMapLoad = useCallback((map) => {
    console.log('Map loaded successfully');
    mapRef.current = map;
    setMapLoaded(true);
  }, []);

  const onMapError = useCallback((error) => {
    console.error('Map error:', error);
    setMapError(error.message);
  }, []);

  const getMarkerIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'hotel':
        return '🏨';
      case 'hostel':
        return '🏠';
      case 'eco-lodge':
        return '🌿';
      case 'apartment':
        return '🏢';
      default:
        return '📍';
    }
  };

  if (loadError || mapError) {
    console.error('Error loading Google Maps:', loadError || mapError);
    return <ErrorContainer error={loadError?.message || mapError} />;
  }

  if (!isLoaded) {
    return <LoadingContainer />;
  }

  const mapCenter = center || defaultCenter;
  console.log('Rendering map with center:', mapCenter);

  return (
    <div className="map-container">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={12}
        onLoad={onMapLoad}
        onError={onMapError}
        options={mapOptions}
      >
        {mapLoaded && accommodations?.map((accommodation) => {
          if (!accommodation.location?.coordinates?.lat || !accommodation.location?.coordinates?.lng) {
            console.warn('Invalid coordinates for accommodation:', accommodation);
            return null;
          }

          const position = {
            lat: parseFloat(accommodation.location.coordinates.lat),
            lng: parseFloat(accommodation.location.coordinates.lng)
          };

          return (
            <Marker
              key={accommodation._id}
              position={position}
              title={accommodation.name}
              label={{
                text: getMarkerIcon(accommodation.type),
                fontSize: '24px',
                className: 'marker-label'
              }}
            />
          );
        })}

        {mapLoaded && routes?.map((route) => {
          if (!route.origin?.coordinates?.lat || !route.origin?.coordinates?.lng ||
              !route.destination?.coordinates?.lat || !route.destination?.coordinates?.lng) {
            console.warn('Invalid coordinates for route:', route);
            return null;
          }

          return (
            <React.Fragment key={route._id}>
              <Marker
                position={{
                  lat: parseFloat(route.origin.coordinates.lat),
                  lng: parseFloat(route.origin.coordinates.lng)
                }}
                title={route.origin.name}
                label={{
                  text: '📍',
                  fontSize: '24px',
                  className: 'marker-label'
                }}
              />
              
              <Marker
                position={{
                  lat: parseFloat(route.destination.coordinates.lat),
                  lng: parseFloat(route.destination.coordinates.lng)
                }}
                title={route.destination.name}
                label={{
                  text: '📍',
                  fontSize: '24px',
                  className: 'marker-label'
                }}
              />

              <Polyline
                path={[
                  {
                    lat: parseFloat(route.origin.coordinates.lat),
                    lng: parseFloat(route.origin.coordinates.lng)
                  },
                  {
                    lat: parseFloat(route.destination.coordinates.lat),
                    lng: parseFloat(route.destination.coordinates.lng)
                  }
                ]}
                options={{
                  strokeColor: '#2e7d32',
                  strokeOpacity: 0.8,
                  strokeWeight: 3
                }}
              />
            </React.Fragment>
          );
        })}
      </GoogleMap>
    </div>
  );
};

export default TravelMap; 
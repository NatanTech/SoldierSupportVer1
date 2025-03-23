import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Box, Typography, Button, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Fix default marker icon issues - CRITICAL!
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Create a styled button for better visibility
const LocateButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  bottom: '10px',
  right: '10px',
  zIndex: 1000,
  backgroundColor: 'white',
  color: theme.palette.primary.main,
  padding: '6px 10px',
  minWidth: 'auto',
  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
  '&:hover': {
    backgroundColor: '#f0f0f0',
  },
  fontSize: '0.8rem',
  borderRadius: '20px',
}));

// Location control component
const LocationControl = () => {
  const map = useMap();
  
  useMapEvents({
    click: (e) => {
      map.setView(e.latlng, map.getZoom());
    }
  });
  
  return null;
};

// Auto locate component with improved visibility and immediate location
const AutoLocate = () => {
  const map = useMap();
  
  // Use location immediately when map loads
  useEffect(() => {
    console.log("AutoLocate component mounted - attempting to locate user");
    setTimeout(() => {
      try {
        map.locate({ setView: true, maxZoom: 16 });
        console.log("Map locate function called");
      } catch (error) {
        console.error("Error calling locate:", error);
      }
    }, 500); // Small delay to ensure map is ready
  }, [map]);
  
  const handleLocate = () => {
    console.log("Locate button clicked");
    map.locate({ setView: true, maxZoom: 16 });
  };
  
  return (
    <LocateButton
      variant="contained" 
      size="small"
      onClick={handleLocate}
      startIcon={<MyLocationIcon />}
    >
      חזור למיקומי
    </LocateButton>
  );
};

// Location marker component
const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click: (e) => {
      console.log("Map clicked at:", e.latlng);
      setPosition({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      });
    },
  });

  return position.latitude && position.longitude ? (
    <Marker position={[position.latitude, position.longitude]} />
  ) : null;
};

const LocationPicker = () => {
  const [position, setPosition] = useState(null);
  const mapRef = useRef();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition({ latitude, longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleLocate = () => {
    if (position && mapRef.current) {
      mapRef.current.setView([position.latitude, position.longitude], 13);
    }
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ height: '400px', position: 'relative' }}>
        {position && (
          <MapContainer
            center={[position.latitude, position.longitude]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            whenCreated={(mapInstance) => {
              mapRef.current = mapInstance;
            }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker position={position} setPosition={setPosition} />
            <LocationControl />
            <AutoLocate />
          </MapContainer>
        )}
        <LocateButton onClick={handleLocate}>
          <MyLocationIcon />
        </LocateButton>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocationOnIcon color="primary" />
        <Typography variant="body2" color="text.secondary">
          {position
            ? `נבחר מיקום: ${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`
            : 'לא נבחר מיקום'}
        </Typography>
      </Box>
    </Stack>
  );
};

export default LocationPicker; 
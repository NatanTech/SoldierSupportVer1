import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Box, Typography } from '@mui/material';

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component to handle map click events
const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      getAddress(e.latlng.lat, e.latlng.lng);
    },
  });

  // Get address from coordinates (reverse geocoding)
  const getAddress = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        // Notify parent component of the new location with address
        setPosition({
          latitude: lat,
          longitude: lng,
          address: data.display_name
        });
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  return position ? <Marker position={[position.latitude, position.longitude]} /> : null;
};

const LocationPicker = ({ onLocationChange }) => {
  const [position, setPosition] = useState({
    latitude: 31.7683, // Default to center of Israel
    longitude: 35.2137,
    address: ''
  });

  // Update parent component when position changes
  useEffect(() => {
    onLocationChange(position);
  }, [position, onLocationChange]);

  const handlePositionChange = (newPosition) => {
    setPosition(newPosition);
  };

  return (
    <Box sx={{ height: '300px', width: '100%', mb: 2 }}>
      <Typography variant="body2" sx={{ mb: 1 }}>
        לחץ על המפה כדי לבחור מיקום
      </Typography>
      <MapContainer
        center={[position.latitude, position.longitude]}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker position={position} setPosition={handlePositionChange} />
      </MapContainer>
    </Box>
  );
};

export default LocationPicker; 
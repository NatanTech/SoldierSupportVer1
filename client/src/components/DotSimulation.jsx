import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import axios from 'axios';

const DotSimulation = () => {
  const [cards, setCards] = useState([]);
  
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await axios.get('/api/cards');
        setCards(response.data);
      } catch (error) {
        console.error('Error fetching cards for simulation:', error);
      }
    };
    
    fetchCards();
  }, []);

  // Generate fixed dots plus dots from actual cards
  const generateDots = () => {
    // Start with some fixed animated dots
    const fixedDots = Array.from({ length: 25 }, (_, i) => ({
      id: `fixed-${i}`,
      color: i % 2 === 0 ? '#FF8C00' : '#1976d2', // Orange for donations, blue for requests
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.floor(Math.random() * 8) + 4,
      animationDuration: `${Math.floor(Math.random() * 15) + 5}s`
    }));
    
    // Add dots based on actual cards
    const cardDots = cards.map((card, i) => {
      // Use location to position if available, otherwise random
      const hasLocation = card.location && 
                         card.location.coordinates && 
                         card.location.coordinates.length === 2 &&
                         card.location.coordinates[0] !== 0;
      
      // Generate random position for visualization purpose only
      return {
        id: `card-${card._id}`,
        color: card.cardType === 'donation' ? '#FF8C00' : '#1976d2',
        left: hasLocation ? `${((card.location.coordinates[0] + 180) / 360) * 100}%` : `${Math.random() * 100}%`,
        top: hasLocation ? `${((90 - card.location.coordinates[1]) / 180) * 100}%` : `${Math.random() * 100}%`,
        size: Math.floor(Math.random() * 8) + 6, // Slightly larger for real data
        animationDuration: `${Math.floor(Math.random() * 10) + 10}s`,
        pulse: true // Add pulsing effect to real data points
      };
    });
    
    return [...fixedDots, ...cardDots];
  };

  const dots = generateDots();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {dots.map((dot) => (
        <Box
          key={dot.id}
          sx={{
            position: 'absolute',
            left: dot.left,
            top: dot.top,
            width: dot.size,
            height: dot.size,
            borderRadius: '50%',
            backgroundColor: dot.color,
            opacity: 0.4,
            transform: 'translateX(-50%) translateY(-50%)',
            animation: dot.pulse 
              ? `pulse ${Math.random() * 3 + 2}s infinite alternate, float ${dot.animationDuration} infinite alternate`
              : `float ${dot.animationDuration} infinite alternate`,
            '@keyframes float': {
              '0%': { transform: 'translateX(-50%) translateY(-50%)' },
              '100%': { 
                transform: `translateX(calc(-50% + ${Math.random() * 100 - 50}px)) translateY(calc(-50% + ${Math.random() * 100 - 50}px))` 
              }
            },
            '@keyframes pulse': {
              '0%': { opacity: 0.4, boxShadow: '0 0 5px 2px rgba(255, 255, 255, 0)' },
              '100%': { 
                opacity: 0.7, 
                boxShadow: `0 0 8px 3px ${dot.color}40` 
              }
            }
          }}
        />
      ))}
    </Box>
  );
};

export default DotSimulation; 
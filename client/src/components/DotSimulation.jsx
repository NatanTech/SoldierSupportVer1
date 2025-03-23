import React from 'react';
import { Box } from '@mui/material';

const DotSimulation = () => {
  const dots = Array.from({ length: 50 }, (_, i) => ({
    color: i % 2 === 0 ? 'orange' : 'blue',
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
  }));

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '400px' }}>
      {dots.map((dot, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: dot.color,
            left: dot.left,
            top: dot.top,
          }}
        />
      ))}
    </Box>
  );
};

export default DotSimulation; 
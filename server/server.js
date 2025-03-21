require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const authRoutes = require('./routes/auth');
const cardRoutes = require('./routes/cards');
const chatRoutes = require('./routes/chat');
const { setupSocketHandlers } = require('./utils/socketHandlers');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/chat', chatRoutes);

// Set up socket handlers
setupSocketHandlers(io);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🌐 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('❌ MongoDB connection error:');
    if (error.name === 'MongooseServerSelectionError') {
      console.error('🛑 Failed to connect to MongoDB Atlas.');
      console.error('⚠️ Possible causes:');
      console.error('  1. Your IP address is not whitelisted in MongoDB Atlas');
      console.error('     → Go to: Atlas dashboard > Security > Network Access > Add IP Address');
      console.error('     → Add your current IP or 0.0.0.0/0 for development');
      console.error('  2. Incorrect MongoDB URI connection string');
      console.error('  3. MongoDB Atlas service might be temporarily down');
      console.error('\n📝 Original error message:', error.message);
    } else {
      console.error(error);
    }
  });

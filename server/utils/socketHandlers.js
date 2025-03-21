const Chat = require('../models/Chat');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate socket connection
const authenticateSocket = async (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new Error('User not found'));
    }
    
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
};

exports.setupSocketHandlers = (io) => {
  // Set up authentication middleware
  io.use(authenticateSocket);
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username}`);
    
    // Join personal room for private messages
    socket.join(socket.user._id.toString());
    
    // Handle joining chat room
    socket.on('joinChat', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }
        
        // Check if user is participant
        if (!chat.participants.includes(socket.user._id)) {
          socket.emit('error', { message: 'Not authorized to join this chat' });
          return;
        }
        
        socket.join(chatId);
        console.log(`${socket.user.username} joined chat: ${chatId}`);
      } catch (error) {
        socket.emit('error', { message: 'Server error' });
      }
    });
    
    // Handle sending messages
    socket.on('sendMessage', async ({ chatId, content }) => {
      try {
        const chat = await Chat.findById(chatId);
        
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }
        
        // Check if user is participant
        if (!chat.participants.some(p => p.toString() === socket.user._id.toString())) {
          socket.emit('error', { message: 'Not authorized to send messages in this chat' });
          return;
        }
        
        // Create new message
        const message = {
          sender: socket.user._id,
          content,
          timestamp: new Date()
        };
        
        // Add message to chat
        chat.messages.push(message);
        chat.updatedAt = new Date();
        await chat.save();
        
        // Emit message to all users in the chat
        io.to(chatId).emit('newMessage', {
          ...message,
          sender: {
            _id: socket.user._id,
            username: socket.user.username
          }
        });
      } catch (error) {
        socket.emit('error', { message: 'Server error' });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username}`);
    });
  });
};
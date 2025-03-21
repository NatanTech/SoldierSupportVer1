const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc    Get user chats
// @route   GET /api/chat
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ 
      participants: req.user._id 
    })
    .populate('participants', 'username')
    .populate('card', 'itemName')
    .sort({ updatedAt: -1 });
    
    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

// @desc    Get chat by ID
// @route   GET /api/chat/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'username')
      .populate('card', 'itemName imageUrl')
      .populate('messages.sender', 'username');
    
    if (!chat) {
      return res.status(404).json({ message: 'צ\'אט לא נמצא' });
    }
    
    // Make sure user is part of this chat
    if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'אין הרשאה לצפייה בצ\'אט זה' });
    }
    
    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

// @desc    Create a new chat
// @route   POST /api/chat
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { participantId, cardId } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: 'חסר מזהה משתתף' });
    }
    
    // Check if user exists
    const otherUser = await User.findById(participantId);
    if (!otherUser) {
      return res.status(404).json({ message: 'משתמש לא נמצא' });
    }
    
    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [req.user._id, participantId] },
      card: cardId
    });
    
    if (existingChat) {
      return res.json(existingChat);
    }
    
    // Create new chat
    const newChat = new Chat({
      participants: [req.user._id, participantId],
      card: cardId || null,
      messages: []
    });
    
    await newChat.save();
    
    res.status(201).json(newChat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

// @desc    Add message to chat
// @route   POST /api/chat/:id/messages
// @access  Private
router.post('/:id/messages', protect, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'תוכן ההודעה נדרש' });
    }
    
    const chat = await Chat.findById(req.params.id);
    
    if (!chat) {
      return res.status(404).json({ message: 'צ\'אט לא נמצא' });
    }
    
    // Make sure user is part of this chat
    if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'אין הרשאה לשליחת הודעה בצ\'אט זה' });
    }
    
    const newMessage = {
      sender: req.user._id,
      content,
      timestamp: new Date()
    };
    
    chat.messages.push(newMessage);
    chat.updatedAt = new Date();
    
    await chat.save();
    
    // Return the added message with populated sender
    const populatedChat = await Chat.findById(req.params.id)
      .populate('messages.sender', 'username');
    
    const addedMessage = populatedChat.messages[populatedChat.messages.length - 1];
    
    res.status(201).json(addedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

module.exports = router; 
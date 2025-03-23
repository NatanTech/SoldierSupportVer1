const Card = require('../models/Card');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = './uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter for image uploads
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('רק קבצי תמונה מותרים'), false);
  }
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// @desc    Create a new card
// @route   POST /api/cards
// @access  Private
exports.createCard = async (req, res) => {
  try {
    const { itemName, description, phoneNumber, cardType, latitude, longitude, address } = req.body;

    // Create new card
    const card = new Card({
      itemName,
      description,
      phoneNumber,
      cardType,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address
      },
      user: req.user._id
    });

    // Add image URL if image was uploaded
    if (req.file) {
      card.imageUrl = `/uploads/${req.file.filename}`;
    }

    await card.save();
    res.status(201).json(card);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'שגיאת שרת' });
  }
};

// @desc    Get all cards
// @route   GET /api/cards
// @access  Public
exports.getCards = async (req, res) => {
  try {
    const { cardType, category, searchQuery } = req.query;
    
    // Build the query
    const query = {};
    
    if (cardType) {
      query.cardType = cardType;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (searchQuery) {
      query.$or = [
        { itemName: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    
    const cards = await Card.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'username');
    
    res.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ 
      message: 'שגיאה בטעינת הכרטיסים',
      error: error.message 
    });
  }
};

// @desc    Get cards near a location
// @route   GET /api/cards/near
// @access  Public
exports.getNearbyCards = async (req, res) => {
  try {
    const { longitude, latitude, distance = 10000 } = req.query; // distance in meters, default 10km
    
    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'יש לספק קווי אורך ורוחב' });
    }

    const cards = await Card.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(distance)
        }
      }
    }).populate('user', 'username');
    
    res.json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'שגיאת שרת' });
  }
};

// @desc    Get a single card
// @route   GET /api/cards/:id
// @access  Public
exports.getCardById = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id).populate('user', 'username');
    
    if (!card) {
      return res.status(404).json({ message: 'הכרטיס לא נמצא' });
    }
    
    res.json(card);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'הכרטיס לא נמצא' });
    }
    res.status(500).json({ message: 'שגיאת שרת' });
  }
};

// @desc    Update a card
// @route   PUT /api/cards/:id
// @access  Private
exports.updateCard = async (req, res) => {
  try {
    let card = await Card.findById(req.params.id);
    
    if (!card) {
      return res.status(404).json({ message: 'הכרטיס לא נמצא' });
    }
    
    // Check if user is owner or admin
    if (card.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'אין הרשאה לעדכן את הכרטיס' });
    }
    
    const { itemName, description, phoneNumber, cardType, latitude, longitude, address } = req.body;
    
    // Update card
    card.itemName = itemName || card.itemName;
    card.description = description || card.description;
    card.phoneNumber = phoneNumber || card.phoneNumber;
    card.cardType = cardType || card.cardType;
    
    if (latitude && longitude) {
      card.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address: address || card.location.address
      };
    }
    
    // Update image if new one is uploaded
    if (req.file) {
      // Delete old image if exists
      if (card.imageUrl) {
        const oldPath = path.join(__dirname, '..', card.imageUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      card.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    await card.save();
    res.json(card);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'הכרטיס לא נמצא' });
    }
    res.status(500).json({ message: 'שגיאת שרת' });
  }
};

// @desc    Delete a card
// @route   DELETE /api/cards/:id
// @access  Private
exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    
    if (!card) {
      return res.status(404).json({ message: 'הכרטיס לא נמצא' });
    }
    
    // Check if user is owner or admin
    if (card.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'אין הרשאה למחוק את הכרטיס' });
    }
    
    // Delete image if exists
    if (card.imageUrl) {
      const imagePath = path.join(__dirname, '..', card.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await card.remove();
    res.json({ message: 'הכרטיס נמחק בהצלחה' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'הכרטיס לא נמצא' });
    }
    res.status(500).json({ message: 'שגיאת שרת' });
  }
};

// @desc    Get user's cards
// @route   GET /api/cards/user
// @access  Private
exports.getUserCards = async (req, res) => {
  try {
    const cards = await Card.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'שגיאת שרת' });
  }
};
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function addUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const users = [
      { username: 'user1', email: 'user1@example.com', password: 'Password1', role: 'user' },
      { username: 'user2', email: 'user2@example.com', password: 'Password2', role: 'user' },
      // Add more users as needed
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ User created: ${user.email}`);
    }

    mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error adding users:', error);
    mongoose.disconnect();
  }
}

addUsers(); 
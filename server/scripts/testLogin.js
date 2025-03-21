require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function testUserLogin(email, password) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User with email ${email} not found in database`);
      mongoose.disconnect();
      return;
    }
    
    console.log('🔍 User found in database:');
    console.log(`  Username: ${user.username}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Password hash in DB: ${user.password.substring(0, 20)}...`);
    
    // Test password manually with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`🔑 Password test result: ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    
    // Test user's comparePassword method if it exists
    if (typeof user.comparePassword === 'function') {
      const methodMatch = await user.comparePassword(password);
      console.log(`🔑 Method comparePassword() result: ${methodMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    } else {
      console.log('⚠️ User model lacks comparePassword method!');
    }
    
    mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error testing login:', error);
    mongoose.disconnect();
  }
}

// Replace with your actual email and password
const testEmail = process.argv[2] || 'admin@example.com';
const testPassword = process.argv[3] || 'Admin123!';

console.log(`🧪 Testing login for: ${testEmail}`);
testUserLogin(testEmail, testPassword); 
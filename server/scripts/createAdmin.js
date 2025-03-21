require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Admin details - change as needed
    const adminData = {
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin123!',  // Will be hashed by the schema pre-save hook
      role: 'admin'
    };
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists:', existingAdmin.email);
      mongoose.disconnect();
      return;
    }
    
    // Create admin user
    const adminUser = new User(adminData);
    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    mongoose.disconnect();
  }
}

createAdminUser(); 
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const verifyAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const adminUser = await User.findOne({ username: 'admin' });
    if (adminUser) {
      console.log('Admin user exists:', {
        username: adminUser.username,
        role: adminUser.role
      });
    } else {
      console.log('Admin user not found');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error verifying admin user:', error);
    process.exit(1);
  }
};

verifyAdmin(); 
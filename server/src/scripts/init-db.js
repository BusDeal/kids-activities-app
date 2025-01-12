require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const initDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if default user exists
    const existingUser = await User.findOne({ username: 'demo' });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('demo123', 10);
      const user = new User({
        username: 'demo',
        password: hashedPassword,
        name: 'Demo User',
        age: 10,
        grade: '5th Grade',
        interests: ['Reading', 'Drawing', 'Science'],
      });

      await user.save();
      console.log('Default user created successfully');
    } else {
      console.log('Default user already exists');
    }

    await mongoose.disconnect();
    console.log('Database initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initDB();
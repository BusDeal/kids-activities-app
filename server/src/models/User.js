const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  interests: [{
    type: String,
  }],
  profilePicture: {
    type: String,
    default: '',
  },
  theme: {
    type: String,
    default: 'default',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
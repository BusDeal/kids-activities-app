const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['school_activity', 'achievement', 'poem', 'homework'],
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
  },
  placeholderUrl: {
    type: String,
  },
  aiDescription: {
    type: String,
  },
  isPublic: {
    type: Boolean,
    default: true,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Activity', activitySchema);
const express = require('express');
const multer = require('multer');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const User = require('../models/User');
const { uploadFile, deleteFile, validateFile } = require('../config/storageService');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for profile pictures
  },
});

// Update profile
router.put('/', optionalAuth, async (req, res, next) => {
  try {
    const { name, age, grade, interests, theme } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.age = age || user.age;
    user.grade = grade || user.grade;
    user.interests = interests || user.interests;
    user.theme = theme || user.theme;

    await user.save();
    res.json({ ...user.toObject(), password: undefined });
  } catch (error) {
    next(error);
  }
});

// Update profile picture
router.put('/picture', requireAuth, upload.single('profilePicture'), async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      validateFile(file, {
        maxSize: 2 * 1024 * 1024, // 2MB limit
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile picture if exists
    if (user.profilePicture) {
      try {
        await deleteFile(user.profilePicture);
      } catch (error) {
        console.error('Error deleting old profile picture:', error);
        // Continue with the upload even if deletion fails
      }
    }

    // Upload new profile picture
    const fileUrl = await uploadFile(file, `users/${req.user.userId}/profile`);
    user.profilePicture = fileUrl;
    await user.save();

    res.json({ ...user.toObject(), password: undefined });
  } catch (error) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size cannot exceed 2MB' });
    }
    next(error);
  }
});

module.exports = router;
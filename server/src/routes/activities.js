const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const Activity = require('../models/Activity');
const { uploadFile, deleteFile, validateFile } = require('../config/storageService');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Get all activities for the logged-in user
router.get('/', auth, async (req, res, next) => {
  try {
    const activities = await Activity.find({ user: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    next(error);
  }
});

// Upload a new activity
router.post('/', auth, upload.single('file'), async (req, res, next) => {
  try {
    const { title, description, type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      validateFile(file);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    // Upload file to selected storage provider
    const fileUrl = await uploadFile(file, `users/${req.user.userId}/activities`);

    const activity = new Activity({
      user: req.user.userId,
      title,
      description,
      type,
      fileUrl,
      fileType: file.mimetype,
    });

    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size cannot exceed 5MB' });
    }
    next(error);
  }
});

// Update an activity
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const activity = await Activity.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    activity.title = title || activity.title;
    activity.description = description || activity.description;
    await activity.save();

    res.json(activity);
  } catch (error) {
    next(error);
  }
});

// Delete an activity
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Delete file from storage
    await deleteFile(activity.fileUrl);
    await activity.deleteOne();

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
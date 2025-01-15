const express = require('express');
const multer = require('multer');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const Activity = require('../models/Activity');
const { uploadFile, deleteFile, validateFile } = require('../config/storageService');
const { generatePlaceholder, extractDescription } = require('../services/aiService');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Get all activities
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    let query = {};
    if (req.user) {
      // If user is logged in, show their activities and public activities
      query = { $or: [{ user: req.user.userId }, { isPublic: true }] };
    } else {
      // If user is not logged in, show only public activities
      query = { isPublic: true };
    }

    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name');

    // Add isOwner flag to each activity
    const activitiesWithOwnership = activities.map(activity => ({
      ...activity.toObject(),
      isOwner: req.user ? activity.user._id.toString() === req.user.userId : false
    }));

    res.json(activitiesWithOwnership);
  } catch (error) {
    next(error);
  }
});

// Get a single activity
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('user', 'name');

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Add isOwner flag
    const activityWithOwnership = {
      ...activity.toObject(),
      isOwner: req.user ? activity.user._id.toString() === req.user.userId : false
    };

    res.json(activityWithOwnership);
  } catch (error) {
    next(error);
  }
});

// Upload a new activity
router.post('/', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    const { title, description, type, isPublic = true } = req.body;
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

    // Generate placeholder and extract description using AI
    const [placeholderBuffer, aiDescription] = await Promise.all([
      generatePlaceholder(type),
      extractDescription(file)
    ]);

    // Upload placeholder image
    const placeholderUrl = await uploadFile(
      { buffer: placeholderBuffer, mimetype: 'image/jpeg', originalname: 'placeholder.jpg' },
      `users/${req.user.userId}/placeholders`
    );

    const activity = new Activity({
      user: req.user.userId,
      title,
      description,
      type,
      fileUrl,
      fileType: file.mimetype,
      placeholderUrl,
      aiDescription,
      isPublic: isPublic === 'false' ? false : true
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
router.put('/:id', requireAuth, async (req, res, next) => {
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
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Delete files from storage
    await Promise.all([
      deleteFile(activity.fileUrl),
      activity.placeholderUrl && deleteFile(activity.placeholderUrl)
    ]);

    await activity.deleteOne();
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
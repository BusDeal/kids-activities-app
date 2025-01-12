const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const Activity = require('../models/Activity');
const { uploadToS3, deleteFromS3 } = require('../config/s3');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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

    const key = `${req.user.userId}/${Date.now()}-${file.originalname}`;
    const fileUrl = await uploadToS3(file, key);

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

    // Delete file from S3
    const key = activity.fileUrl.split('/').slice(-2).join('/');
    await deleteFromS3(key);
    await activity.deleteOne();

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
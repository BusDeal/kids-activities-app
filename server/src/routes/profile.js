const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const upload = multer({ storage: multer.memoryStorage() });

// Update profile
router.put('/', auth, async (req, res) => {
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile picture
router.put('/picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `${req.user.userId}/profile/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    const uploadResult = await s3.upload(params).promise();
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile picture if exists
    if (user.profilePicture) {
      const oldKey = user.profilePicture.split('/').slice(-3).join('/');
      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: oldKey,
      };
      await s3.deleteObject(deleteParams).promise();
    }

    user.profilePicture = uploadResult.Location;
    await user.save();

    res.json({ ...user.toObject(), password: undefined });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
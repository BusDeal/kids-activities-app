const { uploadToS3, deleteFromS3 } = require('./s3');
const { uploadToGCS, deleteFromGCS } = require('./storage');

// Storage provider configuration
const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'gcs'; // 'gcs' or 's3'

const uploadFile = async (file, folder = '') => {
  try {
    if (STORAGE_PROVIDER === 's3') {
      const key = `${folder}/${Date.now()}-${file.originalname}`;
      return await uploadToS3(file, key);
    } else {
      return await uploadToGCS(file, folder);
    }
  } catch (error) {
    console.error('Storage upload error:', error);
    throw new Error('Failed to upload file');
  }
};

const deleteFile = async (fileUrl) => {
  try {
    if (STORAGE_PROVIDER === 's3') {
      // Extract key from S3 URL
      const key = fileUrl.split(`${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/`)[1];
      await deleteFromS3(key);
    } else {
      await deleteFromGCS(fileUrl);
    }
  } catch (error) {
    console.error('Storage delete error:', error);
    throw new Error('Failed to delete file');
  }
};

// Validate file type and size
const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // Default 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  } = options;

  if (file.size > maxSize) {
    throw new Error(`File size cannot exceed ${Math.floor(maxSize / 1024 / 1024)}MB`);
  }

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(
      `Invalid file type. Allowed types: ${allowedTypes
        .map((type) => type.split('/')[1].toUpperCase())
        .join(', ')}`
    );
  }

  return true;
};

module.exports = {
  uploadFile,
  deleteFile,
  validateFile,
  STORAGE_PROVIDER,
};
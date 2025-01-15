const { Storage } = require('@google-cloud/storage');

// Initialize storage
const storage = new Storage();

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
if (!bucketName) {
  throw new Error('GOOGLE_CLOUD_BUCKET_NAME environment variable is required');
}
const bucket = storage.bucket(bucketName);

const uploadToGCS = async (file, folder = '') => {
  try {
    console.log("GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (error) => {
        console.error('Upload error:', error);
        reject(new Error('Failed to upload file'));
      });

      blobStream.on('finish', async () => {
        // Generate public URL (bucket is already public)
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    });
  } catch (error) {
    console.error('GCS upload error:', error);
    throw new Error('Failed to upload file to Google Cloud Storage');
  }
};

const deleteFromGCS = async (fileUrl) => {
  try {
    // Extract filename from URL
    const fileName = fileUrl.split(`${bucket.name}/`)[1];
    if (!fileName) {
      throw new Error('Invalid file URL');
    }

    const file = bucket.file(fileName);
    await file.delete();
  } catch (error) {
    console.error('GCS delete error:', error);
    throw new Error('Failed to delete file from Google Cloud Storage');
  }
};

module.exports = {
  storage,
  bucket,
  uploadToGCS,
  deleteFromGCS,
};
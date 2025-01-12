const { Storage } = require('@google-cloud/storage');

// Initialize storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

const uploadToGCS = async (file, folder = '') => {
  try {
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
        // Make the file public
        try {
          await blob.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          resolve(publicUrl);
        } catch (error) {
          console.error('Error making file public:', error);
          reject(new Error('Failed to make file public'));
        }
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
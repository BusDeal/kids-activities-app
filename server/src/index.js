const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();
const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activities');
const profileRoutes = require('./routes/profile');
const errorHandler = require('./middleware/error');

// Write GCP credentials to file
/* if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  fs.writeFileSync('/tmp/gcp-credentials.json', process.env.GOOGLE_APPLICATION_CREDENTIALS);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = '/tmp/gcp-credentials.json';
} */



const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/profile', profileRoutes);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

// MongoDB connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});
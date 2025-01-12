# Kids Activities App

A full-stack web application for kids to document and showcase their school activities, achievements, poems, and homework tasks.

## Features

- User Authentication
- File Upload (images, PDFs)
- Activity Management
- Profile Management
- Responsive Design
- AWS S3 Integration
- MongoDB Database

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- AWS Account with S3 bucket
- npm or yarn

## Setup

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the server directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_bucket_name
```

4. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the client directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

## Usage

1. Register a new account or log in with existing credentials
2. Upload activities from the Upload page
3. View all activities on the Home page
4. Click on an activity to view details
5. Edit your profile from the Profile page

## Project Structure

```
kids-activities-app/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # Context providers
│   │   └── utils/        # Utility functions
│   └── public/           # Static files
└── server/               # Backend Node.js application
    ├── src/
    │   ├── models/       # MongoDB models
    │   ├── routes/       # API routes
    │   ├── middleware/   # Custom middleware
    │   └── config/       # Configuration files
    └── uploads/          # Temporary file storage
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user

### Activities
- GET /api/activities - Get all activities
- POST /api/activities - Create new activity
- PUT /api/activities/:id - Update activity
- DELETE /api/activities/:id - Delete activity

### Profile
- PUT /api/profile - Update profile
- PUT /api/profile/picture - Update profile picture

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

MIT License
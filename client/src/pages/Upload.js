import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { activities } from '../utils/api';

const activityTypes = [
  { value: 'school_activity', label: 'School Activity' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'poem', label: 'Poem' },
  { value: 'homework', label: 'Homework' },
];

const Upload = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('type', formData.type);

      await activities.create(uploadData);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Upload Activity
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <TextField
              fullWidth
              select
              label="Activity Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              margin="normal"
              required
            >
              {activityTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <Box
              {...getRootProps()}
              sx={{
                mt: 3,
                p: 3,
                border: '2px dashed #ccc',
                borderRadius: 1,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <Typography>Drop the file here...</Typography>
              ) : (
                <Typography>
                  {file
                    ? `Selected file: ${file.name}`
                    : 'Drag and drop a file here, or click to select a file'}
                </Typography>
              )}
            </Box>

            {error && (
              <Typography color="error" align="center" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Upload'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Upload;
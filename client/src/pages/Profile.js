import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { profile } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || '',
    grade: user?.grade || '',
    interests: user?.interests?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await profile.updatePicture(formData);
      login(response.data, localStorage.getItem('token'));
    } catch (error) {
      setError('Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
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
    setLoading(true);
    setError('');

    try {
      const updatedData = {
        ...formData,
        interests: formData.interests.split(',').map((i) => i.trim()),
      };

      const response = await profile.update(updatedData);
      login(response.data, localStorage.getItem('token'));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            My Profile
          </Typography>

          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mb={4}
          >
            <Box
              {...getRootProps()}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              <input {...getInputProps()} />
              <Avatar
                src={user?.profilePicture}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              <Typography variant="body2" color="textSecondary" align="center">
                Click to change profile picture
              </Typography>
            </Box>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Interests (comma-separated)"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              margin="normal"
              helperText="Enter your interests separated by commas"
            />

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
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;
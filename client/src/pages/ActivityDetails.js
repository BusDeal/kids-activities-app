import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { activities } from '../utils/api';

const ActivityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await activities.getAll();
        const foundActivity = response.data.find((a) => a._id === id);
        if (foundActivity) {
          setActivity(foundActivity);
          setEditData({
            title: foundActivity.title,
            description: foundActivity.description,
          });
        } else {
          setError('Activity not found');
        }
      } catch (error) {
        setError('Failed to load activity');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  const handleEdit = async () => {
    try {
      const response = await activities.update(id, editData);
      setActivity(response.data);
      setEditDialogOpen(false);
    } catch (error) {
      setError('Failed to update activity');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await activities.delete(id);
        navigate('/');
      } catch (error) {
        setError('Failed to delete activity');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !activity) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography color="error">{error || 'Activity not found'}</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">{activity.title}</Typography>
            <Box>
              <Button
                startIcon={<EditIcon />}
                onClick={() => setEditDialogOpen(true)}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                color="error"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </Box>
          </Box>

          <Typography variant="body1" paragraph>
            {activity.description}
          </Typography>

          <Box sx={{ mt: 3 }}>
            {activity.fileType.startsWith('image/') ? (
              <img
                src={activity.fileUrl}
                alt={activity.title}
                style={{ maxWidth: '100%', borderRadius: 8 }}
              />
            ) : (
              <Button
                variant="contained"
                color="primary"
                href={activity.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View File
              </Button>
            )}
          </Box>

          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
            Created: {new Date(activity.createdAt).toLocaleString()}
          </Typography>
        </Paper>
      </Box>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Activity</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            margin="normal"
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ActivityDetails;
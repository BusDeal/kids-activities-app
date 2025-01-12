import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { activities } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userActivities, setUserActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await activities.getAll();
        setUserActivities(response.data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleActivityClick = (activityId) => {
    navigate(`/activity/${activityId}`);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">
          Welcome, {user?.name}!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/upload')}
        >
          Add Activity
        </Button>
      </Box>

      {userActivities.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="50vh"
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No activities yet
          </Typography>
          <Typography color="textSecondary">
            Click the "Add Activity" button to get started!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {userActivities.map((activity) => (
            <Grid item xs={12} sm={6} md={4} key={activity._id}>
              <Card
                sx={{ height: '100%', cursor: 'pointer' }}
                onClick={() => handleActivityClick(activity._id)}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={activity.thumbnailUrl || '/placeholder.png'}
                  alt={activity.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {activity.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {activity.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Home;
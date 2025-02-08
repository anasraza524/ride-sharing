// src/pages/RideHistory.js
import React, { useEffect, useState } from "react";
import { 
  Container, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress,
  Alert,
  Chip,
  Divider
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const RideHistory = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        navigate("/login");
        return;
      }

      try {
        const response = await api.get(`/rides/history?userId=${userId}`);
        setRides(response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load ride history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'in_progress': return 'warning';
      default: return 'info';
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <DirectionsCarIcon sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
        <Typography variant="h4" gutterBottom>
          Your Ride History
        </Typography>
        
        {loading && <CircularProgress sx={{ mt: 3 }} />}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <>
            {rides.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                No rides found in your history.
              </Alert>
            ) : (
              <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                {rides.map((ride, index) => (
                  <React.Fragment key={ride._id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <>
                            <Chip 
                              label={ride.status}
                              color={getStatusColor(ride.status)}
                              size="small"
                              sx={{ mb: 1 }}
                            />
                            <Typography variant="subtitle1">
                              From {ride.pickupLocation} to {ride.dropoffLocation}
                            </Typography>
                          </>
                        }
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                              display="block"
                            >
                              {formatDistanceToNow(new Date(ride.createdAt))} ago
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Driver: {ride.driver?.name || 'Not assigned'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Price: ${ride.fare?.toFixed(2) || '0.00'}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < rides.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default RideHistory;
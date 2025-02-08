import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  useMediaQuery,
  Chip,
  IconButton
} from "@mui/material";
import { LocationOn, Cancel, CheckCircle, AccessTime,DirectionsCar } from "@mui/icons-material";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import socket from "../services/socket";

const RideRequest = () => {
  const { auth } = useContext(AuthContext);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [rideStatus, setRideStatus] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState("");

  const validateCoordinates = (value) => {
    const regex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
    return regex.test(value);
  };

  useEffect(() => {
    if (rideStatus?.status === 'pending' && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [rideStatus, countdown]);

  useEffect(() => {
    const handleRideUpdate = (update) => {
      setRideStatus(update);
      if (update.status !== 'pending') setCountdown(0);
    };

    socket.on('ride_status', handleRideUpdate);
    return () => socket.off('ride_status', handleRideUpdate);
  }, []);

  const handleRequestRide = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateCoordinates(pickupLocation) || !validateCoordinates(dropoffLocation)) {
      setError("Invalid coordinates format. Use 'longitude, latitude'");
      return;
    }

    setLoading(true);
    try {
      const [pickupLng, pickupLat] = pickupLocation.split(',').map(Number);
      const [dropoffLng, dropoffLat] = dropoffLocation.split(',').map(Number);

      const response = await api.post("/rides/request", {
        passengerId: "passenger-id",
        location: [pickupLng, pickupLat],
        // pickupLocation: { lng: pickupLng, lat: pickupLat },
        // dropoffLocation: { lng: dropoffLng, lat: dropoffLat }
      });

      setRideStatus({
        ...response.data,
        status: 'pending',
        createdAt: new Date()
      });
      setCountdown(30);

    } catch (err) {
      setError(err.response?.data?.message || "Failed to request ride");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async () => {
    try {
      await api.delete(`/rides/${rideStatus._id}`);
      setRideStatus(null);
      setCountdown(0);
    } catch (err) {
      setError("Failed to cancel ride");
    }
  };

  const getStatusContent = () => {
    if (!rideStatus) return null;

    const statusConfig = {
      pending: {
        icon: <AccessTime fontSize="large" color="warning" />,
        color: '#ff9800',
        title: "Looking for Drivers",
        message: `Estimated wait time: ${countdown} seconds`
      },
      accepted: {
        icon: <CheckCircle fontSize="large" color="success" />,
        color: '#4caf50',
        title: "Ride Accepted!",
        message: `Driver ${rideStatus.driverName} is arriving in ${rideStatus.eta} minutes`
      },
      cancelled: {
        icon: <Cancel fontSize="large" color="error" />,
        color: '#f44336',
        title: "Ride Cancelled",
        message: "Your ride request has been cancelled"
      }
    };

    const { icon, color, title, message } = statusConfig[rideStatus.status] || {};

    return (
      <Box sx={{
        mt: 4,
        p: 3,
        border: `2px solid ${color}`,
        borderRadius: 2,
        backgroundColor: `${color}10`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 2, fontWeight: 600, color }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body1">{message}</Typography>
        {rideStatus.status === 'pending' && (
          <Button
            variant="outlined"
            color="error"
            onClick={handleCancelRide}
            sx={{ mt: 2 }}
          >
            Cancel Request
          </Button>
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ 
        mb: 4,
        fontWeight: 700,
        color: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <DirectionsCar fontSize="large" />
        {rideStatus ? 'Ride Status' : 'New Ride Request'}
      </Typography>

      {!rideStatus ? (
        <Box component="form" onSubmit={handleRequestRide}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pickup Location (lng, lat)"
                variant="outlined"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <LocationOn color="primary" sx={{ mr: 1 }} />
                  ),
                }}
                placeholder="Example: -73.935242, 40.730610"
                error={!!pickupLocation && !validateCoordinates(pickupLocation)}
                helperText="Enter longitude, latitude coordinates"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Drop-off Location (lng, lat)"
                variant="outlined"
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <LocationOn color="secondary" sx={{ mr: 1 }} />
                  ),
                }}
                placeholder="Example: -74.0060, 40.7128"
                error={!!dropoffLocation && !validateCoordinates(dropoffLocation)}
                helperText="Enter longitude, latitude coordinates"
              />
            </Grid>
          </Grid>

          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={loading || !pickupLocation || !dropoffLocation}
            sx={{
              mt: 4,
              py: 2,
              borderRadius: 2,
              fontSize: '1.1rem',
              fontWeight: 600
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Confirm Ride Request'
            )}
          </Button>

          <Divider sx={{ my: 4 }}>OR</Divider>

          <Typography variant="body1" color="text.secondary" align="center">
            Use our interactive map to select locations
          </Typography>
        </Box>
      ) : (
        getStatusContent()
      )}

      {rideStatus?.driver && (
        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Driver Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography>
                <strong>Name:</strong> {rideStatus.driver.name}
              </Typography>
              <Typography>
                <strong>Vehicle:</strong> {rideStatus.driver.vehicle}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography>
                <strong>License Plate:</strong> {rideStatus.driver.licensePlate}
              </Typography>
              <Typography>
                <strong>Rating:</strong> {rideStatus.driver.rating}/5
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default RideRequest;
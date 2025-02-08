// src/pages/DriverDashboard.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  useMediaQuery,
  useTheme, InputAdornment
} from "@mui/material";
import {
  LocationOn,
  DirectionsCar,
  Schedule,
  PersonPin,
  CheckCircle,
  History
} from "@mui/icons-material";
import socket from "../services/socket";
import api from "../services/api";
import RideCard from "../components/RideCard";

const DriverDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [location, setLocation] = useState("");
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [nearbyRides, setNearbyRides] = useState([]);
  const [rideHistory, setRideHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [error, setError] = useState("");

  // Get driver info from auth context
  const driverId = "driver-id" || localStorage.getItem("userId") || "driver-id";
  const driverName = localStorage.getItem("userName") || "Driver Name";;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { longitude, latitude } = position.coords;
        setLocation(`${longitude.toFixed(4)}, ${latitude.toFixed(4)}`);
        handleUpdateLocation([longitude, latitude]);
      },
      error => setError("Enable location services to receive ride requests")
    );

    socket.on('ride_request', handleNewRideRequest);
    return () => socket.off('ride_request', handleNewRideRequest);
  }, []);

  const handleNewRideRequest = (ride) => {
    setNearbyRides(prev => [ride, ...prev]);
  };

  const validateCoordinates = (coords) => {
    return coords.every(c => !isNaN(c) && Math.abs(c) <= 180);
  };

  const handleUpdateLocation = async (coords) => {
    setLoadingUpdate(true);
    try {
      const [lng, lat] = coords || location.split(',').map(Number);

      if (!validateCoordinates([lng, lat])) {
        throw new Error("Invalid coordinates format");
      }

      // await api.post('/drivers/location', { driverId, coordinates: [lng, lat] });
      socket.emit('update_location', {
        driverId,
        name: driverName,
        location: { coordinates: [lng, lat] }
      });

      const response = await api.get(`/rides/active?lat=${lat}&lng=${lng}`);
      setNearbyRides(response.data);
    } catch (err) {
      setError(err.message);
    }
    setLoadingUpdate(false);
  };

  const handleAcceptRide = async (rideId) => {
    try {
      const response = await api.post('/rides/accept', {
        rideId,
        driverId: "70617373656e6765722d6964",
        // eta: calculateETA() // Implement ETA calculation
      });

      setNearbyRides(prev => prev.filter(ride => ride._id !== rideId));
      setRideHistory(prev => [response.data, ...prev]);

      socket.emit('ride_accept', {
        rideId,
        driverId,
        driverName,
        eta: response.data.eta
      });

    } catch (err) {
      setError("Failed to accept ride: " + err.message);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{
        backgroundColor: 'background.paper',
        borderRadius: 4,
        p: 4,
        boxShadow: theme.shadows[3]
      }}>
        {/* Dashboard Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 3 }}>
          <Avatar sx={{ width: 64, height: 64 }}>
            <DirectionsCar fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {driverName}'s Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Driver ID: {driverId}
            </Typography>
          </Box>
        </Box>

        {/* Location Update Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            <LocationOn sx={{ mr: 1, verticalAlign: 'bottom' }} />
            Current Position
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="GPS Coordinates"
              variant="outlined"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, maxWidth: 400 }}
            />
            <Button
              variant="contained"
              onClick={() => handleUpdateLocation()}
              disabled={loadingUpdate}
              sx={{ height: 56, px: 4 }}
            >
              {loadingUpdate ? (
                <CircularProgress size={24} />
              ) : (
                'Update Location'
              )}
            </Button>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>

        {/* Rides Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Button
            variant={activeTab === 'active' ? 'contained' : 'text'}
            onClick={() => setActiveTab('active')}
            startIcon={<DirectionsCar />}
          >
            Active Requests ({nearbyRides.length})
          </Button>
          <Button
            variant={activeTab === 'history' ? 'contained' : 'text'}
            onClick={() => setActiveTab('history')}
            startIcon={<History />}
            sx={{ ml: 2 }}
          >
            Ride History ({rideHistory.length})
          </Button>
        </Box>

        {/* Rides Content */}
        {activeTab === 'active' ? (
          <Grid container spacing={3}>
            {nearbyRides.length > 0 ? (
              nearbyRides.map((ride) => (
                <Grid item xs={12} md={6} lg={4} key={ride._id}>
                  <RideCard
                    ride={ride}
                    onAccept={handleAcceptRide}
                    showActions={true}
                  />
                </Grid>
              ))
            ) : (
              <Box sx={{
                width: '100%',
                textAlign: 'center',
                py: 8,
                color: 'text.secondary'
              }}>
                <DirectionsCar sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h6">
                  No active ride requests in your area
                </Typography>
              </Box>
            )}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {rideHistory.map((ride) => (
              <Grid item xs={12} md={6} lg={4} key={ride._id}>
                <RideCard
                  ride={ride}
                  showStatus={true}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default DriverDashboard;
// src/pages/NearbyDrivers.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
  Avatar,
  useMediaQuery,
  useTheme,Chip
} from "@mui/material";
import {
  LocationOn,
  DirectionsCar,
  Schedule,
  Person,
  CheckCircle,
  Error,
  AccessTime
} from "@mui/icons-material";
import socket from "../services/socket";
import DriverCard from "../components/DriverCard";

const NearbyDrivers = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [location, setLocation] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [activeRide, setActiveRide] = useState(null);
  const [locationError, setLocationError] = useState(false);

  // Get user location automatically on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setLocation(`${longitude.toFixed(4)}, ${latitude.toFixed(4)}`);
        },
        (error) => console.error("Geolocation error:", error)
      );
    }
  }, []);

  const validateLocation = () => {
    const regex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
    return regex.test(location);
  };

  const fetchNearbyDrivers = () => {
    if (!validateLocation()) {
      setLocationError(true);
      return;
    }
    setLocationError(false);
    setLoadingDrivers(true);
    
    const [lng, lat] = location.split(',').map(Number);
    socket.emit("get_nearby_drivers", { lng, lat, radius: 5 }, (response) => {
      console.log("response",response)
      setDrivers(response.data || []);
      setLoadingDrivers(false);
    });
  };

  const handleRequestRide = (driver) => {
    const [lng, lat] = location.split(',').map(Number);
    const payload = {
      driverId: driver.driverId,
      passengerId: localStorage.getItem("userId"),
      passengerLocation: { lng, lat }
    };

    socket.emit("ride_request", payload, (response) => {
      setActiveRide(response.data);
      if (response.status === "success") {
        setDrivers(drivers.filter(d => d.driverId !== driver.driverId));
      }
    });
  };

  const getStatusContent = () => {
    if (!activeRide) return null;
    
    const statusConfig = {
      pending: {
        icon: <AccessTime fontSize="large" color="warning" />,
        color: theme.palette.warning.main,
        message: "Waiting for driver confirmation..."
      },
      accepted: {
        icon: <CheckCircle fontSize="large" color="success" />,
        color: theme.palette.success.main,
        message: `Driver ${activeRide.driverName} is on the way!`
      },
      no_driver_found: {
        icon: <Error fontSize="large" color="error" />,
        color: theme.palette.error.main,
        message: "No available drivers. Please try again later."
      }
    };

    const { icon, color, message } = statusConfig[activeRide.status];

    return (
      <Alert
        severity={activeRide.status}
        icon={icon}
        sx={{
          mb: 3,
          border: `1px solid ${color}`,
          backgroundColor: `${color}10`,
          width: '100%'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {message}
          </Typography>
          {activeRide.estimatedArrival && (
            <Chip
              label={`ETA: ${activeRide.estimatedArrival} mins`}
              icon={<Schedule />}
              variant="outlined"
            />
          )}
        </Box>
      </Alert>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ 
        backgroundColor: 'background.paper',
        borderRadius: 4,
        p: 4,
        boxShadow: theme.shadows[3]
      }}>
        <Typography variant="h4" sx={{ 
          mb: 4,
          fontWeight: 700,
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <DirectionsCar fontSize="large" /> Find Nearby Drivers
        </Typography>

        {/* Location Input Section */}
        <Box sx={{ 
          mb: 4,
          display: 'flex', 
          gap: 2, 
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Current Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            error={locationError}
            helperText={locationError && "Invalid location format (longitude, latitude)"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn color="primary" />
                </InputAdornment>
              ),
            }}
            placeholder="Enter longitude, latitude (e.g., -73.935242, 40.730610)"
          />
          <Button
            variant="contained"
            onClick={fetchNearbyDrivers}
            disabled={loadingDrivers}
            sx={{ 
              minWidth: 120,
              height: 56,
              px: 4,
              borderRadius: 2
            }}
          >
            {loadingDrivers ? <CircularProgress size={24} /> : "Search"}
          </Button>
        </Box>

        {/* Ride Status */}
        {getStatusContent()}

        {/* Drivers List */}
        <Grid container spacing={3}>
          {drivers.map((driver) => (
            <Grid item xs={12} sm={6} key={driver.driverId}>
              <DriverCard
                driver={driver}
                onRequestRide={() => handleRequestRide(driver)}
                disabled={!!activeRide}
              />
            </Grid>
          ))}
        </Grid>

        {/* Empty State */}
        {!loadingDrivers && drivers.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            color: 'text.secondary'
          }}>
            <LocationOn sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6">
              No drivers available in your area
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Try increasing search radius or checking back later
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default NearbyDrivers;
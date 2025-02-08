// src/components/DriverCard.js
import { Card, Typography, Button, Avatar, Box, Chip, useTheme } from "@mui/material";
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const DriverCard = ({ driver, onRequestRide, disabled }) => {
  const theme = useTheme();

  return (
    <Card sx={{ 
      p: 3,
      borderRadius: 3,
      transition: 'all 0.3s ease',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar src={driver.photo} sx={{ width: 56, height: 56, mr: 2 }} />
        <Box>
          <Typography variant="h6">{driver.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {driver.vehicleMake} {driver.vehicleModel}
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Chip 
          icon={<DirectionsCarIcon />} 
          label={`${driver.distance.toFixed(1)} km away`} 
        />
        <Chip 
          color="primary" 
          label={`★ ${driver.rating}`} 
          variant="outlined" 
        />
      </Box>
      
      <Button
        fullWidth
        variant="contained"
        onClick={onRequestRide}
        disabled={disabled}
        sx={{
          py: 1.5,
          borderRadius: 2,
          fontWeight: 600
        }}
      >
        Request Ride
      </Button>
    </Card>
  );
};

export default DriverCard;
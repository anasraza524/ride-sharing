// src/components/RideCard.js
import { Card, Typography, Button, Box, Chip, Divider, useTheme } from "@mui/material";
import PersonPinIcon from '@mui/icons-material/PersonPin';

const RideCard = ({ ride, onAccept, showActions, showStatus }) => {
  const theme = useTheme();

  return (
    <Card sx={{ 
      p: 3,
      borderRadius: 3,
      transition: 'all 0.3s ease',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <PersonPinIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
        <Box>
          <Typography variant="h6">Ride {ride.shortId}</Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(ride.createdAt).toLocaleTimeString()}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          From
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {ride.pickupLocation}
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          To
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {ride.dropoffLocation}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Chip label={`${ride.distance} km`} size="small" />
        <Chip 
          label={`₹${ride.fare}`} 
          color="success" 
          variant="outlined" 
          size="small"
        />
        {showStatus && (
          <Chip 
            label={ride.status} 
            color={
              ride.status === 'completed' ? 'success' : 
              ride.status === 'cancelled' ? 'error' : 'warning'
            }
            size="small"
          />
        )}
      </Box>

      {showActions && (
        <Button
          fullWidth
          variant="contained"
          onClick={() => onAccept(ride._id)}
          sx={{ mt: 2 }}
        >
          Accept Ride
        </Button>
      )}
    </Card>
  );
};

export default RideCard;
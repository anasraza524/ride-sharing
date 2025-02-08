// server/controllers/driverController.js

// Helper function: Calculate distance using the Haversine formula.
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Exported helper: Returns nearby drivers from the active drivers Map.
// Expects: clientLocation { lat, lng, radius } and activeDrivers (Map of driver data).
export const getNearbyDrivers = (clientLocation, activeDrivers) => {
  const { lat, lng, radius } = clientLocation;
  const searchRadius = typeof radius === "number" ? radius : 5; // Default 5 km.
  const nearbyDrivers = [];
  
  activeDrivers.forEach((driver) => {
    if (driver.location &&
        Array.isArray(driver.location.coordinates) &&
        driver.location.coordinates.length === 2) {
      // Assuming driver.location.coordinates: [lng, lat]
      const [driverLng, driverLat] = driver.location.coordinates;
      const distance = calculateDistance(lat, lng, driverLat, driverLng);
      console.log(`Distance from client to driver ${driver.driverId}: ${distance.toFixed(2)} km`);
      if (distance <= searchRadius) {
        nearbyDrivers.push(driver);
      }
    } else {
      console.warn("Invalid location format for driver:", driver);
    }
  });
  
  return nearbyDrivers;
};

// Create a new driver.
import Driver from "../models/Driver.js";
import redisClient from "../config/redis.js";

export const createDriver = async (req, res) => {
  try {
    const { name, lng, lat, rating } = req.body;
    if (!name || !lng || !lat) {
      return res.status(400).json({ message: "Name, longitude, and latitude are required" });
    }
    const driver = new Driver({
      name,
      location: { type: "Point", coordinates: [Number(lng), Number(lat)] },
      available: true,
      rating: rating || 5.0,
    });
    await driver.save();
    res.status(201).json({ message: "Driver created successfully", driver });
  } catch (error) {
    res.status(500).json({ message: "Error creating driver", error: error.message });
  }
};

export const updateDriverStatus = async (req, res) => {
  try {
    const { driverId, available } = req.body;
    const driver = await Driver.findByIdAndUpdate(driverId, { available }, { new: true });
    if (driver) {
      const redisKey = `driver:${driverId}`;
      await redisClient.set(redisKey, JSON.stringify(driver));
    }
    res.status(200).json({ message: "Driver status updated", driver });
  } catch (error) {
    res.status(500).json({ message: "Error updating driver status", error: error.message });
  }
};

// API endpoint for nearby drivers using MongoDB GeoJSON query.
export const getNearbyDriversAPI = async (req, res) => {
  try {
    const { lng, lat } = req.query;
    const nearbyDrivers = await Driver.find({
      location: {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 5000, // 5 km
        },
      },
      available: true,
    });
    res.status(200).json(nearbyDrivers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching nearby drivers", error: error.message });
  }
};

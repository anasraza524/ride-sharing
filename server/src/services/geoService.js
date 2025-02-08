import Driver from '../models/Driver.js';

export const findNearbyDrivers = async (lng, lat, maxDistance = 5000) => {
  try {
    const drivers = await Driver.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: maxDistance
        }
      },
      available: true
    });
    return drivers;
  } catch (error) {
    throw error;
  }
};

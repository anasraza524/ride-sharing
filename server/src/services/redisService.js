import redisClient from '../config/redis.js';

export const cacheDriver = async (driverId, driverData) => {
  try {
    await redisClient.set(`driver:${driverId}`, JSON.stringify(driverData));
  } catch (error) {
    console.error("Error caching driver:", error.message);
  }
};

export const getCachedDriver = async (driverId) => {
  try {
    const data = await redisClient.get(`driver:${driverId}`);
    return JSON.parse(data);
  } catch (error) {
    console.error("Error retrieving cached driver:", error.message);
    return null;
  }
};

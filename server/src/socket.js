// src/socket.js
import { getNearbyDrivers } from "./controllers/driverController.js";
import { validateLocation, validateDriverData } from "./utils/validation.js";
import logger from "./config/logger.js";

// In-memory store for development
const driverStore = {
  store: new Map(),
  get: (socketId) => driverStore.store.get(socketId),
  set: (socketId, data) => driverStore.store.set(socketId, data),
  delete: (socketId) => driverStore.store.delete(socketId),
  getAll: () => Array.from(driverStore.store.values())
};

export const handleSockets = (io) => {
  io.use((socket, next) => {
    // Basic authentication middleware
    if (!socket.handshake.auth.token) {
      return next(new Error("Authentication required"));
    }
    next();
  });

  io.on("connection", (socket) => {
    logger.info(`New connection: ${socket.id}`);

    // Real-time location updates
    socket.on("update_location", async (data) => {
      try {
        if (!validateDriverData(data)) {
          throw new Error("Invalid driver data format");
        }
        
        driverStore.set(socket.id, data);
        io.emit("drivers_update", driverStore.getAll());
        
      } catch (error) {
        logger.error(`Location update failed: ${error.message}`);
        socket.emit("error", { code: "LOCATION_UPDATE_ERROR", message: error.message });
      }
    });

    // Nearby drivers query
    socket.on("get_nearby_drivers", (clientLocation, callback) => {
      try {
        if (!validateLocation(clientLocation)) {
          throw new Error("Invalid client coordinates");
        }
        
        // const drivers = driverStore.getAll();
        const results = getNearbyDrivers(clientLocation, drivers);
        callback({ status: "success", data: results });
        
      } catch (error) {
        logger.error(`Nearby drivers query error: ${error.message}`);
        callback({ status: "error", message: error.message });
      }
    });

    // Ride management
    const activeRides = new Map();
    
    socket.on("ride_request", (rideData, callback) => {
      const rideId = `ride_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      
      try {
        const nearbyDrivers = getNearbyDrivers(
          rideData.pickupLocation, 
          driverStore.getAll()
        );

        const ride = {
          ...rideData,
          rideId,
          status: "pending",
          createdAt: new Date(),
          timeout: setTimeout(() => {
            activeRides.delete(rideId);
            socket.emit("ride_timeout", { rideId });
          }, 30000)
        };

        activeRides.set(rideId, ride);
        nearbyDrivers.forEach(driver => {
          io.to(driver.socketId).emit("new_ride", ride);
        });

        callback({ status: "pending", rideId });
        
      } catch (error) {
        logger.error(`Ride request failed: ${error.message}`);
        callback({ status: "error", message: error.message });
      }
    });

    // Cleanup on disconnect
    socket.on("disconnect", () => {
      driverStore.delete(socket.id);
      io.emit("drivers_update", driverStore.getAll());
      logger.info(`Connection closed: ${socket.id}`);
    });
  });
};
// src/utils/validation.js
export const validateDriverData = (data) => {
    return data &&
      data.driverId &&
      typeof data.driverId === 'string' &&
      data.name &&
      typeof data.name === 'string' &&
      validateLocation(data.location);
  };
  
  export const validateLocation = (location) => {
    return location &&
      location.coordinates &&
      Array.isArray(location.coordinates) &&
      location.coordinates.length === 2 &&
      typeof location.coordinates[0] === 'number' &&
      typeof location.coordinates[1] === 'number' &&
      Math.abs(location.coordinates[0]) <= 180 &&
      Math.abs(location.coordinates[1]) <= 90;
  };
  
  export const validateRideRequest = (data) => {
    return data &&
      data.passengerId &&
      typeof data.passengerId === 'string' &&
      validateLocation(data.pickupLocation) &&
      (!data.dropoffLocation || validateLocation(data.dropoffLocation));
  };
  
  export const validateSocketAuth = (socket) => {
    return socket.handshake.auth.token &&
      typeof socket.handshake.auth.token === 'string';
  };
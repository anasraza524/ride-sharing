// src/services/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

// Singleton socket instance
let socket = null;

// Connection management functions
export const socketService = {
  connect: () => {
    if (!socket) {
      socket = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem("token")
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
        transports: ["websocket"],
        withCredentials: true,
        autoConnect: false
      });

      // Event listeners
      socket
        .on("connect", () => {
          console.log("Connected:", socket.id);
        })
        .on("connect_error", (err) => {
          console.error("Connection error:", err.message);
        })
        .on("disconnect", (reason) => {
          console.log("Disconnected:", reason);
        });
    }

    if (!socket.connected) {
      socket.connect();
    }
  },

  disconnect: () => {
    if (socket?.connected) {
      socket.disconnect();
    }
  },

  on: (event, callback) => {
    if (socket) socket.on(event, callback);
  },

  off: (event, callback) => {
    if (socket) socket.off(event, callback);
  },

  emit: (event, data) => {
    if (socket) socket.emit(event, data);
  }
};

export default socketService;
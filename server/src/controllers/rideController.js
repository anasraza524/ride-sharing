// server/controllers/rideController.js

import Ride from "../models/Ride.js";
import Driver from "../models/Driver.js";

// Passenger requests a ride.
export const requestRide = async (req, res) => {
  try {
    const { passengerId, location } = req.body;
    const newRide = new Ride({
      passengerId,
      startLocation: { type: "Point", coordinates: location },
      status: "pending",
      createdAt: new Date(),
    });
    await newRide.save();
    res.status(201).json({ message: "Ride requested", ride: newRide });
  } catch (error) {
    res.status(500).json({ message: "Error requesting ride", error: error.message });
  }
};

// Driver accepts a ride.
export const acceptRide = async (req, res) => {
  try {
    const { rideId, driverId } = req.body;
    console.log("Accept ride request:", { rideId, driverId });
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }
    if (ride.status !== "pending") {
      return res.status(400).json({ message: "Ride already accepted or unavailable" });
    }
    ride.driverId = driverId;
    ride.status = "accepted";
    await ride.save();
    await Driver.findByIdAndUpdate(driverId, { available: false });
    res.status(200).json({ message: "Ride accepted", ride });
  } catch (error) {
    res.status(500).json({ message: "Error accepting ride", error: error.message });
  }
};

// Passenger cancels a ride.
export const cancelRide = async (req, res) => {
  try {
    const { rideId } = req.body;
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }
    ride.status = "cancelled";
    await ride.save();
    res.status(200).json({ message: "Ride cancelled", ride });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling ride", error: error.message });
  }
};

// Driver marks a ride as completed.
export const completeRide = async (req, res) => {
  try {
    const { rideId } = req.body;
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }
    ride.status = "completed";
    await ride.save();
    if (ride.driverId) {
      await Driver.findByIdAndUpdate(ride.driverId, { available: true });
    }
    res.status(200).json({ message: "Ride completed", ride });
  } catch (error) {
    res.status(500).json({ message: "Error completing ride", error: error.message });
  }
};

// Get active rides (pending or accepted).
export const getActiveRides = async (req, res) => {
  try {
    const activeRides = await Ride.find({ status: { $in: ["pending", "accepted"] } });
    res.status(200).json(activeRides);
  } catch (error) {
    res.status(500).json({ message: "Error fetching active rides", error: error.message });
  }
};

// Get ride history for a passenger or driver.
export const getRideHistory = async (req, res) => {
  try {
    const { userId, role } = req.query;
    let rides = [];
    const sortOptions = { createdAt: -1 };

    if (role === "passenger") {
      rides = await Ride.find({ passengerId: userId, status: "completed" }).sort(sortOptions);
    } else if (role === "driver") {
      rides = await Ride.find({ driverId: userId, status: "completed" }).sort(sortOptions);
    } else {
      rides = await Ride.find({}).sort(sortOptions);
    }
    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ride history", error: error.message });
  }
};

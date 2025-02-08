// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RideRequest from "./pages/RideRequest";
import RideHistory from "./pages/RideHistory";
import NearbyDrivers from "./pages/NearbyDrivers";
import DriverDashboard from "./pages/DriverDashboard";
import AddDriver from "./pages/AddDriver";
import Navbar from "./components/Navbar";
import SignUp from "./pages/SignUp";
function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />

        
        <Route path="/request-ride" element={<RideRequest />} />
        <Route path="/ride-history" element={<RideHistory />} />
        <Route path="/nearby-drivers" element={<NearbyDrivers />} />
        <Route path="/driver-dashboard" element={<DriverDashboard />} />
        <Route path="/add-driver" element={<AddDriver />} />
      </Routes>
    </div>
  );
}

export default App;

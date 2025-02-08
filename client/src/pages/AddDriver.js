// src/pages/AddDriver.js
import React, { useState } from "react";
import { Container, Box, Typography, TextField, Button } from "@mui/material";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const AddDriver = () => {
  const [name, setName] = useState("");
  const [lng, setLng] = useState("");
  const [lat, setLat] = useState("");
  const [rating, setRating] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/drivers", { name, lng, lat, rating });
      setMessage(response.data.message);
      // Optionally, redirect after a successful insertion:
      navigate("/nearby-drivers");
    } catch (error) {
      console.error("Error creating driver", error);
      setMessage("Error creating driver");
    }
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Add New Driver
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Longitude"
            variant="outlined"
            fullWidth
            margin="normal"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            required
          />
          <TextField
            label="Latitude"
            variant="outlined"
            fullWidth
            margin="normal"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            required
          />
          <TextField
            label="Rating (optional)"
            variant="outlined"
            fullWidth
            margin="normal"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Add Driver
          </Button>
        </form>
        {message && (
          <Typography variant="body1" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default AddDriver;

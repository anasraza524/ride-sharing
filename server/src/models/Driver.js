import mongoose from 'mongoose';

const DriverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  available: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    default: 5.0,
  },
});

DriverSchema.index({ location: "2dsphere" });

export default mongoose.model('Driver', DriverSchema);

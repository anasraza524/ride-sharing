import mongoose from 'mongoose';

const RideSchema = new mongoose.Schema({
  passengerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
  },
  startLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'cancelled', 'completed', 'no_driver_found'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
RideSchema.index({ startLocation: "2dsphere" });

export default mongoose.model('Ride', RideSchema);

import express from 'express';
import {
  requestRide,
  acceptRide,
  cancelRide,
  completeRide,
  getActiveRides,
  getRideHistory
} from '../controllers/rideController.js';

const router = express.Router();
router.post('/request', requestRide);
router.post('/accept', acceptRide);
router.post('/cancel', cancelRide);

router.post('/complete', completeRide);

router.get('/active', getActiveRides);

router.get('/history', getRideHistory);

export default router;

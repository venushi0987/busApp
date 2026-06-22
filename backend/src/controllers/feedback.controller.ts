import { Request, Response } from 'express';
import Feedback from '../models/Feedback';
import User from '../models/User';

// @route   POST /api/feedback/add
// @access  Private (Passenger)
export const addFeedback = async (req: any, res: Response): Promise<void> => {
  try {
    const { driverId, busNumber, stars, comment } = req.body;

    if (!driverId || !busNumber || !stars) {
      res.status(400).json({ success: false, message: 'driverId, busNumber, and stars are required' });
      return;
    }

    const driver = await User.findById(driverId);
    if (!driver) {
      res.status(404).json({ success: false, message: 'Driver not found' });
      return;
    }

    const feedback = await Feedback.create({
      passenger: req.user.id,
      driver: driverId,
      busNumber,
      stars,
      comment: comment?.trim() || '',
    });

    res.status(201).json({ success: true, message: 'Feedback submitted', feedback });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({ success: false, message: 'Server error submitting feedback' });
  }
};

// @route   GET /api/feedback/driver/:driverId
// @access  Public
export const getDriverFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const feedbacks = await Feedback.find({ driver: req.params.driverId })
      .populate('passenger', 'name')
      .sort({ createdAt: -1 });

    const avg =
      feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.stars, 0) / feedbacks.length
        : 0;

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      averageRating: Math.round(avg * 10) / 10,
      feedbacks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching feedback' });
  }
};

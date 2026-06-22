import { Response } from 'express';
import BusSchedule, { BusStatus } from '../models/BusSchedule';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc    Create a new bus schedule
// @route   POST /api/bus/schedules
// @access  Private/Driver
export const createSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { busNumber, startPoint, destination, daysOfOperation, departureTime } = req.body;

    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const schedule = new BusSchedule({
      driver: req.user._id,
      busNumber: busNumber || req.user.busNumber, // Fallback to driver's default bus number
      startPoint,
      destination,
      daysOfOperation,
      departureTime,
      status: BusStatus.ACTIVE,
      lastUpdatedBy: req.user._id,
    });

    await schedule.save();

    res.status(201).json({
      success: true,
      message: 'Bus schedule created successfully',
      schedule,
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get all bus schedules (optionally search/filter by route)
// @route   GET /api/bus/schedules
// @access  Public
export const getSchedules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startPoint, destination, busNumber } = req.query;
    const filter: any = {};

    if (startPoint) {
      filter.startPoint = { $regex: new RegExp(startPoint as string, 'i') };
    }
    if (destination) {
      filter.destination = { $regex: new RegExp(destination as string, 'i') };
    }
    if (busNumber) {
      filter.busNumber = { $regex: new RegExp(busNumber as string, 'i') };
    }

    const schedules = await BusSchedule.find(filter)
      .populate('driver', 'name email busNumber busType contactNo busName')
      .populate('lastUpdatedBy', 'name role')
      .sort({ departureTime: 1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      schedules,
    });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching schedules' });
  }
};

// @desc    Get a single bus schedule by ID
// @route   GET /api/bus/schedules/:id
// @access  Public
export const getScheduleById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schedule = await BusSchedule.findById(req.params.id)
      .populate('driver', 'name email busNumber')
      .populate('lastUpdatedBy', 'name role');

    if (!schedule) {
      res.status(404).json({ success: false, message: 'Schedule not found' });
      return;
    }

    res.status(200).json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching schedule details' });
  }
};

// @desc    Update bus schedule status (Active, Delayed, Canceled)
// @route   PATCH /api/bus/schedules/:id/status
// @access  Private/Driver
export const updateScheduleStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, delayMinutes, cancellationReason } = req.body;

    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    if (status && !Object.values(BusStatus).includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status type' });
      return;
    }

    const schedule = await BusSchedule.findById(req.params.id);

    if (!schedule) {
      res.status(404).json({ success: false, message: 'Schedule not found' });
      return;
    }

    // Authorization check: Make sure this driver owns this schedule
    // In production, we permit admins or the specific schedule owner
    if (schedule.driver.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot modify another driver\'s schedule',
      });
      return;
    }

    // Apply updates
    if (status) schedule.status = status;
    
    if (status === BusStatus.DELAYED) {
      schedule.delayMinutes = delayMinutes || 0;
      schedule.cancellationReason = undefined; // Reset cancellation if delayed
    } else if (status === BusStatus.CANCELED) {
      schedule.cancellationReason = cancellationReason || 'No reason provided';
      schedule.delayMinutes = 0; // Reset delay if canceled
    } else if (status === BusStatus.ACTIVE) {
      schedule.delayMinutes = 0;
      schedule.cancellationReason = undefined;
    }

    schedule.lastUpdatedBy = req.user._id;

    await schedule.save();

    // NOTE: Real-time update push notifications or Socket.io events would be broadcasted here

    res.status(200).json({
      success: true,
      message: `Bus schedule status successfully updated to ${schedule.status}`,
      schedule,
    });
  } catch (error) {
    console.error('Update schedule status error:', error);
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Delete a bus schedule
// @route   DELETE /api/bus/schedules/:id
// @access  Private/Driver
export const deleteSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schedule = await BusSchedule.findById(req.params.id);

    if (!schedule) {
      res.status(404).json({ success: false, message: 'Schedule not found' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    // Validate ownership
    if (schedule.driver.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot delete another driver\'s schedule',
      });
      return;
    }

    await BusSchedule.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Bus schedule deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting schedule' });
  }
};

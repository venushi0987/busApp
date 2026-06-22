"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSchedule = exports.updateScheduleStatus = exports.getScheduleById = exports.getSchedules = exports.createSchedule = void 0;
const BusSchedule_1 = __importStar(require("../models/BusSchedule"));
// @desc    Create a new bus schedule
// @route   POST /api/bus/schedules
// @access  Private/Driver
const createSchedule = async (req, res) => {
    try {
        const { busNumber, startPoint, destination, daysOfOperation, departureTime } = req.body;
        if (!req.user) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const schedule = new BusSchedule_1.default({
            driver: req.user._id,
            busNumber: busNumber || req.user.busNumber, // Fallback to driver's default bus number
            startPoint,
            destination,
            daysOfOperation,
            departureTime,
            status: BusSchedule_1.BusStatus.ACTIVE,
            lastUpdatedBy: req.user._id,
        });
        await schedule.save();
        res.status(201).json({
            success: true,
            message: 'Bus schedule created successfully',
            schedule,
        });
    }
    catch (error) {
        console.error('Create schedule error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createSchedule = createSchedule;
// @desc    Get all bus schedules (optionally search/filter by route)
// @route   GET /api/bus/schedules
// @access  Public
const getSchedules = async (req, res) => {
    try {
        const { startPoint, destination, busNumber } = req.query;
        const filter = {};
        if (startPoint) {
            filter.startPoint = { $regex: new RegExp(startPoint, 'i') };
        }
        if (destination) {
            filter.destination = { $regex: new RegExp(destination, 'i') };
        }
        if (busNumber) {
            filter.busNumber = { $regex: new RegExp(busNumber, 'i') };
        }
        const schedules = await BusSchedule_1.default.find(filter)
            .populate('driver', 'name email busNumber')
            .populate('lastUpdatedBy', 'name role')
            .sort({ departureTime: 1 });
        res.status(200).json({
            success: true,
            count: schedules.length,
            schedules,
        });
    }
    catch (error) {
        console.error('Get schedules error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching schedules' });
    }
};
exports.getSchedules = getSchedules;
// @desc    Get a single bus schedule by ID
// @route   GET /api/bus/schedules/:id
// @access  Public
const getScheduleById = async (req, res) => {
    try {
        const schedule = await BusSchedule_1.default.findById(req.params.id)
            .populate('driver', 'name email busNumber')
            .populate('lastUpdatedBy', 'name role');
        if (!schedule) {
            res.status(404).json({ success: false, message: 'Schedule not found' });
            return;
        }
        res.status(200).json({ success: true, schedule });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching schedule details' });
    }
};
exports.getScheduleById = getScheduleById;
// @desc    Update bus schedule status (Active, Delayed, Canceled)
// @route   PATCH /api/bus/schedules/:id/status
// @access  Private/Driver
const updateScheduleStatus = async (req, res) => {
    try {
        const { status, delayMinutes, cancellationReason } = req.body;
        if (!req.user) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        if (status && !Object.values(BusSchedule_1.BusStatus).includes(status)) {
            res.status(400).json({ success: false, message: 'Invalid status type' });
            return;
        }
        const schedule = await BusSchedule_1.default.findById(req.params.id);
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
        if (status)
            schedule.status = status;
        if (status === BusSchedule_1.BusStatus.DELAYED) {
            schedule.delayMinutes = delayMinutes || 0;
            schedule.cancellationReason = undefined; // Reset cancellation if delayed
        }
        else if (status === BusSchedule_1.BusStatus.CANCELED) {
            schedule.cancellationReason = cancellationReason || 'No reason provided';
            schedule.delayMinutes = 0; // Reset delay if canceled
        }
        else if (status === BusSchedule_1.BusStatus.ACTIVE) {
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
    }
    catch (error) {
        console.error('Update schedule status error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updateScheduleStatus = updateScheduleStatus;
// @desc    Delete a bus schedule
// @route   DELETE /api/bus/schedules/:id
// @access  Private/Driver
const deleteSchedule = async (req, res) => {
    try {
        const schedule = await BusSchedule_1.default.findById(req.params.id);
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
        await BusSchedule_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Bus schedule deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error deleting schedule' });
    }
};
exports.deleteSchedule = deleteSchedule;

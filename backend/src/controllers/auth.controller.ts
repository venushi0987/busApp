import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { IUser, UserRole } from '../models/User';
import BusSchedule, { BusStatus } from '../models/BusSchedule';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_production';
const JWT_EXPIRES_IN = '30d';

const generateToken = (id: string, role: string): string =>
  jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

/** Helper: parse any ISO string or HH:MM string into HH:MM */
const toHHMM = (raw: string): string => {
  if (!raw) return '08:00';
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  // Already HH:MM
  return raw;
};

// ─── REGISTER ────────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name, email, password, role,
      contactNo,
      // Driver fields
      driverLicense, busNumber, busName,
      busType, vehicleType, routeType,
      routeFrom, routeTo, leaveTime, arriveTime,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    if (role && !Object.values(UserRole).includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role specified' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const isDriver = role === UserRole.DRIVER;

    const user = new User({
      name,
      email,
      passwordHash,
      role: role || UserRole.PASSENGER,
      contactNo: contactNo || '',
      // Driver-only
      driverLicense: isDriver ? driverLicense : undefined,
      busNumber:     isDriver ? busNumber     : undefined,
      busName:       isDriver ? busName       : '',
      busType:       isDriver ? (busType       || 'Private')  : 'Private',
      vehicleType:   isDriver ? (vehicleType   || 'Non-AC')   : 'Non-AC',
      routeType:     isDriver ? (routeType     || 'Normal')   : 'Normal',
      routeFrom:     isDriver ? (routeFrom     || '')         : '',
      routeTo:       isDriver ? (routeTo       || '')         : '',
      leaveTime:     isDriver ? (leaveTime     || '')         : '',
      arriveTime:    isDriver ? (arriveTime    || '')         : '',
    });

    await user.save();

    // Auto-create BusSchedule so the driver is immediately searchable
    if (isDriver && routeFrom && routeTo && busNumber) {
      const departureTime = toHHMM(leaveTime || '08:00');
      const arrivalTime   = toHHMM(arriveTime  || '17:00');
      await BusSchedule.create({
        driver:         user._id,
        busNumber,
        busName:        busName || '',
        startPoint:     routeFrom,
        destination:    routeTo,
        departureTime,
        arrivalTime,
        daysOfOperation: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
        busType:         busType     || 'Private',
        vehicleType:     vehicleType || 'Non-AC',
        routeType:       routeType   || 'Normal',
        status:          BusStatus.ACTIVE,
        lastUpdatedBy:   user._id,
      });
    }

    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id:            user._id,
        name:          user.name,
        email:         user.email,
        role:          user.role,
        contactNo:     user.contactNo,
        driverLicense: user.driverLicense,
        busNumber:     user.busNumber,
        busName:       user.busName,
        busType:       user.busType,
        vehicleType:   user.vehicleType,
        routeType:     user.routeType,
        routeFrom:     user.routeFrom,
        routeTo:       user.routeTo,
        leaveTime:     user.leaveTime,
        arriveTime:    user.arriveTime,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user._id.toString(), user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id:            user._id,
        name:          user.name,
        email:         user.email,
        role:          user.role,
        contactNo:     user.contactNo,
        driverLicense: user.driverLicense,
        busNumber:     user.busNumber,
        busName:       user.busName,
        busType:       user.busType,
        vehicleType:   user.vehicleType,
        routeType:     user.routeType,
        routeFrom:     user.routeFrom,
        routeTo:       user.routeTo,
        leaveTime:     user.leaveTime,
        arriveTime:    user.arriveTime,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET ME ───────────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── UPDATE DRIVER BUS ────────────────────────────────────────────────────────
// @route   PUT /api/auth/driver-bus
// @access  Private/Driver
export const updateDriverBus = async (req: any, res: Response): Promise<void> => {
  try {
    const {
      routeFrom, routeTo, contactNo,
      busName, busNo, busType, vehicleType, routeType,
      leaveTime, arriveTime,
    } = req.body;

    if (req.user.role?.toUpperCase() !== UserRole.DRIVER.toUpperCase()) {
      res.status(403).json({ success: false, message: 'Access denied. Drivers only.' });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          routeFrom, routeTo, contactNo,
          busName, busNumber: busNo,
          busType, vehicleType, routeType,
          leaveTime, arriveTime,
        },
      },
      { new: true, runValidators: false }
    ).select('-passwordHash');

    // Upsert BusSchedule for passenger searches
    const departureTime = toHHMM(leaveTime || '08:00');
    const arrivalTime   = toHHMM(arriveTime  || '17:00');

    await BusSchedule.findOneAndUpdate(
      { driver: req.user.id },
      {
        busNumber:       busNo || updatedUser?.busNumber || '',
        busName:         busName  || '',
        startPoint:      routeFrom,
        destination:     routeTo,
        departureTime,
        arrivalTime,
        daysOfOperation: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
        busType:         busType     || 'Private',
        vehicleType:     vehicleType || 'Non-AC',
        routeType:       routeType   || 'Normal',
        status:          BusStatus.ACTIVE,
        lastUpdatedBy:   req.user.id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, message: 'Bus details updated', user: updatedUser });
  } catch (error) {
    console.error('Update driver bus error:', error);
    res.status(500).json({ success: false, message: 'Server error updating bus details' });
  }
};

// ─── UPDATE DRIVER STATUS ─────────────────────────────────────────────────────
// @route   PUT /api/auth/driver-status
// @access  Private/Driver
export const updateDriverStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const { todayStatus, delayMinutes, delayReason, isBusFull } = req.body;

    if (req.user.role?.toUpperCase() !== UserRole.DRIVER.toUpperCase()) {
      res.status(403).json({ success: false, message: 'Access denied. Drivers only.' });
      return;
    }

    // Map driver status to BusSchedule status
    const statusMap: Record<string, BusStatus> = {
      available:  BusStatus.ACTIVE,
      delayed:    BusStatus.DELAYED,
      cancelled:  BusStatus.CANCELED,
    };
    const scheduleStatus = statusMap[todayStatus] || BusStatus.ACTIVE;

    // Update User status fields
    await User.findByIdAndUpdate(req.user.id, {
      $set: {
        todayStatus:  todayStatus  ?? 'available',
        delayMinutes: delayMinutes ?? 0,
        delayReason:  delayReason  ?? '',
        isBusFull:    isBusFull    ?? false,
      },
    });

    // Sync BusSchedule
    await BusSchedule.findOneAndUpdate(
      { driver: req.user.id },
      {
        $set: {
          status:             scheduleStatus,
          isBusFull:          isBusFull    ?? false,
          delayMinutes:       delayMinutes ?? 0,
          cancellationReason: todayStatus === 'cancelled' ? (delayReason || 'Cancelled by driver') : '',
          lastUpdatedBy:      req.user.id,
        },
      }
    );

    res.status(200).json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
};

// ─── UPDATE DRIVER LOCATION ──────────────────────────────────────────────────
// @route   PUT /api/auth/driver-location
// @access  Private/Driver
export const updateDriverLocation = async (req: any, res: Response): Promise<void> => {
  try {
    const { latitude, longitude } = req.body;

    if (req.user.role?.toUpperCase() !== UserRole.DRIVER.toUpperCase()) {
      res.status(403).json({ success: false, message: 'Access denied. Drivers only.' });
      return;
    }

    if (latitude === undefined || longitude === undefined) {
      res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
      return;
    }

    await User.findByIdAndUpdate(req.user.id, {
      $set: { latitude, longitude }
    });

    await BusSchedule.findOneAndUpdate(
      { driver: req.user.id },
      {
        $set: {
          latitude,
          longitude,
          lastLocationUpdate: new Date(),
        }
      }
    );

    res.status(200).json({ success: true, message: 'Location updated successfully' });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ success: false, message: 'Server error updating location' });
  }
};
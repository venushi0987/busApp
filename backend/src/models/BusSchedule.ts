import mongoose, { Schema, Document, Model } from 'mongoose';

export enum BusStatus {
  ACTIVE = 'ACTIVE',
  DELAYED = 'DELAYED',
  CANCELED = 'CANCELED',
}

export interface IBusSchedule extends Document {
  driver: mongoose.Types.ObjectId;
  busNumber: string;
  busName?: string;
  startPoint: string;
  destination: string;
  daysOfOperation: string[];
  departureTime: string;  // HH:MM
  arrivalTime?: string;   // HH:MM
  busType?: string;       // CTB | Private
  vehicleType?: string;   // AC | Non-AC
  routeType?: string;     // Highway | Normal
  latitude?: number;
  longitude?: number;
  lastLocationUpdate?: Date;
  status: BusStatus;
  isBusFull?: boolean;
  delayMinutes?: number;
  cancellationReason?: string;
  lastUpdatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BusScheduleSchema: Schema<IBusSchedule> = new Schema(
  {
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Driver reference is required'],
    },
    busNumber: { type: String, required: [true, 'Bus number is required'], trim: true },
    busName:   { type: String, default: '', trim: true },
    startPoint: { type: String, required: [true, 'Start point is required'], trim: true },
    destination: { type: String, required: [true, 'Destination is required'], trim: true },
    daysOfOperation: [
      {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
    ],
    departureTime: {
      type: String,
      required: [true, 'Departure time is required'],
      match: [/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Departure time must be HH:MM'],
    },
    arrivalTime: { type: String, default: '' },
    busType:     { type: String, default: 'Private' },
    vehicleType: { type: String, default: 'Non-AC' },
    routeType:   { type: String, default: 'Normal' },
    latitude:    { type: Number },
    longitude:   { type: Number },
    lastLocationUpdate: { type: Date },
    status: {
      type: String,
      enum: Object.values(BusStatus),
      default: BusStatus.ACTIVE,
    },
    isBusFull:    { type: Boolean, default: false },
    delayMinutes: { type: Number, default: 0 },
    cancellationReason: { type: String, trim: true },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Last updated by reference is required'],
    },
  },
  { timestamps: true }
);

BusScheduleSchema.index({ startPoint: 1, destination: 1 });
BusScheduleSchema.index({ busNumber: 1 });
BusScheduleSchema.index({ driver: 1 }, { unique: true }); // one active schedule per driver

const BusSchedule: Model<IBusSchedule> = mongoose.model<IBusSchedule>('BusSchedule', BusScheduleSchema);
export default BusSchedule;

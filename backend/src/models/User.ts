import mongoose, { Schema, Document, Model } from 'mongoose';

export enum UserRole {
  DRIVER = 'DRIVER',
  PASSENGER = 'PASSENGER',
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  contactNo?: string;
  // Driver-only fields
  driverLicense?: string;
  busNumber?: string;
  busName?: string;
  busType?: string;       // 'CTB' | 'Private'
  vehicleType?: string;   // 'AC' | 'Non-AC'
  routeType?: string;     // 'Highway' | 'Normal'
  routeFrom?: string;
  routeTo?: string;
  leaveTime?: string;
  arriveTime?: string;
  // Status
  isBusFull?: boolean;
  todayStatus?: string;   // 'available' | 'delayed' | 'cancelled'
  delayMinutes?: number;
  delayReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
    },
    passwordHash: { type: String, required: [true, 'Password hash is required'] },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.PASSENGER,
    },
    contactNo: { type: String, default: '' },

    // Driver fields
    driverLicense: {
      type: String,
      required: function (this: IUser) {
        return this.role === UserRole.DRIVER;
      },
      trim: true,
    },
    busNumber: {
      type: String,
      required: function (this: IUser) {
        return this.role === UserRole.DRIVER;
      },
      trim: true,
    },
    busName:     { type: String, default: '' },
    busType:     { type: String, default: 'Private' },   // CTB | Private
    vehicleType: { type: String, default: 'Non-AC' },    // AC | Non-AC
    routeType:   { type: String, default: 'Normal' },    // Highway | Normal
    routeFrom:   { type: String, default: '' },
    routeTo:     { type: String, default: '' },
    leaveTime:   { type: String, default: '' },
    arriveTime:  { type: String, default: '' },

    // Live status fields
    isBusFull:    { type: Boolean, default: false },
    todayStatus:  { type: String, default: 'available' },
    delayMinutes: { type: Number, default: 0 },
    delayReason:  { type: String, default: '' },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User;
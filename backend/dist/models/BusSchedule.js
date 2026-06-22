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
exports.BusStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var BusStatus;
(function (BusStatus) {
    BusStatus["ACTIVE"] = "ACTIVE";
    BusStatus["DELAYED"] = "DELAYED";
    BusStatus["CANCELED"] = "CANCELED";
})(BusStatus || (exports.BusStatus = BusStatus = {}));
const BusScheduleSchema = new mongoose_1.Schema({
    driver: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Driver reference is required']
    },
    busNumber: {
        type: String,
        required: [true, 'Bus number is required'],
        trim: true
    },
    startPoint: {
        type: String,
        required: [true, 'Start point is required'],
        trim: true
    },
    destination: {
        type: String,
        required: [true, 'Destination is required'],
        trim: true
    },
    daysOfOperation: [{
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: [true, 'Days of operation are required']
        }],
    departureTime: {
        type: String,
        required: [true, 'Departure time is required'],
        match: [/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Departure time must be in HH:MM 24-hour format']
    },
    status: {
        type: String,
        enum: Object.values(BusStatus),
        default: BusStatus.ACTIVE
    },
    delayMinutes: {
        type: Number,
        default: 0
    },
    cancellationReason: {
        type: String,
        trim: true
    },
    lastUpdatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Last updated by reference is required']
    }
}, {
    timestamps: true
});
// Compound index to speed up route searches
BusScheduleSchema.index({ startPoint: 1, destination: 1 });
BusScheduleSchema.index({ busNumber: 1 });
const BusSchedule = mongoose_1.default.model('BusSchedule', BusScheduleSchema);
exports.default = BusSchedule;

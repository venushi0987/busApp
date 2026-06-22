"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bus_controller_1 = require("../controllers/bus.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
// Public routes for both passengers and drivers
router.get('/schedules', bus_controller_1.getSchedules);
router.get('/schedules/:id', bus_controller_1.getScheduleById);
// Protected routes (Only Drivers can modify)
router.post('/schedules', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRoles)(User_1.UserRole.DRIVER), bus_controller_1.createSchedule);
router.patch('/schedules/:id/status', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRoles)(User_1.UserRole.DRIVER), bus_controller_1.updateScheduleStatus);
router.delete('/schedules/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRoles)(User_1.UserRole.DRIVER), bus_controller_1.deleteSchedule);
exports.default = router;

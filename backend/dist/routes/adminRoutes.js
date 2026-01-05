"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/pending', auth_1.isAuthenticated, auth_1.isAdmin, adminController_1.getPendingUsers);
router.put('/:id/approve', auth_1.isAuthenticated, auth_1.isAdmin, adminController_1.approveUser);
exports.default = router;

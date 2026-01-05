"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.get('/', auth_1.isAuthenticated, auth_1.isAdmin, userController_1.getUsers);
router.get('/trash', auth_1.isAuthenticated, auth_1.isAdmin, require('../controllers/userController').getTrash); // Specific path before :id
router.post('/:id/trash', auth_1.isAuthenticated, auth_1.isAdmin, require('../controllers/userController').moveToTrash);
router.post('/:id/restore', auth_1.isAuthenticated, auth_1.isAdmin, require('../controllers/userController').restoreFromTrash);
router.delete('/:id', auth_1.isAuthenticated, auth_1.isAdmin, require('../controllers/userController').deletePermanently);
router.get('/:id', auth_1.isAuthenticated, auth_1.isAdmin, userController_1.getUser);
router.put('/:id', auth_1.isAuthenticated, auth_1.isAdmin, (0, validation_1.validate)([
    (0, express_validator_1.body)('email').optional({ nullable: true }).isEmail().withMessage('Invalid email'),
    (0, express_validator_1.body)('role').optional({ nullable: true }).isIn(['client', 'admin']).withMessage('Invalid role'),
    (0, express_validator_1.body)('height').optional({ nullable: true }).isNumeric().toFloat(),
    (0, express_validator_1.body)('weight').optional({ nullable: true }).isNumeric().toFloat(),
    (0, express_validator_1.body)('age').optional({ nullable: true }).isInt().toInt(),
    (0, express_validator_1.body)('planExpiresAt').optional({ nullable: true }).isISO8601().toDate(),
]), userController_1.updateUser);
router.post('/profile', auth_1.isAuthenticated, userController_1.updateProfile);
exports.default = router;

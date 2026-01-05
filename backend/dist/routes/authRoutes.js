"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.post('/logout', authController_1.logout);
router.post('/register', (0, validation_1.validate)([
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('lastName').notEmpty().withMessage('Last name is required'),
]), authController_1.register);
router.post('/login', (0, validation_1.validate)([
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
]), authController_1.login);
router.post('/recover/question', (0, validation_1.validate)([
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email')
]), 
// We need to import getQuestion. For now, inline it or import from controller (which I need to update imports for)
// Let's rely on importing from controller
require('../controllers/authController').getQuestion);
router.post('/recover/verify', (0, validation_1.validate)([
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email'),
    (0, express_validator_1.body)('answer').notEmpty().withMessage('Answer is required')
]), require('../controllers/authController').recover);
router.post('/reset-password', (0, validation_1.validate)([
    (0, express_validator_1.body)('token').notEmpty().withMessage('Token is required'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]), require('../controllers/authController').reset);
router.get('/me', auth_1.isAuthenticated, authController_1.me);
exports.default = router;

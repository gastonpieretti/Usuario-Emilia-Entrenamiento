"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dietController_1 = require("../controllers/dietController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.get('/', auth_1.isAuthenticated, dietController_1.getDiets);
router.post('/', auth_1.isAuthenticated, auth_1.isAdmin, (0, validation_1.validate)([
    (0, express_validator_1.body)('userId').isInt().withMessage('User ID must be an integer'),
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
]), dietController_1.createDiet);
router.put('/:id', auth_1.isAuthenticated, auth_1.isAdmin, (0, validation_1.validate)([
    (0, express_validator_1.body)('title').optional().notEmpty(),
]), dietController_1.updateDiet);
router.delete('/:id', auth_1.isAuthenticated, auth_1.isAdmin, dietController_1.deleteDiet);
exports.default = router;

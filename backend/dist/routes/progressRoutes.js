"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const progressController_1 = require("../controllers/progressController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.get('/', auth_1.isAuthenticated, progressController_1.getProgress);
router.post('/', auth_1.isAuthenticated, (0, validation_1.validate)([
    (0, express_validator_1.body)('weight').isNumeric().withMessage('Weight must be a number'),
    (0, express_validator_1.body)('waist').optional().isNumeric(),
    (0, express_validator_1.body)('legs').optional().isNumeric(),
    (0, express_validator_1.body)('hips').optional().isNumeric(),
]), progressController_1.createProgress);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiController_1 = require("../controllers/aiController");
const router = (0, express_1.Router)();
// Endpoint para obtener motivación emocional (protegido por auth TEMPORALMENTE DESHABILITADO PARA DEBUG)
router.post('/motivation', aiController_1.getMotivation);
exports.default = router;

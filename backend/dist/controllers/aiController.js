"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMotivation = void 0;
const aiService_1 = require("../services/aiService");
const getMotivation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre_usuario, objetivo_emocional } = req.body;
        if (!nombre_usuario || !objetivo_emocional) {
            return res.status(400).json({ error: 'nombre_usuario y objetivo_emocional son requeridos.' });
        }
        const response = yield (0, aiService_1.getMotivationalResponse)(nombre_usuario, objetivo_emocional);
        res.json({ message: response });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getMotivation = getMotivation;

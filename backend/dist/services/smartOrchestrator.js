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
exports.SmartOrchestrator = exports.calculateTMB = exports.calculateBMI = void 0;
const prisma_1 = require("../lib/prisma");
const calculateBMI = (weight, heightCm) => {
    const heightM = heightCm / 100;
    return parseFloat((weight / (heightM * heightM)).toFixed(2));
};
exports.calculateBMI = calculateBMI;
/**
 * TMB (Tasa Metabólica Basal) - Mifflin-St Jeor
 * Rule: Bloque Biométrico (Pasos 1-5, 25-29)
 */
const calculateTMB = (data) => {
    const { gender, weight_kg, height_cm, age } = data;
    let tmb = 0;
    if (gender === 'HOMBRE' || gender === 'MASCULINO') {
        tmb = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5;
    }
    else {
        tmb = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161;
    }
    return Math.round(tmb);
};
exports.calculateTMB = calculateTMB;
exports.SmartOrchestrator = {
    processOnboarding(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const bmi = (0, exports.calculateBMI)(data.weight_kg, data.height_cm);
            const tmb = (0, exports.calculateTMB)(data);
            // Protocolo de Riesgo: Si el IMC es >= 30, activa apto_sobrepeso
            const aptoSobrepeso = bmi >= 30;
            // TDEE and Goal Adjustment (Simplified implementation of motor_nutricional)
            // Note: For real TDEE we also use activity factor (Step 6)
            const tdee = tmb * 1.375; // Baseline activity factor
            const goalAdjustment = (data.goal === 'Grasa' || data.goal === 'quema_grasa') ? 0.8 : (data.goal === 'Músculo' ? 1.1 : 1.0);
            const targetCalories = Math.round(tdee * goalAdjustment);
            // Update User Profile with new data
            yield prisma_1.prisma.userProfile.upsert({
                where: { userId },
                create: {
                    userId,
                    gender: data.gender,
                    age: data.age,
                    height_cm: data.height_cm,
                    weight_kg: data.weight_kg,
                    goal: data.goal,
                    experienceLevel: data.experienceLevel,
                    daysPerWeek: data.daysPerWeek,
                    sessionDurationMin: data.sessionDurationMin,
                    trainingLocation: data.trainingLocation,
                    equipment: data.equipment,
                    painRodilla: data.painRodilla || ((_a = data.sensitive_areas) === null || _a === void 0 ? void 0 : _a.includes('rodilla')),
                    painColumna: data.painColumna || ((_b = data.sensitive_areas) === null || _b === void 0 ? void 0 : _b.includes('espalda')),
                    painHombro: data.painHombro || ((_c = data.sensitive_areas) === null || _c === void 0 ? void 0 : _c.includes('hombro')),
                    targetWeight: data.targetWeight, // New field for projection
                    aptoSobrepeso: aptoSobrepeso,
                    mealsPerDay: data.mealsPerDay || 4,
                    dietPreference: data.dietPreference || 'TODO'
                },
                update: {
                    gender: data.gender,
                    age: data.age,
                    height_cm: data.height_cm,
                    weight_kg: data.weight_kg,
                    goal: data.goal,
                    experienceLevel: data.experienceLevel,
                    daysPerWeek: data.daysPerWeek,
                    sessionDurationMin: data.sessionDurationMin,
                    trainingLocation: data.trainingLocation,
                    equipment: data.equipment,
                    painRodilla: data.painRodilla || ((_d = data.sensitive_areas) === null || _d === void 0 ? void 0 : _d.includes('rodilla')),
                    painColumna: data.painColumna || ((_e = data.sensitive_areas) === null || _e === void 0 ? void 0 : _e.includes('espalda')),
                    painHombro: data.painHombro || ((_f = data.sensitive_areas) === null || _f === void 0 ? void 0 : _f.includes('hombro')),
                    targetWeight: data.targetWeight,
                    aptoSobrepeso: aptoSobrepeso
                }
            });
            // Initialize Gamification Level 1
            yield prisma_1.prisma.user.update({
                where: { id: userId },
                data: { hasCompletedOnboarding: true }
            });
            return {
                bmi,
                tmb,
                targetCalories,
                aptoSobrepeso,
                message: aptoSobrepeso ? "Protocolo Sobrepeso Activado: Filtrando impacto ALTO" : "Protocolo Estándar Activo"
            };
        });
    }
};

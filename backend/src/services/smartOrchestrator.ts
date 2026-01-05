import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

export interface OnboardingData {
    gender: 'HOMBRE' | 'MUJER';
    age: number;
    height_cm: number;
    weight_kg: number;
    goal: 'Músculo' | 'Grasa' | 'Salud';
    experienceLevel: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
    daysPerWeek: number;
    sessionDurationMin: number;
    trainingLocation: 'CASA' | 'GIMNASIO';
    equipment: string[];
    painRodilla: boolean;
    painColumna: boolean;
    painHombro: boolean;
    // ... other 35-step fields
}

export const calculateBMI = (weight: number, heightCm: number) => {
    const heightM = heightCm / 100;
    return parseFloat((weight / (heightM * heightM)).toFixed(2));
};

/**
 * TMB (Tasa Metabólica Basal) - Mifflin-St Jeor
 * Rule: Bloque Biométrico (Pasos 1-5, 25-29)
 */
export const calculateTMB = (data: any) => {
    const { gender, weight_kg, height_cm, age } = data;
    let tmb = 0;

    if (gender === 'HOMBRE' || gender === 'MASCULINO') {
        tmb = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5;
    } else {
        tmb = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161;
    }
    return Math.round(tmb);
};

export const SmartOrchestrator = {
    async processOnboarding(userId: number, data: any) {
        const bmi = calculateBMI(data.weight_kg, data.height_cm);
        const tmb = calculateTMB(data);

        // Protocolo de Riesgo: Si el IMC es >= 30, activa apto_sobrepeso
        const aptoSobrepeso = bmi >= 30;

        // TDEE and Goal Adjustment (Simplified implementation of motor_nutricional)
        // Note: For real TDEE we also use activity factor (Step 6)
        const tdee = tmb * 1.375; // Baseline activity factor
        const goalAdjustment = (data.goal === 'Grasa' || data.goal === 'quema_grasa') ? 0.8 : (data.goal === 'Músculo' ? 1.1 : 1.0);
        const targetCalories = Math.round(tdee * goalAdjustment);

        // Update User Profile with new data
        await prisma.userProfile.upsert({
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
                painRodilla: data.painRodilla || data.sensitive_areas?.includes('rodilla'),
                painColumna: data.painColumna || data.sensitive_areas?.includes('espalda'),
                painHombro: data.painHombro || data.sensitive_areas?.includes('hombro'),
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
                painRodilla: data.painRodilla || data.sensitive_areas?.includes('rodilla'),
                painColumna: data.painColumna || data.sensitive_areas?.includes('espalda'),
                painHombro: data.painHombro || data.sensitive_areas?.includes('hombro'),
                targetWeight: data.targetWeight,
                aptoSobrepeso: aptoSobrepeso
            }
        });

        // Initialize Gamification Level 1
        await prisma.user.update({
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
    }
};

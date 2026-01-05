/**
 * NutritionPlanEngine
 * Aligned with motor_nutricional.json v1.0
 */

export interface NutritionPlan {
    calorias_objetivo: number;
    macros: {
        proteinas_g: number;
        carbohidratos_g: number;
        grasas_g: number;
    };
    estructura_diaria: string;
}

export const generateNutritionPlan = (
    sex: "HOMBRE" | "MUJER",
    weight: number,
    height: number,
    age: number,
    goal: "quema_grasa" | "recomposicion" | "salud",
    trainingDays: number
): NutritionPlan => {
    // 1. Calorías Base (Mifflin-St Jeor)
    let bmr = 0;
    if (sex === "HOMBRE") {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    // 2. Factor Actividad (Mapping based on training days)
    let activityFactor = 1.2;
    if (trainingDays === 3) activityFactor = 1.375;
    else if (trainingDays === 4) activityFactor = 1.45;
    else if (trainingDays >= 5) activityFactor = 1.55;

    const tdee = bmr * activityFactor;

    // 3. Ajuste según Objetivo (motor_nutricional.json)
    const adjustments: Record<string, number> = {
        "quema_grasa": 0.8, // -20%
        "recomposicion": 0.9, // -10%
        "salud": 1.0 // 0%
    };
    const targetCalories = tdee * (adjustments[goal] || 1.0);

    // 4. Macros pct (motor_nutricional.json)
    const distributions: Record<string, { p: number, c: number, g: number }> = {
        "quema_grasa": { p: 35, c: 30, g: 35 },
        "recomposicion": { p: 30, c: 40, g: 30 },
        "salud": { p: 25, c: 45, g: 30 }
    };

    const dist = distributions[goal] || distributions["salud"];

    const proteinG = (targetCalories * (dist.p / 100)) / 4;
    const carbG = (targetCalories * (dist.c / 100)) / 4;
    const fatG = (targetCalories * (dist.g / 100)) / 9;

    // 5. Estructura
    const structure = targetCalories >= 2000 ? "5_COMIDAS" : "4_COMIDAS";

    return {
        calorias_objetivo: Math.round(targetCalories),
        macros: {
            proteinas_g: Math.round(proteinG),
            carbohidratos_g: Math.round(carbG),
            grasas_g: Math.round(fatG)
        },
        estructura_diaria: structure
    };
};

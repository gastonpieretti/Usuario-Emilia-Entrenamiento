import { Request, Response } from 'express';
import { prisma } from '../index'; // Asegúrate de que la importación de prisma sea correcta según tu proyecto

export const updateProfile = async (req: Request, res: Response) => {
  try {
    // 1. Obtenemos el ID del usuario (asumiendo que tu sistema de autenticación lo pone en req.user)
    const userId = (req as any).user?.id; 

    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const data = req.body;

    // 2. LIMPIEZA DE DATOS (Ingeniería de datos)
    // Convertimos "3 días" -> 3 (Entero)
    const daysPerWeekInt = parseInt(data.daysPerWeek) || 0;
    
    // Convertimos "45 min" -> 45 (Entero)
    const sessionDurationInt = parseInt(data.sessionDurationMin) || 0;

    // Convertimos el array de salud a un texto para guardar en 'injuries' o 'healthConditionsDetail'
    // Ya que la base de datos no tiene un campo 'healthConditions' tipo array, usamos 'injuries' o concatenamos.
    // Estrategia: Guardamos todo el resumen de salud en el campo 'injuries' (Lesiones/Salud)
    let healthSummary = "";
    if (data.healthConditions && Array.isArray(data.healthConditions)) {
      healthSummary = data.healthConditions.join(', ');
    }
    if (data.medicationDetail) {
      healthSummary += `. Medicación: ${data.medicationDetail}`;
    }

    // 3. GUARDADO EN BASE DE DATOS
    const profile = await prisma.userProfile.upsert({
      where: { userId: Number(userId) },
      update: {
        // Datos Biométricos
        gender: data.gender,
        age: parseInt(data.age) || null,
        weight_kg: parseFloat(data.weight_kg) || null,
        height_cm: parseFloat(data.height_cm) || null,
        
        // Estilo de Vida
        dailyActivity: data.dailyActivity,
        sleepQuality: data.sleepQuality,
        stressLevel: data.stressLevel,
        
        // Entrenamiento
        goal: data.goal,
        trainingLocation: data.trainingLocation,
        experienceLevel: data.experienceLevel,
        daysPerWeek: daysPerWeekInt,
        sessionDurationMin: sessionDurationInt,
        
        // Mapeamos 'priorityArea' a 'goal' o un campo de notas si no existe específico, 
        // o lo guardamos en un campo JSON si tuvieras. Por ahora, asumimos que 'goal' es el principal.
        
        // Dolores (Booleanos)
        painColumna: data.painColumna,
        painHombro: data.painHombro,
        painRodilla: data.painRodilla,
        painCadera: data.painCadera,
        painTobillo: data.painTobillo,

        // Salud y Nutrición
        dietPreference: data.dietPreference,
        waterIntake: data.waterIntake,
        dislikedFood: data.dislikedFoods, // Ojo: en DB se llama 'dislikedFood' (singular) o 'dislikedFoods'? Revisa tu schema.
        
        // Aquí guardamos el resumen de salud
        injuries: healthSummary, 
      },
      create: {
        userId: Number(userId),
        gender: data.gender,
        age: parseInt(data.age) || null,
        weight_kg: parseFloat(data.weight_kg) || null,
        height_cm: parseFloat(data.height_cm) || null,
        dailyActivity: data.dailyActivity,
        sleepQuality: data.sleepQuality,
        stressLevel: data.stressLevel,
        goal: data.goal,
        trainingLocation: data.trainingLocation,
        experienceLevel: data.experienceLevel,
        daysPerWeek: daysPerWeekInt,
        sessionDurationMin: sessionDurationInt,
        painColumna: data.painColumna,
        painHombro: data.painHombro,
        painRodilla: data.painRodilla,
        painCadera: data.painCadera,
        painTobillo: data.painTobillo,
        dietPreference: data.dietPreference,
        waterIntake: data.waterIntake,
        dislikedFood: data.dislikedFoods,
        injuries: healthSummary,
      },
    });

    // 4. Actualizar el planType en la tabla User principal si cambió
    if (data.planType) {
        await prisma.user.update({
            where: { id: Number(userId) },
            data: { planType: data.planType } // Asegúrate que planType exista en User
        });
    }

    return res.json({ message: 'Perfil actualizado con éxito', profile });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return res.status(500).json({ error: 'Error interno del servidor al guardar perfil' });
  }
};

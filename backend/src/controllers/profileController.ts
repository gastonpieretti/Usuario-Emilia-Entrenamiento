import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    // 1. IMPORTANTE: Buscamos al usuario por su EMAIL
    // (El frontend debe enviar el email en el cuerpo de la petición)
    if (!data.email) {
      return res.status(400).json({ error: 'Falta el email para identificar al usuario.' });
    }

    // Buscamos el ID del usuario usando el email
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    
    if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado con ese email.' });
    }

    console.log(`📝 Guardando perfil para: ${data.email} (ID: ${user.id})`);

    // 2. Limpieza de datos (Convertir texto a números)
    const daysPerWeekInt = parseInt(data.daysPerWeek) || 0;
    const sessionDurationInt = parseInt(data.sessionDurationMin) || 0;

    // 3. Crear resumen de salud
    let healthSummary = "";
    if (data.healthConditions && Array.isArray(data.healthConditions)) {
      healthSummary = data.healthConditions.join(', ');
    }
    if (data.medicationDetail) {
      healthSummary += `. Medicación: ${data.medicationDetail}`;
    }

    // 4. GUARDADO EN BASE DE DATOS
    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        gender: data.gender,
        age: parseInt(data.age) || null,
        weight_kg: parseFloat(data.weight_kg) || null,
        height_cm: parseFloat(data.height_cm) || null,
        dailyActivity: data.dailyActivity,
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
        injuries: healthSummary, // Guardamos la salud aquí
        sleepQuality: data.sleepQuality,
        stressLevel: data.stressLevel,
      },
      create: {
        userId: user.id,
        gender: data.gender,
        age: parseInt(data.age) || null,
        weight_kg: parseFloat(data.weight_kg) || null,
        height_cm: parseFloat(data.height_cm) || null,
        dailyActivity: data.dailyActivity,
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
        sleepQuality: data.sleepQuality,
        stressLevel: data.stressLevel,
      },
    });

    // 5. Actualizamos el estado del usuario principal para avisar al Admin
    await prisma.user.update({
        where: { id: user.id },
        data: { 
            // Si tienes un campo de estado, podrías poner 'PENDING'
            // Por ahora aseguramos que el planType se guarde si venía en el form
            planType: data.planType || user.planType 
        }
    });

    return res.json({ message: 'Perfil guardado con éxito', profile });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return res.status(500).json({ error: 'Error interno del servidor al guardar perfil' });
  }
};

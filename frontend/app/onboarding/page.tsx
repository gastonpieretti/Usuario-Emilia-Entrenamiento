"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState<any>({
        // Module 1: Universal
        gender: '',
        age: 25,
        weight_kg: 70,
        height_cm: 170,
        dailyActivity: 'Moderada',
        goal: 'Grasa',

        // Module 2: Training
        trainingLocation: 'GIMNASIO',
        experienceLevel: 'PRINCIPIANTE',
        painHombros: false,
        painEspalda: false,
        painRodillas: false,
        painTobillos: false,
        painCadera: false,
        daysPerWeek: 3,
        sessionDurationMin: 60,

        // Module 3: Nutrition
        dietPreference: 'Equilibrada',
        happyFood: '',
        mealsPerDay: 4,
        dislikedFood: [] as string[],

        // Module 4: Wellness
        sleepQuality: 'Media',
        stressLevel: 'Baja',
    });

    // Plan-based step filtering
    const allSteps = useMemo(() => {
        // CORRECCIÓN 1: Evitar error de tipo User
        const planType = (user as any)?.planType || 'COMPLETO';

        const module1 = [
            { id: 'gender', title: '¿Cuál es tu sexo biológico?', type: 'select', options: ['HOMBRE', 'MUJER'] },
            { id: 'age', title: '¿Qué edad tenés?', type: 'number', min: 14, max: 99 },
            { id: 'weight_kg', title: '¿Cuál es tu peso actual? (kg)', type: 'number', min: 30, max: 200 },
            { id: 'height_cm', title: '¿Cuánto medís? (cm)', type: 'number', min: 100, max: 220 },
            { id: 'dailyActivity', title: 'En tu día a día, ¿cuánto te movés?', type: 'select', options: ['Sedentario', 'Moderada', 'Muy Activo'] },
            { id: 'goal', title: '¿Cuál es tu objetivo principal?', type: 'select', options: ['Grasa', 'Músculo', 'Salud'] },
        ];

        const module2 = [
            { id: 'trainingLocation', title: '¿Dónde vas a entrenar?', type: 'select', options: ['GIMNASIO', 'CASA'] },
            { id: 'experienceLevel', title: '¿Qué experiencia tenés con el ejercicio?', type: 'select', options: ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'] },
            { id: 'pains', title: '¿Tenés alguna molestia o lesión?', type: 'pains' },
            { id: 'daysPerWeek', title: '¿Cuántos días por semana querés entrenar?', type: 'number', min: 1, max: 7 },
            { id: 'sessionDurationMin', title: '¿Cuánto tiempo tenés por sesión? (min)', type: 'number', min: 20, max: 120 },
        ];

        const module3 = [
            { id: 'dietPreference', title: '¿Seguís alguna preferencia alimentaria?', type: 'select', options: ['Equilibrada', 'Vegetariana', 'Vegana', 'Keto'] },
            { id: 'happyFood', title: '¿Cuál es tu "comida de la felicidad"? (Regla 80/20)', type: 'text', placeholder: 'Ej: Pizza, Chocolate, Sushi...' },
            { id: 'mealsPerDay', title: '¿Cuántas comidas hacés al día?', type: 'number', min: 2, max: 6 },
        ];

        const module4 = [
            { id: 'sleepQuality', title: '¿Cómo calificarías tu calidad de sueño?', type: 'select', options: ['Baja', 'Media', 'Alta'] },
            { id: 'stressLevel', title: '¿Cómo es tu nivel de estrés diario?', type: 'select', options: ['Baja', 'Media', 'Alta'] },
        ];

        // CORRECCIÓN 2: Tipado explícito ': any[]' para que compile siempre
        let filteredSteps: any[] = [...module1];

        if (planType === 'COMPLETO') {
            filteredSteps = [...module1, ...module2, ...module3, ...module4];
        } else if (planType === 'PROGRAMA DE ENTRENAMIENTO') {
            filteredSteps = [...module1, ...module2, ...module4];
        } else if (planType === 'PROGRAMA NUTRICIONAL') {
            filteredSteps = [...module1, ...module3, ...module4];
        }

        return [...filteredSteps, { id: 'final', title: '¡Todo listo!', type: 'confirm' }];
    }, [user]);

    const currentStepConfig = allSteps[step];

    const handleChange = (name: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        if (step < allSteps.length - 1) {
            setStep(step + 1);
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleFinalSubmit = async () => {
        setLoading(true);
        try {
            // CORRECCIÓN 3: Obtener ID del usuario y enviarlo en la URL
            const userId = (user as any)?.id;
            
            if (!userId) {
                throw new Error("No se pudo identificar al usuario. Por favor recarga la página.");
            }

            // Enviamos PUT a /profile/ID
            await api.put(`/profile/${userId}`, { ...formData, isFinalStep: true });
            setSubmitted(true);
        } catch (error) {
            console.error('Error saving profile', error);
            alert('Error al guardar tus datos. Puede que tu sesión haya expirado, intenta iniciar sesión de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center space-y-8">
                    <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto">
                        <Check className="text-white w-10 h-10" strokeWidth={3} />
                    </div>
                    <h2 className="text-4xl font-light tracking-tight text-gray-900 uppercase">Perfil Creado</h2>
                    <p className="text-gray-500 font-light text-lg">Tu plan personalizado está siendo procesado por Emilia.</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full h

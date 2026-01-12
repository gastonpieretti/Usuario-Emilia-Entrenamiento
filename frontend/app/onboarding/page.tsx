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

        let filteredSteps = [...module1];

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
            await api.post('/users/profile', { ...formData, isFinalStep: true });
            setSubmitted(true);
        } catch (error) {
            console.error('Error saving profile', error);
            alert('Error al guardar tus datos. Por favor reintentá.');
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
                        className="w-full h-16 bg-black text-white rounded-full font-medium text-lg hover:bg-gray-800 transition-all uppercase tracking-widest"
                    >
                        Acceder al Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans selection:bg-gray-100 relative">
            {/* Progress indicator */}
            <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-50 z-50">
                <motion.div
                    className="h-full bg-black transition-all"
                    initial={{ width: 0 }}
                    animate={{ width: `${((step + 1) / allSteps.length) * 100}%` }}
                />
            </div>

            <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
                <div className="max-w-xl w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="space-y-12"
                        >
                            <header className="space-y-6">
                                <span className="text-gray-300 font-light tracking-[0.4em] text-xs uppercase block">
                                    Pregunta {step + 1} de {allSteps.length}
                                </span>
                                <h1 className="text-4xl md:text-5xl font-light text-gray-900 leading-[1.1] tracking-tight">
                                    {currentStepConfig.title}
                                </h1>
                            </header>

                            <div className="space-y-4">
                                {currentStepConfig.type === 'select' && (
                                    <div className="grid grid-cols-1 gap-3">
                                        {currentStepConfig.options?.map((opt: string) => (
                                            <button
                                                key={opt}
                                                onClick={() => {
                                                    handleChange(currentStepConfig.id, opt);
                                                    setTimeout(handleNext, 300);
                                                }}
                                                className={`h-20 rounded-2xl text-left px-8 transition-all border font-light text-xl flex items-center justify-between ${formData[currentStepConfig.id] === opt ? 'bg-black text-white border-black' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {currentStepConfig.type === 'number' && (
                                    <div className="flex flex-col items-center space-y-8">
                                        <input
                                            type="number"
                                            value={formData[currentStepConfig.id]}
                                            onChange={(e) => handleChange(currentStepConfig.id, parseInt(e.target.value))}
                                            className="w-full bg-transparent border-b-2 border-gray-100 text-7xl font-light text-center focus:outline-none focus:border-black transition-all py-4"
                                            autoFocus
                                        />
                                        <button onClick={handleNext} className="h-16 px-12 bg-black text-white rounded-full font-medium uppercase tracking-widest text-sm">Continuar</button>
                                    </div>
                                )}

                                {currentStepConfig.type === 'text' && (
                                    <div className="flex flex-col space-y-8">
                                        <input
                                            type="text"
                                            placeholder={currentStepConfig.placeholder}
                                            value={formData[currentStepConfig.id]}
                                            onChange={(e) => handleChange(currentStepConfig.id, e.target.value)}
                                            className="w-full bg-transparent border-b-2 border-gray-100 text-3xl font-light focus:outline-none focus:border-black transition-all py-4"
                                            autoFocus
                                        />
                                        <button onClick={handleNext} className="h-16 px-12 bg-black text-white rounded-full font-medium uppercase tracking-widest text-sm self-end">Continuar</button>
                                    </div>
                                )}

                                {currentStepConfig.type === 'pains' && (
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { id: 'painHombros', label: 'Hombros' },
                                            { id: 'painEspalda', label: 'Espalda / Columna' },
                                            { id: 'painRodillas', label: 'Rodillas' },
                                            { id: 'painTobillos', label: 'Tobillos' },
                                            { id: 'painCadera', label: 'Cadera' }
                                        ].map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => handleChange(p.id, !formData[p.id])}
                                                className={`h-20 rounded-2xl px-8 transition-all border flex items-center justify-between ${formData[p.id] ? 'bg-black text-white border-black' : 'bg-white border-gray-100'}`}
                                            >
                                                <span className="text-xl font-light">{p.label}</span>
                                                {formData[p.id] && <Check size={20} />}
                                            </button>
                                        ))}
                                        <button onClick={handleNext} className="h-16 mt-4 w-full bg-black text-white rounded-full font-medium uppercase tracking-widest text-sm">Listo, Continuar</button>
                                    </div>
                                )}

                                {currentStepConfig.type === 'confirm' && (
                                    <div className="space-y-12">
                                        <div className="p-8 border rounded-3xl space-y-6">
                                            <div className="flex items-start gap-4 text-gray-600 font-light text-lg italic">
                                                <AlertCircle className="shrink-0 text-gray-300" />
                                                <p>Al confirmar, tu información se enviará para generar tu plan personalizado en Emilia.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleFinalSubmit}
                                            disabled={loading}
                                            className="w-full h-20 bg-black text-white rounded-full font-medium text-xl hover:bg-gray-800 transition-all uppercase tracking-widest shadow-xl flex items-center justify-center gap-3"
                                        >
                                            {loading ? 'Procesando...' : 'Confirmar Datos'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Navigation buttons */}
            <footer className="p-6 md:p-12 flex justify-between items-center bg-white/80 backdrop-blur-sm fixed bottom-0 left-0 w-full">
                <button
                    onClick={handleBack}
                    className={`p-4 rounded-full border border-gray-100 hover:bg-gray-50 transition-all ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex gap-2">
                    {allSteps.map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === step ? 'bg-black scale-125' : 'bg-gray-200'}`} />
                    ))}
                </div>
                <div className="w-12" /> {/* alignment spacer */}
            </footer>
        </div>
    );
}

"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../utils/api';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState<any>({
        // BLOQUE 1
        gender: 'MUJER',
        age_range: '25-34',
        mainGoal: 'Grasa',
        currentShape: '',
        desiredShape: '',

        // BLOQUE 2
        currentActivity: 'Baja',
        physicalHistory: 'Ninguna',
        daysPerWeek: 4,
        sessionDurationMin: 60,
        preferredSchedule: 'Mañana',

        // BLOQUE 3
        trainingLocation: 'GIMNASIO',
        equipment: [] as string[],
        splitPreference: 'Full Body',
        valueGraph: { aesthetic: 50, health: 50, performance: 50 },
        priorityMuscles: [] as string[],

        // BLOQUE 4
        painRodilla: false,
        painColumna: false,
        painHombro: false,
        injuriesDescription: '',
        motivationLevel: 8,
        pastBarriers: [] as string[],
        dailyActivity: 'Moderada',
        energyLevel: 'Media',
        sleepQuality: 'Media',
        hydration: 'Media',
        anxietyLevel: 'Baja',

        // BLOQUE 5
        fatPercentage: 20,
        height_cm: 170,
        weight_kg: 70,
        target_weight_kg: 65,
        exactAge: 30,
        importantEvent: '',
        timeframe: '12 semanas',
        dietPreference: 'Equilibrada',
        dislikedFood: [] as string[],
        mealsPerDay: 4,
        email: ''
    });

    const handleChange = (name: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const toggleArrayItem = (name: string, item: string) => {
        setFormData((prev: any) => {
            const current = prev[name] || [];
            if (current.includes(item)) {
                return { ...prev, [name]: current.filter((i: string) => i !== item) };
            } else {
                return { ...prev, [name]: [...current, item] };
            }
        });
    };

    // Client-side calculations
    const bmi = useMemo(() => {
        if (!formData.height_cm || !formData.weight_kg) return 0;
        const heightM = formData.height_cm / 100;
        return parseFloat((formData.weight_kg / (heightM * heightM)).toFixed(1));
    }, [formData.height_cm, formData.weight_kg]);

    const calories = useMemo(() => {
        if (!formData.weight_kg || !formData.height_cm || !formData.exactAge) return 0;
        let tmb = 0;
        if (formData.gender === 'HOMBRE') {
            tmb = (10 * formData.weight_kg) + (6.25 * formData.height_cm) - (5 * formData.exactAge) + 5;
        } else {
            tmb = (10 * formData.weight_kg) + (6.25 * formData.height_cm) - (5 * formData.exactAge) - 161;
        }
        const factor = formData.mainGoal === 'Grasa' ? 0.8 : 1.0;
        return Math.round(tmb * factor);
    }, [formData]);

    const handleFinalSubmit = async () => {
        setLoading(true);
        try {
            await api.post('/users/profile', { ...formData, isFinalStep: true });
            setSubmitted(true);
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Error saving profile', error);
            alert('Error al procesar tu plan. Por favor verifica tus datos.');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        // BLOQUE 1
        { id: 1, title: 'Género', field: 'gender', type: 'select', options: ['HOMBRE', 'MUJER'] },
        { id: 2, title: 'Rango de Edad', field: 'age_range', type: 'select', options: ['18-24', '25-34', '35-44', '45+'] },
        { id: 3, title: 'Objetivo Principal', field: 'mainGoal', type: 'select', options: ['Músculo', 'Grasa', 'Salud'] },
        { id: 4, title: 'Forma Corporal Actual', field: 'currentShape', type: 'select', options: ['Delgado', 'Promedio', 'Robusto'] },
        { id: 5, title: 'Cuerpo Deseado', field: 'desiredShape', type: 'select', options: ['Atlético', 'Musculoso', 'Definido'] },

        // BLOQUE 2
        { id: 6, title: 'Frecuencia de ejercicio actual', field: 'currentActivity', type: 'select', options: ['Baja', 'Media', 'Alta'] },
        { id: 7, title: 'Historial Físico', field: 'physicalHistory', type: 'text', placeholder: 'Experiencia previa...' },
        { id: 8, title: 'Frecuencia Semanal Deseada', field: 'daysPerWeek', type: 'number', min: 1, max: 6 },
        { id: 9, title: 'Duración de Sesión (Min)', field: 'sessionDurationMin', type: 'number', min: 30, max: 120 },
        { id: 10, title: 'Horario Preferido', field: 'preferredSchedule', type: 'select', options: ['Mañana', 'Tarde', 'Noche'] },

        // BLOQUE 3
        { id: 11, title: 'Entorno de Entrenamiento', field: 'trainingLocation', type: 'select', options: ['CASA', 'GIMNASIO'] },
        { id: 12, title: 'Equipamiento Disponible', field: 'equipment', type: 'multi', options: ['NINGUNO', 'MANCUERNAS', 'BANDAS', 'BARRA', 'MAQUINAS'] },
        { id: 13, title: 'Preferencia de División', field: 'splitPreference', type: 'select', options: ['Coach Choice', 'Full Body', 'Empuje/Tirón'] },
        { id: 14, title: 'Prioridades Estéticas', field: 'priorityMuscles', type: 'multi', options: ['Hombros', 'Pecho', 'Espalda', 'Piernas', 'Brazos'] },
        { id: 15, title: 'Enfoque del Plan', field: 'splitPreference', type: 'select', options: ['Estética', 'Salud', 'Rendimiento'] },

        // BLOQUE 4
        { id: 16, title: 'Zonas Sensibles (Lesiones)', field: 'pains', type: 'pains' },
        { id: 17, title: 'Nivel de Motivación (1-10)', field: 'motivationLevel', type: 'range', min: 1, max: 10 },
        { id: 18, title: 'Barreras Pasadas', field: 'pastBarriers', type: 'multi', options: ['Falta de tiempo', 'Falta de guía', 'Dieta difícil'] },
        { id: 19, title: 'Actividad Diaria', field: 'dailyActivity', type: 'select', options: ['Sedentario', 'Moderada', 'Activo'] },
        { id: 20, title: 'Nivel de Energía', field: 'energyLevel', type: 'select', options: ['Baja', 'Media', 'Alta'] },
        { id: 21, title: 'Calidad del Sueño', field: 'sleepQuality', type: 'select', options: ['Baja', 'Media', 'Alta'] },
        { id: 22, title: 'Hidratación Diaria', field: 'hydration', type: 'select', options: ['Baja', 'Media', 'Alta'] },
        { id: 23, title: 'Ansiedad/Estrés', field: 'anxietyLevel', type: 'select', options: ['Baja', 'Media', 'Alta'] },

        // BLOQUE 5
        { id: 24, title: '% Grasa Estimado', field: 'fatPercentage', type: 'range', min: 5, max: 50 },
        { id: 25, title: 'Altura Exacta (cm)', field: 'height_cm', type: 'number' },
        { id: 26, title: 'Peso Actual (kg)', field: 'weight_kg', type: 'number' },
        { id: 27, title: 'Peso Objetivo (kg)', field: 'target_weight_kg', type: 'number' },
        { id: 28, title: 'Edad Exacta', field: 'exactAge', type: 'number' },
        { id: 29, title: 'Evento Importante', field: 'importantEvent', type: 'text', placeholder: 'Boda, Viaje, Competencia...' },
        { id: 30, title: 'Proyección Temporal', field: 'timeframe', type: 'select', options: ['4 semanas', '8 semanas', '12 semanas'] },
        { id: 31, title: 'Preferencia de Dieta', field: 'dietPreference', type: 'select', options: ['Equilibrada', 'Baja en Carbs', 'Vegana'] },
        { id: 32, title: 'Alimentos no deseados', field: 'dislikedFood', type: 'multi', options: ['Cebolla', 'Pescado', 'Lácteos'] },
        { id: 33, title: 'Comidas al día', field: 'mealsPerDay', type: 'number', min: 2, max: 6 },
        { id: 34, title: 'Tu Correo Electrónico', field: 'email', type: 'text' },
        { id: 35, title: 'Confirmación Final', field: 'final', type: 'confirm' }
    ];

    const currentStep = steps[step - 1];

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-[#1e293b]/50 backdrop-blur-3xl rounded-[3rem] p-12 text-center border border-white/10 shadow-2xl space-y-8">
                    <div className="w-24 h-24 bg-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-cyan-500/30">
                        <svg className="w-12 h-12 text-[#0f172a]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">¡CONTRATO ACTIVADO!</h2>
                    <div className="bg-cyan-500/10 p-6 rounded-2xl border border-cyan-500/20">
                        <p className="text-cyan-400 font-bold">Tu IMC: {bmi}</p>
                        <p className="text-cyan-400 font-bold">Meta Calórica: {calories} kcal</p>
                    </div>
                    <button onClick={() => router.push('/dashboard')} className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#0f172a] font-black py-5 rounded-2xl transition-all h-20 text-xl shadow-xl shadow-cyan-500/20">IR AL DASHBOARD</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white relative overflow-hidden">
            {/* BACKGROUND DECORATION */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-cyan-500 rounded-full blur-[180px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[180px]" />
            </div>

            {/* PROGRESS BAR */}
            <div className="fixed top-0 left-0 w-full h-1.5 bg-white/5 z-50">
                <div className="h-full bg-cyan-500 transition-all duration-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]" style={{ width: `${(step / 35) * 100}%` }} />
            </div>

            <main className="flex-1 flex items-center justify-center p-6 mt-4 relative z-10">
                <div className="max-w-xl w-full space-y-12">
                    <header className="space-y-4 text-center">
                        <span className="text-cyan-400 font-black tracking-[0.3em] text-xs uppercase opacity-70">
                            PASO {step} DE 35 — BLOQUE {Math.ceil(step / 7)}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight uppercase tracking-tight">
                            {currentStep.title}
                        </h1>
                    </header>

                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {currentStep.type === 'select' && (
                            <div className="grid grid-cols-1 gap-4">
                                {currentStep.options?.map((opt: string) => (
                                    <button
                                        key={opt}
                                        onClick={() => handleChange(currentStep.field, opt)}
                                        className={`p-6 rounded-2xl text-left transition-all border-2 font-black text-xl flex items-center justify-between group ${formData[currentStep.field] === opt ? 'bg-cyan-500 border-cyan-400 text-[#0f172a] shadow-2xl shadow-cyan-500/20' : 'bg-[#1e293b]/50 border-white/5 hover:border-cyan-500/30'}`}
                                    >
                                        {opt}
                                        <div className={`w-6 h-6 rounded-full border-2 transition-all ${formData[currentStep.field] === opt ? 'border-[#0f172a] bg-[#0f172a]' : 'border-white/10 group-hover:border-cyan-500/50'}`} />
                                    </button>
                                ))}
                            </div>
                        )}

                        {currentStep.type === 'multi' && (
                            <div className="grid grid-cols-2 gap-4">
                                {currentStep.options?.map((opt: string) => (
                                    <button
                                        key={opt}
                                        onClick={() => toggleArrayItem(currentStep.field, opt)}
                                        className={`p-6 rounded-2xl transition-all border-2 font-bold text-sm ${formData[currentStep.field]?.includes(opt) ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 outline outline-1 outline-cyan-500' : 'bg-[#1e293b]/50 border-white/5 text-slate-400'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}

                        {currentStep.type === 'number' && (
                            <div className="space-y-4">
                                <input
                                    type="number"
                                    min={currentStep.min}
                                    max={currentStep.max}
                                    value={formData[currentStep.field]}
                                    onChange={(e) => handleChange(currentStep.field, parseFloat(e.target.value))}
                                    className="w-full bg-[#1e293b]/50 border-2 border-white/5 rounded-3xl p-8 text-6xl font-black text-center text-cyan-400 focus:outline-none focus:border-cyan-500/50 transition-all shadow-inner"
                                />
                                {(currentStep.field === 'weight_kg' || currentStep.field === 'height_cm') && bmi > 0 && (
                                    <div className={`p-4 rounded-xl text-center font-bold transition-all ${bmi >= 30 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'}`}>
                                        IMC CALCULADO: {bmi} {bmi >= 30 && "⚠️ PROTOCOLO SOBREPESO ACTIVO"}
                                    </div>
                                )}
                            </div>
                        )}

                        {currentStep.type === 'pains' && (
                            <div className="space-y-4">
                                {[
                                    { f: 'painRodilla', l: 'DOLOR EN RODILLA' },
                                    { f: 'painColumna', l: 'DOLOR EN ESPALDA/COLUMNA' },
                                    { f: 'painHombro', l: 'DOLOR EN HOMBRO' }
                                ].map(p => (
                                    <button
                                        key={p.f}
                                        onClick={() => handleChange(p.f, !formData[p.f])}
                                        className={`w-full p-6 rounded-2xl border-2 flex items-center justify-between font-black transition-all ${formData[p.f] ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-[#1e293b]/50 border-white/5 text-slate-400'}`}
                                    >
                                        {p.l}
                                        <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center ${formData[p.f] ? 'bg-red-500 border-red-500 shadow-lg shadow-red-500/20' : 'border-white/10'}`}>
                                            {formData[p.f] && <span className="text-white text-xl">!</span>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {currentStep.type === 'range' && (
                            <div className="space-y-12 py-10">
                                <input
                                    type="range"
                                    min={currentStep.min}
                                    max={currentStep.max}
                                    value={formData[currentStep.field]}
                                    onChange={(e) => handleChange(currentStep.field, parseInt(e.target.value))}
                                    className="w-full h-4 bg-white/5 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                                <div className="text-8xl font-black text-center text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                                    {formData[currentStep.field]}
                                    <span className="text-2xl text-slate-500 ml-4 font-bold">{currentStep.field === 'fatPercentage' ? '%' : ''}</span>
                                </div>
                            </div>
                        )}

                        {currentStep.type === 'text' && (
                            <input
                                type="text"
                                placeholder={currentStep.placeholder}
                                value={formData[currentStep.field]}
                                onChange={(e) => handleChange(currentStep.field, e.target.value)}
                                className="w-full bg-[#1e293b]/50 border-2 border-white/5 rounded-3xl p-8 text-2xl font-black text-center text-cyan-400 focus:outline-none focus:border-cyan-500/50 transition-all shadow-inner"
                            />
                        )}

                        {currentStep.type === 'confirm' && (
                            <div className="bg-cyan-500/5 border-2 border-cyan-500/20 p-10 rounded-[2.5rem] space-y-6 text-center animate-in zoom-in duration-500">
                                <h3 className="text-2xl font-black text-cyan-400">TODO LISTO PARA EMPEZAR</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#0f172a] p-4 rounded-2xl">
                                        <p className="text-xs text-slate-500 font-black uppercase mb-1">IMC</p>
                                        <p className="text-2xl font-black text-white">{bmi}</p>
                                    </div>
                                    <div className="bg-[#0f172a] p-4 rounded-2xl">
                                        <p className="text-xs text-slate-500 font-black uppercase mb-1">CALORÍAS</p>
                                        <p className="text-2xl font-black text-white">{calories}</p>
                                    </div>
                                </div>
                                <p className="text-slate-400 font-medium leading-relaxed">Haz clic en el botón para generar tu primer mes de entrenamiento.</p>
                            </div>
                        )}
                    </div>

                    <footer className="flex gap-4 pt-4">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="h-20 px-10 rounded-2xl bg-white/5 font-black text-slate-400 hover:bg-white/10 transition-all border border-white/5 active:scale-95"
                            >
                                <svg className="w-6 h-6 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        )}
                        <button
                            onClick={step === 35 ? handleFinalSubmit : () => setStep(step + 1)}
                            disabled={loading}
                            className="flex-1 h-20 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-[#0f172a] font-black text-xl transition-all shadow-2xl shadow-cyan-500/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? "CONFIGURANDO..." : (step === 35 ? "INICIAR MI CAMBIO" : "SIGUIENTE")}
                            {!loading && step < 35 && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M9 5l7 7-7 7" /></svg>}
                        </button>
                    </footer>
                </div>
            </main>
        </div>
    );
}

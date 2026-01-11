"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Check, X } from 'lucide-react';

interface FormData {
    gender: string; age: string; weight_kg: string; height_cm: string;
    dailyActivity: string; goal: string; trainingLocation: string;
    experienceLevel: string; painColumna: boolean; painHombro: boolean;
    painRodilla: boolean; painCadera: boolean; painTobillo: boolean;
    dietPreference: string; sleepQuality: string; stressLevel: string;
    // Nuevos campos
    daysPerWeek: string; sessionDurationMin: string; 
    priorityArea: string; waterIntake: string;
}

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [planType, setPlanType] = useState('COMPLETO');
    const [isFinished, setIsFinished] = useState(false);
    const [error, setError] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        gender: '', age: '', weight_kg: '', height_cm: '',
        dailyActivity: '', goal: '', trainingLocation: '',
        experienceLevel: '', painColumna: false, painHombro: false,
        painRodilla: false, painCadera: false, painTobillo: false,
        dietPreference: '', sleepQuality: '', stressLevel: '',
        daysPerWeek: '', sessionDurationMin: '', priorityArea: '', waterIntake: ''
    });

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await fetch('/api/user/profile');
                const data = await res.json();
                if (data.planType) setPlanType(data.planType);
            } catch (err) { console.error(err); }
        };
        fetchPlan();
    }, []);

    const allSteps = [
        { id: 'gender', question: '¿Cuál es tu sexo biológico?', type: 'select', options: ['Femenino', 'Masculino'] },
        { id: 'age', question: '¿Cuántos años tienes?', type: 'number', placeholder: 'Edad' },
        { id: 'weight_kg', question: '¿Cuál es tu peso actual?', type: 'number', placeholder: 'kg' },
        { id: 'height_cm', question: '¿Cuál es tu altura?', type: 'number', placeholder: 'cm' },
        { id: 'dailyActivity', question: '¿Cómo es tu movimiento diario habitual?', type: 'select', options: ['Poco movimiento', 'Movimiento ligero', 'Muy activo'] },
        { id: 'goal', question: '¿Cuál es tu objetivo principal?', type: 'select', options: ['Pérdida de grasa', 'Ganancia de masa muscular', 'Recomposición'] },
        
        // ENTRENAMIENTO (Solo visible si el plan incluye entrenamiento)
        { id: 'trainingLocation', question: '¿Dónde entrenaras?', type: 'select', options: ['Gimnasio', 'Casa (mancuernas, bandas)', 'Mixto'], condition: 'ENTRENAMIENTO' },
        { id: 'daysPerWeek', question: '¿Con qué frecuencia deseas entrenar?', type: 'select', options: ['1 día x semana', '2 días', '3 días', '4 días', '5 días', '6 días'], condition: 'ENTRENAMIENTO' },
        { id: 'sessionDurationMin', question: '¿Cuánto tiempo quieres que duren tus entrenamientos?', type: 'select', options: ['30 min', '45 min', '60 min', '75 min'], condition: 'ENTRENAMIENTO' },
        { id: 'priorityArea', question: '¿A qué parte del cuerpo te interesa darle prioridad?', type: 'select', options: ['Glúteos', 'Piernas', 'Abdomen', 'Tren Superior', 'Todo'], condition: 'ENTRENAMIENTO' },
        { id: 'experienceLevel', question: '¿Cuál es tu experiencia previa?', type: 'select', options: ['Principiante', 'Intermedio', 'Avanzado'], condition: 'ENTRENAMIENTO' },
        { id: 'pains', question: '¿Tienes algún dolor o limitación?', type: 'checkbox', options: [
            { label: 'Columna', id: 'painColumna' }, { label: 'Hombros', id: 'painHombro' },
            { label: 'Rodillas', id: 'painRodilla' }, { label: 'Cadera', id: 'painCadera' },
            { label: 'Tobillos', id: 'painTobillo' }
        ], condition: 'ENTRENAMIENTO' },

        // DIETA (Solo visible si el plan incluye nutrición)
        { id: 'dietPreference', question: '¿Tienes alguna preferencia al comer?', type: 'select', options: ['Como de todo', 'Vegetariano', 'Sin gluten', 'Otras'], condition: 'DIETA' },
        { id: 'waterIntake', question: '¿Cuánta agua bebes diariamente?', type: 'select', options: ['Menos de 1 litro', '1 a 2 litros', '2 a 3 litros', 'Más de 3 litros'], condition: 'DIETA' },

        // BIENESTAR (Universal)
        { id: 'sleepQuality', question: '¿Cómo describirías tu descanso?', type: 'select', options: ['Mal', 'Regular', 'Bien', 'Excelente'] },
        { id: 'stressLevel', question: '¿Cuál es tu nivel de estrés habitual?', type: 'select', options: ['Bajo', 'Moderado', 'Alto'] }
    ];

    const filteredSteps = allSteps.filter(s => {
        if (!s.condition) return true;
        if (planType === 'COMPLETO') return true;
        if (s.condition === 'DIETA' && planType === 'PROGRAMA NUTRICIONAL') return true;
        if (s.condition === 'ENTRENAMIENTO' && planType === 'PROGRAMA DE ENTRENAMIENTO') return true;
        return false;
    });

    const currentStepData = filteredSteps[step];

    const validateAndNext = () => {
        // Para dolores, siempre permitimos avanzar (puede no tener dolores)
        if (currentStepData.id === 'pains') { handleNext(); return; }

        const currentValue = (formData as any)[currentStepData.id];
        if (!currentValue || currentValue === '') {
            setError(true);
            return;
        }
        setError(false);
        handleNext();
    };

    const handleNext = () => {
        if (step < filteredSteps.length - 1) setStep(step + 1);
        else handleSubmit();
    };

    const handleBack = () => { if (step > 0) { setStep(step - 1); setError(false); } };

    const handleSubmit = async () => {
        setLoading(true);
        setTimeout(() => { setIsFinished(true); setLoading(false); }, 1500);
    };

    if (isFinished) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000">
                <div className="bg-white p-10 rounded-[2rem] shadow-xl max-w-sm w-full">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                        <Check className="text-green-600" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-[#343a40] mb-4">¡Felicitaciones!</h1>
                    <p className="text-lg font-normal text-[#6c757d] leading-relaxed">
                        Has completado todo el formulario. Te notificaremos una vez que tu plan esté elaborado.
                    </p>
                    <button onClick={() => router.push('/dashboard')} className="mt-10 w-full py-4 bg-[#5882ff] text-white rounded-xl font-bold shadow-lg hover:bg-[#4a6edb] transition-all">
                        Finalizar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
            {/* Header con Cerrar y Volver */}
            <div className="p-6 flex items-center justify-between">
                {step > 0 ? (
                    <button onClick={handleBack} className="flex items-center text-[#6c757d] hover:text-[#343a40]">
                        <ChevronLeft size={24} /> <span className="text-sm font-bold">Volver</span>
                    </button>
                ) : <div />}
                <button onClick={() => router.push('/dashboard')} className="p-2 bg-white rounded-full shadow-sm text-[#6c757d] hover:text-red-500 transition-all">
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_15px_40px_-12px_rgba(0,0,0,0.08)] space-y-10 animate-in fade-in slide-in-from-bottom-6">
                    <div className="space-y-2">
                        <span className="text-[#5882ff] font-bold text-sm tracking-widest uppercase">Paso {step + 1} de {filteredSteps.length}</span>
                        <h1 className="text-3xl font-bold text-[#343a40] leading-tight">
                            {currentStepData.question}
                        </h1>
                    </div>

                    <div className="space-y-4">
                        {currentStepData.type === 'select' && currentStepData.options?.map((opt) => (
                            <button
                                key={String(opt)}
                                onClick={() => { setFormData({...formData, [currentStepData.id]: opt}); setError(false); handleNext(); }}
                                className={`w-full p-5 text-left rounded-2xl border transition-all duration-300 text-lg font-semibold 
                                ${formData[currentStepData.id as keyof FormData] === opt 
                                    ? 'bg-[#5882ff] text-white border-[#5882ff] shadow-md' 
                                    : 'bg-white text-[#495057] border-[#f1f3f5] hover:border-[#ced4da] shadow-sm'}`}
                            >
                                {String(opt)}
                            </button>
                        ))}

                        {currentStepData.type === 'number' && (
                            <input 
                                type="number" 
                                autoFocus
                                className="w-full p-5 text-center text-5xl font-bold border-b-4 border-[#f1f3f5] focus:border-[#5882ff] outline-none transition-all text-[#343a40]"
                                placeholder={currentStepData.placeholder}
                                value={(formData as any)[currentStepData.id] || ''}
                                onChange={(e) => { setFormData({...formData, [currentStepData.id]: e.target.value}); setError(false); }}
                            />
                        )}

                        {currentStepData.type === 'checkbox' && currentStepData.options && (
                            <div className="grid grid-cols-1 gap-3">
                                {currentStepData.options.map((opt: any) => (
                                    <label key={opt.id} className={`flex items-center p-5 rounded-2xl border-2 transition-all cursor-pointer shadow-sm ${formData[opt.id as keyof FormData] ? 'border-[#5882ff] bg-blue-50' : 'border-[#f1f3f5] bg-white'}`}>
                                        <input type="checkbox" className="hidden" checked={formData[opt.id as keyof FormData] as boolean} onChange={() => setFormData({...formData, [opt.id]: !formData[opt.id as keyof FormData]})} />
                                        <div className={`w-6 h-6 rounded-md border-2 mr-4 flex items-center justify-center ${formData[opt.id as keyof FormData] ? 'bg-[#5882ff] border-[#5882ff]' : 'border-gray-200'}`}>
                                            {formData[opt.id as keyof FormData] && <Check size={16} className="text-white" strokeWidth={3} />}
                                        </div>
                                        <span className="text-lg font-bold text-[#495057]">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && <p className="text-red-500 text-sm font-bold text-center animate-bounce">⚠️ Debes seleccionar una opción para continuar</p>}

                    {currentStepData.type !== 'select' && (
                        <button onClick={validateAndNext} className="w-full py-5 bg-[#5882ff] text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-2xl transition-all active:scale-[0.98]">
                            Continuar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

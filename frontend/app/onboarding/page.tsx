"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Check } from 'lucide-react';

// Definimos la estructura para que TypeScript no se queje
interface FormData {
    gender: string;
    age: string;
    weight_kg: string;
    height_cm: string;
    dailyActivity: string;
    goal: string;
    trainingLocation: string;
    experienceLevel: string;
    painColumna: boolean;
    painHombro: boolean;
    painRodilla: boolean;
    painCadera: boolean;
    painTobillo: boolean;
    dietPreference: string;
    sleepQuality: string;
    stressLevel: string;
}

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [planType, setPlanType] = useState('COMPLETO');
    const [isFinished, setIsFinished] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        gender: '', age: '', weight_kg: '', height_cm: '',
        dailyActivity: '', goal: '', trainingLocation: '',
        experienceLevel: '', painColumna: false, painHombro: false,
        painRodilla: false, painCadera: false, painTobillo: false,
        dietPreference: '', sleepQuality: '', stressLevel: ''
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
        { id: 'dailyActivity', question: '¿Cómo es tu movimiento diario habitual?', detail: 'Dinos si pasas mucho tiempo sentado o si sueles caminar.', type: 'select', options: ['Poco movimiento', 'Movimiento ligero', 'Muy activo'] },
        { id: 'goal', question: '¿Cuál es tu objetivo principal?', detail: 'Define hacia dónde queremos ir con tu plan.', type: 'select', options: ['Pérdida de grasa', 'Ganancia de masa muscular', 'Recomposición'] },
        { id: 'trainingLocation', question: '¿Dónde entrenaras?', type: 'select', options: ['Gimnasio', 'Casa (mancuernas, bandas)', 'Mixto'], condition: 'ENTRENAMIENTO' },
        { id: 'experienceLevel', question: '¿Cuál es tu experiencia previa?', detail: 'Principiante, intermedio o avanzado.', type: 'select', options: ['Principiante', 'Intermedio', 'Avanzado'], condition: 'ENTRENAMIENTO' },
        { id: 'pains', question: '¿Tienes algún dolor o limitación?', detail: 'Selecciona las áreas con molestias recurrentes.', type: 'checkbox', options: [
            { label: 'Columna', id: 'painColumna' },
            { label: 'Hombros', id: 'painHombro' },
            { label: 'Rodillas', id: 'painRodilla' },
            { label: 'Cadera', id: 'painCadera' },
            { label: 'Tobillos', id: 'painTobillo' }
        ], condition: 'ENTRENAMIENTO' },
        { id: 'dietPreference', question: '¿Tienes alguna preferencia al comer?', type: 'select', options: ['Como de todo', 'Vegetariano', 'Sin gluten', 'Otras'], condition: 'DIETA' },
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

    const handleNext = () => {
        if (step < filteredSteps.length - 1) setStep(step + 1);
        else handleSubmit();
    };

    const handleBack = () => { if (step > 0) setStep(step - 1); };

    const handleSubmit = async () => {
        setLoading(true);
        setTimeout(() => { setIsFinished(true); setLoading(false); }, 1500);
    };

    if (isFinished) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-100">
                    <Check className="text-green-600" size={40} />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">¡Felicitaciones!</h1>
                <p className="text-xl font-light text-gray-500 leading-relaxed max-w-sm">
                    Has completado todo el formulario. Te notificaremos una vez que tu plan esté elaborado.
                </p>
                <button onClick={() => router.push('/dashboard')} className="mt-12 px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-2xl hover:bg-black transition-all active:scale-95">
                    Finalizar
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col text-gray-900 font-sans">
            {/* Header minimalista */}
            <div className="p-6 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50">
                {step > 0 ? (
                    <button onClick={handleBack} className="flex items-center text-gray-400 hover:text-gray-900 transition-all group">
                        <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" /> 
                        <span className="text-sm font-bold ml-1">Volver</span>
                    </button>
                ) : <div />}
                <div className="text-xs font-black text-gray-200 tracking-tighter uppercase italic">
                    Emilia Entrenamiento
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-xl mx-auto w-full">
                <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-extrabold text-center tracking-tight text-gray-900 leading-tight">
                            {currentStepData.question}
                        </h1>
                        {currentStepData.detail && (
                            <p className="text-gray-400 text-center font-light text-xl leading-relaxed">
                                {currentStepData.detail}
                            </p>
                        )}
                    </div>

                    <div className="space-y-4">
                        {currentStepData.type === 'select' && currentStepData.options?.map((opt) => (
                            <button
                                key={String(opt)}
                                onClick={() => { setFormData({...formData, [currentStepData.id]: opt}); handleNext(); }}
                                className="w-full p-6 text-left bg-white border border-gray-100 rounded-[2rem] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] hover:border-gray-200 transition-all duration-500 text-xl font-bold text-gray-800"
                            >
                                {String(opt)}
                            </button>
                        ))}

                        {currentStepData.type === 'number' && (
                            <div className="flex flex-col items-center">
                                <input 
                                    type="number" 
                                    autoFocus
                                    className="w-full max-w-[220px] p-6 text-center text-7xl font-black border-b-4 border-gray-100 focus:border-gray-900 outline-none transition-all placeholder:text-gray-50 bg-transparent"
                                    placeholder={currentStepData.placeholder}
                                    value={(formData as any)[currentStepData.id] || ''}
                                    onChange={(e) => setFormData({...formData, [currentStepData.id]: e.target.value})}
                                />
                            </div>
                        )}

                        {currentStepData.type === 'checkbox' && currentStepData.options && (
                            <div className="grid grid-cols-1 gap-4">
                                {currentStepData.options.map((opt: any) => (
                                    <label key={opt.id} className={`flex items-center p-6 rounded-[2rem] border-2 transition-all cursor-pointer shadow-sm ${formData[opt.id as keyof FormData] ? 'border-gray-900 bg-gray-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={formData[opt.id as keyof FormData] as boolean} 
                                            onChange={() => setFormData({...formData, [opt.id]: !formData[opt.id as keyof FormData]})}
                                        />
                                        <div className={`w-8 h-8 rounded-xl border-2 mr-5 flex items-center justify-center transition-all ${formData[opt.id as keyof FormData] ? 'bg-gray-900 border-gray-900 shadow-lg' : 'border-gray-200'}`}>
                                            {formData[opt.id as keyof FormData] && <Check size={20} className="text-white" strokeWidth={4} />}
                                        </div>
                                        <span className="text-2xl font-bold text-gray-800">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {currentStepData.type !== 'select' && (
                        <div className="pt-10">
                            <button 
                                onClick={handleNext}
                                className="w-full py-6 bg-gray-900 text-white rounded-[2rem] font-black text-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] hover:bg-black hover:shadow-[0_25px_60px_-10px_rgba(0,0,0,0.4)] active:scale-[0.97] transition-all"
                            >
                                {loading ? 'Preparando tu plan...' : 'Siguiente'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

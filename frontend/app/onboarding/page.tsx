"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Check, X, Stethoscope, Heart, Activity, Droplets } from 'lucide-react';

interface FormData {
    gender: string; age: string; weight_kg: string; height_cm: string;
    dailyActivity: string; goal: string; trainingLocation: string;
    experienceLevel: string; painColumna: boolean; painHombro: boolean;
    painRodilla: boolean; painCadera: boolean; painTobillo: boolean;
    dietPreference: string; waterIntake: string;
    daysPerWeek: string; sessionDurationMin: string; 
    priorityArea: string; dislikedFoods: string;
    // Salud Detallada
    healthConditions: string[];
    healthConditionsDetail: string;
    healthIsControlled: string;
    medicationDetail: string;
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
        dietPreference: '', waterIntake: '',
        daysPerWeek: '', sessionDurationMin: '', priorityArea: '', dislikedFoods: '',
        healthConditions: [], healthConditionsDetail: '', healthIsControlled: '', medicationDetail: ''
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
        { id: 'dailyActivity', question: '¿Cómo es tu movimiento diario habitual?', type: 'select', options: ['Sedentario', 'Ligera', 'Moderada', 'Intensa'] },
        { id: 'goal', question: '¿Cuál es tu objetivo principal?', type: 'select', options: ['Pérdida de grasa', 'Ganancia de masa muscular', 'Salud / Mantenerme'] },
        
        // ENTRENAMIENTO
        { id: 'trainingLocation', question: '¿Dónde entrenaras?', type: 'select', options: ['Gimnasio completo', 'Casa con mancuernas / bandas', 'Casa sin equipamiento'], condition: 'ENTRENAMIENTO' },
        { id: 'daysPerWeek', question: '¿Con qué frecuencia deseas entrenar?', type: 'select', options: ['2 días', '3 días', '4 días', '5 días', '6 días'], condition: 'ENTRENAMIENTO' },
        { id: 'sessionDurationMin', question: '¿Cuánto tiempo quieres que duren tus entrenamientos aprox.?', type: 'select', options: ['30 min', '45 min', '60 min', 'Más de 60 min'], condition: 'ENTRENAMIENTO' },
        { id: 'priorityArea', question: '¿A qué parte del cuerpo te interesa darle prioridad?', type: 'select', options: ['Glúteos', 'Piernas', 'Abdomen', 'Tren Superior', 'Todo'], condition: 'ENTRENAMIENTO' },
        { id: 'experienceLevel', question: '¿Cuál es tu experiencia previa?', type: 'select', options: ['Principiante', 'Intermedio', 'Avanzado'], condition: 'ENTRENAMIENTO' },
        { id: 'pains', question: '¿Tienes alguna limitación?', type: 'checkbox', options: [
            { label: 'Columna', id: 'painColumna' }, { label: 'Hombros', id: 'painHombro' },
            { label: 'Rodillas', id: 'painRodilla' }, { label: 'Cadera', id: 'painCadera' },
            { label: 'Tobillos', id: 'painTobillo' }
        ], condition: 'ENTRENAMIENTO' },

        // SALUD (Bloque Completo)
        { id: 'healthConditions', question: '¿Tenés alguna condición de salud diagnosticada?', type: 'health-grid', condition: 'UNIVERSAL' },

        // DIETA
        { id: 'dietPreference', question: '¿Tienes alguna preferencia al comer?', type: 'select', options: ['Omnívoro', 'Vegetariano', 'Vegano', 'Celíaco'], condition: 'DIETA' },
        { id: 'dislikedFoods', question: '¿Qué alimentos no te gustan?', detail: 'Estos alimentos serán excluidos de tu dieta automáticamente.', type: 'text', placeholder: 'Ej: cebolla, pescado...', condition: 'DIETA' },
        { id: 'waterIntake', question: '¿Cuánta agua bebes diariamente?', type: 'select', options: ['Menos de 1 litro', '1 a 2 litros', '2 a 3 litros', 'Más de 3 litros'], condition: 'DIETA' }
    ];

    const filteredSteps = allSteps.filter(s => {
        if (!s.condition || s.condition === 'UNIVERSAL') return true;
        if (planType === 'COMPLETO') return true;
        if (s.condition === 'DIETA' && planType === 'PROGRAMA NUTRICIONAL') return true;
        if (s.condition === 'ENTRENAMIENTO' && planType === 'PROGRAMA DE ENTRENAMIENTO') return true;
        return false;
    });

    const currentStepData = filteredSteps[step];

    const validateAndNext = () => {
        if (currentStepData.id === 'pains' || currentStepData.id === 'healthConditions') { handleNext(); return; }
        const val = (formData as any)[currentStepData.id];
        if (!val || val === '') { setError(true); return; }
        setError(false); handleNext();
    };

    const handleNext = () => {
        if (step < filteredSteps.length - 1) setStep(step + 1);
        else handleSubmit();
    };

    const handleSubmit = async () => {
        setLoading(true);
        // Lógica de WhatsApp e Insert en BD similar a la anterior
        const miNumero = "59899123456"; // Reemplaza por el tuyo
        const url = `https://wa.me/${miNumero}?text=${encodeURIComponent("Nuevo registro de " + formData.age + " años...")}`;
        setTimeout(() => { setIsFinished(true); setLoading(false); window.open(url, '_blank'); }, 1500);
    };

    if (isFinished) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-white p-10 rounded-[2rem] shadow-xl max-w-sm w-full">
                    <Check className="text-green-600 mx-auto mb-6" size={60} />
                    <h1 className="text-2xl font-bold mb-4 italic">¡Felicitaciones!</h1>
                    <p className="text-gray-500">Has completado todo el formulario. Te notificaremos una vez que tu plan esté elaborado.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans text-[#343a40]">
            <header className="p-6 flex justify-between items-center">
                {step > 0 ? <ChevronLeft onClick={() => setStep(step - 1)} className="cursor-pointer text-gray-400" /> : <div />}
                <X onClick={() => router.push('/dashboard')} className="cursor-pointer text-gray-400 hover:text-red-500" />
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl space-y-8">
                    <div className="space-y-2 text-center">
                        <p className="text-[#5882ff] font-bold text-xs tracking-widest uppercase">Paso {step + 1} de {filteredSteps.length}</p>
                        <h1 className="text-3xl font-extrabold">{currentStepData.question}</h1>
                        {currentStepData.detail && <p className="text-gray-400 font-light">{currentStepData.detail}</p>}
                    </div>

                    <div className="space-y-4">
                        {currentStepData.type === 'select' && currentStepData.options?.map((opt) => (
                            <button
                                key={String(opt)}
                                onClick={() => { setFormData({...formData, [currentStepData.id]: opt}); handleNext(); }}
                                className="w-full p-5 text-left rounded-2xl border-2 border-gray-50 bg-white shadow-sm hover:border-[#5882ff] hover:shadow-md font-bold transition-all"
                            >
                                {String(opt)}
                            </button>
                        ))}

                        {currentStepData.type === 'text' && (
                            <textarea 
                                className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:border-[#5882ff] outline-none min-h-[120px]"
                                placeholder={currentStepData.placeholder}
                                onChange={(e) => setFormData({...formData, [currentStepData.id]: e.target.value})}
                            />
                        )}

                        {currentStepData.type === 'health-grid' && (
                            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                                <HealthSection title="Metabólicas" icon={<Activity size={18}/>} options={['Diabetes 1', 'Diabetes 2', 'Insulina', 'Tiroides']} formData={formData} setFormData={setFormData} />
                                <HealthSection title="Cardiovasculares" icon={<Heart size={18}/>} options={['Hipertensión', 'Colesterol', 'Corazón']} formData={formData} setFormData={setFormData} />
                                <HealthSection title="Digestivas" icon={<Droplets size={18}/>} options={['Celíaco', 'Lactosa', 'Intestino Irritable', 'Gastritis']} formData={formData} setFormData={setFormData} />
                                
                                <div className="pt-4 space-y-4 border-t border-gray-100">
                                    <p className="font-bold">¿Controlado por un profesional?</p>
                                    <div className="flex gap-4">
                                        {['Sí', 'No'].map(o => (
                                            <button key={o} onClick={() => setFormData({...formData, healthIsControlled: o})} className={`flex-1 p-3 rounded-xl border-2 ${formData.healthIsControlled === o ? 'bg-blue-50 border-[#5882ff]' : 'border-gray-100'}`}>{o}</button>
                                        ))}
                                    </div>
                                    <input type="text" placeholder="¿Tomas medicación? (Nombre y dosis)" className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-[#5882ff] outline-none" onChange={(e) => setFormData({...formData, medicationDetail: e.target.value})} />
                                </div>
                            </div>
                        )}
                    </div>

                    {error && <p className="text-red-500 text-center font-bold animate-pulse">⚠️ Respuesta obligatoria</p>}

                    {currentStepData.type !== 'select' && (
                        <button onClick={validateAndNext} className="w-full py-5 bg-[#5882ff] text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-2xl transition-all">
                            Continuar
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
}

function HealthSection({ title, icon, options, formData, setFormData }: any) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#5882ff] font-bold uppercase text-xs tracking-tighter">
                {icon} <span>{title}</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
                {options.map((opt: string) => (
                    <label key={opt} className={`flex items-center p-3 rounded-xl border-2 transition-all cursor-pointer ${formData.healthConditions.includes(opt) ? 'border-[#5882ff] bg-blue-50' : 'border-gray-50 bg-gray-50/30'}`}>
                        <input type="checkbox" className="hidden" checked={formData.healthConditions.includes(opt)} onChange={() => {
                            const newConditions = formData.healthConditions.includes(opt) 
                                ? formData.healthConditions.filter((c: string) => c !== opt) 
                                : [...formData.healthConditions, opt];
                            setFormData({...formData, healthConditions: newConditions});
                        }} />
                        <div className={`w-5 h-5 rounded-md border-2 mr-3 flex items-center justify-center ${formData.healthConditions.includes(opt) ? 'bg-[#5882ff] border-[#5882ff]' : 'border-gray-200'}`}>
                            {formData.healthConditions.includes(opt) && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm font-medium">{opt}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

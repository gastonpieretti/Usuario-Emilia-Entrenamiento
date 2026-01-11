"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Check } from 'lucide-react'; // Iconos para diseño delicado

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [planType, setPlanType] = useState('COMPLETO');
    const [isFinished, setIsFinished] = useState(false);

    const [formData, setFormData] = useState({
        gender: '',
        age: '',
        weight_kg: '',
        height_cm: '',
        dailyActivity: '',
        goal: '',
        trainingLocation: '',
        experienceLevel: '',
        painColumna: false,
        painHombro: false,
        painRodilla: false,
        painCadera: false,
        painTobillo: false,
        dietPreference: '',
        sleepQuality: '',
        stressLevel: ''
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
        { id: 'dailyActivity', question: '¿Cómo es tu movimiento diario habitual?', detail: 'Dinos si pasas mucho tiempo sentado o si sueles caminar durante el día.', type: 'select', options: ['Poco movimiento', 'Movimiento ligero', 'Muy activo'] },
        { id: 'goal', question: '¿Cuál es tu objetivo principal?', detail: 'Define hacia dónde queremos ir con tu plan personalizado.', type: 'select', options: ['Pérdida de grasa', 'Ganancia de masa muscular', 'Recomposición'] },
        
        // ENTRENAMIENTO
        { id: 'trainingLocation', question: '¿Dónde entrenaras?', detail: 'Elige el lugar donde te sientas más cómodo.', type: 'select', options: ['Gimnasio', 'Casa (mancuernas, bandas)', 'Mixto'], condition: 'ENTRENAMIENTO' },
        { id: 'experienceLevel', question: '¿Cuál es tu experiencia previa?', detail: 'Ejemplo: "Caminaba hace años" o "Nunca usé pesas".', type: 'select', options: ['Principiante', 'Intermedio', 'Avanzado'], condition: 'ENTRENAMIENTO' },
        { id: 'pains', question: '¿Tienes algún dolor o limitación?', detail: 'Selecciona las áreas donde sientas molestias recurrentes.', type: 'checkbox', options: [
            { label: 'Columna', id: 'painColumna' },
            { label: 'Hombros', id: 'painHombro' },
            { label: 'Rodillas', id: 'painRodilla' },
            { label: 'Cadera', id: 'painCadera' },
            { label: 'Tobillos', id: 'painTobillo' }
        ], condition: 'ENTRENAMIENTO' },

        // NUTRICIÓN
        { id: 'dietPreference', question: '¿Tienes alguna preferencia al comer?', detail: 'Ejemplo: "No como carne roja" o "Soy celíaco".', type: 'select', options: ['Como de todo', 'Vegetariano', 'Sin gluten', 'Otras'], condition: 'DIETA' },

        // BIENESTAR
        { id: 'sleepQuality', question: '¿Cómo describirías tu descanso?', detail: 'Dormir bien es fundamental para recuperar energía.', type: 'select', options: ['Mal', 'Regular', 'Bien', 'Excelente'] },
        { id: 'stressLevel', question: '¿Cuál es tu nivel de estrés habitual?', detail: 'Nos ayuda a no sobrecargarte de trabajo.', type: 'select', options: ['Bajo', 'Moderado', 'Alto'] }
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
        // Simulación de envío
        setTimeout(() => { setIsFinished(true); setLoading(false); }, 1500);
    };

    if (isFinished) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <Check className="text-green-500" size={40} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Felicitaciones!</h1>
                <p className="text-xl font-light text-gray-600 leading-relaxed max-w-sm">
                    Has completado todo el formulario. Te notificaremos una vez que tu plan esté elaborado.
                </p>
                <button onClick={() => router.push('/dashboard')} className="mt-10 px-8 py-3 bg-gray-900 text-white rounded-full font-medium shadow-lg">Ir al inicio</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
            {/* Header con botón Volver */}
            <div className="p-6 flex items-center justify-between">
                {step > 0 ? (
                    <button onClick={handleBack} className="flex items-center text-gray-400 hover:text-gray-900 transition-colors">
                        <ChevronLeft size={24} /> <span className="text-sm font-medium">Volver</span>
                    </button>
                ) : <div />}
                <span className="text-xs font-bold text-gray-300 tracking-widest uppercase">Paso {step + 1} de {filteredSteps.length}</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
                <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                        <h1 className="text-3xl font-bold text-center mb-4 leading-tight">
                            {currentStepData.question}
                        </h1>
                        {currentStepData.detail && (
                            <p className="text-gray-500 text-center font-light text-lg">
                                {currentStepData.detail}
                            </p>
                        )}
                    </div>

                    <div className="space-y-4">
                        {currentStepData.type === 'select' && currentStepData.options?.map(opt => (
                            <button
                                key={opt}
                                onClick={() => { setFormData({...formData, [currentStepData.id]: opt}); handleNext(); }}
                                className="w-full p-5 text-left bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 text-lg font-medium"
                            >
                                {opt}
                            </button>
                        ))}

                        {currentStepData.type === 'number' && (
                            <input 
                                type="number" 
                                autoFocus
                                className="w-full p-6 text-center text-4xl font-bold border-b-2 border-gray-100 focus:border-gray-900 outline-none transition-all"
                                placeholder={currentStepData.placeholder}
                                value={formData[currentStepData.id]}
                                onChange={(e) => setFormData({...formData, [currentStepData.id]: e.target.value})}
                            />
                        )}

                        {currentStepData.type === 'checkbox' && (
                            <div className="grid grid-cols-1 gap-3">
                                {currentStepData.options.map(opt => (
                                    <label key={opt.id} className={`flex items-center p-5 rounded-2xl border transition-all cursor-pointer shadow-sm ${formData[opt.id] ? 'border-gray-900 bg-gray-50' : 'border-gray-100 bg-white'}`}>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={formData[opt.id]} 
                                            onChange={() => setFormData({...formData, [opt.id]: !formData[opt.id]})}
                                        />
                                        <div className={`w-6 h-6 rounded-md border-2 mr-4 flex items-center justify-center transition-all ${formData[opt.id] ? 'bg-gray-900 border-gray-900' : 'border-gray-200'}`}>
                                            {formData[opt.id] && <Check size={16} className="text-white" />}
                                        </div>
                                        <span className="text-lg font-medium">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {currentStepData.type !== 'select' && (
                        <button 
                            onClick={handleNext}
                            className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-all"
                        >
                            {loading ? 'Procesando...' : 'Continuar'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

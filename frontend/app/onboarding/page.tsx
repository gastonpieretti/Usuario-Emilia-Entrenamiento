"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Check, X, Activity, Heart, Droplets } from 'lucide-react';

// 1. Definición estricta de los datos del formulario
interface FormData {
    gender: string; 
    age: string; 
    weight_kg: string; 
    height_cm: string;
    dailyActivity: string; 
    goal: string; 
    
    // Entrenamiento
    trainingLocation: string;
    daysPerWeek: string; 
    sessionDurationMin: string; 
    priorityArea: string; 
    experienceLevel: string;
    
    // Dolores (Booleanos)
    painColumna: boolean; 
    painHombro: boolean;
    painRodilla: boolean; 
    painCadera: boolean; 
    painTobillo: boolean;
    
    // Nutrición
    dietPreference: string; 
    dislikedFoods: string;
    waterIntake: string;

    // Salud (Array y textos)
    healthConditions: string[];
    healthConditionsDetail: string;
    healthIsControlled: string;
    medicationDetail: string;
    
    // Campos de control
    [key: string]: string | boolean | string[]; 
}

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [planType, setPlanType] = useState('COMPLETO');
    const [isFinished, setIsFinished] = useState(false);
    const [error, setError] = useState(false);

    // Estado inicial limpio
    const [formData, setFormData] = useState<FormData>({
        gender: '', age: '', weight_kg: '', height_cm: '',
        dailyActivity: '', goal: '', 
        trainingLocation: '', daysPerWeek: '', sessionDurationMin: '', priorityArea: '', experienceLevel: '',
        painColumna: false, painHombro: false, painRodilla: false, painCadera: false, painTobillo: false,
        dietPreference: '', dislikedFoods: '', waterIntake: '',
        healthConditions: [], healthConditionsDetail: '', healthIsControlled: '', medicationDetail: ''
    });

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await fetch('/api/user/profile');
                const data = await res.json();
                if (data.planType) setPlanType(data.planType);
            } catch (err) { console.error("Error fetching plan:", err); }
        };
        fetchPlan();
    }, []);

    // 2. Configuración de Pasos (Auditada)
    const allSteps = [
        { id: 'gender', question: '¿Cuál es tu sexo biológico?', type: 'select', options: ['Femenino', 'Masculino'] },
        { id: 'age', question: '¿Cuántos años tienes?', type: 'number', placeholder: 'Ej: 30' },
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

        // SALUD
        { id: 'healthConditions', question: '¿Tenés alguna condición de salud diagnosticada?', type: 'health-grid', condition: 'UNIVERSAL' },

        // DIETA
        { id: 'dietPreference', question: '¿Tienes alguna preferencia al comer?', type: 'select', options: ['Omnívoro', 'Vegetariano', 'Vegano', 'Celíaco'], condition: 'DIETA' },
        { id: 'dislikedFoods', question: '¿Qué alimentos no te gustan?', detail: 'Estos alimentos serán excluidos de tu dieta.', type: 'text', placeholder: 'Ej: cebolla, pescado...', condition: 'DIETA' },
        { id: 'waterIntake', question: '¿Cuánta agua bebes diariamente?', type: 'select', options: ['Menos de 1 litro', '1 a 2 litros', '2 a 3 litros', 'Más de 3 litros'], condition: 'DIETA' }
    ];

    // Filtrado de pasos según plan
    const filteredSteps = allSteps.filter(s => {
        if (!s.condition || s.condition === 'UNIVERSAL') return true;
        if (planType === 'COMPLETO') return true;
        if (s.condition === 'DIETA' && planType === 'PROGRAMA NUTRICIONAL') return true;
        if (s.condition === 'ENTRENAMIENTO' && planType === 'PROGRAMA DE ENTRENAMIENTO') return true;
        return false;
    });

    const currentStepData = filteredSteps[step];

    // 3. Lógica de Validación Robusta
    const validateAndNext = () => {
        // Excepciones que no requieren validación estricta de string vacío
        if (currentStepData.id === 'pains' || currentStepData.id === 'healthConditions') { 
            handleNext(); 
            return; 
        }

        const val = formData[currentStepData.id];
        
        // Validación para números y textos
        if (!val || val === '' || val === '0') { 
            setError(true); 
            return; 
        }

        setError(false); 
        handleNext();
    };

    const handleNext = () => {
        if (step < filteredSteps.length - 1) {
            setStep(step + 1);
            setError(false);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        // Guardar en BD
        try {
            await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
        } catch (e) { console.error(e); }

        // Redirigir a WhatsApp
        const miNumero = "59899123456"; // TU NÚMERO
        const mensaje = `Hola Emilia, soy nuevo alumno. Mis datos: Objetivo ${formData.goal}, Plan ${planType}.`;
        const url = `https://wa.me/${miNumero}?text=${encodeURIComponent(mensaje)}`;
        
        setTimeout(() => { 
            setIsFinished(true); 
            setLoading(false); 
            window.open(url, '_blank'); 
        }, 1500);
    };

    if (isFinished) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
                <div className="bg-white p-10 rounded-[2rem] shadow-xl max-w-sm w-full">
                    <Check className="text-green-600 mx-auto mb-6" size={60} />
                    <h1 className="text-2xl font-bold mb-4 text-[#343a40]">¡Felicitaciones!</h1>
                    <p className="text-[#6c757d]">Has completado todo el formulario. Te notificaremos una vez que tu plan esté elaborado.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans text-[#343a40]">
            {/* Header */}
            <header className="p-6 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                {step > 0 ? (
                    <button onClick={() => setStep(step - 1)} className="flex items-center text-[#6c757d] hover:text-[#5882ff] transition-colors">
                        <ChevronLeft size={24} /> <span className="font-bold ml-1">Volver</span>
                    </button>
                ) : <div />}
                <button onClick={() => router.push('/dashboard')} className="p-2 bg-white rounded-full shadow-sm text-[#6c757d] hover:text-red-500 transition-all">
                    <X size={24} />
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_15px_40px_-12px_rgba(0,0,0,0.1)] space-y-8 animate-in fade-in slide-in-from-bottom-8">
                    
                    {/* Pregunta */}
                    <div className="space-y-3 text-center">
                        <p className="text-[#5882ff] font-bold text-xs tracking-widest uppercase">Paso {step + 1} de {filteredSteps.length}</p>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-[#343a40] leading-tight">{currentStepData.question}</h1>
                        {currentStepData.detail && <p className="text-[#6c757d] font-normal text-lg">{currentStepData.detail}</p>}
                    </div>

                    {/* Renderizado de Inputs según Tipo */}
                    <div className="space-y-4">
                        
                        {/* 1. TIPO SELECT (Botones) */}
                        {currentStepData.type === 'select' && currentStepData.options?.map((opt) => (
                            <button
                                key={String(opt)}
                                onClick={() => { 
                                    setFormData({...formData, [currentStepData.id]: opt}); 
                                    setError(false);
                                    handleNext(); 
                                }}
                                className={`w-full p-5 text-left rounded-2xl border-2 transition-all duration-200 text-lg font-bold 
                                ${formData[currentStepData.id] === opt 
                                    ? 'bg-[#5882ff] text-white border-[#5882ff] shadow-lg scale-[1.02]' 
                                    : 'bg-white text-[#495057] border-[#f1f3f5] hover:border-[#5882ff] hover:shadow-md'}`}
                            >
                                {String(opt)}
                            </button>
                        ))}

                        {/* 2. TIPO NUMBER (Campo numérico grande) - CORREGIDO */}
                        {currentStepData.type === 'number' && (
                            <div className="flex justify-center py-4">
                                <input 
                                    type="number" 
                                    autoFocus
                                    className="w-full max-w-[200px] p-4 text-center text-6xl font-black border-b-4 border-[#f1f3f5] focus:border-[#5882ff] outline-none transition-all text-[#343a40] bg-transparent placeholder:text-gray-200"
                                    placeholder={currentStepData.placeholder}
                                    value={formData[currentStepData.id] as string}
                                    onChange={(e) => { 
                                        setFormData({...formData, [currentStepData.id]: e.target.value}); 
                                        setError(false); 
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && validateAndNext()}
                                />
                            </div>
                        )}

                        {/* 3. TIPO TEXT (Textarea) */}
                        {currentStepData.type === 'text' && (
                            <textarea 
                                className="w-full p-6 rounded-3xl border-2 border-[#f1f3f5] focus:border-[#5882ff] outline-none min-h-[150px] text-lg text-[#343a40] shadow-inner"
                                placeholder={currentStepData.placeholder}
                                value={formData[currentStepData.id] as string}
                                onChange={(e) => setFormData({...formData, [currentStepData.id]: e.target.value})}
                            />
                        )}

                        {/* 4. TIPO CHECKBOX (Dolores) */}
                        {currentStepData.type === 'checkbox' && currentStepData.options && (
                            <div className="grid grid-cols-1 gap-3">
                                {currentStepData.options.map((opt: any) => (
                                    <label key={opt.id} className={`flex items-center p-5 rounded-2xl border-2 transition-all cursor-pointer shadow-sm ${formData[opt.id] ? 'border-[#5882ff] bg-blue-50/50' : 'border-[#f1f3f5] bg-white'}`}>
                                        <input type="checkbox" className="hidden" checked={formData[opt.id] as boolean} onChange={() => setFormData({...formData, [opt.id]: !formData[opt.id]})} />
                                        <div className={`w-6 h-6 rounded-md border-2 mr-4 flex items-center justify-center transition-all ${formData[opt.id] ? 'bg-[#5882ff] border-[#5882ff]' : 'border-gray-200'}`}>
                                            {formData[opt.id] && <Check size={16} className="text-white" strokeWidth={3} />}
                                        </div>
                                        <span className="text-lg font-bold text-[#495057]">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* 5. TIPO HEALTH-GRID (Salud Compleja) */}
                        {currentStepData.type === 'health-grid' && (
                            <HealthGrid formData={formData} setFormData={setFormData} />
                        )}
                    </div>

                    {/* Mensaje de Error */}
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-xl text-center font-bold text-sm animate-pulse border border-red-100">
                            ⚠️ Por favor completa este campo para continuar
                        </div>
                    )}

                    {/* Botón de Continuar (Solo si no es selección automática) */}
                    {currentStepData.type !== 'select' && (
                        <button 
                            onClick={validateAndNext} 
                            className="w-full py-5 bg-[#5882ff] text-white rounded-2xl font-bold text-xl shadow-[0_10px_20px_rgba(88,130,255,0.3)] hover:shadow-[0_15px_30px_rgba(88,130,255,0.4)] hover:scale-[1.01] transition-all active:scale-[0.98]"
                        >
                            {loading ? 'Procesando...' : 'Continuar'}
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
}

// Subcomponente para la grilla de salud (extraído para limpieza)
function HealthGrid({ formData, setFormData }: { formData: FormData, setFormData: any }) {
    const toggleCondition = (condition: string) => {
        const current = formData.healthConditions;
        const updated = current.includes(condition) 
            ? current.filter(c => c !== condition) 
            : [...current, condition];
        setFormData({ ...formData, healthConditions: updated });
    };

    return (
        <div className="space-y-6 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
            <HealthSection title="Metabólicas" icon={<Activity size={18}/>} options={['Diabetes 1', 'Diabetes 2', 'Resistencia Insulina', 'Hipotiroidismo']} selected={formData.healthConditions} onToggle={toggleCondition} />
            <HealthSection title="Cardio" icon={<Heart size={18}/>} options={['Hipertensión', 'Colesterol Alto', 'Triglicéridos Altos']} selected={formData.healthConditions} onToggle={toggleCondition} />
            <HealthSection title="Digestivas" icon={<Droplets size={18}/>} options={['Celíaco', 'Intolerancia Lactosa', 'Gastritis', 'Colon Irritable']} selected={formData.healthConditions} onToggle={toggleCondition} />
            
            <div className="pt-6 border-t border-gray-100 space-y-4">
                <div>
                    <p className="font-bold text-[#343a40] mb-2 text-sm">¿Condición controlada por profesional?</p>
                    <div className="flex gap-3">
                        {['Sí', 'No'].map(o => (
                            <button key={o} onClick={() => setFormData({...formData, healthIsControlled: o})} 
                                className={`flex-1 p-3 rounded-xl border-2 font-semibold transition-all ${formData.healthIsControlled === o ? 'bg-blue-50 border-[#5882ff] text-[#5882ff]' : 'border-gray-100 text-gray-500'}`}>
                                {o}
                            </button>
                        ))}
                    </div>
                </div>
                <input 
                    type="text" 
                    placeholder="¿Medicaciòn? Nombre y dosis..." 
                    className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-[#5882ff] outline-none text-[#343a40]" 
                    value={formData.medicationDetail}
                    onChange={(e) => setFormData({...formData, medicationDetail: e.target.value})} 
                />
            </div>
        </div>
    );
}

function HealthSection({ title, icon, options, selected, onToggle }: any) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#5882ff] font-bold uppercase text-xs tracking-wider">
                {icon} <span>{title}</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
                {options.map((opt: string) => (
                    <label key={opt} className={`flex items-center p-3 rounded-xl border-2 transition-all cursor-pointer ${selected.includes(opt) ? 'border-[#5882ff] bg-blue-50' : 'border-gray-50 bg-white hover:border-gray-200'}`}>
                        <input type="checkbox" className="hidden" checked={selected.includes(opt)} onChange={() => onToggle(opt)} />
                        <div className={`w-5 h-5 rounded-md border-2 mr-3 flex items-center justify-center transition-all ${selected.includes(opt) ? 'bg-[#5882ff] border-[#5882ff]' : 'border-gray-300'}`}>
                            {selected.includes(opt) && <Check size={14} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-sm font-bold text-[#495057]">{opt}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

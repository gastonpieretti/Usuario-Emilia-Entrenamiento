"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [planType, setPlanType] = useState('COMPLETO'); // Valor por defecto

    // Estado para guardar todas las respuestas
    const [formData, setFormData] = useState({
        gender: '',
        age: '',
        weight_kg: '',
        height_cm: '',
        dailyActivity: '',
        goal: '',
        trainingLocation: '',
        experienceLevel: '',
        painHombro: false,
        painColumna: false,
        painRodilla: false,
        painCadera: false,
        dietPreference: '',
        happyFood: '',
        sleepQuality: '',
        stressLevel: ''
    });

    // 1. Obtener el tipo de plan del usuario al cargar
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/user/profile'); // Ajustar a tu ruta de API
                const data = await res.json();
                if (data.planType) setPlanType(data.planType);
            } catch (err) {
                console.error("Error cargando plan:", err);
            }
        };
        fetchUserData();
    }, []);

    // 2. Definición de los Módulos (Preguntas)
    const allSteps = [
        // MÓDULO 1: UNIVERSAL
        { id: 'gender', question: '¿Cuál es tu sexo biológico?', detail: 'Esto nos permite calcular tus necesidades de energía de forma exacta según tu cuerpo.', type: 'select', options: ['Femenino', 'Masculino'] },
        { id: 'age', question: '¿Cuántos años tienes?', detail: 'Por ejemplo: 65. Tu edad es clave para que el programa cuide siempre tu salud.', type: 'number' },
        { id: 'biometrics', question: 'Peso y Altura', detail: 'Por ejemplo: 72 kg y 165 cm. Es nuestro punto de partida.', type: 'biometrics' },
        { id: 'dailyActivity', question: '¿Cómo es tu movimiento diario habitual?', detail: 'Dinos si pasas mucho tiempo sentado o si sueles caminar durante el día.', type: 'select', options: ['Poco movimiento', 'Movimiento ligero', 'Muy activo'] },
        { id: 'goal', question: '¿Cuál es tu objetivo principal?', detail: 'Define hacia dónde queremos ir con tu plan personalizado.', type: 'select', options: ['Pérdida de grasa', 'Ganancia de masa muscular', 'Recomposición'] },
        
        // MÓDULO 2: ENTRENAMIENTO (Solo si aplica)
        { id: 'trainingLocation', question: '¿Dónde vas a entrenar?', detail: 'Elige el lugar donde te sientas más cómodo.', type: 'select', options: ['Gimnasio', 'Casa (mancuernas, bandas)', 'Mixto'], condition: 'ENTRENAMIENTO' },
        { id: 'experienceLevel', question: '¿Cuál es tu experiencia previa?', detail: 'Ejemplo: "Caminaba hace años" o "Nunca usé pesas".', type: 'select', options: ['Principiante', 'Intermedio', 'Avanzado'], condition: 'ENTRENAMIENTO' },
        { id: 'pains', question: '¿Tienes algún dolor o limitación?', detail: 'Dinos si sientes molestias para evitar ejercicios que te duelan.', type: 'pains', condition: 'ENTRENAMIENTO' },

        // MÓDULO 3: NUTRICIÓN (Solo si aplica)
        { id: 'dietPreference', question: '¿Tienes alguna preferencia al comer?', detail: 'Ejemplo: "No como carne roja" o "Soy celíaco".', type: 'select', options: ['Como de todo', 'Vegetariano', 'Sin gluten', 'Otras'], condition: 'DIETA' },
        { id: 'happyFood', question: 'Alimento de mi agrado (Regla 80/20)', detail: 'Escribe ese alimento que te hace feliz (un chocolate, un postre). Lo incluiremos con cuidado.', type: 'text', condition: 'DIETA' },

        // MÓDULO 4: BIENESTAR
        { id: 'sleepQuality', question: '¿Cómo describirías tu descanso?', detail: 'Dormir bien es fundamental para recuperar energía.', type: 'select', options: ['Mal', 'Regular', 'Bien', 'Excelente'] },
        { id: 'stressLevel', question: '¿Cuál es tu nivel de estrés habitual?', detail: 'Escala del 1 al 10. Nos ayuda a no sobrecargarte.', type: 'select', options: ['1-3 (Bajo)', '4-7 (Moderado)', '8-10 (Alto)'] }
    ];

    // 3. Filtrar pasos según el plan
    const filteredSteps = allSteps.filter(s => {
        if (!s.condition) return true;
        if (planType === 'COMPLETO') return true;
        if (s.condition === 'DIETA' && planType === 'PROGRAMA NUTRICIONAL') return true;
        if (s.condition === 'ENTRENAMIENTO' && planType === 'PROGRAMA DE ENTRENAMIENTO') return true;
        return false;
    });

    const currentStepData = filteredSteps[step];

    const handleNext = () => {
        if (step < filteredSteps.length - 1) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        // Aquí iría la llamada a tu API para guardar
        console.log("Enviando datos:", formData);
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-gray-800">
            {/* Barra de Progreso */}
            <div className="w-full max-w-md bg-gray-100 h-1 mb-12 rounded-full overflow-hidden">
                <div 
                    className="bg-blue-500 h-full transition-all duration-500" 
                    style={{ width: `${((step + 1) / filteredSteps.length) * 100}%` }}
                ></div>
            </div>

            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-3xl font-light text-center leading-tight">
                    {currentStepData.question}
                </h1>

                <div className="space-y-4">
                    {currentStepData.type === 'select' && currentStepData.options?.map(opt => (
                        <button
                            key={opt}
                            onClick={() => { setFormData({...formData, [currentStepData.id]: opt}); handleNext(); }}
                            className="w-full p-5 text-left border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors text-lg font-light"
                        >
                            {opt}
                        </button>
                    ))}

                    {currentStepData.type === 'number' && (
                        <input 
                            type="number" 
                            className="w-full p-5 border-b-2 border-gray-100 focus:border-blue-500 outline-none text-2xl text-center"
                            placeholder="00"
                            onChange={(e) => setFormData({...formData, [currentStepData.id]: e.target.value})}
                        />
                    )}

                    {currentStepData.type === 'text' && (
                        <input 
                            type="text" 
                            className="w-full p-5 border-b-2 border-gray-100 focus:border-blue-500 outline-none text-xl text-center"
                            placeholder="Escribe aquí..."
                            onChange={(e) => setFormData({...formData, [currentStepData.id]: e.target.value})}
                        />
                    )}
                </div>

                <p className="text-gray-400 text-center italic font-light pt-8">
                    💡 {currentStepData.detail}
                </p>

                {currentStepData.type !== 'select' && (
                    <button 
                        onClick={handleNext}
                        className="w-full py-4 bg-gray-900 text-white rounded-full mt-8 font-light tracking-wide"
                    >
                        Siguiente
                    </button>
                )}
            </div>
        </div>
    );
}

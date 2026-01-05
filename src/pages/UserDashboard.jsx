import React, { useState, useEffect, useCallback } from 'react';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, collection, query, where, Timestamp } from 'firebase/firestore';
import { Dumbbell, Clock, Zap, User, RefreshCw, Loader2, Link, AlertTriangle, Calendar, Utensils, CheckCircle, Share2, Clipboard, Heart } from 'lucide-react';

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Inicialización de Firebase
const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
const db = app ? getFirestore(app) : null;
const auth = app ? getAuth(app) : null;

// --- UTILITIES ---

const geminiFetch = async (payload, retries = 3) => {
    const modelName = "gemini-2.5-flash-preview-09-2025";
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const result = await response.json();
            const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!jsonText) {
                throw new Error("Respuesta del modelo vacía o incompleta.");
            }

            try {
                return JSON.parse(jsonText);
            } catch (e) {
                console.error("Error al parsear JSON de Gemini:", e);
                throw new Error("Formato de respuesta del modelo inválido.");
            }
        } catch (error) {
            console.error(`Intento ${i + 1} fallido:`, error.message);
            if (i < retries - 1) {
                const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw new Error("Fallo la generación de rutina tras varios intentos.");
            }
        }
    }
};

const copyToClipboard = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    try {
        const successful = document.execCommand('copy');
        return successful;
    } catch (err) {
        console.error('Fallback: Error al copiar al portapapeles', err);
        return false;
    } finally {
        document.body.removeChild(el);
    }
};


// --- COMPONENTES DE VISTA ---

const RoutineDisplay = ({ routine, onShare, sharingLink }) => {
    const [copied, setCopied] = useState(false);

    const formatRoutineForShare = (routineData) => {
        let text = `🏋️ Rutina de Entrenamiento Generada por IA 🤖\n\n`;
        text += `Objetivo: ${routineData.input.objetivo}\n`;
        text += `Frecuencia: ${routineData.input.frecuencia} días/semana\n`;
        text += `Nivel: ${routineData.input.nivel}\n\n`;
        text += `--- Días de Entrenamiento ---\n\n`;

        routineData.routine.forEach((day, index) => {
            text += `🗓️ Día ${index + 1}: ${day.nombre}\n`;
            day.ejercicios.forEach(ex => {
                text += `  - ${ex.nombre}: ${ex.series}x${ex.repeticiones} | Descanso: ${ex.descanso}s\n`;
            });
            text += '\n';
        });

        if (sharingLink) {
            text += `🔗 Enlace para ver la rutina: ${sharingLink}\n`;
        }

        return text;
    };


    const handleCopy = () => {
        const textToCopy = formatRoutineForShare(routine);
        const successful = copyToClipboard(textToCopy);
        if (successful) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };


    return (
        <div className="w-full max-w-4xl mt-8 p-6 bg-white rounded-xl shadow-2xl border-t-4 border-indigo-500">
            <h2 className="text-3xl font-extrabold text-indigo-700 mb-4 flex items-center">
                <CheckCircle className="w-8 h-8 mr-2" /> ¡Rutina Generada!
            </h2>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 mb-4">
                <p className="text-sm text-gray-600">
                    <span className="font-semibold mr-1">Objetivo:</span> {routine.input.objetivo} |
                    <span className="font-semibold mx-1">Nivel:</span> {routine.input.nivel} |
                    <span className="font-semibold mx-1">Días:</span> {routine.input.frecuencia}
                </p>
                <div className="flex space-x-2 mt-3 sm:mt-0">
                    <button
                        onClick={onShare}
                        className="flex items-center text-sm px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-md"
                        title="Compartir con la comunidad"
                    >
                        <Share2 className="w-4 h-4 mr-1" />
                        {sharingLink ? "Compartida" : "Compartir"}
                    </button>
                    <button
                        onClick={handleCopy}
                        className={`flex items-center text-sm px-4 py-2 rounded-full transition-colors shadow-md ${copied ? 'bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'} text-white`}
                        title="Copiar texto de la rutina"
                    >
                        <Clipboard className="w-4 h-4 mr-1" />
                        {copied ? "¡Copiado!" : "Copiar"}
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {routine.routine.map((day, i) => (
                    <div key={i} className="border p-4 rounded-lg bg-gray-50">
                        <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
                            Día {i + 1}: {day.nombre}
                        </h3>
                        <ul className="space-y-4">
                            {day.ejercicios.map((ex, j) => (
                                <li key={j} className="border-l-4 border-indigo-400 pl-4 py-1">
                                    <p className="font-semibold text-lg text-gray-900">{ex.nombre}</p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">{ex.series} series</span> de <span className="font-medium">{ex.repeticiones} repeticiones</span> |
                                        Descanso: <span className="font-medium text-indigo-600">{ex.descanso}s</span>
                                    </p>
                                    <p className="text-xs italic text-gray-500 mt-1">{ex.instrucciones}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PublicRoutinesDisplay = ({ publicRoutines }) => {
    return (
        <div className="w-full max-w-4xl mt-12 pt-6 border-t border-gray-300">
            <h3 className="text-2xl font-bold text-gray-700 mb-4 flex items-center">
                <Heart className="w-6 h-6 mr-2 text-red-500" /> Rutinas de la Comunidad
            </h3>
            <div className="space-y-4">
                {publicRoutines.map(r => (
                    <div key={r.id} className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-shadow cursor-pointer">
                        <p className="font-bold text-indigo-600">{r.input.objetivo} ({r.input.nivel})</p>
                        <p className="text-sm text-gray-600">
                            {r.routine.length} días de entrenamiento | Creada por: <span className="font-mono text-xs">{r.userId}</span>
                        </p>
                        <div className="text-xs text-gray-400 mt-1">
                            Compartida el: {new Date(r.timestamp.seconds * 1000).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL ---

export default function UserDashboard() {
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [routine, setRoutine] = useState(null);
    const [publicRoutines, setPublicRoutines] = useState([]);
    const [sharingLink, setSharingLink] = useState(null);

    const [form, setForm] = useState({
        objetivo: 'Ganar masa muscular',
        nivel: 'Intermedio',
        frecuencia: 3
    });

    // 1. Manejo de Autenticación y Firestore Initialization
    useEffect(() => {
        if (!auth || !db) {
            console.warn("Firebase not configured. Running in Demo Mode.");
            setUserId("demo-user");
            setIsAuthReady(true);
            return;
        }

        const setupAuth = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (e) {
                console.error("Error signing in:", e);
                await signInAnonymously(auth).catch(err => console.error("Error signing in anonymously:", err));
            }
        };

        setupAuth();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            }
            setIsAuthReady(true);
        });

        return () => unsubscribe();
    }, []);


    // 2. Listener de Firestore para la última rutina (privada)
    useEffect(() => {
        if (!isAuthReady || !userId || !db) return;

        const routineRef = doc(db,
            'artifacts', appId, 'users', userId,
            'fitness_data', 'last_routine'
        );

        const unsubscribe = onSnapshot(routineRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setRoutine(data.routine);
                setSharingLink(data.sharingLink || null);
            } else {
                setRoutine(null);
                setSharingLink(null);
            }
        }, (e) => {
            console.error("Error listening to private routine:", e);
        });

        return () => unsubscribe();
    }, [isAuthReady, userId]);

    // 3. Listener de Firestore para rutinas públicas
    useEffect(() => {
        if (!isAuthReady) {
            // Demo data for public routines if not ready/configured
            if (!db) {
                setPublicRoutines([
                    {
                        id: 'demo-1',
                        userId: 'user-123',
                        input: { objetivo: 'Ganar masa muscular', nivel: 'Intermedio', frecuencia: 4 },
                        routine: new Array(4).fill(0), // Dummy length
                        timestamp: { seconds: Date.now() / 1000 }
                    },
                    {
                        id: 'demo-2',
                        userId: 'user-456',
                        input: { objetivo: 'Perder peso', nivel: 'Principiante', frecuencia: 3 },
                        routine: new Array(3).fill(0),
                        timestamp: { seconds: (Date.now() - 86400000) / 1000 }
                    }
                ]);
            }
            return;
        }

        if (!db) return;

        const publicRoutinesColRef = collection(db, 'artifacts', appId, 'public', 'data', 'public_routines');
        const q = query(publicRoutinesColRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const routines = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            routines.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
            setPublicRoutines(routines.slice(0, 10));
        }, (e) => {
            console.error("Error listening to public routines:", e);
        });

        return () => unsubscribe();
    }, [isAuthReady]);


    const handleGenerateRoutine = async (e) => {
        e.preventDefault();
        if (!userId) {
            setError("Error de autenticación. Por favor, recarga la página.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setRoutine(null);
        setSharingLink(null);

        // DEMO MODE GENERATION
        if (!db || !auth) {
            setTimeout(() => {
                const mockRoutine = [
                    {
                        nombre: "Día 1: Cuerpo Completo",
                        ejercicios: [
                            { nombre: "Sentadillas", series: 3, repeticiones: 12, descanso: 60, instrucciones: "Mantén la espalda recta." },
                            { nombre: "Flexiones", series: 3, repeticiones: 10, descanso: 60, instrucciones: "Pecho al suelo." }
                        ]
                    },
                    {
                        nombre: "Día 2: Cardio y Core",
                        ejercicios: [
                            { nombre: "Burpees", series: 3, repeticiones: 15, descanso: 45, instrucciones: "Explosividad." },
                            { nombre: "Plancha", series: 3, repeticiones: 1, descanso: 60, instrucciones: "Aguanta 45 segundos." }
                        ]
                    }
                ];

                // Adjust length to match frequency roughly (just duplicating for demo)
                const finalRoutine = [];
                for (let i = 0; i < form.frecuencia; i++) {
                    finalRoutine.push(mockRoutine[i % mockRoutine.length]);
                }

                const routineData = {
                    routine: finalRoutine,
                    input: form,
                    userId: userId,
                    timestamp: { seconds: Date.now() / 1000 },
                    sharingLink: null,
                };
                setRoutine(routineData);
                setIsLoading(false);
            }, 1500);
            return;
        }

        const systemPrompt = `Eres un experto entrenador personal. Genera una rutina de fitness en formato JSON. 
            La respuesta debe ser SOLO un array JSON y seguir el siguiente schema estricto.
            El usuario proporcionará el objetivo, el nivel y la frecuencia semanal.
            
            Schema (JSON ARRAY):
            [
              {
                "nombre": "Nombre del Día de Entrenamiento (e.g., Pecho y Tríceps)",
                "ejercicios": [
                  {
                    "nombre": "Nombre del ejercicio (e.g., Press de Banca)",
                    "series": 3,
                    "repeticiones": 10,
                    "descanso": 60, // segundos
                    "instrucciones": "Una breve instrucción de técnica o enfoque (e.g., Controla la fase negativa)."
                  }
                ]
              }
            ]
            
            Asegúrate de que la rutina tenga exactamente la cantidad de días solicitada por la frecuencia.
            La respuesta DEBE ser solo el JSON.`;

        const userQuery = `Genera una rutina de ${form.frecuencia} días. 
            Objetivo: ${form.objetivo}. 
            Nivel: ${form.nivel}.`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            "nombre": { "type": "STRING" },
                            "ejercicios": {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",
                                    properties: {
                                        "nombre": { "type": "STRING" },
                                        "series": { "type": "NUMBER" },
                                        "repeticiones": { "type": "NUMBER" },
                                        "descanso": { "type": "NUMBER" },
                                        "instrucciones": { "type": "STRING" }
                                    },
                                    required: ["nombre", "series", "repeticiones", "descanso", "instrucciones"]
                                }
                            }
                        },
                        required: ["nombre", "ejercicios"]
                    }
                }
            }
        };

        try {
            const generatedRoutine = await geminiFetch(payload);

            if (generatedRoutine.length !== form.frecuencia) {
                throw new Error("El modelo no generó la cantidad correcta de días.");
            }

            const routineData = {
                routine: generatedRoutine,
                input: form,
                userId: userId,
                timestamp: Timestamp.now(),
                sharingLink: null,
            };

            const routineRef = doc(db,
                'artifacts', appId, 'users', userId,
                'fitness_data', 'last_routine'
            );
            await setDoc(routineRef, routineData);

            setRoutine(routineData);

        } catch (e) {
            console.error("Error total en la generación:", e);
            setError(`Error al generar la rutina: ${e.message}. Intenta de nuevo.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleShare = useCallback(async () => {
        if (!routine || !userId) return;

        setIsLoading(true);
        setError(null);

        // DEMO MODE SHARE
        if (!db) {
            setTimeout(() => {
                const generatedLink = `https://miappfitness.com/share/${userId}`;
                setSharingLink(generatedLink);
                setIsLoading(false);
            }, 1000);
            return;
        }

        try {
            const publicRoutineRef = doc(db, 'artifacts', appId, 'public', 'data', 'public_routines', userId);

            const publicDocData = {
                ...routine,
                timestamp: Timestamp.now(),
                userId: userId,
            };

            await setDoc(publicRoutineRef, publicDocData);

            const generatedLink = `https://miappfitness.com/share/${userId}`;
            setSharingLink(generatedLink);

            const privateRoutineRef = doc(db,
                'artifacts', appId, 'users', userId,
                'fitness_data', 'last_routine'
            );
            await setDoc(privateRoutineRef, { sharingLink: generatedLink }, { merge: true });

        } catch (e) {
            console.error("Error al compartir la rutina:", e);
            setError("No se pudo compartir la rutina. Inténtalo más tarde.");
        } finally {
            setIsLoading(false);
        }
    }, [routine, userId]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'frecuencia' ? parseInt(value, 10) : value
        }));
    };

    if (!isAuthReady) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
                <p className="ml-3 text-lg text-gray-700">Cargando aplicación...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex flex-col items-center">
            <header className="text-center mb-8">
                <h1 className="text-5xl font-extrabold text-gray-900 flex items-center justify-center">
                    <img src="/logo.png" alt="Logo" className="h-16 w-auto mr-4" />
                    Emilia Entrenamiento App
                </h1>
                <p className="text-xl text-gray-600 mt-2">Genera tu rutina de ejercicios personalizada con Gemini</p>
                <p className="text-xs mt-2 font-mono text-gray-500">
                    ID de Usuario: {userId}
                </p>
            </header>

            <form onSubmit={handleGenerateRoutine} className="w-full max-w-4xl bg-white p-6 sm:p-8 rounded-xl shadow-2xl space-y-5 border-t-8 border-indigo-600">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
                    <Utensils className="w-6 h-6 mr-2 text-indigo-500" />
                    Define tus parámetros
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <Zap className="w-4 h-4 mr-1 text-yellow-500" /> Objetivo Principal
                        </label>
                        <select
                            name="objetivo"
                            value={form.objetivo}
                            onChange={handleFormChange}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        >
                            <option>Ganar masa muscular</option>
                            <option>Perder peso y tonificar</option>
                            <option>Aumentar resistencia</option>
                            <option>Mejorar flexibilidad</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <User className="w-4 h-4 mr-1 text-blue-500" /> Nivel de Experiencia
                        </label>
                        <select
                            name="nivel"
                            value={form.nivel}
                            onChange={handleFormChange}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        >
                            <option>Principiante</option>
                            <option>Intermedio</option>
                            <option>Avanzado</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-pink-500" /> Frecuencia Semanal (Días)
                        </label>
                        <input
                            type="number"
                            name="frecuencia"
                            value={form.frecuencia}
                            onChange={handleFormChange}
                            min="1"
                            max="7"
                            className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="3"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 disabled:bg-gray-400 flex justify-center items-center transition-colors font-semibold shadow-lg hover:shadow-xl"
                >
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <RefreshCw className="w-5 h-5 mr-2" />}
                    {isLoading ? "Generando Rutina..." : "Generar Rutina"}
                </button>
            </form>

            {error && <div className="w-full max-w-4xl mt-4 text-red-700 font-bold bg-red-100 p-4 rounded-xl border border-red-300 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                {error}
            </div>}

            {routine && (
                <RoutineDisplay routine={routine} onShare={handleShare} sharingLink={sharingLink} />
            )}

            {publicRoutines.length > 0 && (
                <PublicRoutinesDisplay publicRoutines={publicRoutines} />
            )}
        </div>
    );
}

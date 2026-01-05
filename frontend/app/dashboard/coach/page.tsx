"use client";

import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../utils/api';
import { MessageSquare, Send, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CoachPage() {
    const { user } = useAuth();
    const [emotionalGoal, setEmotionalGoal] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emotionalGoal.trim()) return;

        setLoading(true);
        setResponse('');
        try {
            const res = await api.post('/ai/motivation', {
                nombre_usuario: user?.name || 'Usuario',
                objetivo_emocional: emotionalGoal
            });
            setResponse(res.data.message);
        } catch (error: any) {
            console.error('Error with AI Coach:', error);
            setResponse('Lo siento, en este momento no puedo darte una respuesta. Por favor intenta más tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <header className="mb-8 text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-block p-3 rounded-full bg-purple-100 text-purple-600 mb-4"
                >
                    <Bot size={48} />
                </motion.div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                    COACH <span className="text-purple-600">ONLINE</span>
                </h1>
                <p className="text-gray-600 max-w-lg mx-auto">
                    Tu mentor virtual disponible 24/7 para darte el apoyo emocional y la motivación que necesitas para alcanzar tus metas.
                </p>
            </header>

            <div className="grid gap-8 overflow-hidden">
                {/* Input Section */}
                <motion.div
                    layout
                    className="bg-white p-8 rounded-2xl shadow-xl border border-purple-50"
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            ¿Cómo te sientes hoy o qué te gustaría lograr emocionalmente?
                        </label>
                        <div className="relative">
                            <textarea
                                value={emotionalGoal}
                                onChange={(e) => setEmotionalGoal(e.target.value)}
                                placeholder="Ej: Me siento un poco desmotivado con mi entrenamiento..."
                                className="w-full border-2 border-gray-100 p-4 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all resize-none h-32 text-gray-800"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !emotionalGoal.trim()}
                            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${loading || !emotionalGoal.trim()
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-purple-200 hover:-translate-y-1'
                                }`}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Consultando al Coach...
                                </div>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    Obtener Motivación
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Response Section */}
                <AnimatePresence>
                    {(response || loading) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-2xl border border-purple-100 shadow-inner"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Bot className="text-purple-600" size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-purple-900 mb-2">Respuesta de tu Coach:</h3>
                                    {loading ? (
                                        <div className="space-y-2 animate-pulse">
                                            <div className="h-4 bg-purple-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-purple-200 rounded w-full"></div>
                                            <div className="h-4 bg-purple-200 rounded w-5/6"></div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap italic">
                                            "{response}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <footer className="mt-12 text-center text-xs text-gray-400">
                <p>Recordatorio: Mi Coach Online no sustituye el asesoramiento de un profesional de la salud mental o nutrición.</p>
            </footer>
        </div>
    );
}

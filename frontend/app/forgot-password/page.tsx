"use client";

import { useState } from 'react';
import api from '../../utils/api';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleGetQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/recover/question', { email });
            setQuestion(res.data.question);
            if (!res.data.question) {
                setError('Este usuario no tiene configurada una pregunta de seguridad. Contacta al administrador.');
                return;
            }
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Usuario no encontrado');
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/recover/verify', { email, answer });
            setMessage('¡Correcto! Se ha enviado un correo de recuperación a tu dirección de email.');
            setStep(3);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Respuesta incorrecta');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">Recuperar Contraseña</h1>

                {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}

                {step === 1 && (
                    <form onSubmit={handleGetQuestion}>
                        <div className="mb-4">
                            <label className="block text-gray-700">Ingresa tu Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border p-2 rounded"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                            Continuar
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerify}>
                        <div className="mb-4">
                            <p className="text-gray-600 mb-2 font-semibold">Pregunta de Seguridad:</p>
                            <p className="text-gray-800 mb-4 bg-gray-50 p-3 rounded">{question}</p>

                            <label className="block text-gray-700">Tu Respuesta</label>
                            <input
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                className="w-full border p-2 rounded"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
                            Verificar y Enviar
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <div className="text-center">
                        <div className="text-green-500 text-5xl mb-4">✓</div>
                        <p className="text-gray-700 mb-6">{message}</p>
                        <p className="text-sm text-gray-500 mb-4">Revisa tu consola del servidor para ver el link simulado.</p>
                        <Link href="/login" className="text-blue-500 hover:underline block">
                            Volver al Login
                        </Link>
                    </div>
                )}

                {(step === 1 || step === 2) && (
                    <div className="mt-4 text-center">
                        <Link href="/login" className="text-sm text-gray-500 hover:underline">
                            Cancelar
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

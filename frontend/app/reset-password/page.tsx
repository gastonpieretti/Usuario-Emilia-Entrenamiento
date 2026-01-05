"use client";

import { useState, Suspense } from 'react';
import api from '../../utils/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            await api.post('/auth/reset-password', { token, newPassword: password });
            setMessage('Contraseña restablecida correctamente. Tu cuenta está ahora pendiente de aprobación por el administrador.');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al restablecer contraseña');
        }
    };

    if (!token) {
        return <div className="text-red-500">Token no válido o faltante.</div>;
    }

    if (message) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded shadow-md w-96 text-center">
                    <div className="text-green-500 text-5xl mb-4">✓</div>
                    <h2 className="text-2xl font-bold mb-4">¡Contraseña Cambiada!</h2>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Volver al Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">Nueva Contraseña</h1>
                {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Nueva Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border p-2 rounded"
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700">Confirmar Contraseña</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border p-2 rounded"
                            required
                            minLength={6}
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                        Cambiar Contraseña
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}

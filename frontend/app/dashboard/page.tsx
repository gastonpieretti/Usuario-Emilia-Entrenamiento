"use client";

import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { Bot } from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Bienvenido, {user?.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Formulario Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Mi Información</h2>
                    <p className="text-gray-600 mb-4">
                        Aquí puedes ver y editar la información de tu perfil, entrenamiento y nutrición.
                    </p>
                    <Link
                        href="/onboarding"
                        className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Ir al Formulario
                    </Link>
                </div>

                {/* Coach Online Section */}
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-6 rounded-lg shadow-md text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <Bot size={24} />
                        <h2 className="text-xl font-bold uppercase tracking-wider">Coach Online</h2>
                    </div>
                    <p className="text-purple-100 mb-6">
                        ¿Necesitas un impulso extra? Mi IA de entrenamiento está lista para darte motivación y apoyo emocional hoy mismo.
                    </p>
                    <Link
                        href="/dashboard/coach"
                        className="inline-block bg-white text-purple-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-colors uppercase text-sm"
                    >
                        Hablar con el Coach
                    </Link>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Link from 'next/link';
import { User, ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginType, setLoginType] = useState<'client' | 'admin'>('client');
    const { login } = useAuth();
    const [error, setError] = useState('');

    // DEBUG: Check what API URL is being used
    // URL Check removed for production stability

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/auth/login', { email, password });

            // Check if user is trying to log into admin tab but isn't an admin, or vice versa
            // This is mostly cosmetic but adds to the experience
            const user = response.data.user;
            if (loginType === 'admin' && user.role !== 'admin') {
                setError('Esta cuenta no tiene privilegios de administrador.');
                return;
            }

            login(response.data.token, user);
        } catch (err: any) {
            setError(
                (err.response?.data?.error ? `${err.response.data.error}` : '') ||
                (err.response?.status ? `Error del servidor: ${err.response.status}` : '') ||
                err.message ||
                'Acceso denegado. Revisa tus credenciales.'
            );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F3E8FF] via-[#FDF2F8] to-[#E9D5FF] p-4">
            <div className="max-w-md w-full animate-in fade-in zoom-in duration-700">
                {/* Logo or Brand Placeholder */}
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
                        <div className="w-16 h-16 bg-gradient-to-tr from-[#9333EA] to-[#F472B6] rounded-full flex items-center justify-center">
                            <User className="text-white w-8 h-8" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-[#581C87] tracking-tight">EMILIA ENTRENAMIENTO APP</h1>
                    <p className="text-[#7E22CE] font-medium mt-2">Tu mejor versión comienza aquí</p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white overflow-hidden">
                    {/* Tabs Selection */}
                    <div className="flex bg-[#F3E8FF]/50 p-2 m-4 rounded-full">
                        <button
                            onClick={() => { setLoginType('client'); setError(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold transition-all ${loginType === 'client'
                                ? 'bg-white text-[#581C87] shadow-md scale-100'
                                : 'text-[#7E22CE] hover:bg-white/50 scale-95 opacity-70'
                                }`}
                        >
                            <User size={18} />
                            USUARIO
                        </button>
                        <button
                            onClick={() => { setLoginType('admin'); setError(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold transition-all ${loginType === 'admin'
                                ? 'bg-white text-[#9D174D] shadow-md scale-100 border-[#FBCFE8]'
                                : 'text-[#BE185D] hover:bg-white/50 scale-95 opacity-70'
                                }`}
                        >
                            <ShieldCheck size={18} />
                            ADMIN
                        </button>
                    </div>

                    <div className="p-8 pt-4">
                        <h2 className={`text-2xl font-black text-center mb-6 ${loginType === 'admin' ? 'text-[#9D174D]' : 'text-[#581C87]'}`}>
                            {loginType === 'admin' ? 'Panel de Control' : 'Bienvenido de nuevo'}
                        </h2>

                        {error && (
                            <div className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-sm font-bold text-center animate-bounce">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative group">
                                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${loginType === 'admin' ? 'group-focus-within:text-[#F472B6] text-pink-300' : 'group-focus-within:text-[#9333EA] text-purple-300'}`} size={20} />
                                <input
                                    type="email"
                                    placeholder="Tu correo electrónico"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-white/50 border-2 border-[#F3E8FF] group-focus-within:border-[#D8B4FE] rounded-full outline-none transition-all font-medium placeholder:text-gray-400"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${loginType === 'admin' ? 'group-focus-within:text-[#F472B6] text-pink-300' : 'group-focus-within:text-[#9333EA] text-purple-300'}`} size={20} />
                                <input
                                    type="password"
                                    placeholder="Tu contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-white/50 border-2 border-[#F3E8FF] group-focus-within:border-[#D8B4FE] rounded-full outline-none transition-all font-medium placeholder:text-gray-400"
                                    required
                                />
                            </div>

                            <div className="text-right px-2">
                                <Link href="/forgot-password" title="Recuperar contraseña" className={`text-sm font-bold hover:underline transition-colors ${loginType === 'admin' ? 'text-[#BE185D]' : 'text-[#7E22CE]'}`}>
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                className={`w-full flex items-center justify-center gap-2 py-4 rounded-full text-white font-black text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 ${loginType === 'admin'
                                    ? 'bg-gradient-to-r from-[#F472B6] to-[#BE185D]'
                                    : 'bg-gradient-to-r from-[#9333EA] to-[#7E22CE]'
                                    }`}
                            >
                                {loginType === 'admin' ? 'INGRESAR AL PANEL' : 'ENTRAR A ENTRENAR'}
                                <ArrowRight size={22} />
                            </button>
                        </form>

                        {loginType === 'client' && (
                            <div className="mt-8 text-center bg-[#FDF2F8] p-4 rounded-3xl border border-[#FBCFE8]">
                                <p className="text-sm text-[#BE185D] font-bold">
                                    ¿Nuevo por aquí?{' '}
                                    <Link href="/register" className="underline decoration-2 underline-offset-4 hover:text-[#9D174D] transition-colors">
                                        Crea tu cuenta ahora
                                    </Link>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

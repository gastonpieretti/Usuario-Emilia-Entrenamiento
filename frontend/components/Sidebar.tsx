"use client";

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';
import { Home, Users, FileText, Utensils, CheckCircle, Trash2, LayoutDashboard, Settings, LogOut, MessageSquare, Activity, PieChart, Bot } from 'lucide-react';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const isActive = (path: string) => pathname?.startsWith(path);

    return (
        <div className="w-64 bg-gray-800 text-white min-h-screen flex flex-col">
            <div className="p-6">
                <h1 className="text-2xl font-bold">MiAppFitness</h1>
                <p className="text-sm text-gray-400 mt-2">Hola, {user?.name}</p>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {user?.role === 'admin' ? (
                    <>
                        <Link href="/admin" className={`flex items-center gap-3 py-2 px-4 rounded transition-colors ${pathname === '/admin' ? 'bg-purple-600 text-white' : 'hover:bg-gray-700 text-gray-300'}`}>
                            <Home size={18} />
                            <span className="font-bold uppercase text-xs tracking-widest">Inicio</span>
                        </Link>
                        <Link href="/admin/users" className={`flex items-center gap-3 py-2 px-4 rounded transition-colors ${isActive('/admin/users') ? 'bg-gray-700 text-white' : 'hover:bg-gray-700 text-gray-300'}`}>
                            <Users size={18} />
                            <span>Usuarios</span>
                        </Link>
                        <Link href="/admin/routines" className={`flex items-center gap-3 py-2 px-4 rounded transition-colors ${isActive('/admin/routines') ? 'bg-gray-700 text-white' : 'hover:bg-gray-700 text-gray-300'}`}>
                            <FileText size={18} />
                            <span>Rutinas</span>
                        </Link>
                        <Link href="/admin/diets" className={`flex items-center gap-3 py-2 px-4 rounded transition-colors ${isActive('/admin/diets') ? 'bg-gray-700 text-white' : 'hover:bg-gray-700 text-gray-300'}`}>
                            <Utensils size={18} />
                            <span>Dietas</span>
                        </Link>
                        <Link href="/admin/approvals" className={`flex items-center gap-3 py-2 px-4 rounded transition-colors ${isActive('/admin/approvals') ? 'bg-gray-700 text-white' : 'hover:bg-gray-700 text-gray-300'}`}>
                            <CheckCircle size={18} />
                            <span>Aprobaciones</span>
                        </Link>
                        <Link href="/admin/trash" className={`flex items-center gap-3 py-2 px-4 rounded transition-colors ${isActive('/admin/trash') ? 'bg-gray-700 text-red-100' : 'hover:bg-gray-700 text-red-300'}`}>
                            <Trash2 size={18} />
                            <span>Papelera</span>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link href="/dashboard" className={`block py-2 px-4 rounded ${pathname === '/dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                            Inicio
                        </Link>
                        <Link href="/dashboard/profile" className={`block py-2 px-4 rounded ${isActive('/dashboard/profile') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                            Mi Perfil
                        </Link>
                        <Link href="/dashboard/routine" className={`block py-2 px-4 rounded ${isActive('/dashboard/routine') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                            Mi Rutina
                        </Link>
                        <Link href="/dashboard/diet" className={`block py-2 px-4 rounded ${isActive('/dashboard/diet') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                            Mi Dieta
                        </Link>
                        <Link href="/dashboard/progress" className={`block py-2 px-4 rounded ${isActive('/dashboard/progress') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                            Mi Progreso
                        </Link>
                        <Link href="/dashboard/coach" className={`flex items-center gap-2 py-2 px-4 rounded transition-all ${isActive('/dashboard/coach') ? 'bg-purple-600 font-bold' : 'hover:bg-gray-700 text-purple-200'}`}>
                            <Bot size={18} />
                            COACH ONLINE
                        </Link>
                        <Link href="/dashboard/messages" className={`block py-2 px-4 rounded ${isActive('/dashboard/messages') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                            Mensajes
                        </Link>
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-gray-700">
                <button onClick={logout} className="w-full text-left py-2 px-4 rounded hover:bg-red-600 transition-colors">
                    Cerrar Sesión
                </button>
            </div>
        </div >
    );
}

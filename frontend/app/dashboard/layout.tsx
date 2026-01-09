"use client";

import Sidebar from '../../components/Sidebar';
import AuthGuard from '../../components/AuthGuard';
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { usePathname } from 'next/navigation';
import { SocketProvider } from '../../context/SocketContext';
import { Menu } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const pathname = usePathname();

    useEffect(() => {
        if (!user || user.role === 'admin') return;

        const checkUnread = async () => {
            try {
                const res = await api.get('/messages/unread');
                setUnreadCount(res.data.count);
            } catch (error) {
                console.error('Error checking unread messages', error);
            }
        };
        checkUnread();
    }, [pathname, user]);

    const isExpired = user?.planExpiresAt && new Date(user.planExpiresAt) < new Date() && user.role !== 'admin';

    if (isExpired) {
        return (
            <AuthGuard>
                <div className="flex h-screen bg-gray-900 items-center justify-center p-4">
                    <div className="bg-white max-w-md w-full p-8 rounded-lg shadow-2xl text-center relative">
                        <button
                            onClick={logout}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        <div className="mb-6">
                            <span className="text-6xl">🔒</span>
                        </div>
                        <h1 className="text-2xl font-bold text-red-600 mb-4 uppercase">
                            Su plan ha vencido
                        </h1>
                        <p className="text-gray-700 font-medium mb-8">
                            PARA VOLVER A UTILIZAR LA APLICACIÓN DEBE RENOVAR SU PLAN.
                        </p>

                        <a
                            href="https://wa.me/59896584440?text=Emilia,%20mi%20plan%20esta%20vencido,%20quiero%20renobarlo."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg shadow transition-transform transform hover:scale-105 uppercase"
                        >
                            RENOVAR PLAN
                        </a>
                    </div>
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <SocketProvider userId={user?.id}>
                <div className="flex h-screen bg-gray-100 overflow-hidden">
                    <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        {/* Mobile Header */}
                        <header className="md:hidden bg-gray-800 text-white p-4 flex items-center justify-between z-30 shadow-md min-h-[56px]">
                            <h1 className="text-xl font-bold">MiAppFitness</h1>
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 hover:bg-gray-700 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                            >
                                <Menu size={24} />
                            </button>
                        </header>

                        <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
                            {unreadCount > 0 && !pathname?.includes('/messages') && (
                                <div className="bg-blue-600 text-white p-4 mb-6 rounded-lg shadow-lg flex items-center justify-between animate-bounce">
                                    <span className="font-bold flex items-center gap-2 text-sm md:text-base">
                                        🔔 TIENES UN NUEVO MENSAJE DE EMILIA ENTRENAMIENTO
                                    </span>
                                    <a href="/dashboard/messages" className="bg-white text-blue-600 px-4 py-1 rounded text-sm font-bold hover:bg-gray-100 whitespace-nowrap">
                                        LEER AHORA
                                    </a>
                                </div>
                            )}
                            {children}
                        </main>
                    </div>
                </div>
            </SocketProvider>
        </AuthGuard>
    );
}

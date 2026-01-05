"use client";

import { useEffect, useState } from 'react';
import api from '../../../utils/api';
import { User, CheckCircle, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface PendingUser {
    id: number;
    name: string;
    lastName: string;
    email: string;
    createdAt: string;
    hasCompletedOnboarding: boolean;
}

export default function AdminApprovalsPage() {
    const [users, setUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingUsers = async () => {
        try {
            const response = await api.get('/admin/pending');
            // Combine both categories for a unified list
            const allPending = [
                ...(response.data.pendingAccounts || []),
                ...(response.data.pendingRoutines || [])
            ];
            setUsers(allPending);
        } catch (error) {
            console.error('Error fetching pending users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
                    Aprobaciones Pendientes
                </h1>
                <div className="bg-slate-100 px-4 py-2 rounded-full text-slate-600 font-bold text-sm">
                    Total: {users.length}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-3xl" />)}
                </div>
            ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 shadow-sm">
                    <div className="bg-green-50 p-6 rounded-full mb-6">
                        <CheckCircle2 size={64} className="text-green-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">✅ No hay pendientes por el momento</h2>
                    <p className="text-slate-500 font-medium tracking-wide">¡Todo está al día! Buen trabajo.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className={`group relative bg-white border-2 rounded-[2.5rem] p-8 shadow-xl transition-all hover:scale-[1.03] overflow-hidden ${user.hasCompletedOnboarding ? 'border-red-400 shadow-red-50' : 'border-blue-400 shadow-blue-50'
                                }`}
                        >
                            <div className="flex flex-col h-full justify-between gap-6 relative z-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        {user.hasCompletedOnboarding ? (
                                            <div className="flex flex-col gap-2">
                                                <span className="bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit">Nueva Cuenta</span>
                                                <span className="bg-purple-100 text-purple-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit animate-pulse">🔥 Nueva Rutina Generada</span>
                                            </div>
                                        ) : (
                                            <span className="bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit">Nueva Cuenta</span>
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight">
                                        {user.name} {user.lastName}
                                    </h3>
                                    <p className="text-slate-500 text-sm mt-1 mb-4">{user.email}</p>
                                </div>

                                <Link href={`/admin/users/${user.id}?tab=routines`} className="w-full">
                                    <button className={`w-full py-4 px-6 rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all shadow-lg ${user.hasCompletedOnboarding ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                                        }`}>
                                        REVISAR <ArrowRight size={20} />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

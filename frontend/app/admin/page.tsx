'use client';

import { Users, FileText, Utensils, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import api from '../../utils/api';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function AdminDashboard() {
    const [pendingData, setPendingData] = useState<{ pendingAccounts: any[], pendingRoutines: any[] }>({
        pendingAccounts: [],
        pendingRoutines: []
    });
    const [loadingPending, setLoadingPending] = useState(true);

    const fetchData = async () => {
        try {
            const res = await api.get('/admin/pending');
            setPendingData(res.data);
        } catch (error) {
            console.error('Error fetching pending users', error);
        } finally {
            setLoadingPending(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (id: number) => {
        if (!confirm('¿Aprobar este usuario?')) return;
        try {
            await api.put(`/admin/${id}/approve`);
            fetchData();
        } catch (error) {
            console.error('Error approving', error);
            alert('Error al aprobar');
        }
    };

    const handleCancel = async (id: number) => {
        if (!confirm('¿Estás seguro de enviar este usuario a la papelera?')) return;
        try {
            await api.post(`/users/${id}/trash`);
            fetchData();
        } catch (error) {
            console.error('Error moving to trash', error);
            alert('Error al cancelar');
        }
    };

    const adminLinks = [
        {
            title: 'Usuarios',
            description: 'Gestionar usuarios registrados',
            icon: Users,
            href: '/admin/users',
            color: 'text-blue-500',
        },
        {
            title: 'Aprobaciones',
            description: 'Aprobar nuevos registros',
            icon: CheckCircle,
            href: '/admin/approvals',
            color: 'text-green-500',
        },
        {
            title: 'Rutinas',
            description: 'Crear y asignar rutinas',
            icon: FileText,
            href: '/admin/routines',
            color: 'text-purple-500',
        },
        {
            title: 'Dietas',
            description: 'Gestionar planes alimenticios',
            icon: Utensils,
            href: '/admin/diets',
            color: 'text-orange-500',
        },
    ];

    return (
        <div className="container mx-auto p-6 space-y-10">
            <h1 className="text-4xl font-black mb-8 text-slate-800 uppercase tracking-tighter">Panel de Administración</h1>

            {/* ACCOUNTS PENDING SECTION */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500 p-2 rounded-lg">
                        <Users className="text-white h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-black text-blue-600 uppercase tracking-tight">
                        CUENTAS PENDIENTES DE APROBACIÓN
                    </h2>
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
                        {pendingData.pendingAccounts.length}
                    </span>
                </div>

                {loadingPending ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl border" />)}
                    </div>
                ) : pendingData.pendingAccounts.length === 0 ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500">
                        No hay cuentas nuevas pendientes.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingData.pendingAccounts.map((user) => (
                            <div key={user.id} className="bg-white border-2 border-blue-400 rounded-3xl p-6 shadow-xl shadow-blue-50 overflow-hidden relative">
                                <div className="flex flex-col h-full justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-1">Nuevo Registro</p>
                                        <h3 className="text-2xl font-black text-slate-900 leading-tight">{user.name} {user.lastName}</h3>
                                        <p className="text-slate-500 text-sm">{user.email}</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleApprove(user.id)}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-6 rounded-2xl shadow-lg transition-all"
                                        >
                                            APROBAR
                                        </button>
                                        <button
                                            onClick={() => handleCancel(user.id)}
                                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 px-6 rounded-2xl transition-all"
                                        >
                                            CANCELAR
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ROUTINES PENDING SECTION */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="bg-red-500 p-2 rounded-lg animate-pulse">
                        <Clock className="text-white h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-black text-red-600 uppercase tracking-tight">
                        RUTINAS PENDIENTES DE REVISIÓN
                    </h2>
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                        {pendingData.pendingRoutines.length}
                    </span>
                </div>

                {loadingPending ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl border" />)}
                    </div>
                ) : pendingData.pendingRoutines.length === 0 ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500">
                        No hay rutinas pendientes.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingData.pendingRoutines.map((user) => (
                            <div key={user.id} className="group bg-white border-2 border-red-500 rounded-3xl p-6 shadow-xl shadow-red-50 transition-all hover:scale-[1.02] overflow-hidden">
                                <div className="flex flex-col h-full justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-1">Rutina para revisar</p>
                                        <h3 className="text-2xl font-black text-slate-900 leading-tight">{user.name} {user.lastName}</h3>
                                        <p className="text-slate-500 text-sm">{user.email}</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Link href={`/admin/users/${user.id}?tab=routines`} className="w-full">
                                            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200">
                                                REVISAR <ArrowRight size={20} />
                                            </button>
                                        </Link>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleApprove(user.id)}
                                                className="bg-green-100 hover:bg-green-200 text-green-700 font-bold py-3 rounded-2xl transition-all"
                                            >
                                                APROBAR
                                            </button>
                                            <button
                                                onClick={() => handleCancel(user.id)}
                                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-2xl transition-all"
                                            >
                                                CANCELAR
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <hr className="border-slate-200" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {adminLinks.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <Card className="hover:shadow-2xl transition-all cursor-pointer h-full border-2 border-transparent hover:border-slate-100 rounded-3xl overflow-hidden group">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">
                                    {item.title}
                                </CardTitle>
                                <item.icon className={`h-6 w-6 ${item.color} transition-transform group-hover:scale-125`} />
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base font-medium text-slate-600">{item.description}</CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState, use } from 'react';
import api from '../../../../utils/api';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { User, Activity, Utensils, Brain, MessageSquare, LineChart, ArrowLeft, ArrowRight, Send, Save, Lock, X, ChevronUp, ChevronDown, CheckCircle2, Copy, Plus, History, RotateCcw, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ExerciseDetailModal from '../../../../components/ExerciseDetailModal';
import ModifyExerciseModal from '../../../../components/ModifyExerciseModal';
import AddExerciseModal from '../../../../components/AddExerciseModal';
import ApplyTemplateModal from '../../../../components/ApplyTemplateModal';

interface UserData {
    id: number;
    name: string;
    lastName: string;
    email: string;
    role: string;
    isApproved?: boolean; // Added
    profile?: any;
    planExpiresAt?: string;
    planStartDate?: string;
    acquiredMonths?: number;
    planSchedule?: { month: number, start: string, end: string }[];
}

interface Message {
    id: number;
    content: string;
    senderId: number;
    createdAt: string;
    sender: { name: string; role: string };
}

const InputField = ({ label, value, onChange, type = "text" }: any) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type={type}
            value={value || ''}
            onChange={onChange}
            className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
    </div>
);

export default function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user: currentUser } = useAuth();

    // Check for tab in query param
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const tab = urlParams.get('tab');
            if (tab === 'routines' || tab === 'profile' || tab === 'progress' || tab === 'messages') {
                setActiveTab(tab as any);
            }
        }
    }, []);

    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'progress' | 'messages' | 'routines'>('profile');
    const [routines, setRoutines] = useState<any[]>([]);
    const [exerciseToDelete, setExerciseToDelete] = useState<any | null>(null);
    const [exerciseToModify, setExerciseToModify] = useState<any | null>(null);
    const [routineIdToAddExercise, setRoutineIdToAddExercise] = useState<number | null>(null);
    const [showApplyTemplateModal, setShowApplyTemplateModal] = useState(false);
    const [routineHistory, setRoutineHistory] = useState<{ open: boolean, routineId: number | null, items: any[] }>({ open: false, routineId: null, items: [] });
    // Dynamic naming constant
    const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    // Create Routine State
    const [showCreateRoutineModal, setShowCreateRoutineModal] = useState(false);
    const [newRoutineDay, setNewRoutineDay] = useState('Lunes');

    // Edit State
    const [formData, setFormData] = useState<any>({});
    const [newPassword, setNewPassword] = useState('');

    // Messages State
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');

    const fetchData = async () => {
        try {
            const userRes = await api.get(`/users/${id}`);
            setUser(userRes.data);

            const profile = userRes.data.profile || {};
            const acquiredMonths = userRes.data.acquiredMonths || 1;
            let planSchedule = userRes.data.planSchedule || [];
            if (planSchedule.length === 0) {
                // Generar schedule inicial si no existe
                for (let i = 1; i <= acquiredMonths; i++) {
                    planSchedule.push({
                        month: i,
                        start: i === 1 ? (userRes.data.planStartDate || '') : '',
                        end: ''
                    });
                }
            }

            setFormData({
                ...userRes.data,
                planSchedule,
                profile: {
                    ...profile,
                    painAreas: profile.painAreas?.join(', ') || '',
                    equipment: profile.equipment?.join(', ') || '',
                    dislikedFood: profile.dislikedFood || '',
                    drinks: profile.drinks?.join(', ') || '',
                    digestiveIssues: profile.digestiveIssues?.join(', ') || '',
                    abandonmentCauses: profile.abandonmentCauses?.join(', ') || '',
                }
            });

            const msgRes = await api.get(`/messages?otherUserId=${id}`);
            setMessages(msgRes.data);

            const routinesRes = await api.get(`/routines?userId=${id}`);
            setRoutines(routinesRes.data);
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            const res = await api.post('/messages', {
                receiverId: id,
                content: newMessage
            });
            setMessages([...messages, {
                ...res.data,
                sender: { name: currentUser?.name || 'Admin', role: 'admin' }
            }]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message', error);
        }
    };

    const confirmDeleteExercise = async () => {
        if (!exerciseToDelete) return;
        try {
            await api.delete(`/routines/exercises/${exerciseToDelete.id}`);
            // Refresh routines
            const routinesRes = await api.get(`/routines?userId=${id}`);
            setRoutines(routinesRes.data);
            setExerciseToDelete(null);
            alert('Ejercicio eliminado');
        } catch (error) {
            console.error('Error deleting exercise', error);
            alert('Error al eliminar el ejercicio');
        }
    };

    const handleUpdateExercise = (re: any) => {
        setExerciseToModify(re);
    };

    const onUpdateConfirm = async () => {
        // Refresh routines
        const routinesRes = await api.get(`/routines?userId=${id}`);
        setRoutines(routinesRes.data);
        alert('Cambios guardados');
    };

    const onAddConfirm = async () => {
        // Refresh routines
        const routinesRes = await api.get(`/routines?userId=${id}`);
        setRoutines(routinesRes.data);
        alert('Ejercicio añadido');
    };

    const handleMoveExercise = async (routineId: number, reId: number, direction: 'up' | 'down') => {
        const routine = routines.find(r => r.id === routineId);
        if (!routine) return;

        const exercises = [...routine.exercises].sort((a, b) => a.order - b.order);
        const index = exercises.findIndex((re: any) => re.id === reId);
        if (index === -1) return;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= exercises.length) return;

        const currentRE = exercises[index];
        const targetRE = exercises[targetIndex];

        // Robust swap: if orders are same or invalid, we use indices as orders temporarily
        let newCurrentOrder = targetRE.order;
        let newTargetOrder = currentRE.order;

        if (newCurrentOrder === newTargetOrder) {
            newCurrentOrder = targetIndex;
            newTargetOrder = index;
        }

        try {
            await Promise.all([
                api.patch(`/routines/exercises/${currentRE.id}`, { order: newCurrentOrder }),
                api.patch(`/routines/exercises/${targetRE.id}`, { order: newTargetOrder })
            ]);

            const routinesRes = await api.get(`/routines?userId=${id}`);
            setRoutines(routinesRes.data);
        } catch (error) {
            console.error('Error moving exercise', error);
            alert('Error al mover el ejercicio');
        }
    };

    const handleMoveRoutine = async (routineId: number, direction: 'up' | 'down') => {
        const sortedRoutines = [...routines].sort((a, b) => a.order - b.order);
        const index = sortedRoutines.findIndex(r => r.id === routineId);
        if (index === -1) return;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= sortedRoutines.length) return;

        // Swap in local array
        const temp = sortedRoutines[index];
        sortedRoutines[index] = sortedRoutines[targetIndex];
        sortedRoutines[targetIndex] = temp;

        try {
            // "Renombrado Lógico": Update ALL routines to match their new index (Lunes, Martes, etc.)
            // We treat the visual order as the source of truth for Day Name.
            const updates = sortedRoutines.map((r, i) =>
                api.patch(`/routines/${r.id}`, {
                    order: i,
                    weekDay: WEEK_DAYS[i] || r.weekDay // Fallback if >7 days
                })
            );

            await Promise.all(updates);

            const routinesRes = await api.get(`/routines?userId=${id}`);
            setRoutines(routinesRes.data);
        } catch (error) {
            console.error('Error moving routine', error);
            alert('Error al mover el bloque de día');
        }
    };

    const handleDuplicateRoutine = async (routineId: number) => {
        if (!confirm('¿Duplicar este día? Se añadirá al final.')) return;
        try {
            await api.post(`/routines/${routineId}/duplicate`);
            toast.success('Rutina duplicada');
            fetchData();
        } catch (error) {
            console.error('Error duplicating routine', error);
            alert('Error al duplicar la rutina');
        }
    };

    const handleDeleteRoutine = async (routineId: number) => {
        if (!confirm('¿Confirmar eliminar el día completo?')) return;
        try {
            await api.delete(`/routines/${routineId}`);
            const routinesRes = await api.get(`/routines?userId=${id}`);
            setRoutines(routinesRes.data);
        } catch (error) {
            console.error('Error deleting routine', error);
            alert('Error al eliminar la rutina');
        }
    };

    const handleUpdateRoutineDay = async (routineId: number, newDay: string) => {
        try {
            await api.patch(`/routines/${routineId}`, { weekDay: newDay });
            const routinesRes = await api.get(`/routines?userId=${id}`);
            setRoutines(routinesRes.data);
        } catch (error) {
            console.error('Error updating routine day', error);
            alert('Error al cambiar el día de la rutina');
        }
    };

    const handleViewGlobalHistory = async () => {
        try {
            const res = await api.get(`/routines/history/user/${id}`);
            setRoutineHistory({ open: true, routineId: null, items: res.data });
        } catch (error) {
            console.error('Error fetching history', error);
            alert('Error al obtener el historial');
        }
    };

    const handleCreateRoutine = async () => {
        // Check if day exists
        const exists = routines.some(r => r.weekDay === newRoutineDay);
        if (exists) {
            alert(`Ya existe una rutina para el día ${newRoutineDay}`);
            return;
        }

        try {
            await api.post('/routines', {
                userId: id,
                weekDay: newRoutineDay
            });
            toast.success('Día de rutina creado');
            setShowCreateRoutineModal(false);
            fetchData();
        } catch (error: any) {
            console.error('Error creating routine', error);
            const msg = error.response?.data?.error || error.message || 'Error desconocido';
            alert(`Error al crear la rutina: ${msg}`);
        }
    };

    const handleRestoreHistory = async (historyId: number) => {
        if (!confirm('¿Estás seguro de restaurar esta versión? Se perderán los cambios actuales.')) return;
        try {
            await api.post(`/routines/history/${historyId}/restore`);
            const routinesRes = await api.get(`/routines?userId=${id}`);
            setRoutines(routinesRes.data);
            setRoutineHistory({ ...routineHistory, open: false });
            alert('Versión restaurada correctamente');
        } catch (error) {
            console.error('Error restoring history', error);
            alert('Error al restaurar la versión');
        }
    };

    const handleApprovePlan = async () => {
        const count = formData.acquiredMonths || 1;
        if (!confirm(`¿Confirmar aprobación de todo el Plan de Entrenamiento (${count} ${count === 1 ? 'Mes' : 'Meses'}) para este usuario?`)) return;
        try {
            // Approve all acquired months
            for (let m = 1; m <= count; m++) {
                await api.post(`/routines/0/approve`, { userId: id, month: m });
            }

            toast.success(`¡Plan de ${count} ${count === 1 ? 'Mes' : 'Meses'} Aprobado!`, {
                duration: 5000,
                icon: '🔥',
                style: { background: '#7C3AED', color: '#fff', fontWeight: 'bold' }
            });
            fetchData();
        } catch (error) {
            console.error('Error approving plan', error);
            toast.error('Error al aprobar el plan');
        }
    };

    const handleDenyPlan = async () => {
        if (!confirm('¿Estás seguro de RECHAZAR y ELIMINAR este plan? El usuario no podrá ver nada hasta que se genere uno nuevo.')) return;
        try {
            // For now, let's just delete unapproved routines. Or we could have a specific deny endpoint.
            // I added denyRoutine in backend which takes an ID. 
            // If we want to deny THE WHOLE month, we might need a many-delete.
            // But let's just call delete for each unapproved routine for now, or use a bulk delete if I implement it.
            // Actually, I'll just use the existing deleteRoutine logic but for all.
            const unapproved = routines.filter(r => !r.isApproved);
            await Promise.all(unapproved.map(r => api.delete(`/routines/${r.id}`)));

            toast.error('Plan rechazado y eliminado', { duration: 5000 });
            fetchData();
        } catch (error) {
            console.error('Error denying plan', error);
            alert('Error al rechazar plan');
        }
    };

    const handleInputChange = (section: string, field: string, value: any) => {
        if (section === 'main') {
            setFormData({ ...formData, [field]: value });
        } else if (section === 'profile') {
            setFormData({
                ...formData,
                profile: {
                    ...formData.profile,
                    [field]: value
                }
            });
        }
    };

    const handleSaveProfile = async () => {
        try {
            // Helper to split string
            const split = (str: string) => str ? str.split(',').map(s => s.trim()) : [];

            const painList = Array.isArray(formData.profile.painAreas)
                ? formData.profile.painAreas
                : split(formData.profile.painAreas).map((s: string) => s.toLowerCase());

            const payload: any = { // Use 'any' for payload to allow adding 'password' dynamically
                ...formData,
                profile: {
                    ...formData.profile,
                    painRodilla: painList.includes('rodilla'),
                    painColumna: painList.includes('columna') || painList.includes('espalda'),
                    painHombro: painList.includes('hombro'),
                    equipment: Array.isArray(formData.profile.equipment) ? formData.profile.equipment : split(formData.profile.equipment),
                    drinks: Array.isArray(formData.profile.drinks) ? formData.profile.drinks : split(formData.profile.drinks),
                    digestiveIssues: Array.isArray(formData.profile.digestiveIssues) ? formData.profile.digestiveIssues : split(formData.profile.digestiveIssues),
                    abandonmentCauses: Array.isArray(formData.profile.abandonmentCauses) ? formData.profile.abandonmentCauses : split(formData.profile.abandonmentCauses),
                }
            };

            // If a new password was typed, include it
            if (newPassword && newPassword.length >= 6) {
                payload.password = newPassword;
            }

            // Remove internal fields and incompatible ones
            delete payload.id;
            delete payload.role;
            delete payload.routines;
            delete payload.diets;
            delete payload.messages;
            delete payload.createdAt;
            delete payload.updatedAt;
            delete payload.profile.userId;
            delete payload.profile.id;
            delete payload.profile.createdAt;
            delete payload.profile.updatedAt;
            delete payload.profile.painAreas; // Remove the non-existent field

            await api.put(`/users/${id}`, payload);
            setNewPassword(''); // Clear password field after success
            alert('Perfil actualizado correctamente');
        } catch (error) {
            console.error('Error updating user', error);
            alert('Error al actualizar el perfil');
        }
    };

    const handlePasswordReset = async () => {
        if (!newPassword || newPassword.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        if (!confirm('¿Estás seguro de cambiar la contraseña de este usuario?')) return;

        try {
            await api.put(`/users/${id}`, { password: newPassword });
            setNewMessage('');
            alert('Contraseña actualizada correctamente');
        } catch (error) {
            console.error('Error updating password', error);
            alert('Error al actualizar la contraseña');
        }
    };



    const handleMonthChange = (count: number) => {
        const currentSchedule = formData.planSchedule || [];
        let newSchedule = [...currentSchedule];

        if (count > newSchedule.length) {
            for (let i = newSchedule.length + 1; i <= count; i++) {
                newSchedule.push({ month: i, start: '', end: '' });
            }
        } else {
            newSchedule = newSchedule.slice(0, count);
        }

        setFormData({
            ...formData,
            acquiredMonths: count,
            planSchedule: newSchedule
        });
    };

    const handleScheduleDateChange = (monthIndex: number, field: 'start' | 'end', value: string) => {
        const newSchedule = [...(formData.planSchedule || [])];
        if (newSchedule[monthIndex]) {
            newSchedule[monthIndex] = { ...newSchedule[monthIndex], [field]: value };
            setFormData({ ...formData, planSchedule: newSchedule });
        }
    };

    if (loading) return <div className="p-8">Cargando...</div>;
    if (!user) return <div className="p-8">Usuario no encontrado</div>;

    const p = formData.profile || {};

    return (
        <div className="container mx-auto p-6 space-y-6">
            <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
                <ArrowLeft size={20} className="mr-2" /> Volver
            </button>

            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-3xl font-bold">{formData.name} {formData.lastName}</h1>
                <div className="space-x-2 flex flex-wrap gap-2">
                    {['profile', 'progress', 'messages', 'routines'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded capitalize ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        >
                            {tab === 'profile' ? 'Perfil' : tab === 'progress' ? 'Progreso' : tab === 'messages' ? 'Mensajes' : 'Rutina'}
                        </button>
                    ))}

                    <button
                        onClick={async () => {
                            if (!confirm('¿Generar rutinas automáticas? Esto creará nuevas rutinas basadas en el perfil.')) return;
                            try {
                                await api.post('/routines/generate', { userId: user.id });
                                alert('Rutinas generadas exitosamente!');
                                fetchData();
                            } catch (e: any) {
                                console.error(e);
                                const msg = e.response?.data?.error || e.message || 'Error desconocido';
                                alert(`Error al generar rutinas: ${msg}`);
                            }
                        }}
                        className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 font-bold shadow-md"
                    >
                        Generar Rutinas
                    </button>

                    <button
                        onClick={async () => {
                            if (!confirm('¿Estás seguro de enviar este usuario a la papelera? Podrás restaurarlo después.')) return;
                            try {
                                await api.post(`/users/${id}/trash`);
                                alert('Usuario movido a la papelera');
                                router.push('/admin/users');
                            } catch (e) {
                                console.error(e);
                                alert('Error al eliminar usuario');
                            }
                        }}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                        ELIMINAR USUARIO
                    </button>
                </div>
            </div>

            {/* TAB: PROFILE (EDIT MODE) */}
            {activeTab === 'profile' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Account Info */}
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><User className="text-blue-500" /> Datos de Cuenta</CardTitle></CardHeader>
                            <CardContent>
                                <InputField label="Nombre" value={formData.name} onChange={(e: any) => handleInputChange('main', 'name', e.target.value)} />
                                <InputField label="Apellido" value={formData.lastName} onChange={(e: any) => handleInputChange('main', 'lastName', e.target.value)} />
                                <InputField label="Email" value={formData.email} onChange={(e: any) => handleInputChange('main', 'email', e.target.value)} />
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento del Plan</label>
                                    <input
                                        type="date"
                                        value={formData.planExpiresAt ? new Date(formData.planExpiresAt).toISOString().split('T')[0] : ''}
                                        onChange={(e) => handleInputChange('main', 'planExpiresAt', e.target.value)}
                                        className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Si se deja vacío, no tiene vencimiento.</p>
                                </div>
                                <div className="border-t pt-4 mt-4 space-y-4">
                                    <h4 className="font-bold text-sm uppercase text-gray-500 flex items-center gap-2">
                                        <Clock size={16} /> Configuración de Desbloqueo
                                    </h4>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Meses Adquiridos (Abonados)</label>
                                        <select
                                            value={formData.acquiredMonths || 1}
                                            onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                                            className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                                        >
                                            {[1, 2, 3, 4, 5, 6].map(m => (
                                                <option key={m} value={m}>{m} {m === 1 ? 'Mes' : 'Meses'}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Dynamic Date Inputs */}
                                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        {(formData.planSchedule || []).map((mSchedule: any, idx: number) => (
                                            <div key={idx} className="space-y-2 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                                                <p className="font-bold text-xs text-blue-600 uppercase">Mes {mSchedule.month}</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-[10px] uppercase font-bold text-gray-400">Inicio</label>
                                                        <input
                                                            type="date"
                                                            value={mSchedule.start ? new Date(mSchedule.start).toISOString().split('T')[0] : ''}
                                                            onChange={(e) => handleScheduleDateChange(idx, 'start', e.target.value)}
                                                            className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] uppercase font-bold text-gray-400">Fin</label>
                                                        <input
                                                            type="date"
                                                            value={mSchedule.end ? new Date(mSchedule.end).toISOString().split('T')[0] : ''}
                                                            onChange={(e) => handleScheduleDateChange(idx, 'end', e.target.value)}
                                                            className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={async () => {
                                            try {
                                                const firstMonthStart = formData.planSchedule?.[0]?.start;
                                                await api.put(`/admin/${id}/plan`, {
                                                    planStartDate: firstMonthStart || formData.planStartDate,
                                                    acquiredMonths: formData.acquiredMonths,
                                                    planSchedule: formData.planSchedule
                                                });
                                                toast.success('Cronograma detallado actualizado');
                                                fetchData();
                                            } catch (e) {
                                                console.error(e);
                                                toast.error('Error al actualizar cronograma');
                                            }
                                        }}
                                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95"
                                    >
                                        GUARDAR CONFIGURACIÓN
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Password Reset */}
                        <Card className="border-red-200">
                            <CardHeader><CardTitle className="flex items-center gap-2 text-red-600"><Lock className="text-red-500" /> Seguridad (Admin)</CardTitle></CardHeader>
                            <CardContent>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña para el Usuario</label>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        placeholder="Escribe nueva contraseña"
                                        className="flex-1 border p-2 rounded"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <button
                                        onClick={handlePasswordReset}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Cambiar
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Esta acción cambiará la contraseña inmediatamente.</p>
                            </CardContent>
                        </Card>

                        {/* Profile Fields */}
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><User className="text-blue-500" /> Información Personal</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Whatsapp" value={p.whatsapp} onChange={(e: any) => handleInputChange('profile', 'whatsapp', e.target.value)} />
                                <InputField label="Ciudad" value={p.city} onChange={(e: any) => handleInputChange('profile', 'city', e.target.value)} />
                                <InputField label="País" value={p.country} onChange={(e: any) => handleInputChange('profile', 'country', e.target.value)} />
                                <InputField label="Ocupación" value={p.occupation} onChange={(e: any) => handleInputChange('profile', 'occupation', e.target.value)} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="text-green-500" /> Estado Físico</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Peso (kg)" type="number" value={p.weight} onChange={(e: any) => handleInputChange('profile', 'weight', parseFloat(e.target.value))} />
                                <InputField label="Altura (cm)" type="number" value={p.height} onChange={(e: any) => handleInputChange('profile', 'height', parseFloat(e.target.value))} />
                                <div className="md:col-span-2">
                                    <InputField label="Dolores (separar con comas)" value={p.painAreas} onChange={(e: any) => handleInputChange('profile', 'painAreas', e.target.value)} />
                                    <InputField label="Lesiones" value={p.injuries} onChange={(e: any) => handleInputChange('profile', 'injuries', e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Utensils className="text-orange-500" /> Nutrición</CardTitle></CardHeader>
                            <CardContent>
                                <InputField label="Dieta Preferida" value={p.dietPreference} onChange={(e: any) => handleInputChange('profile', 'dietPreference', e.target.value)} />
                                <InputField label="Comidas/día" type="number" value={p.mealsPerDay} onChange={(e: any) => handleInputChange('profile', 'mealsPerDay', parseInt(e.target.value))} />
                                <InputField label="Agua" value={p.waterIntake} onChange={(e: any) => handleInputChange('profile', 'waterIntake', e.target.value)} />
                                <InputField label="Alimentos odiados" value={p.dislikedFood} onChange={(e: any) => handleInputChange('profile', 'dislikedFood', e.target.value)} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="text-purple-500" /> Entrenamiento</CardTitle></CardHeader>
                            <CardContent>
                                <InputField label="Objetivo" value={p.goal} onChange={(e: any) => handleInputChange('profile', 'goal', e.target.value)} />
                                <InputField label="Nivel" value={p.experienceLevel} onChange={(e: any) => handleInputChange('profile', 'experienceLevel', e.target.value)} />
                                <InputField label="Lugar" value={p.trainingLocation} onChange={(e: any) => handleInputChange('profile', 'trainingLocation', e.target.value)} />
                                <InputField label="Equipo (separar con comas)" value={p.equipment} onChange={(e: any) => handleInputChange('profile', 'equipment', e.target.value)} />
                                <InputField label="Días/Semana" type="number" value={p.daysPerWeek} onChange={(e: any) => handleInputChange('profile', 'daysPerWeek', parseInt(e.target.value))} />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end p-4 bg-white rounded shadow sticky bottom-4 z-10">
                        <button
                            onClick={handleSaveProfile}
                            className="bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-[2rem] font-black shadow-xl shadow-green-100 flex items-center gap-3 uppercase tracking-widest transition-all active:scale-95"
                        >
                            <Save size={24} /> GUARDAR CAMBIOS
                        </button>
                    </div>
                </div>
            )}

            {/* TAB: PROGRESS */}
            {activeTab === 'progress' && (
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><LineChart className="text-blue-500" /> Historial de Progreso</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-gray-500">Funcionalidad de gráficos en desarrollo.</p>
                    </CardContent>
                </Card>
            )}

            {/* TAB: MESSAGES */}
            {activeTab === 'messages' && (
                <Card className="h-[600px] flex flex-col">
                    <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="text-blue-500" /> Chat con {user.name}</CardTitle></CardHeader>
                    <CardContent className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-md mx-6 mb-4 border">
                        {messages.length === 0 ? (
                            <p className="text-center text-gray-500 my-8">No hay mensajes aún.</p>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-3 rounded-lg ${msg.senderId === currentUser?.id
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white border text-gray-800 rounded-bl-none'
                                        }`}>
                                        <p>{msg.content}</p>
                                        <p className={`text-xs mt-1 ${msg.senderId === currentUser?.id ? 'text-blue-100' : 'text-gray-400'}`}>
                                            {new Date(msg.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                    <div className="p-4 border-t bg-white rounded-b-xl">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Escribe un mensaje..."
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition">
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </Card>
            )}

            {/* TAB: ROUTINES */}
            {activeTab === 'routines' && (
                <div className="space-y-6">
                    {routines.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center text-gray-500">
                                <p className="text-xl font-medium">Este usuario no tiene rutinas generadas aún.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-[#581C87] uppercase tracking-wider flex items-center gap-2">
                                    <Activity className="text-purple-500" /> Rutinas Activas
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleViewGlobalHistory}
                                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm"
                                    >
                                        <History size={16} /> HISTORIAL
                                    </button>

                                    {/* ROUTINE TAB APPROVE BUTTON */}
                                    {(!user.isApproved || routines.some(r => !r.isApproved)) && (
                                        <div className="flex gap-2">
                                            {user.isApproved && routines.some(r => !r.isApproved) && (
                                                <button
                                                    onClick={handleDenyPlan}
                                                    className="bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
                                                >
                                                    DENEGAR PLAN
                                                </button>
                                            )}
                                            <button
                                                onClick={async () => {
                                                    if (!user.isApproved) {
                                                        if (!confirm('¿Confirmar aprobación de CUENTA? El usuario podrá ingresar a la app.')) return;
                                                        try {
                                                            await api.put(`/admin/${id}/approve`);
                                                            toast.success('Cuenta aprobada con éxito');
                                                            fetchData();
                                                        } catch (e) {
                                                            console.error(e);
                                                            alert('Error al aprobar cuenta');
                                                        }
                                                    } else {
                                                        handleApprovePlan();
                                                    }
                                                }}
                                                className="bg-[#DC2626] hover:bg-red-700 text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-100 flex items-center gap-2"
                                            >
                                                {!user.isApproved ? (
                                                    <>APROBAR CUENTA <ArrowRight size={14} /></>
                                                ) : (
                                                    <>APROBAR PLAN <CheckCircle2 size={14} /></>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setShowApplyTemplateModal(true)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all active:scale-95"
                                    >
                                        <Copy size={16} /> PLANTILLA
                                    </button>
                                    <button
                                        onClick={() => setShowCreateRoutineModal(true)}
                                        className="bg-pink-100 text-pink-600 hover:bg-pink-200 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm"
                                    >
                                        <Plus size={16} /> CREAR
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {routines.sort((a, b) => {
                                    if (a.month !== b.month) return a.month - b.month;
                                    const dayOrder: any = { 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 7 };
                                    return (dayOrder[a.weekDay] || 99) - (dayOrder[b.weekDay] || 99);
                                }).map((routine, rIdx) => (
                                    <Card key={routine.id} className="rounded-[3rem] border-2 border-purple-100 overflow-hidden shadow-sm hover:shadow-xl transition-all h-full flex flex-col">
                                        <CardHeader className="bg-purple-50/50 p-6">
                                            <div className="flex gap-4 items-start">
                                                {/* Reorder Arrows */}
                                                <div className="flex flex-col gap-2 pt-1">
                                                    <button
                                                        disabled={rIdx === 0}
                                                        onClick={() => handleMoveRoutine(routine.id, 'up')}
                                                        className={`p-1 rounded-full ${rIdx === 0 ? 'text-gray-300' : 'text-purple-400 hover:bg-purple-200'}`}
                                                    >
                                                        <ChevronUp size={24} strokeWidth={3} />
                                                    </button>
                                                    <button
                                                        disabled={rIdx === routines.length - 1}
                                                        onClick={() => handleMoveRoutine(routine.id, 'down')}
                                                        className={`p-1 rounded-full ${rIdx === routines.length - 1 ? 'text-gray-300' : 'text-purple-400 hover:bg-purple-200'}`}
                                                    >
                                                        <ChevronDown size={24} strokeWidth={3} />
                                                    </button>
                                                </div>

                                                <div className="flex-1 flex flex-col gap-4">
                                                    {/* Row 1: Actions (Right Aligned) */}
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setRoutineIdToAddExercise(routine.id)}
                                                            className="w-10 h-10 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors"
                                                            title="Añadir Ejercicio"
                                                        >
                                                            <Plus size={20} strokeWidth={3} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDuplicateRoutine(routine.id)}
                                                            className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                                                            title="Duplicar Día"
                                                        >
                                                            <Copy size={18} strokeWidth={3} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRoutine(routine.id)}
                                                            className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition-colors"
                                                            title="Eliminar Día"
                                                        >
                                                            <X size={20} strokeWidth={3} />
                                                        </button>
                                                    </div>

                                                    {/* Row 2: Info (Day & Count) */}
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-3xl font-black text-[#581C87] uppercase tracking-tighter leading-none">
                                                                {routine.weekDay}
                                                            </h3>
                                                            <span className="bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Mes {routine.month}</span>
                                                            {!routine.isApproved && (
                                                                <span className="bg-amber-100 text-amber-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-amber-200">Pendiente</span>
                                                            )}
                                                            {routine.isApproved && (
                                                                <span className="bg-green-100 text-green-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-green-200">Aprobada</span>
                                                            )}
                                                        </div>
                                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1 ml-1">
                                                            {routine.exercises.length} ejercicios
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                <AnimatePresence mode="popLayout">
                                                    {routine.exercises.map((re: any, index: number) => (
                                                        <motion.div
                                                            key={re.id}
                                                            layout
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            transition={{
                                                                layout: { type: "spring", stiffness: 300, damping: 30 },
                                                                opacity: { duration: 0.2 }
                                                            }}
                                                            className="flex items-center gap-4 p-4 bg-white rounded-[2rem] border border-[#F3E8FF] shadow-sm hover:shadow-md transition-shadow"
                                                        >
                                                            {/* Reorder Arrows */}
                                                            <div className="flex flex-col gap-1">
                                                                <button
                                                                    disabled={index === 0}
                                                                    onClick={() => handleMoveExercise(routine.id, re.id, 'up')}
                                                                    className={`p-1 rounded-full transition-colors ${index === 0 ? 'text-gray-200' : 'text-purple-400 hover:bg-purple-50 hover:text-purple-600'}`}
                                                                >
                                                                    <ChevronUp size={20} strokeWidth={3} />
                                                                </button>
                                                                <button
                                                                    disabled={index === routine.exercises.length - 1}
                                                                    onClick={() => handleMoveExercise(routine.id, re.id, 'down')}
                                                                    className={`p-1 rounded-full transition-colors ${index === routine.exercises.length - 1 ? 'text-gray-200' : 'text-purple-400 hover:bg-purple-50 hover:text-purple-600'}`}
                                                                >
                                                                    <ChevronDown size={20} strokeWidth={3} />
                                                                </button>
                                                            </div>

                                                            <div className="flex-1">
                                                                <h4 className="font-black text-[#581C87] uppercase text-sm">{re.exercise.nombre}</h4>
                                                                <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                                                                    {re.sets} series x {re.reps} reps
                                                                </p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleUpdateExercise(re)}
                                                                    className="px-4 py-2 bg-[#E9D5FF] hover:bg-[#D8B4FE] text-[#581C87] rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                                                                >
                                                                    Modificar
                                                                </button>
                                                                <button
                                                                    onClick={() => setExerciseToDelete(re)}
                                                                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                                                                >
                                                                    Eliminar
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )
            }

            {/* Delete Confirmation Modal */}
            {
                exerciseToDelete && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                        <div className="bg-white rounded-[2rem] max-w-sm w-full p-8 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X size={32} strokeWidth={3} />
                            </div>
                            <h3 className="text-2xl font-black text-[#581C87] leading-tight">
                                ¿Confirmas eliminar este ejercicio?
                            </h3>
                            <p className="text-gray-500 font-medium">
                                Esta acción quitará <span className="text-[#581C87] font-bold">{exerciseToDelete.exercise.nombre}</span> de la rutina de forma permanente.
                            </p>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setExerciseToDelete(null)}
                                    className="flex-1 py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full font-black uppercase tracking-widest transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDeleteExercise}
                                    className="flex-1 py-4 px-6 bg-red-600 hover:bg-red-700 text-white rounded-full font-black uppercase tracking-widest shadow-lg shadow-red-200 transition-all"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modify Exercise Modal */}
            {
                exerciseToModify && (
                    <ModifyExerciseModal
                        routineExerciseId={exerciseToModify.id}
                        currentExercise={exerciseToModify.exercise}
                        currentSets={exerciseToModify.sets}
                        currentReps={exerciseToModify.reps}
                        onClose={() => setExerciseToModify(null)}
                        onConfirm={onUpdateConfirm}
                    />
                )
            }

            {/* Add Exercise Modal */}
            {
                routineIdToAddExercise && (
                    <AddExerciseModal
                        routineId={routineIdToAddExercise}
                        onClose={() => setRoutineIdToAddExercise(null)}
                        onConfirm={onAddConfirm}
                    />
                )
            }

            {
                showApplyTemplateModal && (
                    <ApplyTemplateModal
                        userId={Number(id)}
                        onClose={() => setShowApplyTemplateModal(false)}
                        onConfirm={onAddConfirm}
                    />
                )
            }

            {/* Routine History Modal */}
            {routineHistory.open && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-[3rem] max-w-2xl w-full p-10 shadow-2xl space-y-8 overflow-hidden relative"
                    >
                        <button
                            onClick={() => setRoutineHistory({ ...routineHistory, open: false })}
                            className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={28} />
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-blue-100 text-blue-600 rounded-3xl">
                                <History size={32} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-[#581C87] uppercase tracking-tighter">Historial de Cambios</h2>
                                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Restaurar versiones anteriores</p>
                            </div>
                        </div>

                        <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {routineHistory.items.length === 0 ? (
                                <div className="p-12 text-center text-gray-400 font-medium">
                                    No hay historial disponible para esta rutina.
                                </div>
                            ) : (
                                routineHistory.items.map((item) => (
                                    <div key={item.id} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center justify-between group hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${item.changeType === 'delete' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                <RotateCcw size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                                                    {item.routine?.weekDay} • {item.routine?.title}
                                                </p>
                                                <p className="font-black text-[#581C87] uppercase text-sm">
                                                    {item.changeType === 'modify' ? 'Modificación' : item.changeType === 'delete' ? 'Eliminación (Snapshot)' : 'Cambio'}
                                                </p>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
                                                    {new Date(item.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRestoreHistory(item.id)}
                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-95"
                                        >
                                            Restaurar
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="pt-4 text-center">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Snapshots automáticos antes de cada cambio</p>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Create Routine Modal */}
            {showCreateRoutineModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] max-w-sm w-full p-8 shadow-2xl relative"
                    >
                        <button
                            onClick={() => setShowCreateRoutineModal(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Plus size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-[#581C87] uppercase tracking-tighter">Crear Día</h2>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Añadir nuevo bloque de rutina</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-[#581C87] uppercase tracking-widest mb-2 ml-2">Seleccionar Día</label>
                                <div className="relative">
                                    <select
                                        value={newRoutineDay}
                                        onChange={(e) => setNewRoutineDay(e.target.value)}
                                        className="w-full bg-gray-50 border-2 border-gray-100 text-[#581C87] font-bold rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-pink-300 focus:bg-pink-50 transition-all"
                                    >
                                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                                </div>
                            </div>

                            <button
                                onClick={handleCreateRoutine}
                                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-pink-200 transition-all active:scale-95 mt-2"
                            >
                                Crear Rutina
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

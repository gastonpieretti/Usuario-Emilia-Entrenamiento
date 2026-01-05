"use client";

import { useEffect, useState } from 'react';
import api from '../../../utils/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, RotateCcw, XCircle } from 'lucide-react';

interface User {
    id: number;
    email: string;
    name: string;
    lastName: string;
    role: string;
}

export default function TrashPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchTrash = async () => {
        try {
            const response = await api.get('/users/trash');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching trash', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, []);

    const handleRestore = async (id: number) => {
        if (!confirm('¿Restaurar usuario?')) return;
        try {
            await api.post(`/users/${id}/restore`);
            fetchTrash(); // Refresh list
        } catch (error) {
            alert('Error al restaurar usuario');
        }
    };

    const handleDeletePermanently = async (id: number) => {
        if (!confirm('¿ESTÁS SEGURO? Esta acción es IRREVERSIBLE. Se borrarán todos los datos del usuario (perfil, rutinas, mensajes).')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchTrash();
        } catch (error) {
            alert('Error al eliminar definitivamente');
        }
    };

    return (
        <div className="container mx-auto p-6">
            <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft size={20} className="mr-2" /> Volver
            </button>

            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Trash2 className="text-red-500" /> Papelera de Reciclaje
            </h1>

            {loading ? (
                <div>Cargando...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-6 text-left">Nombre</th>
                                <th className="py-3 px-6 text-left">Email</th>
                                <th className="py-3 px-6 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-8 text-gray-500">
                                        La papelera está vacía.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="py-4 px-6">{user.name} {user.lastName}</td>
                                        <td className="py-4 px-6 text-gray-600">{user.email}</td>
                                        <td className="py-4 px-6 text-center space-x-2">
                                            <button
                                                onClick={() => handleRestore(user.id)}
                                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm inline-flex items-center gap-1"
                                                title="Restaurar de la papelera"
                                            >
                                                <RotateCcw size={16} /> Restaurar
                                            </button>
                                            <button
                                                onClick={() => handleDeletePermanently(user.id)}
                                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm inline-flex items-center gap-1"
                                                title="Eliminar de la base de datos para siempre"
                                            >
                                                <XCircle size={16} /> Eliminar Definitivamente
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

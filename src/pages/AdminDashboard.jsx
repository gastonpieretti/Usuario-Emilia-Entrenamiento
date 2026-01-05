import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { Shield, Trash2, Users, FileText, Activity } from 'lucide-react';

// --- CONFIGURACIÓN DE FIREBASE (Reutilizada) ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
const db = app ? getFirestore(app) : null;

export default function AdminDashboard() {
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) {
            // Demo Mode
            setRoutines([
                {
                    id: 'demo-1',
                    userId: 'user-demo-1',
                    input: { objetivo: 'Ganar masa muscular', nivel: 'Intermedio', frecuencia: 4 },
                    timestamp: { seconds: Date.now() / 1000 }
                },
                {
                    id: 'demo-2',
                    userId: 'user-demo-2',
                    input: { objetivo: 'Perder peso', nivel: 'Principiante', frecuencia: 3 },
                    timestamp: { seconds: (Date.now() - 86400000) / 1000 }
                }
            ]);
            setLoading(false);
            return;
        }

        const publicRoutinesColRef = collection(db, 'artifacts', appId, 'public', 'data', 'public_routines');
        const q = query(publicRoutinesColRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedRoutines = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Ordenar por fecha descendente
            fetchedRoutines.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
            setRoutines(fetchedRoutines);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching routines:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (routineId) => {
        if (!db) return;
        if (window.confirm('¿Estás seguro de que quieres eliminar esta rutina?')) {
            try {
                await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'public_routines', routineId));
            } catch (error) {
                console.error("Error deleting routine:", error);
                alert("Error al eliminar la rutina.");
            }
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Cargando panel de administración...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Shield className="w-8 h-8 mr-2 text-indigo-600" />
                        Panel de Administración
                    </h1>
                    <p className="text-gray-600 mt-1">Gestión de rutinas públicas y usuarios</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border flex space-x-6">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Rutinas Públicas</p>
                        <p className="text-2xl font-bold text-indigo-600">{routines.length}</p>
                    </div>
                </div>
            </header>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-gray-500" />
                        Rutinas Compartidas Recientemente
                    </h2>
                </div>

                {routines.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No hay rutinas públicas compartidas aún.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                    <th className="p-4 border-b font-semibold">Usuario (ID)</th>
                                    <th className="p-4 border-b font-semibold">Objetivo</th>
                                    <th className="p-4 border-b font-semibold">Nivel</th>
                                    <th className="p-4 border-b font-semibold">Días</th>
                                    <th className="p-4 border-b font-semibold">Fecha</th>
                                    <th className="p-4 border-b font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-100">
                                {routines.map((routine) => (
                                    <tr key={routine.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-mono text-xs text-gray-500">{routine.userId}</td>
                                        <td className="p-4 font-medium text-gray-900">{routine.input?.objetivo}</td>
                                        <td className="p-4 text-gray-600">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                                ${routine.input?.nivel === 'Principiante' ? 'bg-green-100 text-green-800' :
                                                    routine.input?.nivel === 'Intermedio' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'}`}>
                                                {routine.input?.nivel}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600">{routine.input?.frecuencia}</td>
                                        <td className="p-4 text-gray-500">
                                            {routine.timestamp ? new Date(routine.timestamp.seconds * 1000).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(routine.id)}
                                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                title="Eliminar Rutina"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

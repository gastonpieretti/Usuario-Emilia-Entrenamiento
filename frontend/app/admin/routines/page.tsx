"use client";

import { useEffect, useState } from 'react';
import api from '../../../utils/api';
import { Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

interface Routine {
    id: number;
    title: string;
    weekDay: string;
    user: {
        name: string;
        email: string;
    };
}

export default function RoutinesManagerPage() {
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRoutines = async () => {
        try {
            const response = await api.get('/routines');
            setRoutines(response.data);
        } catch (error) {
            console.error('Error fetching routines', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutines();
    }, []);

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this routine?')) {
            try {
                await api.delete(`/routines/${id}`);
                fetchRoutines();
            } catch (error) {
                console.error('Error deleting routine', error);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Routines Manager</h2>
                <Link href="/admin/routines/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Create Routine
                </Link>
            </div>
            <div className="bg-white rounded shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : routines.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-4 text-center">No routines found.</td></tr>
                        ) : (
                            routines.map((routine) => (
                                <tr key={routine.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{routine.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{routine.user?.name} ({routine.user?.email})</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{routine.weekDay}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <Link href={`/admin/routines/${routine.id}`} className="text-indigo-600 hover:text-indigo-900">
                                            <Edit className="h-4 w-4 inline" />
                                        </Link>
                                        <button onClick={() => handleDelete(routine.id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 className="h-4 w-4 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

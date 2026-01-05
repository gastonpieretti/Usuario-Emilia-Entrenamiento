"use client";

import { useEffect, useState } from 'react';
import api from '../../../utils/api';
import Link from 'next/link';
import { Edit, Search } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    planExpiresAt?: string;
    isApproved: boolean;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get(`/users?search=${search}`);
                setUsers(response.data);
            } catch (error: any) {
                console.error('Error fetching users', error);
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    // Optionally redirect or show message
                    alert('Sesión expirada o permisos insuficientes. Por favor inicia sesión como Administrador.');
                    // window.location.href = '/login'; // Or use router.push('/login')
                }
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [search]);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Users Management</h2>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border p-3 pl-10 rounded shadow-sm"
                />
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Users Table */}
            <div className="bg-white rounded shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Finalización</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center">Loading...</td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center">No users found.</td>
                            </tr>
                        ) : (
                            users.map((user) => {
                                const isExpired = user.planExpiresAt && new Date(user.planExpiresAt) < new Date();
                                // Logic: If user is NOT approved AND has routines generated (waiting for approval)
                                const hasRoutines = (user as any).routines && (user as any).routines.length > 0;
                                const isPendingApproval = !user.isApproved && hasRoutines;

                                return (
                                    <tr key={user.id} className={`${isPendingApproval ? 'bg-pink-50 border-l-4 border-orange-400' : 'hover:bg-gray-50'} transition-colors`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{user.name}</span>
                                                {isPendingApproval && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-800 animate-pulse mt-1 w-fit">
                                                        PENDIENTE DE APROBACIÓN
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {user.planExpiresAt ? (
                                                <span className={isExpired ? 'text-red-600 font-bold' : 'text-green-600'}>
                                                    {new Date(user.planExpiresAt).toLocaleDateString()}
                                                    {isExpired && ' (Vencido)'}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">Sin límite</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link href={`/admin/users/${user.id}`} className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end">
                                                <Edit className="h-4 w-4 mr-1" /> Edit
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

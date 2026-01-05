import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Dumbbell, Shield } from 'lucide-react';

export default function Layout() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex-shrink-0 flex items-center">
                                <img src="/logo.png" alt="Emilia Entrenamiento App" className="h-10 w-auto" />
                                <span className="ml-3 text-xl font-bold text-gray-800">Emilia Entrenamiento App</span>
                            </Link>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link
                                    to="/"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/'
                                        ? 'border-indigo-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    Usuario
                                </Link>
                                <Link
                                    to="/admin"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/admin'
                                        ? 'border-indigo-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    Admin
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center">
                            {location.pathname === '/admin' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                    <Shield className="w-3 h-3 mr-1" /> Modo Admin
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                <Outlet />
            </main>
        </div>
    );
}

"use client";

import Sidebar from './Sidebar';
import AdminGuard from './AdminGuard';
import { useState } from 'react';
import { Menu } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <AdminGuard>
            <div className="flex h-screen bg-gray-100 overflow-hidden">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Mobile Header */}
                    <header className="md:hidden bg-gray-800 text-white p-4 flex items-center justify-between z-30 shadow-md min-h-[56px]">
                        <h1 className="text-xl font-bold">Admin Panel</h1>
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 hover:bg-gray-700 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                        >
                            <Menu size={24} />
                        </button>
                    </header>

                    <main className="flex-1 p-4 md:p-8 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        </AdminGuard>
    );
}

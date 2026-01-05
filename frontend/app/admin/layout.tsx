import AdminGuard from '../../components/AdminGuard';
import Sidebar from '../../components/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminGuard>
            <div className="flex h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </AdminGuard>
    );
}

import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <main className="flex-1 lg:ml-64 transition-all duration-300 overflow-y-auto custom-scrollbar">
                <div className="p-4 lg:p-8 mt-12 lg:mt-0">
                    {children}
                </div>
            </main>
        </div>
    );
}

import { Sidebar } from '@/components/layout/sidebar';
import { CommandPalette } from '@/components/layout/command-palette';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-50/70 overflow-hidden">
            <Sidebar />
            <main className="flex-1 lg:ml-64 transition-all duration-300 flex flex-col h-screen overflow-hidden print:ml-0">
                {/* Header Top Bar */}
                <header className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between z-30 flex-shrink-0 print:hidden">
                    <div className="flex items-center gap-3 pl-12 lg:pl-0">
                        <CommandPalette />
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                    </div>
                </header>

                {/* Scrollable Main Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

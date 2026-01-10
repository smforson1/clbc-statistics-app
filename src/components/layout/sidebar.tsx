'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    BarChart3,
    FileText,
    Plus,
    Users,
    Calendar,
    Settings,
    LogOut,
    Church,
    Menu,
    X,
    Heart,
    Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase';
import { useState } from 'react';
import { toast } from 'sonner';

const navItems = [
    { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
    { icon: FileText, label: 'Forms', href: '/forms' },
    { icon: Plus, label: 'Create Form', href: '/forms/create' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Heart, label: 'Prayer Wall', href: '/prayer-requests' },
    { icon: Send, label: 'Broadcast', href: '/broadcast' },
    { icon: Users, label: 'Members', href: '/members' },
    { icon: Calendar, label: 'Events', href: '/events' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(true);
    const supabase = createClient();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error('Error logging out');
        } else {
            window.location.href = '/login';
        }
    };

    return (
        <>
            {/* Mobile Menu Toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 lg:hidden text-gray-600 hover:text-violet-600"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>

            {/* Sidebar background overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={cn(
                "fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-gray-900 flex flex-col shadow-2xl overflow-hidden",
                isOpen ? "w-64" : "w-20 -translate-x-full lg:translate-x-0"
            )}>
                {/* Logo Section */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <Church size={24} />
                        </div>
                        {isOpen && (
                            <div className="flex flex-col">
                                <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-amber-400 bg-clip-text text-transparent">
                                    CLBC Stats
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
                                    Logistics Portal
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg"
                                        : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                                )}
                            >
                                <item.icon size={22} className={cn(
                                    "flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                                    isActive ? "text-white" : "text-gray-400 group-hover:text-violet-400"
                                )} />
                                {isOpen && <span className="font-medium">{item.label}</span>}
                                {!isOpen && (
                                    <div className="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User / Logout Section */}
                <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-red-400 hover:bg-red-500/10 hover:text-red-300",
                            !isOpen && "justify-center px-0"
                        )}
                        onClick={handleLogout}
                    >
                        <LogOut size={22} className="flex-shrink-0" />
                        {isOpen && <span className="font-medium">Sign Out</span>}
                    </Button>
                </div>
            </aside>
        </>
    );
}

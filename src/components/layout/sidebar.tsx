'use client';

import { useState, useEffect } from 'react';

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
    Send,
    Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase';
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
    { icon: Package, label: 'Logistics', href: '/logistics' },
    { icon: Church, label: 'Branches', href: '/branches', adminOnly: true },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [branchName, setBranchName] = useState<string>('');
    const [userRole, setUserRole] = useState<string>('admin');
    const supabase = createClient();

    useEffect(() => {
        fetchBranchInfo();

        let touchStartX = 0;
        let touchStartY = 0;

        const handleTouchStart = (e: TouchEvent) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // Threshold for horizontal swipe (50px) and must be more horizontal than vertical
            if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) {
                    // Swipe Right -> Open
                    setIsOpen(true);
                } else {
                    // Swipe Left -> Close
                    setIsOpen(false);
                }
            }
        };

        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    const fetchBranchInfo = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, branch:branches(name)')
                .eq('id', user.id)
                .single();

            if (profile) {
                setUserRole(profile.role || 'admin');
                if (profile.branch) {
                    setBranchName((profile.branch as any).name);
                }
            }
        }
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error('Error logging out');
        } else {
            window.location.href = '/login';
        }
    };

    const handleLinkClick = () => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setIsOpen(false);
        }
    };

    const handleMouseEnter = () => {
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
            setIsOpen(true);
        }
    };

    const handleMouseLeave = () => {
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Mobile Menu Toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 lg:hidden text-gray-600 hover:text-[#D5AB45] print:hidden"
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

            <aside
                className={cn(
                    "fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-[#000C33] flex flex-col shadow-2xl overflow-hidden print:hidden",
                    isOpen ? "w-64" : "w-20 -translate-x-full lg:translate-x-0"
                )}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Logo Section */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white p-0.5 rounded-full flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
                            <img src="/clbc-logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        {isOpen && (
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-white tracking-tight">
                                    CLBC Portal
                                </span>
                                <span className="text-[10px] text-[#D5AB45] font-bold tracking-widest uppercase truncate max-w-[140px]">
                                    {branchName || 'Official App'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.filter(item => !(item as any).adminOnly || userRole === 'super_admin').map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={handleLinkClick}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-[#D5AB45] text-[#000C33] shadow-lg font-bold"
                                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <item.icon size={22} className={cn(
                                    "flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                                    isActive ? "text-[#000C33]" : "text-gray-400 group-hover:text-[#D5AB45]"
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
                <div className="p-4 border-t border-white/5 bg-black/20">
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-400 hover:bg-red-500 hover:text-white font-bold",
                            !isOpen && "justify-center px-0"
                        )}
                        onClick={() => {
                            handleLogout();
                            handleLinkClick();
                        }}
                    >
                        <LogOut size={22} className="flex-shrink-0" />
                        {isOpen && <span className="font-medium">Sign Out</span>}
                    </Button>
                </div>
            </aside>
        </>
    );
}

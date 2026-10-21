'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import {
    Dialog,
    DialogContent
} from '@/components/ui/dialog';
import {
    Search,
    BarChart3,
    FileText,
    Users,
    UserPlus,
    Send,
    Heart,
    Mic2,
    Calendar,
    Package,
    Settings,
    Church,
    Plus,
    Sparkles,
    ArrowRight,
    Command
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SearchItem {
    id: string;
    title: string;
    subtitle?: string;
    icon: any;
    href: string;
    category: 'Pages' | 'Actions' | 'Members' | 'Forms';
}

const STATIC_ITEMS: SearchItem[] = [
    // Pages
    { id: 'p-dash', title: 'Dashboard', subtitle: 'Overview & metrics', icon: BarChart3, href: '/dashboard', category: 'Pages' },
    { id: 'p-members', title: 'Member Directory', subtitle: 'Manage congregation database', icon: Users, href: '/members', category: 'Pages' },
    { id: 'p-crm', title: 'Follow-Up CRM', subtitle: 'First-timers & converts pipeline', icon: UserPlus, href: '/follow-up', category: 'Pages' },
    { id: 'p-broadcast', title: 'Broadcast Hub', subtitle: 'WhatsApp, SMS & Email dispatch', icon: Send, href: '/broadcast', category: 'Pages' },
    { id: 'p-forms', title: 'Forms & Check-Ins', subtitle: 'All created forms & response tables', icon: FileText, href: '/forms', category: 'Pages' },
    { id: 'p-analytics', title: 'Analytics & Reports', subtitle: 'Demographics & attendance trend', icon: BarChart3, href: '/analytics', category: 'Pages' },
    { id: 'p-prayer', title: 'Prayer Wall', subtitle: 'Intercession requests', icon: Heart, href: '/prayer-requests', category: 'Pages' },
    { id: 'p-testimonies', title: 'Testimonies', subtitle: 'Praise reports moderation & service view', icon: Mic2, href: '/testimonies', category: 'Pages' },
    { id: 'p-logistics', title: 'Logistics & Assets', subtitle: 'Equipment registry & borrowing', icon: Package, href: '/logistics', category: 'Pages' },
    { id: 'p-events', title: 'Events Calendar', subtitle: 'Church services & program schedule', icon: Calendar, href: '/events', category: 'Pages' },
    { id: 'p-branches', title: 'Branches', subtitle: 'Multi-campus branch network', icon: Church, href: '/branches', category: 'Pages' },
    { id: 'p-settings', title: 'System Settings', subtitle: 'Church profile & security', icon: Settings, href: '/settings', category: 'Pages' },

    // Quick Actions
    { id: 'a-form', title: 'Create New Form', subtitle: 'Launch drag-and-drop form builder', icon: Plus, href: '/forms/create', category: 'Actions' },
    { id: 'a-member', title: 'Register New Member', subtitle: 'Add a congregant', icon: UserPlus, href: '/members', category: 'Actions' },
    { id: 'a-visitor', title: 'Register First-Timer', subtitle: 'Add soul to follow-up radar', icon: Sparkles, href: '/follow-up', category: 'Actions' },
    { id: 'a-broadcast', title: 'Send Broadcast', subtitle: 'Compose message to church', icon: Send, href: '/broadcast', category: 'Actions' },
    { id: 'a-prayer', title: 'Public Prayer Portal', subtitle: 'Open public prayer request form', icon: Heart, href: '/submit/prayer', category: 'Actions' },
    { id: 'a-testimony', title: 'Public Testimony Portal', subtitle: 'Open praise report submission form', icon: Mic2, href: '/submit/testimony', category: 'Actions' },
];

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [dynamicMembers, setDynamicMembers] = useState<SearchItem[]>([]);
    const [dynamicForms, setDynamicForms] = useState<SearchItem[]>([]);
    const router = useRouter();
    const supabase = createClient();
    const inputRef = useRef<HTMLInputElement>(null);

    // Keyboard shortcut listener (Cmd+K / Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Live search for members & forms when query is typed
    useEffect(() => {
        if (!query.trim() || query.length < 2) {
            setDynamicMembers([]);
            setDynamicForms([]);
            return;
        }

        const timer = setTimeout(async () => {
            // Search members
            const { data: memberData } = await supabase
                .from('members')
                .select('id, full_name, phone')
                .ilike('full_name', `%${query}%`)
                .limit(3);

            if (memberData) {
                setDynamicMembers(memberData.map(m => ({
                    id: `m-${m.id}`,
                    title: m.full_name,
                    subtitle: m.phone ? `Phone: ${m.phone}` : 'Registered Member',
                    icon: Users,
                    href: `/members`,
                    category: 'Members'
                })));
            }

            // Search forms
            const { data: formData } = await supabase
                .from('forms')
                .select('id, title, status')
                .ilike('title', `%${query}%`)
                .limit(3);

            if (formData) {
                setDynamicForms(formData.map(f => ({
                    id: `f-${f.id}`,
                    title: f.title,
                    subtitle: `Status: ${f.status}`,
                    icon: FileText,
                    href: `/forms/${f.id}/responses`,
                    category: 'Forms'
                })));
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [query]);

    // Filtered items
    const filteredStatic = STATIC_ITEMS.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(query.toLowerCase())
    );

    const allResults = [...filteredStatic, ...dynamicMembers, ...dynamicForms];

    // Reset selected index when results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    const handleSelect = (item: SearchItem) => {
        setIsOpen(false);
        setQuery('');
        router.push(item.href);
    };

    // Keyboard navigation (arrows + enter)
    const handleKeyNavigation = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < allResults.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : allResults.length - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (allResults[selectedIndex]) {
                handleSelect(allResults[selectedIndex]);
            }
        }
    };

    return (
        <>
            {/* Global Quick Search Button (Trigger) */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="hidden md:flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200/70 border border-gray-200 text-gray-500 text-xs font-medium transition-all"
            >
                <Search size={15} className="text-gray-400" />
                <span>Search anything...</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded bg-white px-1.5 font-mono text-[10px] font-bold text-gray-600 shadow-xs border border-gray-200">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            {/* Modal Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="p-0 max-w-xl rounded-3xl bg-white shadow-2xl border-none overflow-hidden top-[25%] translate-y-0">
                    {/* Search Header */}
                    <div className="flex items-center gap-3 px-4 border-b border-gray-100 bg-gray-50/50">
                        <Search size={18} className="text-[#001D86]" />
                        <input
                            ref={inputRef}
                            autoFocus
                            placeholder="Type a page, member name, form, or action..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyNavigation}
                            className="w-full h-14 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-md"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Results Container */}
                    <div className="max-h-[360px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {allResults.map((item, index) => {
                            const isSelected = index === selectedIndex;
                            const Icon = item.icon;

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => handleSelect(item)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all",
                                        isSelected
                                            ? "bg-[#001D86] text-white shadow-sm"
                                            : "hover:bg-gray-50 text-gray-700"
                                    )}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={cn(
                                            "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                                            isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-[#001D86]"
                                        )}>
                                            <Icon size={18} />
                                        </div>

                                        <div className="min-w-0">
                                            <p className={cn(
                                                "text-xs font-bold truncate",
                                                isSelected ? "text-white" : "text-gray-900"
                                            )}>
                                                {item.title}
                                            </p>
                                            {item.subtitle && (
                                                <p className={cn(
                                                    "text-[10px] truncate",
                                                    isSelected ? "text-blue-100" : "text-gray-400"
                                                )}>
                                                    {item.subtitle}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Badge variant="outline" className={cn(
                                            "text-[9px] font-bold uppercase rounded-md px-1.5 py-0.5 border-none",
                                            isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                                        )}>
                                            {item.category}
                                        </Badge>
                                        <ArrowRight size={14} className={isSelected ? "text-white" : "text-gray-300"} />
                                    </div>
                                </div>
                            );
                        })}

                        {allResults.length === 0 && (
                            <div className="text-center py-12">
                                <Search className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                <p className="text-xs font-bold text-gray-700">No matching results</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">Try searching for a different keyword</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                        <div className="flex items-center gap-3">
                            <span>Use <kbd className="px-1 py-0.5 rounded bg-white border border-gray-200 text-gray-600 font-bold">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-white border border-gray-200 text-gray-600 font-bold">↓</kbd> to navigate</span>
                            <span>•</span>
                            <span>Press <kbd className="px-1 py-0.5 rounded bg-white border border-gray-200 text-gray-600 font-bold">↵</kbd> to jump</span>
                        </div>
                        <span>CLBC Quick Navigation</span>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

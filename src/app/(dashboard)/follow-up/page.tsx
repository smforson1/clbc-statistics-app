'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import {
    Users, UserPlus, Phone, Mail, MapPin, Calendar,
    CheckCircle2, Clock, ArrowRight, ArrowLeft, MoreVertical,
    Search, Filter, Plus, MessageCircle, FileText,
    Sparkles, ShieldCheck, Heart, UserCheck, AlertCircle,
    ChevronRight, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { buildWhatsAppWebUrl } from '@/lib/broadcast/utils';

export type FollowUpStage = 'new_visitor' | 'contacted' | 'visited' | 'foundation_class' | 'integrated';

export interface Interaction {
    date: string;
    type: 'call' | 'visit' | 'whatsapp' | 'note';
    minister: string;
    note: string;
}

export interface FollowUpRecord {
    id: string;
    visitor_name: string;
    phone?: string;
    email?: string;
    residence?: string;
    first_visit_date: string;
    stage: FollowUpStage;
    assigned_to?: string;
    notes?: string;
    interaction_history: Interaction[];
    created_at?: string;
}

const STAGES: { id: FollowUpStage; label: string; desc: string; color: string; bg: string; badge: string }[] = [
    {
        id: 'new_visitor',
        label: 'New Visitors',
        desc: 'First-time attendees',
        color: 'text-emerald-700 border-emerald-300',
        bg: 'bg-emerald-50/50',
        badge: 'bg-emerald-100 text-emerald-800'
    },
    {
        id: 'contacted',
        label: 'Contacted',
        desc: 'Call / WhatsApp welcomed',
        color: 'text-amber-700 border-amber-300',
        bg: 'bg-amber-50/50',
        badge: 'bg-amber-100 text-amber-800'
    },
    {
        id: 'visited',
        label: 'Visited',
        desc: 'Hostel / Home visit done',
        color: 'text-purple-700 border-purple-300',
        bg: 'bg-purple-50/50',
        badge: 'bg-purple-100 text-purple-800'
    },
    {
        id: 'foundation_class',
        label: 'Foundation Class',
        desc: 'In discipleship training',
        color: 'text-blue-700 border-blue-300',
        bg: 'bg-blue-50/50',
        badge: 'bg-blue-100 text-blue-800'
    },
    {
        id: 'integrated',
        label: 'Integrated Member',
        desc: 'Active in ministry / church',
        color: 'text-teal-700 border-teal-300',
        bg: 'bg-teal-50/50',
        badge: 'bg-teal-100 text-teal-800'
    }
];

export default function FollowUpPage() {
    const [records, setRecords] = useState<FollowUpRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [shepherdFilter, setShepherdFilter] = useState('all');

    // Dialog states
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isInteractionOpen, setIsInteractionOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<FollowUpRecord | null>(null);

    // New visitor form
    const [newVisitor, setNewVisitor] = useState({
        visitor_name: '',
        phone: '',
        email: '',
        residence: '',
        first_visit_date: new Date().toISOString().split('T')[0],
        assigned_to: '',
        notes: ''
    });

    // New interaction form
    const [newInteraction, setNewInteraction] = useState({
        type: 'call' as 'call' | 'visit' | 'whatsapp' | 'note',
        minister: '',
        note: ''
    });

    const supabase = createClient();

    useEffect(() => {
        fetchFollowUps();
    }, []);

    const fetchFollowUps = async () => {
        setIsLoading(true);
        try {
            // First check if follow_ups table exists
            const { data, error } = await supabase
                .from('follow_ups')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setRecords(data.map(item => ({
                    ...item,
                    interaction_history: Array.isArray(item.interaction_history) ? item.interaction_history : []
                })));
            } else {
                // If table doesn't exist yet, fallback to members who are first timers / converts
                const { data: memberData } = await supabase
                    .from('members')
                    .select('*')
                    .or('membership_status.eq.first_timer,membership_status.eq.convert,membership_status.eq.new');

                if (memberData && memberData.length > 0) {
                    setRecords(memberData.map(m => ({
                        id: m.id,
                        visitor_name: m.full_name,
                        phone: m.phone,
                        email: m.email,
                        residence: m.address,
                        first_visit_date: m.join_date || new Date().toISOString().split('T')[0],
                        stage: 'new_visitor',
                        notes: m.notes,
                        interaction_history: []
                    })));
                }
            }
        } catch (err) {
            console.error('Error fetching follow-ups:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Add new visitor
    const handleAddVisitor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newVisitor.visitor_name.trim()) {
            toast.error('Visitor name is required');
            return;
        }

        try {
            // Try saving to follow_ups
            const { data, error } = await supabase
                .from('follow_ups')
                .insert({
                    ...newVisitor,
                    stage: 'new_visitor',
                    interaction_history: []
                })
                .select()
                .single();

            if (error) {
                // Fallback to inserting into members as first_timer
                await supabase.from('members').insert({
                    full_name: newVisitor.visitor_name,
                    phone: newVisitor.phone,
                    email: newVisitor.email,
                    address: newVisitor.residence,
                    membership_status: 'first_timer',
                    notes: newVisitor.notes,
                    join_date: newVisitor.first_visit_date
                });
            }

            toast.success(`Registered ${newVisitor.visitor_name} to follow-up pipeline!`);
            setIsAddOpen(false);
            setNewVisitor({
                visitor_name: '',
                phone: '',
                email: '',
                residence: '',
                first_visit_date: new Date().toISOString().split('T')[0],
                assigned_to: '',
                notes: ''
            });
            fetchFollowUps();
        } catch (err: any) {
            toast.error(err.message || 'Failed to register visitor');
        }
    };

    // Stage progression
    const handleMoveStage = async (record: FollowUpRecord, direction: 'next' | 'prev') => {
        const stageIndex = STAGES.findIndex(s => s.id === record.stage);
        const newIndex = direction === 'next' ? stageIndex + 1 : stageIndex - 1;

        if (newIndex < 0 || newIndex >= STAGES.length) return;

        const nextStage = STAGES[newIndex].id;

        // Optimistic UI update
        setRecords(prev => prev.map(r => r.id === record.id ? { ...r, stage: nextStage } : r));

        try {
            const { error } = await supabase
                .from('follow_ups')
                .update({ stage: nextStage, updated_at: new Date().toISOString() })
                .eq('id', record.id);

            if (error) {
                // Also update member status if it was from members table
                await supabase
                    .from('members')
                    .update({ membership_status: nextStage === 'integrated' ? 'active' : 'first_timer' })
                    .eq('id', record.id);
            }

            toast.success(`Moved ${record.visitor_name} to ${STAGES[newIndex].label}`);
        } catch (err) {
            toast.error('Failed to update stage');
            fetchFollowUps();
        }
    };

    // Log new interaction
    const handleSaveInteraction = async () => {
        if (!selectedRecord || !newInteraction.note.trim()) {
            toast.error('Please enter an interaction note');
            return;
        }

        const entry: Interaction = {
            date: new Date().toISOString(),
            type: newInteraction.type,
            minister: newInteraction.minister.trim() || 'Follow-Up Team',
            note: newInteraction.note.trim()
        };

        const updatedHistory = [entry, ...(selectedRecord.interaction_history || [])];

        setRecords(prev => prev.map(r => r.id === selectedRecord.id ? { ...r, interaction_history: updatedHistory } : r));

        try {
            await supabase
                .from('follow_ups')
                .update({ interaction_history: updatedHistory })
                .eq('id', selectedRecord.id);

            toast.success('Logged interaction successfully');
            setIsInteractionOpen(false);
            setNewInteraction({ type: 'call', minister: '', note: '' });
        } catch (err) {
            toast.error('Failed to record interaction');
        }
    };

    // Quick WhatsApp Welcome
    const handleQuickWhatsApp = (record: FollowUpRecord) => {
        if (!record.phone) {
            toast.error('No phone number recorded for this visitor');
            return;
        }
        const firstName = record.visitor_name.split(' ')[0] || record.visitor_name;
        const msg = `Hello ${firstName}, grace and peace! Thank you for worshipping with us at Christ Love Breed Church. We were so blessed to have you in our midst. How was the service for you? Please let us know if there is any way we can pray with you or assist you. Have a blessed week!`;
        const url = buildWhatsAppWebUrl(record.phone, msg);
        window.open(url, '_blank');
    };

    // Unique shepherds for filter dropdown
    const shepherds = useMemo(() => {
        const set = new Set<string>();
        records.forEach(r => {
            if (r.assigned_to) set.add(r.assigned_to);
        });
        return Array.from(set);
    }, [records]);

    // Filtered records
    const filteredRecords = useMemo(() => {
        return records.filter(r => {
            const matchesSearch =
                r.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (r.phone && r.phone.includes(searchTerm)) ||
                (r.residence && r.residence.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesShepherd = shepherdFilter === 'all' || r.assigned_to === shepherdFilter;

            return matchesSearch && matchesShepherd;
        });
    }, [records, searchTerm, shepherdFilter]);

    // Metrics
    const totalVisitors = records.length;
    const integratedCount = records.filter(r => r.stage === 'integrated').length;
    const conversionRate = totalVisitors > 0 ? Math.round((integratedCount / totalVisitors) * 100) : 0;
    const activeInPipeline = totalVisitors - integratedCount;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black tracking-widest text-[#D5AB45] uppercase">
                            Soul Winning & Retention
                        </span>
                        <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200 font-bold">
                            Kanban Pipeline
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mt-1">First-Timers & Converts CRM</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Track every soul from their first visit to full integration into church life
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="bg-[#001D86] hover:bg-[#D5AB45] hover:text-white rounded-2xl h-11 px-6 font-bold shadow-md transition-all gap-2"
                    >
                        <UserPlus size={18} />
                        Register New Visitor
                    </Button>
                </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm rounded-3xl bg-white p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#001D86]">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total In Pipeline</p>
                        <p className="text-2xl font-black text-gray-900">{totalVisitors}</p>
                    </div>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl bg-white p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Follow-Ups</p>
                        <p className="text-2xl font-black text-gray-900">{activeInPipeline}</p>
                    </div>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl bg-white p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fully Integrated</p>
                        <p className="text-2xl font-black text-teal-700">{integratedCount}</p>
                    </div>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl bg-white p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Integration Rate</p>
                        <p className="text-2xl font-black text-purple-700">{conversionRate}%</p>
                    </div>
                </Card>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                        placeholder="Search by visitor name, hostel/hall, or phone..."
                        className="pl-10 bg-gray-50 border-gray-100 rounded-xl text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                        className="h-10 px-3 pr-8 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 focus:ring-2 focus:ring-[#001D86] outline-none"
                        value={shepherdFilter}
                        onChange={(e) => setShepherdFilter(e.target.value)}
                    >
                        <option value="all">All Shepherds / Ministers</option>
                        {shepherds.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-start">
                {STAGES.map(stage => {
                    const stageRecords = filteredRecords.filter(r => r.stage === stage.id);

                    return (
                        <div
                            key={stage.id}
                            className={cn(
                                "flex flex-col rounded-3xl p-4 border transition-all min-h-[500px]",
                                stage.bg,
                                stage.color
                            )}
                        >
                            {/* Column Header */}
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-bold text-sm text-gray-900">{stage.label}</h3>
                                <Badge className={cn("rounded-full px-2.5 py-0.5 text-xs font-black", stage.badge)}>
                                    {stageRecords.length}
                                </Badge>
                            </div>
                            <p className="text-[11px] text-gray-500 mb-4">{stage.desc}</p>

                            {/* Card List */}
                            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-0.5">
                                {stageRecords.map(record => {
                                    const daysAgo = differenceInDays(new Date(), new Date(record.first_visit_date));
                                    const interactionsCount = record.interaction_history?.length || 0;

                                    return (
                                        <Card
                                            key={record.id}
                                            className="border border-gray-200/80 shadow-xs hover:shadow-md transition-all rounded-2xl bg-white overflow-hidden p-4 space-y-3"
                                        >
                                            {/* Name & Days */}
                                            <div className="flex justify-between items-start gap-1">
                                                <div>
                                                    <h4 className="font-bold text-sm text-gray-900 leading-tight">
                                                        {record.visitor_name}
                                                    </h4>
                                                    <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1 font-medium">
                                                        <Calendar size={11} />
                                                        {daysAgo === 0 ? 'Visited today' : `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Residence / Hostel & Contact */}
                                            <div className="space-y-1 text-xs text-gray-600">
                                                {record.residence && (
                                                    <p className="flex items-center gap-1.5 text-[11px] text-gray-600 truncate">
                                                        <MapPin size={12} className="text-red-500 flex-shrink-0" />
                                                        <span className="truncate">{record.residence}</span>
                                                    </p>
                                                )}

                                                {record.phone && (
                                                    <p className="flex items-center gap-1.5 text-[11px] text-gray-500 font-mono">
                                                        <Phone size={12} className="text-[#001D86] flex-shrink-0" />
                                                        {record.phone}
                                                    </p>
                                                )}

                                                {record.assigned_to && (
                                                    <div className="pt-1 flex items-center gap-1 text-[10px] text-purple-700 font-bold">
                                                        <ShieldCheck size={12} />
                                                        <span>Shepherd: {record.assigned_to}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons Row */}
                                            <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
                                                <div className="flex items-center gap-1">
                                                    {record.phone && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleQuickWhatsApp(record)}
                                                            className="h-8 w-8 rounded-xl text-green-600 hover:bg-green-50"
                                                            title="Send WhatsApp greeting"
                                                        >
                                                            <MessageCircle size={15} />
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setSelectedRecord(record);
                                                            setIsInteractionOpen(true);
                                                        }}
                                                        className="h-8 w-8 rounded-xl text-blue-600 hover:bg-blue-50 relative"
                                                        title="Log Call / Visit note"
                                                    >
                                                        <FileText size={15} />
                                                        {interactionsCount > 0 && (
                                                            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                                                {interactionsCount}
                                                            </span>
                                                        )}
                                                    </Button>
                                                </div>

                                                {/* Stage Shifters */}
                                                <div className="flex items-center gap-1">
                                                    {stage.id !== 'new_visitor' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleMoveStage(record, 'prev')}
                                                            className="h-7 w-7 rounded-lg text-gray-400 hover:text-gray-700"
                                                            title="Move back"
                                                        >
                                                            <ArrowLeft size={13} />
                                                        </Button>
                                                    )}

                                                    {stage.id !== 'integrated' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleMoveStage(record, 'next')}
                                                            className="h-7 w-7 rounded-lg bg-gray-100 hover:bg-[#001D86] hover:text-white text-gray-700 transition-colors"
                                                            title="Advance stage"
                                                        >
                                                            <ArrowRight size={13} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}

                                {stageRecords.length === 0 && (
                                    <div className="h-40 rounded-2xl border-2 border-dashed border-gray-200/80 flex flex-col items-center justify-center text-center p-4">
                                        <p className="text-xs text-gray-400 italic">No souls in this stage</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal 1: Register New Visitor */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-3xl p-6 bg-white shadow-2xl border-none">
                    <form onSubmit={handleAddVisitor}>
                        <DialogHeader className="space-y-1 pb-4 border-b border-gray-100">
                            <DialogTitle className="text-xl font-bold text-gray-900">Register New Visitor</DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Add a first-time church attendee or convert into the follow-up radar
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4 text-xs">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-700">Full Name *</Label>
                                <Input
                                    required
                                    placeholder="e.g. Samuel Adjei"
                                    className="rounded-xl bg-gray-50 border-gray-200 text-sm"
                                    value={newVisitor.visitor_name}
                                    onChange={(e) => setNewVisitor({ ...newVisitor, visitor_name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-gray-700">Phone Number</Label>
                                    <Input
                                        placeholder="050 000 0000"
                                        className="rounded-xl bg-gray-50 border-gray-200 text-sm font-mono"
                                        value={newVisitor.phone}
                                        onChange={(e) => setNewVisitor({ ...newVisitor, phone: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-gray-700">Email Address</Label>
                                    <Input
                                        placeholder="samuel@example.com"
                                        className="rounded-xl bg-gray-50 border-gray-200 text-sm"
                                        value={newVisitor.email}
                                        onChange={(e) => setNewVisitor({ ...newVisitor, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-gray-700">Hall / Hostel Residence</Label>
                                    <Input
                                        placeholder="e.g. Brunei Hall / Ayeduase"
                                        className="rounded-xl bg-gray-50 border-gray-200 text-sm"
                                        value={newVisitor.residence}
                                        onChange={(e) => setNewVisitor({ ...newVisitor, residence: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-gray-700">First Visit Date</Label>
                                    <Input
                                        type="date"
                                        className="rounded-xl bg-gray-50 border-gray-200 text-sm"
                                        value={newVisitor.first_visit_date}
                                        onChange={(e) => setNewVisitor({ ...newVisitor, first_visit_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-700">Assigned Shepherd / Follow-Up Minister</Label>
                                <Input
                                    placeholder="e.g. Minister Kwabena"
                                    className="rounded-xl bg-gray-50 border-gray-200 text-sm"
                                    value={newVisitor.assigned_to}
                                    onChange={(e) => setNewVisitor({ ...newVisitor, assigned_to: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-700">Initial Notes / Impressions</Label>
                                <textarea
                                    className="w-full min-h-[80px] p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none resize-none focus:ring-2 focus:ring-[#001D86]"
                                    placeholder="e.g. First-year computer science student, invited by Brother Emmanuel..."
                                    value={newVisitor.notes}
                                    onChange={(e) => setNewVisitor({ ...newVisitor, notes: e.target.value })}
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-3 border-t border-gray-100 flex gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-[#001D86] hover:bg-[#D5AB45] rounded-xl font-bold">
                                Add to Pipeline
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal 2: Log Interaction & View History */}
            <Dialog open={isInteractionOpen} onOpenChange={setIsInteractionOpen}>
                <DialogContent className="sm:max-w-[550px] rounded-3xl p-6 bg-white shadow-2xl border-none">
                    <DialogHeader className="space-y-1 pb-4 border-b border-gray-100">
                        <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="text-[#001D86]" size={20} />
                            Interaction Log: {selectedRecord?.visitor_name}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">
                            Record phone calls, visits, and prayer notes with this visitor
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-3">
                        {/* Add interaction form */}
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                                New Interaction Entry
                            </span>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <Label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block">Interaction Type</Label>
                                    <select
                                        className="w-full h-9 px-2 rounded-xl border border-gray-200 bg-white text-xs outline-none focus:ring-2 focus:ring-[#001D86]"
                                        value={newInteraction.type}
                                        onChange={(e) => setNewInteraction({ ...newInteraction, type: e.target.value as any })}
                                    >
                                        <option value="call">📞 Phone Call</option>
                                        <option value="visit">🏠 Hostel / Home Visit</option>
                                        <option value="whatsapp">💬 WhatsApp Chat</option>
                                        <option value="note">📝 General Pastoral Note</option>
                                    </select>
                                </div>

                                <div>
                                    <Label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block">Minister Name</Label>
                                    <Input
                                        placeholder="Your name"
                                        className="h-9 bg-white border-gray-200 rounded-xl text-xs"
                                        value={newInteraction.minister}
                                        onChange={(e) => setNewInteraction({ ...newInteraction, minister: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <textarea
                                    className="w-full min-h-[70px] p-3 rounded-xl border border-gray-200 bg-white text-xs outline-none resize-none focus:ring-2 focus:ring-[#001D86]"
                                    placeholder="Summary of conversation, prayer points, or response..."
                                    value={newInteraction.note}
                                    onChange={(e) => setNewInteraction({ ...newInteraction, note: e.target.value })}
                                />
                            </div>

                            <Button
                                onClick={handleSaveInteraction}
                                className="w-full bg-[#001D86] hover:bg-blue-900 rounded-xl text-xs font-bold h-9"
                            >
                                Save Interaction Log
                            </Button>
                        </div>

                        {/* Past History Timeline */}
                        <div className="space-y-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                                Past Timeline ({selectedRecord?.interaction_history?.length || 0})
                            </span>

                            <div className="max-h-[220px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
                                {selectedRecord?.interaction_history?.map((hist, idx) => (
                                    <div key={idx} className="p-3 bg-white border border-gray-100 rounded-xl shadow-2xs space-y-1 text-xs">
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="font-bold text-[#001D86] capitalize">
                                                {hist.type === 'call' ? '📞 Call' : hist.type === 'visit' ? '🏠 Visit' : hist.type === 'whatsapp' ? '💬 WhatsApp' : '📝 Note'} by {hist.minister}
                                            </span>
                                            <span className="text-gray-400">
                                                {format(new Date(hist.date), 'MMM d, h:mm a')}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">{hist.note}</p>
                                    </div>
                                ))}

                                {(!selectedRecord?.interaction_history || selectedRecord.interaction_history.length === 0) && (
                                    <p className="text-xs text-gray-400 text-center py-6 italic">
                                        No interactions logged yet for this visitor.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-2 border-t border-gray-100">
                        <Button variant="outline" onClick={() => setIsInteractionOpen(false)} className="rounded-xl">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

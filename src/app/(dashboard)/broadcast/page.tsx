'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import {
    Send, Users, MessageSquare, Mail, Phone, Clock,
    CheckCircle2, AlertCircle, Search, Filter, History,
    MessageCircle, ExternalLink, Loader2, Sparkles,
    CheckSquare, Square, RefreshCw, Eye, Tag, ChevronDown,
    SlidersHorizontal, ArrowRight, ShieldCheck, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { WhatsAppQueueModal } from './whatsapp-queue-modal';
import { BroadcastDetailsModal } from './broadcast-details-modal';
import { personalizeMessage } from '@/lib/broadcast/utils';

interface Member {
    id: string;
    full_name: string;
    phone?: string;
    email?: string;
    gender?: string;
    membership_status?: string;
    member_ministries?: Array<{ ministry_name: string }>;
}

const PRESET_TEMPLATES = [
    {
        id: 'sunday-service',
        title: '🌟 Sunday Service Reminder',
        channel: 'all',
        subject: 'Join Us for Worship This Sunday at CLBC',
        text: 'Grace and peace {firstname}! Join us this Sunday at {church} for a powerful time of worship and revelation in God\'s Word. Service starts at 8:30 AM. Come expectant and bring a friend! God richly bless you.'
    },
    {
        id: 'mid-week',
        title: '🕊️ Mid-Week Encounter',
        channel: 'all',
        subject: 'Mid-Week Service Tonight',
        text: 'Hello {firstname}, do not miss our Mid-Week Encounter this Wednesday at 6:00 PM at {church}. Come and be refreshed in God\'s presence. Bring a friend along!'
    },
    {
        id: 'first-timer',
        title: '🤝 First-Timer Welcome',
        channel: 'all',
        subject: 'Welcome to the CLBC Family!',
        text: 'Dear {fullname}, thank you so much for worshipping with us at {church}. It was a great joy having you in our midst. We pray you were richly blessed. Please let us know if you have any prayer requests. You are always welcome in the Father\'s house!'
    },
    {
        id: 'birthday',
        title: '🎂 Birthday Blessing',
        channel: 'all',
        subject: 'Happy Birthday from Christ Love Breed Church!',
        text: 'Happy Birthday {fullname}! The pastoral team and congregation of {church} celebrate God\'s divine grace upon your life today. May this new year bring overflowing testimonies, divine health, and open doors in Jesus\' name! 🎂🎉'
    },
    {
        id: 'meeting',
        title: '📢 Ministry Meeting Notice',
        channel: 'all',
        subject: 'Important Department Meeting',
        text: 'Important reminder for {fullname}: There will be a brief department meeting immediately following Sunday service. Your prompt presence is kindly appreciated. Blessings!'
    }
];

export default function BroadcastPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [churchName, setChurchName] = useState('Christ Love Breed Church');

    // Composer State
    const [messageType, setMessageType] = useState<'whatsapp' | 'email' | 'sms'>('whatsapp');
    const [whatsappMode, setWhatsappMode] = useState<'automated' | 'web'>('web');
    const [emailSubject, setEmailSubject] = useState('');
    const [messageContent, setMessageContent] = useState('');
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [ministryFilter, setMinistryFilter] = useState('all');
    const [genderFilter, setGenderFilter] = useState('all');

    // Modals
    const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
    const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<any | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            // Fetch current user's branch
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('branch:branches(name)')
                    .eq('id', user.id)
                    .single();
                if ((profile?.branch as any)?.name) {
                    setChurchName((profile?.branch as any).name);
                }
            }

            // Fetch members
            const { data: membersData } = await supabase
                .from('members')
                .select('id, full_name, phone, email, gender, membership_status, member_ministries(ministry_name)')
                .order('full_name', { ascending: true });

            // Fetch messages history
            const { data: messagesData } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });

            setMembers(membersData || []);
            setHistory(messagesData || []);
        } catch (err) {
            toast.error('Failed to load broadcast data');
        } finally {
            setIsLoading(false);
        }
    };

    // Filtered members list
    const filteredMembers = useMemo(() => {
        return members.filter(m => {
            const matchesSearch =
                m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (m.phone && m.phone.includes(searchTerm)) ||
                (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = statusFilter === 'all' || m.membership_status?.toLowerCase() === statusFilter.toLowerCase();
            const matchesGender = genderFilter === 'all' || m.gender?.toLowerCase() === genderFilter.toLowerCase();

            let matchesMinistry = true;
            if (ministryFilter !== 'all') {
                const ministries = m.member_ministries?.map(mm => mm.ministry_name.toLowerCase()) || [];
                matchesMinistry = ministries.includes(ministryFilter.toLowerCase());
            }

            return matchesSearch && matchesStatus && matchesGender && matchesMinistry;
        });
    }, [members, searchTerm, statusFilter, genderFilter, ministryFilter]);

    // Selection helpers
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRecipients(filteredMembers.map(m => m.id));
        } else {
            setSelectedRecipients([]);
        }
    };

    const handleRecipientToggle = (id: string) => {
        setSelectedRecipients(prev =>
            prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
        );
    };

    const handleSelectOnlyWithValidContact = () => {
        const validIds = filteredMembers
            .filter(m => {
                if (messageType === 'email') return !!m.email?.trim();
                return !!m.phone?.trim();
            })
            .map(m => m.id);

        setSelectedRecipients(validIds);
        toast.info(`Selected ${validIds.length} members with valid ${messageType === 'email' ? 'emails' : 'phone numbers'}`);
    };

    // Apply template
    const handleApplyTemplate = (tpl: typeof PRESET_TEMPLATES[0]) => {
        setMessageContent(tpl.text);
        if (tpl.subject && messageType === 'email') {
            setEmailSubject(tpl.subject);
        }
        toast.success(`Loaded "${tpl.title}" template`);
    };

    // Tag Inserters
    const insertTag = (tag: string) => {
        setMessageContent(prev => prev + ' ' + tag);
    };

    // Dispatcher
    const handleSendBroadcast = async () => {
        if (selectedRecipients.length === 0) {
            toast.error('Please select at least one recipient');
            return;
        }

        if (!messageContent.trim()) {
            toast.error('Please compose a message before broadcasting');
            return;
        }

        if (messageType === 'email' && !emailSubject.trim()) {
            toast.error('Please enter a subject line for the email');
            return;
        }

        const selectedMembersList = members.filter(m => selectedRecipients.includes(m.id));

        // If WhatsApp in Web Queue mode, launch interactive modal
        if (messageType === 'whatsapp' && whatsappMode === 'web') {
            setIsQueueModalOpen(true);
            return;
        }

        // Live automated API dispatch (SMS, Email, or Twilio WhatsApp)
        setIsSending(true);
        const toastId = toast.loading(`Dispatching ${messageType.toUpperCase()} broadcast to ${selectedMembersList.length} recipients...`);

        try {
            const response = await fetch('/api/broadcast/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messageType,
                    subject: messageType === 'email' ? emailSubject : undefined,
                    body: messageContent,
                    recipients: selectedMembersList.map(m => ({
                        id: m.id,
                        name: m.full_name,
                        phone: m.phone,
                        email: m.email
                    })),
                    whatsappMode: 'automated'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Broadcast failed to dispatch');
            }

            const { summary } = data;
            if (summary.failed === 0) {
                toast.success(`Broadcast successfully sent to all ${summary.sent} recipients!`, { id: toastId });
            } else if (summary.sent > 0) {
                toast.warning(`Broadcast partially delivered: ${summary.sent} sent, ${summary.failed} failed.`, { id: toastId });
            } else {
                toast.error(`Broadcast failed for all ${summary.failed} recipients: ${data.results?.[0]?.error || 'Check provider setup'}`, { id: toastId });
            }

            // Refresh history
            const { data: updatedHistory } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });
            setHistory(updatedHistory || []);

            // Reset form
            setMessageContent('');
            setEmailSubject('');
            setSelectedRecipients([]);

        } catch (err: any) {
            toast.error(err.message || 'Error occurred while broadcasting', { id: toastId });
        } finally {
            setIsSending(false);
        }
    };

    // Callback when WhatsApp Queue completes
    const handleQueueCompleted = async (results: any[]) => {
        // Refresh history to show the queued/dispatched entry
        const { data: updatedHistory } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });
        setHistory(updatedHistory || []);
        setSelectedRecipients([]);
        setMessageContent('');
    };

    // Retry failed recipients from history
    const handleRetryFailed = (record: any) => {
        const failedRecipients = (record.recipients || [])
            .filter((r: any) => r.status === 'failed')
            .map((r: any) => r.id);

        if (failedRecipients.length === 0) {
            toast.info('No failed recipients to retry in this broadcast');
            return;
        }

        setMessageType(record.message_type);
        setMessageContent(record.body);
        if (record.subject) setEmailSubject(record.subject);
        setSelectedRecipients(failedRecipients);
        toast.success(`Selected ${failedRecipients.length} failed recipients to retry`);
    };

    // Sample preview recipient
    const sampleRecipient = members.find(m => selectedRecipients.includes(m.id)) || members[0] || { full_name: 'Kofi Mensah' };
    const samplePreview = personalizeMessage(messageContent || 'Type your message...', {
        fullname: sampleRecipient.full_name,
        churchName: churchName,
        branchName: churchName
    });

    // SMS length calculation (standard GSM 160 chars per segment)
    const smsCharCount = messageContent.length;
    const smsSegments = Math.ceil(smsCharCount / 160) || 1;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black tracking-widest text-[#D5AB45] uppercase">Communication Center</span>
                        <Badge variant="outline" className="text-[10px] bg-blue-50 text-[#001D86] border-blue-200 font-bold">
                            Multi-Channel
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mt-1">Broadcast Hub</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Send real-time announcements to members via WhatsApp, Email, or SMS
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchInitialData}
                        className="rounded-2xl border-gray-200 text-gray-600 gap-2 h-11"
                    >
                        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                        Refresh Data
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="compose" className="w-full">
                <TabsList className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <TabsTrigger
                        value="compose"
                        className="rounded-xl px-5 py-2.5 gap-2 text-sm font-bold data-[state=active]:bg-[#001D86] data-[state=active]:text-white transition-all"
                    >
                        <Send size={16} /> Compose Broadcast
                    </TabsTrigger>
                    <TabsTrigger
                        value="history"
                        className="rounded-xl px-5 py-2.5 gap-2 text-sm font-bold data-[state=active]:bg-[#001D86] data-[state=active]:text-white transition-all"
                    >
                        <History size={16} /> Broadcast History ({history.length})
                    </TabsTrigger>
                </TabsList>

                {/* TAB 1: COMPOSE */}
                <TabsContent value="compose" className="space-y-8 mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* LEFT COLUMN: RECIPIENT SELECTION (5 COLS) */}
                        <div className="lg:col-span-5 space-y-4">
                            <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                                <CardHeader className="bg-gray-50/70 border-b border-gray-100 px-6 py-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Users className="text-[#001D86]" size={20} />
                                            <div>
                                                <CardTitle className="text-base font-bold">Select Audience</CardTitle>
                                                <CardDescription className="text-xs">
                                                    Filter congregants by department or status
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Badge className="bg-blue-100 text-[#001D86] font-black text-xs px-3 py-1 rounded-full">
                                            {selectedRecipients.length} Selected
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 space-y-4">
                                    {/* Search input */}
                                    <div className="relative">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <Input
                                            placeholder="Search by name, phone or email..."
                                            className="pl-10 bg-gray-50 border-gray-100 rounded-2xl text-sm h-11"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    {/* Filters row */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                                                Ministry / Dept
                                            </Label>
                                            <select
                                                className="w-full h-9 px-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-700 outline-none focus:ring-2 focus:ring-[#001D86]"
                                                value={ministryFilter}
                                                onChange={(e) => setMinistryFilter(e.target.value)}
                                            >
                                                <option value="all">All Ministries</option>
                                                <option value="media">Media</option>
                                                <option value="worship">Worship / Choir</option>
                                                <option value="ushering">Ushering</option>
                                                <option value="intercession">Intercession</option>
                                                <option value="protocol">Protocol</option>
                                                <option value="children">Children</option>
                                            </select>
                                        </div>

                                        <div>
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                                                Status
                                            </Label>
                                            <select
                                                className="w-full h-9 px-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-700 outline-none focus:ring-2 focus:ring-[#001D86]"
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                            >
                                                <option value="all">All Statuses</option>
                                                <option value="active">Active Members</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="new">First-timers / Converts</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="flex items-center justify-between pt-1 pb-1 border-t border-gray-100 px-1 text-xs">
                                        <label className="flex items-center gap-2 font-bold text-gray-600 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-[#001D86] focus:ring-[#001D86]"
                                                checked={selectedRecipients.length === filteredMembers.length && filteredMembers.length > 0}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                            />
                                            Select All ({filteredMembers.length})
                                        </label>

                                        <button
                                            type="button"
                                            onClick={handleSelectOnlyWithValidContact}
                                            className="text-[#001D86] hover:underline font-semibold text-[11px]"
                                        >
                                            Only with {messageType === 'email' ? 'Email' : 'Phone'}
                                        </button>
                                    </div>

                                    {/* Members List */}
                                    <div className="max-h-[460px] overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                                        {filteredMembers.map(member => {
                                            const isSelected = selectedRecipients.includes(member.id);
                                            const contact = messageType === 'email' ? member.email : member.phone;

                                            return (
                                                <div
                                                    key={member.id}
                                                    onClick={() => handleRecipientToggle(member.id)}
                                                    className={cn(
                                                        "flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer border text-xs",
                                                        isSelected
                                                            ? "bg-blue-50/80 border-blue-200 shadow-xs"
                                                            : "bg-white hover:bg-gray-50 border-gray-100"
                                                    )}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-[#001D86] focus:ring-[#001D86] h-4 w-4"
                                                        checked={isSelected}
                                                        readOnly
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-1">
                                                            <p className="font-bold text-gray-900 truncate">{member.full_name}</p>
                                                            {member.membership_status && (
                                                                <span className="text-[10px] text-gray-400 capitalize flex-shrink-0">
                                                                    {member.membership_status}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className={cn(
                                                            "text-[11px] truncate font-mono mt-0.5",
                                                            contact ? "text-gray-500" : "text-amber-500 italic"
                                                        )}>
                                                            {contact || (messageType === 'email' ? 'No email' : 'No phone')}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {filteredMembers.length === 0 && (
                                            <div className="text-center py-16">
                                                <Users className="mx-auto text-gray-300 mb-2" size={32} />
                                                <p className="text-gray-500 text-sm font-medium">No members match filters</p>
                                                <p className="text-gray-400 text-xs mt-1">Try clearing your search or filters</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* RIGHT COLUMN: COMPOSE MESSAGE & DISPATCH (7 COLS) */}
                        <div className="lg:col-span-7 space-y-6">
                            {/* Preset Templates Carousel */}
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={16} className="text-[#D5AB45]" />
                                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Quick Templates
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-gray-400">Click to apply template</span>
                                </div>

                                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                                    {PRESET_TEMPLATES.map(tpl => (
                                        <button
                                            key={tpl.id}
                                            type="button"
                                            onClick={() => handleApplyTemplate(tpl)}
                                            className="px-3 py-2 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-[#001D86] text-gray-700 border border-gray-200 text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0"
                                        >
                                            {tpl.title}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Main Composer Card */}
                            <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                                <CardHeader className="bg-gray-50/70 border-b border-gray-100 px-8 py-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="text-[#001D86]" size={20} />
                                            <div>
                                                <CardTitle className="text-lg font-bold">Message Studio</CardTitle>
                                                <CardDescription className="text-xs">
                                                    Choose communication channel and draft your content
                                                </CardDescription>
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsPreviewOpen(prev => !prev)}
                                            className="h-8 text-xs text-[#001D86] hover:bg-blue-50 font-bold gap-1 rounded-xl"
                                        >
                                            <Eye size={14} /> {isPreviewOpen ? 'Hide Preview' : 'Live Preview'}
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-8 space-y-6">
                                    {/* Channel Selector */}
                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Delivery Channel
                                        </Label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setMessageType('whatsapp')}
                                                className={cn(
                                                    "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                                    messageType === 'whatsapp'
                                                        ? "bg-green-50 border-green-500 text-green-700 shadow-sm"
                                                        : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                                                )}
                                            >
                                                <MessageCircle size={26} className={messageType === 'whatsapp' ? "text-green-600" : "text-gray-400"} />
                                                <span className="text-xs font-bold uppercase tracking-wider">WhatsApp</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setMessageType('email')}
                                                className={cn(
                                                    "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                                    messageType === 'email'
                                                        ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
                                                        : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                                                )}
                                            >
                                                <Mail size={26} className={messageType === 'email' ? "text-blue-600" : "text-gray-400"} />
                                                <span className="text-xs font-bold uppercase tracking-wider">Email (Resend)</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setMessageType('sms')}
                                                className={cn(
                                                    "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                                    messageType === 'sms'
                                                        ? "bg-gray-100 border-gray-800 text-gray-900 shadow-sm"
                                                        : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                                                )}
                                            >
                                                <Phone size={26} className={messageType === 'sms' ? "text-gray-900" : "text-gray-400"} />
                                                <span className="text-xs font-bold uppercase tracking-wider">SMS (Twilio)</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* WhatsApp Mode Toggle (Hybrid Feature) */}
                                    {messageType === 'whatsapp' && (
                                        <div className="bg-green-50/70 p-4 rounded-2xl border border-green-100 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-xs font-bold text-green-900">WhatsApp Dispatch Mode</p>
                                                    <p className="text-[11px] text-green-700">
                                                        {whatsappMode === 'web'
                                                            ? 'Interactive Web Queue: Step through and send from your personal/church WhatsApp with 1 click (No API costs).'
                                                            : 'Automated Twilio WhatsApp API: Dispatches directly in the background via official Twilio Sender.'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setWhatsappMode('web')}
                                                    className={cn(
                                                        "py-2 px-3 rounded-xl text-xs font-bold transition-all text-center",
                                                        whatsappMode === 'web'
                                                            ? "bg-green-600 text-white shadow-xs"
                                                            : "bg-white text-green-800 border border-green-200 hover:bg-green-100/50"
                                                    )}
                                                >
                                                    🚀 WhatsApp Web Queue (Free)
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setWhatsappMode('automated')}
                                                    className={cn(
                                                        "py-2 px-3 rounded-xl text-xs font-bold transition-all text-center",
                                                        whatsappMode === 'automated'
                                                            ? "bg-green-600 text-white shadow-xs"
                                                            : "bg-white text-green-800 border border-green-200 hover:bg-green-100/50"
                                                    )}
                                                >
                                                    ⚡ Automated Background API
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Email Subject Line (Conditional for Email) */}
                                    {messageType === 'email' && (
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Email Subject Line *
                                            </Label>
                                            <Input
                                                placeholder="e.g. Important Announcement: Sunday Service & Logistics Update"
                                                className="bg-gray-50 border-gray-200 rounded-xl text-sm h-11"
                                                value={emailSubject}
                                                onChange={(e) => setEmailSubject(e.target.value)}
                                            />
                                        </div>
                                    )}

                                    {/* Text Area */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Message Content
                                            </Label>
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                                                {messageType === 'sms' && (
                                                    <span className="text-blue-600">
                                                        {smsSegments} SMS page{smsSegments > 1 ? 's' : ''} ({smsCharCount} chars)
                                                    </span>
                                                )}
                                                {messageType !== 'sms' && (
                                                    <span>{messageContent.length} CHARACTERS</span>
                                                )}
                                            </div>
                                        </div>

                                        <textarea
                                            className="w-full min-h-[220px] p-5 rounded-2xl border border-gray-200 bg-white focus:ring-4 focus:ring-[#001D86]/10 focus:border-[#001D86] transition-all outline-none resize-none text-gray-800 text-sm leading-relaxed"
                                            placeholder={`Compose your ${messageType.toUpperCase()} message here... Use tags below for automatic personalization.`}
                                            value={messageContent}
                                            onChange={(e) => setMessageContent(e.target.value)}
                                        />

                                        {/* Dynamic Tag Inserters */}
                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Tag size={12} /> Insert Dynamic Tags:
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => insertTag('{firstname}')}
                                                className="text-[11px] font-bold text-[#001D86] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                                            >
                                                First Name
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertTag('{fullname}')}
                                                className="text-[11px] font-bold text-[#001D86] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                                            >
                                                Full Name
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertTag('{church}')}
                                                className="text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                                            >
                                                Church Name
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertTag('{date}')}
                                                className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors"
                                            >
                                                Today's Date
                                            </button>
                                        </div>
                                    </div>

                                    {/* Live Personalization Preview Box */}
                                    {isPreviewOpen && (
                                        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 space-y-2 animate-in fade-in duration-300">
                                            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                                                <span>Personalized Sample for: {sampleRecipient.full_name}</span>
                                                <Badge variant="outline" className="text-[10px] bg-white text-amber-700 border-amber-300">
                                                    Live Preview
                                                </Badge>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-amber-100 text-xs text-gray-800 whitespace-pre-wrap leading-relaxed shadow-xs">
                                                {samplePreview}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="p-8 pt-0 flex flex-col gap-3">
                                    <Button
                                        className={cn(
                                            "w-full h-16 rounded-[1.5rem] text-lg font-black shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 text-white gap-2",
                                            messageType === 'whatsapp' ? "bg-green-600 hover:bg-green-700 hover:scale-[1.01]" :
                                                messageType === 'email' ? "bg-[#001D86] hover:bg-[#D5AB45] hover:scale-[1.01]" :
                                                    "bg-gray-900 hover:bg-gray-800 hover:scale-[1.01]"
                                        )}
                                        onClick={handleSendBroadcast}
                                        disabled={isSending || selectedRecipients.length === 0}
                                    >
                                        {isSending ? (
                                            <>
                                                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                                Broadcasting via {messageType.toUpperCase()}...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2" size={22} />
                                                {messageType === 'whatsapp' && whatsappMode === 'web'
                                                    ? `Start WhatsApp Web Queue (${selectedRecipients.length} Recipients)`
                                                    : `Dispatch ${messageType.toUpperCase()} to ${selectedRecipients.length} Members`}
                                            </>
                                        )}
                                    </Button>

                                    <div className="flex items-center justify-center gap-4 text-xs text-gray-400 font-medium">
                                        <span className="flex items-center gap-1">
                                            <ShieldCheck size={14} className="text-emerald-600" /> Secure Delivery
                                        </span>
                                        <span>•</span>
                                        <span>Logged in Supabase</span>
                                        <span>•</span>
                                        <span>Automated Audit History</span>
                                    </div>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* TAB 2: BROADCAST HISTORY */}
                <TabsContent value="history" className="mt-0 space-y-4">
                    <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                        <CardHeader className="bg-gray-50/70 border-b border-gray-100 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-base font-bold">Past Communications</CardTitle>
                                    <CardDescription className="text-xs">
                                        Track delivery records, errors, and inspect message payloads
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                                    {history.length} Total Messages
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            {history.length === 0 ? (
                                <div className="text-center py-24">
                                    <Clock className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                    <h3 className="text-base font-bold text-gray-800">No broadcast history yet</h3>
                                    <p className="text-gray-400 text-xs mt-1">Dispatched messages will automatically log here.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {history.map(msg => {
                                        const totalRecipients = msg.recipients?.length || 0;
                                        const failedCount = (msg.recipients || []).filter((r: any) => r.status === 'failed').length;

                                        return (
                                            <div
                                                key={msg.id}
                                                className="p-5 hover:bg-gray-50/70 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                                            >
                                                <div className="flex-1 space-y-2 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2.5">
                                                        <Badge variant="outline" className={cn(
                                                            "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                                            msg.message_type === 'whatsapp' ? "bg-green-100 text-green-700 border-green-200" :
                                                                msg.message_type === 'email' ? "bg-blue-100 text-blue-700 border-blue-200" :
                                                                    "bg-gray-100 text-gray-700 border-gray-200"
                                                        )}>
                                                            {msg.message_type}
                                                        </Badge>

                                                        <Badge className={cn(
                                                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                                                            msg.status === 'sent' ? "bg-green-50 text-green-700 border border-green-200" :
                                                                msg.status === 'partially_sent' ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                                                    "bg-red-50 text-red-700 border border-red-200"
                                                        )}>
                                                            {msg.status.replace('_', ' ')}
                                                        </Badge>

                                                        <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {msg.sent_at ? format(new Date(msg.sent_at), 'MMM d, yyyy • h:mm a') : 'Recent'}
                                                        </span>

                                                        <span className="text-xs text-[#001D86] font-bold">
                                                            {totalRecipients} Recipient{totalRecipients === 1 ? '' : 's'}
                                                        </span>

                                                        {failedCount > 0 && (
                                                            <span className="text-xs text-red-600 font-bold flex items-center gap-0.5">
                                                                <AlertCircle size={12} /> {failedCount} Failed
                                                            </span>
                                                        )}
                                                    </div>

                                                    {msg.subject && (
                                                        <p className="text-xs font-bold text-gray-900 truncate">
                                                            Subject: {msg.subject}
                                                        </p>
                                                    )}

                                                    <p className="text-gray-600 font-normal text-xs line-clamp-2 leading-relaxed">
                                                        {msg.body}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSelectedHistoryRecord(msg)}
                                                        className="rounded-xl text-xs font-bold border-gray-200 hover:bg-blue-50 hover:text-[#001D86] gap-1"
                                                    >
                                                        <ExternalLink size={14} /> View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* WhatsApp Web Queue Modal */}
            <WhatsAppQueueModal
                isOpen={isQueueModalOpen}
                onClose={() => setIsQueueModalOpen(false)}
                recipients={members
                    .filter(m => selectedRecipients.includes(m.id))
                    .map(m => ({
                        id: m.id,
                        name: m.full_name,
                        phone: m.phone,
                        email: m.email
                    }))}
                rawMessage={messageContent}
                churchName={churchName}
                onCompleted={handleQueueCompleted}
            />

            {/* Past Broadcast Details & Failed Retry Modal */}
            <BroadcastDetailsModal
                isOpen={!!selectedHistoryRecord}
                onClose={() => setSelectedHistoryRecord(null)}
                record={selectedHistoryRecord}
                onRetryFailed={handleRetryFailed}
            />
        </div>
    );
}

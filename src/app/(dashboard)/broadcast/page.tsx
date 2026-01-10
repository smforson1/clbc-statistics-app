'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import {
    Send, Users, MessageSquare, Mail, Phone, Clock,
    CheckCircle2, AlertCircle, Search, Filter, History,
    MessageCircle, ExternalLink, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function BroadcastPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [messageType, setMessageType] = useState<'whatsapp' | 'email' | 'sms'>('whatsapp');
    const [messageContent, setMessageContent] = useState('');

    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const { data: membersData } = await supabase.from('members').select('*');
        const { data: messagesData } = await supabase.from('messages').select('*').order('created_at', { ascending: false });

        setMembers(membersData || []);
        setHistory(messagesData || []);
        setIsLoading(false);
    };

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

    const handleSend = async () => {
        if (selectedRecipients.length === 0) {
            toast.error('Please select at least one recipient');
            return;
        }
        if (!messageContent.trim()) {
            toast.error('Please enter a message');
            return;
        }

        setIsSending(true);

        const recipientsData = members.filter(m => selectedRecipients.includes(m.id));

        // Log the message to the database
        const { data, error } = await supabase.from('messages').insert({
            message_type: messageType,
            body: messageContent,
            recipients: recipientsData.map(r => ({ id: r.id, name: r.full_name, contact: messageType === 'whatsapp' || messageType === 'sms' ? r.phone : r.email })),
            status: 'sent',
            sent_at: new Date().toISOString()
        }).select().single();

        if (error) {
            toast.error('Failed to log message history');
        } else {
            toast.success('Broadcast sent and logged!');

            // If WhatsApp, trigger external links for each recipient (simulated) or just the first one if too many
            if (messageType === 'whatsapp') {
                const firstRecipient = recipientsData[0];
                if (firstRecipient?.phone) {
                    const encodedMsg = encodeURIComponent(messageContent);
                    const whatsappUrl = `https://wa.me/${firstRecipient.phone}?text=${encodedMsg}`;
                    window.open(whatsappUrl, '_blank');
                }
            }

            setHistory([data, ...history]);
            setMessageContent('');
            setSelectedRecipients([]);
        }

        setIsSending(false);
    };

    const filteredMembers = members.filter(m =>
        m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.phone && m.phone.includes(searchTerm)) ||
        (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Broadcast System</h1>
                    <p className="text-gray-500 mt-1">Send communications to members via WhatsApp, Email, or SMS</p>
                </div>
            </div>

            <Tabs defaultValue="compose" className="w-full">
                <TabsList className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-6">
                    <TabsTrigger value="compose" className="rounded-lg gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-[#001D86]">
                        <Send size={16} /> Compose Broadcast
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg gap-2 data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700">
                        <History size={16} /> History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="compose" className="space-y-8 mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Recipient Selection */}
                        <Card className="lg:col-span-1 border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Users className="text-[#001D86]" size={20} />
                                        <CardTitle className="text-lg">Recipients</CardTitle>
                                    </div>
                                    <Badge variant="secondary" className="bg-blue-100 text-[#001D86]">
                                        {selectedRecipients.length} Selected
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-4 border-b border-gray-50">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <Input
                                            placeholder="Search members..."
                                            className="pl-9 bg-gray-50/50 border-none rounded-xl text-sm"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-4 px-2">
                                        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-[#001D86] focus:ring-[#001D86]"
                                                checked={selectedRecipients.length === filteredMembers.length && filteredMembers.length > 0}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                            />
                                            SELECT ALL
                                        </label>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                                            {filteredMembers.length} Results
                                        </span>
                                    </div>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                                    {filteredMembers.map(member => (
                                        <div
                                            key={member.id}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer group",
                                                selectedRecipients.includes(member.id)
                                                    ? "bg-blue-50 border border-blue-100"
                                                    : "hover:bg-gray-50 border border-transparent"
                                            )}
                                            onClick={() => handleRecipientToggle(member.id)}
                                        >
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-[#001D86] focus:ring-[#001D86]"
                                                checked={selectedRecipients.includes(member.id)}
                                                readOnly
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-gray-900 truncate">{member.full_name}</p>
                                                <p className="text-[10px] text-gray-500 truncate">
                                                    {messageType === 'email' ? (member.email || 'No Email') : (member.phone || 'No Phone')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredMembers.length === 0 && (
                                        <div className="text-center py-12">
                                            <Users className="mx-auto text-gray-300 mb-2" size={32} />
                                            <p className="text-gray-400 text-sm italic">No members found</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Compose Message */}
                        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl bg-white overflow-hidden h-fit">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="text-[#001D86]" size={20} />
                                    <CardTitle className="text-lg">Message Content</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-gray-700">Communication Channel</Label>
                                    <div className="grid grid-cols-3 gap-4">
                                        <button
                                            onClick={() => setMessageType('whatsapp')}
                                            className={cn(
                                                "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                                messageType === 'whatsapp'
                                                    ? "bg-green-50 border-green-500 text-green-700"
                                                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                                            )}
                                        >
                                            <MessageCircle size={24} />
                                            <span className="text-xs font-bold uppercase tracking-wider">WhatsApp</span>
                                        </button>
                                        <button
                                            onClick={() => setMessageType('email')}
                                            className={cn(
                                                "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                                messageType === 'email'
                                                    ? "bg-blue-50 border-blue-500 text-blue-700"
                                                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                                            )}
                                        >
                                            <Mail size={24} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Email</span>
                                        </button>
                                        <button
                                            onClick={() => setMessageType('sms')}
                                            className={cn(
                                                "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                                messageType === 'sms'
                                                    ? "bg-gray-50 border-gray-500 text-gray-700"
                                                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                                            )}
                                        >
                                            <Phone size={24} />
                                            <span className="text-xs font-bold uppercase tracking-wider">SMS</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-sm font-bold text-gray-700">Compose Message</Label>
                                        <span className="text-[10px] font-bold text-gray-400">
                                            {messageContent.length} CHARACTERS
                                        </span>
                                    </div>
                                    <textarea
                                        className="w-full min-h-[250px] p-6 rounded-2xl border border-gray-200 bg-white/50 focus:ring-4 focus:ring-[#001D86]/10 focus:border-[#001D86] transition-all outline-none resize-none text-gray-800"
                                        placeholder={`Enter your ${messageType} message here...`}
                                        value={messageContent}
                                        onChange={(e) => setMessageContent(e.target.value)}
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Insert Labels:</p>
                                        <button className="text-[10px] font-bold text-[#001D86] bg-blue-50 px-2 py-1 rounded" onClick={() => setMessageContent(prev => prev + ' {fullname}')}>NAME</button>
                                        <button className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded" onClick={() => setMessageContent(prev => prev + ' {church}')}>CHURCH</button>
                                        <button className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded" onClick={() => setMessageContent(prev => prev + ' {date}')}>DATE</button>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-8 pt-0">
                                <Button
                                    className="w-full h-16 bg-[#001D86] hover:bg-[#D5AB45] rounded-[1.5rem] text-xl font-black shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50"
                                    onClick={handleSend}
                                    disabled={isSending || selectedRecipients.length === 0}
                                >
                                    {isSending ? (
                                        <>
                                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                            Broadcasting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2" size={24} />
                                            Send Broadcast to {selectedRecipients.length} Members
                                        </>
                                    )}
                                </Button>
                                <p className="text-[10px] text-center text-gray-400 mt-4 font-medium italic">
                                    * WhatsApp broadcasts will open the web interface for the first recipient.
                                </p>
                            </CardFooter>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                    <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                        <CardContent className="p-0">
                            {history.length === 0 ? (
                                <div className="text-center py-20">
                                    <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900">No broadcast history</h3>
                                    <p className="text-gray-500">Your sent messages will appear here.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {history.map(msg => (
                                        <div key={msg.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="outline" className={cn(
                                                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                                            msg.message_type === 'whatsapp' ? "bg-green-100 text-green-700 border-green-200" :
                                                                msg.message_type === 'email' ? "bg-blue-100 text-blue-700 border-blue-200" :
                                                                    "bg-gray-100 text-gray-700 border-gray-200"
                                                        )}>
                                                            {msg.message_type}
                                                        </Badge>
                                                        <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {format(new Date(msg.sent_at), 'MMM d, h:mm a')}
                                                        </span>
                                                        <span className="text-xs text-[#001D86] font-bold">
                                                            {msg.recipients?.length || 0} Recipients
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-900 font-medium text-sm line-clamp-2">
                                                        {msg.body}
                                                    </p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="rounded-full text-gray-400">
                                                    <ExternalLink size={18} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

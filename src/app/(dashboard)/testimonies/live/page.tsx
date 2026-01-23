'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import {
    Mic2,
    FileText,
    ArrowLeft,
    RefreshCw,
    Maximize2,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function LiveTestimoniesPage() {
    const [testimonies, setTestimonies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('queue');
    const supabase = createClient();

    useEffect(() => {
        fetchApprovedTestimonies();

        // Subscribe to real-time updates for APPROVED testimonies
        const channel = supabase
            .channel('public:testimonies')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonies' }, () => {
                fetchApprovedTestimonies();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchApprovedTestimonies = async () => {
        const { data, error } = await supabase
            .from('testimonies')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: true }); // Oldest first for queue (FIFO)

        if (error) {
            toast.error('Failed to sync testimonies');
        } else {
            setTestimonies(data || []);
        }
        setIsLoading(false);
    };

    const markAsShared = async (id: string, name: string) => {
        const { error } = await supabase
            .from('testimonies')
            .update({ status: 'shared' })
            .eq('id', id);

        if (error) {
            toast.error('Failed to update status');
        } else {
            toast.success(`${name} marked as shared`);
            // Fetch will be triggered by realtime subscription, but we can optimistically update too
            fetchApprovedTestimonies();
        }
    };

    const queue = testimonies.filter(t => t.share_preference === 'in_person');
    const toRead = testimonies.filter(t => t.share_preference === 'read_only');

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-6 lg:p-8 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/testimonies">
                        <Button variant="ghost" className="text-gray-400 hover:text-white rounded-full h-12 w-12 p-0">
                            <ArrowLeft size={24} />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                            <h1 className="text-2xl font-black tracking-tight uppercase text-gray-100">Live Service Mode</h1>
                        </div>
                        <p className="text-gray-500 text-sm">Testimony Session</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full border-gray-700 bg-gray-800 text-gray-400 hover:text-white"
                        onClick={() => fetchApprovedTestimonies()}
                    >
                        <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full border-gray-700 bg-gray-800 text-gray-400 hover:text-white md:hidden"
                        onClick={() => document.documentElement.requestFullscreen()}
                    >
                        <Maximize2 size={20} />
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col">
                <TabsList className="bg-gray-900 border border-gray-800 p-1.5 rounded-2xl h-16 w-full flex mb-6">
                    <TabsTrigger
                        value="queue"
                        className="flex-1 rounded-xl text-lg font-bold data-[state=active]:bg-[#001D86] data-[state=active]:text-white h-full transition-all"
                        onClick={() => setActiveTab('queue')}
                    >
                        <div className="flex items-center gap-3">
                            <Mic2 className={cn("w-6 h-6", activeTab === 'queue' ? 'text-yellow-400' : 'text-gray-500')} />
                            <span>Queue ({queue.length})</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger
                        value="read"
                        className="flex-1 rounded-xl text-lg font-bold data-[state=active]:bg-[#001D86] data-[state=active]:text-white h-full transition-all"
                        onClick={() => setActiveTab('read')}
                    >
                        <div className="flex items-center gap-3">
                            <FileText className={cn("w-6 h-6", activeTab === 'read' ? 'text-yellow-400' : 'text-gray-500')} />
                            <span>To Read ({toRead.length})</span>
                        </div>
                    </TabsTrigger>
                </TabsList>

                {/* QUEUE TAB (IN PERSON) */}
                <TabsContent value="queue" className="flex-1 mt-0 overflow-hidden">
                    <div className="h-full pr-4 overflow-y-auto custom-scrollbar">
                        <div className="space-y-4 pb-20">
                            {queue.length === 0 ? (
                                <div className="text-center py-20 text-gray-600">
                                    <Mic2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                    <h3 className="text-xl font-bold">Queue is empty</h3>
                                    <p>Waiting for approved testimonies...</p>
                                </div>
                            ) : (
                                queue.map((t, index) => (
                                    <div
                                        key={t.id}
                                        className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl flex items-center justify-between group hover:border-gray-600 transition-all"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="text-4xl font-black text-gray-700 w-12 text-center">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-bold text-white mb-2">{t.testifier_name}</h3>
                                                <div className="flex gap-2">
                                                    <Badge variant="outline" className="border-gray-700 text-gray-400">
                                                        Waitlist Topic:
                                                    </Badge>
                                                    <p className="text-gray-400 line-clamp-1 max-w-md italic">
                                                        "{t.content.substring(0, 50)}..."
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            size="lg"
                                            className="h-16 px-8 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold text-lg shadow-lg hover:scale-105 transition-all"
                                            onClick={() => markAsShared(t.id, t.testifier_name)}
                                        >
                                            <CheckCircle2 className="mr-2 w-6 h-6" />
                                            Done
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* READ TAB (READ ONLY) */}
                <TabsContent value="read" className="flex-1 mt-0 overflow-hidden">
                    <div className="h-full pr-4 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 gap-6 pb-20">
                            {toRead.length === 0 ? (
                                <div className="text-center py-20 text-gray-600">
                                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                    <h3 className="text-xl font-bold">Nothing to read</h3>
                                    <p>Waiting for approved testimonies...</p>
                                </div>
                            ) : (
                                toRead.map((t) => (
                                    <Card key={t.id} className="border-none bg-gray-900 text-white rounded-[2rem] overflow-hidden shadow-xl ring-1 ring-white/10">
                                        <CardContent className="p-8 md:p-10">
                                            <div className="flex justify-between items-start mb-8 border-b border-gray-800 pb-6">
                                                <div>
                                                    <h2 className="text-3xl font-black text-[#D5AB45] mb-2">{t.testifier_name}</h2>
                                                    <p className="text-gray-400 flex items-center gap-2">
                                                        <Clock size={16} />
                                                        Submitted {new Date(t.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    className="rounded-xl border-gray-500 text-gray-300 bg-transparent hover:bg-green-900/30 hover:text-green-400 hover:border-green-500 transition-all font-bold"
                                                    onClick={() => markAsShared(t.id, t.testifier_name)}
                                                >
                                                    <CheckCircle2 className="mr-2" /> Mark Read
                                                </Button>
                                            </div>
                                            <div className="prose prose-invert prose-lg max-w-none">
                                                <p className="text-2xl md:text-3xl leading-relaxed font-medium text-gray-100 whitespace-pre-wrap font-serif">
                                                    {t.content}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Add custom type for onWrapperValueChange to avoid TS error if standard Tabs doesn't support it,
// though Radix/shadcn usually does via value/onValueChange in simple implementations.
// If Tabs component is strictly typed without onValueChange, we might need to adjust.
// Assuming standard shadcn/ui Tabs usage:

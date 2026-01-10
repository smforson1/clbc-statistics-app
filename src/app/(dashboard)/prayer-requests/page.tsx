'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import {
    Search, Filter, Heart, Clock, CheckCircle2, MoreVertical,
    AlertCircle, MessageSquare, User, Tag, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function PrayerRequestsAdminPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const supabase = createClient();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('prayer_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('Failed to fetch prayer requests');
        } else {
            setRequests(data || []);
        }
        setIsLoading(false);
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from('prayer_requests')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            toast.error('Failed to update status');
        } else {
            toast.success(`Request marked as ${newStatus}`);
            fetchRequests();
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.requester_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.request_content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || req.status === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Prayer Wall</h1>
                    <p className="text-gray-500 mt-1">Manage and intercede for member requests</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search requests..."
                        className="pl-10 bg-gray-50/50 border-none focus-visible:ring-[#001D86]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <select
                        className="h-10 px-3 pr-8 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#001D86] appearance-none cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option>All</option>
                        <option>Pending</option>
                        <option>Praying</option>
                        <option>Answered</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <Heart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">No prayer requests found</h3>
                    <p className="text-gray-500">All burdens are shared or matched by your filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredRequests.map((req) => (
                        <PrayerRequestCard
                            key={req.id}
                            request={req}
                            onStatusChange={handleStatusChange}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function PrayerRequestCard({ request, onStatusChange }: { request: any, onStatusChange: (id: string, s: string) => void }) {
    const statusColors: Record<string, string> = {
        pending: 'bg-amber-100 text-amber-700 border-amber-200',
        praying: 'bg-blue-100 text-blue-700 border-blue-200',
        answered: 'bg-green-100 text-green-700 border-green-200',
        closed: 'bg-gray-100 text-gray-700 border-gray-200'
    };

    return (
        <Card className={cn(
            "group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white rounded-2xl",
            request.is_urgent && "ring-1 ring-red-200 bg-red-50/10"
        )}>
            <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", statusColors[request.status])}>
                                {request.status}
                            </Badge>
                            {request.is_urgent && (
                                <Badge className="bg-red-500 text-white border-none rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                    Urgent
                                </Badge>
                            )}
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                {request.category}
                            </Badge>
                            <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                                <Calendar size={12} />
                                {format(new Date(request.created_at), 'MMM d, h:mm a')}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-gray-900 font-bold">
                                <User size={14} className="text-[#001D86]" />
                                {request.is_anonymous ? 'Anonymous Member' : request.requester_name}
                            </div>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {request.request_content}
                            </p>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical size={18} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl w-48">
                            <DropdownMenuItem onClick={() => onStatusChange(request.id, 'praying')} className="gap-2 text-blue-600">
                                <Clock size={14} /> Start Praying
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onStatusChange(request.id, 'answered')} className="gap-2 text-green-600">
                                <CheckCircle2 size={14} /> Mark as Answered
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-gray-500">
                                <MessageSquare size={14} /> Add Notes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onStatusChange(request.id, 'closed')} className="gap-2 text-gray-400">
                                <AlertCircle size={14} /> Close Request
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
}

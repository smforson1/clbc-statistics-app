'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import {
    Mic2,
    CheckCircle2,
    XCircle,
    Clock,
    Archive,
    Play,
    FileText,
    User,
    Phone,
    MoreVertical,
    MessageSquare,
    Search,
    Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function TestimoniesPage() {
    const [testimonies, setTestimonies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [autoApprove, setAutoApprove] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        fetchTestimonies();
        fetchBranchSettings();
    }, []);

    const fetchTestimonies = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('testimonies')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('Failed to fetch testimonies');
        } else {
            setTestimonies(data || []);
        }
        setIsLoading(false);
    };

    const fetchBranchSettings = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('profiles')
            .select('branch_id, branch:branches(settings)')
            .eq('id', user.id)
            .single();

        if (data?.branch) {
            const branchSettings = (data.branch as any).settings;
            if (branchSettings) {
                setAutoApprove(branchSettings.auto_approve_testimony || false);
            }
        }
    };

    const toggleAutoApprove = async (checked: boolean) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Optimistic update
        setAutoApprove(checked);

        const { data: profile } = await supabase
            .from('profiles')
            .select('branch_id, branch:branches(settings)')
            .eq('id', user.id)
            .single();

        if (!profile) return;

        const currentSettings = (profile.branch as any).settings || {};
        const newSettings = { ...currentSettings, auto_approve_testimony: checked };

        const { error } = await supabase
            .from('branches')
            .update({ settings: newSettings })
            .eq('id', profile.branch_id);

        if (error) {
            toast.error('Failed to switch auto-approve');
            setAutoApprove(!checked); // Revert
        } else {
            toast.success(checked ? 'Auto-approve enabled' : 'Auto-approve disabled');
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from('testimonies')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            toast.error('Failed to update status');
        } else {
            toast.success(`Marked as ${newStatus}`);
            fetchTestimonies();
        }
    };

    const updatePreference = async (id: string, newPreference: string) => {
        const { error } = await supabase
            .from('testimonies')
            .update({ share_preference: newPreference })
            .eq('id', id);

        if (error) {
            toast.error('Failed to update preference');
        } else {
            fetchTestimonies();
        }
    };

    const filteredTestimonies = testimonies.filter(t =>
        t.testifier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pending = filteredTestimonies.filter(t => t.status === 'pending');
    const approved = filteredTestimonies.filter(t => t.status === 'approved');
    const shared = filteredTestimonies.filter(t => t.status === 'shared');
    const archived = filteredTestimonies.filter(t => t.status === 'archived');

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Testimonies</h1>
                    <p className="text-gray-500 mt-1">Review and manage testimonies for live service</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/testimonies/live">
                        <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 rounded-xl shadow-lg border-2 border-red-500/20">
                            <Play size={18} fill="currentColor" />
                            Launch Live Mode
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 max-w-md">
                <Search className="text-gray-400 ml-2" size={20} />
                <Input
                    placeholder="Search by name or content..."
                    className="border-none focus-visible:ring-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-6 flex-wrap h-auto">
                    <TabsTrigger value="pending" className="rounded-lg gap-2 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
                        <Clock size={16} /> Pending ({pending.length})
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="rounded-lg gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                        <CheckCircle2 size={16} /> Approved ({approved.length})
                    </TabsTrigger>
                    <TabsTrigger value="shared" className="rounded-lg gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                        <Mic2 size={16} /> Shared ({shared.length})
                    </TabsTrigger>
                    <TabsTrigger value="archived" className="rounded-lg gap-2 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-700">
                        <Archive size={16} /> Archived ({archived.length})
                    </TabsTrigger>
                </TabsList>

                {/* Shared Testimony Card Component */}
                {['pending', 'approved', 'shared', 'archived'].map((tab) => (
                    <TabsContent key={tab} value={tab} className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(
                                tab === 'pending' ? pending :
                                    tab === 'approved' ? approved :
                                        tab === 'shared' ? shared : archived
                            ).map((testimony) => (
                                <TestimonyCard
                                    key={testimony.id}
                                    testimony={testimony}
                                    onUpdateStatus={updateStatus}
                                    onUpdatePreference={updatePreference}
                                />
                            ))}
                            {(
                                tab === 'pending' ? pending :
                                    tab === 'approved' ? approved :
                                        tab === 'shared' ? shared : archived
                            ).length === 0 && (
                                    <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                                        <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                        <p className="text-gray-500">No testimonies in this section</p>
                                    </div>
                                )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

function TestimonyCard({ testimony, onUpdateStatus, onUpdatePreference }: {
    testimony: any,
    onUpdateStatus: (id: string, status: string) => void,
    onUpdatePreference: (id: string, pref: string) => void
}) {
    return (
        <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white rounded-3xl overflow-hidden flex flex-col h-full group">
            <CardHeader className="bg-gray-50/50 pb-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#001D86] font-bold text-lg border border-gray-100">
                            {testimony.testifier_name.charAt(0)}
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-gray-900 line-clamp-1">{testimony.testifier_name}</CardTitle>
                            <CardDescription className="flex items-center gap-1.5 text-xs">
                                <Clock size={12} />
                                {new Date(testimony.created_at).toLocaleDateString()}
                            </CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className={cn(
                        "capitalize",
                        testimony.share_preference === 'in_person'
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                    )}>
                        {testimony.share_preference === 'in_person' ? 'In Person' : 'Read Only'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-6 flex-1">
                <div className="min-h-[6rem]">
                    <p className="text-gray-600 leading-relaxed line-clamp-6 whitespace-pre-wrap">
                        {testimony.content}
                    </p>
                </div>
                {testimony.contact_info && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500">
                        <Phone size={14} />
                        {testimony.contact_info}
                    </div>
                )}
            </CardContent>
            <CardFooter className="bg-gray-50 p-3 flex justify-between gap-2 border-t border-gray-100">
                <div className="flex gap-2 w-full">
                    {testimony.status === 'pending' && (
                        <>
                            <Button
                                size="sm"
                                className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl"
                                onClick={() => onUpdateStatus(testimony.id, 'approved')}
                            >
                                <CheckCircle2 size={16} className="mr-1" /> Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 rounded-xl text-gray-600"
                                onClick={() => onUpdateStatus(testimony.id, 'archived')}
                            >
                                <Archive size={16} className="mr-1" /> Archive
                            </Button>
                        </>
                    )}

                    {testimony.status === 'approved' && (
                        <>
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => onUpdateStatus(testimony.id, 'shared')}
                            >
                                <Mic2 size={16} className="mr-1" /> Mark Shared
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="w-10 px-0 rounded-xl"
                                onClick={() => onUpdateStatus(testimony.id, 'pending')}
                            >
                                <XCircle size={16} className="text-gray-400" />
                            </Button>
                        </>
                    )}

                    {testimony.status === 'shared' && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full rounded-xl text-gray-500"
                            onClick={() => onUpdateStatus(testimony.id, 'archived')}
                        >
                            <Archive size={16} className="mr-1" /> Move to Archive
                        </Button>
                    )}

                    {testimony.status === 'archived' && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full rounded-xl text-amber-600 border-amber-200 hover:bg-amber-50"
                            onClick={() => onUpdateStatus(testimony.id, 'pending')}
                        >
                            Re-open
                        </Button>
                    )}
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-8 px-0 rounded-lg">
                            <MoreVertical size={16} className="text-gray-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl font-medium">
                        <DropdownMenuLabel>Share Preference</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onUpdatePreference(testimony.id, 'in_person')}>
                            <User size={14} className="mr-2" /> Make 'In Person'
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdatePreference(testimony.id, 'read_only')}>
                            <FileText size={14} className="mr-2" /> Make 'Read Only'
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    );
}

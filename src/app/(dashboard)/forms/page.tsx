'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Plus, QrCode, Eye, MoreVertical, Search, Filter, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function FormsPage() {
    const [forms, setForms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const supabase = createClient();

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('forms')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('Failed to fetch forms');
        } else {
            setForms(data || []);
        }
        setIsLoading(false);
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from('forms')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            toast.error('Failed to update status');
        } else {
            toast.success(`Form ${newStatus}`);
            fetchForms();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this form? All responses will be lost.')) return;

        const { error } = await supabase
            .from('forms')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Failed to delete form');
        } else {
            toast.success('Form deleted');
            fetchForms();
        }
    };

    const filteredForms = forms.filter(form => {
        const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All Status' || form.status === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Forms Management</h1>
                    <p className="text-gray-500 mt-1">Create and manage event attendance forms</p>
                </div>
                <Link href="/forms/create">
                    <Button className="bg-[#001D86] hover:bg-[#D5AB45] hover:text-white transition-all gap-2 px-6 rounded-xl shadow-md">
                        <Plus size={18} />
                        Create New Form
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search forms by title..."
                        className="pl-10 bg-gray-50/50 border-none focus-visible:ring-[#001D86]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button variant="outline" className="gap-2 border-gray-200">
                        <Filter size={18} />
                        Filter
                    </Button>
                    <select
                        className="h-10 px-3 pr-8 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#001D86] appearance-none cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Closed</option>
                        <option>Draft</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-gray-100 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : filteredForms.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="mx-auto w-16 h-16 bg-blue-50 text-[#001D86] rounded-full flex items-center justify-center mb-4">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No forms found</h3>
                    <p className="text-gray-500 mb-6">Adjust your filters or create a new form.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredForms.map((form) => (
                        <FormCard
                            key={form.id}
                            form={form}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

function FormCard({ form, onDelete, onStatusChange }: { form: any, onDelete: (id: string) => void, onStatusChange: (id: string, s: string) => void }) {
    return (
        <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white rounded-3xl">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                    <Badge className={cn(
                        "rounded-full px-3 py-1 font-medium",
                        form.status === 'active' ? "bg-green-100 text-green-700 hover:bg-green-200" :
                            form.status === 'closed' ? "bg-gray-100 text-gray-700 hover:bg-gray-200" :
                                "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    )}>
                        {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                    </Badge>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical size={18} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                            <Link href={`/forms/${form.id}/responses`}>
                                <DropdownMenuItem className="gap-2">
                                    <Eye size={14} /> View Responses
                                </DropdownMenuItem>
                            </Link>
                            <Link href={`/forms/${form.id}/qr`}>
                                <DropdownMenuItem className="gap-2">
                                    <QrCode size={14} /> View QR Code
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            {form.status !== 'active' && (
                                <DropdownMenuItem onClick={() => onStatusChange(form.id, 'active')} className="text-green-600 gap-2 font-medium">
                                    Activate Form
                                </DropdownMenuItem>
                            )}
                            {form.status !== 'closed' && (
                                <DropdownMenuItem onClick={() => onStatusChange(form.id, 'closed')} className="text-amber-600 gap-2 font-medium">
                                    Close Form
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onDelete(form.id)} className="text-red-600 gap-2 font-bold">
                                <Trash2 size={14} /> Delete Form
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-[#001D86] transition-colors">
                    {form.title}
                </CardTitle>
                <p className="text-sm text-gray-500 line-clamp-2 mt-2">{form.description || 'No description provided'}</p>
            </CardHeader>
            <CardContent className="pb-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Responses</p>
                        <p className="text-lg font-bold text-gray-900">0</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Event Date</p>
                        <p className="text-sm font-semibold text-gray-900">
                            {form.event_date ? new Date(form.event_date).toLocaleDateString() : 'TBD'}
                        </p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-gray-50/50 p-4 gap-2 border-t border-gray-100">
                <Button variant="secondary" className="flex-1 bg-white hover:bg-blue-50 hover:text-[#001D86] border border-gray-200 rounded-xl gap-2 font-medium">
                    <QrCode size={16} />
                    QR code
                </Button>
                <Link href={`/forms/${form.id}/responses`} className="flex-1">
                    <Button className="w-full bg-white hover:bg-amber-50 text-amber-700 hover:text-amber-800 border border-amber-200 rounded-xl gap-2 font-medium">
                        <Eye size={16} />
                        View
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}

function FileText(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
    );
}

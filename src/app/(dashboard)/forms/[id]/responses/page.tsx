'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import {
    Download,
    ChevronLeft,
    Search,
    Filter,
    BarChart3,
    Table as TableIcon,
    MoreVertical,
    ArrowUpDown,
    FileSpreadsheet,
    FileText
} from 'lucide-react';
import { generateAttendancePDF } from '@/lib/reports';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const COLORS = ['#001D86', '#D5AB45', '#2563EB', '#EAB308', '#10B981', '#EF4444'];

export default function ResponsesPage() {
    const { id } = useParams();
    const router = useRouter();
    const [form, setForm] = useState<any>(null);
    const [responses, setResponses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        const { data: formData, error: formError } = await supabase
            .from('forms')
            .select('*')
            .eq('id', id)
            .single();

        if (formError) {
            toast.error('Failed to fetch form details');
            setIsLoading(false);
            router.push('/forms');
            return;
        }

        setForm(formData);

        const { data: respData, error: respError } = await supabase
            .from('form_responses')
            .select('*')
            .eq('form_id', id)
            .order('submitted_at', { ascending: false });

        if (respError) {
            toast.error('Failed to fetch responses');
        } else {
            setResponses(respData || []);
        }
        setIsLoading(false);
    };

    const exportToCSV = () => {
        if (!form || responses.length === 0) return;

        const headers = ['Submitted At', ...form.form_schema.map((f: any) => f.label)];
        const rows = responses.map(r => [
            new Date(r.submitted_at).toLocaleString(),
            ...form.form_schema.map((f: any) => {
                const val = r.response_data[f.id];
                return typeof val === 'boolean' ? (val ? 'Yes' : 'No') : val;
            })
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${form.title}-responses.csv`;
        link.click();
    };

    const getAnalytics = () => {
        if (!form || responses.length === 0) return [];

        return form.form_schema.filter((f: any) => ['boolean', 'select', 'radio'].includes(f.type)).map((field: any) => {
            const counts: Record<string, number> = {};
            responses.forEach(r => {
                let val = r.response_data[field.id];
                if (field.type === 'boolean') val = val ? 'Yes' : 'No';
                counts[val] = (counts[val] || 0) + 1;
            });

            const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
            return { field, data };
        });
    };

    const handleExportPDF = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        generateAttendancePDF({
            formTitle: form.title,
            formDescription: form.description,
            responses: responses,
            fields: form.fields,
            generatedBy: user?.email || 'Admin'
        });
        toast.success('PDF Report Generated');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#001D86]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ChevronLeft size={24} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{form.title}</h1>
                        <p className="text-gray-500 mt-1">Viewing all {responses.length} responses</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button onClick={exportToCSV} variant="outline" className="gap-2 rounded-xl border-gray-200">
                        <FileSpreadsheet size={18} />
                        Export CSV
                    </Button>
                    <Button onClick={handleExportPDF} className="gap-2 rounded-xl bg-[#001D86] hover:bg-[#D5AB45] shadow-md transition-all">
                        <FileText size={18} />
                        Export PDF
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="responses" className="w-full">
                <TabsList className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-6">
                    <TabsTrigger value="responses" className="rounded-lg gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-[#001D86]">
                        <TableIcon size={16} /> Table View
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="rounded-lg gap-2 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
                        <BarChart3 size={16} /> Analytics
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="responses" className="mt-0">
                    <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-50 bg-gray-50/30 p-6">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    placeholder="Search within responses..."
                                    className="pl-10 rounded-xl bg-white focus-visible:ring-[#001D86]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="rounded-lg gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                                    <Filter size={14} /> Filter
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto custom-scrollbar">
                                <Table>
                                    <TableHeader className="bg-gray-50/50">
                                        <TableRow>
                                            <TableHead className="font-bold text-gray-900 px-6 py-4">Submitted At</TableHead>
                                            {form.form_schema.map((field: any) => (
                                                <TableHead key={field.id} className="font-bold text-gray-900 px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {field.label}
                                                        <ArrowUpDown size={14} className="text-gray-300" />
                                                    </div>
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {responses.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={form.form_schema.length + 1} className="h-48 text-center text-gray-500">
                                                    No responses yet.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            responses.map((r) => (
                                                <TableRow key={r.id} className="hover:bg-blue-50/30 transition-colors">
                                                    <TableCell className="whitespace-nowrap px-6 py-4 font-medium text-gray-600">
                                                        {new Date(r.submitted_at).toLocaleString()}
                                                    </TableCell>
                                                    {form.form_schema.map((field: any) => (
                                                        <TableCell key={field.id} className="px-6 py-4 text-gray-900">
                                                            {formatValue(r.response_data?.[field.id], field.type)}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {getAnalytics().map(({ field, data }: { field: any, data: any[] }) => (
                            <Card key={field.id} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="text-lg">{field.label}</CardTitle>
                                    <CardDescription>Response distribution</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            {field.type === 'boolean' || field.type === 'radio' ? (
                                                <PieChart>
                                                    <Pie
                                                        data={data}
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {data.map((_: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            ) : (
                                                <BarChart data={data}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                                    <YAxis axisLine={false} tickLine={false} />
                                                    <Tooltip />
                                                    <Bar dataKey="value" fill="#001D86" radius={[4, 4, 0, 0]} barSize={40} />
                                                </BarChart>
                                            )}
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {getAnalytics().length === 0 && (
                            <div className="md:col-span-2 text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                                <p className="text-gray-500">No chartable data available for this form.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function formatValue(value: any, type: string) {
    if (value === undefined || value === null || value === '') return '-';
    if (type === 'boolean') return value === true ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return value.toString();
}

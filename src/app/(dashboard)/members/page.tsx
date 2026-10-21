'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import {
    Plus,
    Search,
    MoreVertical,
    Mail,
    Phone,
    MapPin,
    Calendar,
    UserPlus,
    Filter,
    Trash2,
    Edit2,
    Upload,
    Download,
    Users,
    Cake,
    ExternalLink,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { MemberImportModal } from '@/components/members/member-import-modal';
import { MemberProfileModal } from '@/components/members/member-profile-modal';

export default function MembersPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [genderFilter, setGenderFilter] = useState('all');

    // Dialogs
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<any | null>(null);

    const supabase = createClient();

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .order('full_name', { ascending: true });

        if (error) {
            toast.error('Failed to fetch members');
        } else {
            setMembers(data || []);
        }
        setIsLoading(false);
    };

    const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const memberData = {
            full_name: formData.get('full_name'),
            email: formData.get('email') || null,
            phone: formData.get('phone') || null,
            address: formData.get('address') || null,
            gender: formData.get('gender') || 'Male',
            date_of_birth: formData.get('date_of_birth') || null,
            membership_status: 'active',
            join_date: new Date().toISOString().split('T')[0],
        };

        const { error } = await supabase.from('members').insert(memberData);

        if (error) {
            toast.error('Failed to add member');
        } else {
            toast.success('Member added successfully');
            setIsAddDialogOpen(false);
            fetchMembers();
        }
    };

    // Export members to CSV
    const handleExportCSV = () => {
        if (filteredMembers.length === 0) {
            toast.error('No members to export');
            return;
        }

        const headers = ['Full Name', 'Phone', 'Email', 'Gender', 'Residence', 'Status', 'Date of Birth', 'Join Date'];
        const rows = filteredMembers.map(m => [
            `"${m.full_name || ''}"`,
            `"${m.phone || ''}"`,
            `"${m.email || ''}"`,
            `"${m.gender || ''}"`,
            `"${m.address || ''}"`,
            `"${m.membership_status || ''}"`,
            `"${m.date_of_birth || ''}"`,
            `"${m.join_date || ''}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clbc_members_directory_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        toast.success(`Exported ${filteredMembers.length} members to CSV`);
    };

    const filteredMembers = useMemo(() => {
        return members.filter(m => {
            const matchesSearch =
                m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.phone?.includes(searchTerm) ||
                m.address?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || m.membership_status?.toLowerCase() === statusFilter.toLowerCase();
            const matchesGender = genderFilter === 'all' || m.gender?.toLowerCase() === genderFilter.toLowerCase();

            return matchesSearch && matchesStatus && matchesGender;
        });
    }, [members, searchTerm, statusFilter, genderFilter]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black tracking-widest text-[#D5AB45] uppercase">Congregation Hub</span>
                        <Badge variant="outline" className="text-[10px] bg-blue-50 text-[#001D86] border-blue-200 font-bold">
                            {members.length} Total Registered
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mt-1">Member Directory</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Manage members, demographics, contact channels, and import rosters
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <Button
                        variant="outline"
                        onClick={handleExportCSV}
                        className="rounded-2xl border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold gap-1.5 h-11"
                    >
                        <Download size={15} /> Export CSV
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => setIsImportModalOpen(true)}
                        className="rounded-2xl border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold gap-1.5 h-11"
                    >
                        <Upload size={15} /> Bulk Import (CSV)
                    </Button>

                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#001D86] hover:bg-[#D5AB45] hover:text-white transition-all gap-2 px-6 rounded-2xl shadow-md h-11 font-bold">
                                <UserPlus size={18} />
                                Add Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 bg-white shadow-2xl border-none">
                            <form onSubmit={handleAddMember}>
                                <DialogHeader className="space-y-1 pb-4 border-b border-gray-100">
                                    <DialogTitle className="text-xl font-bold text-gray-900">Add New Member</DialogTitle>
                                    <DialogDescription className="text-xs text-gray-500">
                                        Fill in personal details to register a member into the church database.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-3.5 py-4 text-xs">
                                    <div className="grid gap-1">
                                        <Label htmlFor="full_name" className="text-xs font-bold text-gray-700">Full Name *</Label>
                                        <Input id="full_name" name="full_name" required placeholder="e.g. Emmanuel Mensah" className="rounded-xl text-sm" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-1">
                                            <Label htmlFor="phone" className="text-xs font-bold text-gray-700">Phone Number</Label>
                                            <Input id="phone" name="phone" placeholder="024 000 0000" className="rounded-xl text-sm font-mono" />
                                        </div>
                                        <div className="grid gap-1">
                                            <Label htmlFor="email" className="text-xs font-bold text-gray-700">Email Address</Label>
                                            <Input id="email" name="email" type="email" placeholder="name@example.com" className="rounded-xl text-sm" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-1">
                                            <Label htmlFor="gender" className="text-xs font-bold text-gray-700">Gender</Label>
                                            <select id="gender" name="gender" className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs outline-none">
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </div>
                                        <div className="grid gap-1">
                                            <Label htmlFor="date_of_birth" className="text-xs font-bold text-gray-700">Date of Birth</Label>
                                            <Input id="date_of_birth" name="date_of_birth" type="date" className="rounded-xl text-xs" />
                                        </div>
                                    </div>

                                    <div className="grid gap-1">
                                        <Label htmlFor="address" className="text-xs font-bold text-gray-700">Residence / Hall / Hostel</Label>
                                        <Input id="address" name="address" placeholder="e.g. Unity Hall KNUST / Ayeduase" className="rounded-xl text-sm" />
                                    </div>
                                </div>

                                <DialogFooter className="pt-3 border-t border-gray-100 flex gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl">
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-[#001D86] hover:bg-[#D5AB45] rounded-xl font-bold">
                                        Save Member
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                        placeholder="Search members by name, email, phone or residence..."
                        className="pl-10 rounded-xl border-gray-100 bg-gray-50/50 text-sm h-11"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                        className="h-11 px-3 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#001D86]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active Members</option>
                        <option value="inactive">Inactive</option>
                        <option value="first_timer">First Timers</option>
                        <option value="convert">New Converts</option>
                    </select>

                    <select
                        className="h-11 px-3 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#001D86]"
                        value={genderFilter}
                        onChange={(e) => setGenderFilter(e.target.value)}
                    >
                        <option value="all">All Genders</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50/70 border-b border-gray-100">
                            <TableRow>
                                <TableHead className="px-6 py-4 text-xs font-bold text-gray-700 uppercase">Member</TableHead>
                                <TableHead className="px-6 py-4 text-xs font-bold text-gray-700 uppercase">Contact Info</TableHead>
                                <TableHead className="px-6 py-4 text-xs font-bold text-gray-700 uppercase">Residence / Hall</TableHead>
                                <TableHead className="px-6 py-4 text-xs font-bold text-gray-700 uppercase">Status</TableHead>
                                <TableHead className="px-6 py-4 text-xs font-bold text-gray-700 uppercase text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [1, 2, 3, 4].map(i => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={5} className="h-16 animate-pulse bg-gray-50/50" />
                                    </TableRow>
                                ))
                            ) : filteredMembers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-gray-400 text-sm italic">
                                        No members found matching your search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredMembers.map((member) => (
                                    <TableRow
                                        key={member.id}
                                        onClick={() => setSelectedMember(member)}
                                        className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                                    >
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-tr from-[#001D86] to-blue-700 text-white rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                                                    {member.full_name?.charAt(0) || 'M'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 group-hover:text-[#001D86] transition-colors truncate">
                                                        {member.full_name}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 capitalize">
                                                        {member.gender || 'Member'} {member.date_of_birth ? `• DOB: ${format(new Date(member.date_of_birth), 'MMM d')}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="px-6 py-4">
                                            <div className="space-y-0.5 text-xs">
                                                {member.phone ? (
                                                    <div className="flex items-center gap-1.5 text-gray-700 font-mono">
                                                        <Phone size={12} className="text-[#001D86]" /> {member.phone}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">No phone</span>
                                                )}
                                                {member.email && (
                                                    <div className="flex items-center gap-1.5 text-gray-500 truncate max-w-[200px]">
                                                        <Mail size={12} className="text-blue-500" /> {member.email}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="px-6 py-4 text-xs text-gray-600">
                                            {member.address ? (
                                                <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                                                    <MapPin size={12} className="text-red-500 flex-shrink-0" />
                                                    {member.address}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">-</span>
                                            )}
                                        </TableCell>

                                        <TableCell className="px-6 py-4">
                                            <Badge className={cn(
                                                "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                                                member.membership_status === 'active' ? "bg-green-100 text-green-800" :
                                                    member.membership_status === 'first_timer' ? "bg-purple-100 text-purple-800" :
                                                        "bg-gray-100 text-gray-700"
                                            )}>
                                                {member.membership_status?.replace('_', ' ') || 'Active'}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-xl text-xs font-bold text-[#001D86] hover:bg-blue-50 gap-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedMember(member);
                                                }}
                                            >
                                                <ExternalLink size={14} /> View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Bulk CSV Import Modal */}
            <MemberImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImportSuccess={fetchMembers}
            />

            {/* Deep Member Profile Modal */}
            <MemberProfileModal
                isOpen={!!selectedMember}
                onClose={() => setSelectedMember(null)}
                member={selectedMember}
                onUpdated={fetchMembers}
                onDeleted={fetchMembers}
            />
        </div>
    );
}

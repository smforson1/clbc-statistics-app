'use client';

import { useState, useEffect } from 'react';
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
    Edit2
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

export default function MembersPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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
            email: formData.get('email'),
            phone: formData.get('phone'),
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

    const filteredMembers = members.filter(m =>
        m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phone?.includes(searchTerm)
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Member Database</h1>
                    <p className="text-gray-500 mt-1">Manage congregation details and membership status</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#001D86] hover:bg-[#D5AB45] hover:text-white transition-all gap-2 px-6 rounded-xl shadow-md">
                            <UserPlus size={18} />
                            Add Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                        <form onSubmit={handleAddMember}>
                            <DialogHeader>
                                <DialogTitle>Add New Member</DialogTitle>
                                <DialogDescription>
                                    Enter the details of the new member here.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="full_name">Full Name</Label>
                                    <Input id="full_name" name="full_name" required className="rounded-xl" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" className="rounded-xl" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" name="phone" className="rounded-xl" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="bg-[#001D86] hover:bg-[#D5AB45] rounded-xl">Save Member</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search by name, email or phone..."
                        className="pl-10 rounded-xl border-none bg-gray-50/50 focus-visible:ring-[#001D86]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="rounded-xl gap-2 border-gray-200">
                    <Filter size={18} />
                    Filter
                </Button>
            </div>

            <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="px-6 py-4">Member Name</TableHead>
                                <TableHead className="px-6 py-4">Contact Info</TableHead>
                                <TableHead className="px-6 py-4">Status</TableHead>
                                <TableHead className="px-6 py-4">Join Date</TableHead>
                                <TableHead className="px-6 py-4 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [1, 2, 3].map(i => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={5} className="h-16 animate-pulse bg-gray-50/50"></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredMembers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-gray-500">
                                        No members found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredMembers.map((member) => (
                                    <TableRow key={member.id} className="hover:bg-blue-50/30 transition-colors">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-50 text-[#001D86] rounded-full flex items-center justify-center font-bold">
                                                    {member.full_name.charAt(0)}
                                                </div>
                                                <span className="font-semibold text-gray-900">{member.full_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="space-y-1">
                                                {member.email && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Mail size={12} /> {member.email}
                                                    </div>
                                                )}
                                                {member.phone && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Phone size={12} /> {member.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Badge className={cn(
                                                "rounded-full px-2 py-0.5 font-medium",
                                                member.membership_status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                            )}>
                                                {member.membership_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 text-sm">
                                            {member.join_date}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="icon" className="rounded-full text-gray-400">
                                                <MoreVertical size={18} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

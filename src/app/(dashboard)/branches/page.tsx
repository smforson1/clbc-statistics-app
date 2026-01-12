'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Plus, MapPin, Building2, Search, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function BranchesPage() {
    const [branches, setBranches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [newBranch, setNewBranch] = useState({ name: '', location: '' });
    const [editingBranch, setEditingBranch] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('branches')
            .select('*')
            .order('name');

        if (error) {
            toast.error('Failed to fetch branches');
        } else {
            setBranches(data || []);
        }
        setIsLoading(false);
    };

    const handleAddBranch = async () => {
        if (!newBranch.name) {
            toast.error('Branch name is required');
            return;
        }

        const { error } = await supabase
            .from('branches')
            .insert([newBranch]);

        if (error) {
            toast.error('Failed to add branch');
        } else {
            toast.success('Branch added successfully');
            setIsAddDialogOpen(false);
            setNewBranch({ name: '', location: '' });
            fetchBranches();
        }
    };

    const handleDeleteBranch = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete the "${name}" branch? This could affect all users and data in this branch.`)) return;

        const { error } = await supabase
            .from('branches')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Failed to delete branch. Ensure it has no linked data.');
        } else {
            toast.success('Branch deleted');
            fetchBranches();
        }
    };

    const handleEditBranch = async () => {
        if (!editingBranch?.name) {
            toast.error('Branch name is required');
            return;
        }

        const { error } = await supabase
            .from('branches')
            .update({ name: editingBranch.name, location: editingBranch.location })
            .eq('id', editingBranch.id);

        if (error) {
            toast.error('Failed to update branch');
        } else {
            toast.success('Branch updated successfully');
            setIsEditDialogOpen(false);
            setEditingBranch(null);
            fetchBranches();
        }
    };

    const filteredBranches = branches.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.location && b.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Branch Management</h1>
                    <p className="text-gray-500 mt-1">Organize and manage different church locations</p>
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#001D86] hover:bg-[#D5AB45] transition-all gap-2 px-6 rounded-xl shadow-md">
                            <Plus size={18} />
                            Add New Branch
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl">
                        <DialogHeader>
                            <DialogTitle>Add Branch</DialogTitle>
                            <DialogDescription>Create a new church branch to isolate data.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Branch Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Kumasi Branch"
                                    value={newBranch.name}
                                    onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location / Address</Label>
                                <Input
                                    id="location"
                                    placeholder="e.g. Santasi, Kumasi"
                                    value={newBranch.location}
                                    onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddBranch} className="bg-[#001D86]">Create Branch</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                    placeholder="Search branches..."
                    className="pl-10 bg-white border-gray-200 rounded-xl focus-visible:ring-[#001D86]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-gray-100 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : filteredBranches.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="mx-auto w-16 h-16 bg-blue-50 text-[#001D86] rounded-full flex items-center justify-center mb-4">
                        <Building2 size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No branches found</h3>
                    <p className="text-gray-500">Add a branch to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBranches.map((branch) => (
                        <Card key={branch.id} className="border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white rounded-3xl overflow-hidden group">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="h-12 w-12 bg-blue-50 text-[#001D86] rounded-2xl flex items-center justify-center group-hover:bg-[#001D86] group-hover:text-white transition-colors duration-300">
                                        <Building2 size={24} />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                                            onClick={() => {
                                                setEditingBranch(branch);
                                                setIsEditDialogOpen(true);
                                            }}
                                        >
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full" onClick={() => handleDeleteBranch(branch.id, branch.name)}>
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                                <CardTitle className="mt-4 text-xl font-bold">{branch.name}</CardTitle>
                                <CardDescription className="flex items-center gap-1 mt-1">
                                    <MapPin size={14} />
                                    {branch.location || 'No location specified'}
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="bg-gray-50 text-xs text-gray-400 font-medium px-6 py-3 border-t border-gray-100">
                                ID: {branch.id.split('-')[0]}...
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit Branch Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="rounded-3xl">
                    <DialogHeader>
                        <DialogTitle>Edit Branch</DialogTitle>
                        <DialogDescription>Update the details for this church branch.</DialogDescription>
                    </DialogHeader>
                    {editingBranch && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Branch Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editingBranch.name}
                                    onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-location">Location / Address</Label>
                                <Input
                                    id="edit-location"
                                    value={editingBranch.location || ''}
                                    onChange={(e) => setEditingBranch({ ...editingBranch, location: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditBranch} className="bg-[#001D86]">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

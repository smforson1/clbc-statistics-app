'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import {
    Package,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    Box,
    AlertCircle,
    Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LogisticsPage() {
    const [assets, setAssets] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
    const [isEditAssetOpen, setIsEditAssetOpen] = useState(false);
    const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);

    const [newAsset, setNewAsset] = useState({
        name: '',
        category: 'Electronics',
        quantity: 1,
        condition: 'New',
        location: '',
        notes: ''
    });

    const [editingAsset, setEditingAsset] = useState<any>(null);
    const [newRequest, setNewRequest] = useState({
        asset_id: '',
        requester_name: '',
        quantity: 1,
        request_date: new Date().toISOString().split('T')[0],
        return_date: '',
        notes: ''
    });

    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const { data: assetsData, error: assetsError } = await supabase
            .from('logistics_assets')
            .select('*')
            .order('created_at', { ascending: false });

        const { data: requestsData, error: requestsError } = await supabase
            .from('logistics_requests')
            .select('*, logistics_assets(name)')
            .order('created_at', { ascending: false });

        if (assetsError || requestsError) {
            toast.error('Failed to fetch logistics data');
        } else {
            setAssets(assetsData || []);
            setRequests(requestsData || []);
        }
        setIsLoading(false);
    };

    const handleAddAsset = async () => {
        if (!newAsset.name) {
            toast.error('Asset name is required');
            return;
        }

        const { error } = await supabase
            .from('logistics_assets')
            .insert([newAsset]);

        if (error) {
            toast.error('Failed to add asset');
        } else {
            toast.success('Asset added successfully');
            setIsAddAssetOpen(false);
            setNewAsset({
                name: '',
                category: 'Electronics',
                quantity: 1,
                condition: 'New',
                location: '',
                notes: ''
            });
            fetchData();
        }
    };

    const handleEditAsset = async () => {
        if (!editingAsset?.name) return;

        const { error } = await supabase
            .from('logistics_assets')
            .update({
                name: editingAsset.name,
                category: editingAsset.category,
                quantity: editingAsset.quantity,
                condition: editingAsset.condition,
                location: editingAsset.location,
                notes: editingAsset.notes
            })
            .eq('id', editingAsset.id);

        if (error) {
            toast.error('Failed to update asset');
        } else {
            toast.success('Asset updated successfully');
            setIsEditAssetOpen(false);
            setEditingAsset(null);
            fetchData();
        }
    };

    const handleCreateRequest = async () => {
        if (!newRequest.asset_id || !newRequest.requester_name) {
            toast.error('Please fill in required fields');
            return;
        }

        const { error } = await supabase
            .from('logistics_requests')
            .insert([newRequest]);

        if (error) {
            toast.error('Failed to create request');
        } else {
            toast.success('Request created successfully');
            setIsNewRequestOpen(false);
            setNewRequest({
                asset_id: '',
                requester_name: '',
                quantity: 1,
                request_date: new Date().toISOString().split('T')[0],
                return_date: '',
                notes: ''
            });
            fetchData();
        }
    };

    const handleUpdateRequestStatus = async (id: string, status: string) => {
        const { error } = await supabase
            .from('logistics_requests')
            .update({ status })
            .eq('id', id);

        if (error) {
            toast.error(`Failed to update status to ${status}`);
        } else {
            toast.success(`Request marked as ${status}`);
            fetchData();
        }
    };

    const handleDeleteAsset = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        const { error } = await supabase
            .from('logistics_assets')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Failed to delete asset');
        } else {
            toast.success('Asset deleted');
            fetchData();
        }
    };

    const getConditionBadge = (condition: string) => {
        switch (condition) {
            case 'New': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">New</Badge>;
            case 'Good': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Good</Badge>;
            case 'Used': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Used</Badge>;
            case 'Faulty': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Faulty</Badge>;
            default: return <Badge variant="outline">{condition}</Badge>;
        }
    };

    const getRequestStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>;
            case 'approved': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Approved</Badge>;
            case 'out': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">In Use</Badge>;
            case 'returned': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Returned</Badge>;
            case 'rejected': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (asset.location && asset.location.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const stats = {
        totalAssets: assets.reduce((acc, curr) => acc + (curr.quantity || 0), 0),
        activeRequests: requests.filter(r => ['approved', 'out'].includes(r.status)).length,
        faultyItems: assets.filter(a => a.condition === 'Faulty').length,
        categories: Array.from(new Set(assets.map(a => a.category))).length
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Logistics & Inventory</h1>
                    <p className="text-gray-500 mt-1">Manage church assets, equipment, and resource requests</p>
                </div>

                <Dialog open={isAddAssetOpen} onOpenChange={setIsAddAssetOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#001D86] hover:bg-[#D5AB45] transition-all gap-2 px-6 rounded-xl shadow-md">
                            <Plus size={18} />
                            Add New Asset
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Add Inventory Item</DialogTitle>
                            <DialogDescription>Add a new piece of equipment to your branch's inventory.</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="name">Item Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Behringer Mixer X32"
                                    value={newAsset.name}
                                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={newAsset.category}
                                    onValueChange={(val: string) => setNewAsset({ ...newAsset, category: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Electronics">Electronics</SelectItem>
                                        <SelectItem value="Furniture">Furniture</SelectItem>
                                        <SelectItem value="Musical Instruments">Musical Instruments</SelectItem>
                                        <SelectItem value="Media & Lighting">Media & Lighting</SelectItem>
                                        <SelectItem value="Kitchenware">Kitchenware</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    value={newAsset.quantity}
                                    onChange={(e) => setNewAsset({ ...newAsset, quantity: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="condition">Condition</Label>
                                <Select
                                    value={newAsset.condition}
                                    onValueChange={(val: string) => setNewAsset({ ...newAsset, condition: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Condition" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="New">New</SelectItem>
                                        <SelectItem value="Good">Good</SelectItem>
                                        <SelectItem value="Used">Used</SelectItem>
                                        <SelectItem value="Faulty">Faulty</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Storage Location</Label>
                                <Input
                                    id="location"
                                    placeholder="e.g. General Store"
                                    value={newAsset.location}
                                    onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input
                                    id="notes"
                                    placeholder="Any additional details..."
                                    value={newAsset.notes}
                                    onChange={(e) => setNewAsset({ ...newAsset, notes: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddAssetOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddAsset} className="bg-[#001D86]">Add to Inventory</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Assets', value: stats.totalAssets, icon: Box, color: 'blue' },
                    { label: 'Active Requests', value: stats.activeRequests, icon: Clock, color: 'purple' },
                    { label: 'Faulty Items', value: stats.faultyItems, icon: AlertCircle, color: 'red' },
                    { label: 'Categories', value: stats.categories, icon: Filter, color: 'green' }
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="assets" className="w-full">
                <TabsList className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                    <TabsTrigger value="assets" className="rounded-xl px-8 data-[state=active]:bg-blue-50 data-[state=active]:text-[#001D86]">
                        Inventory List
                    </TabsTrigger>
                    <TabsTrigger value="requests" className="rounded-xl px-8 data-[state=active]:bg-blue-50 data-[state=active]:text-[#001D86]">
                        Resource Requests
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="assets" className="mt-8 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#001D86] transition-colors" size={20} />
                            <Input
                                placeholder="Search by item name or location..."
                                className="pl-12 bg-white border-gray-200 rounded-2xl h-12 focus-visible:ring-[#001D86]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={categoryFilter} onValueChange={(val: string) => setCategoryFilter(val)}>
                            <SelectTrigger className="w-full md:w-[200px] h-12 bg-white rounded-2xl">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="Electronics">Electronics</SelectItem>
                                <SelectItem value="Furniture">Furniture</SelectItem>
                                <SelectItem value="Musical Instruments">Musical Instruments</SelectItem>
                                <SelectItem value="Media & Lighting">Media & Lighting</SelectItem>
                                <SelectItem value="Kitchenware">Kitchenware</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-3xl animate-pulse" />)
                        ) : filteredAssets.length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No assets found</h3>
                                <p className="text-gray-500">Add an item to get started.</p>
                            </div>
                        ) : (
                            filteredAssets.map((asset) => (
                                <Card key={asset.id} className="border-none shadow-sm hover:shadow-md transition-all bg-white rounded-3xl overflow-hidden group">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 rounded-2xl bg-blue-50 text-[#001D86]">
                                                <Box size={24} />
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                                                    onClick={() => {
                                                        setEditingAsset(asset);
                                                        setIsEditAssetOpen(true);
                                                    }}
                                                >
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                                                    onClick={() => handleDeleteAsset(asset.id, asset.name)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg text-gray-900 truncate">{asset.name}</h3>
                                                {getConditionBadge(asset.condition)}
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium">{asset.category}</p>
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">In Stock</p>
                                                <p className="text-base font-bold text-gray-900">{asset.quantity} units</p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Location</p>
                                                <p className="text-sm font-bold text-gray-700 truncate">{asset.location || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="requests" className="mt-8">
                    <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                        <CardHeader className="border-b border-gray-50 pb-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Asset Requests</CardTitle>
                                    <CardDescription>Track equipment being used by departments and members</CardDescription>
                                </div>
                                <Button className="bg-[#001D86]" onClick={() => setIsNewRequestOpen(true)}>New Request</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50">
                                        <tr className="border-b border-gray-50">
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Asset</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Requester</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Due Back</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {isLoading ? (
                                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading requests...</td></tr>
                                        ) : requests.length === 0 ? (
                                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No active requests.</td></tr>
                                        ) : (
                                            requests.map((req) => (
                                                <tr key={req.id} className="hover:bg-gray-50/30 transition-colors">
                                                    <td className="px-6 py-4 font-semibold text-gray-900">{(req as any).logistics_assets?.name || 'Unknown Item'}</td>
                                                    <td className="px-6 py-4 text-gray-600">{req.requester_name}</td>
                                                    <td className="px-6 py-4 text-gray-600">{req.quantity}</td>
                                                    <td className="px-6 py-4 text-gray-600">{req.return_date ? new Date(req.return_date).toLocaleDateString() : 'Continuous'}</td>
                                                    <td className="px-6 py-4">{getRequestStatusBadge(req.status)}</td>
                                                    <td className="px-6 py-4">
                                                        <Select
                                                            onValueChange={(val: string) => handleUpdateRequestStatus(req.id, val)}
                                                            defaultValue={req.status}
                                                        >
                                                            <SelectTrigger className="h-8 w-8 p-0 border-none bg-transparent shadow-none focus:ring-0">
                                                                <MoreVertical size={16} className="text-gray-400" />
                                                            </SelectTrigger>
                                                            <SelectContent align="end">
                                                                <SelectItem value="pending">Pending</SelectItem>
                                                                <SelectItem value="approved">Approve</SelectItem>
                                                                <SelectItem value="out">Mark as In Use</SelectItem>
                                                                <SelectItem value="returned">Mark as Returned</SelectItem>
                                                                <SelectItem value="rejected">Reject</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Asset Dialog */}
            <Dialog open={isEditAssetOpen} onOpenChange={setIsEditAssetOpen}>
                <DialogContent className="rounded-3xl max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Inventory Item</DialogTitle>
                        <DialogDescription>Update the details for this item.</DialogDescription>
                    </DialogHeader>
                    {editingAsset && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            <div className="space-y-2 md:col-span-2">
                                <Label>Item Name</Label>
                                <Input
                                    value={editingAsset.name}
                                    onChange={(e) => setEditingAsset({ ...editingAsset, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={editingAsset.category}
                                    onValueChange={(val: string) => setEditingAsset({ ...editingAsset, category: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Electronics">Electronics</SelectItem>
                                        <SelectItem value="Furniture">Furniture</SelectItem>
                                        <SelectItem value="Musical Instruments">Musical Instruments</SelectItem>
                                        <SelectItem value="Media & Lighting">Media & Lighting</SelectItem>
                                        <SelectItem value="Kitchenware">Kitchenware</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    value={editingAsset.quantity}
                                    onChange={(e) => setEditingAsset({ ...editingAsset, quantity: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Condition</Label>
                                <Select
                                    value={editingAsset.condition}
                                    onValueChange={(val: string) => setEditingAsset({ ...editingAsset, condition: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="New">New</SelectItem>
                                        <SelectItem value="Good">Good</SelectItem>
                                        <SelectItem value="Used">Used</SelectItem>
                                        <SelectItem value="Faulty">Faulty</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input
                                    value={editingAsset.location}
                                    onChange={(e) => setEditingAsset({ ...editingAsset, location: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditAssetOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditAsset} className="bg-[#001D86]">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New Request Dialog */}
            <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
                <DialogContent className="rounded-3xl max-w-lg">
                    <DialogHeader>
                        <DialogTitle>New Asset Request</DialogTitle>
                        <DialogDescription>Request a church asset for a specific event or person.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2 md:col-span-2">
                            <Label>Select Asset</Label>
                            <Select
                                value={newRequest.asset_id}
                                onValueChange={(val: string) => setNewRequest({ ...newRequest, asset_id: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chose an item..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {assets.map(a => (
                                        <SelectItem key={a.id} value={a.id}>{a.name} ({a.quantity} available)</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Requester Name / Department</Label>
                            <Input
                                placeholder="e.g. Media Team / Kofi Mensah"
                                value={newRequest.requester_name}
                                onChange={(e) => setNewRequest({ ...newRequest, requester_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Quantity Needed</Label>
                            <Input
                                type="number"
                                value={newRequest.quantity}
                                onChange={(e) => setNewRequest({ ...newRequest, quantity: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Date Needed</Label>
                            <Input
                                type="date"
                                value={newRequest.request_date}
                                onChange={(e) => setNewRequest({ ...newRequest, request_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Expected Return Date</Label>
                            <Input
                                type="date"
                                value={newRequest.return_date}
                                onChange={(e) => setNewRequest({ ...newRequest, return_date: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNewRequestOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateRequest} className="bg-[#001D86]">Submit Request</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
